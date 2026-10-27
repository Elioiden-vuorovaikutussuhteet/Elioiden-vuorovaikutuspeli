import Phaser from "phaser";

export interface ArrowDrawConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: number;
  thickness: number;
  lateralOffset?: number;
}

export function drawArrow(
  graphics: Phaser.GameObjects.Graphics,
  config: ArrowDrawConfig,
): void {
  const {
    x1,
    y1,
    x2,
    y2,
    color,
    thickness,
    lateralOffset = 0,
  } = config;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);

  if (length === 0) return;

	// Line unit vector
  const ux = dx / length;
  const uy = dy / length;

	// Perpendicular unit vector
  const px = -uy;
  const py = ux;

	// Apply lateral lane shift
  const sx1 = x1 + px * lateralOffset;
  const sy1 = y1 + py * lateralOffset;
  const sx2 = x2 + px * lateralOffset;
  const sy2 = y2 + py * lateralOffset;

  const headLength = 20;
  const headWidth = 15;

	// Arrowhead base vertices
  const x3 = sx2 - headLength * ux + headWidth * px;
  const y3 = sy2 - headLength * uy + headWidth * py;
  const x4 = sx2 - headLength * ux - headWidth * px;
  const y4 = sy2 - headLength * uy - headWidth * py;

  graphics.lineStyle(thickness, color);
  graphics.fillStyle(color, 1);

  graphics.lineBetween(
    sx1,
    sy1,
    sx2 - 15 * ux,
    sy2 - 15 * uy,
  );

  graphics.fillTriangle(sx2, sy2, x3, y3, x4, y4);
}