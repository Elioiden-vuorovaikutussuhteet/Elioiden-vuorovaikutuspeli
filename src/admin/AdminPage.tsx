import { useEffect, useState } from 'react';
import { getServerMessage } from '../api';
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { configRegistry } from "../game/config/configRegistry";
import DynamicForm from '../components/DynamicForm';
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
} from "../game/data/popupTexts";
import OrganismEditor from "../components/OrganismEditor";

function AdminPage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    getServerMessage()
      .then(data => {
        setMessage(data.message);
      })
      .catch(console.error);
  }, []);

const navigate = useNavigate();

async function handleLogout() {
  try {
    await logout();
    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
// For future database use:
// - Load profiles from backend
const [profiles, setProfiles] = useState([
  { id: "default", name: "Default" },
]);

function createDefaultConfigValues() {
  return Object.fromEntries(
    configRegistry.flatMap((config) =>
      config.sections.map((section) => [
        `${config.id}.${section.id}`,
        structuredClone(section.defaults),
      ])
    )
  );
}

const [activeProfile, setActiveProfile] = useState("default");

const [newProfileName, setNewProfileName] = useState("");
const [showAddProfile, setShowAddProfile] = useState(false);

// For future database use:
// - Change local profile adding to an API request
function handleAddProfile() {
  const name = newProfileName.trim();

  if (!name) return;

  const id = crypto.randomUUID();

  setProfiles((previous) => [
    ...previous,
    { id, name },
  ]);

  setConfigValues((previous) => ({
    ...previous,
    [id]: createDefaultConfigValues(),
  }));

  setOrganismConfigs((previous) => ({
    ...previous,
    [id]: createDefaultOrganismConfig(),
  }));

  setActiveProfile(id);
  setNewProfileName("");
  setShowAddProfile(false);
}

const [activeParentTab, setActiveParentTab] = useState("config");
const [activeConfigTab, setActiveConfigTab] = useState("camera");

// For future config saving:
// - Possibly load saved configurations from the backend instead of using section.defaults.
// - Possibly separate saved values from the current edited values.
// - Associate each configuration with its corresponding profile.
const [configValues, setConfigValues] = useState<
  Record<string, Record<string, unknown>>
>(() => ({
  default: createDefaultConfigValues(),
}));

/*
For config saving:
- Add a save button:
- It should call a function that checks hasUnsavedConfigChanges for True, then sends
  - profileId: activeProfile
  - configValues: configValues[activeProfile]
  to backend
- After a successful save, set hasUnsavedConfigChanges to false.

*/
const [hasUnsavedConfigChanges, setHasUnsavedConfigChanges] = useState(false);

void hasUnsavedConfigChanges;

useEffect(() => {
  setHasUnsavedConfigChanges(false);
}, [activeProfile]);

function handleConfigChange(
  configId: string,
  sectionId: string,
  values: Record<string, unknown>
) {
  const key = `${configId}.${sectionId}`;

  setConfigValues((previous) => ({
    ...previous,
    [activeProfile]: {
      ...previous[activeProfile],
      [key]: values,
    },
  }));

  setHasUnsavedConfigChanges(true);
}
  const activeConfig = configRegistry.find(
    (config) => config.id === activeConfigTab
  );

// Current organisms tba implementation:
// - Organisms, relations and popup texts are stored in React state.
// - Changes are local and are lost when the page reloads.

const [hasUnsavedOrgChanges, setHasUnsavedOrgChanges] = useState(false);

void hasUnsavedOrgChanges;

useEffect(() => {
  setHasUnsavedOrgChanges(false);
}, [activeProfile]);

type OrganismConfig = {
  organisms: OrganismData[];
  relations: OrganismsRelations[];
  popupTexts: Record<string, PopupText>;
};

function createDefaultOrganismConfig(): OrganismConfig {
  return {
    organisms: structuredClone(initialOrganisms),
    relations: structuredClone(initialRelations),
    popupTexts: structuredClone(initialPopupTexts),
  };
}

const [organismConfigs, setOrganismConfigs] = useState<
  Record<string, OrganismConfig>
>(() => ({
  default: createDefaultOrganismConfig(),
}));

const activeOrganismConfig =
  organismConfigs[activeProfile] ?? createDefaultOrganismConfig();

const organisms = activeOrganismConfig.organisms;
const relations = activeOrganismConfig.relations;
const popupTexts = activeOrganismConfig.popupTexts;

const [selectedOrganismId, setSelectedOrganismId] = useState<string>(
  initialOrganisms[0]?.id ?? ""
);

function updateOrganismConfig(
  updater: (previous: OrganismConfig) => OrganismConfig
) {
  setOrganismConfigs((previous) => ({
    ...previous,
    [activeProfile]: updater(
      previous[activeProfile] ?? createDefaultOrganismConfig()
    ),
  }));

  setHasUnsavedOrgChanges(true);
}

useEffect(() => {
  if (!organisms.some((organism) => organism.id === selectedOrganismId)) {
    setSelectedOrganismId(organisms[0]?.id ?? "");
  }
}, [activeProfile, organisms, selectedOrganismId]);

/*
For organism saving:
- Add a save button:
- It should call a function that checks hasUnsavedOrgChanges for True, then sends
organisms, relations, popupTexts to the backend
*/

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

      <Typography sx={{ mb: 2 }}>
        {message}
      </Typography>

      <button onClick={handleLogout}>
        Logout
      </button>

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

          <button onClick={handleAddProfile}>
            Create
          </button>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        {/* Parent tabs */}
        <Tabs
          value={activeParentTab}
          onChange={(_, value) => setActiveParentTab(value)}
        >
          <Tab label="Config" value="config" />
          <Tab label="Organisms" value="organisms" />
        </Tabs>

        {/* Config tabs */}
        {activeParentTab === "config" && (
          <Box sx={{ mt: 3 }}>
            <Tabs
              value={activeConfigTab}
              onChange={(_, value) => setActiveConfigTab(value)}
            >
              {configRegistry.map((config) => (
                <Tab
                  key={config.id}
                  label={config.label}
                  value={config.id}
                />
              ))}
            </Tabs>

            {activeConfig && (
              <Box sx={{ mt: 3 }}>
                {activeConfig.sections.map((section) => {
                  const key = `${activeConfig.id}.${section.id}`;

                  return (
                    <Box key={section.id} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {section.label}
                      </Typography>

                      <DynamicForm
                        key={`${activeProfile}-${activeConfig.id}-${section.id}`}
                        schema={section.schema}
                        defaults={
                          (configValues[activeProfile]?.[key] as Record<string, unknown>) ??
                          section.defaults
                        }
                        onChange={(values) =>
                          handleConfigChange(
                            activeConfig.id,
                            section.id,
                            values
                          )
                        }
                      />
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
              <Typography sx={{ mb: 1 }}>
                Select organism:
              </Typography>

              <select
                value={selectedOrganismId}
                onChange={(e) =>
                  setSelectedOrganismId(e.target.value)
                }
              >
                {organisms.map((organism) => (
                  <option
                    key={organism.id}
                    value={organism.id}
                  >
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
                updateOrganismConfig((previous) => ({
                  ...previous,
                  organisms: previous.organisms.map((organism) =>
                    organism.id === originalId
                      ? updatedOrganism
                      : organism
                  ),
                }));

                if (originalId !== updatedOrganism.id) {
                  setSelectedOrganismId(updatedOrganism.id);
                }
              }}

              onRelationChange={(index, updatedRelation) => {
                updateOrganismConfig((previous) => ({
                  ...previous,
                  relations: previous.relations.map((relation, i) =>
                    i === index
                      ? {
                          ...updatedRelation,
                          source: selectedOrganismId,
                        }
                      : relation
                  ),
                }));
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
          </Box>
        )}
    </Box>
          
    {/* 
    For future saving:
    - Add a save button that submits configValues to the backend. (If not autosave)
    */}
    </Box>
  );
}

export default AdminPage;