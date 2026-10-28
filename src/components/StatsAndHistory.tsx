import React, { useState } from 'react';
import { WinnerRecord, Participant } from '../types';
import { sounds } from '../utils/sound';
import { BarChart3, History, Trash2, Trophy, Copy, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface StatsAndHistoryProps {
  history: WinnerRecord[];
  participants: Participant[];
  onClearHistory: () => void;
}

export const StatsAndHistory: React.FC<StatsAndHistoryProps> = ({
  history,
  participants,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline'>('stats');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate statistics per person
  // We include both active participants and any past winners who may have been removed
  const totalRounds = history.length;

  const statsMap = new Map<
    string,
    {
      name: string;
      color: string;
      count: number;
      penalties: string[];
      lastRound: number;
    }
  >();

  // Initialize with current participants
  participants.forEach((p) => {
    statsMap.set(p.name, {
      name: p.name,
      color: p.color,
      count: 0,
      penalties: [],
      lastRound: 0,
    });
  });

  // Tally from history
  history.forEach((record) => {
    const existing = statsMap.get(record.name);
    if (existing) {
      existing.count += 1;
      if (record.penalty) {
        existing.penalties.push(record.penalty);
      }
      existing.lastRound = Math.max(existing.lastRound, record.round);
    } else {
      statsMap.set(record.name, {
        name: record.name,
        color: record.color,
        count: 1,
        penalties: record.penalty ? [record.penalty] : [],
        lastRound: record.round,
      });
    }
  });

  // Sort by count descending, then by lastRound descending
  const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.lastRound - a.lastRound;
  });

  const handleCopySummary = () => {
    if (totalRounds === 0) return;

    let text = `📊 [두근두근 복불복 당첨 통계] (총 ${totalRounds}회 진행)\n\n`;
    sortedStats.forEach((stat, idx) => {
      const percentage = totalRounds > 0 ? ((stat.count / totalRounds) * 100).toFixed(1) : '0';
      const penaltySummary = stat.penalties.length > 0 ? ` (벌칙: ${stat.penalties.join(', ')})` : '';
      text += `${idx + 1}위: ${stat.name} - ${stat.count}회 (${percentage}%)${penaltySummary}\n`;
    });

    navigator.clipboard?.writeText(text);
    setCopied(true);
    sounds.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearWithConfirm = () => {
    if (totalRounds === 0) return;
    if (window.confirm('모든 당첨 기록 및 누적 통계를 초기화하시겠습니까?')) {
      sounds.playDelete();
      onClearHistory();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl shadow-sky-100/50 border border-sky-100 mt-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">뽑기 결과 기록 & 누적 통계</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                총 {totalRounds}회 완료
              </span>
            </div>
            <p className="text-xs text-slate-400">누가 몇 번 당첨되었는지 실시간으로 집계됩니다</p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setActiveTab('stats');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>누적 순위 표</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setActiveTab('timeline');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>회차별 기록 ({totalRounds})</span>
            </button>
          </div>

          {/* Copy Summary Button */}
          {totalRounds > 0 && (
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-xs text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 transition-colors cursor-pointer flex items-center gap-1"
              title="통계 결과 텍스트 복사"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline text-emerald-600 font-bold">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden md:inline">통계 복사</span>
                </>
              )}
            </button>
          )}

          {/* Reset Button */}
          {totalRounds > 0 && (
            <button
              type="button"
              onClick={handleClearWithConfirm}
              className="p-2 rounded-xl text-xs text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="모든 기록 초기화"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Collapse/Expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
            title={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="mt-4">
          {totalRounds === 0 ? (
            <div className="py-10 text-center text-slate-400 rounded-2xl border-2 border-dashed border-slate-200">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">아직 진행된 복불복 뽑기 기록이 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">
                위 룰렛을 돌려 첫 번째 당첨자를 뽑아보세요!
              </p>
            </div>
          ) : activeTab === 'stats' ? (
            /* TAB 1: 누적 당첨 통계 표 (Table) */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-xs text-slate-400 font-semibold bg-slate-50/60">
                    <th className="py-2.5 px-3 text-center w-14">순위</th>
                    <th className="py-2.5 px-3">참가자</th>
                    <th className="py-2.5 px-3 text-center w-28">당첨 횟수</th>
                    <th className="py-2.5 px-3 text-center w-24">당첨 비율</th>
                    <th className="py-2.5 px-3">부여받은 벌칙 기록</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {sortedStats.map((stat, idx) => {
                    const percentage = totalRounds > 0 ? ((stat.count / totalRounds) * 100).toFixed(1) : '0';
                    const isTop1 = idx === 0 && stat.count > 0;
                    const isTop2 = idx === 1 && stat.count > 0;
                    const isTop3 = idx === 2 && stat.count > 0;

                    return (
                      <tr
                        key={stat.name}
                        className={`hover:bg-sky-50/30 transition-colors ${
                          stat.count > 0 ? '' : 'text-slate-400 opacity-70'
                        }`}
                      >
                        {/* 순위 */}
                        <td className="py-3 px-3 text-center font-mono">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs shadow-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs shadow-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/70 text-white font-bold text-xs shadow-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">{idx + 1}</span>
                          )}
                        </td>

                        {/* 이름 */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-white shadow-xs"
                              style={{ backgroundColor: stat.color }}
                            />
                            <span className="font-bold text-slate-800">{stat.name}</span>
                          </div>
                        </td>

                        {/* 당첨 횟수 */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-mono font-bold text-xs tabular-nums ${
                              stat.count > 0
                                ? 'bg-rose-100 text-rose-700 font-extrabold'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {stat.count}회
                          </span>
                        </td>

                        {/* 당첨 비율 */}
                        <td className="py-3 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                          <div className="flex flex-col items-center gap-1">
                            <span>{percentage}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 벌칙 목록 */}
                        <td className="py-3 px-3">
                          {stat.penalties.length === 0 ? (
                            <span className="text-xs text-slate-300">벌칙 없음 (면제)</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {stat.penalties.map((pen, pIdx) => (
                                <span
                                  key={`${pen}-${pIdx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200/70"
                                >
                                  {pen}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* TAB 2: 회차별 상세 기록 타임라인 */
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {history.map((record) => {
                const isLucky = record.mode === 'lucky';
                const date = new Date(record.timestamp);
                const timeStr = !isNaN(date.getTime())
                  ? new Intl.DateTimeFormat('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(date)
                  : '';

                return (
                  <div
                    key={record.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 gap-2 hover:bg-sky-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                        Round {record.round}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: record.color }}
                        />
                        <span className="font-bold text-slate-800 text-sm">
                          {record.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">당첨</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      {record.penalty && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                          <span>⚡️ {record.penalty}</span>
                        </div>
                      )}

                      <span className="text-[11px] font-mono text-slate-400">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
