const GameService = require('../../services/GameService');
const { diceKeyboard } = require('../../keyboards/games');

module.exports = (bot) => {
  // Команда для игры в кости
  bot.onText(/\/dice/, (msg) => {
    const chatId = msg.chat.id;
    
    const message = '🎲 <b>Игра в кости</b>\n\n';
    message += 'Выберите число от 1 до 6 и сделайте ставку.\n';
    message += 'Если угадаете - получите x3 от ставки!\n\n';
    message += 'Для ставки отправьте: <code>/bet 1-6 сумма</code>\n';
    message += 'Пример: <code>/bet 3 50</code>';

    bot.sendMessage(chatId, message, {
      reply_markup: diceKeyboard,
      parse_mode: 'HTML',
    });
  });

  // Обработка ставки
  bot.onText(/\/bet\s+(\d)\s+(\d+(?:\.\d+)?)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const chosenNumber = parseInt(match[1]);
    const betAmount = parseFloat(match[2]);

    if (betAmount < 10) {
      return bot.sendMessage(chatId, '❌ Минимальная ставка: 10 NOC');
    }

    if (betAmount > 1000) {
      return bot.sendMessage(chatId, '❌ Максимальная ставка: 1000 NOC');
    }

    try {
      const result = await GameService.playDice(telegramId, betAmount, chosenNumber);
      bot.sendMessage(chatId, result.message);
    } catch (error) {
      console.error('Error in /bet:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка. Проверьте баланс и попробуйте снова.');
    }
  });
};