import React, { useState } from 'react';
import { Clock, Eye, Sliders, CheckSquare, Square } from 'lucide-react';
import { HourlyForecastItem } from '../types/weather';

interface HourlyForecastChartProps {
  hourly: HourlyForecastItem[];
  isDarkMode: boolean;
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  hourly,
  isDarkMode
}) => {
  const [showTemp, setShowTemp] = useState(true);
  const [showDew, setShowDew] = useState(true);
  const [showPrecip, setShowPrecip] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showGust, setShowGust] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  const chartWidth = 900;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const validItems = hourly.slice(0, 48);
  const count = validItems.length;

  // Temperature domain
  const temps = validItems.map(h => h.temperature_f);
  const dews = validItems.map(h => h.dewpoint_f || h.temperature_f - 10);
  const allT = [...temps, ...dews];
  const minTemp = Math.floor(Math.min(...(allT.length ? allT : [30])) / 5) * 5 - 5;
  const maxTemp = Math.ceil(Math.max(...(allT.length ? allT : [70])) / 5) * 5 + 5;
  const tempSpan = Math.max(maxTemp - minTemp, 1);

  // Precipitation domain 0 - 100%
  // Wind domain 0 - 40 mph
  const winds = validItems.map(h => h.wind_speed_mph);
  const gusts = validItems.map(h => h.wind_gust_mph || 0);
  const maxWind = Math.max(30, ...winds, ...gusts);

  const getX = (index: number) => paddingLeft + (index * innerWidth) / Math.max(count - 1, 1);
  const getYTemp = (val: number) => paddingTop + ((maxTemp - val) / tempSpan) * innerHeight;
  const getYPrecip = (pct: number) => paddingTop + ((100 - pct) / 100) * innerHeight;
  const getYWind = (mph: number) => paddingTop + ((maxWind - mph) / maxWind) * innerHeight;

  // Paths
  const tempPoints = validItems.map((h, i) => ({ x: getX(i), y: getYTemp(h.temperature_f) }));
  const dewPoints = validItems.map((h, i) => ({ x: getX(i), y: getYTemp(h.dewpoint_f || h.temperature_f - 10) }));
  const precipPoints = validItems.map((h, i) => ({ x: getX(i), y: getYPrecip(h.precipitation_probability_pct) }));
  const windPoints = validItems.map((h, i) => ({ x: getX(i), y: getYWind(h.wind_speed_mph) }));
  const gustPoints = validItems.map((h, i) => ({ x: getX(i), y: getYWind(h.wind_gust_mph || 0) }));

  const toPath = (pts: Array<{ x: number; y: number }>) =>
    pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  const hoveredItem = hoveredIdx !== null ? validItems[hoveredIdx] : null;

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Header and Series Toggles */}
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
            <Clock size={18} color="#0066cc" />
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: textColor }}>
              48-Hour High-Resolution Hourly Forecast
            </h2>
          </div>
          <div style={{ fontSize: '11px', color: subTextColor, marginTop: '2px' }}>
            Interactive meteorological series toggles & hover diagnostics
          </div>
        </div>

        {/* Checkbox Series Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Temperature */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#ea580c', cursor: 'pointer' }}>
            <input type="checkbox" checked={showTemp} onChange={e => setShowTemp(e.target.checked)} />
            <span>Temperature</span>
          </label>

          {/* Dew Point */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}>
            <input type="checkbox" checked={showDew} onChange={e => setShowDew(e.target.checked)} />
            <span>Dew Point</span>
          </label>

          {/* Precipitation */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#10b981', cursor: 'pointer' }}>
            <input type="checkbox" checked={showPrecip} onChange={e => setShowPrecip(e.target.checked)} />
            <span>Precipitation %</span>
          </label>

          {/* Wind */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#8b5cf6', cursor: 'pointer' }}>
            <input type="checkbox" checked={showWind} onChange={e => setShowWind(e.target.checked)} />
            <span>Wind Speed</span>
          </label>

          {/* Gust */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#f59e0b', cursor: 'pointer' }}>
            <input type="checkbox" checked={showGust} onChange={e => setShowGust(e.target.checked)} />
            <span>Wind Gust</span>
          </label>
        </div>
      </div>

      {/* Main SVG Timeline Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: '240px', overflow: 'visible', cursor: 'crosshair' }}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
            const relX = mouseX - paddingLeft;
            const idx = Math.round((relX / innerWidth) * (count - 1));
            if (idx >= 0 && idx < count) {
              setHoveredIdx(idx);
            }
          }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Background Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + pct * innerHeight;
            const tVal = Math.round(maxTemp - pct * tempSpan);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke={isDarkMode ? '#243a56' : '#e2e8f0'} strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 3} fill={subTextColor} fontSize="10" textAnchor="end">{tVal}°F</text>
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {validItems.map((h, i) => {
            if (i % 6 === 0 || i === count - 1) {
              const x = getX(i);
              return (
                <g key={`x-${i}`}>
                  <line x1={x} y1={paddingTop + innerHeight} x2={x} y2={paddingTop + innerHeight + 4} stroke={subTextColor} />
                  <text x={x} y={paddingTop + innerHeight + 18} fill={subTextColor} fontSize="10" textAnchor="middle">
                    {h.formatted_time}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Precipitation bars/area */}
          {showPrecip && (
            <path
              d={`${toPath(precipPoints)} L ${getX(count - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`}
              fill={isDarkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.18)'}
            />
          )}

          {/* Dew Point Line */}
          {showDew && (
            <path d={toPath(dewPoints)} fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="4,2" />
          )}

          {/* Wind Speed Line */}
          {showWind && (
            <path d={toPath(windPoints)} fill="none" stroke="#8b5cf6" strokeWidth="1.8" />
          )}

          {/* Wind Gust Line */}
          {showGust && (
            <path d={toPath(gustPoints)} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" />
          )}

          {/* Temperature Line (Thick) */}
          {showTemp && (
            <path d={toPath(tempPoints)} fill="none" stroke="#ea580c" strokeWidth="3" />
          )}

          {/* Hover Crosshair & Indicator */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={getX(hoveredIdx)}
                y1={paddingTop}
                x2={getX(hoveredIdx)}
                y2={paddingTop + innerHeight}
                stroke="#0066cc"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              {showTemp && (
                <circle cx={getX(hoveredIdx)} cy={getYTemp(validItems[hoveredIdx].temperature_f)} r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
              )}
            </g>
          )}
        </svg>

        {/* Hover Diagnostic Tooltip */}
        {hoveredItem && hoveredIdx !== null && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            backgroundColor: isDarkMode ? '#1e385c' : '#ffffff',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '12px',
            zIndex: 10,
            minWidth: '220px'
          }}>
            <div style={{ fontWeight: 800, color: textColor, borderBottom: `1px solid ${borderColor}`, paddingBottom: '4px', marginBottom: '6px' }}>
              {hoveredItem.formatted_time} • {hoveredItem.weather_condition}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <div><span style={{ color: '#ea580c', fontWeight: 700 }}>Temp: </span>{Math.round(hoveredItem.temperature_f)}°F</div>
              <div><span style={{ color: '#0284c7', fontWeight: 700 }}>Dew Pt: </span>{Math.round(hoveredItem.dewpoint_f || 0)}°F</div>
              <div><span style={{ color: '#10b981', fontWeight: 700 }}>Precip: </span>{Math.round(hoveredItem.precipitation_probability_pct)}%</div>
              <div><span style={{ color: '#8b5cf6', fontWeight: 700 }}>Wind: </span>{hoveredItem.wind_speed_mph} mph {hoveredItem.wind_direction_cardinal}</div>
              {hoveredItem.wind_gust_mph && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>Gust: </span>{hoveredItem.wind_gust_mph} mph
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
