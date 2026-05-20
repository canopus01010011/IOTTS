# Mission JSON

## Dates (with time)

`scheduled_start_date` and `scheduled_end_date` use **ISO datetime** (stored as `DATE` in PostgreSQL), e.g. `2026-05-21T08:30:00.000Z`.

## Equipment (not picked from catalog)

Enter equipment **labels** for this mission. On create, the API:

1. Inserts rows in table `equipment` (type = label, linked to mission)
2. Stores `equipment_list` on the mission as JSONB: `{ equipment_id, label, quantity }`

```json
"equipment_list": [
  { "label": "Fibre optique", "quantity": 1 }
]
```

Legacy import also accepts `"equipements": ["Fibre optique", "Câblage"]`.

## IoT simulation missions (3 routes)

| Route | Mission JSON | Container QR (driver @ warehouse) | GPS device |
|-------|----------------|-----------------------------------|------------|
| OS_Draria | `mission-iot-package_001.json` | **CTR-IOT-001** | `package_001` |
| OS_Meftah | `mission-iot-package_002.json` | **CTR-IOT-002** | `package_002` |
| OS_Cheraga | `mission-iot-package_003.json` | **CTR-IOT-003** | `package_003` |

Reference: `iot-simulation-qr-codes.json` — all payloads and coordinates.

**Printable QR labels:** open `qr-labels.html` in a browser → Print.

Steps per simulation:

1. Set **`driver_id`** and **`technician_id`** to real IDs from admin (Conducteurs / Techniciens), e.g. `USR-XXXXXX` — **not** the placeholder `PASTE_…` and **not** `REPLACE_WITH_EXISTING_DRIVER_EMAIL`.
2. Or click **Charger démo IoT** in admin (auto-fills first driver & technician from DB).
3. Import the matching JSON → mission **pending**, container `CTR-IOT-00x`, GPS `package_00x`.
3. Driver scans container QR at warehouse → **in-progress** + start `python gps_simulator.py`.
4. Technician scans **mission ID** (`MIS-…`) at delivery site → **completed**.

Site coordinates = **end** of each GPX route (delivery destination).

## Import rules

- **Driver & technician** must already exist in the database (they need passwords for mobile login). Resolve by `driver_id` / `technician_id` or nested `driver` / `technician` with `id`, `email`, or `phone`.
- **Site, container, equipment** can be created automatically if missing (same as before).

## Manual form equipment

Each line requires **type (label)**, **model**, and **serial_number** (plus quantity).

## APIs

- Form: `POST /api/missions`
- JSON file: `POST /api/missions/from-json` with `{ "reference": "...", "file_format": { ... } }`
- Template: `GET /api/missions/import-template`
- Containers: `GET/POST /api/containers`
