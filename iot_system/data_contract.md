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
mqtt_bridge.py → receives from broker → POST to backend REST API