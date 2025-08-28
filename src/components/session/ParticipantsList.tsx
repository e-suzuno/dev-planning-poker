import React from 'react';
import { Participant, Round } from '@/types/session';

interface ParticipantsListProps {
  participants: Participant[];
  currentRound: Round;
  isRoundRevealed: boolean;
}

export default function ParticipantsList({ participants, currentRound, isRoundRevealed }: ParticipantsListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-xl font-semibold mb-4">参加者 ({participants.length})</h2>
      <div className="space-y-3">
        {participants.map((participant) => {
          const hasVoted = currentRound.votes[participant.id] !== undefined;
          const vote = currentRound.votes[participant.id];
          
          return (
            <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">{participant.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {isRoundRevealed && vote !== undefined ? (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {vote}
                  </span>
                ) : hasVoted ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    投票済み
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    未投票
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
