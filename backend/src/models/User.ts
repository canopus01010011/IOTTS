import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';
import { generateCode } from '../utils/idGenerator.js';

interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  second_name?: string;
  full_name: string;
  role: 'admin' | 'technician' | 'driver';
  phone: string;
  fcm_token?: string;
  created_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'first_name' | 'second_name' | 'fcm_token'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public first_name?: string;
  public second_name?: string;
  public full_name!: string;
  public role!: 'admin' | 'technician' | 'driver';
  public phone!: string;
  public fcm_token?: string;
  public created_at!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }
}

User.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('USR'),
    field: 'user_id',
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    field: 'password',
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  second_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'technician', 'driver'),
    allowNull: false,
    defaultValue: 'technician'
  },
  phone: {
    type: DataTypes.STRING,
    field: 'phone_num',
    allowNull: false
  },
  fcm_token: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

export default User;