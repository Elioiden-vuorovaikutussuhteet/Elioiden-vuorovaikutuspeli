import { z } from "zod";

export const PulseSpeedMultipliersSchema = z.object({
  slow: z.number(),
  normal: z.number(),
  fast: z.number(),
});

export type PulseSpeedMultipliers = z.infer<
  typeof PulseSpeedMultipliersSchema
>;

export const pulseSpeedMultipliers: PulseSpeedMultipliers = {
  slow: 1.75,
  normal: 1,
  fast: 0.5,
};