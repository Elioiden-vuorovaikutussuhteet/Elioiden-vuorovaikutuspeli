export interface EmitterVariantConfig {
  texture: string;
  tint: number;
  speedY: { min: number; max: number };
}

export interface ParticleConfig {
  emitLine: { x1: number; y1: number; x2: number; y2: number };
  emitZoneQuantity: number;
  speedX: number;
  scale: { start: number; end: number };
  alpha: { start: number; end: number };
  lifespan: number;
  quantity: number;
  explodeCount: number;
  depth: number;
  positive: EmitterVariantConfig;
  negative: EmitterVariantConfig;
}

export const particleConfig: ParticleConfig = {
  emitLine: { x1: -50, y1: 0, x2: 50, y2: 0 },
  emitZoneQuantity: 4,
  speedX: 0,
  scale: { start: 0.05, end: 0 },
  alpha: { start: 1, end: 0 },
  lifespan: 1500,
  quantity: 1,
  explodeCount: 4,
  depth: 1000,
  positive: {
    texture: "pos_particle",
    tint: 0x48ab1d,
    speedY: { min: -180, max: -80 },
  },
  negative: {
    texture: "neg_particle",
    tint: 0x8f1c00,
    speedY: { min: 80, max: 180 },
  },
};