import { z } from "zod";

export const CameraConfigSchema = z.object({
  minZoom: z.number(),
  maxZoom: z.number(),
  zoomInFactor: z.number(),
  zoomOutFactor: z.number(),
  speed: z.number(),
});

export type CameraConfig = z.infer<typeof CameraConfigSchema>;

export const cameraConfig: CameraConfig = {
  minZoom: 0.5,
  maxZoom: 2.0,
  zoomInFactor: 1.1,
  zoomOutFactor: 0.9,
  speed: 10,
};