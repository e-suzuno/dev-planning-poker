'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Session, Participant } from '@/types/session';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {session.topic || 'Planning Poker Session'}
        </h1>
        <p className="text-gray-600">Session ID: {session.id}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
          <h2 className="text-xl font-semibold mb-4">Participants ({session.participants.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.participants.map((participant: Participant) => (
              <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <div className={`w-3 h-3 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">{participant.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
