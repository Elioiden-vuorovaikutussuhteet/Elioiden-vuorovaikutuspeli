export interface organismsRelations {
  source: string;
  target: string;
  value: -1 | 0 | 1;
  mult: number;
}

export const relations: organismsRelations[] = [
  { source: "acacia", target: "amf", value: 1, mult: 1 },
  { source: "acacia", target: "ants", value: 1, mult: 1 },
  { source: "acacia", target: "sapota", value: -1, mult: 0.8 },
  { source: "acacia", target: "diazotroph", value: 1, mult: 1 },
  { source: "acacia", target: "glomeromycetes", value: 1, mult: 1 },
  { source: "amf", target: "acacia", value: 1, mult: 1 },
  { source: "amf", target: "sapota", value: 1, mult: 1 },
  { source: "ants", target: "acacia", value: 1, mult: 1 },
  { source: "ants", target: "sapota", value: -1, mult: 0.8 },
  { source: "ants", target: "antfootbacteria", value: 1, mult: 1 },
  { source: "antfootbacteria", target: "ants", value: 1, mult: 1 },
  { source: "sapota", target: "acacia", value: -1, mult: 0.8 },
  { source: "sapota", target: "amf", value: 1, mult: 1 },
  { source: "glomeromycetes", target: "acacia", value: 1, mult: 1 },
  { source: "glomeromycetes", target: "sapota", value: -1, mult: 0.8 },
  {
    source: "glomeromycetes",
    target: "mycorrhizahelper",
    value: 1,
    mult: 1,
  },
  { source: "diazotroph", target: "acacia", value: 1, mult: 1 },
  {
    source: "mycorrhizahelper",
    target: "glomeromycetes",
    value: 1,
    mult: 1,
  },
  { source: "mycorrhizahelper", target: "acacia", value: 1, mult: 1 },
  { source: "mycorrhizahelper", target: "sapota", value: 1, mult: 1 },
];
