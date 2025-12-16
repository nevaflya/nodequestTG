const GameService = require('../../services/GameService');

module.exports = (bot) => {
  // Кликер игра
  bot.onText(/\/clicker/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const result = await GameService.playClicker(telegramId);
      
      if (result.success) {
        const keyboard = {
          inline_keyboard: [
            [
              { text: `💥 Кликнуть! (Энергия: ${result.energy})`, callback_data: 'clicker_click' }
            ],
            [
              { text: '🔄 Обновить', callback_data: 'clicker_refresh' }
            ]
          ]
        };

        bot.sendMessage(chatId, result.message, { reply_markup: keyboard });
      } else {
        bot.sendMessage(chatId, result.message);
      }
    } catch (error) {
      console.error('Error in /clicker:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка.');
    }
  });

  // Обработка inline кнопок кликера
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (data === 'clicker_click') {
      try {
        const result = await GameService.playClicker(telegramId);
        
        if (result.success) {
          const keyboard = {
            inline_keyboard: [
              [
                { text: `💥 Кликнуть! (Энергия: ${result.energy})`, callback_data: 'clicker_click' }
              ],
              [
                { text: '🔄 Обновить', callback_data: 'clicker_refresh' }
              ]
            ]
          };

          bot.editMessageText(result.message, {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id,
            reply_markup: keyboard,
          });
        } else {
          bot.answerCallbackQuery(callbackQuery.id, { text: result.message });
        }
      } catch (error) {
        console.error('Error in clicker callback:', error);
        bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Ошибка' });
      }
    } else if (data === 'clicker_refresh') {
      const user = await UserService.getUser(telegramId);
      if (user) {
        const keyboard = {
          inline_keyboard: [
            [
              { text: `💥 Кликнуть! (Энергия: ${user.energy})`, callback_data: 'clicker_click' }
            ],
            [
              { text: '🔄 Обновить', callback_data: 'clicker_refresh' }
            ]
          ]
        };

        bot.editMessageText(`💥 <b>Кликер</b>\n\nЭнергия: ${user.energy}/100\nНажмите кнопку для заработка!`, {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          reply_markup: keyboard,
          parse_mode: 'HTML',
        });
      }
    }

    bot.answerCallbackQuery(callbackQuery.id);
  });
};