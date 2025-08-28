'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Session, Participant, CardValue } from '@/types/session';
import { useSocket } from '@/lib/socket-client';
import VotingPanel from '@/components/session/VotingPanel';
import ParticipantsList from '@/components/session/ParticipantsList';
import ResultsDisplay from '@/components/session/ResultsDisplay';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const joinName = searchParams.get('name');
  
  const { 
    socket, 
    isConnected, 
    session, 
    participantId, 
    joinSession, 
    castVote, 
    revealRound, 
    resetRound 
  } = useSocket(sessionId);
  
  const [selectedVote, setSelectedVote] = useState<CardValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (sessionId && isConnected) {
      setLoading(false);
    }
  }, [sessionId, isConnected]);

  useEffect(() => {
    if (joinName && isConnected && !hasJoined && !participantId) {
      joinSession(joinName);
      setHasJoined(true);
    }
  }, [joinName, isConnected, hasJoined, participantId, joinSession]);

  useEffect(() => {
    if (session && participantId) {
      const currentVote = session.currentRound.votes[participantId];
      if (currentVote !== undefined) {
        setSelectedVote(currentVote);
      }
    }
  }, [session, participantId]);

  const handleVoteSelect = async (value: CardValue) => {
    if (!session || !participantId || session.currentRound.revealedAt) return;
    
    setSelectedVote(value);
    castVote(value);
  };

  const handleReveal = async () => {
    revealRound();
  };

  const handleReset = async () => {
    setSelectedVote(null);
    resetRound();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!session && !isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Connecting...</h1>
          <p className="text-gray-600 mb-4">Establishing real-time connection...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-4">The session you are looking for does not exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isRoundRevealed = !!session.currentRound.revealedAt;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {session.topic || 'Planning Poker Session'}
        </h1>
        <p className="text-gray-600">Session ID: {session.id}</p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <VotingPanel
            selectedVote={selectedVote}
            isRoundRevealed={isRoundRevealed}
            onVoteSelect={handleVoteSelect}
          />
          
          <ResultsDisplay
            currentRound={session.currentRound}
            isRevealed={isRoundRevealed}
            onReveal={handleReveal}
            onReset={handleReset}
          />
        </div>
        
        <div>
          <ParticipantsList
            participants={session.participants}
            currentRound={session.currentRound}
            isRoundRevealed={isRoundRevealed}
          />
        </div>
      </div>
    </div>
  );
}
