export interface ForceLayoutConfig {
  linkDistance: number;
  linkStrength: number;
  chargeStrength: number;
  chargeDistanceMax: number;
  collideRadius: number;
  collideStrength: number;
  centerX: number;
  centerY: number;
  centerStrength: number;
  alphaDecay: number;
  reheatAlpha: number;
  worldWidth: number;
  worldHeight: number;
  padding: number;
  arrowTargetOffset: number;
  distanceMax: number;
}

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