import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface EquipmentAttributes {
  id: string;
  type: string;
  serial_number: string;
  model: string;
  equipment_status: 'available' | 'in_use' | 'maintenance' | 'lost';
  container_id?: string;
}

type EquipmentCreationAttributes = Optional<EquipmentAttributes, 'id' | 'equipment_status' | 'container_id'>;

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: string;
  public type!: string;
  public serial_number!: string;
  public model!: string;
  public equipment_status!: 'available' | 'in_use' | 'maintenance' | 'lost';
  public container_id?: string;
}

Equipment.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('EQP'),
    field: 'equipment_id',
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    field: 'equipment_type',
    allowNull: false
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  equipment_status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'lost'),
    allowNull: false,
    defaultValue: 'available'
  },
  container_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'containers',
      key: 'container_id'
    }
  }
}, {
  sequelize,
  tableName: 'equipment',
  timestamps: false
});

export default Equipment;
