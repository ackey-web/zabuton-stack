'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim() || !roomName.trim()) {
      setError('名前とルーム名を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    // ローカルストレージに保存してルームページへ
    const newRoomCode = generateRoomCode();
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('isHost', 'true');
    router.push(`/room/${newRoomCode}?name=${encodeURIComponent(roomName)}&host=${encodeURIComponent(playerName)}`);
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError('名前とルームコードを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    localStorage.setItem('playerName', playerName);
    localStorage.setItem('isHost', 'false');
    router.push(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex flex-col items-center justify-center p-4">
      {/* タイトル */}
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-2">
        大喜利バトル
      </h1>
      <p className="text-purple-300 mb-12">座布団を積み上げろ！</p>

      {/* モード選択 */}
      {mode === 'select' && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setMode('create')}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            部屋を作る
          </button>
          <button
            onClick={() => setMode('join')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xl rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            部屋に参加
          </button>
        </div>
      )}

      {/* 部屋作成フォーム */}
      {mode === 'create' && (
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-6 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">部屋を作る</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 text-sm mb-1">あなたの名前</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="例：笑点太郎"
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-purple-300 text-sm mb-1">ルーム名</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="例：今夜の大喜利大会"
                maxLength={30}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? '作成中...' : '部屋を作成'}
            </button>

            <button
              onClick={() => setMode('select')}
              className="w-full text-purple-300 hover:text-white transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      )}

      {/* 部屋参加フォーム */}
      {mode === 'join' && (
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-6 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">部屋に参加</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 text-sm mb-1">あなたの名前</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="例：大喜利マスター"
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-purple-300 text-sm mb-1">ルームコード</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="例：OG-ABCD"
                maxLength={8}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xl rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? '参加中...' : '参加する'}
            </button>

            <button
              onClick={() => setMode('select')}
              className="w-full text-purple-300 hover:text-white transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ルームコード生成
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'OG-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
