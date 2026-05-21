# Delivery workflow

## 1. Admin creates mission

- Status: **pending**
- Container → `assigned`, notifications to driver and technician
- Use `web_admin/examples/mission-iot-package_001.json` (route OS_Draria, `package_001`)

## 2. Scheduled start (notifications)

- Scheduler: 2h window before `scheduled_start_date`
- Message: scan mission QR at **Entrepôt Oued Smar**

## 3. Simulator (once)

```bash
cd iot_system && python gps_simulator.py --listen
```

Waits for MQTT `ericsson/simulation/start/{deviceID}` — no GPS movement until driver scan.

## 4. Warehouse — driver scans **mission** QR

- Driver app → **QR** → scan **MIS-…** (assigned driver only)
- `POST /api/deliveries/scan` with `{ missionId }`
- Effects:
  - Mission → **in-progress**
  - Position initiale à **Oued Smar** (point départ)
  - MQTT start → GPX simulation for `package_00x`
  - Container → **in_transit**, GPS → **active**
- Fallback: container QR `CTR-IOT-001` if mission pending on that container

## 5. Tracking

| Role | Where |
|------|--------|
| Driver / Tech | Mobile **Map** (in-progress only; 🏭 warehouse + 🚛 IoT + 📍 site) |
| Admin | **Suivi missions** / **Créer mission** map |

## 6. Site — technician scans mission QR

- Tech scans **MIS-…** on delivery site
- Mission → **completed**, GPS → **inactive**

## QR codes

| QR | Who | When |
|----|-----|------|
| **MIS-XXXXXX** | Driver (assigned) | Oued Smar warehouse — starts simulation |
| **MIS-XXXXXX** | Technician | Delivery site |
| CTR-IOT-00x (optional) | Driver | Warehouse fallback |

Print: `web_admin/examples/qr-labels.html`  
Config: `web_admin/examples/iot-simulation-qr-codes.json`

## Setup

```bash
cd backend && npm run seed:iot && npm run dev
cd iot_system && python gps_simulator.py --listen
```
