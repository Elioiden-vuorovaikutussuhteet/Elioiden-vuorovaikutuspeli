declare const __BUILD_DATE__: string;

interface Window {
  __BUILD_DATE__: string;
  spawnRandomEvent?: () => void;
  deleteOne?: (id: string) => void;
  lightning?: () => void;
}