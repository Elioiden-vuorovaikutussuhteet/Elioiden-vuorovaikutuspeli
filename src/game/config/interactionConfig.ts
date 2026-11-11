import { z } from "zod";

export const InteractionConfigSchema = z.object({
  pulseWaitTime: z.number(),
  initialBaseHealthChange: z.number(),
  hpNormalizationDivisor: z.number(),
});

export type InteractionConfig = z.infer<typeof InteractionConfigSchema>;

export const interactionConfig: InteractionConfig = {
  pulseWaitTime: 1000,
  initialBaseHealthChange: 5,
  hpNormalizationDivisor: 100,
};