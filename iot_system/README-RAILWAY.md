# Deploy IoT system on Railway (one service)

**Default:** route API only (map paths). GPS simulator is off until you set `IOT_RUN_SIMULATOR=true`.

Start command: `python start.py`

---

## 1. Create the IoT service (once)

1. Railway project → **+ New** → **GitHub Repo** → same `PFE` repo  
2. **Service name:** e.g. `iot-system`  
3. **Settings → Root Directory:** `iot_system`  
4. **Start command:**
   ```bash
   python start.py
   ```
5. **Networking → Generate Domain** → e.g. `iot-system-production.up.railway.app`

(Optional later — live GPS): `IOT_RUN_SIMULATOR=true` plus `BROKER_HOST`, `BROKER_PORT`, `MQTT_USERNAME`, `MQTT_PASSWORD`

### Test

```text
https://YOUR-IOT-DOMAIN.up.railway.app/health
https://YOUR-IOT-DOMAIN.up.railway.app/routes/OS-BabaHassen
```

---

## 2. Link backend to IoT routes

On your **backend** Railway service → **Variables**:

```env
IOT_SERVICE_URL=https://YOUR-IOT-DOMAIN.up.railway.app
```

Redeploy backend. It will load GPX waypoints from the IoT service instead of local files.

### Simulator (optional, off by default)

| Variable | Effect |
|----------|--------|
| `IOT_RUN_SIMULATOR=true` | Also start MQTT GPS simulator |
| `IOT_ROUTES_ONLY=true` | Same as default (routes only) |
| `IOT_SIMULATOR_ONLY=true` | Simulator only (no HTTP API) |

Default: **routes only** — no MQTT variables required.

---

## Commit & push

Ensure `iot_system/*.gpx` are in git, then push so Railway can deploy.
