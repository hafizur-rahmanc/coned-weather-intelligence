import React from 'react';
import { 
  Thermometer, Droplets, Wind, Compass, Gauge, 
  Eye, CloudRain, Clock, MapPin, ShieldCheck
} from 'lucide-react';
import { CurrentConditions, StationInfo } from '../types/weather';

interface CurrentConditionsCardProps {
  conditions: CurrentConditions;
  station: StationInfo;
  isDarkMode: boolean;
}

export const CurrentConditionsCard: React.FC<CurrentConditionsCardProps> = ({
  conditions,
  station,
  isDarkMode
}) => {
  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridItemBg = isDarkMode ? '#182d46' : '#f8fafc';

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      padding: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Top Station Meta */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${borderColor}`,
        paddingBottom: '12px',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            backgroundColor: '#0066cc',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {station.id}
          </span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: textColor }}>
            {station.name}
          </span>
          <span style={{ fontSize: '12px', color: subTextColor }}>
            ({station.location} • Grid {station.grid_wfo}/{station.grid_x},{station.grid_y})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: subTextColor, flexWrap: 'wrap' }}>
          <Clock size={13} />
          <span>Observed: {new Date(conditions.observation_time).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' })} EDT</span>
          <span style={{ margin: '0 4px' }}>•</span>
          <ShieldCheck size={13} color="#10b981" />
          <span style={{ color: '#10b981', fontWeight: 600 }}>NWS Quality Verified</span>
          <span style={{
            fontSize: '11px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            backgroundColor: isDarkMode ? '#1a2e48' : '#f1f5f9',
            padding: '2px 7px',
            borderRadius: '4px',
            border: `1px solid ${borderColor}`,
            marginLeft: '4px'
          }}>
            {station.id === 'KNYC' ? 'Hourly Synoptic METAR' : 'ASOS Rapid METAR'}
          </span>
        </div>
      </div>

      {/* Main Dominant Temperature Showcase */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '22px'
      }}>
        {/* Dominant Temp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {conditions.weather_icon && (
            <img
              src={conditions.weather_icon}
              alt={conditions.weather_condition}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '12px',
                backgroundColor: isDarkMode ? '#1e385c' : '#f1f5f9',
                padding: '4px',
                border: `1px solid ${borderColor}`
              }}
            />
          )}
          <div>
            <div style={{
              fontSize: '52px',
              fontWeight: 800,
              lineHeight: 1,
              color: textColor,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '-2px'
            }}>
              {Math.round(conditions.temperature_f)}°<span style={{ fontSize: '28px', color: '#0066cc' }}>F</span>
              <span style={{ fontSize: '18px', fontWeight: 500, color: subTextColor, marginLeft: '10px' }}>
                ({conditions.temperature_c}°C)
              </span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              color: textColor,
              marginTop: '4px'
            }}>
              {conditions.weather_condition}
            </div>
          </div>
        </div>

        {/* Feels-like Callout Box */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e385c' : '#f0f9ff',
          border: `1px solid ${isDarkMode ? '#2d5080' : '#bae6fd'}`,
          borderRadius: '10px',
          padding: '12px 20px',
          minWidth: '180px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', color: '#0284c7' }}>
            Feels Like
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#0369a1',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {Math.round(conditions.feels_like_f)}°F
          </div>
          <div style={{ fontSize: '11px', color: subTextColor }}>
            Wind chill & heat index adjusted
          </div>
        </div>
      </div>

      {/* Grid of Meteorological Engineering Readings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {/* Dew Point */}
        <div style={{ backgroundColor: gridItemBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor, fontWeight: 600 }}>
            <Thermometer size={14} color="#0066cc" />
            <span>Dew Point</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginTop: '4px' }}>
            {conditions.dewpoint_f !== null && conditions.dewpoint_f !== undefined ? `${Math.round(conditions.dewpoint_f)}°F` : '--'}
          </div>
          <div style={{ fontSize: '10px', color: subTextColor }}>Moisture boundary</div>
        </div>

        {/* Humidity */}
        <div style={{ backgroundColor: gridItemBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor, fontWeight: 600 }}>
            <Droplets size={14} color="#0284c7" />
            <span>Relative Humidity</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginTop: '4px' }}>
            {conditions.relative_humidity_pct !== null && conditions.relative_humidity_pct !== undefined ? `${Math.round(conditions.relative_humidity_pct)}%` : '--'}
          </div>
          <div style={{ fontSize: '10px', color: subTextColor }}>Ambient vapor</div>
        </div>

        {/* Wind */}
        <div style={{ backgroundColor: gridItemBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor, fontWeight: 600 }}>
            <Wind size={14} color="#64748b" />
            <span>Wind Speed</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginTop: '4px' }}>
            {conditions.wind_speed_mph || 0} mph
          </div>
          <div style={{ fontSize: '10px', color: subTextColor }}>
            {conditions.wind_direction_cardinal || 'Calm'} ({conditions.wind_direction_deg || 0}°)
          </div>
        </div>

        {/* Wind Gust */}
        <div style={{ backgroundColor: gridItemBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor, fontWeight: 600 }}>
            <Compass size={14} color="#f59e0b" />
            <span>Peak Gust</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: conditions.wind_gust_mph ? '#d97706' : textColor, marginTop: '4px' }}>
            {conditions.wind_gust_mph ? `${Math.round(conditions.wind_gust_mph)} mph` : 'None'}
          </div>
          <div style={{ fontSize: '10px', color: subTextColor }}>Structural/draft factor</div>
        </div>

        {/* Barometric Pressure */}
        <div style={{ backgroundColor: gridItemBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor, fontWeight: 600 }}>
            <Gauge size={14} color="#7c3aed" />
            <span>Pressure</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginTop: '4px' }}>
            {conditions.pressure_inhg || '--'} inHg
          </div>
          <div style={{ fontSize: '10px', color: subTextColor }}>{conditions.pressure_hpa || '--'} hPa</div>
        </div>

        {/* Visibility */}
        <div style={{ backgroundColor: gridItemBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor, fontWeight: 600 }}>
            <Eye size={14} color="#10b981" />
            <span>Visibility</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginTop: '4px' }}>
            {conditions.visibility_miles !== null && conditions.visibility_miles !== undefined ? `${conditions.visibility_miles} mi` : '--'}
          </div>
          <div style={{ fontSize: '10px', color: subTextColor }}>Optical range</div>
        </div>
      </div>
    </div>
  );
};
