'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Player, PokerAction } from '../types/poker';
import { PokerWebSocket, WebSocketMessage } from '../lib/websocket';

interface UseWebSocketGameProps {
  gameId: string;
  playerId: string;
  playerName: string;
  wsUrl?: string;
}

export const useWebSocketGame = ({
  gameId,
  playerId,
  playerName,
  wsUrl = 'ws://localhost:8080',
}: UseWebSocketGameProps): {
  gameState: GameState | null;
  isConnected: boolean;
  error: string | null;
  players: Player[];
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAction: (action: PokerAction, amount?: number) => void;
} => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [players] = useState<Player[]>([]);
  const wsRef = useRef<PokerWebSocket | null>(null);

  const connect = useCallback(async (): Promise<void> => {
    try {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }

      const ws = new PokerWebSocket(`${wsUrl}/${gameId}`);
      wsRef.current = ws;

      ws.on('gameState', (message: WebSocketMessage) => {
        if (message.gameState) {
          setGameState(message.gameState as GameState);
        }
      });

      ws.on('error', (message: WebSocketMessage) => {
        setError(message.error || 'Unknown error occurred');
      });

      ws.on('join', (message: WebSocketMessage) => {
        console.log('Player joined:', message.playerName);
      });

      ws.on('leave', (message: WebSocketMessage) => {
        console.log('Player left:', message.playerName);
      });

      await ws.connect();
      setIsConnected(true);
      setError(null);

      ws.joinGame(playerId, playerName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    }
  }, [gameId, playerId, playerName, wsUrl]);

  const disconnect = useCallback((): void => {
    if (wsRef.current) {
      wsRef.current.leaveGame(playerId);
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [playerId]);

  const sendAction = useCallback((action: PokerAction, amount?: number) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendAction(playerId, action, amount);
    } else {
      setError('Not connected to game server');
    }
  }, [playerId, isConnected]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    const ws = wsRef.current;
    if (ws) {
      const checkConnection = setInterval(() => {
        setIsConnected(ws.isConnected());
      }, 1000);

      return () => clearInterval(checkConnection);
    }
  }, []);

  return {
    gameState,
    isConnected,
    error,
    players,
    connect,
    disconnect,
    sendAction,
  };
};
