'use client';

import { useState } from 'react';
import { useDevice } from '@/hooks/useDevice';

interface ZabutonStackProps {
  count: number;
  userName: string;
  colorSeed?: number;
  isHost?: boolean; // 主催者かどうか
  onConfiscate?: () => void; // 没収コールバック
  compact?: boolean; // モバイル用コンパクト表示
}

// ユーザー名からカラーを生成
function generateColor(name: string, seed: number = 0): { primary: string; secondary: string; skin: string } {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);

  const hues = [
    { primary: '#e74c3c', secondary: '#c0392b' },
    { primary: '#3498db', secondary: '#2980b9' },
    { primary: '#2ecc71', secondary: '#27ae60' },
    { primary: '#9b59b6', secondary: '#8e44ad' },
    { primary: '#f39c12', secondary: '#d68910' },
    { primary: '#1abc9c', secondary: '#16a085' },
    { primary: '#e91e63', secondary: '#c2185b' },
    { primary: '#00bcd4', secondary: '#0097a7' },
  ];

  const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];

  const colorSet = hues[hash % hues.length];
  const skin = skinTones[hash % skinTones.length];

  return { ...colorSet, skin };
}

function Zabuton({ index, isConfiscating, compact }: { index: number; isConfiscating?: boolean; compact?: boolean }) {
  const colors = [
    'bg-red-700',
    'bg-purple-700',
    'bg-blue-700',
    'bg-green-700',
    'bg-yellow-600',
  ];
  const color = colors[index % colors.length];
  const offset = (index % 2 === 0 ? 1 : -1) * (index % 3);

  return (
    <div
      className={`
        ${color}
        ${compact ? 'w-24 h-5' : 'w-36 h-7'}
        rounded-lg
        shadow-lg
        border-2 border-yellow-400
        relative
        transition-all duration-300
        ${isConfiscating ? 'animate-confiscate' : 'animate-bounce-in'}
      `}
      style={{
        transform: `translateX(${offset}px)`,
        animationDelay: isConfiscating ? '0s' : `${index * 0.05}s`,
        zIndex: index + 1,
      }}
    >
      <div className={`absolute ${compact ? '-left-1.5 w-1.5 h-2.5' : '-left-2 w-2.5 h-3.5'} top-1/2 -translate-y-1/2 bg-yellow-400 rounded-full`} />
      <div className={`absolute ${compact ? '-right-1.5 w-1.5 h-2.5' : '-right-2 w-2.5 h-3.5'} top-1/2 -translate-y-1/2 bg-yellow-400 rounded-full`} />
      <div className={`absolute ${compact ? 'inset-x-3 h-0.5' : 'inset-x-5 h-1'} top-1.5 bg-white/20 rounded-full`} />
    </div>
  );
}

