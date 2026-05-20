import paho.mqtt.client as mqtt
import ssl
import gpxpy
import gpxpy.gpx
import math
import json
import threading
from datetime import datetime, timezone
from time import sleep
from config import *


def calculate_heading(lat1, lon1, lat2, lon2):
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)
    d_lon = lon2 - lon1
    x = math.sin(d_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(d_lon)
    heading = math.degrees(math.atan2(x, y))
    return (heading + 360) % 360


def payload_create(lat, lon, heading, battery):
    return {
        "latitude": lat,
        "longitude": lon,
        "heading": heading,
        "battery": battery,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def run_device(client, device):
    points = []
    topic = TOPIC_GPS.format(siteID=device["siteID"], deviceID=device["deviceID"])
    with open(device["gpx_file"], "r", encoding="utf-8") as f:
        gpx = gpxpy.parse(f)
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                points.append((point.latitude, point.longitude))

    if not points:
        print(f"No GPX points for {device['deviceID']} ({device['gpx_file']})")
        return

    print(f"Simulating {device['deviceID']} on {topic} ({len(points)} points)")
    last_heading = 0
    battery = 100
    battery_counter = 0
    for i in range(len(points)):
        battery_counter += 1
        if battery_counter == 3:
            battery -= 1
            battery_counter = 0
        if i == len(points) - 1:
            heading = last_heading
        else:
            heading = calculate_heading(
                points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]
            )
            last_heading = heading
        payload = payload_create(points[i][0], points[i][1], heading, battery)
        client.publish(topic, json.dumps(payload))
        sleep(GPS_INTERVAL)


if __name__ == "__main__":
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    if MQTT_USE_TLS:
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)
    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    client.connect(BROKER_HOST, BROKER_PORT)
    client.loop_start()
    print(f"Connected to MQTT {BROKER_HOST}:{BROKER_PORT} (TLS={MQTT_USE_TLS})")

    for device in DEVICES:
        t = threading.Thread(target=run_device, args=(client, device), daemon=True)
        t.start()

    try:
        while True:
            sleep(60)
    except KeyboardInterrupt:
        print("Stopping simulator…")
