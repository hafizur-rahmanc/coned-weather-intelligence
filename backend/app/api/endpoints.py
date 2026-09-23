from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.weather import (
    StationInfo, CurrentConditions, DailyForecastItem,
    HourlyForecastItem, GasIndicators, WeatherAlert,
    HistoricalDataPoint, HistoricalVsForecast, UserSettings,
    StationComparisonData
)
from app.services.station_resolver import StationResolver
from app.services.nws_client import NWSClient
from app.services.gas_indicators import GasOperationsEngine
from app.services.historical_service import HistoricalWeatherService

router = APIRouter()

station_resolver = StationResolver()
nws_client = NWSClient()
user_settings = UserSettings()
gas_engine = GasOperationsEngine(user_settings)
hist_service = HistoricalWeatherService()

def get_station_or_404(station_id: str) -> StationInfo:
    st = station_resolver.get_station(station_id)
    if not st:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found. Supported stations: KNYC, KHPN")
    return st

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Con Edison Gas Control Weather Intelligence API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "primary_source": "NOAA / National Weather Service (api.weather.gov)",
        "stations": ["KNYC", "KHPN"]
    }

@router.get("/stations", response_model=List[StationInfo])
async def list_stations():
    return station_resolver.list_stations()

@router.get("/weather/current", response_model=CurrentConditions)
async def get_current_weather(station: str = Query("KNYC")):
    st = get_station_or_404(station)
    return await nws_client.get_current_conditions(st)

@router.get("/weather/forecast", response_model=List[DailyForecastItem])
async def get_daily_forecast(
    station: str = Query("KNYC"),
    days: int = Query(30, ge=3, le=30)
):
    st = get_station_or_404(station)
    return await nws_client.get_daily_forecast(st, days=days, hdd_base_temp=user_settings.hdd_base_temp)

@router.get("/weather/hourly", response_model=List[HourlyForecastItem])
async def get_hourly_forecast(
    station: str = Query("KNYC"),
    hours: int = Query(48, ge=24, le=72)
):
    st = get_station_or_404(station)
    return await nws_client.get_hourly_forecast(st, limit_hours=hours)

@router.get("/weather/trend")
async def get_temperature_trend(station: str = Query("KNYC")):
    st = get_station_or_404(station)
    recent = await nws_client.get_recent_observations(st, hours=24)
    hourly = await nws_client.get_hourly_forecast(st, limit_hours=48)
    
    # Observed points
    observed_points = [
        {
            "timestamp": t.isoformat(),
            "time_label": t.strftime("%a %-I %p"),
            "temperature_f": temp,
            "type": "observed"
        }
        for t, temp in recent
    ]
    
    # Forecast points
    forecast_points = [
        {
            "timestamp": h.timestamp.isoformat(),
            "time_label": h.formatted_time,
            "temperature_f": h.temperature_f,
            "type": "forecast"
        }
        for h in hourly
    ]
    
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "station_id": st.id,
        "station_name": st.name,
        "now_timestamp": now_iso,
        "observed_points": observed_points,
        "forecast_points": forecast_points,
        "all_points": observed_points + forecast_points
    }

@router.get("/weather/indicators", response_model=GasIndicators)
async def get_gas_indicators(station: str = Query("KNYC")):
    st = get_station_or_404(station)
    current = await nws_client.get_current_conditions(st)
    hourly = await nws_client.get_hourly_forecast(st, limit_hours=48)
    daily = await nws_client.get_daily_forecast(st, days=7, hdd_base_temp=user_settings.hdd_base_temp)
    recent = await nws_client.get_recent_observations(st, hours=36)
    return gas_engine.calculate_indicators(st, current, hourly, daily, recent)

@router.get("/weather/historical", response_model=List[HistoricalDataPoint])
async def get_historical_weather(
    station: str = Query("KNYC"),
    days: int = Query(7, ge=7, le=90)
):
    st = get_station_or_404(station)
    return await hist_service.get_historical_data(st, days=days, hdd_base_temp=user_settings.hdd_base_temp)

@router.get("/weather/historical-vs-forecast", response_model=HistoricalVsForecast)
async def get_historical_vs_forecast(station: str = Query("KNYC")):
    st = get_station_or_404(station)
    hist_7d = await hist_service.get_historical_data(st, days=7, hdd_base_temp=user_settings.hdd_base_temp)
    fore_7d = await nws_client.get_daily_forecast(st, days=7, hdd_base_temp=user_settings.hdd_base_temp)
    return hist_service.calculate_historical_vs_forecast(hist_7d, fore_7d)

@router.get("/weather/compare")
async def get_station_comparison():
    st_nyc = get_station_or_404("KNYC")
    st_hpn = get_station_or_404("KHPN")
    
    curr_nyc = await nws_client.get_current_conditions(st_nyc)
    curr_hpn = await nws_client.get_current_conditions(st_hpn)
    
    daily_nyc = await nws_client.get_daily_forecast(st_nyc, days=7, hdd_base_temp=user_settings.hdd_base_temp)
    daily_hpn = await nws_client.get_daily_forecast(st_hpn, days=7, hdd_base_temp=user_settings.hdd_base_temp)
    
    hourly_nyc = await nws_client.get_hourly_forecast(st_nyc, limit_hours=48)
    hourly_hpn = await nws_client.get_hourly_forecast(st_hpn, limit_hours=48)
    
    recent_nyc = await nws_client.get_recent_observations(st_nyc, hours=36)
    recent_hpn = await nws_client.get_recent_observations(st_hpn, hours=36)
    
    ind_nyc = gas_engine.calculate_indicators(st_nyc, curr_nyc, hourly_nyc, daily_nyc, recent_nyc)
    ind_hpn = gas_engine.calculate_indicators(st_hpn, curr_hpn, hourly_hpn, daily_hpn, recent_hpn)
    
    alerts_nyc = await nws_client.get_active_alerts(st_nyc)
    alerts_hpn = await nws_client.get_active_alerts(st_hpn)

    temp_delta = round(curr_hpn.temperature_f - curr_nyc.temperature_f, 1)
    hdd_delta_7d = round(ind_hpn.cumulative_hdd_7d - ind_nyc.cumulative_hdd_7d, 1)

    summary_text = (
        f"White Plains is currently {abs(temp_delta):.1f}°F {'warmer' if temp_delta > 0 else 'cooler'} "
        f"than Central Park. 7-day cumulative HDD in White Plains is {abs(hdd_delta_7d):.1f} HDD "
        f"{'higher' if hdd_delta_7d > 0 else 'lower'}, reflecting {'greater' if hdd_delta_7d > 0 else 'less'} "
        f"heating demand in the northern Westchester corridor."
    )

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "temperature_delta": temp_delta,
        "hdd_delta_7d": hdd_delta_7d,
        "summary": summary_text,
        "central_park": {
            "station": st_nyc,
            "current": curr_nyc,
            "indicators": ind_nyc,
            "daily": daily_nyc,
            "alerts": alerts_nyc
        },
        "white_plains": {
            "station": st_hpn,
            "current": curr_hpn,
            "indicators": ind_hpn,
            "daily": daily_hpn,
            "alerts": alerts_hpn
        }
    }

@router.get("/alerts", response_model=List[WeatherAlert])
async def get_alerts(station: str = Query("KNYC")):
    st = get_station_or_404(station)
    return await nws_client.get_active_alerts(st)

@router.get("/settings", response_model=UserSettings)
async def get_settings():
    return user_settings

@router.post("/settings", response_model=UserSettings)
async def update_settings(settings: UserSettings):
    global user_settings
    user_settings = settings
    gas_engine.update_settings(settings)
    return user_settings
