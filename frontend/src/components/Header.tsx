import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Sun, Moon, Settings, ShieldAlert, 
  Clock, Radio, CheckCircle2 
} from 'lucide-react';
import { ConEdisonLogo } from './ConEdisonLogo';

interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  autoRefreshMinutes: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  onRefresh,
  isLoading,
  onOpenSettings,
  isDarkMode,
  onToggleTheme,
  autoRefreshMinutes
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + " EDT");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      backgroundColor: isDarkMode ? '#0d1b2a' : '#0b2341',
      color: '#ffffff',
      borderBottom: `2px solid ${isDarkMode ? '#1f3552' : '#0066cc'}`,
      padding: '14px 24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ConEdisonLogo height={42} />
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                backgroundColor: '#f59e0b',
                color: '#000',
                padding: '2px 7px',
                borderRadius: '4px'
              }}>
                Gas Control
              </span>
              <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>
                Operations & Load Intelligence
              </span>
            </div>
            <h1 style={{
              margin: '3px 0 0 0',
              fontSize: '19px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: '#ffffff'
            }}>
              Weather & Load Intelligence Dashboard
            </h1>
          </div>
        </div>

        {/* Status, Timestamps & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Government Source Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isDarkMode ? '#15263a' : 'rgba(255,255,255,0.08)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            <Radio size={14} color="#10b981" />
            <span style={{ color: '#cbd5e1' }}>Authoritative Source:</span>
            <span style={{ fontWeight: 700, color: '#6ee7b7' }}>NOAA / NWS (api.weather.gov)</span>
          </div>

          {/* Current NY Clock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#e2e8f0',
            fontFamily: 'monospace'
          }}>
            <Clock size={14} color="#94a3b8" />
            <span>{currentTime || "12:00:00 EDT"}</span>
          </div>

          {/* Last Retrieved Timestamp */}
          {lastUpdated && (
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={12} color="#10b981" />
              <span>Synced {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          {/* Auto Refresh Badge */}
          <span style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: autoRefreshMinutes > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
            color: autoRefreshMinutes > 0 ? '#34d399' : '#94a3b8',
            border: `1px solid ${autoRefreshMinutes > 0 ? '#059669' : '#475569'}`
          }}>
            Auto-Sync: {autoRefreshMinutes > 0 ? `${autoRefreshMinutes}m` : 'Off'}
          </span>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0066cc',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'background 0.2s ease'
            }}
            title="Manual sync with NOAA/NWS API"
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '6px 9px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDarkMode ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#93c5fd" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '6px 9px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Configure Gas Ops Thresholds & HDD Base Temp"
          >
            <Settings size={15} />
            <span style={{ fontSize: '12px' }}>Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
