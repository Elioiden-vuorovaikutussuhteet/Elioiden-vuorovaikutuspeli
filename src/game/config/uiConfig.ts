import { z } from "zod";
import {
  ArrowUIConfigSchema,
  PermanentArrowUIConfigSchema,
  arrowUIConfig,
  permanentArrowUIConfig,
} from "./arrowConfig";
import { ButtonLayoutUIConfigSchema, buttonUIConfig } from "./buttonConfig";

export * from "./arrowConfig";
export * from "./buttonConfig";
export { ButtonLayoutUIConfigSchema as ButtonUIConfigSchema };

export const UIConfigSchema = z.object({
  arrows: ArrowUIConfigSchema,
  permanentArrow: PermanentArrowUIConfigSchema,
  buttons: ButtonLayoutUIConfigSchema,
});

export type UIConfig = z.infer<typeof UIConfigSchema>;

export const uiConfig: UIConfig = {
  arrows: arrowUIConfig,
  permanentArrow: permanentArrowUIConfig,
  buttons: buttonUIConfig,
};