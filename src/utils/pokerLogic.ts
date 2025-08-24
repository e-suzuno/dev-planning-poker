import { Card, HandRank } from '../types/poker';

export const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck: Card[] = [];
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      const value = rank === 'A' ? 14 : rank === 'K' ? 13 : rank === 'Q' ? 12 : rank === 'J' ? 11 : parseInt(rank) || 10;
      deck.push({ suit, rank, value });
    });
  });
  
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck: Card[], numPlayers: number): { playerHands: Card[][], remainingDeck: Card[] } => {
  const playerHands: Card[][] = Array(numPlayers).fill(null).map(() => []);
  const deckCopy = [...deck];
  
  for (let round = 0; round < 2; round++) {
    for (let player = 0; player < numPlayers; player++) {
      const card = deckCopy.pop();
      if (card) {
        playerHands[player].push(card);
      }
    }
  }
  
  return { playerHands, remainingDeck: deckCopy };
};

export const evaluateHand = (playerCards: Card[], communityCards: Card[]): HandRank => {
  const allCards = [...playerCards, ...communityCards];
  const sortedCards = allCards.sort((a, b) => b.value - a.value);
  
  if (isRoyalFlush(sortedCards)) {
    return { rank: 10, name: 'Royal Flush', cards: sortedCards.slice(0, 5) };
  }
  
  const straightFlush = getStraightFlush(sortedCards);
  if (straightFlush.length > 0) {
    return { rank: 9, name: 'Straight Flush', cards: straightFlush };
  }
  
  const fourOfAKind = getFourOfAKind(sortedCards);
  if (fourOfAKind.length > 0) {
    return { rank: 8, name: 'Four of a Kind', cards: fourOfAKind };
  }
  
  const fullHouse = getFullHouse(sortedCards);
  if (fullHouse.length > 0) {
    return { rank: 7, name: 'Full House', cards: fullHouse };
  }
  
  const flush = getFlush(sortedCards);
  if (flush.length > 0) {
    return { rank: 6, name: 'Flush', cards: flush };
  }
  
  const straight = getStraight(sortedCards);
  if (straight.length > 0) {
    return { rank: 5, name: 'Straight', cards: straight };
  }
  
  const threeOfAKind = getThreeOfAKind(sortedCards);
  if (threeOfAKind.length > 0) {
    return { rank: 4, name: 'Three of a Kind', cards: threeOfAKind };
  }
  
  const twoPair = getTwoPair(sortedCards);
  if (twoPair.length > 0) {
    return { rank: 3, name: 'Two Pair', cards: twoPair };
  }
  
  const pair = getPair(sortedCards);
  if (pair.length > 0) {
    return { rank: 2, name: 'Pair', cards: pair };
  }
  
  return { rank: 1, name: 'High Card', cards: sortedCards.slice(0, 5) };
};

const isRoyalFlush = (cards: Card[]): boolean => {
  const royalRanks = ['A', 'K', 'Q', 'J', '10'];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  
  return suits.some(suit => {
    const suitCards = cards.filter(card => card.suit === suit);
    return royalRanks.every(rank => suitCards.some(card => card.rank === rank));
  });
};

const getStraightFlush = (cards: Card[]): Card[] => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  
  for (const suit of suits) {
    const suitCards = cards.filter(card => card.suit === suit).sort((a, b) => b.value - a.value);
    const straight = getStraight(suitCards);
    if (straight.length > 0) {
      return straight;
    }
  }
  
  return [];
};

const getFourOfAKind = (cards: Card[]): Card[] => {
  const rankCounts = getRankCounts(cards);
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count >= 4) {
      const fourCards = cards.filter(card => card.rank === rank).slice(0, 4);
      const kicker = cards.find(card => card.rank !== rank);
      return kicker ? [...fourCards, kicker] : fourCards;
    }
  }
  
  return [];
};

const getFullHouse = (cards: Card[]): Card[] => {
  const rankCounts = getRankCounts(cards);
  let threeOfAKindRank = '';
  let pairRank = '';
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count >= 3 && !threeOfAKindRank) {
      threeOfAKindRank = rank;
    } else if (count >= 2 && rank !== threeOfAKindRank) {
      pairRank = rank;
    }
  }
  
  if (threeOfAKindRank && pairRank) {
    const threeCards = cards.filter(card => card.rank === threeOfAKindRank).slice(0, 3);
    const twoCards = cards.filter(card => card.rank === pairRank).slice(0, 2);
    return [...threeCards, ...twoCards];
  }
  
  return [];
};

const getFlush = (cards: Card[]): Card[] => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  
  for (const suit of suits) {
    const suitCards = cards.filter(card => card.suit === suit);
    if (suitCards.length >= 5) {
      return suitCards.slice(0, 5);
    }
  }
  
  return [];
};

const getStraight = (cards: Card[]): Card[] => {
  const uniqueValues = [...new Set(cards.map(card => card.value))].sort((a, b) => b - a);
  
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    const sequence = uniqueValues.slice(i, i + 5);
    if (sequence[0] - sequence[4] === 4) {
      const straightCards: Card[] = [];
      sequence.forEach(value => {
        const card = cards.find(c => c.value === value);
        if (card) straightCards.push(card);
      });
      return straightCards;
    }
  }
  
  if (uniqueValues.includes(14) && uniqueValues.includes(5) && uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
    const wheelCards: Card[] = [];
    [14, 5, 4, 3, 2].forEach(value => {
      const card = cards.find(c => c.value === value);
      if (card) wheelCards.push(card);
    });
    return wheelCards;
  }
  
  return [];
};

const getThreeOfAKind = (cards: Card[]): Card[] => {
  const rankCounts = getRankCounts(cards);
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count >= 3) {
      const threeCards = cards.filter(card => card.rank === rank).slice(0, 3);
      const kickers = cards.filter(card => card.rank !== rank).slice(0, 2);
      return [...threeCards, ...kickers];
    }
  }
  
  return [];
};

const getTwoPair = (cards: Card[]): Card[] => {
  const rankCounts = getRankCounts(cards);
  const pairs: string[] = [];
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count >= 2) {
      pairs.push(rank);
    }
  }
  
  if (pairs.length >= 2) {
    const firstPair = cards.filter(card => card.rank === pairs[0]).slice(0, 2);
    const secondPair = cards.filter(card => card.rank === pairs[1]).slice(0, 2);
    const kicker = cards.find(card => card.rank !== pairs[0] && card.rank !== pairs[1]);
    return kicker ? [...firstPair, ...secondPair, kicker] : [...firstPair, ...secondPair];
  }
  
  return [];
};

const getPair = (cards: Card[]): Card[] => {
  const rankCounts = getRankCounts(cards);
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count >= 2) {
      const pairCards = cards.filter(card => card.rank === rank).slice(0, 2);
      const kickers = cards.filter(card => card.rank !== rank).slice(0, 3);
      return [...pairCards, ...kickers];
    }
  }
  
  return [];
};

const getRankCounts = (cards: Card[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  cards.forEach(card => {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  });
  
  return counts;
};

export const compareHands = (hand1: HandRank, hand2: HandRank): number => {
  if (hand1.rank !== hand2.rank) {
    return hand2.rank - hand1.rank;
  }
  
  for (let i = 0; i < Math.min(hand1.cards.length, hand2.cards.length); i++) {
    if (hand1.cards[i].value !== hand2.cards[i].value) {
      return hand2.cards[i].value - hand1.cards[i].value;
    }
  }
  
  return 0;
};
