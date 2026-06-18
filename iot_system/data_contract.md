# GPS Data Contract

## MQTT Topic
ericsson/sites/{siteID}/{deviceID}/gps

## Payload
| Field | Type | Example |
|---|---|---|
| latitude | float | 36.7538 |
| longitude | float | 3.0588 |
| heading | float | 90.5 |
| battery | int | 65 |
| timestamp | string | 2025-01-15T10:00:00Z |

## Example
JSON Format
```
{
    "latitude": 36.7538,
    "longitude": 3.0588,
    "heading": 90.5,
    "battery": 65,
    "timestamp": "2025-01-15T10:00:00Z"
}
```

## Frequency
Every 10 seconds for the GPS  
Every 30 seconds for the battery percentage

## Producer
gps_simulator.py → publishes to MQTT broker (HiveMQ)

## Consumer
Node backend `mqttBridge.ts` subscribes to `ericsson/sites/+/+/gps`, saves to PostgreSQL, emits Socket.IO `gps-update`. Web admin and mobile read `GET /api/gps/container/:id/live` and `/history`.

## Mission-triggered simulation (QR scan)

When a driver scans a mission QR at the warehouse, the backend publishes:

| Topic | Payload |
|---|---|
| `ericsson/simulation/start/{deviceSerial}` | `{"missionId":"MIS-…","action":"start","warehouse":"Entrepôt Oued Smar"}` |
| `ericsson/simulation/stop/{deviceSerial}` | `{"missionId":"MIS-…","action":"stop"}` |

Run the simulator in listen mode (default when started via `start.py` with `IOT_RUN_SIMULATOR=true`):

```bash
python gps_simulator.py --listen
```

The simulator publishes GPX waypoints on `ericsson/sites/{siteID}/{deviceID}/gps` only for the device that received a start message. Technician delivery scan publishes stop.