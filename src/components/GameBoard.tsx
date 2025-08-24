import React from 'react';
import { GameState } from '../types/poker';
import Card from './Card';
import PlayerHand from './PlayerHand';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, currentPlayerId }) => {
  return (
    <div className="min-h-screen bg-green-800 p-4" data-testid="game-board">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Planning Poker</h1>
          <div className="text-white text-lg">
            Pot: ${gameState.pot} | Phase: {gameState.gamePhase}
          </div>
        </div>

        {/* Community Cards */}
        <div className="flex justify-center mb-8">
          <div className="bg-green-700 p-6 rounded-lg shadow-lg" data-testid="community-cards">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Community Cards</h2>
            <div className="flex gap-2 justify-center">
              {gameState.communityCards.length > 0 ? (
                gameState.communityCards.map((card, index) => (
                  <Card key={`community-${index}`} card={card} />
                ))
              ) : (
                <div className="text-white text-center py-8">
                  No community cards yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.players.map((player) => (
            <PlayerHand
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayerId}
              showCards={player.id === currentPlayerId}
            />
          ))}
        </div>

        {/* Action Buttons */}
        {gameState.isGameActive && (
          <div className="flex justify-center mt-8">
            <div className="bg-white p-4 rounded-lg shadow-lg" data-testid="action-buttons">
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                  Fold
                </button>
                <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Call
                </button>
                <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Raise
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
