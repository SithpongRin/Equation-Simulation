import React from 'react';
import { X, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { STRINGS } from '../strings';

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({ isOpen, onClose }) => {
  const currentLevel = useGameStore((s) => s.level);
  const colorMode = useGameStore((s) => s.colorMode);
  const stars = useGameStore((s) => s.stars);
  const setLevel = useGameStore((s) => s.setLevel);

  const isDark = colorMode === 'dark';

  if (!isOpen) return null;

  const levelConfigs = [
    { num: 1, ...STRINGS.levels.l1 },
    { num: 2, ...STRINGS.levels.l2 },
    { num: 3, ...STRINGS.levels.l3 },
    { num: 4, ...STRINGS.levels.l4 },
    { num: 5, ...STRINGS.levels.l5 },
    { num: 6, ...STRINGS.levels.l6 },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`border-2 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 ${
        isDark
          ? 'bg-[#0F172A] border-[#1E293B] text-[#F8FAFC]'
          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${
          isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'
        }`}>
          <h2 className="text-lg font-black">
            {STRINGS.levels.title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-2xl transition ${
              isDark ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {levelConfigs.map((lvl) => {
            const isSelected = lvl.num === currentLevel;
            const starCount = stars[lvl.num] || 0;

            return (
              <button
                key={lvl.num}
                onClick={() => {
                  setLevel(lvl.num);
                  onClose();
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[#38BDF8]/20 border-[#38BDF8] ring-2 ring-[#38BDF8]/40'
                    : isDark
                    ? 'bg-[#1E293B]/70 hover:bg-[#1E293B] border-[#334155]'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]'
                }`}
              >
                <div className="flex flex-col gap-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">
                      {lvl.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isDark ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#E2E8F0] text-[#475569]'
                    }`}>
                      {lvl.badge}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}>
                    {lvl.description}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 shrink-0">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-4 h-4 ${
                        starIdx <= starCount
                          ? 'fill-[#FBBF24] text-[#FBBF24]'
                          : isDark ? 'text-[#334155]' : 'text-[#E2E8F0]'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
