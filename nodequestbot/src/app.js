const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const sequelize = require('./core/database');

// Импорт обработчиков
const startHandler = require('./handlers/start');
const profileHandler = require('./handlers/profile');
const walletHandler = require('./handlers/wallet');
const diceHandler = require('./handlers/games/dice');
const clickerHandler = require('./handlers/games/clicker');

// Инициализация бота
const bot = new TelegramBot(config.botToken, { polling: true });

console.log('🤖 NodeQuest Bot запускается...');

// Инициализация базы данных
sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к PostgreSQL установлено');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Модели синхронизированы');
    
    // Регистрация обработчиков
    startHandler(bot);
    profileHandler(bot);
    walletHandler(bot);
    diceHandler(bot);
    clickerHandler(bot);
    
    // Базовые команды помощи
    bot.onText(/\/help/, (msg) => {
      const helpText = `
🎮 <b>NodeQuest - помощь по командам</b>

<b>Основные команды:</b>
/start - Начать игру
/profile - Ваш профиль
/wallet - Кошелек
/top - Топ игроков
/daily - Ежедневный бонус

<b>Игры:</b>
/dice - Игра в кости
/clicker - Кликер игра
/quiz - Викторина

<b>Экономика:</b>
/transfer @username сумма - Перевод NOC
/shop - Магазин

<b>Примеры:</b>
<code>/bet 3 50</code> - Ставка 50 NOC на число 3 в костях
<code>/transfer @username 100</code> - Перевод 100 NOC

📞 Поддержка: @ваш_ник
      `;
      
      bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'HTML' });
    });
    
    // Обработка ошибок
    bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });
    
    console.log('✅ Бот успешно запущен!');
  })
  .catch((error) => {
    console.error('❌ Ошибка при запуске:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Останавливаем бота...');
  bot.stopPolling();
  sequelize.close();
  process.exit(0);
});