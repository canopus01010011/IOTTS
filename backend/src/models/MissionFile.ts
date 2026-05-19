import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface MissionFileAttributes {
  id: string;
  reference: string;
  import_date: Date;
  file_format: object;
  imported_by: string;
  mission_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

type MissionFileCreationAttributes = Optional<
  MissionFileAttributes,
  'id' | 'import_date' | 'mission_id' | 'created_at' | 'updated_at'
>;

class MissionFile
  extends Model<MissionFileAttributes, MissionFileCreationAttributes>
  implements MissionFileAttributes {
  public id!: string;
  public reference!: string;
  public import_date!: Date;
  public file_format!: object;
  public imported_by!: string;
  public mission_id?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

MissionFile.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('MFL'),
    field: 'file_id',
    primaryKey: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  import_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  file_format: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  imported_by: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  mission_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    references: {
      model: 'missions',
      key: 'mission_id'
    }
  }
}, {
  sequelize,
  tableName: 'mission_files',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default MissionFile;
