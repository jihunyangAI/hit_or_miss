import { useState, useCallback, useEffect } from 'react';
import { Participant, GameMode, WinnerRecord, PenaltyItem } from './types';
import { getColorForIndex, DEFAULT_PRESETS, DEFAULT_PENALTIES } from './utils/colors';
import { sounds } from './utils/sound';
import { TopBar } from './components/TopBar';
import { RouletteWheel } from './components/RouletteWheel';
import { ParticipantManager } from './components/ParticipantManager';
import { PenaltyManager } from './components/PenaltyManager';
import { WinnerModal } from './components/WinnerModal';
import { StatsAndHistory } from './components/StatsAndHistory';
import { Users, ShieldAlert } from 'lucide-react';

const STORAGE_KEY_PARTICIPANTS = 'bokbulbok_participants_v1';
const STORAGE_KEY_PENALTIES = 'bokbulbok_penalties_v1';
const STORAGE_KEY_HISTORY = 'bokbulbok_history_v1';

export default function App() {
  // Initialize participants from localStorage or default preset
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PRESETS[0].names.map((name, idx) => {
      const colorInfo = getColorForIndex(idx);
      return {
        id: `p-${Date.now()}-${idx}`,
        name,
        color: colorInfo.bg,
        textColor: colorInfo.text,
      };
    });
  });

  // Initialize penalties from localStorage or defaults
  const [penalties, setPenalties] = useState<PenaltyItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PENALTIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PENALTIES.map((text, idx) => ({
      id: `pen-${Date.now()}-${idx}`,
      text,
    }));
  });

  // Penalty enabled toggle
  const [isPenaltyEnabled, setIsPenaltyEnabled] = useState(true);

  // Tab switch for right panel (Participants vs Penalties)
  const [activeSideTab, setActiveSideTab] = useState<'participants' | 'penalties'>('participants');

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [currentPenalty, setCurrentPenalty] = useState<string | null>(null);
  const [mode, setMode] = useState<GameMode>('lucky');

  // History from localStorage
  const [history, setHistory] = useState<WinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [isMuted, setIsMuted] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    } catch {}
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PENALTIES, JSON.stringify(penalties));
    } catch {}
  }, [penalties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Add Participant
  const handleAddParticipant = useCallback((name: string): boolean => {
    if (participants.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      return false;
    }

    setParticipants((prev) => {
      const newIndex = prev.length;
      const colorInfo = getColorForIndex(newIndex);
      const newParticipant: Participant = {
        id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        color: colorInfo.bg,
        textColor: colorInfo.text,
      };
      return [...prev, newParticipant];
    });

    return true;
  }, [participants]);

  // Update Participant Name
  const handleUpdateParticipant = useCallback((id: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (participants.some((p) => p.id !== id && p.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      return false;
    }

    const target = participants.find((p) => p.id === id);
    const oldName = target?.name;

    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p))
    );

    if (oldName && oldName !== trimmed) {
      setHistory((prev) =>
        prev.map((rec) => (rec.name === oldName ? { ...rec, name: trimmed } : rec))
      );
    }

    return true;
  }, [participants]);

  // Remove Participant
  const handleRemoveParticipant = useCallback((id: string) => {
    setParticipants((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => {
        const colorInfo = getColorForIndex(idx);
        return {
          ...p,
          color: colorInfo.bg,
          textColor: colorInfo.text,
        };
      });
    });
  }, []);

  // Clear all participants
  const handleClearAllParticipants = useCallback(() => {
    setParticipants([]);
    setCurrentWinner(null);
  }, []);

  // Shuffle participants
  const handleShuffle = useCallback(() => {
    setParticipants((prev) => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5);
      return shuffled.map((p, idx) => {
        const colorInfo = getColorForIndex(idx);
        return {
          ...p,
          color: colorInfo.bg,
          textColor: colorInfo.text,
        };
      });
    });
  }, []);

  // Load Preset participants
  const handleLoadParticipantPreset = useCallback((names: string[]) => {
    const newParticipants: Participant[] = names.map((name, idx) => {
      const colorInfo = getColorForIndex(idx);
      return {
        id: `p-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        name,
        color: colorInfo.bg,
        textColor: colorInfo.text,
      };
    });
    setParticipants(newParticipants);
  }, []);

  // Add Penalty
  const handleAddPenalty = useCallback((text: string): boolean => {
    if (penalties.some((pen) => pen.text.trim().toLowerCase() === text.trim().toLowerCase())) {
      return false;
    }
    const newPen: PenaltyItem = {
      id: `pen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: text.trim(),
    };
    setPenalties((prev) => [...prev, newPen]);
    return true;
  }, [penalties]);

  // Update Penalty
  const handleUpdatePenalty = useCallback((id: string, newText: string): boolean => {
    const trimmed = newText.trim();
    if (penalties.some((pen) => pen.id !== id && pen.text.trim().toLowerCase() === trimmed.toLowerCase())) {
      return false;
    }
    setPenalties((prev) =>
      prev.map((pen) => (pen.id === id ? { ...pen, text: trimmed } : pen))
    );
    return true;
  }, [penalties]);

  // Remove Penalty
  const handleRemovePenalty = useCallback((id: string) => {
    setPenalties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Clear all penalties
  const handleClearAllPenalties = useCallback(() => {
    setPenalties([]);
  }, []);

  // Load Penalty Preset
  const handleLoadPenaltyPreset = useCallback((items: string[]) => {
    const newItems: PenaltyItem[] = items.map((text, idx) => ({
      id: `pen-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      text,
    }));
    setPenalties(newItems);
  }, []);

  // Spin start
  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
    setCurrentWinner(null);
    setCurrentPenalty(null);
  }, []);

  // Spin end: randomly pick a penalty if enabled and assign to winner!
  const handleSpinEnd = useCallback((winner: Participant) => {
    setIsSpinning(false);
    setCurrentWinner(winner);

    let assignedPenalty: string | null = null;
    if (isPenaltyEnabled && penalties.length > 0) {
      const randomIdx = Math.floor(Math.random() * penalties.length);
      assignedPenalty = penalties[randomIdx].text;
    }
    setCurrentPenalty(assignedPenalty);

    // Record into history
    const nextRound = history.length + 1;
    const newRecord: WinnerRecord = {
      id: `rec-${Date.now()}`,
      round: nextRound,
      name: winner.name,
      penalty: assignedPenalty,
      mode,
      timestamp: new Date().toISOString(),
      color: winner.color,
    };
    setHistory((prev) => [newRecord, ...prev]);
  }, [history.length, isPenaltyEnabled, mode, penalties]);

  // Exclude winner from participant list and spin again
  const handleExcludeAndSpinAgain = useCallback((winnerId: string) => {
    setCurrentWinner(null);
    setCurrentPenalty(null);
    sounds.playDelete();

    setParticipants((prev) => {
      const filtered = prev.filter((p) => p.id !== winnerId);
      return filtered.map((p, idx) => {
        const colorInfo = getColorForIndex(idx);
        return {
          ...p,
          color: colorInfo.bg,
          textColor: colorInfo.text,
        };
      });
    });
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF5FF] via-[#F1F7FF] to-[#E6F1FD] text-slate-800 flex flex-col font-sans selection:bg-sky-200">
      {/* Top Header */}
      <TopBar
        mode={mode}
        onModeChange={setMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isSpinning={isSpinning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        {/* Intro Banner */}
        <div className="text-center mb-6">
          <h2 className="font-jua text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tight">
            {mode === 'lucky' ? '🍀 행운의 주인공을 뽑아보세요!' : '😈 벌칙을 받을 당번은 누구일까요?'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            참가자와 벌칙을 설정하고 룰렛을 돌려 공정하고 짜릿하게 결정해보세요
          </p>
        </div>

        {/* 2-Column Responsive Layout: Roulette Wheel & Participant/Penalty Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive Roulette Wheel */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-xl shadow-sky-200/40 border border-sky-100 relative">
            <RouletteWheel
              participants={participants}
              isSpinning={isSpinning}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
            />
          </div>

          {/* Right: Participant / Penalty Panel with Tab Switcher */}
          <div className="lg:col-span-5 flex flex-col h-full">
            {/* Tab Switcher Buttons */}
            <div className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-sky-100 mb-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setActiveSideTab('participants');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSideTab === 'participants'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>참가자 ({participants.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setActiveSideTab('penalties');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSideTab === 'penalties'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>벌칙 목록 ({penalties.length})</span>
                {isPenaltyEnabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Tab 1: Participant Manager */}
            {activeSideTab === 'participants' ? (
              <ParticipantManager
                participants={participants}
                onAddParticipant={handleAddParticipant}
                onUpdateParticipant={handleUpdateParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                onClearAll={handleClearAllParticipants}
                onShuffle={handleShuffle}
                onLoadPreset={handleLoadParticipantPreset}
                isSpinning={isSpinning}
              />
            ) : (
              /* Tab 2: Penalty Manager */
              <PenaltyManager
                penalties={penalties}
                onAddPenalty={handleAddPenalty}
                onUpdatePenalty={handleUpdatePenalty}
                onRemovePenalty={handleRemovePenalty}
                onClearAllPenalties={handleClearAllPenalties}
                onLoadPreset={handleLoadPenaltyPreset}
                isSpinning={isSpinning}
                isEnabled={isPenaltyEnabled}
                onToggleEnabled={() => {
                  sounds.playPop();
                  setIsPenaltyEnabled(!isPenaltyEnabled);
                }}
              />
            )}
          </div>
        </div>

        {/* Results & Statistics Section: Table of who was picked how many times! */}
        <StatsAndHistory
          history={history}
          participants={participants}
          onClearHistory={() => setHistory([])}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-xs text-slate-400 border-t border-sky-200/60 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>두근두근 복불복 룰렛 · 공정하고 재미있는 랜덤 추첨 게임</span>
          <span>© 2026 Lucky Roulette</span>
        </div>
      </footer>

      {/* Winner Modal (Big Prominent Display with Random Assigned Penalty) */}
      <WinnerModal
        winner={currentWinner}
        penalty={currentPenalty}
        mode={mode}
        onClose={() => {
          setCurrentWinner(null);
          setCurrentPenalty(null);
        }}
        onSpinAgain={() => {
          setCurrentWinner(null);
          setCurrentPenalty(null);
        }}
        onExcludeAndSpinAgain={handleExcludeAndSpinAgain}
      />
    </div>
  );
}
