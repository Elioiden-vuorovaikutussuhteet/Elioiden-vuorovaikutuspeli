import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { getServerMessage, logout } from "../api";
import { configRegistry } from "../game/config/configRegistry";
import { loadConfigsFromServer } from "../game/config/loadConfigs";
import {
  saveConfigSection,
  deleteConfigSection,
} from "../game/config/configApi";
import DynamicForm from "../components/DynamicForm";
import OrganismEditor from "../components/OrganismEditor";
import {
  organisms as initialOrganisms,
  type OrganismData,
} from "../game/data/organisms";
import {
  relations as initialRelations,
  type OrganismsRelations,
} from "../game/data/relations";
import {
  popupTexts as initialPopupTexts,
  type PopupText,
  getInteractionId,
} from "../game/data/popupTexts";

type OrganismConfig = {
  organisms: OrganismData[];
  relations: OrganismsRelations[];
  popupTexts: Record<string, PopupText>;
};

const ECOSYSTEM_ENDPOINT = "/api/configs/ecosystem";
const ECOSYSTEM_SECTION_KEY = "ecosystem";

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

function createDefaultOrganismConfig(): OrganismConfig {
  return {
    organisms: structuredClone(initialOrganisms),
    relations: structuredClone(initialRelations),
    popupTexts: structuredClone(initialPopupTexts),
  };
}

