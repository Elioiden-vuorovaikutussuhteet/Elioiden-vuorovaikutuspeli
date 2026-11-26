import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { getServerMessage, logout } from "../api";
import {
  type Profile,
  fetchProfiles,
  fetchProfileConfigs,
} from "../game/config/configApi";
import ProfileBar from "../components/admin/ProfileBar";
import ConfigTab from "../components/admin/ConfigTab";
import OrganismsTab from "../components/admin/OrganismsTab";
import { type OrganismData } from "../game/data/organisms";

type PendingAction = { kind: "switch"; profileId: string } | { kind: "logout" };

export default function AdminPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Loading...");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [loadedProfile, setLoadedProfile] = useState<{
    id: string;
    data: Record<string, unknown>;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"config" | "organisms">("config");
  const [configDirty, setConfigDirty] = useState(false);
  const [organismsDirty, setOrganismsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const [organisms, setOrganisms] = useState<OrganismData[]>([]);

  const hasUnsavedChanges = configDirty || organismsDirty;
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isActive = Boolean(selectedProfile?.is_active);

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

    fetchProfileConfigs(selectedProfileId)
      .then((data) => {
        if (!cancelled) {
          setLoadedProfile({ id: selectedProfileId, data });
          setLoadError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Failed to load profile config.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProfileId]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  async function performLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function handleLogout() {
    if (hasUnsavedChanges) {
      setPendingAction({ kind: "logout" });
      return;
    }
    void performLogout();
  }

  function selectProfile(nextId: string) {
    setSelectedProfileId(nextId);
    setLoadedProfile(null);
    setLoadError(null);
    setConfigDirty(false);
    setOrganismsDirty(false);
  }

  function handleSelectProfile(nextId: string) {
    if (nextId === selectedProfileId) return;
    if (hasUnsavedChanges) {
      setPendingAction({ kind: "switch", profileId: nextId });
      return;
    }
    setSelectedProfileId(nextId);
  }

  function handleConfirmDiscard() {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;

    if (action.kind === "switch") {
      setSelectedProfileId(action.profileId);
    } else {
      void performLogout();
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>
      <Typography sx={{ mb: 2 }}>{message}</Typography>
      <Button variant="outlined" size="small" onClick={handleLogout}>
        Logout
      </Button>

      {profiles.length > 0 && (
        <ProfileBar
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelect={handleSelectProfile}
          onCreated={(created) => {
            setProfiles((prev) => [...prev, created]);
            handleSelectProfile(created.id);
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
            if (fallback) selectProfile(fallback.id);
          }}
        />
      )}

      {loadError && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 480 }}>
          {loadError}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v: "config" | "organisms") => setActiveTab(v)}
        >
          <Tab label="Config" value="config" />
          <Tab label="Organisms" value="organisms" />
        </Tabs>

        {loadedProfile?.id === selectedProfileId ? (
          <>
            <Box sx={{ display: activeTab === "config" ? "block" : "none" }}>
              <ConfigTab
                key={loadedProfile.id}
                profileId={loadedProfile.id}
                isActive={isActive}
                initialData={loadedProfile.data}
                organisms={organisms}
                onDirtyChange={setConfigDirty}
              />
            </Box>
            <Box sx={{ display: activeTab === "organisms" ? "block" : "none" }}>
              <OrganismsTab
                key={loadedProfile.id}
                profileId={loadedProfile.id}
                isActive={isActive}
                initialData={loadedProfile.data.ecosystem}
                onDirtyChange={setOrganismsDirty}
                onOrganismsChange={setOrganisms}
              />
            </Box>
          </>
        ) : (
          !loadError && (
            <Typography sx={{ mt: 3 }}>Loading profile...</Typography>
          )
        )}
      </Box>

      <Dialog
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
      >
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction?.kind === "logout"
              ? "You have unsaved changes. Log out and discard them?"
              : "You have unsaved changes. Switch profile and discard them?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDiscard}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
