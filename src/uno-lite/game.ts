import { Player } from "./types.js";

export class UnoGame {
  private players: Player[] = [];
  private deck: string[] = [];
  private discardPile: string[] = [];
  private currentTurn = 0;
  private currentColor: string | null = null;
  private currentNumber: string | null = null;

  addPlayer(player: Player) {
    if (this.players.find(p => p.id === player.id)) return false;
    this.players.push(player);
    return true;
  }

  getPlayers() { return this.players; }
  getCurrentPlayer() { return this.players[this.currentTurn]; }
  getCurrentTurn() { return this.currentTurn; }
  getTopCard() { return this.discardPile[this.discardPile.length - 1] || null; }
  getCurrentColor() { return this.currentColor; }
  getCurrentNumber() { return this.currentNumber; }
  getPlayerHand(playerId: number) {
    return this.players.find(p => p.id === playerId)?.hand || [];
  }

  startGame() {
    this.deck = this.createDeck();
    // раздача по 7 карт
    this.players.forEach(p => p.hand = this.deck.splice(0, 7));
    // верхняя карта
    const top = this.deck.shift();
    if (!top) throw new Error('Колода пуста при старте игры');
    this.discardPile = [top];
    const [color, number] = top.split('-');
    this.currentColor = color;
    this.currentNumber = number;
  }

  playCard(playerId: number, card: string) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.getCurrentPlayer().id !== playerId) return false;

    if (!player.hand.includes(card)) return false;

    const [color, number] = card.split('-');
    if (color !== this.currentColor && number !== this.currentNumber) return false;

    player.hand = player.hand.filter(c => c !== card);
    this.discardPile.push(card);
    this.currentColor = color;
    this.currentNumber = number;

    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    return true;
  }

  drawCardForPlayer(playerId: number) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    if (this.deck.length === 0) this.reshuffleDiscard();

    const card = this.deck.shift();
    if (!card) return null;

    player.hand.push(card);
    return card;
  }

  private reshuffleDiscard() {
    if (this.discardPile.length <= 1) return;
    const top = this.discardPile.pop()!;
    this.deck.push(...this.discardPile.sort(() => Math.random() - 0.5));
    this.discardPile = [top];
  }

  resetGame() {
    this.players = [];
    this.deck = [];
    this.discardPile = [];
    this.currentTurn = 0;
    this.currentColor = null;
    this.currentNumber = null;
  }

  private createDeck(): string[] {
    const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW'] as const;
    const deck: string[] = [];
    for (const color of colors) {
      deck.push(`${color}-0`);
      for (let num = 1; num <= 9; num++) {
        deck.push(`${color}-${num}`);
        deck.push(`${color}-${num}`);
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  }
}
