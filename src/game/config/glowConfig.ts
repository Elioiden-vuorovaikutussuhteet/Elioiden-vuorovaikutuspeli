import { z } from "zod";

export const GlowConfigSchema = z.object({
  positiveGlow: z.number().int().min(0).max(0xffffff),
  negativeGlow: z.number().int().min(0).max(0xffffff),
  whiteGlow: z.number().int().min(0).max(0xffffff),

  glowQuality: z.number(),
  outerOuterStrength: z.number(),
  innerOuterStrength: z.number(),
  outerDuration: z.number(),
  innerDuration: z.number(),
  loop: z.number(),

  ease: z.string(),
});

export type GlowConfig = z.infer<typeof GlowConfigSchema>;

export const glowConfig: GlowConfig = {
  positiveGlow: 0x04b504,
  negativeGlow: 0xb83232,
  whiteGlow: 0xffffff,
  glowQuality: 2,
  outerOuterStrength: 30,
  innerOuterStrength: 3,
  outerDuration: 400,
  innerDuration: 300,
  loop: 0,
  ease: "Sine.inOut",
};