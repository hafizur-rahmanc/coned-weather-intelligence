import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("KNYC", data["stations"])
        self.assertIn("KHPN", data["stations"])

    def test_stations_endpoint(self):
        res = self.client.get("/api/stations")
        self.assertEqual(res.status_code, 200)
        stations = res.json()
        ids = [s["id"] for s in stations]
        self.assertIn("KNYC", ids)
        self.assertIn("KHPN", ids)

    def test_current_weather(self):
        res = self.client.get("/api/weather/current?station=KNYC")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["station_id"], "KNYC")
        self.assertIn("temperature_f", data)
        self.assertIn("feels_like_f", data)

    def test_forecast_endpoints(self):
        res_3d = self.client.get("/api/weather/forecast?station=KNYC&days=3")
        self.assertEqual(res_3d.status_code, 200)
        self.assertEqual(len(res_3d.json()), 3)

        res_7d = self.client.get("/api/weather/forecast?station=KHPN&days=7")
        self.assertEqual(res_7d.status_code, 200)
        self.assertEqual(len(res_7d.json()), 7)

        res_14d = self.client.get("/api/weather/forecast?station=KNYC&days=14")
        self.assertEqual(res_14d.status_code, 200)
        self.assertEqual(len(res_14d.json()), 14)

        res_21d = self.client.get("/api/weather/forecast?station=KNYC&days=21")
        self.assertEqual(res_21d.status_code, 200)
        self.assertEqual(len(res_21d.json()), 21)

        res_30d = self.client.get("/api/weather/forecast?station=KNYC&days=30")
        self.assertEqual(res_30d.status_code, 200)
        self.assertEqual(len(res_30d.json()), 30)

    def test_hourly_endpoint(self):
        res = self.client.get("/api/weather/hourly?station=KNYC&hours=48")
        self.assertEqual(res.status_code, 200)
        items = res.json()
        self.assertEqual(len(items), 48)
        self.assertIn("temperature_f", items[0])
        self.assertIn("wind_speed_mph", items[0])

    def test_indicators_endpoint(self):
        res = self.client.get("/api/weather/indicators?station=KNYC")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("daily_hdd", data)
        self.assertIn("cumulative_hdd_7d", data)
        self.assertIn("cold_weather_level", data)
        self.assertIn("composite_weather_index", data)

    def test_compare_endpoint(self):
        res = self.client.get("/api/weather/compare")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("central_park", data)
        self.assertIn("white_plains", data)
        self.assertIn("temperature_delta", data)
        self.assertIn("hdd_delta_7d", data)

    def test_settings_endpoint(self):
        # Update settings
        payload = {
            "hdd_base_temp": 62.0,
            "cold_threshold_elevated": 32.0,
            "cold_threshold_high": 22.0,
            "cold_threshold_extreme": 12.0,
            "rapid_drop_threshold": 12.0,
            "auto_refresh_minutes": 10,
            "temp_unit": "F"
        }
        post_res = self.client.post("/api/settings", json=payload)
        self.assertEqual(post_res.status_code, 200)
        self.assertEqual(post_res.json()["hdd_base_temp"], 62.0)

        # Retrieve settings
        get_res = self.client.get("/api/settings")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["hdd_base_temp"], 62.0)

if __name__ == '__main__':
    unittest.main()
