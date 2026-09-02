import React from "react";

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

// =========================================================================
// INTERACTIVE SVG LINE & AREA CHART
// =========================================================================
interface TrendLineChartProps {
  data: DataPoint[];
  color?: string;
  secondaryColor?: string;
  height?: number;
  unit?: string;
  title?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  color = "#f59e0b",
  secondaryColor = "#38bdf8",
  height = 180,
  unit = "",
  title
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800">
        No trend data available
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const paddingX = 40;
  const paddingY = 24;
  const chartWidth = 500;
  const chartHeight = height;

  const getX = (index: number) => {
    if (data.length <= 1) return chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal;
    return chartHeight - paddingY - ((val - minVal) / (range || 1)) * (chartHeight - paddingY * 2);
  };

  // Generate SVG path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");
  const areaPath = `M ${getX(0)},${chartHeight - paddingY} L ${data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" L ")} L ${getX(data.length - 1)},${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-2">
      {title && <h4 className="text-xs font-bold text-slate-300">{title}</h4>}
      <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-xl border border-slate-800/80 p-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            const valLabel = Math.round(minVal + ratio * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.75"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={getX(i)}
                cy={getY(d.value)}
                r="3.5"
                fill={color}
                stroke="#020617"
                strokeWidth="1.5"
                className="transition-transform group-hover:scale-150"
              />
              <text
                x={getX(i)}
                y={chartHeight - 6}
                fill="#94a3b8"
                fontSize="8.5"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {d.label}
              </text>
              {/* Tooltip on hover */}
              <title>{`${d.label}: ${d.value.toLocaleString()} ${unit}`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// =========================================================================
// COMPARATIVE BAR CHART
// =========================================================================
interface BarChartProps {
  data: DataPoint[];
  color?: string;
  maxHeight?: number;
  unit?: string;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  color = "#38bdf8",
  maxHeight = 140,
  unit = ""
}) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-end gap-2 sm:gap-3 w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800/80" style={{ height: maxHeight + 60 }}>
        {data.map((item, idx) => {
          const heightPercent = Math.max(Math.round((item.value / max) * 100), 6);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-400 transition-colors font-semibold">
                {item.value.toLocaleString()}{unit}
              </span>
              <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${maxHeight}px` }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-90"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              <span className="text-[9px] text-slate-400 truncate w-full text-center font-medium">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// DONUT PERCENTAGE RING
// =========================================================================
interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  items: DonutItem[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

export const DonutChartComponent: React.FC<DonutChartProps> = ({
  items,
  centerLabel = "Total",
  centerValue = "100%",
  size = 140
}) => {
  const total = items.reduce((acc, it) => acc + it.value, 0) || 1;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="16"
          />
          {items.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (item.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{centerLabel}</span>
          <span className="text-sm font-bold font-mono text-slate-100">{centerValue}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {items.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0 font-mono">
                <span className="text-slate-400">{item.value.toLocaleString()}</span>
                <span className="text-[10px] text-amber-400 font-bold">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
