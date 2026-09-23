from typing import List, Tuple, Optional
from datetime import datetime, timedelta
from app.models.weather import (
    CurrentConditions, HourlyForecastItem, DailyForecastItem,
    GasIndicators, UserSettings, StationInfo
)

class GasOperationsEngine:
    def __init__(self, settings: Optional[UserSettings] = None):
        self.settings = settings or UserSettings()

    def update_settings(self, settings: UserSettings):
        self.settings = settings

    def calculate_indicators(
        self,
        station: StationInfo,
        current: CurrentConditions,
        hourly: List[HourlyForecastItem],
        daily: List[DailyForecastItem],
        recent_obs: List[Tuple[datetime, float]]
    ) -> GasIndicators:
        base_temp = self.settings.hdd_base_temp

        # 1. Daily HDD from current / today's average
        today_daily = daily[0] if daily else None
        if today_daily:
            daily_hdd = max(0.0, round(base_temp - today_daily.avg_temp_f, 1))
            forecast_today_hdd = daily_hdd
        else:
            daily_hdd = max(0.0, round(base_temp - current.temperature_f, 1))
            forecast_today_hdd = daily_hdd

        # 2. Cumulative HDD
        cum_3d = sum([d.hdd for d in daily[:3]]) if len(daily) >= 3 else daily_hdd * 3
        cum_5d = sum([d.hdd for d in daily[:5]]) if len(daily) >= 5 else daily_hdd * 5
        cum_7d = sum([d.hdd for d in daily[:7]]) if len(daily) >= 7 else daily_hdd * 7

        # 3. 24h temperature change (observed)
        temp_change_24h = 0.0
        if recent_obs:
            now_t = recent_obs[-1][0]
            target_t = now_t - timedelta(hours=24)
            # Find closest observation around 24h ago
            closest_prior = min(recent_obs, key=lambda x: abs((x[0] - target_t).total_seconds()))
            temp_change_24h = round(current.temperature_f - closest_prior[1], 1)

        # 4. Expected next 24h change (from hourly forecast)
        expected_next_24h = 0.0
        if len(hourly) >= 24:
            in_24h_temp = hourly[23].temperature_f
            expected_next_24h = round(in_24h_temp - current.temperature_f, 1)
        elif len(daily) >= 2:
            expected_next_24h = round(daily[1].avg_temp_f - daily[0].avg_temp_f, 1)

        # 5. Trends (3-day and 5-day)
        def get_trend_label(delta: float) -> str:
            if delta > 2.0:
                return "Warming"
            elif delta < -2.0:
                return "Cooling"
            return "Stable"

        if len(daily) >= 3:
            trend_3d = get_trend_label(daily[2].avg_temp_f - daily[0].avg_temp_f)
        else:
            trend_3d = "Stable"

        if len(daily) >= 5:
            trend_5d = get_trend_label(daily[4].avg_temp_f - daily[0].avg_temp_f)
        else:
            trend_5d = "Stable"

        # 6. Cold Weather Indicator based on forecast minimum over next 48h
        min_forecast_temp = current.temperature_f
        if hourly:
            min_forecast_temp = min([h.temperature_f for h in hourly[:48]])
        elif daily:
            min_forecast_temp = min([d.min_temp_f for d in daily[:2]])

        if min_forecast_temp < self.settings.cold_threshold_extreme:
            cold_level = "Extreme"
            cold_label = f"Extreme Cold ({min_forecast_temp:.0f}°F forecast min < {self.settings.cold_threshold_extreme:.0f}°F)"
        elif min_forecast_temp < self.settings.cold_threshold_high:
            cold_level = "High"
            cold_label = f"High Cold Demand ({min_forecast_temp:.0f}°F forecast min < {self.settings.cold_threshold_high:.0f}°F)"
        elif min_forecast_temp < self.settings.cold_threshold_elevated:
            cold_level = "Elevated"
            cold_label = f"Elevated Cold ({min_forecast_temp:.0f}°F forecast min < {self.settings.cold_threshold_elevated:.0f}°F)"
        else:
            cold_level = "Normal"
            cold_label = f"Normal Operating Range (Forecast min {min_forecast_temp:.0f}°F)"

        # 7. Rapid Temperature Drop Detection (inspect rolling 24h window in hourly)
        rapid_drop_detected = False
        max_drop_magnitude = 0.0
        rapid_drop_msg = None

        if len(hourly) >= 24:
            for i in range(len(hourly) - 24):
                window_start_temp = hourly[i].temperature_f
                window_end_temp = hourly[i + 24].temperature_f
                drop = window_start_temp - window_end_temp
                if drop > max_drop_magnitude:
                    max_drop_magnitude = drop

            # Also check from current conditions to next 24h
            curr_to_24h_drop = current.temperature_f - (hourly[23].temperature_f if len(hourly) > 23 else current.temperature_f)
            if curr_to_24h_drop > max_drop_magnitude:
                max_drop_magnitude = curr_to_24h_drop

            if max_drop_magnitude >= self.settings.rapid_drop_threshold:
                rapid_drop_detected = True
                rapid_drop_msg = f"Temperature expected to decrease {max_drop_magnitude:.0f}°F over 24 hours."

        # 8. Weather-Based Gas Load Proxy (Composite Weather Index)
        # Transparent formula: HDD * (1 + wind_speed/50) * cloud_factor
        wind_factor = (current.wind_speed_mph or 0.0) / 50.0
        cwi = round(daily_hdd * (1.0 + wind_factor), 1)
        if cwi < 10.0:
            cwi_label = "Low Base Heating Load"
        elif cwi < 25.0:
            cwi_label = "Moderate Heating Load"
        elif cwi < 40.0:
            cwi_label = "High Heating Demand"
        else:
            cwi_label = "Peak Heating Demand Conditions"

        return GasIndicators(
            station_id=station.id,
            station_name=station.name,
            hdd_base_temp=base_temp,
            daily_hdd=round(daily_hdd, 1),
            forecast_hdd_today=round(forecast_today_hdd, 1),
            cumulative_hdd_3d=round(cum_3d, 1),
            cumulative_hdd_5d=round(cum_5d, 1),
            cumulative_hdd_7d=round(cum_7d, 1),
            temp_change_24h=temp_change_24h,
            expected_temp_change_next_24h=expected_next_24h,
            trend_3d=trend_3d,
            trend_5d=trend_5d,
            cold_weather_level=cold_level,
            cold_weather_label=cold_label,
            rapid_drop_detected=rapid_drop_detected,
            rapid_drop_magnitude=round(max_drop_magnitude, 1),
            rapid_drop_message=rapid_drop_msg,
            composite_weather_index=cwi,
            composite_weather_index_label=cwi_label,
            calculation_note="Con Edison Gas Control: Actual Heating Degree Days (AHDD) = 62°F - Daily Mean Temperature; does not represent metered gas sendout."
        )
