import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

export interface MissionEquipment {
  equipment_id: string;
  quantity: number;
  label?: string;
}

interface MissionAttributes {
  id: string;
  status: 'pending' | 'in-progress' | 'completed';
  scheduled_start_date: Date;
  scheduled_end_date: Date;
  start_date?: Date;
  end_date?: Date;
  technician_id: string;
  driver_id: string;
  equipment_list: MissionEquipment[];
  container_id?: string;
  site_id: string;
  creation_date?: Date;
  reminder_sent_at?: Date | null;
}

type MissionCreationAttributes = Optional<
  MissionAttributes,
  'id' | 'status' | 'start_date' | 'end_date' | 'container_id' | 'creation_date' | 'reminder_sent_at'
>;

class Mission extends Model<MissionAttributes, MissionCreationAttributes> implements MissionAttributes {
  public id!: string;
  public status!: 'pending' | 'in-progress' | 'completed';
  public scheduled_start_date!: Date;
  public scheduled_end_date!: Date;
  public start_date?: Date;
  public end_date?: Date;
  public technician_id!: string;
  public driver_id!: string;
  public equipment_list!: MissionEquipment[];
  public container_id?: string;
  public site_id!: string;
  public creation_date!: Date;
  public reminder_sent_at?: Date | null;
}

Mission.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('MIS'),
    field: 'mission_id',
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
    field: 'mission_status',
    allowNull: false,
    defaultValue: 'pending'
  },
  scheduled_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  scheduled_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  technician_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  driver_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  equipment_list: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  container_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'containers',
      key: 'container_id'
    }
  },
  site_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'site_id'
    }
  },
  reminder_sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'missions',
  timestamps: true,
  createdAt: 'creation_date',
  updatedAt: false
});

export default Mission;
