'use client';

import React, { useState } from 'react';
import { useWebSocketGame } from '../hooks/useWebSocketGame';
import { PokerAction } from '../types/poker';
import Card from './Card';
import PlayerHand from './PlayerHand';

interface MultiplayerGameBoardProps {
  gameId: string;
  playerId: string;
  playerName: string;
}

const MultiplayerGameBoard: React.FC<MultiplayerGameBoardProps> = ({
  gameId,
  playerId,
  playerName,
}) => {
  const [raiseAmount, setRaiseAmount] = useState(50);
  const { gameState, isConnected, error, sendAction } = useWebSocketGame({
    gameId,
    playerId,
    playerName,
  });

  const handleAction = (action: PokerAction, amount?: number): void => {
    sendAction(action, amount);
  };

  const handleRaise = (): void => {
    if (raiseAmount > 0) {
      handleAction('raise', raiseAmount);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected || !gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-lg">Connecting to game...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Connection Status */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-white text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-white text-sm">
            Game ID: {gameId}
          </div>
        </div>

        {/* Game Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Planning Poker - Multiplayer</h1>
          <div className="text-white text-lg">
            Pot: ${gameState.pot} | Phase: {gameState.gamePhase}
          </div>
          {isCurrentTurn && (
            <div className="text-yellow-300 text-lg font-bold mt-2">
              Your Turn!
            </div>
          )}
        </div>

        {/* Community Cards */}
        <div className="flex justify-center mb-8">
          <div className="bg-green-700 p-6 rounded-lg shadow-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {gameState.players.map((player) => (
            <PlayerHand
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === playerId}
              showCards={player.id === playerId}
            />
          ))}
        </div>

        {/* Action Buttons */}
        {gameState.isGameActive && isCurrentTurn && currentPlayer?.isActive && (
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction('fold')}
                    className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Fold
                  </button>
                  <button
                    onClick={() => handleAction('call')}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Call
                  </button>
                  <button
                    onClick={() => handleAction('check')}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Check
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)}
                    min="1"
                    max={currentPlayer?.chips || 0}
                    className="px-3 py-2 border rounded w-24"
                    placeholder="Amount"
                  />
                  <button
                    onClick={handleRaise}
                    disabled={raiseAmount <= 0 || raiseAmount > (currentPlayer?.chips || 0)}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Raise ${raiseAmount}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting message for non-current players */}
        {gameState.isGameActive && !isCurrentTurn && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="text-center text-gray-600">
                Waiting for {gameState.players[gameState.currentPlayerIndex]?.name || 'other player'} to act...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameBoard;
