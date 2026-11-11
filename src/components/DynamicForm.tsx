import { useState } from "react";
import { Box, TextField, Switch, FormControlLabel, Typography } from "@mui/material";
import { z } from "zod";

interface DynamicFormProps {
  schema: z.ZodObject<z.ZodRawShape>;
  defaults: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

export default function DynamicForm({
  schema,
  defaults,
  onChange,
}: DynamicFormProps) {

  const [values, setValues] = useState(defaults);

  function handleChange(key: string, value: unknown) {
    const updated = {
      ...values,
      [key]: value,
    };

    setValues(updated);
    onChange?.(updated);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
                    handleChange(key, parseInt(e.target.value.slice(1), 16));
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
                  checked={typeof currentValue === "boolean" ? currentValue : false}
                  onChange={(e) =>
                    handleChange(key, e.target.checked)
                  }
                />
              }
            />
          );
        }

        // Nested objects
        if (field instanceof z.ZodObject) {
          return (
            <Box key={key} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2 }}>
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