import { CardValue } from '@/types/session';

export interface VoteStatistics {
  average: number | null;
  median: number | null;
  mode: CardValue | null;
  totalVotes: number;
  numericVotes: number;
}

export function calculateStatistics(votes: Record<string, CardValue | null>): VoteStatistics {
  const voteValues = Object.values(votes).filter(vote => vote !== null) as CardValue[];
  const numericValues = voteValues.filter(vote => typeof vote === 'number') as number[];
  
  const totalVotes = voteValues.length;
  const numericVotes = numericValues.length;
  
  const average = numericVotes > 0 
    ? numericValues.reduce((sum, val) => sum + val, 0) / numericVotes 
    : null;
  
  const median = numericVotes > 0 
    ? calculateMedian(numericValues.sort((a, b) => a - b))
    : null;
  
  const mode = calculateMode(voteValues);
  
  return {
    average,
    median,
    mode,
    totalVotes,
    numericVotes
  };
}

function calculateMedian(sortedNumbers: number[]): number {
  const mid = Math.floor(sortedNumbers.length / 2);
  return sortedNumbers.length % 2 === 0
    ? (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2
    : sortedNumbers[mid];
}

function calculateMode(values: CardValue[]): CardValue | null {
  if (values.length === 0) return null;
  
  const frequency: Record<string, number> = {};
  values.forEach(value => {
    const key = String(value);
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  let maxCount = 0;
  let mode: CardValue | null = null;
  
  Object.entries(frequency).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mode = value === '?' ? '?' : Number(value) as CardValue;
    }
  });
  
  return mode;
}
