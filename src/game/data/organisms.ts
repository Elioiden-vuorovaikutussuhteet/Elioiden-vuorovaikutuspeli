export interface OrganismData {
  id: string;
  name: string;
  texture: string;
  default_scale: number;
  growth_types: string[];
}

export const organisms: OrganismData[] = [
  {
    id: "acacia",
    name: "Bullhorn Acacia",
    texture: "acacia_sprite",
    default_scale: 1.3,
    growth_types: ["grow"],
  },
  {
    id: "amf",
    name: "Arbuscular Mycorrhizal Fungus",
    texture: "amf_sprite",
    default_scale: 0.8,
    growth_types: ["multiply"],
  },
  {
    id: "sapota",
    name: "Sapota",
    texture: "sapota_sprite",
    default_scale: 1.1,
    growth_types: ["grow"],
  },
  {
    id: "ants",
    name: "Ants",
    texture: "ants_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
  },
  {
    id: "glomeromycetes",
    name: "Glomeromycetes",
    texture: "glomeromycetes_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
  },
  {
    id: "diazotroph",
    name: "Diazotrophic bacteria",
    texture: "diazotroph_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
  },
];
