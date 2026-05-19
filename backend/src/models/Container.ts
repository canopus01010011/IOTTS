import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface ContainerAttributes {
  id: string;
  qr_code: string;
  capacity: number;
  status: 'available' | 'assigned' | 'in_transit' | 'delivered' | 'maintenance';
  created_at?: Date;
  updated_at?: Date;
}

type ContainerCreationAttributes = Optional<ContainerAttributes, 'id' | 'status' | 'created_at' | 'updated_at'>;

class Container extends Model<ContainerAttributes, ContainerCreationAttributes> implements ContainerAttributes {
  public id!: string;
  public qr_code!: string;
  public capacity!: number;
  public status!: 'available' | 'assigned' | 'in_transit' | 'delivered' | 'maintenance';
  public created_at!: Date;
  public updated_at!: Date;
}

Container.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('CTR'),
    field: 'container_id',
    primaryKey: true
  },
  qr_code: {
    type: DataTypes.STRING,
    field: 'container_qr_code',
    allowNull: false,
    unique: true
  },
  capacity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'assigned', 'in_transit', 'delivered', 'maintenance'),
    allowNull: false,
    defaultValue: 'available'
  }
}, {
  sequelize,
  tableName: 'containers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Container;
