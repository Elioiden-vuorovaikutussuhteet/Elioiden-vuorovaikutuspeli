import { useEffect, useState } from 'react';
import { getServerMessage } from '../api';
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { configRegistry } from "../game/config/configRegistry";
import DynamicForm from '../components/DynamicForm';

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

const [activeParentTab, setActiveParentTab] = useState("config");
const [activeTab, setActiveTab] = useState("camera");

// For future config saving:
// - Possibly load saved configurations from the backend instead of using section.defaults.
// - Possibly separate saved values from the current edited values.
const [configValues, setConfigValues] = useState<
    Record<string, unknown>
  >(() =>
    Object.fromEntries(
      configRegistry.flatMap((config) =>
        config.sections.map((section) => [
          `${config.id}.${section.id}`,
          section.defaults,
        ])
      )
    )
  );

  // For future config saving:
  // - Trigger autosave or mark the configuration as edited here.
  function handleConfigChange(
    configId: string,
    sectionId: string,
    values: Record<string, unknown>
  ) {
    const key = `${configId}.${sectionId}`;

    setConfigValues((previous) => ({
      ...previous,
      [key]: values,
    }));
  }

  const activeConfig = configRegistry.find(
    (config) => config.id === activeTab
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

      <Typography sx={{ mb: 2 }}>
        {message}
      </Typography>

      <button onClick={handleLogout}>
        Logout
      </button>

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
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
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
                        schema={section.schema}
                        defaults={configValues[key]}
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

        {/* Organisms tabs */}
        {activeParentTab === "organisms" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              To be added...
            </Typography>
          </Box>
        )}
      </Box>
          
    {/* 
    For future config saving:
    - Add a save button that submits configValues to the backend. (If not autosave)
    */}
    </Box>
  );
}

export default AdminPage;