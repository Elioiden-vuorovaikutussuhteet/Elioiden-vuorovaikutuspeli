import { z } from "zod";
import {
  ArrowUIConfigSchema,
  PermanentArrowUIConfigSchema,
  arrowUIConfig,
  permanentArrowUIConfig,
} from "./arrowConfig";
import { ButtonUIConfigSchema, buttonUIConfig } from "./buttonConfig";

export * from "./arrowConfig";
export * from "./buttonConfig";

export const UIConfigSchema = z.object({
  arrows: ArrowUIConfigSchema,
  permanentArrow: PermanentArrowUIConfigSchema,
  buttons: ButtonUIConfigSchema,
});

export type UIConfig = z.infer<typeof UIConfigSchema>;

export const uiConfig: UIConfig = {
  arrows: arrowUIConfig,
  permanentArrow: permanentArrowUIConfig,
  buttons: buttonUIConfig,
};