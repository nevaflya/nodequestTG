const UserService = require('../services/UserService');
const { walletKeyboard } = require('../keyboards/main');

module.exports = (bot) => {
  // Показать кошелек
  bot.onText(/\/wallet/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await UserService.getUser(telegramId);
      
      if (!user) {
        return bot.sendMessage(chatId, '❌ Пользователь не найден.');
      }

      const message = `💰 <b>Ваш кошелек</b>\n\n`;
      message += `Баланс: <b>${user.balance} NOC</b>\n\n`;
      message += `Используйте команду /transfer @username сумма для перевода средств.\n`;
      message += `Комиссия за перевод: 2%`;

      bot.sendMessage(chatId, message, {
        reply_markup: walletKeyboard,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Error in /wallet:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка.');
    }
  });

  // Перевод средств
  bot.onText(/\/transfer\s+@?(\w+)\s+(\d+(?:\.\d+)?)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const fromUserId = msg.from.id;
    const toUsername = match[1];
    const amount = parseFloat(match[2]);

    if (amount <= 0) {
      return bot.sendMessage(chatId, '❌ Сумма должна быть положительной.');
    }

    if (amount < 1) {
      return bot.sendMessage(chatId, '❌ Минимальная сумма перевода: 1 NOC');
    }

    try {
      // Найти получателя по username
      const toUser = await UserService.getUserByUsername(toUsername);
      
      if (!toUser) {
        return bot.sendMessage(chatId, '❌ Пользователь не найден.');
      }

      if (toUser.telegramId === fromUserId) {
        return bot.sendMessage(chatId, '❌ Нельзя переводить самому себе.');
      }

      const result = await UserService.transfer(fromUserId, toUser.telegramId, amount);
      
      if (result.success) {
        const message = `✅ Перевод выполнен!\n\n`;
        message += `📤 Отправлено: ${amount} NOC\n`;
        message += `📥 Получено: ${result.netAmount} NOC\n`;
        message += `💸 Комиссия: ${result.commission} NOC (2%)\n`;
        message += `💰 Ваш новый баланс: ${result.fromBalance} NOC`;
        
        bot.sendMessage(chatId, message);

        // Уведомляем получателя
        const recipientMessage = `🎉 Вы получили перевод!\n\n`;
        recipientMessage += `От: ${msg.from.first_name}${msg.from.username ? ` (@${msg.from.username})` : ''}\n`;
        recipientMessage += `Сумма: ${result.netAmount} NOC\n`;
        recipientMessage += `Ваш баланс: ${result.toBalance} NOC`;
        
        bot.sendMessage(toUser.telegramId, recipientMessage);
      } else {
        bot.sendMessage(chatId, `❌ Ошибка перевода: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in /transfer:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка при переводе.');
    }
  });

  // Топ игроков
  bot.onText(/\/top/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const topUsers = await UserService.getTopUsers(10);
      
      let message = '🏆 <b>Топ-10 игроков по балансу</b>\n\n';
      
      topUsers.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const name = user.firstName || `Игрок ${user.telegramId}`;
        message += `${medal} ${name}: <b>${user.balance} NOC</b> (Ур. ${user.level})\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error in /top:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке топа.');
    }
  });
};