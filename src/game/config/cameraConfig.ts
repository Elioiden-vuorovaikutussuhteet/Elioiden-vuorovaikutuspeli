export interface CameraConfig {
  minZoom: number;
  maxZoom: number;
  zoomInFactor: number;
  zoomOutFactor: number;
  speed: number;
}

export const cameraConfig: CameraConfig = {
  minZoom: 0.5,
  maxZoom: 2.0,
  zoomInFactor: 1.1,
  zoomOutFactor: 0.9,
  speed: 10,
};