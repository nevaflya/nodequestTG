module.exports = {
  mainKeyboard: {
    reply_markup: {
      keyboard: [
        ['👤 Профиль', '💰 Кошелек'],
        ['🎮 Игры', '🏪 Магазин'],
        ['🏆 Топ игроков', '🎁 Ежедневный бонус'],
        ['📊 Статистика', '🆘 Помощь']
      ],
      resize_keyboard: true,
    },
  },

  profileKeyboard: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💰 Пополнить', callback_data: 'deposit' },
          { text: '📊 Статистика', callback_data: 'stats' }
        ],
        [
          { text: '🎁 Реферальная система', callback_data: 'referral' },
          { text: '⚙️ Настройки', callback_data: 'settings' }
        ]
      ]
    }
  },

  walletKeyboard: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📤 Перевод', callback_data: 'transfer' },
          { text: '📥 Полученные', callback_data: 'received' }
        ],
        [
          { text: '📈 История', callback_data: 'history' },
          { text: '💳 Вывод', callback_data: 'withdraw' }
        ]
      ]
    }
  },

  gamesKeyboard: {
    reply_markup: {
      keyboard: [
        ['🎲 Кости', '💥 Кликер'],
        ['❓ Викторина', '🎰 Слоты'],
        ['🔙 Главное меню']
      ],
      resize_keyboard: true,
    },
  },
};