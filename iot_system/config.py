from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return int(raw)


# Defaults match backend public HiveMQ (plain MQTT on 1883)
BROKER_HOST = os.getenv("BROKER_HOST") or "broker.hivemq.com"
BROKER_PORT = _env_int("BROKER_PORT", 1883)
MQTT_USERNAME = os.getenv("MQTT_USERNAME") or ""
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD") or ""

TOPIC_GPS = "ericsson/sites/{siteID}/{deviceID}/gps"

# Must match backend gpsSimulationService (ericsson/simulation/start/{deviceSerial})
SIMULATION_START_TOPIC = os.getenv("MQTT_SIMULATION_START_TOPIC") or "ericsson/simulation/start"
SIMULATION_STOP_TOPIC = os.getenv("MQTT_SIMULATION_STOP_TOPIC") or "ericsson/simulation/stop"

GPS_INTERVAL = _env_int("GPS_INTERVAL", 5)

BASE_DIR = Path(__file__).parent

DEVICES = [
    {"siteID": "site_alger", "deviceID": "package_001", "route": "OS-Draria", "gpx_file": BASE_DIR / "OS_Draria.gpx"},
    {"siteID": "site_alger", "deviceID": "package_002", "route": "OS-Meftah", "gpx_file": BASE_DIR / "OS_Meftah.gpx"},
    {"siteID": "site_alger", "deviceID": "package_003", "route": "OS-Cheraga", "gpx_file": BASE_DIR / "OS_Cheraga.gpx"},
    {"siteID": "site_alger", "deviceID": "package_004", "route": "OS-Bouzareah", "gpx_file": BASE_DIR / "OS_Bouzareah.gpx"},
    {"siteID": "site_alger", "deviceID": "package_005", "route": "OS-BabaHassen", "gpx_file": BASE_DIR / "OS_BabaHassen.gpx"},
    {"siteID": "site_alger", "deviceID": "package_006", "route": "OS-Souakria", "gpx_file": BASE_DIR / "OS_Souakria.gpx"},
    {"siteID": "site_alger", "deviceID": "package_007", "route": "OS-APN", "gpx_file": BASE_DIR / "OS_APN.gpx"},
    {"siteID": "site_alger", "deviceID": "package_008", "route": "OS-HusseinDey", "gpx_file": BASE_DIR / "OS_HusseinDey.gpx"},
    {"siteID": "site_alger", "deviceID": "package_009", "route": "OS-Birtouta", "gpx_file": BASE_DIR / "OS_Birtouta.gpx"},
    {"siteID": "site_alger", "deviceID": "package_010", "route": "OS-Sablettes", "gpx_file": BASE_DIR / "OS_Sablettes.gpx"},
]


def mqtt_configured() -> bool:
    return bool(BROKER_HOST and BROKER_PORT)
