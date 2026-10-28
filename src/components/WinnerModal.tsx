import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Participant, GameMode } from '../types';
import { sounds } from '../utils/sound';
import { Trophy, Skull, RotateCcw, UserMinus, Copy, Check, X, Sparkles, AlertOctagon } from 'lucide-react';

interface WinnerModalProps {
  winner: Participant | null;
  penalty?: string | null;
  mode: GameMode;
  onClose: () => void;
  onSpinAgain: () => void;
  onExcludeAndSpinAgain: (participantId: string) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  penalty,
  mode,
  onClose,
  onSpinAgain,
  onExcludeAndSpinAgain,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!winner) return;

    // Play fanfare win chime
    sounds.playWin();

    // Fire fireworks / confetti burst!
    const count = 200;
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FF6B6B', '#4ECDC4', '#FFD166'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#FF8ED4', '#3A86FF', '#06D6A0'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 1.2,
      shapes: ['star', 'circle'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#FFE400', '#FFBD00', '#E85D04'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [winner]);

  if (!winner) return null;

  const isLucky = mode === 'lucky';

  const handleCopy = () => {
    const penaltyText = penalty ? ` (수행 벌칙: ${penalty})` : '';
    const text = isLucky
      ? `🎉 [두근두근 복불복 결과] 축하합니다! 오늘의 당첨자는 【${winner.name}】님 입니다! 🍀${penaltyText}`
      : `💥 [두근두근 복불복 결과] 오늘의 벌칙 당첨자는 【${winner.name}】님 입니다! 😈${penaltyText}`;
    
    navigator.clipboard?.writeText(text);
    setCopied(true);
    sounds.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-sky-300 text-center transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Decorative Top Badge */}
        <div className="flex justify-center -mt-14 mb-3">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${
              isLucky
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900'
                : 'bg-gradient-to-tr from-rose-500 to-orange-400 text-white'
            }`}
          >
            {isLucky ? (
              <Trophy className="w-10 h-10 animate-bounce" />
            ) : (
              <Skull className="w-10 h-10 animate-bounce" />
            )}
          </div>
        </div>

        {/* Subtitle / Mode Announcement */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2 bg-sky-50 text-sky-800 border border-sky-200">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>{isLucky ? '축하합니다! 오늘의 당첨자' : '당첨! 오늘의 벌칙자 & 당번'}</span>
        </div>

        {/* Huge Prominent Winner Name */}
        <div className="my-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-sky-50/70 to-blue-50/40 border-2 border-dashed border-sky-300">
          <p className="text-xs text-slate-500 font-medium tracking-wider mb-1">
            ROUND WINNER
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-jua tracking-wide break-keep"
            style={{
              color: winner.color,
              textShadow: '0 2px 10px rgba(0,0,0,0.08)',
            }}
          >
            {winner.name}
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-2">
            {isLucky ? '오늘 하루 가장 큰 행운이 함께할 거예요! ✨' : '다음엔 꼭 면제되시길 응원합니다! 😆'}
          </p>
        </div>

        {/* Prominent Assigned Penalty Box (If Penalty Exists) */}
        {penalty && (
          <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border-2 border-rose-300 shadow-sm text-center animate-in slide-in-from-bottom-2 duration-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold tracking-wide shadow-xs mb-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>수행할 랜덤 벌칙</span>
            </div>
            <p className="text-2xl sm:text-3xl font-jua text-rose-600 break-keep mt-1 leading-snug">
              {penalty}
            </p>
            <p className="text-xs text-rose-400 mt-1 font-medium">
              지금 바로 벌칙을 수행해주세요! 🎯
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-orange-300 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4" />
            <span>한 번 더 뽑기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onExcludeAndSpinAgain(winner.id);
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base border border-slate-200"
            title="현재 당첨자를 목록에서 제외하고 다음 라운드를 진행합니다"
          >
            <UserMinus className="w-4 h-4 text-rose-500" />
            <span>제외하고 다음 판</span>
          </button>
        </div>

        {/* Secondary Actions (Copy & Close) */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">결과가 복사되었습니다!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>결과 메시지 복사</span>
              </>
            )}
          </button>

          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-50"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
