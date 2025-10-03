import { Telegraf } from 'telegraf';
import { 
  startHandler, handHandler, drawHandler, playHandler, stateHandler, helpHandler, resetHandler 
} from './handlers.js';
import { telegramBotToken } from '../config.js';

export const bot = new Telegraf(telegramBotToken);

// Регистрация команд
bot.start(startHandler);
bot.command('hand', handHandler);
bot.command('draw', drawHandler);
bot.command('play', playHandler);
bot.command('state', stateHandler);
bot.command('help', helpHandler);
bot.command('reset', resetHandler);
