'use client';

import { useState, useCallback } from 'react';
import { GameState, Player, PokerAction } from '../types/poker';
import { createDeck, dealCards, evaluateHand } from '../utils/pokerLogic';

export const usePokerGame = (initialPlayers: Player[]): {
  gameState: GameState;
  playerAction: (playerId: string, action: PokerAction, amount?: number) => void;
  nextPhase: () => void;
  evaluateWinner: () => Player | null;
  resetGame: () => void;
} => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const deck = createDeck();
    const { playerHands, remainingDeck } = dealCards(deck, initialPlayers.length);
    
    const playersWithHands = initialPlayers.map((player, index) => ({
      ...player,
      hand: playerHands[index] || [],
    }));

    return {
      players: playersWithHands,
      communityCards: [],
      pot: 0,
      currentPlayerIndex: 0,
      gamePhase: 'preflop',
      deck: remainingDeck,
      isGameActive: true,
    };
  });

  const nextPhase = useCallback(() => {
    setGameState(prev => {
      let newPhase = prev.gamePhase;
      let cardsToAdd = 0;
      
      switch (prev.gamePhase) {
        case 'preflop':
          newPhase = 'flop';
          cardsToAdd = 3;
          break;
        case 'flop':
          newPhase = 'turn';
          cardsToAdd = 1;
          break;
        case 'turn':
          newPhase = 'river';
          cardsToAdd = 1;
          break;
        case 'river':
          newPhase = 'showdown';
          cardsToAdd = 0;
          break;
        default:
          return prev;
      }
      
      const newCommunityCards = [...prev.communityCards];
      const newDeck = [...prev.deck];
      
      for (let i = 0; i < cardsToAdd && newDeck.length > 0; i++) {
        const card = newDeck.pop();
        if (card) {
          newCommunityCards.push(card);
        }
      }
      
      return {
        ...prev,
        gamePhase: newPhase,
        communityCards: newCommunityCards,
        deck: newDeck,
        currentPlayerIndex: 0,
        players: prev.players.map(player => ({ ...player, hasActed: false })),
      };
    });
  }, []);

  const playerAction = useCallback((playerId: string, action: PokerAction, amount?: number) => {
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[playerIndex] };
      
      switch (action) {
        case 'fold':
          player.isActive = false;
          player.hasActed = true;
          break;
        case 'call':
          const callAmount = Math.max(...prev.players.map(p => p.currentBet)) - player.currentBet;
          player.currentBet += Math.min(callAmount, player.chips);
          player.chips -= Math.min(callAmount, player.chips);
          player.hasActed = true;
          break;
        case 'raise':
        case 'bet':
          if (amount && amount <= player.chips) {
            player.currentBet += amount;
            player.chips -= amount;
            player.hasActed = true;
            newPlayers.forEach(p => {
              if (p.id !== playerId) {
                p.hasActed = false;
              }
            });
          }
          break;
        case 'check':
          player.hasActed = true;
          break;
      }
      
      newPlayers[playerIndex] = player;
      
      const newPot = newPlayers.reduce((total, p) => total + p.currentBet, 0);
      
      let nextPlayerIndex = prev.currentPlayerIndex;
      const activePlayers = newPlayers.filter(p => p.isActive);
      
      if (activePlayers.length > 1) {
        do {
          nextPlayerIndex = (nextPlayerIndex + 1) % newPlayers.length;
        } while (!newPlayers[nextPlayerIndex].isActive);
      }
      
      const allPlayersActed = activePlayers.every(p => p.hasActed);
      const allBetsEqual = activePlayers.every(p => p.currentBet === activePlayers[0].currentBet);
      
      if (allPlayersActed && allBetsEqual && activePlayers.length > 1) {
        if (prev.gamePhase !== 'river') {
          setTimeout(() => nextPhase(), 1000);
        }
      }
      
      return {
        ...prev,
        players: newPlayers,
        pot: newPot,
        currentPlayerIndex: nextPlayerIndex,
      };
    });
  }, [nextPhase]);

  const evaluateWinner = useCallback(() => {
    const activePlayers = gameState.players.filter(p => p.isActive);
    if (activePlayers.length === 0) return null;
    if (activePlayers.length === 1) return activePlayers[0];
    
    const playerHands = activePlayers.map(player => ({
      player,
      hand: evaluateHand(player.hand, gameState.communityCards),
    }));
    
    playerHands.sort((a, b) => {
      if (a.hand.rank !== b.hand.rank) {
        return b.hand.rank - a.hand.rank;
      }
      
      for (let i = 0; i < Math.min(a.hand.cards.length, b.hand.cards.length); i++) {
        if (a.hand.cards[i].value !== b.hand.cards[i].value) {
          return b.hand.cards[i].value - a.hand.cards[i].value;
        }
      }
      
      return 0;
    });
    
    return playerHands[0].player;
  }, [gameState]);

  const resetGame = useCallback(() => {
    const deck = createDeck();
    const { playerHands, remainingDeck } = dealCards(deck, gameState.players.length);
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.map((player, index) => ({
        ...player,
        hand: playerHands[index] || [],
        currentBet: 0,
        isActive: true,
        hasActed: false,
      })),
      communityCards: [],
      pot: 0,
      currentPlayerIndex: 0,
      gamePhase: 'preflop',
      deck: remainingDeck,
      isGameActive: true,
    }));
  }, [gameState.players.length]);

  return {
    gameState,
    playerAction,
    nextPhase,
    evaluateWinner,
    resetGame,
  };
};
