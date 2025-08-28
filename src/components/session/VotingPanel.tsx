import React from 'react';
import { CardValue } from '@/types/session';
import VoteCard from './VoteCard';

interface VotingPanelProps {
  selectedVote: CardValue | null;
  isRoundRevealed: boolean;
  onVoteSelect: (value: CardValue) => void;
}

const CARD_VALUES: CardValue[] = [0, 1, 2, 3, 5, 8, 13, 21, '?'];

export default function VotingPanel({ selectedVote, isRoundRevealed, onVoteSelect }: VotingPanelProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-xl font-semibold mb-4">カードを選択</h2>
      <p className="text-gray-600 mb-6">
        {isRoundRevealed 
          ? '結果が公開されました。新しいラウンドを開始してください。'
          : 'ストーリーポイントを選択してください'
        }
      </p>
      
      <div className="grid grid-cols-5 gap-3 justify-items-center">
        {CARD_VALUES.map((value) => (
          <VoteCard
            key={value}
            value={value}
            isSelected={selectedVote === value}
            isDisabled={isRoundRevealed}
            onClick={onVoteSelect}
          />
        ))}
      </div>
      
      {selectedVote !== null && !isRoundRevealed && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            選択中: <span className="font-bold">{selectedVote}</span>
          </p>
        </div>
      )}
    </div>
  );
}
