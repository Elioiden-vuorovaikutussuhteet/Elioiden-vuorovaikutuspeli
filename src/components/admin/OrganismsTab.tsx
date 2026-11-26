import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import {
  saveConfigSection,
  deleteConfigSection,
} from "../../game/config/configApi";
import { loadConfigsFromServer } from "../../game/config/loadConfigs";
import OrganismEditor from "../OrganismEditor";
import {
  organisms as initialOrganisms,
  type OrganismData,
} from "../../game/data/organisms";
import {
  relations as initialRelations,
  type OrganismsRelations,
} from "../../game/data/relations";
import {
  popupTexts as initialPopupTexts,
  type PopupText,
  getInteractionId,
} from "../../game/data/popupTexts";

interface OrganismConfig {
  organisms: OrganismData[];
  relations: OrganismsRelations[];
  popupTexts: Record<string, PopupText>;
}

interface OrganismsTabProps {
  profileId: string;
  isActive: boolean;
  readOnly?: boolean;
  initialData: unknown;
  onDirtyChange?: (dirty: boolean) => void;
}

function defaultOrganismConfig(): OrganismConfig {
  return {
    organisms: structuredClone(initialOrganisms),
    relations: structuredClone(initialRelations),
    popupTexts: structuredClone(initialPopupTexts),
  };
}

function normalizeOrganismConfig(raw: unknown): OrganismConfig {
  if (!raw || typeof raw !== "object") return defaultOrganismConfig();
  const c = raw as Partial<OrganismConfig>;
  return {
    organisms: Array.isArray(c.organisms)
      ? structuredClone(c.organisms)
      : structuredClone(initialOrganisms),
    relations: Array.isArray(c.relations)
      ? structuredClone(c.relations)
      : structuredClone(initialRelations),
    popupTexts:
      c.popupTexts && typeof c.popupTexts === "object"
        ? structuredClone(c.popupTexts)
        : structuredClone(initialPopupTexts),
  };
}

function movePopupKey(
  popupTexts: Record<string, PopupText>,
  oldKey: string,
  newKey: string,
  overwrite: boolean,
) {
  if (
    oldKey !== newKey &&
    popupTexts[oldKey] &&
    (overwrite || !popupTexts[newKey])
  ) {
    popupTexts[newKey] = popupTexts[oldKey];
    delete popupTexts[oldKey];
  }
}

export default function OrganismsTab({
  profileId,
  isActive,
  readOnly = false,
  initialData,
  onDirtyChange,
}: OrganismsTabProps) {
  const [config, setConfig] = useState(() =>
    normalizeOrganismConfig(initialData),
  );
  const [selectedId, setSelectedId] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    text: string;
  } | null>(null);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const { organisms, relations, popupTexts } = config;
  const activeOrganismId = organisms.some((o) => o.id === selectedId)
    ? selectedId
    : (organisms[0]?.id ?? "");

  function update(updater: (prev: OrganismConfig) => OrganismConfig) {
    if (readOnly) return;
    setConfig(updater);
    setDirty(true);
  }

  function handleOrganismChange(originalId: string, updated: OrganismData) {
    update((prev) => {
      const nextOrganisms = prev.organisms.map((o) =>
        o.id === originalId ? updated : o,
      );
      if (originalId === updated.id) {
        return { ...prev, organisms: nextOrganisms };
      }

      const nextPopupTexts = { ...prev.popupTexts };
      const nextRelations = prev.relations.map((rel) => {
        const nextRel = {
          ...rel,
          source: rel.source === originalId ? updated.id : rel.source,
          target: rel.target === originalId ? updated.id : rel.target,
        };
        movePopupKey(
          nextPopupTexts,
          getInteractionId(rel.source, rel.target),
          getInteractionId(nextRel.source, nextRel.target),
          true,
        );
        return nextRel;
      });

      return {
        organisms: nextOrganisms,
        relations: nextRelations,
        popupTexts: nextPopupTexts,
      };
    });

    if (!readOnly && originalId !== updated.id) setSelectedId(updated.id);
  }

  function handleRelationChange(index: number, updated: OrganismsRelations) {
    update((prev) => {
      const prevRel = prev.relations[index];
      const nextPopupTexts = { ...prev.popupTexts };
      if (prevRel) {
        movePopupKey(
          nextPopupTexts,
          getInteractionId(prevRel.source, prevRel.target),
          getInteractionId(updated.source, updated.target),
          false,
        );
      }
      return {
        ...prev,
        relations: prev.relations.map((r, i) => (i === index ? updated : r)),
        popupTexts: nextPopupTexts,
      };
    });
  }

  async function handleSave() {
    if (readOnly) return;
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await saveConfigSection(
        profileId,
        "ecosystem",
        { organisms, relations, popupTexts },
        false,
      );
      if (isActive) await loadConfigsFromServer(profileId);
      setConfig(normalizeOrganismConfig(saved));
      setDirty(false);
      setFeedback({
        severity: "success",
        text: "Organisms saved to database.",
      });
    } catch (err) {
      setFeedback({
        severity: "error",
        text: err instanceof Error ? err.message : "Failed to save organisms.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (readOnly) return;
    setSaving(true);
    setFeedback(null);
    try {
      const reset = await deleteConfigSection(profileId, "ecosystem", false);
      if (isActive) await loadConfigsFromServer(profileId);
      const next = normalizeOrganismConfig(reset);
      setConfig(next);
      setSelectedId(next.organisms[0]?.id ?? "");
      setDirty(false);
      setFeedback({
        severity: "success",
        text: "Organisms reset to default values.",
      });
    } catch (err) {
      setFeedback({
        severity: "error",
        text: err instanceof Error ? err.message : "Failed to reset organisms.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Organism Editor
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography sx={{ mb: 1 }}>Select organism:</Typography>
        <select
          value={activeOrganismId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {organisms.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </Box>

      <Box
        ref={(el: HTMLDivElement | null) => {
          if (el) el.inert = readOnly;
        }}
        sx={readOnly ? { opacity: 0.65, pointerEvents: "none" } : undefined}
      >
        <OrganismEditor
          organisms={organisms}
          relations={relations}
          popupTexts={popupTexts}
          selectedOrganismId={activeOrganismId}
          onOrganismChange={handleOrganismChange}
          onRelationChange={handleRelationChange}
          onPopupTextChange={(interactionId, updatedPopupText) =>
            update((prev) => ({
              ...prev,
              popupTexts: {
                ...prev.popupTexts,
                [interactionId]: updatedPopupText,
              },
            }))
          }
        />
      </Box>

      {!readOnly && (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 3 }}>
          <Button
            variant="contained"
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            disabled={saving}
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
        </Stack>
      )}

      {feedback && (
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
}