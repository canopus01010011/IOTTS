import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface TrackingDataAttributes {
  id: string;
  gps_id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

type TrackingDataCreationAttributes = Optional<TrackingDataAttributes, 'id'>;

class TrackingData
  extends Model<TrackingDataAttributes, TrackingDataCreationAttributes>
  implements TrackingDataAttributes {
  public id!: string;
  public gps_id!: string;
  public latitude!: number;
  public longitude!: number;
  public timestamp!: Date;
}

TrackingData.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('TRK'),
    field: 'tracking_id',
    primaryKey: true
  },
  gps_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'gps_devices',
      key: 'gps_id'
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'tracking_data',
  timestamps: false,
  indexes: [
    {
      fields: ['gps_id', 'timestamp']
    }
  ]
});

export default TrackingData;
