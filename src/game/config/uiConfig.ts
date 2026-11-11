import { z } from "zod";

export const ArrowUIConfigSchema = z.object({
  positiveColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  negativeColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  permanentThickness: z.number(),
  previewThickness: z.number(),
  bidirectionalOffset: z.number(),
});

export type ArrowUIConfig = z.infer<typeof ArrowUIConfigSchema>;

export const PermanentArrowUIConfigSchema = z.object({
  defaultTargetOffset: z.number(),
  defaultThickness: z.number(),
  defaultLateralOffset: z.number(),
  graphicsDepth: z.number(),
  hitZoneDepth: z.number(),

  hoverColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  hoverThicknessBonus: z.number(),

  hitBoxPaddingOffset: z.number(),
  hitDistanceToleranceOffset: z.number(),

  pulsePositiveColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  pulseNegativeColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  pulseRadius: z.number(),
  pulseDepth: z.number(),
  pulseAlpha: z.number(),
  pulseDuration: z.number(),

  pulseColorInsideGlow: z.number(),
  pulseColorInsideOpacity: z.number(),
  pulseColorInside: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  pulseColorGlowRadius: z.number(),
  pulseColorGlowIntensity: z.number(),
});

export type PermanentArrowUIConfig = z.infer<
  typeof PermanentArrowUIConfigSchema
>;

export const ButtonUIConfigSchema = z.object({
  arrowButtonX: z.number(),
  arrowButtonYOffset: z.number(),
});

export type ButtonUIConfig = z.infer<typeof ButtonUIConfigSchema>;

export const UIConfigSchema = z.object({
  arrows: ArrowUIConfigSchema,
  permanentArrow: PermanentArrowUIConfigSchema,
  buttons: ButtonUIConfigSchema,
});

export type UIConfig = z.infer<typeof UIConfigSchema>;

export const uiConfig: UIConfig = {
  arrows: {
    positiveColor: 0x064f15,
    negativeColor: 0xed0924,
    permanentThickness: 8,
    previewThickness: 2,
    bidirectionalOffset: 25,
  },

  permanentArrow: {
    defaultTargetOffset: 65,
    defaultThickness: 8,
    defaultLateralOffset: 0,
    graphicsDepth: 100,
    hitZoneDepth: 99,
    hoverColor: 0xffffff,
    hoverThicknessBonus: 4,
    hitBoxPaddingOffset: 6,
    hitDistanceToleranceOffset: 8,
    pulsePositiveColor: 0x04b504,
    pulseNegativeColor: 0xb83232,
    pulseRadius: 2,
    pulseDepth: 101,
    pulseAlpha: 0.8,
    pulseDuration: 1000,
    pulseColorInsideGlow: 15,
    pulseColorInsideOpacity: 0.5,
    pulseColorInside: 0xffffff,
    pulseColorGlowRadius: 16,
    pulseColorGlowIntensity: 1,
  },

  buttons: {
    arrowButtonX: 60,
    arrowButtonYOffset: 50,
  },
};

export const arrowUIConfig = uiConfig.arrows;
export const permanentArrowUIConfig = uiConfig.permanentArrow;
export const buttonUIConfig = uiConfig.buttons;