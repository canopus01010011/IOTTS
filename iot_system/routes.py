"""GPX route parsing — shared by HTTP API and GPS simulator."""
from pathlib import Path
import re

BASE_DIR = Path(__file__).parent

ROUTE_MAPPING: dict[str, str] = {
    "OS-APN": "OS_APN.gpx",
    "OS-BabaHassen": "OS_BabaHassen.gpx",
    "OS-Birtouta": "OS_Birtouta.gpx",
    "OS-Bouzareah": "OS_Bouzareah.gpx",
    "OS-Cheraga": "OS_Cheraga.gpx",
    "OS-Draria": "OS_Draria.gpx",
    "OS-HusseinDey": "OS_HusseinDey.gpx",
    "OS-Meftah": "OS_Meftah.gpx",
    "OS-Sablettes": "OS_Sablettes.gpx",
    "OS-Souakria": "OS_Souakria.gpx",
}


def list_routes() -> list[str]:
    return list(ROUTE_MAPPING.keys())


def get_waypoints(route_name: str) -> list[dict[str, float]]:
    gpx_file = ROUTE_MAPPING.get(route_name)
    if not gpx_file:
        return []

    gpx_path = BASE_DIR / gpx_file
    if not gpx_path.exists():
        return []

    content = gpx_path.read_text(encoding="utf-8")
    waypoints: list[dict[str, float]] = []
    pattern = re.compile(r'<trkpt lat="([\d.-]+)" lon="([\d.-]+)"')

    for lat, lon in pattern.findall(content):
        waypoints.append({"latitude": float(lat), "longitude": float(lon)})

    return waypoints
