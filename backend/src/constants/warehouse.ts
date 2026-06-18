/** Entrepôt Oued Smar — point de départ de toutes les simulations GPX */
export const WAREHOUSE = {
  name: 'Entrepôt Oued Smar',
  address: 'Oued Smar, Alger (point départ — départ simulation)',
  latitude: 36.706559,
  longitude: 3.16704,
} as const;

/** device_serial_number → iot_system route name (GET /routes/{name}) */
export const IOT_ROUTE_BY_DEVICE: Record<string, string> = {
  package_001: 'OS-Draria',
  package_002: 'OS-Meftah',
  package_003: 'OS-Cheraga',
  package_004: 'OS-Bouzareah',
  package_005: 'OS-BabaHassen',
  package_006: 'OS-Souakria',
  package_007: 'OS-APN',
  package_008: 'OS-HusseinDey',
  package_009: 'OS-Birtouta',
  package_010: 'OS-Sablettes',
};

export const MQTT_SIMULATION_START_PREFIX =
  process.env.MQTT_SIMULATION_START_TOPIC || 'ericsson/simulation/start';

export const MQTT_SIMULATION_STOP_PREFIX =
  process.env.MQTT_SIMULATION_STOP_TOPIC || 'ericsson/simulation/stop';
