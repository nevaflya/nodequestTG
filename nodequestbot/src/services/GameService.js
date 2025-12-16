const UserService = require('./UserService');
const Transaction = require('../models/Transaction');
const sequelize = require('../core/database');

class GameService {
  async playDice(userId, betAmount, chosenNumber) {
    if (chosenNumber < 1 || chosenNumber > 6) {
      return { success: false, message: 'Число должно быть от 1 до 6' };
    }

    const user = await UserService.getUser(userId);
    if (!user || parseFloat(user.balance) < betAmount) {
      return { success: false, message: 'Недостаточно средств' };
    }

    // Списываем ставку
    await UserService.removeBalance(userId, betAmount, 'game_lose', `Ставка в Dice (${chosenNumber})`);

    // Генерируем случайное число
    const diceResult = Math.floor(Math.random() * 6) + 1;
    
    if (diceResult === chosenNumber) {
      const winAmount = betAmount * 3; // Выигрыш x3
      await UserService.addBalance(userId, winAmount, 'game_win', `Победа в Dice! Выпало ${diceResult}`);
      
      return {
        success: true,
        win: true,
        diceResult,
        winAmount,
        message: `🎲 Выпало ${diceResult}! Вы выиграли ${winAmount} NOC!`,
      };
    } else {
      return {
        success: true,
        win: false,
        diceResult,
        lostAmount: betAmount,
        message: `🎲 Выпало ${diceResult}. Вы проиграли ${betAmount} NOC`,
      };
    }
  }

  async playClicker(userId) {
    const user = await UserService.getUser(userId);
    
    if (!user || user.energy < 10) {
      return { success: false, message: 'Недостаточно энергии! Энергия восстанавливается со временем.' };
    }

    // Расходуем энергию
    user.energy -= 10;
    await user.save();

    // Начисляем награду
    const reward = 5 + Math.floor(Math.random() * 10); // 5-15 NOC
    await UserService.addBalance(userId, reward, 'game_win', 'Награда за кликер');

    return {
      success: true,
      reward,
      energy: user.energy,
      message: `💥 Вы заработали ${reward} NOC! Осталось энергии: ${user.energy}/100`,
    };
  }

  async playQuiz(userId, answerIndex) {
    const questions = [
      {
        question: 'Столица России?',
        answers: ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск'],
        correct: 0,
        reward: 10,
      },
      {
        question: 'Сколько планет в Солнечной системе?',
        answers: ['7', '8', '9', '10'],
        correct: 1,
        reward: 15,
      },
      {
        question: 'Какой язык мы используем?',
        answers: ['Python', 'JavaScript', 'Java', 'C++'],
        correct: 1,
        reward: 20,
      },
    ];

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    if (answerIndex === randomQuestion.correct) {
      await UserService.addBalance(userId, randomQuestion.reward, 'game_win', 'Правильный ответ в викторине');
      return {
        success: true,
        correct: true,
        reward: randomQuestion.reward,
        message: `✅ Правильно! +${randomQuestion.reward} NOC`,
      };
    } else {
      return {
        success: true,
        correct: false,
        correctAnswer: randomQuestion.answers[randomQuestion.correct],
        message: `❌ Неправильно. Правильный ответ: ${randomQuestion.answers[randomQuestion.correct]}`,
      };
    }
  }

  async regenerateEnergy(userId) {
    const user = await UserService.getUser(userId);
    if (!user) return;

    const now = new Date();
    const lastUpdate = user.updatedAt || user.registeredAt;
    const minutesPassed = Math.floor((now - lastUpdate) / (1000 * 60));
    
    const energyToAdd = Math.min(
      minutesPassed * 0.2, // 1 энергия каждые 5 минут
      config.gameConfig.maxEnergy - user.energy
    );
    
    if (energyToAdd > 0) {
      user.energy = Math.min(user.energy + Math.floor(energyToAdd), config.gameConfig.maxEnergy);
      await user.save();
    }
  }
}

module.exports = new GameService();