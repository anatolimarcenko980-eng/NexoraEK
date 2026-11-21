import React from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  isNegative?: boolean;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width = 140,
  height = 44,
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const effectiveHeight = height - paddingY * 2;

  // Compute points
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return { x, y, val };
  });

  // Build segmented paths: color dip red and rises cyan
  // We can also split into two segments or draw with an svg path
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Detect if overall performance has sharp dip
  const startVal = data[0];
  const endVal = data[data.length - 1];
  const hasNegativeDip = data.some(v => v < startVal);
  const isOverallGaining = endVal >= startVal;

  const lastPoint = points[points.length - 1];

  return (
    <div className="relative flex items-center justify-end" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkline-grad-${startVal}-${endVal}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={hasNegativeDip && !isOverallGaining ? '#ef4444' : hasNegativeDip ? '#f87171' : '#00d2ff'} />
            <stop offset="45%" stopColor={hasNegativeDip ? '#ef4444' : '#00d2ff'} />
            <stop offset="65%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>
        </defs>

        {/* Subtle base dashed reference line */}
        <line
          x1={0}
          y1={points[0].y}
          x2={width}
          y2={points[0].y}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* The Sparkline curve */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#sparkline-grad-${startVal}-${endVal})`}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End pulse dot */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill="#00d2ff"
          className="shadow-sm"
        />
      </svg>
    </div>
  );
};
