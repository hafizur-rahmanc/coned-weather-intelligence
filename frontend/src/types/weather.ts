export interface StationInfo {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  grid_wfo: string;
  grid_x: number;
  grid_y: number;
  elevation_ft?: number;
}

export interface CurrentConditions {
  station_id: string;
  station_name: string;
  location: string;
  observation_time: string;
  data_retrieved_time: string;
  temperature_f: number;
  temperature_c: number;
  feels_like_f: number;
  dewpoint_f?: number;
  relative_humidity_pct?: number;
  wind_speed_mph?: number;
  wind_direction_deg?: number;
  wind_direction_cardinal?: string;
  wind_gust_mph?: number;
  pressure_inhg?: number;
  pressure_hpa?: number;
  precipitation_last_hour_in?: number;
  weather_condition: string;
  weather_icon?: string;
  visibility_miles?: number;
  data_source: string;
}

export interface HourlyForecastItem {
  timestamp: string;
  formatted_time: string;
  temperature_f: number;
  dewpoint_f?: number;
  relative_humidity_pct?: number;
  precipitation_probability_pct: number;
  wind_speed_mph: number;
  wind_direction_cardinal: string;
  wind_gust_mph?: number;
  weather_condition: string;
  weather_icon?: string;
  is_daytime: boolean;
}

export interface DailyForecastItem {
  date: string;
  day_name: string;
  min_temp_f: number;
  max_temp_f: number;
  avg_temp_f: number;
  hdd: number;
  precipitation_probability_pct: number;
  snow_probability_pct: number;
  wind_speed_mph: number;
  wind_direction_cardinal: string;
  weather_condition: string;
  weather_icon?: string;
  detailed_forecast?: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: string;
  urgency: string;
  certainty: string;
  area_desc: string;
  effective_time: string;
  expires_time: string;
  headline: string;
  description: string;
  instruction?: string;
  sender_name: string;
  is_operational_banner: boolean;
  source: string;
}

export interface GasIndicators {
  station_id: string;
  station_name: string;
  hdd_base_temp: number;
  daily_hdd: number;
  forecast_hdd_today: number;
  cumulative_hdd_3d: number;
  cumulative_hdd_5d: number;
  cumulative_hdd_7d: number;
  temp_change_24h: number;
  expected_temp_change_next_24h: number;
  trend_3d: string;
  trend_5d: string;
  cold_weather_level: 'Normal' | 'Elevated' | 'High' | 'Extreme';
  cold_weather_label: string;
  rapid_drop_detected: boolean;
  rapid_drop_magnitude: number;
  rapid_drop_message?: string;
  composite_weather_index: number;
  composite_weather_index_label: string;
  calculation_note: string;
}

export interface HistoricalDataPoint {
  date: string;
  avg_temp_f: number;
  min_temp_f: number;
  max_temp_f: number;
  hdd: number;
  precipitation_in: number;
  snowfall_in: number;
}

export interface HistoricalVsForecast {
  recent_7d_avg_temp: number;
  forecast_7d_avg_temp: number;
  temp_difference: number;
  recent_7d_total_hdd: number;
  forecast_7d_total_hdd: number;
  hdd_difference: number;
  recent_min_temp: number;
  forecast_min_temp: number;
  recent_max_temp: number;
  forecast_max_temp: number;
}

export interface StationComparisonData {
  timestamp: string;
  temperature_delta: number;
  hdd_delta_7d: number;
  summary: string;
  central_park: {
    station: StationInfo;
    current: CurrentConditions;
    indicators: GasIndicators;
    daily: DailyForecastItem[];
    alerts: WeatherAlert[];
  };
  white_plains: {
    station: StationInfo;
    current: CurrentConditions;
    indicators: GasIndicators;
    daily: DailyForecastItem[];
    alerts: WeatherAlert[];
  };
}

export interface UserSettings {
  hdd_base_temp: number;
  cold_threshold_elevated: number;
  cold_threshold_high: number;
  cold_threshold_extreme: number;
  rapid_drop_threshold: number;
  auto_refresh_minutes: number;
  temp_unit: string;
}
