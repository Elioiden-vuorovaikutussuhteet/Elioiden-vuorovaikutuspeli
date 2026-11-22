import { useState } from "react";
import { Alert, Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { configRegistry } from "../../game/config/configRegistry";
import {
  saveConfigSection,
  deleteConfigSection,
} from "../../game/config/configApi";
import DynamicForm from "../DynamicForm";

interface ConfigTabProps {
  profileId: string;
  isActive: boolean;
  initialData: Record<string, unknown>;
}

function buildInitialValues(
  serverData: Record<string, unknown>,
): Record<string, Record<string, unknown>> {
  return Object.fromEntries(
    configRegistry.flatMap((category) =>
      category.sections.map((section) => [
        section.id,
        structuredClone(
          (serverData[section.id] ?? section.defaults) as Record<string, unknown>,
        ),
      ]),
    ),
  );
}

export default function ConfigTab({
  profileId,
  isActive,
  initialData,
}: ConfigTabProps) {
  const [activeTab, setActiveTab] = useState(configRegistry[0]?.id ?? "camera");
  const [values, setValues] = useState(() => buildInitialValues(initialData));
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resetCounts, setResetCounts] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{
    sectionId: string;
    severity: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSave(sectionId: string) {
    const current = values[sectionId];
    if (!current) return;

    setSavingId(sectionId);
    setFeedback(null);
    try {
      const saved = await saveConfigSection(profileId, sectionId, current, isActive);
      setValues((prev) => ({ ...prev, [sectionId]: structuredClone(saved) }));
      setDirty((prev) => ({ ...prev, [sectionId]: false }));
      setFeedback({
        sectionId,
        severity: "success",
        text: "Configuration saved to database.",
      });
    } catch (err) {
      setFeedback({
        sectionId,
        severity: "error",
        text: err instanceof Error ? err.message : "Failed to save configuration.",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleReset(sectionId: string, fallbackDefaults: unknown) {
    setSavingId(sectionId);
    setFeedback(null);
    try {
      const reset = await deleteConfigSection(profileId, sectionId, isActive);
      setValues((prev) => ({
        ...prev,
        [sectionId]: structuredClone(
          (reset ?? fallbackDefaults) as Record<string, unknown>,
        ),
      }));
      setDirty((prev) => ({ ...prev, [sectionId]: false }));
      setResetCounts((prev) => ({ ...prev, [sectionId]: (prev[sectionId] ?? 0) + 1 }));
      setFeedback({
        sectionId,
        severity: "success",
        text: "Reset to default values.",
      });
    } catch (err) {
      setFeedback({
        sectionId,
        severity: "error",
        text: err instanceof Error ? err.message : "Failed to reset configuration.",
      });
    } finally {
      setSavingId(null);
    }
  }

  const activeCategory = configRegistry.find((c) => c.id === activeTab);

  return (
    <Box sx={{ mt: 3 }}>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        {configRegistry.map((c) => (
          <Tab key={c.id} label={c.label} value={c.id} />
        ))}
      </Tabs>

      {activeCategory && (
        <Box sx={{ mt: 3 }}>
          {activeCategory.sections.map((section) => {
            const isSaving = savingId === section.id;
            return (
              <Box key={section.id} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {section.label}
                </Typography>

                <DynamicForm
                  key={`${activeCategory.id}-${section.id}-${resetCounts[section.id] ?? 0}`}
                  schema={section.schema}
                  defaults={values[section.id] ?? section.defaults}
                  onChange={(next) => {
                    setValues((prev) => ({ ...prev, [section.id]: next }));
                    setDirty((prev) => ({ ...prev, [section.id]: true }));
                  }}
                />

                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    disabled={isSaving || !dirty[section.id]}
                    onClick={() => handleSave(section.id)}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={isSaving}
                    onClick={() => handleReset(section.id, section.defaults)}
                  >
                    Reset to Defaults
                  </Button>
                </Box>

                {feedback?.sectionId === section.id && (
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
  );
}