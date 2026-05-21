# Mission JSON & simulations IoT

## Entrepôt Oued Smar (point de départ)

Toutes les routes GPX commencent à **Oued Smar** (coordonnées dans `iot-simulation-qr-codes.json` → `warehouse`).

Sur les cartes (admin + mobile) : marqueur **🏭 Entrepôt Oued Smar**.

## Simulations (3 routes)

| Route | Mission JSON | Conteneur (secours) | GPS device |
|-------|----------------|-----------------------------------|------------|
| OS_Draria | `mission-iot-package_001.json` | CTR-IOT-001 | package_001 |
| OS_Meftah | `mission-iot-package_002.json` | CTR-IOT-002 | package_002 |
| OS_Cheraga | `mission-iot-package_003.json` | CTR-IOT-003 | package_003 |

Référence complète : `iot-simulation-qr-codes.json`  
**QR imprimables :** `qr-labels.html` (missions + conteneurs). Après import, ouvrez avec  
`?draria=MIS-xxx&meftah=MIS-yyy&cheraga=MIS-zzz` pour générer les QR mission.

## Workflow

1. `npm run seed:iot` — entrepôt Oued Smar + conteneurs/GPS.
2. `python gps_simulator.py --listen` dans `iot_system` (une fois, en arrière-plan).
3. Importez le JSON mission (conducteur + technicien réels).
4. Imprimez le QR **MIS-…** de la mission (`qr-labels.html` ou détail mission admin).
5. **Conducteur assigné** scanne le QR **mission** à l'entrepôt → mission `in-progress` + simulation GPX depuis le point départ.
6. Technicien scanne le même **MIS-…** sur le site de livraison → `completed`.

Le scan conteneur `CTR-IOT-00x` reste accepté en secours (même effet si une mission pending est liée au conteneur).

## Dates (with time)

`scheduled_start_date` et `scheduled_end_date` : ISO datetime, ex. `2026-05-21T08:30:00.000Z`.

## Equipment

```json
"equipment_list": [
  { "label": "Fibre optique", "quantity": 1 }
]
```

## Import rules

- Conducteur et technicien doivent exister en base.
- Site, conteneur, équipement peuvent être créés automatiquement.
- GPS `device_status: inactive` jusqu'au scan entrepôt.
