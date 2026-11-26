import { z } from "zod";

export const SpawnOrderSchema = z.object({
    spawnOrder: z.array(z.string()).default([])
});

export type SpawnOrder = z.infer<
  typeof SpawnOrderSchema
>;

export const spawnOrder: SpawnOrder = {
    spawnOrder: [
        "acacia",
        "amf",
        "ants",
        "sapota",
        "antfootbacteria",
        "diazotroph",
        "mycorrhizahelper",
        "acaciapathogen",
        "antpathogen",
    ]
};