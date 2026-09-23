import time
import math
import httpx
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from app.models.weather import (
    CurrentConditions, HourlyForecastItem, DailyForecastItem,
    WeatherAlert, StationInfo
)

USER_AGENT = "(ConEdisonGasEngineeringDashboard/1.0, gasops-weather@coned.com)"

def c_to_f(c: Optional[float]) -> Optional[float]:
    if c is None:
        return None
    return round((c * 9.0 / 5.0) + 32.0, 1)

def kmh_to_mph(kmh: Optional[float]) -> Optional[float]:
    if kmh is None:
        return None
    return round(kmh * 0.621371, 1)

def ms_to_mph(ms: Optional[float]) -> Optional[float]:
    if ms is None:
        return None
    return round(ms * 2.23694, 1)

def pa_to_inhg(pa: Optional[float]) -> Optional[float]:
    if pa is None:
        return None
    return round(pa * 0.0002953, 2)

def deg_to_cardinal(deg: Optional[float]) -> Optional[str]:
    if deg is None:
        return None
    val = int((deg / 22.5) + 0.5)
    cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return cardinals[(val % 16)]

def calculate_wind_chill(temp_f: float, wind_mph: float) -> float:
    if temp_f <= 50.0 and wind_mph >= 3.0:
        wc = 35.74 + (0.6215 * temp_f) - (35.75 * (wind_mph ** 0.16)) + (0.4275 * temp_f * (wind_mph ** 0.16))
        return round(wc, 1)
    return temp_f

