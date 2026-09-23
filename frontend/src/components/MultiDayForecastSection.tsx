import React, { useState } from 'react';
import { Calendar, Droplets, Wind, Flame, TrendingUp, Info } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';

interface MultiDayForecastSectionProps {
  forecasts: DailyForecastItem[];
  isDarkMode: boolean;
}

export type ForecastTab = 3 | 5 | 7 | 14 | 21 | 30;

export const MultiDayForecastSection: React.FC<MultiDayForecastSectionProps> = ({
  forecasts,
  isDarkMode
}) => {
  const queryDays = parseInt(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('forecastDays') || '7' : '7', 10) as ForecastTab;
  const initialTab = ([3, 5, 7, 14, 21, 30] as number[]).includes(queryDays) ? queryDays : 7;
  const [activeTab, setActiveTab] = useState<ForecastTab>(initialTab);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayedForecasts = forecasts.slice(0, activeTab);

  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  // Summary Operational Analytics for the chosen horizon
  const totalHdd = displayedForecasts.reduce((acc, d) => acc + (d.hdd || 0), 0);
  const avgHdd = displayedForecasts.length ? (totalHdd / displayedForecasts.length).toFixed(1) : "0.0";
  const allMins = displayedForecasts.map(d => d.min_temp_f);
  const allMaxs = displayedForecasts.map(d => d.max_temp_f);
  const globalMin = Math.min(...(allMins.length ? allMins : [30])) - 4;
  const globalMax = Math.max(...(allMaxs.length ? allMaxs : [70])) + 4;
  const rangeSpan = Math.max(globalMax - globalMin, 1);

  const avgMax = displayedForecasts.length ? (allMaxs.reduce((a, b) => a + b, 0) / displayedForecasts.length).toFixed(1) : "--";
  const avgMin = displayedForecasts.length ? (allMins.reduce((a, b) => a + b, 0) / displayedForecasts.length).toFixed(1) : "--";

  // Chart coordinate calculations for Daily Min vs Max Line Chart
  const chartHeight = 140;
  const chartWidth = 840;
  const paddingX = 42;
  const paddingY = 24;

  const pointsMax = displayedForecasts.map((d, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / Math.max(displayedForecasts.length - 1, 1);
    const y = paddingY + ((globalMax - d.max_temp_f) / rangeSpan) * (chartHeight - 2 * paddingY);
    return { x, y, val: d.max_temp_f, day: d.day_name, date: d.date };
  });

  const pointsMin = displayedForecasts.map((d, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / Math.max(displayedForecasts.length - 1, 1);
    const y = paddingY + ((globalMax - d.min_temp_f) / rangeSpan) * (chartHeight - 2 * paddingY);
    return { x, y, val: d.min_temp_f, day: d.day_name, date: d.date };
  });

  const pathMax = pointsMax.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const pathMin = pointsMin.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  // Determine label step for x-axis so labels never overlap
  const labelStep = activeTab <= 7 ? 1 : activeTab <= 14 ? 2 : activeTab <= 21 ? 3 : 4;

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Header and Tab Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${borderColor}`,
        paddingBottom: '16px',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="#0066cc" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: textColor }}>
                Multi-Period Operational Forecast
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0066cc',
                backgroundColor: isDarkMode ? '#1e385c' : '#e0f2fe',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Gas Control Horizon
              </span>
            </div>
            <div style={{ fontSize: '12px', color: subTextColor, marginTop: '2px' }}>
              Consensus digital guidance (Days 1–7) & NOAA CPC Sub-Seasonal Climatological Extension (Days 8–30)
            </div>
          </div>
        </div>

        {/* 3, 5, 7, 14, 21, 30 Days Tab Options */}
        <div style={{
          display: 'flex',
          backgroundColor: isDarkMode ? '#1e385c' : '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          gap: '2px'
        }}>
          {([3, 5, 7, 14, 21, 30] as const).map(tab => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  backgroundColor: isSelected ? '#0066cc' : 'transparent',
                  color: isSelected ? '#ffffff' : subTextColor,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab} Days
              </button>
            );
          })}
        </div>
      </div>

      {/* Operational Summary Strip for Selected Horizon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{
          backgroundColor: itemBg,
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Flame size={20} color="#ea580c" />
          <div>
            <div style={{ fontSize: '11px', color: subTextColor, fontWeight: 600, textTransform: 'uppercase' }}>
              {activeTab}-Day Cumulative AHDD
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: textColor }}>
              {totalHdd.toFixed(1)} AHDD
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: itemBg,
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <TrendingUp size={20} color="#0066cc" />
          <div>
            <div style={{ fontSize: '11px', color: subTextColor, fontWeight: 600, textTransform: 'uppercase' }}>
              Daily Average AHDD
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: textColor }}>
              {avgHdd} AHDD/day
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: itemBg,
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
          <div>
            <div style={{ fontSize: '11px', color: subTextColor, fontWeight: 600, textTransform: 'uppercase' }}>
              Projected Avg High
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>
              {avgMax}°F
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: itemBg,
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
          <div>
            <div style={{ fontSize: '11px', color: subTextColor, fontWeight: 600, textTransform: 'uppercase' }}>
              Projected Avg Low
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0284c7' }}>
              {avgMin}°F
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Line Chart: Daily Minimum vs Maximum Temperature Envelope */}
      <div style={{
        backgroundColor: itemBg,
        borderRadius: '10px',
        border: `1px solid ${borderColor}`,
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Daily Temperature Envelope: {activeTab}-Day Maximum vs. Minimum Trend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#ea580c', borderRadius: '50%' }}></span>
              Daily High (°F)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#0284c7', borderRadius: '50%' }}></span>
              Daily Low (°F)
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '150px', overflow: 'visible' }}>
          {/* Horizontal Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, idx) => {
            const y = paddingY + pct * (chartHeight - 2 * paddingY);
            const tempVal = Math.round(globalMax - pct * rangeSpan);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke={isDarkMode ? '#243a56' : '#e2e8f0'} strokeDasharray="3,3" />
                <text x={paddingX - 8} y={y + 3} fill={subTextColor} fontSize="10" textAnchor="end">{tempVal}°</text>
              </g>
            );
          })}

          {/* Area between Max and Min */}
          <polygon
            points={`
              ${pointsMax.map(p => `${p.x},${p.y}`).join(' ')} 
              ${pointsMin.slice().reverse().map(p => `${p.x},${p.y}`).join(' ')}
            `}
            fill={isDarkMode ? 'rgba(0, 102, 204, 0.12)' : 'rgba(0, 102, 204, 0.08)'}
          />

          {/* High and Low lines */}
          <path d={pathMax} fill="none" stroke="#ea580c" strokeWidth="2.5" />
          <path d={pathMin} fill="none" stroke="#0284c7" strokeWidth="2.5" />

          {/* High Points and Labels */}
          {pointsMax.map((p, i) => {
            const showLabel = i % labelStep === 0 || i === displayedForecasts.length - 1;
            const r = activeTab > 14 ? 3 : 4;
            return (
              <g key={`max-${i}`}>
                <circle cx={p.x} cy={p.y} r={r} fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
                {showLabel && (
                  <text x={p.x} y={p.y - 7} fill="#ea580c" fontSize={activeTab > 14 ? "9" : "11"} fontWeight="700" textAnchor="middle">
                    {Math.round(p.val)}°
                  </text>
                )}
                {showLabel && (
                  <text x={p.x} y={chartHeight - 4} fill={subTextColor} fontSize={activeTab > 14 ? "9" : "10"} textAnchor="middle">
                    {activeTab <= 7 ? p.day.slice(0, 3) : p.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Low Points and Labels */}
          {pointsMin.map((p, i) => {
            const showLabel = i % labelStep === 0 || i === displayedForecasts.length - 1;
            const r = activeTab > 14 ? 3 : 4;
            return (
              <g key={`min-${i}`}>
                <circle cx={p.x} cy={p.y} r={r} fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                {showLabel && (
                  <text x={p.x} y={p.y + 13} fill="#0284c7" fontSize={activeTab > 14 ? "9" : "11"} fontWeight="700" textAnchor="middle">
                    {Math.round(p.val)}°
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Temperature Range Bar Cards (Scrollable for extended horizons) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: activeTab > 7 ? '540px' : 'none',
        overflowY: activeTab > 7 ? 'auto' : 'visible',
        paddingRight: activeTab > 7 ? '6px' : '0'
      }}>
        {displayedForecasts.map((d, index) => {
          const leftPct = ((d.min_temp_f - globalMin) / rangeSpan) * 100;
          const widthPct = Math.max(((d.max_temp_f - d.min_temp_f) / rangeSpan) * 100, 4);

          return (
            <div
              key={d.date}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                backgroundColor: hoveredIndex === index ? (isDarkMode ? '#1e385c' : '#f0f9ff') : itemBg,
                borderRadius: '8px',
                border: `1px solid ${hoveredIndex === index ? '#0066cc' : borderColor}`,
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '140px 170px 1fr 190px',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Day & Date */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: textColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{d.day_name}</span>
                  {index >= 7 && (
                    <span style={{ fontSize: '9px', backgroundColor: isDarkMode ? '#243a56' : '#e2e8f0', color: subTextColor, padding: '1px 4px', borderRadius: '3px' }}>
                      Ext
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: subTextColor }}>
                  {d.date}
                </div>
              </div>

              {/* Weather Condition & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {d.weather_icon ? (
                  <img src={d.weather_icon} alt={d.weather_condition} style={{ width: '26px', height: '26px', borderRadius: '4px' }} />
                ) : (
                  <Info size={18} color="#0066cc" />
                )}
                <span style={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.weather_condition}
                </span>
              </div>

              {/* Visual Temperature Range Bar: Low XX°F ──── High YY°F */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', minWidth: '55px', textAlign: 'right' }}>
                  Low {Math.round(d.min_temp_f)}°F
                </span>

                <div style={{ flex: 1, height: '8px', backgroundColor: isDarkMode ? '#274164' : '#e2e8f0', borderRadius: '4px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0284c7, #f59e0b, #ea580c)',
                    borderRadius: '4px'
                  }} />
                </div>

                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c', minWidth: '60px' }}>
                  High {Math.round(d.max_temp_f)}°F
                </span>
              </div>

              {/* Operational Metrics (HDD, Precip, Wind) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', fontSize: '11px' }}>
                {/* HDD */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: (d.hdd || 0) > 15 ? (isDarkMode ? '#3b1c1c' : '#fee2e2') : (isDarkMode ? '#223853' : '#e0f2fe'),
                  padding: '3px 7px',
                  borderRadius: '4px'
                }}>
                  <Flame size={12} color={(d.hdd || 0) > 15 ? "#ef4444" : "#0066cc"} />
                  <span style={{ color: (d.hdd || 0) > 15 ? "#ef4444" : "#0066cc", fontWeight: 700 }}>
                    {d.hdd} AHDD
                  </span>
                </div>

                {/* Rain Precip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: d.precipitation_probability_pct > 30 ? '#0284c7' : subTextColor }}>
                  <Droplets size={12} />
                  <span>{Math.round(d.precipitation_probability_pct)}%</span>
                </div>

                {/* Wind */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: subTextColor }}>
                  <Wind size={12} />
                  <span>{Math.round(d.wind_speed_mph)} mph</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
