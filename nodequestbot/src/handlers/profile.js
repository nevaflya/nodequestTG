const UserService = require('../services/UserService');
const GameService = require('../services/GameService');
const { profileKeyboard } = require('../keyboards/main');

module.exports = (bot) => {
  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await UserService.getUser(telegramId);
      
      if (!user) {
        return bot.sendMessage(chatId, '❌ Пользователь не найден. Используйте /start для регистрации.');
      }

      // Регенерация энергии
      await GameService.regenerateEnergy(telegramId);
      await user.reload();

      let message = `👤 <b>Профиль</b>\n\n`;
      message += `🏷 Имя: ${user.firstName}\n`;
      if (user.username) message += `📱 @${user.username}\n`;
      message += `\n💰 Баланс: <b>${user.balance} NOC</b>\n`;
      message += `⚡ Энергия: ${user.energy}/100\n`;
      message += `📈 Уровень: ${user.level}\n`;
      message += `⭐ Опыт: ${user.experience}/${user.level * 100}\n`;
      message += `👥 Рефералов: ${user.referrals}\n`;
      message += `🔗 Реф. код: <code>${user.referralCode}</code>\n`;
      message += `📅 Зарегистрирован: ${new Date(user.registeredAt).toLocaleDateString('ru-RU')}`;

      bot.sendMessage(chatId, message, {
        reply_markup: profileKeyboard,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Error in /profile:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке профиля.');
    }
  });

  // Ежедневный бонус
  bot.onText(/\/daily/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const result = await UserService.getDailyBonus(telegramId);
      bot.sendMessage(chatId, result.message);
    } catch (error) {
      console.error('Error in /daily:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка при получении бонуса.');
    }
  });
};