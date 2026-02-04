'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ZabutonStack from '@/components/ZabutonStack';
import { useDevice } from '@/hooks/useDevice';

interface Player {
  id: string;
  name: string;
  colorSeed: number;
  isHost: boolean;
  totalZabuton: number;
}

interface Answer {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  zabutonCount: number;
  votedBy: string[]; // 誰が投票したか
  createdAt: Date;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = params.code as string;
  const roomName = searchParams.get('name') || '大喜利ルーム';
  const hostName = searchParams.get('host') || '';
  const { isMobile } = useDevice();

  // ローカルステート（後でSupabaseに接続）
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [theme, setTheme] = useState('');
  const [generatedTopic, setGeneratedTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isHost, setIsHost] = useState(false);

  // 初期化
  useEffect(() => {
    const playerName = localStorage.getItem('playerName') || '';

    // ホスト判定: URLにhostパラメータがあり、自分の名前と一致する場合のみホスト
    // 招待リンクから入った場合はhostパラメータがないのでホストにならない
    const isHostFlag = hostName !== '' && playerName === hostName;
    setIsHost(isHostFlag);

    // 名前が未設定の場合（直接リンクでアクセス）は名前入力を促す
    const displayName = playerName || 'ゲスト';

    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: displayName,
      colorSeed: Math.floor(Math.random() * 100),
      isHost: isHostFlag,
      totalZabuton: 0,
    };
    setCurrentPlayer(player);

    // 自分だけをプレイヤーリストに追加
    setPlayers([player]);

    // お題は空の状態で開始（ホストが設定する）
    setCurrentTopic('');

    // 回答も空の状態で開始
    setAnswers([]);
  }, [hostName]);

  // AIでお題を生成
  const handleGenerateTopic = async () => {
    if (!theme.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      const data = await response.json();
      setGeneratedTopic(data.topic);
    } catch (error) {
      console.error('Failed to generate topic:', error);
      // フォールバック
      setGeneratedTopic(`「${theme}」の意外な一面とは？`);
    } finally {
      setIsGenerating(false);
    }
  };

  // お題を確定
  const handleSetTopic = () => {
    if (!generatedTopic.trim()) return;
    setCurrentTopic(generatedTopic);
    setGeneratedTopic('');
    setTheme('');
    setAnswers([]); // 新しいお題で回答リセット
  };

  // 回答を投稿
  const handlePostAnswer = () => {
    if (!newAnswer.trim() || !currentPlayer) return;

    const answer: Answer = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      content: newAnswer,
      zabutonCount: 0,
      votedBy: [],
      createdAt: new Date(),
    };

    setAnswers(prev => [answer, ...prev]);
    setNewAnswer('');
  };

  // 座布団を渡す
  const handleGiveZabuton = (answerId: string) => {
    if (!currentPlayer) return;

    setAnswers(prev =>
      prev.map(answer => {
        if (answer.id === answerId) {
          // 既に投票済みなら何もしない
          if (answer.votedBy.includes(currentPlayer.id)) return answer;
          // 自分の回答には投票できない
          if (answer.playerId === currentPlayer.id) return answer;

          return {
            ...answer,
            zabutonCount: answer.zabutonCount + 1,
            votedBy: [...answer.votedBy, currentPlayer.id],
          };
        }
        return answer;
      })
    );

    // プレイヤーの累計座布団も更新
    setPlayers(prev =>
      prev.map(p => {
        const answer = answers.find(a => a.id === answerId);
        if (answer && p.id === answer.playerId) {
          return { ...p, totalZabuton: p.totalZabuton + 1 };
        }
        return p;
      })
    );
  };

  // 座布団を没収（ホストのみ）
  const handleConfiscate = (playerId: string) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === playerId && p.totalZabuton > 0) {
          return { ...p, totalZabuton: p.totalZabuton - 1 };
        }
        return p;
      })
    );
  };

  // URLをコピー
  const handleCopyInvite = () => {
    const url = window.location.origin + `/room/${roomCode}`;
    navigator.clipboard.writeText(`大喜利バトルに参加しよう！\nルームコード: ${roomCode}\n${url}`);
    alert('招待リンクをコピーしました！');
  };

  const sortedPlayers = [...players].sort((a, b) => b.totalZabuton - a.totalZabuton);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
      {/* ヘッダー */}
      <header className={`border-b border-white/10 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className={`font-bold text-white truncate ${isMobile ? 'text-base' : 'text-xl'}`}>{roomName}</h1>
            <p className={`text-purple-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              コード: <span className="font-mono text-yellow-400">{roomCode}</span>
            </p>
          </div>
          <button
            onClick={handleCopyInvite}
            className={`bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors whitespace-nowrap ml-2 ${isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
          >
            招待する
          </button>
        </div>
      </header>

      <div className={`max-w-4xl mx-auto ${isMobile ? 'p-3 space-y-4' : 'p-4 space-y-6'}`}>
        {/* お題セクション */}
        <section className={`bg-gradient-to-r from-red-800 to-red-900 rounded-xl shadow-2xl border-2 border-yellow-500 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="text-center">
            <span className={`text-yellow-400 font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>お題</span>
            {currentTopic ? (
              <h2 className={`mt-2 font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>{currentTopic}</h2>
            ) : (
              <p className="mt-2 text-white/60">ホストがお題を設定中...</p>
            )}
          </div>

          {/* ホストのみお題設定可能 */}
          {isHost && (
            <div className="mt-4 space-y-3">
              {/* テーマ入力 + 生成ボタン */}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={isMobile ? 'テーマを入力' : 'テーマを入力（例：AI、恋愛、仕事）'}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateTopic()}
                  className={`flex-1 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
                />
                <button
                  onClick={handleGenerateTopic}
                  disabled={!theme.trim() || isGenerating}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${isMobile ? 'px-4 py-2 text-sm' : 'px-4 py-2'}`}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      生成中
                    </>
                  ) : (
                    '🎲 AIで生成'
                  )}
                </button>
              </div>

              {/* 生成されたお題のプレビュー */}
              {generatedTopic && (
                <div className={`bg-black/30 rounded-lg border border-yellow-500/50 ${isMobile ? 'p-3' : 'p-4'}`}>
                  <p className="text-yellow-400 text-sm mb-1">生成されたお題：</p>
                  <p className={`text-white font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{generatedTopic}</p>
                  <div className={`mt-3 flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
                    <button
                      onClick={handleSetTopic}
                      className={`bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-2'}`}
                    >
                      このお題で出題！
                    </button>
                    <button
                      onClick={handleGenerateTopic}
                      disabled={isGenerating}
                      className={`bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors ${isMobile ? 'px-4 py-2 text-sm' : 'px-4 py-2'}`}
                    >
                      別のお題を生成
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* プレイヤーランキング（座布団表示） */}
        <section className={isMobile ? 'py-3' : 'py-6'}>
          <h3 className={`font-bold text-white mb-4 text-center ${isMobile ? 'text-base' : 'text-lg'}`}>座布団ランキング</h3>
          <div className={`flex flex-wrap justify-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
            {sortedPlayers.slice(0, isMobile ? 3 : 4).map((player, index) => (
              <div
                key={player.id}
                className={`
                  relative rounded-xl
                  ${index === 0 ? 'bg-yellow-900/30 ring-2 ring-yellow-500' : 'bg-white/5'}
                  ${isMobile ? 'p-2' : 'p-4'}
                `}
              >
                {index < 3 && (
                  <div className={`
                    absolute -top-2 -right-2 rounded-full flex items-center justify-center font-bold
                    ${isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'}
                    ${index === 0 ? 'bg-yellow-500 text-yellow-900' : ''}
                    ${index === 1 ? 'bg-gray-400 text-gray-900' : ''}
                    ${index === 2 ? 'bg-orange-600 text-orange-100' : ''}
                  `}>
                    {index + 1}
                  </div>
                )}
                <ZabutonStack
                  count={player.totalZabuton}
                  userName={player.name}
                  colorSeed={player.colorSeed}
                  isHost={isHost}
                  onConfiscate={() => handleConfiscate(player.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 回答投稿 */}
        <section className={`bg-white/5 rounded-xl ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
            <input
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="あなたの回答を入力..."
              maxLength={100}
              onKeyDown={(e) => e.key === 'Enter' && !isMobile && handlePostAnswer()}
              className={`flex-1 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
            />
            <button
              onClick={handlePostAnswer}
              disabled={!newAnswer.trim()}
              className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'}`}
            >
              回答
            </button>
          </div>
        </section>

        {/* 回答一覧 */}
        <section className="space-y-3">
          <h3 className={`font-bold text-white ${isMobile ? 'text-base' : 'text-lg'}`}>みんなの回答</h3>
          {answers.length === 0 ? (
            <p className="text-white/50 text-center py-8">まだ回答がありません</p>
          ) : (
            answers.map((answer) => {
              const hasVoted = !!(currentPlayer && answer.votedBy.includes(currentPlayer.id));
              const isOwnAnswer = !!(currentPlayer && answer.playerId === currentPlayer.id);

              return (
                <div
                  key={answer.id}
                  className={`bg-white/5 rounded-xl ${isMobile ? 'p-3' : 'p-4'}`}
                >
                  {/* モバイル: 縦並び / デスクトップ: 横並び */}
                  <div className={isMobile ? 'space-y-2' : 'flex items-start gap-4'}>
                    <div className="flex-1">
                      <p className={`text-white ${isMobile ? 'text-base' : 'text-lg'}`}>{answer.content}</p>
                      <p className={`text-purple-300 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>by {answer.playerName}</p>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-3'}`}>
                      <span className={`text-yellow-400 font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        {answer.zabutonCount}枚
                      </span>
                      <button
                        onClick={() => handleGiveZabuton(answer.id)}
                        disabled={hasVoted || isOwnAnswer}
                        className={`
                          rounded-lg font-bold transition-all
                          ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}
                          ${hasVoted
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : isOwnAnswer
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                          }
                        `}
                      >
                        {hasVoted ? '済' : isOwnAnswer ? '-' : '座布団！'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
