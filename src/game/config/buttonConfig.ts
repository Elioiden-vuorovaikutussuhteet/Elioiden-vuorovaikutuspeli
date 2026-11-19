import { z } from "zod";

export const ButtonUIConfigSchema = z.object({
  arrowButtonX: z.number(),
  arrowButtonYOffset: z.number(),
});

export { ButtonUIConfigSchema as ButtonLayoutUIConfigSchema };

export type ButtonUIConfig = z.infer<typeof ButtonUIConfigSchema>;

export const buttonUIConfig: ButtonUIConfig = {
  arrowButtonX: 60,
  arrowButtonYOffset: 50,
};

export const SpriteButtonBaseSchema = z.object({
  scale: z.number(),
  hoverAlpha: z.number(),
  defaultAlpha: z.number(),
  clickEvent: z.string(),
});

export const ArrowButtonUIConfigSchema = SpriteButtonBaseSchema.extend({
  selectedAlpha: z.number(),
});

export type ArrowButtonUIConfig = z.infer<typeof ArrowButtonUIConfigSchema>;

export const arrowButtonUIConfig: ArrowButtonUIConfig = {
  scale: 0.1,
  hoverAlpha: 0.8,
  selectedAlpha: 0.8,
  defaultAlpha: 1,
  clickEvent: "arrowButtonClicked",
};

export const CursorButtonUIConfigSchema = SpriteButtonBaseSchema;

export type CursorButtonUIConfig = z.infer<typeof CursorButtonUIConfigSchema>;

export const cursorButtonUIConfig: CursorButtonUIConfig = {
  scale: 0.05,
  hoverAlpha: 0.8,
  defaultAlpha: 1,
  clickEvent: "cursorButtonClicked",
};

export const InfoButtonUIConfigSchema = SpriteButtonBaseSchema.extend({
  texture: z.string(),
  hoverTint: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
});

export type InfoButtonUIConfig = z.infer<typeof InfoButtonUIConfigSchema>;

export const infoButtonUIConfig: InfoButtonUIConfig = {
  texture: "infobutton_sprite",
  scale: 0.05,
  hoverAlpha: 0.8,
  defaultAlpha: 1,
  hoverTint: 0x777777,
  clickEvent: "infoButtonClicked",
};

export const BaseButtonBoxStyleSchema = z.object({
  cornerRadius: z.number(),
  backgroundColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  defaultAlpha: z.number(),
  hoverAlpha: z.number(),
  borderColor: z.number().int().min(0).max(0xffffff).meta({ input: "color" }),
  borderAlpha: z.number(),
  fontFamily: z.string(),
  fontSize: z.string(),
  textColor: z.string().meta({ input: "color" }),
});

export type BaseButtonBoxStyle = z.infer<typeof BaseButtonBoxStyleSchema>;

export const defaultButtonBoxStyle: BaseButtonBoxStyle = {
  cornerRadius: 10,
  backgroundColor: 0x000000,
  defaultAlpha: 0.7,
  hoverAlpha: 0.9,
  borderColor: 0xffffff,
  borderAlpha: 1,
  fontFamily: "monospace",
  fontSize: "15px",
  textColor: "#ffffff",
};

export const CloseButtonUIConfigSchema = BaseButtonBoxStyleSchema.extend({
  defaultLabel: z.string(),
  width: z.number(),
  height: z.number(),
  borderWidth: z.number(),
  fontStyle: z.string(),
  hoverTextColor: z.string().meta({ input: "color" }),
  textOrigin: z.number(),
  clickEvent: z.string(),
});

export type CloseButtonUIConfig = z.infer<typeof CloseButtonUIConfigSchema>;

export const closeButtonUIConfig: CloseButtonUIConfig = {
  ...defaultButtonBoxStyle,
  defaultLabel: "Close",
  width: 90,
  height: 32,
  borderWidth: 2,
  fontStyle: "bold",
  hoverTextColor: "#cccccc",
  textOrigin: 0.5,
  clickEvent: "closeButtonClicked",
};

export const HintButtonUIConfigSchema = BaseButtonBoxStyleSchema.extend({
  width: z.number(),
  height: z.number(),
  borderWidth: z.number(),
  label: z.string(),
  coinTexture: z.string(),
  coinScale: z.number(),
  gap: z.number(),
  fallbackTextWidth: z.number(),
  fallbackCoinWidth: z.number(),
  clickEvent: z.string(),
});

export type HintButtonUIConfig = z.infer<typeof HintButtonUIConfigSchema>;

export const hintButtonUIConfig: HintButtonUIConfig = {
  ...defaultButtonBoxStyle,
  width: 130,
  height: 36,
  borderWidth: 3,
  label: "Hint 100",
  coinTexture: "coin",
  coinScale: 0.4,
  gap: 6,
  fallbackTextWidth: 72,
  fallbackCoinWidth: 19,
  clickEvent: "hintButtonClicked",
};