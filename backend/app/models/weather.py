from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StationInfo(BaseModel):
    id: str = Field(..., description="Station ICAO or identifier, e.g., KNYC, KHPN")
    name: str = Field(..., description="Official station name")
    location: str = Field(..., description="Geographic locality, e.g. Central Park, NY")
    latitude: float
    longitude: float
    grid_wfo: str = Field("OKX", description="NWS Weather Forecast Office")
    grid_x: int
    grid_y: int
    elevation_ft: Optional[float] = None
    latest_observation_time: Optional[datetime] = None
    is_active: bool = True

class CurrentConditions(BaseModel):
    station_id: str
    station_name: str
    location: str
    observation_time: datetime
    data_retrieved_time: datetime
    temperature_f: float
    temperature_c: float
    feels_like_f: float
    dewpoint_f: Optional[float] = None
    relative_humidity_pct: Optional[float] = None
    wind_speed_mph: Optional[float] = None
    wind_direction_deg: Optional[float] = None
    wind_direction_cardinal: Optional[str] = None
    wind_gust_mph: Optional[float] = None
    pressure_inhg: Optional[float] = None
    pressure_hpa: Optional[float] = None
    precipitation_last_hour_in: Optional[float] = 0.0
    weather_condition: str = "Unknown"
    weather_icon: Optional[str] = None
    visibility_miles: Optional[float] = None
    data_source: str = "NOAA / National Weather Service (api.weather.gov)"

class HourlyForecastItem(BaseModel):
    timestamp: datetime
    formatted_time: str
    temperature_f: float
    dewpoint_f: Optional[float] = None
    relative_humidity_pct: Optional[float] = None
    precipitation_probability_pct: Optional[float] = 0.0
    wind_speed_mph: Optional[float] = 0.0
    wind_direction_cardinal: Optional[str] = "N"
    wind_gust_mph: Optional[float] = None
    weather_condition: str
    weather_icon: Optional[str] = None
    is_daytime: bool = True

class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    min_temp_f: float
    max_temp_f: float
    avg_temp_f: float
    hdd: float
    precipitation_probability_pct: float = 0.0
    snow_probability_pct: float = 0.0
    wind_speed_mph: float = 0.0
    wind_direction_cardinal: str = "N"
    weather_condition: str
    weather_icon: Optional[str] = None
    detailed_forecast: Optional[str] = None

class WeatherAlert(BaseModel):
    id: str
    event: str
    severity: str  # Extreme, Severe, Moderate, Minor, Unknown
    urgency: str
    certainty: str
    area_desc: str
    effective_time: datetime
    expires_time: datetime
    headline: str
    description: str
    instruction: Optional[str] = None
    sender_name: str
    is_operational_banner: bool = False
    source: str = "NOAA / National Weather Service"

class GasIndicators(BaseModel):
    station_id: str
    station_name: str
    hdd_base_temp: float = 62.0
    daily_hdd: float
    forecast_hdd_today: float
    cumulative_hdd_3d: float
    cumulative_hdd_5d: float
    cumulative_hdd_7d: float
    temp_change_24h: float
    expected_temp_change_next_24h: float
    trend_3d: str  # Warming, Stable, Cooling
    trend_5d: str  # Warming, Stable, Cooling
    cold_weather_level: str  # Normal, Elevated, High, Extreme
    cold_weather_label: str
    rapid_drop_detected: bool
    rapid_drop_magnitude: float
    rapid_drop_message: Optional[str] = None
    composite_weather_index: float
    composite_weather_index_label: str
    calculation_note: str = "Con Edison Gas Control: Actual Heating Degree Days (AHDD) = 62°F - Daily Mean Temperature; does not represent metered gas sendout."

class HistoricalDataPoint(BaseModel):
    date: str
    avg_temp_f: float
    min_temp_f: float
    max_temp_f: float
    hdd: float
    precipitation_in: float
    snowfall_in: float = 0.0

class HistoricalVsForecast(BaseModel):
    recent_7d_avg_temp: float
    forecast_7d_avg_temp: float
    temp_difference: float
    recent_7d_total_hdd: float
    forecast_7d_total_hdd: float
    hdd_difference: float
    recent_min_temp: float
    forecast_min_temp: float
    recent_max_temp: float
    forecast_max_temp: float

class StationComparisonData(BaseModel):
    timestamp: datetime
    central_park: Dict[str, Any]
    white_plains: Dict[str, Any]
    temperature_delta: float
    hdd_delta_7d: float
    summary: str

class UserSettings(BaseModel):
    hdd_base_temp: float = 62.0
    cold_threshold_elevated: float = 34.0
    cold_threshold_high: float = 24.0
    cold_threshold_extreme: float = 14.0
    rapid_drop_threshold: float = 15.0
    auto_refresh_minutes: int = 30
    temp_unit: str = "F"
