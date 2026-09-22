import React, { useState } from 'react';
import { Activity, Info } from 'lucide-react';

interface Point {
  timestamp: string;
  time_label: string;
  temperature_f: number;
  type: string;
}

interface TemperatureTrendChartProps {
  trendData: {
    station_id: string;
    station_name: string;
    now_timestamp: string;
    observed_points: Point[];
    forecast_points: Point[];
    all_points: Point[];
  };
  isDarkMode: boolean;
}

export const TemperatureTrendChart: React.FC<TemperatureTrendChartProps> = ({
  trendData,
  isDarkMode
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  const chartWidth = 950;
  const chartHeight = 250;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const observed = trendData.observed_points || [];
  const forecast = trendData.forecast_points || [];
  const allPoints = [...observed, ...forecast];
  const count = allPoints.length;

  if (count === 0) return null;

  const temps = allPoints.map(p => p.temperature_f);
  const minTemp = Math.floor(Math.min(...temps) / 5) * 5 - 5;
  const maxTemp = Math.ceil(Math.max(...temps) / 5) * 5 + 5;
  const tempSpan = Math.max(maxTemp - minTemp, 1);

  const highestTemp = Math.max(...temps);
  const lowestTemp = Math.min(...temps);

  const getX = (idx: number) => paddingLeft + (idx * innerWidth) / Math.max(count - 1, 1);
  const getY = (val: number) => paddingTop + ((maxTemp - val) / tempSpan) * innerHeight;

  // NOW divider position
  const nowIndex = observed.length > 0 ? observed.length - 1 : 0;
  const nowX = getX(nowIndex);

  // Observed Path
  const obsPoints = observed.map((p, i) => ({ x: getX(i), y: getY(p.temperature_f) }));
  // Bridge connecting last observed point to first forecast point
  const forePoints = forecast.map((p, i) => ({ x: getX(observed.length + i), y: getY(p.temperature_f) }));

  const toPath = (pts: Array<{ x: number; y: number }>) =>
    pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  const obsPath = obsPoints.length ? toPath(obsPoints) : '';
  const bridgePath = obsPoints.length && forePoints.length
    ? `M ${obsPoints[obsPoints.length - 1].x.toFixed(1)} ${obsPoints[obsPoints.length - 1].y.toFixed(1)} L ${forePoints[0].x.toFixed(1)} ${forePoints[0].y.toFixed(1)}`
    : '';
  const forePath = forePoints.length ? toPath(forePoints) : '';

  const hoveredPoint = hoveredIndex !== null ? allPoints[hoveredIndex] : null;

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Title & Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${borderColor}`,
        paddingBottom: '14px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#0066cc" />
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: textColor }}>
              Continuous Temperature Trend: Observed Past vs. Forecast
            </h2>
          </div>
          <div style={{ fontSize: '11px', color: subTextColor, marginTop: '2px' }}>
            Seamless historical observation replay into future model projection with operational NOW separator
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '3px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></span>
            <span style={{ color: textColor, fontWeight: 600 }}>Observed (Past 24h)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '3px', backgroundColor: '#f97316', borderTop: '2px dashed #f97316' }}></span>
            <span style={{ color: textColor, fontWeight: 600 }}>Forecast (Next 48h)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '2px', height: '14px', backgroundColor: '#dc2626' }}></span>
            <span style={{ color: '#dc2626', fontWeight: 800 }}>NOW Marker</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: '260px', overflow: 'visible', cursor: 'crosshair' }}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
            const relX = mouseX - paddingLeft;
            const idx = Math.round((relX / innerWidth) * (count - 1));
            if (idx >= 0 && idx < count) {
              setHoveredIndex(idx);
            }
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + pct * innerHeight;
            const tVal = Math.round(maxTemp - pct * tempSpan);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke={isDarkMode ? '#243a56' : '#e2e8f0'} strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 3} fill={subTextColor} fontSize="10" textAnchor="end">{tVal}°</text>
              </g>
            );
          })}

          {/* Reference Lines: Highest and Lowest in period */}
          <line
            x1={paddingLeft}
            y1={getY(highestTemp)}
            x2={chartWidth - paddingRight}
            y2={getY(highestTemp)}
            stroke="#ea580c"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          <text x={chartWidth - paddingRight + 4} y={getY(highestTemp) + 3} fill="#ea580c" fontSize="9" fontWeight="700">
            High {Math.round(highestTemp)}°
          </text>

          <line
            x1={paddingLeft}
            y1={getY(lowestTemp)}
            x2={chartWidth - paddingRight}
            y2={getY(lowestTemp)}
            stroke="#0284c7"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          <text x={chartWidth - paddingRight + 4} y={getY(lowestTemp) + 3} fill="#0284c7" fontSize="9" fontWeight="700">
            Low {Math.round(lowestTemp)}°
          </text>

          {/* Background Shading for Forecast side */}
          <rect
            x={nowX}
            y={paddingTop}
            width={chartWidth - paddingRight - nowX}
            height={innerHeight}
            fill={isDarkMode ? 'rgba(249, 115, 22, 0.04)' : 'rgba(249, 115, 22, 0.05)'}
          />

          {/* Observed Line (Solid Blue) */}
          {obsPath && <path d={obsPath} fill="none" stroke="#3b82f6" strokeWidth="3" />}

          {/* Bridge Line */}
          {bridgePath && <path d={bridgePath} fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="3,3" />}

          {/* Forecast Line (Dashed Orange) */}
          {forePath && <path d={forePath} fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="5,3" />}

          {/* Vertical NOW Marker */}
          <line
            x1={nowX}
            y1={paddingTop - 10}
            x2={nowX}
            y2={paddingTop + innerHeight + 10}
            stroke="#dc2626"
            strokeWidth="2.5"
          />
          {/* NOW Badge */}
          <rect x={nowX - 22} y={paddingTop - 24} width="44" height="18" rx="4" fill="#dc2626" />
          <text x={nowX} y={paddingTop - 11} fill="#ffffff" fontSize="10" fontWeight="800" textAnchor="middle" letterSpacing="0.5px">
            NOW
          </text>

          {/* X Axis Time Labels */}
          {allPoints.map((p, i) => {
            if (i % 8 === 0 || i === nowIndex || i === count - 1) {
              const x = getX(i);
              return (
                <g key={`x-${i}`}>
                  <line x1={x} y1={paddingTop + innerHeight} x2={x} y2={paddingTop + innerHeight + 5} stroke={subTextColor} />
                  <text x={x} y={paddingTop + innerHeight + 18} fill={i === nowIndex ? '#dc2626' : subTextColor} fontSize="9" fontWeight={i === nowIndex ? '800' : '500'} textAnchor="middle">
                    {p.time_label}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Hover Crosshair & Details */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={paddingTop + innerHeight}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(allPoints[hoveredIndex].temperature_f)}
                r="5"
                fill={allPoints[hoveredIndex].type === 'observed' ? '#3b82f6' : '#f97316'}
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Floating Card */}
        {hoveredPoint && hoveredIndex !== null && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: `${Math.min(Math.max(getX(hoveredIndex) - 70, 60), chartWidth - 180)}px`,
            backgroundColor: isDarkMode ? '#1e385c' : '#ffffff',
            border: `1px solid ${borderColor}`,
            borderRadius: '6px',
            padding: '6px 12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            fontSize: '11px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}>
            <div style={{ fontWeight: 700, color: hoveredPoint.type === 'observed' ? '#3b82f6' : '#f97316' }}>
              {hoveredPoint.type.toUpperCase()}: {hoveredPoint.temperature_f}°F
            </div>
            <div style={{ color: subTextColor, fontSize: '10px' }}>
              {hoveredPoint.time_label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
