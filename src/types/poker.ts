export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  chips: number;
  currentBet: number;
  isActive: boolean;
  hasActed: boolean;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentPlayerIndex: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  deck: Card[];
  isGameActive: boolean;
}

export interface HandRank {
  rank: number;
  name: string;
  cards: Card[];
}

export type PokerAction = 'fold' | 'call' | 'raise' | 'check' | 'bet';
