import React, { useState } from 'react';
import { Calendar, Droplets, Wind, Snowflake, CloudRain, Flame } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';

interface MultiDayForecastSectionProps {
  forecasts: DailyForecastItem[];
  isDarkMode: boolean;
}

export const MultiDayForecastSection: React.FC<MultiDayForecastSectionProps> = ({
  forecasts,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<3 | 5 | 7>(5);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayedForecasts = forecasts.slice(0, activeTab);

  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  // Global min and max for range bar alignment
  const allMins = displayedForecasts.map(d => d.min_temp_f);
  const allMaxs = displayedForecasts.map(d => d.max_temp_f);
  const globalMin = Math.min(...(allMins.length ? allMins : [30])) - 4;
  const globalMax = Math.max(...(allMaxs.length ? allMaxs : [70])) + 4;
  const rangeSpan = Math.max(globalMax - globalMin, 1);

  // Chart coordinate calculations for Daily Min vs Max Line Chart
  const chartHeight = 130;
  const chartWidth = 700;
  const paddingX = 45;
  const paddingY = 20;

  const pointsMax = displayedForecasts.map((d, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / Math.max(displayedForecasts.length - 1, 1);
    const y = paddingY + ((globalMax - d.max_temp_f) / rangeSpan) * (chartHeight - 2 * paddingY);
    return { x, y, val: d.max_temp_f, day: d.day_name };
  });

  const pointsMin = displayedForecasts.map((d, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / Math.max(displayedForecasts.length - 1, 1);
    const y = paddingY + ((globalMax - d.min_temp_f) / rangeSpan) * (chartHeight - 2 * paddingY);
    return { x, y, val: d.min_temp_f, day: d.day_name };
  });

  const pathMax = pointsMax.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const pathMin = pointsMin.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

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
        paddingBottom: '14px',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#0066cc" />
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: textColor }}>
            Multi-Period Operational Forecast
          </h2>
          <span style={{ fontSize: '12px', color: subTextColor }}>
            (NOAA / NWS Digital Model Consensus)
          </span>
        </div>

        {/* 3-Day, 5-Day, 7-Day Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: isDarkMode ? '#1e385c' : '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`
        }}>
          {([3, 5, 7] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? '#0066cc' : 'transparent',
                color: activeTab === tab ? '#ffffff' : subTextColor,
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: activeTab === tab ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab} Days
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Line Chart: Daily Minimum vs Maximum Temperature */}
      <div style={{
        backgroundColor: itemBg,
        borderRadius: '10px',
        border: `1px solid ${borderColor}`,
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Daily Temperature Envelope: Maximum vs. Minimum Trend
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

        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '140px', overflow: 'visible' }}>
          {/* Horizontal Grid lines */}
          {[0.25, 0.5, 0.75].map((pct, idx) => {
            const y = paddingY + pct * (chartHeight - 2 * paddingY);
            const tempVal = Math.round(globalMax - pct * rangeSpan);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke={isDarkMode ? '#243a56' : '#e2e8f0'} strokeDasharray="3,3" />
                <text x={paddingX - 8} y={y + 3} fill={subTextColor} fontSize="10" textAnchor="end">{tempVal}°</text>
              </g>
            );
          })}

          {/* Lines */}
          <path d={pathMax} fill="none" stroke="#ea580c" strokeWidth="2.5" />
          <path d={pathMin} fill="none" stroke="#0284c7" strokeWidth="2.5" />

          {/* Dots & Labels */}
          {pointsMax.map((p, i) => (
            <g key={`max-${i}`}>
              <circle cx={p.x} cy={p.y} r="4.5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
              <text x={p.x} y={p.y - 8} fill="#ea580c" fontSize="11" fontWeight="700" textAnchor="middle">{Math.round(p.val)}°</text>
              <text x={p.x} y={chartHeight - 4} fill={subTextColor} fontSize="10" textAnchor="middle">{p.day.slice(0, 3)}</text>
            </g>
          ))}

          {pointsMin.map((p, i) => (
            <g key={`min-${i}`}>
              <circle cx={p.x} cy={p.y} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              <text x={p.x} y={p.y + 14} fill="#0284c7" fontSize="11" fontWeight="700" textAnchor="middle">{Math.round(p.val)}°</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Temperature Range Bar Cards (as explicitly requested: Low 31°F ───────── High 44°F) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                gridTemplateColumns: '130px 180px 1fr 180px',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Day & Date */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: textColor }}>
                  {d.day_name}
                </div>
                <div style={{ fontSize: '11px', color: subTextColor }}>
                  {d.date}
                </div>
              </div>

              {/* Weather Condition & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {d.weather_icon ? (
                  <img src={d.weather_icon} alt={d.weather_condition} style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                ) : (
                  <CloudRain size={20} color="#0066cc" />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isDarkMode ? '#223853' : '#e0f2fe', padding: '3px 7px', borderRadius: '4px' }}>
                  <Flame size={12} color="#0066cc" />
                  <span style={{ color: '#0066cc', fontWeight: 700 }}>{d.hdd} HDD</span>
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
