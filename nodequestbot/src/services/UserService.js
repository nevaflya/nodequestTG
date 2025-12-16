const User = require('../models/User');
const Transaction = require('../models/Transaction');
const config = require('../config');
const crypto = require('crypto');

class UserService {
  async registerUser(telegramId, username, firstName, lastName) {
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    const [user, created] = await User.findOrCreate({
      where: { telegramId },
      defaults: {
        username,
        firstName,
        lastName,
        referralCode,
        balance: config.gameConfig.startBalance,
        energy: config.gameConfig.maxEnergy,
      },
    });

    if (created) {
      // Создаем транзакцию для стартового баланса
      await Transaction.create({
        toUserId: telegramId,
        amount: config.gameConfig.startBalance,
        type: 'daily_bonus',
        description: 'Стартовый бонус',
      });
    }

    return { user, created };
  }

  async getUser(telegramId) {
    return await User.findOne({ where: { telegramId } });
  }

  async getDailyBonus(telegramId) {
    const user = await this.getUser(telegramId);
    
    if (!user) return { success: false, message: 'Пользователь не найден' };
    
    const now = new Date();
    const lastBonus = user.lastDailyBonus;
    
    if (lastBonus) {
      const hoursDiff = Math.abs(now - lastBonus) / 36e5;
      if (hoursDiff < 24) {
        const nextBonus = new Date(lastBonus.getTime() + 24 * 60 * 60 * 1000);
        return {
          success: false,
          message: `Следующий бонус через ${Math.ceil(24 - hoursDiff)} часов`,
          nextBonus,
        };
      }
    }
    
    const bonusAmount = config.gameConfig.dailyBonus;
    await this.addBalance(telegramId, bonusAmount, 'daily_bonus', 'Ежедневный бонус');
    
    user.lastDailyBonus = now;
    await user.save();
    
    return {
      success: true,
      amount: bonusAmount,
      message: `Вы получили ежедневный бонус: ${bonusAmount} NOC`,
    };
  }

  async addBalance(telegramId, amount, type, description, metadata = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const user = await User.findOne({
        where: { telegramId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
      
      if (!user) throw new Error('User not found');
      
      user.balance = parseFloat(user.balance) + parseFloat(amount);
      await user.save({ transaction });
      
      await Transaction.create({
        toUserId: telegramId,
        amount,
        type,
        description,
        metadata,
      }, { transaction });
      
      await transaction.commit();
      return user.balance;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removeBalance(telegramId, amount, type, description, metadata = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const user = await User.findOne({
        where: { telegramId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
      
      if (!user) throw new Error('User not found');
      
      if (parseFloat(user.balance) < parseFloat(amount)) {
        throw new Error('Insufficient funds');
      }
      
      user.balance = parseFloat(user.balance) - parseFloat(amount);
      await user.save({ transaction });
      
      await Transaction.create({
        fromUserId: telegramId,
        toUserId: telegramId,
        amount: -amount,
        type,
        description,
        metadata,
      }, { transaction });
      
      await transaction.commit();
      return user.balance;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transfer(fromUserId, toUserId, amount) {
    const transaction = await sequelize.transaction();
    
    try {
      const commission = amount * 0.02; // 2% комиссия
      const netAmount = amount - commission;
      
      const fromUser = await User.findOne({
        where: { telegramId: fromUserId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
      
      const toUser = await User.findOne({
        where: { telegramId: toUserId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
      
      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }
      
      if (parseFloat(fromUser.balance) < parseFloat(amount)) {
        throw new Error('Insufficient funds');
      }
      
      // Списываем у отправителя
      fromUser.balance = parseFloat(fromUser.balance) - parseFloat(amount);
      await fromUser.save({ transaction });
      
      // Зачисляем получателю (минус комиссия)
      toUser.balance = parseFloat(toUser.balance) + parseFloat(netAmount);
      await toUser.save({ transaction });
      
      // Комиссия уходит в "систему" (можно на счет админа или фонд)
      await Transaction.create({
        fromUserId,
        toUserId,
        amount: -amount,
        type: 'transfer',
        description: `Перевод пользователю ${toUserId}`,
        metadata: { commission },
      }, { transaction });
      
      await Transaction.create({
        fromUserId,
        toUserId,
        amount: netAmount,
        type: 'transfer',
        description: `Перевод от пользователя ${fromUserId}`,
        metadata: { commission },
      }, { transaction });
      
      await transaction.commit();
      
      return {
        success: true,
        netAmount,
        commission,
        fromBalance: fromUser.balance,
        toBalance: toUser.balance,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTopUsers(limit = 10) {
    return await User.findAll({
      where: { isBanned: false },
      order: [['balance', 'DESC']],
      limit,
      attributes: ['telegramId', 'username', 'firstName', 'balance', 'level'],
    });
  }
}

module.exports = new UserService();