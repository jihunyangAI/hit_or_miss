import React, { useState, useRef, useEffect } from 'react';
import { Participant } from '../types';
import { sounds } from '../utils/sound';
import { DEFAULT_PRESETS } from '../utils/colors';
import { UserPlus, Trash2, Shuffle, Users, AlertCircle, Sparkles, Pencil, Check, X } from 'lucide-react';

interface ParticipantManagerProps {
  participants: Participant[];
  onAddParticipant: (name: string) => boolean;
  onUpdateParticipant: (id: string, newName: string) => boolean;
  onRemoveParticipant: (id: string) => void;
  onClearAll: () => void;
  onShuffle: () => void;
  onLoadPreset: (names: string[]) => void;
  isSpinning: boolean;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  onClearAll,
  onShuffle,
  onLoadPreset,
  isSpinning,
}) => {
  const [inputName, setInputName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setInputError('이름을 입력해주세요!');
      return;
    }
    if (trimmed.length > 15) {
      setInputError('이름은 15자 이내로 입력해주세요.');
      return;
    }

    const added = onAddParticipant(trimmed);
    if (added) {
      setInputName('');
      setInputError(null);
      sounds.playPop();
    } else {
      setInputError('이미 목록에 있는 이름입니다.');
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    if (isSpinning) return;
    setEditingId(id);
    setEditingName(currentName);
    setEditError(null);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditError('이름을 입력해주세요!');
      return;
    }
    if (trimmed.length > 15) {
      setEditError('이름은 15자 이내로 입력해주세요.');
      return;
    }

    const updated = onUpdateParticipant(id, trimmed);
    if (updated) {
      sounds.playPop();
      setEditingId(null);
      setEditingName('');
      setEditError(null);
    } else {
      setEditError('이미 목록에 있는 이름입니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditError(null);
  };

  const handleClearWithConfirm = () => {
    if (participants.length === 0) return;
    if (window.confirm('정말 참가자 명단을 모두 비우시겠습니까?')) {
      sounds.playDelete();
      onClearAll();
      handleCancelEdit();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl shadow-sky-100/50 border border-sky-100 flex flex-col h-full">
      {/* Header with Title and Count */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">참가자 명단</h2>
            <p className="text-xs text-slate-400">룰렛에 들어갈 이름을 등록 및 수정해주세요</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          총 {participants.length}명
        </span>
      </div>

      {/* Input Form with '추가' Button */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="참가자 이름 입력 (예: 김철수)"
              disabled={isSpinning}
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                inputError
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100 focus:bg-white'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSpinning || !inputName.trim()}
            className="py-3 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-md hover:shadow-sky-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>추가</span>
          </button>
        </div>

        {inputError && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{inputError}</span>
          </p>
        )}
      </form>

      {/* Quick Presets for Instant Fun */}
      <div className="mt-3.5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>빠른 추천 프리셋:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              disabled={isSpinning}
              onClick={() => {
                sounds.playPop();
                handleCancelEdit();
                onLoadPreset(preset.names);
              }}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200/80 hover:border-sky-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{preset.emoji}</span>
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Participant List Toolbar */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>등록된 참가자 ({participants.length})</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSpinning || participants.length < 2}
            onClick={() => {
              sounds.playPop();
              handleCancelEdit();
              onShuffle();
            }}
            className="text-slate-600 hover:text-sky-600 flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50"
            title="룰렛 순서 섞기"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>순서 섞기</span>
          </button>

          <span className="text-slate-200">|</span>

          <button
            type="button"
            disabled={isSpinning || participants.length === 0}
            onClick={handleClearWithConfirm}
            className="text-slate-400 hover:text-rose-500 flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-rose-50"
            title="전체 명단 지우기"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>비우기</span>
          </button>
        </div>
      </div>

      {/* Participant Scrollable List */}
      <div className="mt-2 flex-1 overflow-y-auto max-h-[300px] sm:max-h-[360px] pr-1 space-y-1.5">
        {participants.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 my-2">
            <p className="text-sm font-medium">아직 등록된 참가자가 없습니다</p>
            <p className="text-xs mt-1 text-slate-400">
              위 입력칸에 이름을 넣거나 추천 프리셋을 눌러보세요!
            </p>
          </div>
        ) : (
          participants.map((p, idx) => {
            const isEditingThis = editingId === p.id;

            return (
              <div
                key={p.id}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all ${
                  isEditingThis
                    ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-200/60 shadow-sm'
                    : 'bg-slate-50 hover:bg-sky-50/40 border-slate-100 hover:border-sky-200/60'
                }`}
              >
                {isEditingThis ? (
                  /* Inline Edit Mode */
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-inner border border-white"
                        style={{ backgroundColor: p.color }}
                        aria-hidden="true"
                      />

                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => {
                          setEditingName(e.target.value);
                          if (editError) setEditError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(p.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        placeholder="이름 수정"
                        className="flex-1 px-2.5 py-1 text-sm bg-white border border-sky-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />

                      {/* Save button */}
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(p.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        title="수정 완료 (Enter)"
                        aria-label="수정 완료"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Cancel button */}
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
                      onClick={() => !isSpinning && handleStartEdit(p.id, p.name)}
                      title="클릭하여 이름 수정"
                    >
                      {/* Index badge */}
                      <span className="text-xs font-mono text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Color slice pill indicator */}
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-inner border border-white"
                        style={{ backgroundColor: p.color }}
                        aria-hidden="true"
                      />

                      {/* Participant Name */}
                      <span className="text-sm font-semibold text-slate-800 truncate hover:text-sky-600 transition-colors">
                        {p.name}
                      </span>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit button */}
                      <button
                        type="button"
                        disabled={isSpinning}
                        onClick={() => handleStartEdit(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-100/60 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
                        title={`${p.name} 이름 수정`}
                        aria-label={`${p.name} 이름 수정`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        disabled={isSpinning}
                        onClick={() => {
                          sounds.playDelete();
                          onRemoveParticipant(p.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
                        title={`${p.name} 삭제`}
                        aria-label={`${p.name} 삭제`}
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

      {/* Friendly Helper Note */}
      {participants.length > 0 && participants.length < 2 && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>룰렛을 돌리려면 최소 2명의 참가자가 필요합니다.</span>
        </div>
      )}
    </div>
  );
};
