import React, { useState } from 'react';
import { History, ArrowRight, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { HistoricalDataPoint, HistoricalVsForecast } from '../types/weather';

interface HistoricalTrendSectionProps {
  historicalData: HistoricalDataPoint[];
  comparisonData?: HistoricalDataPoint[];
  vsForecast: HistoricalVsForecast | null;
  selectedDays: number;
  onSelectDays: (days: number) => void;
  stationName: string;
  isDarkMode: boolean;
}

export const HistoricalTrendSection: React.FC<HistoricalTrendSectionProps> = ({
  historicalData,
  comparisonData,
  vsForecast,
  selectedDays,
  onSelectDays,
  stationName,
  isDarkMode
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  const chartWidth = 900;
  const chartHeight = 180;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const count = historicalData.length;
  const temps1 = historicalData.map(d => d.avg_temp_f);
  const temps2 = (comparisonData || []).map(d => d.avg_temp_f);
  const allT = [...temps1, ...temps2];

  const minTemp = Math.floor(Math.min(...(allT.length ? allT : [30])) / 5) * 5 - 5;
  const maxTemp = Math.ceil(Math.max(...(allT.length ? allT : [70])) / 5) * 5 + 5;
  const tempSpan = Math.max(maxTemp - minTemp, 1);

  const getX = (i: number) => paddingLeft + (i * innerWidth) / Math.max(count - 1, 1);
  const getY = (val: number) => paddingTop + ((maxTemp - val) / tempSpan) * innerHeight;

  const pts1 = historicalData.map((d, i) => ({ x: getX(i), y: getY(d.avg_temp_f) }));
  const pts2 = (comparisonData || []).map((d, i) => ({ x: getX(i), y: getY(d.avg_temp_f) }));

  const toPath = (pts: Array<{ x: number; y: number }>) =>
    pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Header and Period Buttons */}
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
            <History size={18} color="#0066cc" />
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: textColor }}>
              Historical Weather Trend & Anomaly Baseline
            </h2>
          </div>
          <div style={{ fontSize: '11px', color: subTextColor, marginTop: '2px' }}>
            Multi-day climatological reanalysis & comparative trajectory
          </div>
        </div>

        {/* Range Buttons: 7, 14, 30, 90 */}
        <div style={{
          display: 'flex',
          backgroundColor: isDarkMode ? '#1e385c' : '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`
        }}>
          {[7, 14, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => onSelectDays(days)}
              style={{
                backgroundColor: selectedDays === days ? '#0066cc' : 'transparent',
                color: selectedDays === days ? '#ffffff' : subTextColor,
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: selectedDays === days ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Historical vs Forecast Comparison Box (Feature 13) */}
      {vsForecast && (
        <div style={{
          backgroundColor: itemBg,
          borderRadius: '10px',
          border: `1px solid ${borderColor}`,
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Historical vs. Forecast Comparison (Recent 7-Day vs. Next 7-Day)
            </div>
            <div style={{ fontSize: '11px', color: subTextColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} color="#0066cc" />
              <span>Weather-based planning indicators; not metered gas sendout</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {/* Recent 7D Avg */}
            <div style={{ backgroundColor: cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '11px', color: subTextColor }}>Recent 7-Day Avg Temp</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: textColor, fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                {vsForecast.recent_7d_avg_temp}°F
              </div>
              <div style={{ fontSize: '10px', color: subTextColor }}>Total: {vsForecast.recent_7d_total_hdd} HDD</div>
            </div>

            {/* Next 7D Avg */}
            <div style={{ backgroundColor: cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '11px', color: subTextColor }}>Next 7-Day Forecast Avg</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0066cc', fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                {vsForecast.forecast_7d_avg_temp}°F
              </div>
              <div style={{ fontSize: '10px', color: subTextColor }}>Total: {vsForecast.forecast_7d_total_hdd} HDD</div>
            </div>

            {/* Difference / Delta */}
            <div style={{ backgroundColor: cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '11px', color: subTextColor }}>Temperature Difference (ΔT)</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: vsForecast.temp_difference < 0 ? '#0284c7' : '#ea580c',
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {vsForecast.temp_difference < 0 ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
                {vsForecast.temp_difference > 0 ? `+${vsForecast.temp_difference}` : vsForecast.temp_difference}°F
              </div>
              <div style={{ fontSize: '10px', color: subTextColor }}>
                {vsForecast.temp_difference < 0 ? 'Cooler week ahead (higher demand)' : 'Milder week ahead'}
              </div>
            </div>

            {/* HDD Difference */}
            <div style={{ backgroundColor: cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '11px', color: subTextColor }}>HDD Demand Difference</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: vsForecast.hdd_difference > 0 ? '#ea580c' : '#059669',
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: '4px'
              }}>
                {vsForecast.hdd_difference > 0 ? `+${vsForecast.hdd_difference}` : vsForecast.hdd_difference} HDD
              </div>
              <div style={{ fontSize: '10px', color: subTextColor }}>
                {vsForecast.hdd_difference > 0 ? 'Increased heating load projected' : 'Reduced heating load projected'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Trend Line Chart */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>
            Daily Mean Temperature History ({selectedDays} Days)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0066cc', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#0066cc', borderRadius: '2px' }}></span>
              {stationName}
            </span>
            {comparisonData && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed', fontWeight: 600 }}>
                <span style={{ width: '12px', height: '3px', backgroundColor: '#7c3aed', borderRadius: '2px' }}></span>
                Comparison Station
              </span>
            )}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: '180px', overflow: 'visible', cursor: 'crosshair' }}
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
          {/* Grid */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = paddingTop + pct * innerHeight;
            const tVal = Math.round(maxTemp - pct * tempSpan);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke={isDarkMode ? '#243a56' : '#e2e8f0'} strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 3} fill={subTextColor} fontSize="10" textAnchor="end">{tVal}°</text>
              </g>
            );
          })}

          {/* Curves */}
          {pts2.length > 0 && (
            <path d={toPath(pts2)} fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="3,2" />
          )}
          <path d={toPath(pts1)} fill="none" stroke="#0066cc" strokeWidth="2.5" />

          {/* X Axis Date labels */}
          {historicalData.map((d, i) => {
            const step = Math.max(Math.floor(count / 7), 1);
            if (i % step === 0 || i === count - 1) {
              const x = getX(i);
              return (
                <g key={`hx-${i}`}>
                  <line x1={x} y1={paddingTop + innerHeight} x2={x} y2={paddingTop + innerHeight + 4} stroke={subTextColor} />
                  <text x={x} y={paddingTop + innerHeight + 16} fill={subTextColor} fontSize="9" textAnchor="middle">
                    {d.date.slice(5)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Hover Crosshair */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={getX(hoveredIdx)}
                y1={paddingTop}
                x2={getX(hoveredIdx)}
                y2={paddingTop + innerHeight}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <circle
                cx={getX(hoveredIdx)}
                cy={getY(historicalData[hoveredIdx].avg_temp_f)}
                r="4.5"
                fill="#0066cc"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && historicalData[hoveredIdx] && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '20px',
            backgroundColor: isDarkMode ? '#1e385c' : '#ffffff',
            border: `1px solid ${borderColor}`,
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '11px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            <div style={{ fontWeight: 700, color: textColor }}>
              {historicalData[hoveredIdx].date}
            </div>
            <div>Avg Temp: <strong>{historicalData[hoveredIdx].avg_temp_f}°F</strong> (Min {historicalData[hoveredIdx].min_temp_f}° / Max {historicalData[hoveredIdx].max_temp_f}°)</div>
            <div>HDD: <strong>{historicalData[hoveredIdx].hdd}</strong> • Precip: {historicalData[hoveredIdx].precipitation_in} in</div>
          </div>
        )}
      </div>
    </div>
  );
};
