import React from 'react';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Planning Poker
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          チーム見積もりのためのオンラインプランニングポーカー
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold mb-4">セッションを作成</h2>
            <p className="text-gray-600 mb-4">
              新しいプランニングポーカーセッションを開始します
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              セッション作成
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold mb-4">セッションに参加</h2>
            <p className="text-gray-600 mb-4">
              既存のセッションに参加します
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="セッションIDを入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                参加
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
