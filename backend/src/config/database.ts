import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import fs from 'fs';

dotenv.config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);

console.log("CWD =", process.cwd());
console.log("ENV EXISTS =", fs.existsSync('.env'));
console.log("ENV RAW =");
console.log(fs.readFileSync('.env', 'utf8'));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;