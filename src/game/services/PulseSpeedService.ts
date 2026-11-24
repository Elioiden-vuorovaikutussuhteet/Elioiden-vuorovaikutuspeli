import {
  pulseSpeedMultipliers
} from "../config/pulseSpeedConfig";

export type PulseSpeed = "slow" | "normal" | "fast";

const PULSE_SPEED_MULTIPLIERS: Record<PulseSpeed, number> = {
  slow: pulseSpeedMultipliers.slow,
  normal: pulseSpeedMultipliers.normal,
  fast: pulseSpeedMultipliers.fast,
};

let currentSpeed: PulseSpeed = "normal";

export function setPulseSpeed(speed: PulseSpeed): void {
  currentSpeed = speed;
}

export function getPulseSpeed(): PulseSpeed {
  return currentSpeed;
}

export function getPulseSpeedMultiplier(): number {
  return PULSE_SPEED_MULTIPLIERS[currentSpeed];
}