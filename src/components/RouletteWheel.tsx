import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Participant } from '../types';
import { sounds } from '../utils/sound';
import { Sparkles, Dices, AlertCircle } from 'lucide-react';

interface RouletteWheelProps {
  participants: Participant[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Participant) => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  participants,
  isSpinning,
  onSpinStart,
  onSpinEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSliceIndexRef = useRef<number>(-1);
  const [pointerBounce, setPointerBounce] = useState<boolean>(false);

  // Draw wheel on canvas
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 24;

    ctx.clearRect(0, 0, width, height);

    const count = participants.length;

    if (count === 0) {
      // Empty state circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('참가자를 추가해주세요', centerX, centerY);
      ctx.restore();
      return;
    }

    const sliceAngle = (2 * Math.PI) / count;

    // Draw slices
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < count; i++) {
      const p = participants[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();

      // Hairline slice border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text inside slice
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      // Radial text position
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = p.textColor || '#FFFFFF';

      // Drop shadow for text readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Dynamic font size depending on count
      const fontSize = count > 18 ? 14 : count > 12 ? 16 : count > 6 ? 19 : 22;
      ctx.font = `bold ${fontSize}px "Noto Sans KR", sans-serif`;

      // Smart truncate name if too long for slice
      let displayName = p.name;
      const maxTextWidth = radius * 0.65;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        while (ctx.measureText(displayName + '..').width > maxTextWidth && displayName.length > 1) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '..';
      }

      ctx.fillText(displayName, radius - 28, 0);

      // Small cute star dot near outer rim
      ctx.beginPath();
      ctx.arc(radius - 12, 0, 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();

    // Outer ring with decorative bulbs
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();

    // Decorative bulb dots along outer rim
    const bulbCount = Math.max(16, count * 2);
    for (let b = 0; b < bulbCount; b++) {
      const bAngle = (b * (2 * Math.PI)) / bulbCount + angle * 0.3;
      const bx = centerX + Math.cos(bAngle) * (radius + 8);
      const by = centerY + Math.sin(bAngle) * (radius + 8);

      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = b % 2 === 0 ? '#FDE047' : '#FFFFFF';
      ctx.shadowColor = '#FDE047';
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.restore();

    // Center circular badge
    ctx.save();
    const centerRadius = radius * 0.22;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    // Inner gold/coral ring in center
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius - 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFF7ED';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FDBA74';
    ctx.stroke();

    // Center text / emoji
    ctx.fillStyle = '#EA580C';
    ctx.font = 'bold 24px "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍀', centerX, centerY - 2);

    ctx.restore();
  }, [participants]);

  // Initial draw and redraw on participants change
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel, participants]);

  // Calculate slice currently under pointer at 12 o'clock (-PI / 2)
  const getSliceUnderPointer = useCallback((angle: number): number => {
    if (participants.length === 0) return -1;
    const count = participants.length;
    const sliceAngle = (2 * Math.PI) / count;
    // Pointer is at -Math.PI / 2 (top)
    let pointerRelativeAngle = (-Math.PI / 2 - angle) % (2 * Math.PI);
    if (pointerRelativeAngle < 0) {
      pointerRelativeAngle += 2 * Math.PI;
    }
    return Math.floor(pointerRelativeAngle / sliceAngle) % count;
  }, [participants.length]);

  // Handle Spin Logic
  const handleStartSpin = () => {
    if (isSpinning || participants.length < 2) return;

    onSpinStart();
    sounds.playPop();

    const count = participants.length;
    const sliceAngle = (2 * Math.PI) / count;

    // Pick a random winner index fairly
    const winningIndex = Math.floor(Math.random() * count);
    const winner = participants[winningIndex];

    // Compute target angle so that winningIndex center lands under top pointer (-Math.PI / 2)
    // Slice center local angle:
    const sliceCenterAngle = winningIndex * sliceAngle + sliceAngle / 2;
    // Small random offset within slice so it feels natural (up to 30% from center)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.6);
    const targetSliceAngle = sliceCenterAngle + jitter;

    // We want targetSliceAngle + finalAngle = -Math.PI/2 (modulo 2PI)
    // So finalAngle = -Math.PI/2 - targetSliceAngle
    let desiredAngle = -Math.PI / 2 - targetSliceAngle;
    while (desiredAngle < 0) {
      desiredAngle += 2 * Math.PI;
    }

    // Number of full rotations for drama (between 7 and 10 full spins)
    const extraRotations = (7 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const currentAngle = currentAngleRef.current;
    // Ensure final rotation always advances forward
    const totalRotation = extraRotations + (desiredAngle - (currentAngle % (2 * Math.PI)) + 2 * Math.PI);
    const targetAngle = currentAngle + totalRotation;

    const startTime = performance.now();
    const duration = 4300; // 4.3 seconds spin for perfect suspense

    // Easing: smooth deceleration curve (cubic ease out)
    const easeOutCubic = (t: number) => {
      const p = t - 1;
      return p * p * p + 1;
    };

    let lastTickTime = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const angle = currentAngle + totalRotation * easedProgress;
      currentAngleRef.current = angle;
      drawWheel(angle);

      // Check current slice for tick sound and needle animation
      const currentSlice = getSliceUnderPointer(angle);
      if (currentSlice !== lastSliceIndexRef.current && currentSlice >= 0) {
        lastSliceIndexRef.current = currentSlice;
        // Throttle rapid ticks to prevent sound clipping
        if (now - lastTickTime > 40) {
          const speedFactor = 1 - progress * 0.5;
          sounds.playTick(speedFactor);
          lastTickTime = now;
          setPointerBounce(true);
          setTimeout(() => setPointerBounce(false), 60);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished!
        currentAngleRef.current = targetAngle;
        drawWheel(targetAngle);
        setPointerBounce(false);
        setTimeout(() => {
          onSpinEnd(winner);
        }, 200);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center relative w-full select-none">
      {/* Outer Glow Halo */}
      <div className="relative p-2 md:p-4 flex items-center justify-center">
        {/* Needle / Pointer at top */}
        <div
          className={`absolute top-0 z-20 flex flex-col items-center transition-transform duration-75 origin-top pointer-events-none ${
            pointerBounce ? 'rotate-[-8deg] scale-110' : 'rotate-0 scale-100'
          }`}
          style={{
            filter: 'drop-shadow(0 6px 12px rgba(239, 68, 68, 0.4))',
          }}
        >
          {/* Cute pointer needle */}
          <div className="w-8 h-8 rounded-full bg-rose-500 border-4 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
            ▼
          </div>
        </div>

        {/* Roulette Canvas */}
        <div className="rounded-full shadow-2xl p-1.5 bg-gradient-to-b from-sky-200/90 via-white to-blue-200/90 border-4 border-sky-300/80 shadow-sky-200/50 relative">
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] rounded-full cursor-pointer"
            onClick={handleStartSpin}
          />
        </div>
      </div>

      {/* Main Action Button - Super Big & Fully Rounded */}
      <div className="mt-6 w-full max-w-md px-2 flex flex-col items-center">
        <button
          type="button"
          onClick={handleStartSpin}
          disabled={isSpinning || participants.length < 2}
          className={`w-full py-5 sm:py-6 px-8 sm:px-12 rounded-full font-jua text-2xl sm:text-3xl tracking-wide text-white shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3.5 ring-4 ring-white/80 hover:ring-orange-200/90 ${
            isSpinning
              ? 'bg-amber-400 cursor-not-allowed opacity-90 animate-pulse ring-amber-200'
              : participants.length < 2
              ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed ring-slate-200'
              : 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 hover:shadow-orange-400/50 hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
          }`}
        >
          {isSpinning ? (
            <>
              <Dices className="w-8 h-8 sm:w-9 sm:h-9 animate-spin" />
              <span>두근두근 돌아가는 중...</span>
            </>
          ) : participants.length < 2 ? (
            <>
              <AlertCircle className="w-7 h-7 text-slate-400" />
              <span className="text-xl font-medium">참가자를 2명 이상 추가해주세요</span>
            </>
          ) : (
            <>
              <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 animate-bounce text-amber-200" />
              <span className="drop-shadow-md">복불복 뽑기 시작!</span>
            </>
          )}
        </button>

        {participants.length >= 2 && !isSpinning && (
          <p className="mt-3 text-xs sm:text-sm text-slate-500 text-center font-medium">
            룰렛 판을 직접 클릭하거나 위의 커다란 '뽑기' 버튼을 누르면 회전합니다!
          </p>
        )}
      </div>
    </div>
  );
};
