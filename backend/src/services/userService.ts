import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export class UserService {
  static async createUser(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      ...data,
      password_hash: data.password,
    });
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  static async getAllUsers(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${query.search}%` } },
        { full_name: { [Op.iLike]: `%${query.search}%` } },
      ];
    }
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return {
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getUserById(id: string) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateUser(id: string, data: any) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    if (data.password) {
      // Plain password — User model beforeUpdate hook hashes password_hash
      data.password_hash = data.password;
      delete data.password;
    }
    await user.update(data);
    const { password_hash, ...updatedUser } = user.toJSON();
    return updatedUser;
  }

  static async deleteUser(id: string) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    await user.destroy();
    return true;
  }
}
