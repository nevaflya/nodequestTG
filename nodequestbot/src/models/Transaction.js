const { DataTypes } = require('sequelize');
const sequelize = require('../core/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fromUserId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  toUserId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'game_win',
      'game_lose',
      'transfer',
      'purchase',
      'daily_bonus',
      'referral_bonus',
      'admin_add',
      'admin_remove'
    ),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
});

module.exports = Transaction;