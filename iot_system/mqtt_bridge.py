import paho.mqtt.client as mqtt
import ssl
import json
import requests
from config import *

def on_message(client, userdata, message):
    parts = message.topic.split("/")
    site_id = parts[2]
    device_id = parts[3]
    payload = json.loads(message.payload.decode())
    payload["siteID"] = site_id
    payload["deviceID"] = device_id
    #requests.post(URL du backend, json=payload)

if __name__ == "__main__":
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.tls_set(tls_version=ssl.PROTOCOL_TLS)
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.connect(BROKER_HOST, BROKER_PORT)
    print("Connected to the broker MQTT")
    client.on_message = on_message
    client.subscribe("ericsson/sites/+/+/gps")

    client.loop_forever()
