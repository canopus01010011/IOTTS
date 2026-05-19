from dotenv import load_dotenv
import os

load_dotenv()

BROKER_HOST = os.getenv("BROKER_HOST")
BROKER_PORT = int(os.getenv("BROKER_PORT"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")

TOPIC_GPS = "ericsson/sites/{siteID}/{deviceID}/gps"

GPS_INTERVAL = 10

DEVICES = [
    {'siteID': 'site_alger', 'deviceID': 'package_001', 'route': 'OS-Draria', 'gpx_file': 'roads/OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'package_002', 'route': 'OS-Meftah', 'gpx_file': 'roads/OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'package_003', 'route': 'OS-Cheraga', 'gpx_file': 'roads/OS_Cheraga.gpx'},
]