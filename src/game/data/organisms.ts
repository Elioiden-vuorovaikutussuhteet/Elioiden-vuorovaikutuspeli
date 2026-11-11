import { z } from "zod";

export const OrganismSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  texture: z.string().min(1),
  default_scale: z.number().positive(),
  growth_types: z.array(z.string()),
  offsetX: z.number(),
  offsetY: z.number(),
});

export type OrganismData = z.infer<typeof OrganismSchema>;

export const organisms = z.array(OrganismSchema).parse([
  {
    id: "acacia",
    name: "Bullhorn Acacia",
    texture: "acacia_sprite",
    default_scale: 1,
    growth_types: ["grow"],
    offsetX: 0,
    offsetY: 0,
  },
  {
    id: "amf",
    name: "Arbuscular Mycorrhizal Fungus",
    texture: "amf_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 0,
    offsetY: 300,
  },
  {
    id: "sapota",
    name: "Sapota",
    texture: "sapota_sprite",
    default_scale: 0.9,
    growth_types: ["grow"],
    offsetX: 400,
    offsetY: 0,
  },
  {
    id: "ants",
    name: "Acacia Ants",
    texture: "ants_sprite",
    default_scale: 0.8,
    growth_types: ["multiply"],
    offsetX: -400,
    offsetY: 0,
  },
  {
    id: "antfootbacteria",
    name: "Ant Foot Bacteria",
    texture: "antfootbacteria_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: -400,
    offsetY: 300,
  },
  {
    id: "diazotroph",
    name: "Diazotrophic Bacteria",
    texture: "diazotroph_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 0,
    offsetY: -300,
  },
  {
    id: "mycorrhizahelper",
    name: "Mycorrhiza Helper Bacteria",
    texture: "mycorrhizahelper_sprite",
    default_scale: 1,
    growth_types: ["multiply"],
    offsetX: 400,
    offsetY: 300,
  },
]);

export const organismDataMap = new Map<string, OrganismData>(
  organisms.map((org) => [org.id, org]),
);

export function getOrganismData(id: string): OrganismData | undefined {
  return organismDataMap.get(id);
}

