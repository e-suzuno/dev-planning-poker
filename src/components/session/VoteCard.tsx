import React from 'react';
import { CardValue } from '@/types/session';

interface VoteCardProps {
  value: CardValue;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: (value: CardValue) => void;
}

export default function VoteCard({ value, isSelected, isDisabled, onClick }: VoteCardProps) {
  const baseClasses = 'relative w-16 h-24 rounded-lg border-2 transition-all duration-200 font-bold text-lg';
  const selectedClasses = isSelected 
    ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-lg scale-105' 
    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md';
  const disabledClasses = isDisabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer hover:scale-102';

  return (
    <button
      onClick={() => onClick(value)}
      disabled={isDisabled}
      className={`${baseClasses} ${selectedClasses} ${disabledClasses}`}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {value}
      </span>
    </button>
  );
}
