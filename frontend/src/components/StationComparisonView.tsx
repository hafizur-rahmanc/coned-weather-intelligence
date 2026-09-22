import React from 'react';
import { 
  Columns, ArrowRight, Thermometer, Flame, 
  Wind, Droplets, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { StationComparisonData } from '../types/weather';

interface StationComparisonViewProps {
  data: StationComparisonData;
  isDarkMode: boolean;
}

export const StationComparisonView: React.FC<StationComparisonViewProps> = ({
  data,
  isDarkMode
}) => {
  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const itemBg = isDarkMode ? '#182d46' : '#f8fafc';

  const nyc = data.central_park;
  const hpn = data.white_plains;

  const nycToday = nyc.daily && nyc.daily.length > 0 ? nyc.daily[0] : null;
  const hpnToday = hpn.daily && hpn.daily.length > 0 ? hpn.daily[0] : null;

  const nycTomorrow = nyc.daily && nyc.daily.length > 1 ? nyc.daily[1] : null;
  const hpnTomorrow = hpn.daily && hpn.daily.length > 1 ? hpn.daily[1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Comparison Executive Summary Banner */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff',
        border: `2px solid ${isDarkMode ? '#334155' : '#bfdbfe'}`,
        borderRadius: '12px',
        padding: '18px 22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Columns size={20} color="#0066cc" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: textColor }}>
            Side-by-Side Regional Comparison: Central Park vs. White Plains
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: textColor, lineHeight: 1.5 }}>
          {data.summary}
        </p>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Central Park Column */}
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '12px',
          border: `2px solid ${borderColor}`,
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          {/* Header */}
          <div style={{ borderBottom: `2px solid #0066cc`, paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: '#0066cc',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              KNYC
            </span>
            <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', fontWeight: 800, color: textColor }}>
              {nyc.station.name}
            </h3>
            <div style={{ fontSize: '12px', color: subTextColor }}>
              {nyc.station.location} • Grid OKX/34,45
            </div>
          </div>

          {/* Current Temp */}
          <div style={{
            backgroundColor: itemBg,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: subTextColor, fontWeight: 700 }}>Current Observation</div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: textColor, fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.round(nyc.current.temperature_f)}°F
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
                {nyc.current.weather_condition} • Feels {Math.round(nyc.current.feels_like_f)}°F
              </div>
            </div>
            {nyc.current.weather_icon && (
              <img src={nyc.current.weather_icon} alt="Icon" style={{ width: '56px', height: '56px', borderRadius: '8px' }} />
            )}
          </div>

          {/* Metrics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Today High / Low:</span>
              <strong style={{ color: textColor }}>
                {nycToday ? `${Math.round(nycToday.max_temp_f)}°F / ${Math.round(nycToday.min_temp_f)}°F` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Tomorrow High / Low:</span>
              <strong style={{ color: textColor }}>
                {nycTomorrow ? `${Math.round(nycTomorrow.max_temp_f)}°F / ${Math.round(nycTomorrow.min_temp_f)}°F` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>3-Day / 7-Day HDD:</span>
              <strong style={{ color: '#0066cc' }}>
                {nyc.indicators.cumulative_hdd_3d} / {nyc.indicators.cumulative_hdd_7d} HDD
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Wind / Gust:</span>
              <strong style={{ color: textColor }}>
                {nyc.current.wind_speed_mph} mph {nyc.current.wind_direction_cardinal} {nyc.current.wind_gust_mph ? `(Gust ${nyc.current.wind_gust_mph} mph)` : ''}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Active Weather Alerts:</span>
              <strong style={{ color: nyc.alerts.length > 0 ? '#dc2626' : '#10b981' }}>
                {nyc.alerts.length > 0 ? `${nyc.alerts.length} Active Alert(s)` : 'None'}
              </strong>
            </div>
          </div>
        </div>

        {/* White Plains Column */}
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '12px',
          border: `2px solid ${borderColor}`,
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          {/* Header */}
          <div style={{ borderBottom: `2px solid #7c3aed`, paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: '#7c3aed',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              KHPN
            </span>
            <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', fontWeight: 800, color: textColor }}>
              {hpn.station.name}
            </h3>
            <div style={{ fontSize: '12px', color: subTextColor }}>
              {hpn.station.location} • Grid OKX/39,58
            </div>
          </div>

          {/* Current Temp */}
          <div style={{
            backgroundColor: itemBg,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: subTextColor, fontWeight: 700 }}>Current Observation</div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: textColor, fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.round(hpn.current.temperature_f)}°F
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
                {hpn.current.weather_condition} • Feels {Math.round(hpn.current.feels_like_f)}°F
              </div>
            </div>
            {hpn.current.weather_icon && (
              <img src={hpn.current.weather_icon} alt="Icon" style={{ width: '56px', height: '56px', borderRadius: '8px' }} />
            )}
          </div>

          {/* Metrics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Today High / Low:</span>
              <strong style={{ color: textColor }}>
                {hpnToday ? `${Math.round(hpnToday.max_temp_f)}°F / ${Math.round(hpnToday.min_temp_f)}°F` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Tomorrow High / Low:</span>
              <strong style={{ color: textColor }}>
                {hpnTomorrow ? `${Math.round(hpnTomorrow.max_temp_f)}°F / ${Math.round(hpnTomorrow.min_temp_f)}°F` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>3-Day / 7-Day HDD:</span>
              <strong style={{ color: '#7c3aed' }}>
                {hpn.indicators.cumulative_hdd_3d} / {hpn.indicators.cumulative_hdd_7d} HDD
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Wind / Gust:</span>
              <strong style={{ color: textColor }}>
                {hpn.current.wind_speed_mph} mph {hpn.current.wind_direction_cardinal} {hpn.current.wind_gust_mph ? `(Gust ${hpn.current.wind_gust_mph} mph)` : ''}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: itemBg, borderRadius: '6px' }}>
              <span style={{ color: subTextColor, fontSize: '13px' }}>Active Weather Alerts:</span>
              <strong style={{ color: hpn.alerts.length > 0 ? '#dc2626' : '#10b981' }}>
                {hpn.alerts.length > 0 ? `${hpn.alerts.length} Active Alert(s)` : 'None'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
