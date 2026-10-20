import React from 'react';
import { X, Lightbulb, Play } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getNextSuggestedStep } from '../math/operations';
import { STRINGS } from '../strings';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose }) => {
  const equation = useGameStore((s) => s.equation);
  const colorMode = useGameStore((s) => s.colorMode);
  const applyOperation = useGameStore((s) => s.applyOperation);

  const isDark = colorMode === 'dark';

  if (!isOpen) return null;

  const hint = getNextSuggestedStep(equation);

  const handleApplyHint = () => {
    if (hint.type !== 'done' && hint.amount > 0) {
      applyOperation(hint.type, hint.amount);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`border-2 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 ${
        isDark
          ? 'bg-[#0F172A] border-[#1E293B] text-[#F8FAFC]'
          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${
          isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2 text-[#FBBF24] font-black text-base">
            <Lightbulb className="w-5 h-5" />
            <span>{STRINGS.header.hint}</span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-2xl transition ${
              isDark ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hint Body */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <span className="text-xs font-black text-[#FBBF24]">
            {STRINGS.feedback.hintNotice}
          </span>
          <p className="text-sm leading-relaxed font-bold">
            {hint.messageKm}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex w-full gap-2 pt-1">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition active:scale-95 border ${
              isDark
                ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155] text-[#94A3B8]'
                : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]'
            }`}
          >
            {STRINGS.settings.close}
          </button>

          {hint.type !== 'done' && (
            <button
              onClick={handleApplyHint}
              className="flex-1 py-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0A0F24] rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-[#FBBF24]/30"
            >
              <Play className="w-3.5 h-3.5 fill-[#0A0F24]" />
              <span>អនុវត្តជំហាននេះ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
