'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Session, Participant, CardValue } from '@/types/session';
import VotingPanel from '@/components/session/VotingPanel';
import ParticipantsList from '@/components/session/ParticipantsList';
import ResultsDisplay from '@/components/session/ResultsDisplay';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const joinName = searchParams.get('name');
  
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<CardValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          throw new Error('Session not found');
        }
        const data = await response.json();
        setSession(data.session);
        
        if (joinName && !participantId) {
          const existingParticipant = data.session.participants.find((p: Participant) => p.name === joinName);
          if (existingParticipant) {
            setParticipantId(existingParticipant.id);
            const currentVote = data.session.currentRound.votes[existingParticipant.id];
            if (currentVote !== undefined) {
              setSelectedVote(currentVote);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, joinName, participantId]);

  const handleVoteSelect = async (value: CardValue) => {
    if (!session || !participantId || session.currentRound.revealedAt) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId, value }),
      });

      if (response.ok) {
        setSelectedVote(value);
        const data = await response.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error('Failed to cast vote:', err);
    }
  };

  const handleReveal = async () => {
    console.log('Reveal functionality will be implemented with Socket.IO');
  };

  const handleReset = async () => {
    console.log('Reset functionality will be implemented with Socket.IO');
    setSelectedVote(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The session you are looking for does not exist.'}</p>
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
