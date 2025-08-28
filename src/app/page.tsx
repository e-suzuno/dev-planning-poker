'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateSessionRequest, CreateSessionResponse } from '@/types/session';

export default function HomePage() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [joinName, setJoinName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async () => {
    if (!creatorName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: CreateSessionRequest = {
        creatorName: creatorName.trim(),
        topic: sessionTopic.trim() || undefined
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data: CreateSessionResponse = await response.json();
      router.push(`/session/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!joinSessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${joinSessionId.trim()}`);
      if (!response.ok) {
        throw new Error('Session not found');
      }

      router.push(`/session/${joinSessionId.trim()}?name=${encodeURIComponent(joinName.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Planning Poker
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          チーム見積もりのためのオンラインプランニングポーカー
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-md mx-auto">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold mb-4">セッションを作成</h2>
            <p className="text-gray-600 mb-4">
              新しいプランニングポーカーセッションを開始します
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="あなたの名前"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="セッションのトピック（任意）"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleCreateSession}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? '作成中...' : 'セッション作成'}
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold mb-4">セッションに参加</h2>
            <p className="text-gray-600 mb-4">
              既存のセッションに参加します
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="あなたの名前"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="セッションIDを入力"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <button
                onClick={handleJoinSession}
                disabled={loading}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? '参加中...' : '参加'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
