import {
  StationInfo, CurrentConditions, DailyForecastItem,
  HourlyForecastItem, GasIndicators, WeatherAlert,
  HistoricalDataPoint, HistoricalVsForecast,
  StationComparisonData, UserSettings
} from '../types/weather';

const API_BASE = '/api';

export async function fetchStations(): Promise<StationInfo[]> {
  const res = await fetch(`${API_BASE}/stations`);
  if (!res.ok) throw new Error("Failed to fetch weather stations");
  return res.json();
}

export async function fetchCurrentConditions(stationId: string): Promise<CurrentConditions> {
  const res = await fetch(`${API_BASE}/weather/current?station=${encodeURIComponent(stationId)}`);
  if (!res.ok) throw new Error(`Failed to fetch current conditions for ${stationId}`);
  return res.json();
}

export async function fetchDailyForecast(stationId: string, days: number = 7): Promise<DailyForecastItem[]> {
  const res = await fetch(`${API_BASE}/weather/forecast?station=${encodeURIComponent(stationId)}&days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for ${stationId}`);
  return res.json();
}

export async function fetchHourlyForecast(stationId: string, hours: number = 48): Promise<HourlyForecastItem[]> {
  const res = await fetch(`${API_BASE}/weather/hourly?station=${encodeURIComponent(stationId)}&hours=${hours}`);
  if (!res.ok) throw new Error(`Failed to fetch hourly forecast for ${stationId}`);
  return res.json();
}

export async function fetchTemperatureTrend(stationId: string): Promise<{
  station_id: string;
  station_name: string;
  now_timestamp: string;
  observed_points: Array<{ timestamp: string; time_label: string; temperature_f: number; type: string }>;
  forecast_points: Array<{ timestamp: string; time_label: string; temperature_f: number; type: string }>;
  all_points: Array<{ timestamp: string; time_label: string; temperature_f: number; type: string }>;
}> {
  const res = await fetch(`${API_BASE}/weather/trend?station=${encodeURIComponent(stationId)}`);
  if (!res.ok) throw new Error(`Failed to fetch temperature trend for ${stationId}`);
  return res.json();
}

export async function fetchGasIndicators(stationId: string): Promise<GasIndicators> {
  const res = await fetch(`${API_BASE}/weather/indicators?station=${encodeURIComponent(stationId)}`);
  if (!res.ok) throw new Error(`Failed to fetch gas indicators for ${stationId}`);
  return res.json();
}

export async function fetchHistoricalWeather(stationId: string, days: number = 7): Promise<HistoricalDataPoint[]> {
  const res = await fetch(`${API_BASE}/weather/historical?station=${encodeURIComponent(stationId)}&days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch historical weather for ${stationId}`);
  return res.json();
}

export async function fetchHistoricalVsForecast(stationId: string): Promise<HistoricalVsForecast> {
  const res = await fetch(`${API_BASE}/weather/historical-vs-forecast?station=${encodeURIComponent(stationId)}`);
  if (!res.ok) throw new Error(`Failed to fetch historical vs forecast for ${stationId}`);
  return res.json();
}

export async function fetchStationComparison(): Promise<StationComparisonData> {
  const res = await fetch(`${API_BASE}/weather/compare`);
  if (!res.ok) throw new Error("Failed to fetch station comparison");
  return res.json();
}

export async function fetchAlerts(stationId: string): Promise<WeatherAlert[]> {
  const res = await fetch(`${API_BASE}/alerts?station=${encodeURIComponent(stationId)}`);
  if (!res.ok) throw new Error(`Failed to fetch alerts for ${stationId}`);
  return res.json();
}

export async function fetchSettings(): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}
