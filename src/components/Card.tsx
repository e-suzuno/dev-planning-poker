import React from 'react';
import { Card as CardType } from '../types/poker';

interface CardProps {
  card: CardType;
  isHidden?: boolean;
}

const Card: React.FC<CardProps> = ({ card, isHidden = false }) => {
  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getSuitColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
  };

  if (isHidden) {
    return (
      <div className="w-16 h-24 bg-blue-600 border-2 border-blue-800 rounded-lg flex items-center justify-center shadow-md">
        <div className="text-white text-xs font-bold">🂠</div>
      </div>
    );
  }

  return (
    <div className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-between p-1 shadow-md" data-testid="card">
      <div className={`text-sm font-bold ${getSuitColor(card.suit)}`}>
        {card.rank}
      </div>
      <div className={`text-2xl ${getSuitColor(card.suit)}`}>
        {getSuitSymbol(card.suit)}
      </div>
      <div className={`text-sm font-bold ${getSuitColor(card.suit)} rotate-180`}>
        {card.rank}
      </div>
    </div>
  );
};

export default Card;
