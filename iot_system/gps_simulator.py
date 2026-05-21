"""
GPS simulator — publishes GPX routes to MQTT.

Modes:
  python gps_simulator.py --listen     (default) wait for ericsson/simulation/start/{deviceID}
  python gps_simulator.py --device package_001
  python gps_simulator.py --all          run all devices immediately (legacy demo)
"""
import argparse
import json
import math
import ssl
import threading
from datetime import datetime, timezone
from time import sleep

import gpxpy
import gpxpy.gpx
import paho.mqtt.client as mqtt

from config import *

SIMULATION_START_TOPIC = "ericsson/simulation/start/#"

_running: dict[str, threading.Event] = {}
_running_lock = threading.Lock()


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


def load_track_points(gpx_file: str) -> list[tuple[float, float]]:
    points = []
    with open(gpx_file, "r", encoding="utf-8") as f:
        gpx = gpxpy.parse(f)
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                points.append((point.latitude, point.longitude))
    return points


def run_device_route(client, device, stop_event: threading.Event):
    """Publish GPX from point départ (first track point) until route end or stop."""
    points = load_track_points(device["gpx_file"])
    if not points:
        print(f"No GPX points for {device['deviceID']} ({device['gpx_file']})")
        return

    topic = TOPIC_GPS.format(siteID=device["siteID"], deviceID=device["deviceID"])
    print(
        f"▶ Simulation {device['deviceID']} ({device['route']}) — "
        f"départ {points[0][0]:.5f}, {points[0][1]:.5f} — {len(points)} points"
    )

    last_heading = 0
    battery = 100
    battery_counter = 0

    for i in range(len(points)):
        if stop_event.is_set():
            print(f"⏹ Stopped {device['deviceID']}")
            return

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

    print(f"✓ Route finished for {device['deviceID']}")


def device_by_id(device_id: str) -> dict | None:
    for d in DEVICES:
        if d["deviceID"] == device_id:
            return d
    return None


def start_device_simulation(client, device_id: str, mission_id: str | None = None):
    device = device_by_id(device_id)
    if not device:
        print(f"Unknown device: {device_id}")
        return

    with _running_lock:
        existing = _running.get(device_id)
        if existing:
            existing.set()
        stop_event = threading.Event()
        _running[device_id] = stop_event

    label = f" mission={mission_id}" if mission_id else ""
    print(f"Starting GPS simulation for {device_id}{label}")

    def worker():
        try:
            run_device_route(client, device, stop_event)
        finally:
            with _running_lock:
                if _running.get(device_id) is stop_event:
                    del _running[device_id]

    threading.Thread(target=worker, daemon=True).start()


def on_mqtt_message(client, userdata, msg):
    if not msg.topic.startswith("ericsson/simulation/start/"):
        return
    device_id = msg.topic.rsplit("/", 1)[-1]
    mission_id = None
    try:
        body = json.loads(msg.payload.decode("utf-8"))
        mission_id = body.get("missionId")
    except (json.JSONDecodeError, UnicodeDecodeError):
        pass
    start_device_simulation(client, device_id, mission_id)


def connect_client() -> mqtt.Client:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    if MQTT_USE_TLS:
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)
    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_message = on_mqtt_message
    client.connect(BROKER_HOST, BROKER_PORT)
    client.loop_start()
    print(f"Connected to MQTT {BROKER_HOST}:{BROKER_PORT} (TLS={MQTT_USE_TLS})")
    return client


def run_listen(client):
    client.subscribe(SIMULATION_START_TOPIC, qos=1)
    print(f"Listening for simulation start on {SIMULATION_START_TOPIC}")
    print("Driver scan (mission QR) in the app triggers the backend → MQTT start message.")
    try:
        while True:
            sleep(60)
    except KeyboardInterrupt:
        print("Stopping simulator…")
        with _running_lock:
            for ev in _running.values():
                ev.set()


def run_all(client):
    for device in DEVICES:
        start_device_simulation(client, device["deviceID"])
    try:
        while True:
            sleep(60)
    except KeyboardInterrupt:
        print("Stopping simulator…")


def main():
    parser = argparse.ArgumentParser(description="IoT GPS route simulator")
    parser.add_argument(
        "--listen",
        action="store_true",
        help="Wait for MQTT ericsson/simulation/start/{deviceID} (recommended)",
    )
    parser.add_argument("--device", type=str, help="Run a single device once (no MQTT listen)")
    parser.add_argument("--all", action="store_true", help="Start all routes immediately")
    args = parser.parse_args()

    client = connect_client()

    if args.device:
        stop = threading.Event()
        device = device_by_id(args.device)
        if not device:
            print(f"Unknown device: {args.device}. Available: {[d['deviceID'] for d in DEVICES]}")
            return
        run_device_route(client, device, stop)
        client.loop_stop()
        return

    if args.all:
        run_all(client)
        return

    run_listen(client)


if __name__ == "__main__":
    main()
