'use client';

import React from 'react';
import GameBoard from '../components/GameBoard';
import { GameState, Player, Card } from '../types/poker';

const createDummyCard = (suit: Card['suit'], rank: Card['rank']): Card => ({
  suit,
  rank,
  value: rank === 'A' ? 14 : rank === 'K' ? 13 : rank === 'Q' ? 12 : rank === 'J' ? 11 : parseInt(rank) || 10,
});

const dummyPlayers: Player[] = [
  {
    id: '1',
    name: 'Alice',
    hand: [
      createDummyCard('hearts', 'A'),
      createDummyCard('spades', 'K'),
    ],
    chips: 1000,
    currentBet: 50,
    isActive: true,
    hasActed: false,
  },
  {
    id: '2',
    name: 'Bob',
    hand: [
      createDummyCard('diamonds', 'Q'),
      createDummyCard('clubs', 'J'),
    ],
    chips: 800,
    currentBet: 50,
    isActive: true,
    hasActed: true,
  },
  {
    id: '3',
    name: 'Charlie',
    hand: [
      createDummyCard('hearts', '10'),
      createDummyCard('spades', '9'),
    ],
    chips: 1200,
    currentBet: 0,
    isActive: false,
    hasActed: true,
  },
  {
    id: '4',
    name: 'Diana',
    hand: [
      createDummyCard('clubs', '8'),
      createDummyCard('diamonds', '7'),
    ],
    chips: 950,
    currentBet: 50,
    isActive: true,
    hasActed: false,
  },
];

const dummyGameState: GameState = {
  players: dummyPlayers,
  communityCards: [
    createDummyCard('hearts', 'A'),
    createDummyCard('diamonds', 'K'),
    createDummyCard('clubs', 'Q'),
  ],
  pot: 150,
  currentPlayerIndex: 0,
  gamePhase: 'flop',
  deck: [],
  isGameActive: true,
};

export default function Home(): React.ReactElement {
  return (
    <div>
      <GameBoard 
        gameState={dummyGameState} 
        currentPlayerId="1"
      />
      <div className="mt-6 text-center">
        <a
          href="/multiplayer"
          className="text-blue-500 hover:text-blue-600 text-lg font-semibold"
        >
          → Join Multiplayer Game
        </a>
      </div>
    </div>
  );
}
