import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface PictureAttributes {
  id: string;
  report_id: string;
  picture_url: string;
  taken_at?: Date;
  uploaded_at?: Date;
}

type PictureCreationAttributes = Optional<PictureAttributes, 'id' | 'taken_at' | 'uploaded_at'>;

class Picture extends Model<PictureAttributes, PictureCreationAttributes> implements PictureAttributes {
  public id!: string;
  public report_id!: string;
  public picture_url!: string;
  public taken_at!: Date;
  public uploaded_at!: Date;
}

Picture.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('PIC'),
    field: 'picture_id',
    primaryKey: true
  },
  report_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'reports',
      key: 'report_id'
    }
  },
  picture_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'pictures',
  timestamps: true,
  createdAt: 'taken_at',
  updatedAt: 'uploaded_at'
});

export default Picture;
