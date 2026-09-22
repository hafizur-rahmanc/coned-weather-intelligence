# Con Edison Gas Engineering — NOAA Weather Intelligence Dashboard

A production-grade, enterprise weather and load intelligence dashboard built for the **Consolidated Edison (Con Edison) Gas Engineering & Gas Operations** team.

The platform provides real-time monitoring of atmospheric conditions influencing **gas system demand, heating load, operational planning, and short-term forecasting** across the New York service territory.

---

## 🚀 Live Production Deployment

* **Live Cloud Run URL:** [https://coned-weather-intelligence-559361070307.us-east1.run.app](https://coned-weather-intelligence-559361070307.us-east1.run.app)
* **Local Preview URL:** `http://localhost:8000`

---

## ⚡ Key Capabilities

### 1. Authoritative Government Meteorological Data Pipeline
* Connects directly to the official **National Oceanic and Atmospheric Administration (NOAA) / National Weather Service (NWS)** API (`api.weather.gov`).
* Identifies traffic with compliant enterprise headers: `User-Agent: (ConEdisonGasEngineeringDashboard/1.0, gasops-weather@coned.com)`.
* Pre-configured and validated observation stations:
  * **Central Park (`KNYC`):** Manhattan / NYC urban core (WFO Upton `OKX`, Grid `34,45`).
  * **White Plains (`KHPN`):** Westchester County Airport (WFO Upton `OKX`, Grid `39,58`).
* Intelligent in-memory TTL caching (3 min observations, 10 min forecasts, 2 min alerts) with graceful offline fallback.

### 2. Gas Operations Indicators & Thermal Demand Analytics
* **Heating Degree Days (HDD):** Real-time computation using $HDD = \max(0, T_{\text{base}} - T_{\text{avg}})$. Supports user-configurable base temperatures (default $65^\circ\text{F}$, $62^\circ\text{F}$, $60^\circ\text{F}$, $55^\circ\text{F}$), computing Today's HDD and cumulative 3-day, 5-day, and 7-day totals.
* **Temperature Dynamics & Trajectory:** Rolling past 24-hour observed $\Delta T$, expected next 24-hour forecast delta, and multi-day trend classification (*Warming*, *Stable*, *Cooling*).
* **Rapid Temperature Drop Alert:** Continuous 24-hour rolling scan triggering an advisory upon steep temperature plunges ($\ge 15^\circ\text{F}$ drop in 24 hours).
* **Cold Weather Operational Tiers:** Categorizes projected minimums into utility risk brackets (*Normal $\ge 35^\circ\text{F}$*, *Elevated $< 35^\circ\text{F}$*, *High $< 25^\circ\text{F}$*, *Extreme $< 15^\circ\text{F}$*).
* **Composite Weather Index (CWI):** Combines ambient temperature and convective wind cooling into an operational demand proxy: $CWI = HDD \times (1 + \frac{V_{\text{wind}}}{50})$.

### 3. Engineering Visualizations & UI
* **Continuous Temperature Trend:** Historical 24h observations seamlessly joined with the 48h model forecast, divided by a vertical red **`NOW`** marker and daily high/low reference baselines.
* **48-Hour Hourly Interactive Chart:** Interactive toggles for Temperature, Dew Point, Precipitation %, Wind Speed, and Wind Gust with diagnostic hover tooltips.
* **Multi-Period Operational Forecast:** Switchable 3-Day, 5-Day, and 7-Day tabs with high/low envelope lines and visual temperature range bars (`Low XX°F ──── High YY°F`).
* **Side-by-Side Station Comparison:** Regional matrix comparing Central Park and Westchester County micro-climates, temperature deltas, and cumulative HDD variance.
* **Historical Baseline & Anomaly Tracking:** 7, 14, 30, and 90-day climatological reanalysis with a Recent 7-Day vs. Next 7-Day demand comparison panel.
* **Engineering Settings & NOC Dark Mode:** Modal dialog to customize thresholds, sync intervals, and toggle between daytime and 24/7 dark control-room modes.

---

## 🛠️ Architecture & Tech Stack

```
coned-weather-intelligence/
├── backend/
│   ├── app/
│   │   ├── api/endpoints.py       # FastAPI REST endpoints
│   │   ├── models/weather.py      # Pydantic data models & converters
│   │   ├── services/
│   │   │   ├── nws_client.py      # NOAA/NWS API async client with TTL cache
│   │   │   ├── station_resolver.py# Station registry and point resolution
│   │   │   ├── gas_indicators.py  # HDD, rapid drop, cold tiers, CWI
│   │   │   └── historical_service.py # Historical reanalysis & comparisons
│   │   └── main.py                # FastAPI app entrypoint & SPA static serving
│   └── tests/                     # 19 comprehensive unit & integration tests
└── frontend/
    ├── src/
    │   ├── api/weatherApi.ts      # Typed client API services
    │   ├── components/            # Specialized operational UI components
    │   ├── types/weather.ts       # TypeScript data interfaces
    │   ├── App.tsx                # Dashboard coordinator & state management
    │   └── main.tsx               # React 19 entrypoint
    ├── dist/                      # Production bundled SPA assets
    └── package.json
```

* **Backend:** Python 3.12+, FastAPI, Uvicorn, HTTPX, Pydantic v2
* **Frontend:** React 19, TypeScript, Vite, Lucide Icons, Custom Responsive SVG Data Charts
* **Cloud Runtime:** Google Cloud Run (Containerized serverless HTTP/2 microservice)

---

## 💻 Local Development Setup

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn httpx pydantic

# Run automated tests
PYTHONPATH=. python -m unittest discover -s tests

# Start FastAPI server
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build   # Compiles to frontend/dist for FastAPI to serve
```

Visit `http://localhost:8000` to interact with the dashboard.

---

## 🧪 Testing

The backend includes a comprehensive test suite covering mathematical models, unit conversions, gas load algorithms, and API endpoints:

```bash
PYTHONPATH=backend python3 -m unittest discover -s backend/tests
```

**Results:** 19/19 tests passing.

---

## 📜 Regulatory Disclaimer

*All indicators (Heating Degree Days, Composite Weather Index, and Cold Weather Status) are intended strictly as weather-based operational planning metrics and do not represent actual metered Con Edison customer sendout, pipeline pressures, or contract billing quantities.*