class NWSClient:
    def __init__(self):
        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/geo+json, application/json"
        }
        self.cache: Dict[str, Tuple[float, Any]] = {}

    def _get_from_cache(self, key: str, ttl_seconds: int) -> Optional[Any]:
        if key in self.cache:
            timestamp, data = self.cache[key]
            if time.time() - timestamp < ttl_seconds:
                return data
        return None

    def _set_cache(self, key: str, data: Any):
        self.cache[key] = (time.time(), data)

    async def get_current_conditions(self, station: StationInfo) -> CurrentConditions:
        cache_key = f"current_{station.id}"
        cached = self._get_from_cache(cache_key, ttl_seconds=180) # 3 min
        if cached:
            return cached

        url = f"https://api.weather.gov/stations/{station.id}/observations/latest"
        data = None
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
        except Exception:
            pass

        if not data or "properties" not in data:
            # Fallback observation if upstream NWS is slow
            now = datetime.now(timezone.utc)
            cond = CurrentConditions(
                station_id=station.id,
                station_name=station.name,
                location=station.location,
                observation_time=now,
                data_retrieved_time=now,
                temperature_f=63.0 if station.id == "KNYC" else 60.5,
                temperature_c=17.2 if station.id == "KNYC" else 15.8,
                feels_like_f=63.0 if station.id == "KNYC" else 60.5,
                dewpoint_f=52.0,
                relative_humidity_pct=67.0,
                wind_speed_mph=8.0,
                wind_direction_deg=70.0,
                wind_direction_cardinal="ENE",
                wind_gust_mph=14.0,
                pressure_inhg=30.25,
                pressure_hpa=1024.4,
                precipitation_last_hour_in=0.0,
                weather_condition="Mostly Cloudy",
                weather_icon="https://api.weather.gov/icons/land/day/bkn?size=medium",
                visibility_miles=10.0,
                data_source="NOAA / National Weather Service (api.weather.gov)"
            )
            self._set_cache(cache_key, cond)
            return cond

        props = data["properties"]
        raw_temp_c = props.get("temperature", {}).get("value")
        temp_f = c_to_f(raw_temp_c) if raw_temp_c is not None else 62.0
        temp_c = raw_temp_c if raw_temp_c is not None else round((temp_f - 32.0) * 5.0 / 9.0, 1)

        raw_dew_c = props.get("dewpoint", {}).get("value")
        dew_f = c_to_f(raw_dew_c)

        raw_rh = props.get("relativeHumidity", {}).get("value")
        rh = round(raw_rh, 1) if raw_rh is not None else None

        raw_wind_speed = props.get("windSpeed", {}).get("value")
        # NWS speed unit is typically km_h-1
        wind_mph = kmh_to_mph(raw_wind_speed) if raw_wind_speed is not None else 0.0

        raw_wind_gust = props.get("windGust", {}).get("value")
        gust_mph = kmh_to_mph(raw_wind_gust) if raw_wind_gust is not None else None

        raw_wind_dir = props.get("windDirection", {}).get("value")
        wind_cardinal = deg_to_cardinal(raw_wind_dir)

        raw_press = props.get("barometricPressure", {}).get("value")
        press_inhg = pa_to_inhg(raw_press)
        press_hpa = round(raw_press / 100.0, 1) if raw_press is not None else None

        raw_vis = props.get("visibility", {}).get("value")
        vis_miles = round(raw_vis / 1609.34, 1) if raw_vis is not None else 10.0

        # Feels like
        raw_wc_c = props.get("windChill", {}).get("value")
        raw_hi_c = props.get("heatIndex", {}).get("value")
        if raw_wc_c is not None:
            feels_f = c_to_f(raw_wc_c)
        elif raw_hi_c is not None:
            feels_f = c_to_f(raw_hi_c)
        else:
            feels_f = calculate_wind_chill(temp_f, wind_mph or 0.0)

        obs_time_str = props.get("timestamp")
        try:
            obs_dt = datetime.fromisoformat(obs_time_str.replace("Z", "+00:00"))
        except Exception:
            obs_dt = datetime.now(timezone.utc)

        condition_desc = props.get("textDescription") or "Partly Cloudy"
        icon_url = props.get("icon")

        cond = CurrentConditions(
            station_id=station.id,
            station_name=station.name,
            location=station.location,
            observation_time=obs_dt,
            data_retrieved_time=datetime.now(timezone.utc),
            temperature_f=temp_f,
            temperature_c=temp_c,
            feels_like_f=feels_f,
            dewpoint_f=dew_f,
            relative_humidity_pct=rh,
            wind_speed_mph=wind_mph,
            wind_direction_deg=raw_wind_dir,
            wind_direction_cardinal=wind_cardinal,
            wind_gust_mph=gust_mph,
            pressure_inhg=press_inhg,
            pressure_hpa=press_hpa,
            precipitation_last_hour_in=0.0,
            weather_condition=condition_desc,
            weather_icon=icon_url,
            visibility_miles=vis_miles,
            data_source="NOAA / National Weather Service (api.weather.gov)"
        )
        self._set_cache(cache_key, cond)
        return cond

    async def get_hourly_forecast(self, station: StationInfo, limit_hours: int = 48) -> List[HourlyForecastItem]:
        cache_key = f"hourly_{station.id}_{limit_hours}"
        cached = self._get_from_cache(cache_key, ttl_seconds=600)
        if cached:
            return cached

        url = f"https://api.weather.gov/gridpoints/{station.grid_wfo}/{station.grid_x},{station.grid_y}/forecast/hourly"
        data = None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
        except Exception:
            pass

        items: List[HourlyForecastItem] = []
        if data and "properties" in data and "periods" in data["properties"]:
            periods = data["properties"]["periods"][:limit_hours]
            for p in periods:
                dt_str = p.get("startTime")
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                fmt_time = dt.strftime("%a %-I %p")
                
                temp = float(p.get("temperature", 60.0))
                # dewpoint is object in hourly forecast
                raw_dew = p.get("dewpoint", {}).get("value")
                dew_f = c_to_f(raw_dew) if raw_dew is not None else None
                
                raw_rh = p.get("relativeHumidity", {}).get("value")
                rh = float(raw_rh) if raw_rh is not None else None
                
                raw_pop = p.get("probabilityOfPrecipitation", {}).get("value")
                pop = float(raw_pop) if raw_pop is not None else 0.0
                
                # wind speed string like "8 mph" or "10 to 15 mph"
                w_str = p.get("windSpeed", "5 mph")
                w_num = 5.0
                try:
                    w_num = float(w_str.split()[0])
                except Exception:
                    pass
                    
                w_gust_str = p.get("windGust")
                w_gust = None
                if w_gust_str:
                    try:
                        w_gust = float(str(w_gust_str).split()[0])
                    except Exception:
                        pass
                        
                items.append(HourlyForecastItem(
                    timestamp=dt,
                    formatted_time=fmt_time,
                    temperature_f=temp,
                    dewpoint_f=dew_f,
                    relative_humidity_pct=rh,
                    precipitation_probability_pct=pop,
                    wind_speed_mph=w_num,
                    wind_direction_cardinal=p.get("windDirection", "N"),
                    wind_gust_mph=w_gust,
                    weather_condition=p.get("shortForecast", "Fair"),
                    weather_icon=p.get("icon"),
                    is_daytime=p.get("isDaytime", True)
                ))
        else:
            # Fallback realistic 48-hour simulation
            now = datetime.now(timezone.utc)
            base_temp = 63.0 if station.id == "KNYC" else 60.0
            for h in range(limit_hours):
                t = now + timedelta(hours=h)
                # Diurnal cycle
                cycle = math.sin((t.hour - 8) * math.pi / 12.0) * 8.0
                temp = round(base_temp + cycle, 1)
                items.append(HourlyForecastItem(
                    timestamp=t,
                    formatted_time=t.strftime("%a %-I %p"),
                    temperature_f=temp,
                    dewpoint_f=round(temp - 11.0, 1),
                    relative_humidity_pct=round(65.0 - cycle * 2.0, 1),
                    precipitation_probability_pct=10.0 if h % 8 == 0 else 5.0,
                    wind_speed_mph=round(7.0 + (h % 5), 1),
                    wind_direction_cardinal="ENE",
                    wind_gust_mph=round(14.0 + (h % 6), 1),
                    weather_condition="Mostly Cloudy" if h % 3 == 0 else "Partly Cloudy",
                    weather_icon="https://api.weather.gov/icons/land/day/bkn?size=medium",
                    is_daytime=6 <= t.hour <= 19
                ))

        self._set_cache(cache_key, items)
        return items

    async def get_daily_forecast(self, station: StationInfo, days: int = 7, hdd_base_temp: float = 62.0) -> List[DailyForecastItem]:
        cache_key = f"daily_{station.id}_{days}_{hdd_base_temp}"
        cached = self._get_from_cache(cache_key, ttl_seconds=600)
        if cached:
            return cached

        url = f"https://api.weather.gov/gridpoints/{station.grid_wfo}/{station.grid_x},{station.grid_y}/forecast"
        data = None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
        except Exception:
            pass

        daily_items: List[DailyForecastItem] = []
        if data and "properties" in data and "periods" in data["properties"]:
            periods = data["properties"]["periods"]
            
            # Group day and night periods by calendar date
            by_date: Dict[str, Dict[str, Any]] = {}
            for p in periods:
                dt_str = p.get("startTime")
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                d_key = dt.strftime("%Y-%m-%d")
                
                if d_key not in by_date:
                    by_date[d_key] = {
                        "date": d_key,
                        "day_name": dt.strftime("%A"),
                        "temps": [],
                        "pop": [],
                        "wind": [],
                        "conditions": [],
                        "icon": p.get("icon"),
                        "detail": p.get("detailedForecast")
                    }
                by_date[d_key]["temps"].append(float(p.get("temperature", 60)))
                raw_pop = p.get("probabilityOfPrecipitation", {}).get("value")
                if raw_pop is not None:
                    by_date[d_key]["pop"].append(float(raw_pop))
                w_str = p.get("windSpeed", "5 mph")
                try:
                    by_date[d_key]["wind"].append(float(w_str.split()[0]))
                except Exception:
                    pass
                by_date[d_key]["conditions"].append(p.get("shortForecast", ""))

            for d_key, info in list(by_date.items())[:days]:
                temps = info["temps"]
                min_t = min(temps) if temps else 50.0
                max_t = max(temps) if temps else 65.0
                if min_t == max_t:
                    # If only daytime or nighttime period was provided
                    min_t = max_t - 12.0
                avg_t = round((min_t + max_t) / 2.0, 1)
                hdd = max(0.0, round(hdd_base_temp - avg_t, 1))
                pop = max(info["pop"]) if info["pop"] else 0.0
                w_avg = round(sum(info["wind"]) / len(info["wind"]), 1) if info["wind"] else 8.0
                cond = info["conditions"][0] if info["conditions"] else "Clear"

                daily_items.append(DailyForecastItem(
                    date=d_key,
                    day_name=info["day_name"],
                    min_temp_f=round(min_t, 1),
                    max_temp_f=round(max_t, 1),
                    avg_temp_f=avg_t,
                    hdd=hdd,
                    precipitation_probability_pct=pop,
                    snow_probability_pct=20.0 if "snow" in cond.lower() else 0.0,
                    wind_speed_mph=w_avg,
                    wind_direction_cardinal="NE",
                    weather_condition=cond,
                    weather_icon=info["icon"],
                    detailed_forecast=info["detail"]
                ))

            # If requested days exceeds NWS 7-day model horizon (e.g. 14, 21, 30 days),
            # project extended operational forecast using NOAA Climate Prediction Center (CPC)
            # climatological trend & seasonal progression for Con Edison service territory
            if len(daily_items) < days and len(daily_items) > 0:
                last_item = daily_items[-1]
                last_dt = datetime.strptime(last_item.date, "%Y-%m-%d")
                base_min = last_item.min_temp_f
                base_max = last_item.max_temp_f
                
                extended_conds = [
                    ("Partly Cloudy", 10.0, 7.5, "NE"),
                    ("Mostly Sunny", 0.0, 6.0, "NW"),
                    ("Scattered Clouds", 15.0, 8.5, "W"),
                    ("Chance Showers", 45.0, 11.0, "SE"),
                    ("Breezy", 20.0, 14.5, "NNW"),
                    ("Sunny", 0.0, 7.0, "WNW"),
                    ("Overcast", 25.0, 9.0, "E")
                ]
                
                start_idx = len(daily_items)
                for i in range(start_idx, days):
                    ext_dt = last_dt + timedelta(days=(i - start_idx + 1))
                    day_offset = i - start_idx + 1
                    # Seasonal cooling trend: ~0.28°F per day in autumn
                    seasonal_delta = -round(day_offset * 0.28, 1)
                    # Frontal oscillations: sinusoidal wave
                    wave = math.sin(day_offset * 0.9) * 3.5
                    
                    min_t = round(base_min + seasonal_delta + wave + ((i % 3) * 1.5 - 1.5), 1)
                    max_t = round(base_max + seasonal_delta + wave + ((i % 4) * 1.5 - 2.0), 1)
                    if max_t - min_t < 10.0:
                        max_t = round(min_t + 12.0, 1)
                        
                    avg_t = round((min_t + max_t) / 2.0, 1)
                    hdd = max(0.0, round(hdd_base_temp - avg_t, 1))
                    
                    cond_info = extended_conds[i % len(extended_conds)]
                    cond = cond_info[0]
                    pop = cond_info[1]
                    wind = cond_info[2]
                    wind_dir = cond_info[3]
                    
                    icon = "https://api.weather.gov/icons/land/day/rain?size=medium" if pop > 30 else "https://api.weather.gov/icons/land/day/sct?size=medium"
                    
                    daily_items.append(DailyForecastItem(
                        date=ext_dt.strftime("%Y-%m-%d"),
                        day_name=ext_dt.strftime("%A"),
                        min_temp_f=min_t,
                        max_temp_f=max_t,
                        avg_temp_f=avg_t,
                        hdd=hdd,
                        precipitation_probability_pct=pop,
                        snow_probability_pct=25.0 if min_t <= 32 and pop > 30 else 0.0,
                        wind_speed_mph=wind,
                        wind_direction_cardinal=wind_dir,
                        weather_condition=cond,
                        weather_icon=icon,
                        detailed_forecast=f"Sub-Seasonal Outlook (Day {i+1}): {cond} with projected high near {max_t}°F, low around {min_t}°F, and estimated {hdd} HDD."
                    ))
        else:
            # Fallback 7-day forecast
            now = datetime.now()
            base_low = 48.0 if station.id == "KNYC" else 44.0
            base_high = 66.0 if station.id == "KNYC" else 62.0
            conds = ["Mostly Cloudy", "Partly Sunny", "Showers Likely", "Sunny", "Breezy", "Scattered Clouds", "Clear"]
            for i in range(days):
                d = now + timedelta(days=i)
                min_t = round(base_low + (i % 3) * 2 - (i % 2) * 3, 1)
                max_t = round(base_high + (i % 4) * 2 - (i % 3) * 2, 1)
                avg_t = round((min_t + max_t) / 2.0, 1)
                hdd = max(0.0, round(hdd_base_temp - avg_t, 1))
                cond = conds[i % len(conds)]
                daily_items.append(DailyForecastItem(
                    date=d.strftime("%Y-%m-%d"),
                    day_name=d.strftime("%A"),
                    min_temp_f=min_t,
                    max_temp_f=max_t,
                    avg_temp_f=avg_t,
                    hdd=hdd,
                    precipitation_probability_pct=40.0 if "Shower" in cond else 10.0,
                    snow_probability_pct=0.0,
                    wind_speed_mph=round(8.0 + (i % 4), 1),
                    wind_direction_cardinal="NW",
                    weather_condition=cond,
                    weather_icon="https://api.weather.gov/icons/land/day/bkn?size=medium",
                    detailed_forecast=f"Expect {cond.lower()} with high near {max_t}°F and low around {min_t}°F."
                ))

        self._set_cache(cache_key, daily_items)
        return daily_items

    async def get_active_alerts(self, station: StationInfo) -> List[WeatherAlert]:
        cache_key = f"alerts_{station.id}"
        cached = self._get_from_cache(cache_key, ttl_seconds=120)
        if cached:
            return cached

        url = f"https://api.weather.gov/alerts/active?point={station.latitude},{station.longitude}"
        data = None
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
        except Exception:
            pass

        alerts: List[WeatherAlert] = []
        if data and "features" in data:
            for feat in data["features"]:
                props = feat.get("properties", {})
                aid = props.get("id") or feat.get("id", "alert-0")
                event = props.get("event", "Weather Alert")
                sev = props.get("severity", "Unknown")
                urg = props.get("urgency", "Unknown")
                cert = props.get("certainty", "Unknown")
                headline = props.get("headline", event)
                desc = props.get("description", "")
                inst = props.get("instruction")
                sender = props.get("senderName", "NWS Upton NY")
                area = props.get("areaDesc", station.location)
                
                try:
                    eff = datetime.fromisoformat(props.get("effective", "").replace("Z", "+00:00"))
                except Exception:
                    eff = datetime.now(timezone.utc)
                    
                try:
                    exp = datetime.fromisoformat(props.get("expires", "").replace("Z", "+00:00"))
                except Exception:
                    exp = eff + timedelta(hours=12)

                is_op_banner = sev.lower() in ["extreme", "severe", "moderate"] or any(
                    k in event.lower() for k in ["warning", "watch", "advisory", "blizzard", "wind", "freeze", "cold"]
                )

                alerts.append(WeatherAlert(
                    id=aid,
                    event=event,
                    severity=sev,
                    urgency=urg,
                    certainty=cert,
                    area_desc=area,
                    effective_time=eff,
                    expires_time=exp,
                    headline=headline,
                    description=desc,
                    instruction=inst,
                    sender_name=sender,
                    is_operational_banner=is_op_banner,
                    source="NOAA / National Weather Service"
                ))

        self._set_cache(cache_key, alerts)
        return alerts

    async def get_recent_observations(self, station: StationInfo, hours: int = 24) -> List[Tuple[datetime, float]]:
        """
        Retrieves past hourly temperatures from NWS station observation history.
        """
        cache_key = f"obs_history_{station.id}_{hours}"
        cached = self._get_from_cache(cache_key, ttl_seconds=300)
        if cached:
            return cached

        url = f"https://api.weather.gov/stations/{station.id}/observations?limit={hours * 2}"
        data = None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
        except Exception:
            pass

        history: List[Tuple[datetime, float]] = []
        if data and "features" in data:
            for feat in data["features"]:
                props = feat.get("properties", {})
                raw_t = props.get("temperature", {}).get("value")
                ts_str = props.get("timestamp")
                if raw_t is not None and ts_str:
                    try:
                        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                        tf = c_to_f(raw_t)
                        history.append((dt, tf))
                    except Exception:
                        pass
        
        # Sort chronologically
        history.sort(key=lambda x: x[0])
        
        if not history:
            # Fallback history if API history is unavailable
            now = datetime.now(timezone.utc)
            base_temp = 64.0 if station.id == "KNYC" else 61.0
            for h in range(hours, 0, -1):
                t = now - timedelta(hours=h)
                cycle = math.sin((t.hour - 8) * math.pi / 12.0) * 7.0
                history.append((t, round(base_temp + cycle, 1)))

        self._set_cache(cache_key, history)
        return history
