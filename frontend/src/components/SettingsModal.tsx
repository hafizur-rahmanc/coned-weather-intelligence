import React, { useState } from 'react';
import { X, Settings, Sliders, Check, RotateCcw } from 'lucide-react';
import { UserSettings } from '../types/weather';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  isDarkMode
}) => {
  const [formData, setFormData] = useState<UserSettings>({ ...settings });

  const cardBg = isDarkMode ? '#132338' : '#ffffff';
  const borderColor = isDarkMode ? '#203957' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const inputBg = isDarkMode ? '#1a2e48' : '#f8fafc';

  const handleResetDefaults = () => {
    setFormData({
      hdd_base_temp: 65.0,
      cold_threshold_elevated: 34.0,
      cold_threshold_high: 24.0,
      cold_threshold_extreme: 14.0,
      rapid_drop_threshold: 15.0,
      auto_refresh_minutes: 5,
      temp_unit: 'F'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        maxWidth: '540px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        border: `1px solid ${borderColor}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#0066cc" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: textColor }}>
              Engineering & Operational Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* HDD Base Temp */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
              Heating Degree Days (HDD) Base Temperature (°F)
            </label>
            <div style={{ fontSize: '11px', color: subTextColor, marginBottom: '8px' }}>
              Standard utility reference is 65°F; adjust for specific district heating thresholds (e.g. 60°F or 55°F).
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[65, 62, 60, 55].map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setFormData({ ...formData, hdd_base_temp: preset })}
                  style={{
                    backgroundColor: formData.hdd_base_temp === preset ? '#0066cc' : inputBg,
                    color: formData.hdd_base_temp === preset ? '#fff' : textColor,
                    border: `1px solid ${borderColor}`,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {preset}°F
                </button>
              ))}
              <input
                type="number"
                step="0.5"
                value={formData.hdd_base_temp}
                onChange={e => setFormData({ ...formData, hdd_base_temp: parseFloat(e.target.value) || 65 })}
                style={{
                  width: '80px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Rapid Temp Drop Alert Threshold */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
              Rapid Temperature Drop Trigger (°F over 24h)
            </label>
            <div style={{ fontSize: '11px', color: subTextColor, marginBottom: '6px' }}>
              Triggers operational advisory if forecast temperature plunges by at least this amount in 24 hours.
            </div>
            <input
              type="number"
              step="1"
              value={formData.rapid_drop_threshold}
              onChange={e => setFormData({ ...formData, rapid_drop_threshold: parseFloat(e.target.value) || 15 })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                backgroundColor: inputBg,
                color: textColor,
                fontSize: '13px'
              }}
            />
          </div>

          {/* Cold Weather Indicator Thresholds */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: '6px' }}>
              Cold Weather Demand Tiers (°F Forecast Minimum)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>Elevated (&lt;)</span>
                <input
                  type="number"
                  value={formData.cold_threshold_elevated}
                  onChange={e => setFormData({ ...formData, cold_threshold_elevated: parseFloat(e.target.value) || 34 })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, marginTop: '4px' }}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>High (&lt;)</span>
                <input
                  type="number"
                  value={formData.cold_threshold_high}
                  onChange={e => setFormData({ ...formData, cold_threshold_high: parseFloat(e.target.value) || 24 })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, marginTop: '4px' }}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>Extreme (&lt;)</span>
                <input
                  type="number"
                  value={formData.cold_threshold_extreme}
                  onChange={e => setFormData({ ...formData, cold_threshold_extreme: parseFloat(e.target.value) || 14 })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Auto Refresh Interval */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
              NOAA / NWS Data Auto-Sync Interval
            </label>
            <select
              value={formData.auto_refresh_minutes}
              onChange={e => setFormData({ ...formData, auto_refresh_minutes: parseInt(e.target.value, 10) })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                backgroundColor: inputBg,
                color: textColor,
                fontSize: '13px'
              }}
            >
              <option value={0}>Manual Refresh Only (Off)</option>
              <option value={2}>Every 2 Minutes</option>
              <option value={5}>Every 5 Minutes (Recommended)</option>
              <option value={10}>Every 10 Minutes</option>
              <option value={15}>Every 15 Minutes</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                border: `1px solid ${borderColor}`,
                color: subTextColor,
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  backgroundColor: '#0066cc',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={14} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
