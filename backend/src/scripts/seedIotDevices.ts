/**
 * Seeds demo containers + GPS devices matching iot_system simulator IDs (package_001…).
 * Run: npm run seed:iot  (from backend/)
 */
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database.js';
import { Container, GPSDevice, Site } from '../models/index.js';
import { WAREHOUSE } from '../constants/warehouse.js';

const IOT_DEVICES = [
  { qr_code: 'CTR-IOT-001', capacity: 120, serial: 'package_001' },
  { qr_code: 'CTR-IOT-002', capacity: 120, serial: 'package_002' },
  { qr_code: 'CTR-IOT-003', capacity: 120, serial: 'package_003' },
  { qr_code: 'CTR-IOT-004', capacity: 120, serial: 'package_004' },
  { qr_code: 'CTR-IOT-005', capacity: 120, serial: 'package_005' },
  { qr_code: 'CTR-IOT-006', capacity: 120, serial: 'package_006' },
  { qr_code: 'CTR-IOT-007', capacity: 120, serial: 'package_007' },
  { qr_code: 'CTR-IOT-008', capacity: 120, serial: 'package_008' },
  { qr_code: 'CTR-IOT-009', capacity: 120, serial: 'package_009' },
  { qr_code: 'CTR-IOT-010', capacity: 120, serial: 'package_010' },
];

async function seed() {
  await sequelize.authenticate();
  console.log('✅ DB connected');

  let warehouse = await Site.findOne({
    where: { name: WAREHOUSE.name },
  });
  if (!warehouse) {
    const legacy = await Site.findOne({ where: { name: 'Entrepôt — Départ simulation' } });
    if (legacy) {
      await legacy.update({
        name: WAREHOUSE.name,
        address: WAREHOUSE.address,
        latitude: WAREHOUSE.latitude,
        longitude: WAREHOUSE.longitude,
      });
      warehouse = legacy;
      console.log(`Updated warehouse site ${warehouse.id} → ${WAREHOUSE.name}`);
    } else {
      warehouse = await Site.create({
        name: WAREHOUSE.name,
        address: WAREHOUSE.address,
        latitude: WAREHOUSE.latitude,
        longitude: WAREHOUSE.longitude,
      });
      console.log(`Created warehouse site ${warehouse.id}`);
    }
  }

  for (const item of IOT_DEVICES) {
    let container = await Container.findOne({ where: { qr_code: item.qr_code } });
    if (!container) {
      container = await Container.create({
        qr_code: item.qr_code,
        capacity: item.capacity,
        status: 'available',
      });
      console.log(`Created container ${container.id} (${item.qr_code})`);
    } else {
      console.log(`Container exists ${container.id} (${item.qr_code})`);
    }

    let gps = await GPSDevice.findOne({ where: { device_serial_number: item.serial } });
    if (!gps) {
      gps = await GPSDevice.create({
        container_id: container.id,
        device_serial_number: item.serial,
        battery_level: 100,
        device_status: 'inactive',
      });
      console.log(`Created GPS ${gps.id} serial=${item.serial}`);
    } else {
      if (gps.container_id !== container.id) {
        await gps.update({ container_id: container.id });
      }
      console.log(`GPS exists serial=${item.serial} → ${container.id}`);
    }
  }

  console.log('\nDone. Assign container_id on missions to CTR-IOT-* containers for live tracking.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
