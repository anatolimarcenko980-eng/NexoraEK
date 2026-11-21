import React, { useMemo } from 'react';

interface IdenticonProps {
  seed: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic Crypto Identicon matching Hyperliquid / blockies avatar style
 * Generates an 8x8 pixel grid with black, dark grey, slate, and light pixels.
 */
export const Identicon: React.FC<IdenticonProps> = ({ seed, size = 36, className = '' }) => {
  const grid = useMemo(() => {
    // Simple fast 32-bit FNV-1a hash
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const palette = [
      '#050608', // pure dark
      '#1b1f2b', // dark slate
      '#334155', // mid slate
      '#64748b', // light slate
      '#94a3b8', // silvery
      '#cbd5e1', // bright silver
    ];

    const cells: string[] = [];
    let state = Math.abs(hash);

    // 8x8 symmetric or semi-symmetric grid
    for (let row = 0; row < 8; row++) {
      const rowColors: string[] = [];
      for (let col = 0; col < 4; col++) {
        state = (state * 1664525 + 1013904223) % 4294967296;
        const colorIdx = state % palette.length;
        rowColors.push(palette[colorIdx]);
      }
      // Mirror horizontally for authentic blockie symmetry
      for (let col = 0; col < 4; col++) {
        cells.push(rowColors[col]);
      }
      for (let col = 3; col >= 0; col--) {
        cells.push(rowColors[col]);
      }
    }
    return cells;
  }, [seed]);

  return (
    <div
      className={`rounded-full overflow-hidden border border-[#2b3345]/80 bg-[#0a0d14] flex-shrink-0 flex items-center justify-center p-[2px] ${className}`}
      style={{ width: size, height: size }}
      title={seed}
    >
      <svg
        viewBox="0 0 8 8"
        className="w-full h-full rounded-full overflow-hidden"
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      >
        {grid.map((color, idx) => {
          const x = idx % 8;
          const y = Math.floor(idx / 8);
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
};
