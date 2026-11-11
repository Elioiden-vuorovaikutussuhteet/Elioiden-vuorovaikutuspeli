import { z } from "zod";

export const organismsRelationsSchema = z.object({
  source: z.string(),
  target: z.string(),
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  mult: z.number(),
});

export type organismsRelations = z.infer<typeof organismsRelationsSchema>;

export const relations: organismsRelations[] = [
  { source: "acacia", target: "amf", value: 1, mult: 1 },
  { source: "acacia", target: "ants", value: 1, mult: 1 },
  { source: "acacia", target: "sapota", value: -1, mult: 1 },
  { source: "acacia", target: "diazotroph", value: 1, mult: 1 },
  { source: "amf", target: "acacia", value: 1, mult: 1 },
  { source: "amf", target: "sapota", value: 1, mult: 1 },
  { source: "amf", target: "mycorrhizahelper", value: 1, mult: 1 },
  { source: "ants", target: "acacia", value: 1, mult: 1 },
  { source: "ants", target: "sapota", value: -1, mult: 1 },
  { source: "ants", target: "antfootbacteria", value: 1, mult: 1 },
  { source: "antfootbacteria", target: "ants", value: 1, mult: 1 },
  { source: "sapota", target: "acacia", value: -1, mult: 1 },
  { source: "sapota", target: "amf", value: 1, mult: 1 },
  { source: "diazotroph", target: "acacia", value: 1, mult: 1 },
  { source: "mycorrhizahelper", target: "amf", value: 1, mult: 1 },
  { source: "mycorrhizahelper", target: "acacia", value: 1, mult: 1 },
  { source: "mycorrhizahelper", target: "sapota", value: 1, mult: 1 },
];
