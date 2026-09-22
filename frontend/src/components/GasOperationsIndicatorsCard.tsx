import React from 'react';
import { 
  Flame, TrendingDown, TrendingUp, AlertTriangle, 
  ThermometerSnowflake, Activity, Info, Wind, ShieldAlert,
  CalendarDays
} from 'lucide-react';
import { GasIndicators } from '../types/weather';

interface GasOperationsIndicatorsCardProps {
  indicators: GasIndicators;
  isDarkMode: boolean;
  onOpenSettings: () => void;
}

export const GasOperationsIndicatorsCard: React.FC<GasOperationsIndicatorsCardProps> = ({
  indicators,
  isDarkMode,
  onOpenSettings
}) => {
  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  // Cold weather tier styling
  const coldTierStyles = {
    Normal: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    Elevated: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    High: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
    Extreme: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' }
  }[indicators.cold_weather_level] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Section Header with Engineering Disclaimer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${borderColor}`,
        paddingBottom: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            backgroundColor: '#f59e0b',
            color: '#000',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800
          }}>
            <Flame size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: textColor }}>
              Gas Operations Weather Indicators
            </h2>
            <div style={{ fontSize: '11px', color: subTextColor }}>
              Thermal demand translation & operational planning indices
            </div>
          </div>
        </div>

        {/* HDD Base Setting indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            backgroundColor: isDarkMode ? '#1e385c' : '#e2e8f0',
            color: isDarkMode ? '#93c5fd' : '#334155',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            HDD Base: {indicators.hdd_base_temp}°F
          </span>
          <button
            onClick={onOpenSettings}
            style={{
              fontSize: '11px',
              color: '#0066cc',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600
            }}
          >
            Adjust Base
          </button>
        </div>
      </div>

      {/* Rapid Temperature Drop Warning Banner (if detected) */}
      {indicators.rapid_drop_detected && (
        <div style={{
          backgroundColor: '#fff1f2',
          border: '2px solid #f43f5e',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 10px rgba(244, 63, 94, 0.15)'
        }}>
          <AlertTriangle size={24} color="#e11d48" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rapid Temperature Drop Alert
            </div>
            <div style={{ fontSize: '13px', color: '#be123c', fontWeight: 600 }}>
              {indicators.rapid_drop_message || `Temperature expected to decrease ${indicators.rapid_drop_magnitude}°F within 24 hours.`}
            </div>
          </div>
          <span style={{
            backgroundColor: '#e11d48',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            Operational Watch
          </span>
        </div>
      )}

      {/* Top 3 KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '18px'
      }}>
        {/* Heating Degree Days (HDD) Summary */}
        <div style={{
          backgroundColor: itemBg,
          padding: '14px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
              Heating Degree Days (HDD)
            </span>
            <ThermometerSnowflake size={16} color="#0066cc" />
          </div>
          <div style={{
            fontSize: '34px',
            fontWeight: 800,
            color: textColor,
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: '6px'
          }}>
            {indicators.daily_hdd} <span style={{ fontSize: '14px', fontWeight: 500, color: subTextColor }}>Today</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: `1px dashed ${borderColor}`,
            fontSize: '11px'
          }}>
            <div>
              <span style={{ color: subTextColor }}>3-Day: </span>
              <strong style={{ color: textColor }}>{indicators.cumulative_hdd_3d}</strong>
            </div>
            <div>
              <span style={{ color: subTextColor }}>5-Day: </span>
              <strong style={{ color: textColor }}>{indicators.cumulative_hdd_5d}</strong>
            </div>
            <div>
              <span style={{ color: subTextColor }}>7-Day: </span>
              <strong style={{ color: '#0066cc', fontWeight: 800 }}>{indicators.cumulative_hdd_7d}</strong>
            </div>
          </div>
        </div>

        {/* Temperature Deltas & Trends */}
        <div style={{
          backgroundColor: itemBg,
          padding: '14px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
              Temperature Dynamics
            </span>
            <Activity size={16} color="#7c3aed" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: subTextColor }}>Past 24h Change</div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                color: indicators.temp_change_24h < 0 ? '#0284c7' : '#ea580c',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {indicators.temp_change_24h < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                {indicators.temp_change_24h > 0 ? `+${indicators.temp_change_24h}` : indicators.temp_change_24h}°F
              </div>
            </div>

            <div style={{ borderLeft: `1px solid ${borderColor}`, paddingLeft: '14px' }}>
              <div style={{ fontSize: '11px', color: subTextColor }}>Next 24h Forecast</div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                color: indicators.expected_temp_change_next_24h < 0 ? '#0284c7' : '#ea580c',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {indicators.expected_temp_change_next_24h < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                {indicators.expected_temp_change_next_24h > 0 ? `+${indicators.expected_temp_change_next_24h}` : indicators.expected_temp_change_next_24h}°F
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: `1px dashed ${borderColor}`,
            fontSize: '11px'
          }}>
            <div>
              <span style={{ color: subTextColor }}>3-Day Trajectory: </span>
              <strong style={{ color: indicators.trend_3d === 'Cooling' ? '#0284c7' : (indicators.trend_3d === 'Warming' ? '#ea580c' : textColor) }}>
                {indicators.trend_3d === 'Cooling' ? '↓ Cooling' : (indicators.trend_3d === 'Warming' ? '↑ Warming' : '→ Stable')}
              </strong>
            </div>
            <div>
              <span style={{ color: subTextColor }}>5-Day: </span>
              <strong style={{ color: indicators.trend_5d === 'Cooling' ? '#0284c7' : (indicators.trend_5d === 'Warming' ? '#ea580c' : textColor) }}>
                {indicators.trend_5d === 'Cooling' ? '↓ Cooling' : (indicators.trend_5d === 'Warming' ? '↑ Warming' : '→ Stable')}
              </strong>
            </div>
          </div>
        </div>

        {/* Cold Weather Operational Tier */}
        <div style={{
          backgroundColor: itemBg,
          padding: '14px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
              Cold Weather Status
            </span>
            <ShieldAlert size={16} color={coldTierStyles.text} />
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: coldTierStyles.bg,
              color: coldTierStyles.text,
              border: `1px solid ${coldTierStyles.border}`,
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              {indicators.cold_weather_level.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: textColor, marginTop: '8px', fontWeight: 500 }}>
            {indicators.cold_weather_label}
          </div>

          <div style={{
            fontSize: '10px',
            color: subTextColor,
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: `1px dashed ${borderColor}`
          }}>
            Planning thresholds: Extreme (&lt;15°F), High (&lt;25°F), Elevated (&lt;35°F)
          </div>
        </div>

        {/* Weather-Based Gas Load Index (Composite Weather Index) */}
        <div style={{
          backgroundColor: itemBg,
          padding: '14px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
              Composite Weather Index (CWI)
            </span>
            <Wind size={16} color="#0284c7" />
          </div>

          <div style={{
            fontSize: '34px',
            fontWeight: 800,
            color: '#0066cc',
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: '6px'
          }}>
            {indicators.composite_weather_index}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: textColor, marginTop: '4px' }}>
            {indicators.composite_weather_index_label}
          </div>

          <div style={{
            fontSize: '10px',
            color: subTextColor,
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: `1px dashed ${borderColor}`
          }}>
            Wind-chill adjusted load proxy: HDD × (1 + wind/50)
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory & Operational Disclaimer */}
      <div style={{
        backgroundColor: isDarkMode ? '#1a2e48' : '#f8fafc',
        border: `1px solid ${isDarkMode ? '#28466b' : '#e2e8f0'}`,
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        color: subTextColor
      }}>
        <Info size={14} color="#0066cc" />
        <span>
          <strong>Operational Notice:</strong> {indicators.calculation_note}
        </span>
      </div>
    </div>
  );
};