function normalizeOrganismConfig(raw: unknown): OrganismConfig {
  if (!raw || typeof raw !== "object") {
    return createDefaultOrganismConfig();
  }
  const candidate = raw as Partial<OrganismConfig>;
  return {
    organisms: Array.isArray(candidate.organisms)
      ? candidate.organisms
      : structuredClone(initialOrganisms),
    relations: Array.isArray(candidate.relations)
      ? candidate.relations
      : structuredClone(initialRelations),
    popupTexts:
      candidate.popupTexts && typeof candidate.popupTexts === "object"
        ? candidate.popupTexts
        : structuredClone(initialPopupTexts),
  };
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
  const [activeConfigTab, setActiveConfigTab] = useState("camera");

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

  const [organismConfigs, setOrganismConfigs] = useState<
    Record<string, OrganismConfig>
  >(() => ({
    default: createDefaultOrganismConfig(),
  }));

  const [orgChanges, setOrgChanges] = useState<Record<string, boolean>>({});
  const [isSavingOrganisms, setIsSavingOrganisms] = useState(false);
  const hasUnsavedOrgChanges = orgChanges[activeProfile] ?? false;

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

    fetch(ECOSYSTEM_ENDPOINT, { credentials: "include" })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((data: unknown) => {
        if (data !== null) {
          const loaded = normalizeOrganismConfig(data);
          setOrganismConfigs((prev) => ({
            ...prev,
            default: loaded,
          }));
          setOrgChanges((prev) => ({
            ...prev,
            default: false,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load ecosystem config:", err);
      });
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const activeOrganismConfig =
    organismConfigs[activeProfile] ?? createDefaultOrganismConfig();

  const organisms = activeOrganismConfig.organisms;
  const relations = activeOrganismConfig.relations;
  const popupTexts = activeOrganismConfig.popupTexts;

  function updateOrganismConfig(
    updater: (previous: OrganismConfig) => OrganismConfig,
  ) {
    setOrganismConfigs((previous) => ({
      ...previous,
      [activeProfile]: updater(
        previous[activeProfile] ?? createDefaultOrganismConfig(),
      ),
    }));

    setOrgChanges((previous) => ({
      ...previous,
      [activeProfile]: true,
    }));
  }

  async function handleSaveOrganisms() {
    setIsSavingOrganisms(true);
    setFeedback(null);

    try {
      const res = await fetch(ECOSYSTEM_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ organisms, relations, popupTexts }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to save organisms");
      }

      const saved =
        body.config != null
          ? normalizeOrganismConfig(body.config)
          : { organisms, relations, popupTexts };

      setOrganismConfigs((previous) => ({
        ...previous,
        [activeProfile]: saved,
      }));
      setOrgChanges((previous) => ({
        ...previous,
        [activeProfile]: false,
      }));
      setFeedback({
        sectionKey: ECOSYSTEM_SECTION_KEY,
        severity: "success",
        text: "Organisms saved to database.",
      });
    } catch (error) {
      setFeedback({
        sectionKey: ECOSYSTEM_SECTION_KEY,
        severity: "error",
        text:
          error instanceof Error ? error.message : "Failed to save organisms",
      });
    } finally {
      setIsSavingOrganisms(false);
    }
  }

  async function handleResetOrganisms() {
    setIsSavingOrganisms(true);
    setFeedback(null);

    try {
      const res = await fetch(ECOSYSTEM_ENDPOINT, {
        method: "DELETE",
        credentials: "include",
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to reset organisms");
      }

      const next =
        body.config != null
          ? normalizeOrganismConfig(body.config)
          : createDefaultOrganismConfig();

      setOrganismConfigs((previous) => ({
        ...previous,
        [activeProfile]: next,
      }));
      setSelectedOrganismId(next.organisms[0]?.id ?? "");
      setOrgChanges((previous) => ({
        ...previous,
        [activeProfile]: false,
      }));
      setFeedback({
        sectionKey: ECOSYSTEM_SECTION_KEY,
        severity: "success",
        text: "Organisms reset to default values.",
      });
    } catch (error) {
      setFeedback({
        sectionKey: ECOSYSTEM_SECTION_KEY,
        severity: "error",
        text:
          error instanceof Error ? error.message : "Failed to reset organisms",
      });
    } finally {
      setIsSavingOrganisms(false);
    }
  }

  const [selectedOrganismIds, setSelectedOrganismIds] = useState<
    Record<string, string>
  >({});

  const storedOrganismId = selectedOrganismIds[activeProfile];

  const selectedOrganismId = organisms.some(
    (organism) => organism.id === storedOrganismId,
  )
    ? storedOrganismId
    : (organisms[0]?.id ?? "");

  function setSelectedOrganismId(id: string) {
    setSelectedOrganismIds((previous) => ({
      ...previous,
      [activeProfile]: id,
    }));
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

    setOrganismConfigs((previous) => ({
      ...previous,
      [id]: createDefaultOrganismConfig(),
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

  const activeConfig = configRegistry.find(
    (config) => config.id === activeConfigTab,
  );

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
              value={activeConfigTab}
              onChange={(_, value) => setActiveConfigTab(value)}
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

        {/* Organisms tab */}
        {activeParentTab === "organisms" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Organism Editor
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ mb: 1 }}>Select organism:</Typography>

              <select
                value={selectedOrganismId}
                onChange={(e) => setSelectedOrganismId(e.target.value)}
              >
                {organisms.map((organism) => (
                  <option key={organism.id} value={organism.id}>
                    {organism.name}
                  </option>
                ))}
              </select>
            </Box>

            <OrganismEditor
              key={activeProfile}
              organisms={organisms}
              relations={relations}
              popupTexts={popupTexts}
              selectedOrganismId={selectedOrganismId}
              onOrganismChange={(originalId, updatedOrganism) => {
                updateOrganismConfig((previous) => {
                  const nextOrganisms = previous.organisms.map((organism) =>
                    organism.id === originalId ? updatedOrganism : organism,
                  );
                  if (originalId === updatedOrganism.id) {
                    return { ...previous, organisms: nextOrganisms };
                  }

                  const nextRelations = previous.relations.map((relation) => ({
                    ...relation,
                    source:
                      relation.source === originalId
                        ? updatedOrganism.id
                        : relation.source,
                    target:
                      relation.target === originalId
                        ? updatedOrganism.id
                        : relation.target,
                  }));

                  const nextPopupTexts = { ...previous.popupTexts };
                  for (const relation of previous.relations) {
                    if (
                      relation.source === originalId ||
                      relation.target === originalId
                    ) {
                      const oldKey = getInteractionId(
                        relation.source,
                        relation.target,
                      );
                      const newKey = getInteractionId(
                        relation.source === originalId
                          ? updatedOrganism.id
                          : relation.source,
                        relation.target === originalId
                          ? updatedOrganism.id
                          : relation.target,
                      );
                      if (oldKey !== newKey && nextPopupTexts[oldKey]) {
                        nextPopupTexts[newKey] = nextPopupTexts[oldKey];
                        delete nextPopupTexts[oldKey];
                      }
                    }
                  }

                  return {
                    ...previous,
                    organisms: nextOrganisms,
                    relations: nextRelations,
                    popupTexts: nextPopupTexts,
                  };
                });

                if (originalId !== updatedOrganism.id) {
                  setSelectedOrganismId(updatedOrganism.id);
                }
              }}
              onRelationChange={(index, updatedRelation) => {
                updateOrganismConfig((previous) => {
                  const prevRel = previous.relations[index];
                  const nextRelations = previous.relations.map((relation, i) =>
                    i === index ? updatedRelation : relation,
                  );
                  const nextPopupTexts = { ...previous.popupTexts };

                  if (prevRel) {
                    const oldKey = getInteractionId(
                      prevRel.source,
                      prevRel.target,
                    );
                    const newKey = getInteractionId(
                      updatedRelation.source,
                      updatedRelation.target,
                    );
                    if (
                      oldKey !== newKey &&
                      nextPopupTexts[oldKey] &&
                      !nextPopupTexts[newKey]
                    ) {
                      nextPopupTexts[newKey] = nextPopupTexts[oldKey];
                      delete nextPopupTexts[oldKey];
                    }
                  }

                  return {
                    ...previous,
                    relations: nextRelations,
                    popupTexts: nextPopupTexts,
                  };
                });
              }}
              onPopupTextChange={(interactionId, updatedPopupText) => {
                updateOrganismConfig((previous) => ({
                  ...previous,
                  popupTexts: {
                    ...previous.popupTexts,
                    [interactionId]: updatedPopupText,
                  },
                }));
              }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", mt: 3 }}
            >
              <Button
                variant="contained"
                disabled={!hasUnsavedOrgChanges || isSavingOrganisms}
                onClick={handleSaveOrganisms}
              >
                {isSavingOrganisms ? "Saving..." : "Save"}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                disabled={isSavingOrganisms}
                onClick={handleResetOrganisms}
              >
                Reset to Defaults
              </Button>
            </Stack>

            {feedback?.sectionKey === ECOSYSTEM_SECTION_KEY && (
              <Alert
                severity={feedback.severity}
                sx={{ mt: 2, maxWidth: 480 }}
                onClose={() => setFeedback(null)}
              >
                {feedback.text}
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AdminPage;
