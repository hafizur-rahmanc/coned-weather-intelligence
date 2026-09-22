import unittest
from app.services.nws_client import (
    c_to_f, kmh_to_mph, ms_to_mph, pa_to_inhg, deg_to_cardinal, calculate_wind_chill
)

class TestModelsAndUnits(unittest.TestCase):
    def test_temperature_conversion(self):
        self.assertEqual(c_to_f(0.0), 32.0)
        self.assertEqual(c_to_f(10.0), 50.0)
        self.assertEqual(c_to_f(20.0), 68.0)
        self.assertIsNone(c_to_f(None))

    def test_speed_conversion(self):
        self.assertEqual(kmh_to_mph(10.0), 6.2)
        self.assertEqual(ms_to_mph(5.0), 11.2)
        self.assertIsNone(kmh_to_mph(None))

    def test_pressure_conversion(self):
        # 101325 Pa is approx 29.92 inHg
        self.assertAlmostEqual(pa_to_inhg(101325), 29.92, places=1)
        self.assertIsNone(pa_to_inhg(None))

    def test_cardinal_directions(self):
        self.assertEqual(deg_to_cardinal(0), "N")
        self.assertEqual(deg_to_cardinal(90), "E")
        self.assertEqual(deg_to_cardinal(180), "S")
        self.assertEqual(deg_to_cardinal(270), "W")
        self.assertEqual(deg_to_cardinal(45), "NE")

    def test_wind_chill(self):
        # Temp 30F, wind 15 mph should have lower wind chill
        wc = calculate_wind_chill(30.0, 15.0)
        self.assertTrue(wc < 30.0)
        # Temp 60F, wind chill should not apply
        self.assertEqual(calculate_wind_chill(60.0, 15.0), 60.0)

if __name__ == '__main__':
    unittest.main()
