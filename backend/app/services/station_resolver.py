import httpx
from typing import Dict, List, Optional
from app.models.weather import StationInfo

OFFICIAL_STATIONS: Dict[str, StationInfo] = {
    "KNYC": StationInfo(
        id="KNYC",
        name="Central Park, New York",
        location="New York City (Manhattan)",
        latitude=40.7812,
        longitude=-73.9665,
        grid_wfo="OKX",
        grid_x=34,
        grid_y=45,
        elevation_ft=154.0
    ),
    "KHPN": StationInfo(
        id="KHPN",
        name="White Plains / Westchester",
        location="Westchester County Airport, White Plains",
        latitude=41.0669,
        longitude=-73.7075,
        grid_wfo="OKX",
        grid_x=39,
        grid_y=58,
        elevation_ft=379.0
    )
}

class StationResolver:
    def __init__(self):
        self.stations = OFFICIAL_STATIONS.copy()

    def get_station(self, station_id: str) -> Optional[StationInfo]:
        sid = station_id.upper().strip()
        return self.stations.get(sid)

    def list_stations(self) -> List[StationInfo]:
        return list(self.stations.values())

    async def dynamically_verify_station(self, lat: float, lon: float, user_agent: str) -> Optional[StationInfo]:
        """
        Dynamically queries NWS API /points/{lat},{lon} to verify gridpoint and observation stations.
        """
        url = f"https://api.weather.gov/points/{lat},{lon}"
        headers = {"User-Agent": user_agent, "Accept": "application/geo+json"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    props = data.get("properties", {})
                    wfo = props.get("gridId", "OKX")
                    gx = props.get("gridX", 0)
                    gy = props.get("gridY", 0)
                    stations_url = props.get("observationStations")
                    
                    station_id = "UNKNOWN"
                    station_name = "NWS Station"
                    if stations_url:
                        s_res = await client.get(stations_url, headers=headers)
                        if s_res.status_code == 200:
                            s_data = s_res.json()
                            features = s_data.get("features", [])
                            if features:
                                primary = features[0].get("properties", {})
                                station_id = primary.get("stationIdentifier", station_id)
                                station_name = primary.get("name", station_name)
                                
                    return StationInfo(
                        id=station_id,
                        name=station_name,
                        location=f"{lat:.4f}, {lon:.4f}",
                        latitude=lat,
                        longitude=lon,
                        grid_wfo=wfo,
                        grid_x=gx,
                        grid_y=gy
                    )
        except Exception:
            return None
        return None
