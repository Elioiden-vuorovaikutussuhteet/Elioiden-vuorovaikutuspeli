export interface OrganismData {
  id: string;
  name: string;
  texture: string;
  default_scale: number;
  growth_types: string[];
  offsetX: number;
  offsetY: number;
}

export const organisms: OrganismData[] = [
  {
    id: "acacia",
    name: "Bullhorn Acacia",
    texture: "acacia_sprite",
    default_scale: 1,
    growth_types: ["grow"],
    offsetX: 0,
    offsetY: -260,
  },
  {
    id: "amf",
    name: "Arbuscular Mycorrhizal Fungus",
    texture: "amf_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 0,
    offsetY: 260,
  },
  {
    id: "sapota",
    name: "Sapota",
    texture: "sapota_sprite",
    default_scale: 1.1,
    growth_types: ["grow"],
    offsetX: 260,
    offsetY: 0,
  },
  {
    id: "ants",
    name: "Acacia Ants",
    texture: "ants_sprite",
    default_scale: 0.8,
    growth_types: ["multiply"],
    offsetX: -260,
    offsetY: 0,
  },
  {
    id: "antfootbacteria",
    name: "Ant Foot Bacteria",
    texture: "antfootbacteria_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: -520,
    offsetY: 185,
  },
  {
    id: "diazotroph",
    name: "Diazotrophic Bacteria",
    texture: "diazotroph_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: -520,
    offsetY: -185,
  },
  {
    id: "mycorrhizahelper",
    name: "Mycorrhiza Helper Bacteria",
    texture: "mycorrhizahelper_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 520,
    offsetY: 185,
  },
];

export const organismDataMap = new Map<string, OrganismData>(
  organisms.map((org) => [org.id, org]),
);

export function getOrganismData(id: string): OrganismData | undefined {
  return organismDataMap.get(id);
}

