import { Context } from 'telegraf';
import { UnoGame } from '../uno-lite/game.js';

export const game = new UnoGame(); // Singleton для бота

// --- /start ---
export const startHandler = (ctx: Context) => {
  const userId = ctx.from?.id;
  const name = ctx.from?.first_name || 'Player';
  if (!userId) return;

  if (!game.addPlayer({ id: userId, name, hand: [] })) {
    return ctx.reply('Ты уже присоединился к игре.');
  }

  ctx.reply(`Привет, ${name}!`);

  if (game.getPlayers().length === 2) {
    game.startGame();
    game.getPlayers().forEach(p => {
      ctx.telegram.sendMessage(p.id, `Игра начинается! Твои карты: ${p.hand.join(', ')}`);
    });
    const current = game.getCurrentPlayer();
    ctx.telegram.sendMessage(current.id, `Твой ход. Верхняя карта: ${game.getTopCard()}`);
  } else {
    ctx.reply('Ждём второго игрока...');
  }
};

// --- /hand ---
export const handHandler = (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  const hand = game.getPlayerHand(userId);
  ctx.reply(`Твои карты: ${hand.join(', ')}`);
};

// --- /draw ---
export const drawHandler = (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  if (game.getCurrentPlayer().id !== userId) return ctx.reply('Сейчас не твой ход!');
  const card = game.drawCardForPlayer(userId);
  if (!card) return ctx.reply('Нет карт для добора.');
  ctx.reply(`Ты берёшь карту: ${card}`);
};

// --- /play <карта> ---
export const playHandler = (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.message || !('text' in ctx.message)) return;

  const text = ctx.message.text.trim();
  const card = text.split(' ')[1]?.toUpperCase();
  if (!card) return ctx.reply('Укажи карту для хода, например: /play RED-5');

  if (game.getCurrentPlayer().id !== userId) return ctx.reply('Сейчас не твой ход!');

  const success = game.playCard(userId, card);
  if (!success) return ctx.reply('Нельзя сыграть эту карту.');

  ctx.reply(`Ты сыграл ${card}.`);

  // Проверка победы
  const player = game.getPlayers().find(p => p.id === userId)!;
  if (player.hand.length === 0) {
    ctx.reply('Поздравляем! Ты выиграл!');
    const opponent = game.getPlayers().find(p => p.id !== userId);
    if (opponent) ctx.telegram.sendMessage(opponent.id, 'Ты проиграл.');
    return;
  }

  // Сообщаем следующему игроку
  const next = game.getCurrentPlayer();
  ctx.telegram.sendMessage(next.id, `Твой ход. Верхняя карта: ${game.getTopCard()}`);
  ctx.telegram.sendMessage(next.id, `Твои карты: ${next.hand.join(', ')}`);
};

// --- /state ---
export const stateHandler = (ctx: Context) => {
  const top = game.getTopCard();
  const color = game.getCurrentColor();
  const turnPlayer = game.getCurrentPlayer();
  const playersState = game.getPlayers()
    .map(p => `${p.name}: ${p.hand.length} карт`)
    .join('\n');
  ctx.reply(`Верхняя карта: ${top} (Цвет: ${color})\nХод игрока: ${turnPlayer.name}\n${playersState}`);
};

// --- /help ---
export const helpHandler = (ctx: Context) => {
  const helpMessage = `
🎮 *UNO Lite - Команды*

*Приватные команды (для вашего хода):*
/play <КАРТА> — сыграть карту, например: /play RED-5
/draw — взять карту из колоды, если нечем походить
/hand — посмотреть свои карты

*Публичные команды:*
/state — посмотреть верхнюю карту, текущий цвет, чей ход и количество карт у игроков

*Управление игрой:*
/start — присоединиться к комнате или начать игру
/reset — сбросить игру и начать заново
`;
  ctx.replyWithMarkdownV2(helpMessage);
};

// --- /reset ---
export const resetHandler = (ctx: Context) => {
  game.resetGame();
  ctx.reply('Игра сброшена. Можно начать новую с помощью /start');
};
