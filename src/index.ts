import { bot } from "./bot/bot.js";

// Запуск бота
bot.launch().then(() => console.log('Бот запущен...'));

// Гибкая обработка выхода
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));