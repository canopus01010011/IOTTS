# Delivery workflow

## 1. Admin creates mission

- Status: **pending**
- Container → `assigned`, notifications sent to **driver** and **technician**
- Use `web_admin/examples/mission-iot-package_001.json` for IoT demo (`package_001`, `CTR-IOT-001`)

## 2. Scheduled start (notifications)

- Scheduler runs every minute (2h window)
- When `scheduled_start_date` is reached: push + DB notification  
  *"Scannez le QR du conteneur…"*

## 3. Warehouse — driver scans container QR

- Driver app → **QR** tab → scan `CTR-IOT-001` (or container QR JSON)
- `POST /api/deliveries/scan` with `{ qrCode }`
- Effects:
  - Mission → **in-progress**
  - Container → **in_transit**
  - Equipment → **in_use**
  - Driver **+5** score
  - Technician notified
- Start `iot_system/gps_simulator.py` for live GPS

## 4. Tracking

| Role | Where |
|------|--------|
| Driver / Tech | Mobile **Map** (only when mission `in-progress`) |
| Admin | **Suivi missions** → click mission card |
| Admin | **Créer mission** → map after create (pending until driver scans) |

## 5. Site — technician scans mission QR

- Tech app → **QR** → scan **mission ID** (`MIS-…`)
- `POST /api/deliveries/scan` with `{ missionId }`
- Effects:
  - Mission → **completed**
  - Container → **delivered**
  - Equipment → **available**
  - Driver score +10 (on time) or -3 (late)
  - Technician **+15** score, both `missions_completed` +1

## QR codes to print

| QR content | Who scans | When |
|------------|-----------|------|
| `CTR-IOT-001` (container `qr_code`) | Driver | Warehouse |
| `MIS-XXXXXX` (mission id) | Technician | Delivery site |

## Setup

```bash
cd backend && npm run seed:iot && npm run dev
cd iot_system && python gps_simulator.py
```