// 座っている簡易キャラクター（SVG）
function SittingCharacter({ name, colorSeed = 0, isShocked, compact }: { name: string; colorSeed?: number; isShocked?: boolean; compact?: boolean }) {
  const colors = generateColor(name, colorSeed);
  // サイズを大きくした（PC: 96x84, モバイル: 72x63）
  const size = compact ? { width: 72, height: 63 } : { width: 96, height: 84 };

  return (
    <div className={`flex flex-col items-center relative z-50 ${isShocked ? 'animate-shake' : ''}`}>
      <svg
        width={size.width}
        height={size.height}
        viewBox="0 0 64 56"
        className="drop-shadow-lg"
      >
        {/* 頭 */}
        <circle
          cx="32"
          cy="14"
          r="12"
          fill={colors.skin}
          stroke="#333"
          strokeWidth="1"
        />

        {/* 髪の毛 */}
        <ellipse
          cx="32"
          cy="8"
          rx="10"
          ry="6"
          fill="#333"
        />

        {/* 目 - ショック時は違う表情 */}
        {isShocked ? (
          <>
            <text x="28" y="17" fontSize="8" textAnchor="middle">×</text>
            <text x="36" y="17" fontSize="8" textAnchor="middle">×</text>
          </>
        ) : (
          <>
            <ellipse cx="28" cy="14" rx="2" ry="2.5" fill="#333" />
            <ellipse cx="36" cy="14" rx="2" ry="2.5" fill="#333" />
          </>
        )}

        {/* 口 - ショック時は違う表情 */}
        {isShocked ? (
          <ellipse cx="32" cy="21" rx="4" ry="3" fill="#333" />
        ) : (
          <path
            d="M 28 19 Q 32 23 36 19"
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* ほっぺ */}
        {!isShocked && (
          <>
            <circle cx="24" cy="17" r="2" fill="#ffb6c1" opacity="0.6" />
            <circle cx="40" cy="17" r="2" fill="#ffb6c1" opacity="0.6" />
          </>
        )}

        {/* 汗（ショック時） */}
        {isShocked && (
          <path d="M 46 10 Q 48 14 46 18" stroke="#4FC3F7" strokeWidth="2" fill="none" />
        )}

        {/* 体（着物風） */}
        <path
          d="M 20 26
             L 16 50
             L 48 50
             L 44 26
             Q 32 30 20 26"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="1"
        />

        {/* 襟 */}
        <path
          d="M 28 26 L 32 34 L 36 26"
          fill="white"
          stroke="#ddd"
          strokeWidth="0.5"
        />

        {/* 帯 */}
        <rect
          x="18"
          y="38"
          width="28"
          height="5"
          rx="1"
          fill={colors.secondary}
        />

        {/* 腕（左） */}
        <ellipse
          cx="18"
          cy="44"
          rx="5"
          ry="4"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="1"
        />
        <circle cx="16" cy="46" r="3" fill={colors.skin} />

        {/* 腕（右） */}
        <ellipse
          cx="46"
          cy="44"
          rx="5"
          ry="4"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="1"
        />
        <circle cx="48" cy="46" r="3" fill={colors.skin} />
      </svg>

      {/* ユーザー名 */}
      <span className={`mt-2 px-3 py-1 bg-black/80 text-white rounded-full whitespace-nowrap truncate font-bold shadow-lg ${compact ? 'text-sm max-w-[90px]' : 'text-base max-w-[120px]'}`}>
        {name}
      </span>
    </div>
  );
}

export default function ZabutonStack({
  count,
  userName,
  colorSeed = 0,
  isHost = false,
  onConfiscate,
  compact: compactProp
}: ZabutonStackProps) {
  const [isConfiscating, setIsConfiscating] = useState(false);
  const { isMobile } = useDevice();

  // propsで指定されている場合はそれを優先、なければデバイス判定
  const compact = compactProp ?? isMobile;

  const handleConfiscate = () => {
    if (count <= 0 || !onConfiscate) return;

    setIsConfiscating(true);

    // アニメーション後に実際の没収処理
    setTimeout(() => {
      onConfiscate();
      setIsConfiscating(false);
    }, 600);
  };

  // モバイルでは座布団の表示数を制限（パフォーマンス対策）
  const displayCount = compact ? Math.min(count, 10) : count;

  return (
    <div className="flex flex-col items-center">
      {/* 座布団カウント（上部） */}
      <div className="mb-3 text-center">
        <span className={`font-bold text-yellow-400 drop-shadow-lg ${compact ? 'text-3xl' : 'text-4xl'}`}>
          {count}
        </span>
        <span className={`text-white ml-1 ${compact ? 'text-base' : 'text-xl'}`}>枚</span>
      </div>

      {/* 座布団 + キャラクターのコンテナ */}
      <div
        className="relative flex flex-col items-center justify-end transition-all duration-300"
        style={{ minHeight: compact ? '200px' : '300px' }}
      >
        {/* キャラクター（座布団の上に乗る） */}
        <div className="mb-0">
          <SittingCharacter name={userName} colorSeed={colorSeed} isShocked={isConfiscating} compact={compact} />
        </div>

        {/* 座布団の山（下から上に積み上がる） */}
        <div className="flex flex-col-reverse items-center -mt-2 relative">
          {Array.from({ length: displayCount }).map((_, index) => (
            <Zabuton
              key={index}
              index={index}
              isConfiscating={isConfiscating && index === displayCount - 1}
              compact={compact}
            />
          ))}
        </div>
      </div>

      {/* 没収ボタン（ホストのみ表示） */}
      {isHost && onConfiscate && count > 0 && (
        <button
          onClick={handleConfiscate}
          disabled={isConfiscating}
          className={`mt-3 bg-gray-700 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1 ${compact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'}`}
        >
          <span>🚫</span>
          <span>没収！</span>
        </button>
      )}
    </div>
  );
}
