import { z } from "zod";
import { GlowFilterSettingsSchema, glowConfig } from "./glowConfig";

export const OrganismUIConfigSchema = z.object({
  initialHp: z.number(),
  defaultBaseScale: z.number(),
  initialBreakpoint: z.number(),
  debugHealth: z.boolean(),
  selectEvent: z.string(),
  hoverGlow: GlowFilterSettingsSchema,
  hintGlow: GlowFilterSettingsSchema.extend({
    defaultDuration: z.number(),
  }),
  nameText: z.object({
    offsetY: z.number(),
    fontFamily: z.string(),
    fontSize: z.string(),
    color: z.string().meta({ input: "color" }),
    align: z.string(),
    origin: z.number(),
  }),
  scaleTween: z.object({
    sensitivity: z.number(),
    minHealthRatio: z.number(),
    duration: z.number(),
    ease: z.string(),
  }),
  duplicates: z.object({
    scaleMultiplier: z.number(),
    breakpointFactor: z.number(),
    radiusRatio: z.number(),
    maxRadius: z.number(),
    startAngleDeg: z.number(),
    arcSpanDeg: z.number(),
  }),
  debugText: z.object({
    offsetY: z.number(),
    fontFamily: z.string(),
    fontSize: z.string(),
    color: z.string().meta({ input: "color" }),
    backgroundColor: z.string().meta({ input: "color" }),
    padding: z.object({
      x: z.number(),
      y: z.number(),
    }),
    align: z.string(),
    originX: z.number(),
    originY: z.number(),
    depth: z.number(),
  }),
});

export type OrganismUIConfig = z.infer<typeof OrganismUIConfigSchema>;

export const organismUIConfig: OrganismUIConfig = {
  initialHp: 100,
  defaultBaseScale: 1,
  initialBreakpoint: 10,
  debugHealth: false,
  selectEvent: "organismSelected",
  hoverGlow: {
    color: glowConfig.whiteGlow,
    outerStrength: 5,
    innerStrength: 0,
    scale: 1,
    knockout: false,
    quality: 10,
    distance: 10,
  },
  hintGlow: {
    color: 0xffff00,
    outerStrength: 5,
    innerStrength: 0,
    scale: 1,
    knockout: false,
    quality: 10,
    distance: 10,
    defaultDuration: 2000,
  },
  nameText: {
    offsetY: 20,
    fontFamily: "monospace",
    fontSize: "18px",
    color: "#000000",
    align: "center",
    origin: 0.5,
  },
  scaleTween: {
    sensitivity: 0.5,
    minHealthRatio: 0.1,
    duration: 500,
    ease: "Sine.easeInOut",
  },
  duplicates: {
    scaleMultiplier: 0.5,
    breakpointFactor: 2,
    radiusRatio: 0.65,
    maxRadius: 100,
    startAngleDeg: 170,
    arcSpanDeg: 200,
  },
  debugText: {
    offsetY: 20,
    fontFamily: "monospace",
    fontSize: "14px",
    color: "#1605fa",
    backgroundColor: "#ffffff",
    padding: { x: 6, y: 4 },
    align: "left",
    originX: 0.5,
    originY: 1,
    depth: 1000,
  },
};
