import unittest
from datetime import datetime, timezone, timedelta
from app.models.weather import (
    CurrentConditions, HourlyForecastItem, DailyForecastItem,
    UserSettings, StationInfo
)
from app.services.gas_indicators import GasOperationsEngine

class TestGasIndicators(unittest.TestCase):
    def setUp(self):
        self.station = StationInfo(
            id="KNYC",
            name="Central Park, New York",
            location="New York City",
            latitude=40.7812,
            longitude=-73.9665,
            grid_wfo="OKX",
            grid_x=34,
            grid_y=45
        )
        self.now = datetime.now(timezone.utc)
        self.current = CurrentConditions(
            station_id="KNYC",
            station_name="Central Park",
            location="New York",
            observation_time=self.now,
            data_retrieved_time=self.now,
            temperature_f=42.0,
            temperature_c=5.6,
            feels_like_f=37.0,
            dewpoint_f=30.0,
            relative_humidity_pct=60.0,
            wind_speed_mph=12.0,
            weather_condition="Mostly Cloudy"
        )
        # Mock 7 daily forecasts: low 30, high 44 -> avg 37 -> AHDD (62-37) = 25
        self.daily = [
            DailyForecastItem(
                date=f"2026-12-{15+i}",
                day_name="Day",
                min_temp_f=30.0 + i,
                max_temp_f=44.0 + i,
                avg_temp_f=37.0 + i,
                hdd=max(0.0, 62.0 - (37.0 + i)),
                weather_condition="Cloudy"
            )
            for i in range(7)
        ]
        # Mock 48 hourly forecasts with an incoming cold front drop
        self.hourly = [
            HourlyForecastItem(
                timestamp=self.now + timedelta(hours=i),
                formatted_time="Time",
                temperature_f=42.0 - (i * 0.8), # drops from 42 to 23 in 24h (19.2 drop)
                weather_condition="Overcast"
            )
            for i in range(48)
        ]
        # Mock recent observations
        self.recent = [
            (self.now - timedelta(hours=24), 54.0),
            (self.now, 42.0)
        ]

    def test_hdd_coned_standard_base(self):
        engine = GasOperationsEngine(UserSettings(hdd_base_temp=62.0))
        ind = engine.calculate_indicators(self.station, self.current, self.hourly, self.daily, self.recent)
        self.assertEqual(ind.hdd_base_temp, 62.0)
        self.assertEqual(ind.daily_hdd, 25.0)
        self.assertTrue(ind.cumulative_hdd_3d > 0)
        self.assertTrue(ind.cumulative_hdd_7d > ind.cumulative_hdd_3d)

    def test_hdd_custom_base(self):
        engine = GasOperationsEngine(UserSettings(hdd_base_temp=60.0))
        ind = engine.calculate_indicators(self.station, self.current, self.hourly, self.daily, self.recent)
        self.assertEqual(ind.hdd_base_temp, 60.0)
        # 60 - 37 = 23
        self.assertEqual(ind.daily_hdd, 23.0)

    def test_24h_temperature_change(self):
        engine = GasOperationsEngine()
        ind = engine.calculate_indicators(self.station, self.current, self.hourly, self.daily, self.recent)
        # 42 - 54 = -12.0
        self.assertEqual(ind.temp_change_24h, -12.0)

    def test_rapid_temperature_drop_detection(self):
        engine = GasOperationsEngine(UserSettings(rapid_drop_threshold=15.0))
        ind = engine.calculate_indicators(self.station, self.current, self.hourly, self.daily, self.recent)
        self.assertTrue(ind.rapid_drop_detected)
        self.assertIn("Temperature expected to decrease", ind.rapid_drop_message)

    def test_cold_weather_indicator_tier(self):
        engine = GasOperationsEngine()
        ind = engine.calculate_indicators(self.station, self.current, self.hourly, self.daily, self.recent)
        # In our hourly mock, temp reaches < 15F at hour 35+ -> Extreme tier
        self.assertIn(ind.cold_weather_level, ["High", "Extreme"])

    def test_composite_weather_index(self):
        engine = GasOperationsEngine()
        ind = engine.calculate_indicators(self.station, self.current, self.hourly, self.daily, self.recent)
        self.assertTrue(ind.composite_weather_index > ind.daily_hdd) # wind increases load
        self.assertIn("Heating", ind.composite_weather_index_label)

if __name__ == '__main__':
    unittest.main()
