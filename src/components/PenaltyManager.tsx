import React, { useState, useRef, useEffect } from 'react';
import { PenaltyItem } from '../types';
import { sounds } from '../utils/sound';
import { PENALTY_PRESETS } from '../utils/colors';
import { Plus, Trash2, Sparkles, AlertCircle, ShieldAlert, Pencil, Check, X } from 'lucide-react';

interface PenaltyManagerProps {
  penalties: PenaltyItem[];
  onAddPenalty: (text: string) => boolean;
  onUpdatePenalty: (id: string, newText: string) => boolean;
  onRemovePenalty: (id: string) => void;
  onClearAllPenalties: () => void;
  onLoadPreset: (items: string[]) => void;
  isSpinning: boolean;
  isEnabled: boolean;
  onToggleEnabled: () => void;
}

export const PenaltyManager: React.FC<PenaltyManagerProps> = ({
  penalties,
  onAddPenalty,
  onUpdatePenalty,
  onRemovePenalty,
  onClearAllPenalties,
  onLoadPreset,
  isSpinning,
  isEnabled,
  onToggleEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setError('벌칙 내용을 입력해주세요!');
      return;
    }
    if (trimmed.length > 30) {
      setError('벌칙은 30자 이내로 입력해주세요.');
      return;
    }

    const added = onAddPenalty(trimmed);
    if (added) {
      setInputText('');
      setError(null);
      sounds.playPop();
    } else {
      setError('이미 목록에 있는 벌칙입니다.');
    }
  };

  const handleStartEdit = (id: string, currentText: string) => {
    if (isSpinning) return;
    setEditingId(id);
    setEditingText(currentText);
    setEditError(null);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      setEditError('벌칙 내용을 입력해주세요!');
      return;
    }
    if (trimmed.length > 30) {
      setEditError('벌칙은 30자 이내로 입력해주세요.');
      return;
    }

    const updated = onUpdatePenalty(id, trimmed);
    if (updated) {
      sounds.playPop();
      setEditingId(null);
      setEditingText('');
      setEditError(null);
    } else {
      setEditError('이미 목록에 있는 벌칙입니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
    setEditError(null);
  };

  const handleClearWithConfirm = () => {
    if (penalties.length === 0) return;
    if (window.confirm('등록된 벌칙 목록을 모두 비우시겠습니까?')) {
      sounds.playDelete();
      onClearAllPenalties();
      handleCancelEdit();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl shadow-sky-100/50 border border-sky-100 flex flex-col h-full">
      {/* Header with Title and Enable Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">벌칙 목록 설정</h2>
            <p className="text-xs text-slate-400">뽑힌 사람에게 적용될 랜덤 벌칙들입니다</p>
          </div>
        </div>

        {/* Toggle switch for enabling random penalty */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-semibold text-slate-600">
            {isEnabled ? '벌칙 적용' : '벌칙 끔'}
          </span>
          <div
            onClick={onToggleEnabled}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              isEnabled ? 'bg-rose-500' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      {/* Input Form with '추가' Button */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="벌칙 내용 입력 (예: 커피 쏘기, 노래 한 곡)"
              disabled={isSpinning}
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:border-rose-400 focus:ring-rose-100 focus:bg-white'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSpinning || !inputText.trim()}
            className="py-3 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>추가</span>
          </button>
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </form>

      {/* Quick Penalty Presets */}
      <div className="mt-3.5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>추천 벌칙 세트:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PENALTY_PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              disabled={isSpinning}
              onClick={() => {
                sounds.playPop();
                handleCancelEdit();
                onLoadPreset(preset.items);
              }}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200/80 hover:border-rose-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{preset.emoji}</span>
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Penalty List Toolbar */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>등록된 벌칙 ({penalties.length}개)</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSpinning || penalties.length === 0}
            onClick={handleClearWithConfirm}
            className="text-slate-400 hover:text-rose-500 flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-rose-50"
            title="전체 벌칙 지우기"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>비우기</span>
          </button>
        </div>
      </div>

      {/* Penalty Scrollable List */}
      <div className="mt-2 flex-1 overflow-y-auto max-h-[300px] sm:max-h-[360px] pr-1 space-y-1.5">
        {penalties.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 my-2">
            <p className="text-sm font-medium">아직 등록된 벌칙이 없습니다</p>
            <p className="text-xs mt-1 text-slate-400">
              위 입력칸에 벌칙을 적거나 추천 벌칙 세트를 눌러보세요!
            </p>
          </div>
        ) : (
          penalties.map((item, idx) => {
            const isEditingThis = editingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all ${
                  isEditingThis
                    ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200/60 shadow-sm'
                    : 'bg-slate-50 hover:bg-rose-50/40 border-slate-100 hover:border-rose-200/60'
                }`}
              >
                {isEditingThis ? (
                  /* Inline Edit Mode */
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold shrink-0">
                        수정
                      </span>

                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingText}
                        onChange={(e) => {
                          setEditingText(e.target.value);
                          if (editError) setEditError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(item.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        placeholder="벌칙 내용 수정"
                        className="flex-1 px-2.5 py-1 text-sm bg-white border border-rose-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />

                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        title="수정 완료 (Enter)"
                        aria-label="수정 완료"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        title="수정 취소 (Esc)"
                        aria-label="수정 취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {editError && (
                      <p className="text-[11px] text-rose-500 pl-8 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{editError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Standard View Mode */
                  <div className="flex items-center justify-between group">
                    <div
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      onClick={() => !isSpinning && handleStartEdit(item.id, item.text)}
                      title="클릭하여 벌칙 수정"
                    >
                      <span className="text-xs font-mono text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100/70 text-rose-700 font-bold shrink-0">
                        벌칙
                      </span>

                      <span className="text-sm font-medium text-slate-800 truncate hover:text-rose-600 transition-colors">
                        {item.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isSpinning}
                        onClick={() => handleStartEdit(item.id, item.text)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-100/60 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
                        title={`${item.text} 벌칙 수정`}
                        aria-label={`${item.text} 벌칙 수정`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isSpinning}
                        onClick={() => {
                          sounds.playDelete();
                          onRemovePenalty(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
                        title={`${item.text} 삭제`}
                        aria-label={`${item.text} 삭제`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Helper Note */}
      {isEnabled && penalties.length === 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>벌칙이 없으면 당첨자만 추첨됩니다. 벌칙을 추가해보세요!</span>
        </div>
      )}
    </div>
  );
};
