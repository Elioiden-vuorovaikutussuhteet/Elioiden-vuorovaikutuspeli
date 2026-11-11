import { z } from "zod";

export const ForceLayoutConfigSchema = z.object({
  linkDistance: z.number(),
  linkStrength: z.number(),
  chargeStrength: z.number(),
  chargeDistanceMax: z.number(),
  collideRadius: z.number(),
  collideStrength: z.number(),
  centerX: z.number(),
  centerY: z.number(),
  centerStrength: z.number(),
  alphaDecay: z.number(),
  reheatAlpha: z.number(),
  worldWidth: z.number(),
  worldHeight: z.number(),
  padding: z.number(),
  arrowTargetOffset: z.number(),
  distanceMax: z.number(),
});

export type ForceLayoutConfig = z.infer<typeof ForceLayoutConfigSchema>;

export const DEFAULT_FORCE_CONFIG: ForceLayoutConfig = {
  linkDistance: 500,
  linkStrength: 0.9,
  chargeStrength: -1000,
  chargeDistanceMax: 500,
  collideRadius: 180,
  collideStrength: 0.9,
  centerX: 960,
  centerY: 540,
  centerStrength: 0.02,
  alphaDecay: 0.03,
  reheatAlpha: 0.5,
  worldWidth: 1920,
  worldHeight: 1080,
  padding: 150,
  arrowTargetOffset: 65,
  distanceMax: 500,
};