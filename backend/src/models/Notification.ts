import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface NotificationAttributes {
  id: string;
  user_ids: string[];
  title: string;
  body: string;
  sent_at: Date;
  created_at?: Date;
}

type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'created_at' | 'sent_at'>;

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public user_ids!: string[];
  public title!: string;
  public body!: string;
  public sent_at!: Date;
  public created_at!: Date;
}

Notification.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('NTF'),
    field: 'notification_id',
    primaryKey: true
  },
  user_ids: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  title: {
    type: DataTypes.STRING,
    field: 'notification_title',
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    field: 'notification_type',
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    field: 'notification_date',
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
}, {
  sequelize,
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Notification;
