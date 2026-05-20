from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

BROKER_HOST = os.getenv("BROKER_HOST", "localhost")
BROKER_PORT = int(os.getenv("BROKER_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_USE_TLS = os.getenv("MQTT_USE_TLS", "false").lower() in ("1", "true", "yes")

TOPIC_GPS = "ericsson/sites/{siteID}/{deviceID}/gps"

GPS_INTERVAL = int(os.getenv("GPS_INTERVAL", "10"))

DEVICES = [
    {
        "siteID": "site_alger",
        "deviceID": "package_001",
        "route": "OS-Draria",
        "gpx_file": str(BASE_DIR / "OS_Draria.gpx"),
    },
    {
        "siteID": "site_alger",
        "deviceID": "package_002",
        "route": "OS-Meftah",
        "gpx_file": str(BASE_DIR / "OS_Meftah.gpx"),
    },
    {
        "siteID": "site_alger",
        "deviceID": "package_003",
        "route": "OS-Cheraga",
        "gpx_file": str(BASE_DIR / "OS_Cheraga.gpx"),
    },
]
