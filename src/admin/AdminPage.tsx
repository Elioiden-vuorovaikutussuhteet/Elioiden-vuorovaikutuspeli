import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Tab, Tabs, Typography } from "@mui/material";
import { getServerMessage, logout } from "../api";
import {
  type Profile,
  fetchProfiles,
  fetchProfileConfigs,
} from "../game/config/configApi";
import ProfileBar from "../components/admin/ProfileBar";
import ConfigTab from "../components/admin/ConfigTab";
import OrganismsTab from "../components/admin/OrganismsTab";

export default function AdminPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Loading...");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"config" | "organisms">("config");

  useEffect(() => {
    getServerMessage()
      .then((data) => setMessage(data.message))
      .catch(console.error);

    fetchProfiles()
      .then((list) => {
        setProfiles(list);
        const initial = list.find((p) => p.is_active) ?? list[0];
        if (initial) setSelectedProfileId(initial.id);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load profiles.",
        );
      });
  }, []);

  useEffect(() => {
    if (!selectedProfileId) return;
    let cancelled = false;
    setProfileData(null);
    setLoadError(null);

    fetchProfileConfigs(selectedProfileId)
      .then((data) => {
        if (!cancelled) setProfileData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load profile config.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProfileId]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isActive = Boolean(selectedProfile?.is_active);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh", overflowY: "auto", boxSizing: "border-box" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>
      <Typography sx={{ mb: 2 }}>{message}</Typography>
      <button onClick={handleLogout}>Logout</button>

      {profiles.length > 0 && (
        <ProfileBar
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelect={setSelectedProfileId}
          onCreated={(created) => {
            setProfiles((prev) => [...prev, created]);
            setSelectedProfileId(created.id);
          }}
          onActivated={(updated) => {
            setProfiles((prev) =>
              prev.map((p) =>
                p.id === updated.id ? updated : { ...p, is_active: false },
              ),
            );
          }}
          onDeleted={(deletedId) => {
            const remaining = profiles.filter((p) => p.id !== deletedId);
            setProfiles(remaining);
            const fallback = remaining.find((p) => p.is_active) ?? remaining[0];
            if (fallback) setSelectedProfileId(fallback.id);
          }}
        />
      )}

      {loadError && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 480 }}>
          {loadError}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Config" value="config" />
          <Tab label="Organisms" value="organisms" />
        </Tabs>

        {profileData ? (
          <>
            <Box sx={{ display: activeTab === "config" ? "block" : "none" }}>
              <ConfigTab
                key={selectedProfileId}
                profileId={selectedProfileId}
                isActive={isActive}
                initialData={profileData}
              />
            </Box>
            <Box sx={{ display: activeTab === "organisms" ? "block" : "none" }}>
              <OrganismsTab
                key={selectedProfileId}
                profileId={selectedProfileId}
                isActive={isActive}
                initialData={profileData.ecosystem}
              />
            </Box>
          </>
        ) : (
          !loadError && <Typography sx={{ mt: 3 }}>Loading profile...</Typography>
        )}
      </Box>
    </Box>
  );
}