import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { OperationalAlertBanner } from './components/OperationalAlertBanner';
import { StationSelector } from './components/StationSelector';
import { CurrentConditionsCard } from './components/CurrentConditionsCard';
import { GasOperationsIndicatorsCard } from './components/GasOperationsIndicatorsCard';
import { MultiDayForecastSection } from './components/MultiDayForecastSection';
import { HourlyForecastChart } from './components/HourlyForecastChart';
import { TemperatureTrendChart } from './components/TemperatureTrendChart';
import { HistoricalTrendSection } from './components/HistoricalTrendSection';
import { StationComparisonView } from './components/StationComparisonView';
import { SettingsModal } from './components/SettingsModal';
import { 
  StationInfo, CurrentConditions, DailyForecastItem,
  HourlyForecastItem, GasIndicators, WeatherAlert,
  HistoricalDataPoint, HistoricalVsForecast,
  StationComparisonData, UserSettings
} from './types/weather';
import * as api from './api/weatherApi';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('coned_theme') === 'dark';
  });

  // Data states
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('KNYC');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  const [currentConditions, setCurrentConditions] = useState<CurrentConditions | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [gasIndicators, setGasIndicators] = useState<GasIndicators | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [trendData, setTrendData] = useState<any | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [historicalComparison, setHistoricalComparison] = useState<HistoricalDataPoint[]>([]);
  const [vsForecast, setVsForecast] = useState<HistoricalVsForecast | null>(null);
  const [historicalDays, setHistoricalDays] = useState<number>(7);
  const [comparisonData, setComparisonData] = useState<StationComparisonData | null>(null);

  // Settings
  const [settings, setSettings] = useState<UserSettings>({
    hdd_base_temp: 62.0,
    cold_threshold_elevated: 34.0,
    cold_threshold_high: 24.0,
    cold_threshold_extreme: 14.0,
    rapid_drop_threshold: 15.0,
    auto_refresh_minutes: 5,
    temp_unit: 'F'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('coned_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [stList, setts] = await Promise.all([
          api.fetchStations(),
          api.fetchSettings()
        ]);
        setStations(stList);
        setSettings(setts);
      } catch (err: any) {
        console.error("Init failed:", err);
      }
    }
    init();
  }, []);

  // Fetch data for selected station or comparison
  const loadWeatherData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (isCompareMode) {
        const comp = await api.fetchStationComparison();
        setComparisonData(comp);
      } else {
        const otherId = selectedStationId === 'KNYC' ? 'KHPN' : 'KNYC';
        const [
          curr,
          daily,
          hourly,
          ind,
          alrts,
          trnd,
          hist,
          histComp,
          vsFore
        ] = await Promise.all([
          api.fetchCurrentConditions(selectedStationId),
          api.fetchDailyForecast(selectedStationId, 30),
          api.fetchHourlyForecast(selectedStationId, 48),
          api.fetchGasIndicators(selectedStationId),
          api.fetchAlerts(selectedStationId),
          api.fetchTemperatureTrend(selectedStationId),
          api.fetchHistoricalWeather(selectedStationId, historicalDays),
          api.fetchHistoricalWeather(otherId, historicalDays),
          api.fetchHistoricalVsForecast(selectedStationId)
        ]);

        setCurrentConditions(curr);
        setDailyForecast(daily);
        setHourlyForecast(hourly);
        setGasIndicators(ind);
        setAlerts(alrts);
        setTrendData(trnd);
        setHistoricalData(hist);
        setHistoricalComparison(histComp);
        setVsForecast(vsFore);
      }
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      console.error("Weather load error:", err);
      setErrorMsg(err.message || "Failed to load weather data from NOAA / NWS");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStationId, isCompareMode, historicalDays]);

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  // Auto refresh interval timer
  useEffect(() => {
    if (settings.auto_refresh_minutes <= 0) return;
    const interval = setInterval(() => {
      loadWeatherData();
    }, settings.auto_refresh_minutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.auto_refresh_minutes, loadWeatherData]);

  // Handle saving settings
  const handleSaveSettings = async (newSettings: UserSettings) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      loadWeatherData();
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const currentStation = stations.find(s => s.id === selectedStationId) || {
    id: selectedStationId,
    name: selectedStationId === 'KNYC' ? 'Central Park, New York' : 'White Plains / Westchester',
    location: selectedStationId === 'KNYC' ? 'New York City (Manhattan)' : 'Westchester County Airport',
    latitude: 40.7812,
    longitude: -73.9665,
    grid_wfo: 'OKX',
    grid_x: 34,
    grid_y: 45
  };

  const bgThemeColor = isDarkMode ? '#0a1524' : '#f1f5f9';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: bgThemeColor,
      color: textColor,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      transition: 'background 0.2s ease, color 0.2s ease'
    }}>
      {/* Header */}
      <Header
        lastUpdated={lastUpdated}
        onRefresh={loadWeatherData}
        isLoading={isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        autoRefreshMinutes={settings.auto_refresh_minutes}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Error Alert if any */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '8px',
            padding: '12px 18px',
            color: '#991b1b',
            fontSize: '13px',
            fontWeight: 600
          }}>
            Connection Error: {errorMsg}. Utilizing local high-fidelity meteorological cache.
          </div>
        )}

        {/* Operational Alert Banner (Feature 16 & 17) */}
        {!isCompareMode && (
          <OperationalAlertBanner alerts={alerts} stationName={currentStation.name} />
        )}

        {/* Station Selector Bar (Feature 4) */}
        <StationSelector
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={id => setSelectedStationId(id)}
          isCompareMode={isCompareMode}
          onToggleCompareMode={comp => setIsCompareMode(comp)}
          isDarkMode={isDarkMode}
        />

        {/* Compare Mode View (Feature 14) */}
        {isCompareMode && comparisonData && (
          <StationComparisonView data={comparisonData} isDarkMode={isDarkMode} />
        )}

        {/* Single Station View */}
        {!isCompareMode && (
          <>
            {/* Top Grid: Current Conditions (Left) & Gas Ops Indicators (Right) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '20px'
            }}>
              {currentConditions && (
                <CurrentConditionsCard
                  conditions={currentConditions}
                  station={currentStation}
                  isDarkMode={isDarkMode}
                />
              )}

              {gasIndicators && (
                <GasOperationsIndicatorsCard
                  indicators={gasIndicators}
                  isDarkMode={isDarkMode}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              )}
            </div>

            {/* Continuous Temperature Trend with NOW divider (Feature 11) */}
            {trendData && (
              <TemperatureTrendChart trendData={trendData} isDarkMode={isDarkMode} />
            )}

            {/* 48-Hour Hourly Forecast Chart with Series Toggles (Feature 10) */}
            {hourlyForecast.length > 0 && (
              <HourlyForecastChart hourly={hourlyForecast} isDarkMode={isDarkMode} />
            )}

            {/* Multi-Day Forecast (3d, 5d, 7d tabs) with Range Bars (Features 7, 8, 9) */}
            {dailyForecast.length > 0 && (
              <MultiDayForecastSection forecasts={dailyForecast} isDarkMode={isDarkMode} />
            )}

            {/* Historical Trend & Historical vs Forecast Comparison (Features 12, 13) */}
            {historicalData.length > 0 && (
              <HistoricalTrendSection
                historicalData={historicalData}
                comparisonData={historicalComparison}
                vsForecast={vsForecast}
                selectedDays={historicalDays}
                onSelectDays={d => setHistoricalDays(d)}
                stationName={currentStation.name}
                isDarkMode={isDarkMode}
              />
            )}
          </>
        )}
      </main>

      {/* Enterprise Engineering Footer */}
      <footer style={{
        marginTop: '40px',
        borderTop: `1px solid ${isDarkMode ? '#1e385c' : '#cbd5e1'}`,
        backgroundColor: isDarkMode ? '#0d1b2a' : '#0b2341',
        color: '#94a3b8',
        padding: '24px',
        fontSize: '12px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <strong style={{ color: '#ffffff' }}>Consolidated Edison Company of New York, Inc.</strong> — Gas Control
            <div style={{ marginTop: '2px' }}>
              Authoritative meteorological data ingested from the National Oceanic and Atmospheric Administration (NOAA) / National Weather Service (NWS) API (`api.weather.gov`).
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Operational Planning Notice: Weather-based indicators do not represent metered gas sendout or contract quantities.</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Stations: Central Park (KNYC / OKX 34,45) • White Plains (KHPN / OKX 39,58)</div>
          </div>
        </div>
      </footer>

      {/* Settings Modal (Feature 21) */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
