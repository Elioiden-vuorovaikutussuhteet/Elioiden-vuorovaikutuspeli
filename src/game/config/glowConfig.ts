export interface GlowConfig {
  positiveGlow: number,
  negativeGlow: number,
  whiteGlow: number,
  outerOuterStrength: number,
  innerOuterStrength: number,
  outerDuration: number,
  innerDuration: number,
  loop: number,
  ease: string,
}

export const glowConfig: GlowConfig = {
  positiveGlow: 0x04b504,
  negativeGlow: 0xb83232,
  whiteGlow: 0xffffff,
  outerOuterStrength: 30,
  innerOuterStrength: 3,
  outerDuration: 400,
  innerDuration: 300,
  loop: 0,
  ease: "Sine.inOut",
}
