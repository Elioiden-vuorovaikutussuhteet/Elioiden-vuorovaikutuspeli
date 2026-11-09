export interface InteractionConfig {
  pulseWaitTime: number;
  initialBaseHealthChange: number;
  hpNormalizationDivisor: number;
}

export const interactionConfig: InteractionConfig = {
  pulseWaitTime: 1000,
  initialBaseHealthChange: 5,
  hpNormalizationDivisor: 100,
};