# IoT GPS Simulator (`iot_system`)

Publishes simulated delivery GPS along GPX routes to MQTT. The **ErcTrack backend** subscribes to the same broker and stores positions for the web admin and mobile app.

## Topic & payload

- **Topic:** `ericsson/sites/{siteID}/{deviceID}/gps`
- **Example:** `ericsson/sites/site_alger/package_001/gps`
- **Payload:**

```json
{
  "latitude": 36.7538,
  "longitude": 3.0588,
  "heading": 90.5,
  "battery": 65,
  "timestamp": "2025-01-15T10:00:00Z"
}
```

## Quick start (local)

### 1. Start Mosquitto + Postgres

```bash
cd backend
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed:iot    # creates containers + GPS devices package_001..003
npm run dev
```

Assign a mission `container_id` to one of the seeded containers (`CTR-IOT-*`).

### 3. Simulator (listen — recommended)

```bash
cd iot_system
pip install paho-mqtt gpxpy python-dotenv
cp .env.example .env
python gps_simulator.py --listen
```

Each route starts at **Oued Smar** (first GPX point) only when the assigned driver scans the **mission QR** in the app (backend publishes `ericsson/simulation/start/package_00x`).

Legacy: `python gps_simulator.py --all` runs all routes immediately.

### 4. Clients

- **Web admin:** Suivi missions → open map (site + live container + trail)
- **Mobile:** Map tab on active mission with `container_id`

## Device IDs

| Simulator `deviceID` | DB `device_serial_number` | Container QR   |
|----------------------|---------------------------|----------------|
| `package_001`        | `package_001`             | `CTR-IOT-001`  |
| `package_002`        | `package_002`             | `CTR-IOT-002`  |
| `package_003`        | `package_003`             | `CTR-IOT-003`  |

Mission import can also create GPS with matching `device_serial_number` in `container.gps_device`.

## Environment

See `.env.example`. For local Mosquitto use `MQTT_USE_TLS=false` and port `1883`.

## Architecture

```
gps_simulator.py → MQTT (Mosquitto)
                → backend mqttBridge.ts
                → PostgreSQL tracking_data
                → GET /api/gps/live & /container/:id/history
                → web_admin + mobile_app (poll every 10s)
```

Optional: Socket.IO `gps-update` on room `tracking` (backend already emits).
