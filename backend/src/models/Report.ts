import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface ReportAttributes {
  id: string;
  mission_id: string;
  report_date: Date;
  description: string;
  delivery_photo_url: string[];
  notes?: string;
  created_at?: Date;
  sent_at?: Date;
}

type ReportCreationAttributes = Optional<
  ReportAttributes,
  'id' | 'report_date' | 'delivery_photo_url' | 'notes' | 'created_at' | 'sent_at'
>;

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id!: string;
  public mission_id!: string;
  public report_date!: Date;
  public description!: string;
  public delivery_photo_url!: string[];
  public notes?: string;
  public created_at!: Date;
  public sent_at!: Date;
}

Report.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('RPT'),
    field: 'report_id',
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
  report_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
  },
  delivery_photo_url: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  notes: DataTypes.TEXT
}, {
  sequelize,
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'sent_at'
});

export default Report;
