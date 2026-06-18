import argparse
import json
import math
import threading
from datetime import datetime, timezone
from time import sleep
from typing import Dict, Optional, Tuple

import gpxpy
import gpxpy.gpx
import paho.mqtt.client as mqtt

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


def find_device(device_id: str) -> Optional[dict]:
    for device in DEVICES:
        if device["deviceID"] == device_id:
            return device
    return None


# device_id -> (thread, stop_event)
_active: Dict[str, Tuple[threading.Thread, threading.Event]] = {}
_active_lock = threading.Lock()


def run_device(client, device, stop_event: threading.Event):
    points = []
    topic = TOPIC_GPS.format(siteID=device["siteID"], deviceID=device["deviceID"])
    try:
        with open(device["gpx_file"], "r", encoding="utf-8") as f:
            gpx = gpxpy.parse(f)
        for track in gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    points.append((point.latitude, point.longitude))

        if not points:
            print(f"No GPX points for {device['deviceID']} ({device['gpx_file']})")
            return

        last_heading = 0
        battery = 100
        battery_counter = 0

        for i in range(len(points)):
            if stop_event.is_set():
                break
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
            if stop_event.wait(timeout=GPS_INTERVAL):
                break

        print(f"Route finished for {device['deviceID']} ({len(points)} waypoints)")
    except Exception as e:
        print(f"Error in {device['deviceID']}: {e}")
    finally:
        with _active_lock:
            _active.pop(device["deviceID"], None)


def start_device_simulation(client: mqtt.Client, device_id: str, mission_id: Optional[str] = None):
    device = find_device(device_id)
    if not device:
        print(f"Unknown device serial: {device_id}")
        return

    with _active_lock:
        if device_id in _active:
            print(f"Simulation already running for {device_id}")
            return
        stop_event = threading.Event()
        thread = threading.Thread(
            target=run_device,
            args=(client, device, stop_event),
            daemon=True,
        )
        _active[device_id] = (thread, stop_event)
        thread.start()

    label = f" (mission {mission_id})" if mission_id else ""
    print(
        f"▶ Started GPS simulation for {device_id} route={device.get('route')}{label}"
    )


def stop_device_simulation(device_id: str):
    with _active_lock:
        entry = _active.pop(device_id, None)
    if not entry:
        print(f"No active simulation for {device_id}")
        return
    thread, stop_event = entry
    stop_event.set()
    thread.join(timeout=GPS_INTERVAL * 3)
    print(f"■ Stopped GPS simulation for {device_id}")


def _device_id_from_topic(topic: str, prefix: str) -> Optional[str]:
    if not topic.startswith(prefix + "/"):
        return None
    device_id = topic[len(prefix) + 1 :].strip("/")
    return device_id or None


def make_on_message(client: mqtt.Client):
    def on_message(_client, _userdata, msg):
        topic = msg.topic
        payload = {}
        if msg.payload:
            try:
                payload = json.loads(msg.payload.decode("utf-8"))
            except json.JSONDecodeError:
                payload = {}

        mission_id = payload.get("missionId")

        device_id = _device_id_from_topic(topic, SIMULATION_START_TOPIC)
        if device_id:
            start_device_simulation(client, device_id, mission_id)
            return

        device_id = _device_id_from_topic(topic, SIMULATION_STOP_TOPIC)
        if device_id:
            stop_device_simulation(device_id)
            return

        print(f"Ignored simulation topic: {topic}")

    return on_message


def run_listen_mode(client: mqtt.Client):
    start_wildcard = f"{SIMULATION_START_TOPIC}/#"
    stop_wildcard = f"{SIMULATION_STOP_TOPIC}/#"
    client.on_message = make_on_message(client)
    client.subscribe(start_wildcard, qos=1)
    client.subscribe(stop_wildcard, qos=1)
    print(f"Listening for mission starts → {start_wildcard}")
    print(f"Listening for mission stops  → {stop_wildcard}")
    print("Waiting for driver QR scan (backend publishes start/stop)…")


def run_all_devices_mode(client: mqtt.Client, stop_event: threading.Event):
    print("Running all devices (legacy mode — not QR-gated)")
    for device in DEVICES:
        t = threading.Thread(
            target=run_device, args=(client, device, stop_event), daemon=True
        )
        t.start()


def connect_client() -> mqtt.Client:
    print(f"Connecting to MQTT {BROKER_HOST}:{BROKER_PORT}...")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()
    print("Connected to MQTT broker")
    return client


def main():
    parser = argparse.ArgumentParser(description="Ericsson IoT GPS simulator")
    parser.add_argument(
        "--listen",
        action="store_true",
        help="Start simulation only when backend publishes ericsson/simulation/start/{device}",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all GPX routes immediately (legacy demo mode)",
    )
    args = parser.parse_args()

    listen = args.listen or (not args.all)
    client = connect_client()

    if listen:
        run_listen_mode(client)
        try:
            while True:
                sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down…")
            with _active_lock:
                ids = list(_active.keys())
            for device_id in ids:
                stop_device_simulation(device_id)
    else:
        stop_event = threading.Event()
        run_all_devices_mode(client, stop_event)
        try:
            while not stop_event.is_set():
                stop_event.wait(timeout=1)
        except KeyboardInterrupt:
            print("\nStopping simulation…")
            stop_event.set()

    client.loop_stop()
    client.disconnect()


if __name__ == "__main__":
    main()
