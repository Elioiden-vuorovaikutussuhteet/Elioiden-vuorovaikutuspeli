import { useEffect, useRef } from 'react';
import { createGame } from '../game/Game';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = createGame(containerRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '90vw',
        height: '90vh',
        overflow: 'hidden',
      }}
    />
  );
}