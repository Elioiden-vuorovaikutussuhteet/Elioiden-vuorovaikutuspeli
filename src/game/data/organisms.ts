export interface OrganismData {
  id: string;
  name: string;
  texture: string;
  default_scale: number;
}

export const organisms: OrganismData[] = [
  {
    id: "acacia",
    name: "Bullhorn Acacia",
    texture: "acacia_sprite",
    default_scale: 1.3,
  },
  {
    id: "amf",
    name: "Arbuscular Mycorrhizal Fungus",
    texture: "amf_sprite",
    default_scale: 0.5,
  },
];
