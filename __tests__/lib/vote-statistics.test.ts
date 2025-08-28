import { calculateStatistics } from '@/lib/vote-statistics';
import { CardValue } from '@/types/session';

describe('vote-statistics', () => {
  describe('calculateStatistics', () => {
    it('calculates statistics for numeric votes only', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 1,
        'participant-2': 3,
        'participant-3': 5,
        'participant-4': 8
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBe(4.25);
      expect(result.median).toBe(4);
      expect(result.mode).toBe(1); // All values appear once, so first one is returned
      expect(result.totalVotes).toBe(4);
      expect(result.numericVotes).toBe(4);
    });

    it('excludes question mark votes from numeric calculations', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 2,
        'participant-2': '?',
        'participant-3': 8,
        'participant-4': '?'
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBe(5); // (2 + 8) / 2
      expect(result.median).toBe(5); // median of [2, 8]
      expect(result.mode).toBe('?'); // Most frequent value overall
      expect(result.totalVotes).toBe(4);
      expect(result.numericVotes).toBe(2);
    });

    it('excludes null votes from calculations', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 3,
        'participant-2': null,
        'participant-3': 5,
        'participant-4': null
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBe(4); // (3 + 5) / 2
      expect(result.median).toBe(4); // median of [3, 5]
      expect(result.mode).toBe(3); // First value when all appear once
      expect(result.totalVotes).toBe(2);
      expect(result.numericVotes).toBe(2);
    });

    it('calculates median correctly for odd number of values', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 1,
        'participant-2': 5,
        'participant-3': 3
      };

      const result = calculateStatistics(votes);

      expect(result.median).toBe(3); // median of [1, 3, 5]
    });

    it('calculates median correctly for even number of values', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 2,
        'participant-2': 8,
        'participant-3': 3,
        'participant-4': 5
      };

      const result = calculateStatistics(votes);

      expect(result.median).toBe(4); // median of [2, 3, 5, 8] = (3 + 5) / 2
    });

    it('calculates mode correctly when there is a clear winner', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 5,
        'participant-2': 3,
        'participant-3': 5,
        'participant-4': 8,
        'participant-5': 5
      };

      const result = calculateStatistics(votes);

      expect(result.mode).toBe(5); // 5 appears 3 times
    });

    it('calculates mode correctly with question marks', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': '?',
        'participant-2': 3,
        'participant-3': '?',
        'participant-4': 8,
        'participant-5': '?'
      };

      const result = calculateStatistics(votes);

      expect(result.mode).toBe('?'); // ? appears 3 times
    });

    it('returns null values when no votes exist', () => {
      const votes: Record<string, CardValue | null> = {};

      const result = calculateStatistics(votes);

      expect(result.average).toBeNull();
      expect(result.median).toBeNull();
      expect(result.mode).toBeNull();
      expect(result.totalVotes).toBe(0);
      expect(result.numericVotes).toBe(0);
    });

    it('returns null numeric stats when only question marks exist', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': '?',
        'participant-2': '?'
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBeNull();
      expect(result.median).toBeNull();
      expect(result.mode).toBe('?');
      expect(result.totalVotes).toBe(2);
      expect(result.numericVotes).toBe(0);
    });

    it('handles single vote correctly', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 13
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBe(13);
      expect(result.median).toBe(13);
      expect(result.mode).toBe(13);
      expect(result.totalVotes).toBe(1);
      expect(result.numericVotes).toBe(1);
    });

    it('handles all Fibonacci values correctly', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 0,
        'participant-2': 1,
        'participant-3': 2,
        'participant-4': 3,
        'participant-5': 5,
        'participant-6': 8,
        'participant-7': 13,
        'participant-8': 21
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBe(6.625); // (0+1+2+3+5+8+13+21) / 8
      expect(result.median).toBe(4); // median of [0,1,2,3,5,8,13,21] = (3+5)/2
      expect(result.mode).toBe(0); // All appear once, first one returned
      expect(result.totalVotes).toBe(8);
      expect(result.numericVotes).toBe(8);
    });

    it('handles duplicate values in mode calculation', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 3,
        'participant-2': 5,
        'participant-3': 3,
        'participant-4': 8,
        'participant-5': 5,
        'participant-6': 3
      };

      const result = calculateStatistics(votes);

      expect(result.mode).toBe(3); // 3 appears 3 times, 5 appears 2 times
    });

    it('handles zero values correctly', () => {
      const votes: Record<string, CardValue | null> = {
        'participant-1': 0,
        'participant-2': 0,
        'participant-3': 1
      };

      const result = calculateStatistics(votes);

      expect(result.average).toBe(1/3); // (0+0+1) / 3
      expect(result.median).toBe(0); // median of [0,0,1]
      expect(result.mode).toBe(0); // 0 appears twice
      expect(result.totalVotes).toBe(3);
      expect(result.numericVotes).toBe(3);
    });
  });
});
