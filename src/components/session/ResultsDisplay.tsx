import React from 'react';
import { Round } from '@/types/session';
import { calculateStatistics, VoteStatistics } from '@/lib/vote-statistics';

interface ResultsDisplayProps {
  currentRound: Round;
  isRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export default function ResultsDisplay({ currentRound, isRevealed, onReveal, onReset }: ResultsDisplayProps) {
  const stats: VoteStatistics = calculateStatistics(currentRound.votes);
  const allVoted = Object.keys(currentRound.votes).length > 0 && 
                  Object.values(currentRound.votes).every(vote => vote !== null);

  if (!isRevealed) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4">投票状況</h2>
        <p className="text-gray-600 mb-4">
          {stats.totalVotes > 0 
            ? `${stats.totalVotes}人が投票済み` 
            : '投票を待っています...'}
        </p>
        
        {allVoted && (
          <button
            onClick={onReveal}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            結果を公開
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-xl font-semibold mb-4">投票結果</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {stats.average !== null ? stats.average.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-blue-600">平均値</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            {stats.median !== null ? stats.median : 'N/A'}
          </div>
          <div className="text-sm text-green-600">中央値</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-700">
            {stats.mode !== null ? stats.mode : 'N/A'}
          </div>
          <div className="text-sm text-purple-600">最頻値</div>
        </div>
      </div>
      
      <button
        onClick={onReset}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        新しいラウンドを開始
      </button>
    </div>
  );
}
