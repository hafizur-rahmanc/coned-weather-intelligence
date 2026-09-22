import React, { useState } from 'react';
import { AlertTriangle, Info, X, ChevronRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface OperationalAlertBannerProps {
  alerts: WeatherAlert[];
  stationName: string;
}

export const OperationalAlertBanner: React.FC<OperationalAlertBannerProps> = ({ alerts, stationName }) => {
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  const significantAlerts = alerts.filter(a => a.is_operational_banner || a.severity.toLowerCase() !== 'minor');

  if (significantAlerts.length === 0) {
    return (
      <div style={{
        margin: '16px auto 0 auto',
        maxWidth: '1400px',
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#059669'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={15} color="#10b981" />
          <span style={{ fontWeight: 600 }}>NOAA / NWS Weather Status:</span>
          <span>No active weather alerts, warnings, or watches for {stationName}.</span>
        </div>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>National Weather Service (OKX Upton)</span>
      </div>
    );
  }

  const primaryAlert = significantAlerts[0];
  const isWarning = primaryAlert.event.toLowerCase().includes('warning') || primaryAlert.severity.toLowerCase() === 'extreme';
  const isWatch = primaryAlert.event.toLowerCase().includes('watch');

  const bgColor = isWarning ? '#fef2f2' : (isWatch ? '#fffbeb' : '#eff6ff');
  const borderColor = isWarning ? '#f87171' : (isWatch ? '#fcd34d' : '#93c5fd');
  const textColor = isWarning ? '#991b1b' : (isWatch ? '#92400e' : '#1e40af');
  const badgeBg = isWarning ? '#dc2626' : (isWatch ? '#d97706' : '#2563eb');

  return (
    <>
      <div style={{
        margin: '16px auto 0 auto',
        maxWidth: '1400px',
        padding: '12px 18px',
        borderRadius: '8px',
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: badgeBg,
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 800,
            fontSize: '12px',
            letterSpacing: '0.5px'
          }}>
            <AlertTriangle size={15} />
            <span>OPERATIONAL WEATHER ALERT</span>
          </div>

          <div style={{ color: textColor }}>
            <span style={{ fontWeight: 800, fontSize: '14px', marginRight: '8px' }}>
              {primaryAlert.event.toUpperCase()}
            </span>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>
              Active through {new Date(primaryAlert.expires_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {primaryAlert.area_desc}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {significantAlerts.length > 1 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'rgba(0,0,0,0.08)',
              color: textColor,
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              +{significantAlerts.length - 1} more alert{significantAlerts.length > 2 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setSelectedAlert(primaryAlert)}
            style={{
              backgroundColor: badgeBg,
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.2s'
            }}
          >
            <span>Review Full NWS Advisory</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Full Alert Details Modal */}
      {selectedAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            borderTop: `6px solid ${badgeBg}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: badgeBg,
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {selectedAlert.severity} Severity
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedAlert.event}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Issued by {selectedAlert.sender_name} • Source: {selectedAlert.source}
                </p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              <div><strong>Effective:</strong> {new Date(selectedAlert.effective_time).toLocaleString()}</div>
              <div><strong>Expires:</strong> {new Date(selectedAlert.expires_time).toLocaleString()}</div>
              <div><strong>Urgency:</strong> {selectedAlert.urgency}</div>
              <div><strong>Certainty:</strong> {selectedAlert.certainty}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Affected Area:</strong> {selectedAlert.area_desc}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>Official Headline</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: 1.5, backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                {selectedAlert.headline}
              </p>
            </div>

            {selectedAlert.description && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>Detailed NWS Narrative</h4>
                <div style={{
                  fontSize: '12px',
                  color: '#334155',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {selectedAlert.description}
                </div>
              </div>
            )}

            {selectedAlert.instruction && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#047857' }}>Recommended Safety / Field Precautions</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#065f46', lineHeight: 1.5, backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  {selectedAlert.instruction}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{
                  backgroundColor: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Advisory
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
