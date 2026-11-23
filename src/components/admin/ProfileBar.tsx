import { useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import {
  type Profile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../../game/config/configApi";
import { loadConfigsFromServer } from "../../game/config/loadConfigs";

interface ProfileBarProps {
  profiles: Profile[];
  selectedProfileId: string;
  onSelect: (id: string) => void;
  onCreated: (profile: Profile) => void;
  onActivated: (profile: Profile) => void;
  onDeleted: (id: string) => void;
}

function toProfileSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || crypto.randomUUID().slice(0, 8);
}

export default function ProfileBar({
  profiles,
  selectedProfileId,
  onSelect,
  onCreated,
  onActivated,
  onDeleted,
}: ProfileBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [cloneCurrent, setCloneCurrent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    text: string;
  } | null>(null);

  const selected = profiles.find((p) => p.id === selectedProfileId);
  const isActive = Boolean(selected?.is_active);

  async function runAction(action: () => Promise<string>) {
    setBusy(true);
    setFeedback(null);
    try {
      const text = await action();
      setFeedback({ severity: "success", text });
    } catch (err) {
      setFeedback({
        severity: "error",
        text: err instanceof Error ? err.message : "Profile action failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    runAction(async () => {
      const created = await createProfile({
        id: toProfileSlug(name),
        name,
        cloneFrom: cloneCurrent ? selectedProfileId : undefined,
      });
      onCreated(created);
      setNewName("");
      setCloneCurrent(false);
      setShowAdd(false);
      return `Created profile "${created.name}".`;
    });
  }

  function handleActivate() {
    if (!selected || isActive) return;
    runAction(async () => {
      const updated = await updateProfile(selected.id, { is_active: true });
      await loadConfigsFromServer(updated.id);
      onActivated(updated);
      return `"${updated.name}" is now the active profile.`;
    });
  }

  function handleDelete() {
    if (!selected || selected.id === "default" || isActive) return;
    runAction(async () => {
      await deleteProfile(selected.id);
      onDeleted(selected.id);
      return `Deleted profile "${selected.name}".`;
    });
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        <Typography>Profile:</Typography>

        <select
          value={selectedProfileId}
          disabled={busy}
          onChange={(e) => {
            setFeedback(null);
            onSelect(e.target.value);
          }}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.is_active ? " (Active)" : ""}
            </option>
          ))}
        </select>

        <Button
          size="small"
          variant="contained"
          disabled={busy || isActive}
          onClick={handleActivate}
        >
          {isActive ? "Active" : "Set Active"}
        </Button>

        <Button
          size="small"
          variant="outlined"
          disabled={busy}
          onClick={() => setShowAdd((prev) => !prev)}
        >
          + Add Profile
        </Button>

        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={busy || selectedProfileId === "default" || isActive}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>

      {showAdd && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile name"
          />
          <label>
            <input
              type="checkbox"
              checked={cloneCurrent}
              onChange={(e) => setCloneCurrent(e.target.checked)}
            />{" "}
            Clone current
          </label>
          <Button
            size="small"
            variant="contained"
            disabled={busy || !newName.trim()}
            onClick={handleCreate}
          >
            Create
          </Button>
        </Box>
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
