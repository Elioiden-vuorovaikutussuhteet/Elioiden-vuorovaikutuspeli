import { useEffect, useState } from "react";
import { getServerMessage, logout } from "../api";
import { useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Typography, Button, Alert } from "@mui/material";
import { configRegistry } from "../game/config/configRegistry";
import { loadConfigsFromServer } from "../game/config/loadConfigs";
import {
  saveConfigSection,
  deleteConfigSection,
} from "../game/config/configApi";
import DynamicForm from "../components/DynamicForm";

function buildSectionMap(): Record<string, unknown> {
  return Object.fromEntries(
    configRegistry.flatMap((config) =>
      config.sections.map((section) => [
        `${config.id}.${section.id}`,
        structuredClone(section.defaults),
      ]),
    ),
  );
}

function AdminPage() {
  const [message, setMessage] = useState("Loading...");
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([
    { id: "default", name: "Default" },
  ]);
  const [activeProfile, setActiveProfile] = useState("default");
  const [newProfileName, setNewProfileName] = useState("");
  const [showAddProfile, setShowAddProfile] = useState(false);

  const [activeParentTab, setActiveParentTab] = useState("config");
  const [activeTab, setActiveTab] = useState("camera");

  const [configValues, setConfigValues] = useState<
    Record<string, Record<string, unknown>>
  >(() => ({
    default: buildSectionMap(),
  }));

  const [dirtySections, setDirtySections] = useState<Record<string, boolean>>(
    {},
  );
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [resetVersions, setResetVersions] = useState<Record<string, number>>(
    {},
  );
  const [feedback, setFeedback] = useState<{
    sectionKey: string;
    severity: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    getServerMessage()
      .then((data) => setMessage(data.message))
      .catch(console.error);

    loadConfigsFromServer()
      .then(() => {
        setConfigValues((prev) => ({
          ...prev,
          default: buildSectionMap(),
        }));
      })
      .catch(console.error);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleAddProfile() {
    const name = newProfileName.trim();
    if (!name) return;

    const id = crypto.randomUUID();
    setProfiles((previous) => [...previous, { id, name }]);
    setConfigValues((previous) => ({
      ...previous,
      [id]: buildSectionMap(),
    }));

    setActiveProfile(id);
    setNewProfileName("");
    setShowAddProfile(false);
  }

  function handleConfigChange(
    configId: string,
    sectionId: string,
    values: Record<string, unknown>,
  ) {
    const key = `${configId}.${sectionId}`;

    setConfigValues((previous) => ({
      ...previous,
      [activeProfile]: {
        ...previous[activeProfile],
        [key]: values,
      },
    }));
    setDirtySections((prev) => ({ ...prev, [key]: true }));
  }

  async function handleSaveSection(configId: string, sectionId: string) {
    const key = `${configId}.${sectionId}`;
    const currentValues = configValues[activeProfile]?.[key] as Record<
      string,
      unknown
    >;
    if (!currentValues) return;

    setSavingSection(key);
    setFeedback(null);

    try {
      const savedConfig = await saveConfigSection(sectionId, currentValues);
      setConfigValues((prev) => ({
        ...prev,
        [activeProfile]: {
          ...prev[activeProfile],
          [key]: structuredClone(savedConfig),
        },
      }));
      setDirtySections((prev) => ({ ...prev, [key]: false }));
      setFeedback({
        sectionKey: key,
        severity: "success",
        text: "Configuration saved to database.",
      });
    } catch (error) {
      setFeedback({
        sectionKey: key,
        severity: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save configuration.",
      });
    } finally {
      setSavingSection(null);
    }
  }

  async function handleResetSection(configId: string, sectionId: string) {
    const key = `${configId}.${sectionId}`;
    setSavingSection(key);
    setFeedback(null);

    try {
      const defaultConfig = await deleteConfigSection(sectionId);
      setConfigValues((prev) => ({
        ...prev,
        [activeProfile]: {
          ...prev[activeProfile],
          [key]: structuredClone(defaultConfig),
        },
      }));
      setDirtySections((prev) => ({ ...prev, [key]: false }));
      setResetVersions((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
      setFeedback({
        sectionKey: key,
        severity: "success",
        text: "Reset to default values.",
      });
    } catch (error) {
      setFeedback({
        sectionKey: key,
        severity: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to reset configuration.",
      });
    } finally {
      setSavingSection(null);
    }
  }

  const activeConfig = configRegistry.find((config) => config.id === activeTab);

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        height: "auto",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>

      <Typography sx={{ mb: 2 }}>{message}</Typography>

      <button onClick={handleLogout}>Logout</button>

      <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Typography>Profile:</Typography>

        <select
          value={activeProfile}
          onChange={(e) => setActiveProfile(e.target.value)}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>

        <button onClick={() => setShowAddProfile(!showAddProfile)}>
          + Add Profile
        </button>
      </Box>

      {showAddProfile && (
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <input
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Profile name"
          />

          <button onClick={handleAddProfile}>Create</button>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Tabs
          value={activeParentTab}
          onChange={(_, value) => setActiveParentTab(value)}
        >
          <Tab label="Config" value="config" />
          <Tab label="Organisms" value="organisms" />
        </Tabs>

        {activeParentTab === "config" && (
          <Box sx={{ mt: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
            >
              {configRegistry.map((config) => (
                <Tab key={config.id} label={config.label} value={config.id} />
              ))}
            </Tabs>

            {activeConfig && (
              <Box sx={{ mt: 3 }}>
                {activeConfig.sections.map((section) => {
                  const key = `${activeConfig.id}.${section.id}`;
                  const isSaving = savingSection === key;
                  const isDirty = Boolean(dirtySections[key]);
                  const version = resetVersions[key] ?? 0;

                  return (
                    <Box key={section.id} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {section.label}
                      </Typography>

                      <DynamicForm
                        key={`${activeProfile}-${activeConfig.id}-${section.id}-${version}`}
                        schema={section.schema}
                        defaults={
                          (configValues[activeProfile]?.[key] as Record<
                            string,
                            unknown
                          >) ?? section.defaults
                        }
                        onChange={(values) =>
                          handleConfigChange(
                            activeConfig.id,
                            section.id,
                            values,
                          )
                        }
                      />

                      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                        <Button
                          variant="contained"
                          disabled={isSaving || !isDirty}
                          onClick={() =>
                            handleSaveSection(activeConfig.id, section.id)
                          }
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </Button>

                        <Button
                          variant="outlined"
                          color="secondary"
                          disabled={isSaving}
                          onClick={() =>
                            handleResetSection(activeConfig.id, section.id)
                          }
                        >
                          Reset to Defaults
                        </Button>
                      </Box>

                      {feedback?.sectionKey === key && (
                        <Alert
                          severity={feedback.severity}
                          sx={{ mt: 2, maxWidth: 480 }}
                          onClose={() => setFeedback(null)}
                        >
                          {feedback.text}
                        </Alert>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {activeParentTab === "organisms" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              To be added...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AdminPage;
