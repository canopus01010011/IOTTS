/** Entrepôt Oued Smar — point de départ de toutes les simulations GPX */
export const WAREHOUSE = {
  name: 'Entrepôt Oued Smar',
  address: 'Oued Smar, Alger (point départ — départ simulation)',
  latitude: 36.706559,
  longitude: 3.16704,
} as const;

/** device_serial_number → route GPX (iot_system) */
export const IOT_ROUTE_BY_DEVICE: Record<string, string> = {
  package_001: 'OS_Draria',
  package_002: 'OS_Meftah',
  package_003: 'OS_Cheraga',
};

export const MQTT_SIMULATION_START_PREFIX =
  process.env.MQTT_SIMULATION_START_TOPIC || 'ericsson/simulation/start';
