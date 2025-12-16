require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'nodequest',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [],
  gameConfig: {
    dailyBonus: 100,
    startBalance: 1000,
    maxEnergy: 100,
    energyRegenPerMinute: 1,
  },
};