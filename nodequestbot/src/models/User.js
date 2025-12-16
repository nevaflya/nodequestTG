const { DataTypes } = require('sequelize');
const sequelize = require('../core/database');

const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 1000,
  },
  energy: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastDailyBonus: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  referrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = User;