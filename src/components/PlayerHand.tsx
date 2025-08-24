import React from 'react';
import { Player } from '../types/poker';
import Card from './Card';

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer?: boolean;
  showCards?: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  player, 
  isCurrentPlayer = false, 
  showCards = false 
}) => {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isCurrentPlayer ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'
    } shadow-md`} data-testid="player-hand">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">{player.name}</h3>
        <div className="text-sm text-gray-600">
          Chips: ${player.chips}
        </div>
      </div>
      
      <div className="flex gap-2 mb-2">
        {player.hand.map((card, index) => (
          <Card 
            key={`${card.suit}-${card.rank}-${index}`}
            card={card} 
            isHidden={!showCards && !isCurrentPlayer}
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className={`px-2 py-1 rounded ${
          player.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {player.isActive ? 'Active' : 'Folded'}
        </span>
        <span className="font-semibold">
          Bet: ${player.currentBet}
        </span>
      </div>
    </div>
  );
};

export default PlayerHand;
