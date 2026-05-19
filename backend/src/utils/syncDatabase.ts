import sequelize from '../config/database.js';
import '../models/index.js'; // Import all models

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models (force: false = don't drop tables)
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized');

    console.log('🎉 Database ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();