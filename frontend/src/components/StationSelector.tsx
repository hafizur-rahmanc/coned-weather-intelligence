import React from 'react';
import { MapPin, Columns, Check, Radio } from 'lucide-react';
import { StationInfo } from '../types/weather';

interface StationSelectorProps {
  stations: StationInfo[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  isCompareMode: boolean;
  onToggleCompareMode: (compare: boolean) => void;
  isDarkMode: boolean;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  isCompareMode,
  onToggleCompareMode,
  isDarkMode
}) => {
  return (
    <div style={{
      backgroundColor: isDarkMode ? '#132338' : '#ffffff',
      borderRadius: '10px',
      padding: '12px 18px',
      border: `1px solid ${isDarkMode ? '#203957' : '#e2e8f0'}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px'
    }}>
      {/* Left: Territory Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          backgroundColor: isDarkMode ? '#1e385c' : '#eff6ff',
          color: '#0066cc',
          padding: '6px 10px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          fontSize: '12px'
        }}>
          <MapPin size={15} />
          <span>Service Territory Observation Station</span>
        </div>
        <span style={{ fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
          Select official NOAA/NWS observation point:
        </span>
      </div>

      {/* Right: Station Pills & Compare Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {stations.map(st => {
          const isSelected = !isCompareMode && selectedStationId === st.id;
          return (
            <button
              key={st.id}
              onClick={() => {
                onToggleCompareMode(false);
                onSelectStation(st.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: isSelected
                  ? '2px solid #0066cc'
                  : `1px solid ${isDarkMode ? '#2d4464' : '#cbd5e1'}`,
                backgroundColor: isSelected
                  ? (isDarkMode ? '#1e3a63' : '#e0f2fe')
                  : (isDarkMode ? '#1a2e48' : '#f8fafc'),
                color: isSelected
                  ? '#0066cc'
                  : (isDarkMode ? '#e2e8f0' : '#334155'),
                fontWeight: isSelected ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                backgroundColor: isSelected ? '#0066cc' : (isDarkMode ? '#334155' : '#94a3b8'),
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                {st.id}
              </span>
              <span>{st.name}</span>
              {isSelected && <Check size={14} color="#0066cc" />}
            </button>
          );
        })}

        {/* Side-by-Side Compare Button */}
        <button
          onClick={() => onToggleCompareMode(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: isCompareMode
              ? '2px solid #7c3aed'
              : `1px solid ${isDarkMode ? '#2d4464' : '#cbd5e1'}`,
            backgroundColor: isCompareMode
              ? (isDarkMode ? '#2e1f4d' : '#f5f3ff')
              : (isDarkMode ? '#1a2e48' : '#f8fafc'),
            color: isCompareMode
              ? '#7c3aed'
              : (isDarkMode ? '#e2e8f0' : '#334155'),
            fontWeight: isCompareMode ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Columns size={16} color={isCompareMode ? '#7c3aed' : undefined} />
          <span>Compare Stations Side-by-Side</span>
          {isCompareMode && <Check size={14} color="#7c3aed" />}
        </button>
      </div>
    </div>
  );
};
