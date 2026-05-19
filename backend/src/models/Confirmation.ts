import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface ConfirmationAttributes {
  id: string;
  mission_id: string;
  driver_confirm_time?: Date;
  technician_confirm_time?: Date;
  confirmation_status: 'pending' | 'driver_confirmed' | 'technician_confirmed' | 'confirmed' | 'rejected';
}

type ConfirmationCreationAttributes = Optional<
  ConfirmationAttributes,
  'id' | 'driver_confirm_time' | 'technician_confirm_time' | 'confirmation_status'
>;

class Confirmation
  extends Model<ConfirmationAttributes, ConfirmationCreationAttributes>
  implements ConfirmationAttributes {
  public id!: string;
  public mission_id!: string;
  public driver_confirm_time?: Date;
  public technician_confirm_time?: Date;
  public confirmation_status!: 'pending' | 'driver_confirmed' | 'technician_confirmed' | 'confirmed' | 'rejected';
}

Confirmation.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('CNF'),
    field: 'confirmation_id',
    primaryKey: true
  },
  mission_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
      model: 'missions',
      key: 'mission_id'
    }
  },
  driver_confirm_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  technician_confirm_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmation_status: {
    type: DataTypes.ENUM('pending', 'driver_confirmed', 'technician_confirmed', 'confirmed', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  sequelize,
  tableName: 'confirmations',
  timestamps: false
});

export default Confirmation;
