import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface GPSDeviceAttributes {
  id: string;
  container_id: string;
  device_serial_number: string;
  battery_level: number;
  device_status: 'active' | 'inactive' | 'maintenance' | 'lost';
}

type GPSDeviceCreationAttributes = Optional<
  GPSDeviceAttributes,
  'id' | 'battery_level' | 'device_status'
>;

class GPSDevice extends Model<GPSDeviceAttributes, GPSDeviceCreationAttributes> implements GPSDeviceAttributes {
  public id!: string;
  public container_id!: string;
  public device_serial_number!: string;
  public battery_level!: number;
  public device_status!: 'active' | 'inactive' | 'maintenance' | 'lost';
}

GPSDevice.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('GPS'),
    field: 'gps_id',
    primaryKey: true
  },
  container_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
      model: 'containers',
      key: 'container_id'
    }
  },
  device_serial_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  battery_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  device_status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'lost'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  sequelize,
  tableName: 'gps_devices',
  timestamps: false
});

export default GPSDevice;
