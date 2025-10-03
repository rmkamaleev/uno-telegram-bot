import { game } from '../bot/handlers.js';

// --- Мок для Telegram ---
function sendMessage(playerId: number, message: string) {
  const player = game.getPlayers().find(p => p.id === playerId);
  const name = player?.name || playerId;
  console.log(`[Bot -> ${name}]: ${message}`);
}

// --- Создаем двух виртуальных игроков ---
game.resetGame();
game.addPlayer({ id: 1, name: 'Alice', hand: [] });
game.addPlayer({ id: 2, name: 'Bob', hand: [] });

// --- Старт игры ---
game.startGame();
console.log('--- Игра началась ---');
console.log(`Верхняя карта: ${game.getTopCard()}`);
game.getPlayers().forEach(p => sendMessage(p.id, `Твои карты: ${p.hand.join(', ')}`));

// --- Функция симуляции одного хода ---
function simulateTurn(playerId: number) {
  const player = game.getPlayers().find(p => p.id === playerId);
  if (!player) return;

  const playable = player.hand.filter(c =>
    c.split('-')[0] === game.getCurrentColor() || c.split('-')[1] === game.getCurrentNumber()
  );

  if (playable.length > 0) {
    const card = playable[0];
    game.playCard(playerId, card);
    sendMessage(playerId, `Сыграл карту: ${card}`);
  } else {
    const card = game.drawCardForPlayer(playerId);
    if (!card) return sendMessage(playerId, 'Колода пуста, ход пропущен');
    sendMessage(playerId, `Не было подходящей карты. Взял: ${card}`);
    // Можно сразу сыграть, если подходит
    if (card.split('-')[0] === game.getCurrentColor() || card.split('-')[1] === game.getCurrentNumber()) {
      game.playCard(playerId, card);
      sendMessage(playerId, `Сыграл взятую карту: ${card}`);
    }
  }

  // Показать состояние после хода
  sendMessage(playerId, `Верхняя карта: ${game.getTopCard()}`);
  game.getPlayers().forEach(p => sendMessage(p.id, `Твои карты: ${p.hand.join(', ')}`));
}

// --- Цикл игры ---
for (let i = 0; i < 50; i++) {
  const current = game.getCurrentPlayer();
  console.log(`--- Ход игрока: ${current.name} ---`);
  simulateTurn(current.id);

  // Проверка победы
  if (current.hand.length === 0) {
    console.log(`*** Победил игрок: ${current.name} ***`);
    break;
  }
}
