'use client';

import React, { useState } from 'react';
import MultiplayerGameBoard from '../../components/MultiplayerGameBoard';

const MultiplayerPage: React.FC = () => {
  const [gameId, setGameId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinGame = (e: React.FormEvent): void => {
    e.preventDefault();
    if (gameId.trim() && playerId.trim() && playerName.trim()) {
      setIsJoined(true);
    }
  };

  const generateGameId = (): void => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(id);
  };

  const generatePlayerId = (): void => {
    const id = Math.random().toString(36).substring(2, 10);
    setPlayerId(id);
  };

  if (isJoined) {
    return (
      <MultiplayerGameBoard
        gameId={gameId}
        playerId={playerId}
        playerName={playerName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Join Poker Game</h1>
        
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
              Game ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="gameId"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter game ID"
                required
              />
              <button
                type="button"
                onClick={generateGameId}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="playerId" className="block text-sm font-medium text-gray-700 mb-1">
              Player ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="playerId"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter player ID"
                required
              />
              <button
                type="button"
                onClick={generatePlayerId}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Join Game
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Back to Single Player
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerPage;
