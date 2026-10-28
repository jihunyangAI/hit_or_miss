import React from 'react';
import { GameMode } from '../types';
import { sounds } from '../utils/sound';
import { Volume2, VolumeX, Sparkles, Skull } from 'lucide-react';

interface TopBarProps {
  mode: GameMode;
  onModeChange: (newMode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isSpinning: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onModeChange,
  isMuted,
  onToggleMute,
  isSpinning,
}) => {
  return (
    <header className="w-full bg-white/85 backdrop-blur-md border-b border-sky-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 via-sky-400 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-sky-200">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h1 className="font-jua text-xl md:text-2xl text-slate-900 tracking-tight leading-none">
              두근두근 복불복
            </h1>
            <span className="text-[11px] font-medium text-sky-700 tracking-wide">
              행운 & 벌칙 룰렛
            </span>
          </div>
        </div>

        {/* Mode Selector (Interactive Segmented Control) */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70">
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              if (mode !== 'lucky') {
                sounds.playPop();
                onModeChange('lucky');
              }
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              mode === 'lucky'
                ? 'bg-white text-orange-600 shadow-xs border border-orange-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>행운의 1인 뽑기</span>
          </button>

          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              if (mode !== 'penalty') {
                sounds.playPop();
                onModeChange('penalty');
              }
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              mode === 'penalty'
                ? 'bg-white text-rose-600 shadow-xs border border-rose-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>벌칙 / 당번 뽑기</span>
          </button>
        </div>

        {/* Right Action: Sound Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onToggleMute();
            }}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              isMuted
                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
            }`}
            title={isMuted ? '소리 켜기' : '음소거'}
            aria-label={isMuted ? '소리 켜기' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden md:inline text-xs">{isMuted ? '음소거' : '효과음'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Mode Selector strip */}
      <div className="sm:hidden px-4 pb-2 pt-1 flex items-center justify-center">
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 w-full">
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              if (mode !== 'lucky') {
                sounds.playPop();
                onModeChange('lucky');
              }
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'lucky'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>행운 뽑기</span>
          </button>

          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              if (mode !== 'penalty') {
                sounds.playPop();
                onModeChange('penalty');
              }
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'penalty'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>벌칙 뽑기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
