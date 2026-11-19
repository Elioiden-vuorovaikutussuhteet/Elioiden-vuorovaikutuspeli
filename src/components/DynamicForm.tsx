import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  MenuItem,
} from "@mui/material";
import { z } from "zod";
import { type OrganismData } from "../game/data/organisms";

interface DynamicFormProps {
  schema: z.ZodObject<z.ZodRawShape>;
  defaults: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  organisms?: OrganismData[];
}

export default function DynamicForm({ schema, defaults, onChange, organisms }: DynamicFormProps) {
  const values = defaults;

  function handleChange(key: string, value: unknown) {
    onChange?.({ ...defaults, [key]: value });
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 2,
        p: 3,
        backgroundColor: "#f3f6fa",
        border: "1px solid #dce3ec",
        borderRadius: 2,
      }}
    >

      {Object.entries(schema.shape).map(([key, field]) => {

        const currentValue = values[key];

        // Number fields
        if (field instanceof z.ZodNumber) {
          const isColor = field.meta()?.input === "color";

          if (isColor) {
            const hexValue =
              `#${Number(currentValue ?? 0).toString(16).padStart(6, "0")}`;

            return (
              <Box key={key}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {key}
                </Typography>

                <TextField
                  type="color"
                  value={hexValue}
                  onChange={(e) => {
                    handleChange(
                      key,
                      parseInt(e.target.value.slice(1), 16)
                    );
                  }}
                  fullWidth
                />
              </Box>
            );
          }

          return (
            <TextField
              key={key}
              label={key}
              type="number"
              value={currentValue ?? ""}
              onChange={(e) =>
                handleChange(key, Number(e.target.value))
              }
              fullWidth
            />
          );
        }

        // Organism references
        if (
          (key === "source" || key === "target") &&
          organisms
        ) {
          if (key === "source") {
            const sourceOrganism = organisms.find(
              (organism) => organism.id === currentValue
            );

            return (
              <TextField
                key={key}
                label="Source"
                value={sourceOrganism?.name ?? currentValue ?? ""}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                fullWidth
              />
            );
          }

          return (
            <TextField
              key={key}
              select
              label="Target"
              value={currentValue ?? ""}
              onChange={(e) =>
                handleChange(key, e.target.value)
              }
              fullWidth
            >
              {organisms.map((organism) => (
                <MenuItem
                  key={organism.id}
                  value={organism.id}
                >
                  {organism.name}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        // Relation value
        if (key === "value") {
          return (
            <TextField
              key={key}
              select
              label="value"
              value={currentValue ?? 0}
              onChange={(e) =>
                handleChange(key, Number(e.target.value))
              }
              fullWidth
            >
              <MenuItem value={-1}>-1 (Negative)</MenuItem>
              <MenuItem value={0}>0 (Neutral)</MenuItem>
              <MenuItem value={1}>1 (Positive)</MenuItem>
            </TextField>
          );
        }

        // Organism ID
        if (key === "id") {
          return (
            <TextField
              key={key}
              label="ID"
              value={String(currentValue ?? "")}
              onChange={(e) =>
                handleChange(key, e.target.value)
              }
              fullWidth
            />
          );
        }

        // String fields
        if (field instanceof z.ZodString) {
          return (
            <TextField
              key={key}
              label={key}
              value={currentValue ?? ""}
              onChange={(e) =>
                handleChange(key, e.target.value)
              }
              fullWidth
            />
          );
        }

        // Boolean fields
        if (field instanceof z.ZodBoolean) {
          return (
            <FormControlLabel
              key={key}
              label={key}
              control={
                <Switch
                  checked={
                    typeof currentValue === "boolean"
                      ? currentValue
                      : false
                  }
                  onChange={(e) =>
                    handleChange(key, e.target.checked)
                  }
                />
              }
            />
          );
        }

        // Arrays of strings
        if (field instanceof z.ZodArray) {
          const items = Array.isArray(currentValue)
            ? currentValue as string[]
            : [];

          return (
            <Box key={key}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {key}
              </Typography>

              <TextField
                select
                label={key}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) =>
                      (selected as string[]).join(", "),
                  },
                }}
                value={items}
                onChange={(e) => {
                  const value = e.target.value;

                  handleChange(
                    key,
                    typeof value === "string"
                      ? value.split(",")
                      : value
                  );
                }}
                fullWidth
              >
                {field.element instanceof z.ZodString &&
                  ["grow", "multiply"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          );
        }

        // Nested objects
        if (field instanceof z.ZodObject) {
          return (
            <Box
              key={key}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {key}
              </Typography>

              <DynamicForm
                schema={field}
                defaults={
                  typeof currentValue === "object" &&
                  currentValue !== null &&
                  !Array.isArray(currentValue)
                    ? currentValue as Record<string, unknown>
                    : {}
                }
                onChange={(nestedValues) =>
                  handleChange(key, nestedValues)
                }
              />
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
}
