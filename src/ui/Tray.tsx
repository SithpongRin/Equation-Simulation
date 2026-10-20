import React from 'react';
import { Package, Apple, Trash2, Sliders } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { STRINGS } from '../strings';

interface TrayProps {
  onOpenValueConfig?: () => void;
}

export const Tray: React.FC<TrayProps> = ({ onOpenValueConfig }) => {
  const selectedTool = useGameStore((s) => s.selectedTool);
  const colorMode = useGameStore((s) => s.colorMode);
  const setSelectedTool = useGameStore((s) => s.setSelectedTool);
  const setDraggedType = useGameStore((s) => s.setDraggedType);
  const addToPan = useGameStore((s) => s.addToPan);
  const resetCurrentProblem = useGameStore((s) => s.resetCurrentProblem);
  const equation = useGameStore((s) => s.equation);

  const isDark = colorMode === 'dark';
  const itemWeight = equation.itemWeight ?? 1;

  const handlePointerDown = (type: 'bag' | 'item' | 'balloon') => {
    setDraggedType(type);
    setSelectedTool(selectedTool === type ? null : type);
  };

  return (
    <div className={`w-full flex flex-col items-center gap-2 p-3 sm:p-4 backdrop-blur-2xl border-t z-20 transition-colors ${
      isDark
        ? 'bg-[#0F172A]/95 border-[#1E293B]'
        : 'bg-[#FFFFFF]/95 border-[#E2E8F0] shadow-lg'
    }`}>
      {/* Top hint & Action buttons */}
      <div className="text-xs flex items-center justify-between w-full max-w-md px-1">
        <span className={`font-semibold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
          {selectedTool ? 'កំពុងជ្រើសរើស៖ ចុចលើថាសដើម្បីដាក់' : STRINGS.tray.dragHint}
        </span>
        
        <div className="flex items-center gap-3">
          {onOpenValueConfig && (
            <button
              onClick={onOpenValueConfig}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 active:scale-95 font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>កំណត់តម្លៃ</span>
            </button>
          )}

          <button
            onClick={resetCurrentProblem}
            className="text-xs text-[#F43F5E] hover:underline flex items-center gap-1 active:scale-95 font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{STRINGS.feedback.retry}</span>
          </button>
        </div>
      </div>

      {/* Main Big Touch Buttons for Drag / Drop */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
        {/* Mystery Bag (x) Anime Card */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <button
            onPointerDown={() => handlePointerDown('bag')}
            className={`w-full h-18 sm:h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 shadow-md ${
              selectedTool === 'bag'
                ? 'bg-[#38BDF8]/20 border-[#38BDF8] ring-4 ring-[#38BDF8]/30 shadow-sky-500/20'
                : isDark
                ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155]'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#F59E0B]" />
              <span className="font-black text-xl text-[#38BDF8] font-['Outfit',sans-serif]">x</span>
            </div>
            <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>
              {STRINGS.objects.mysteryBag}
            </span>
          </button>

          {/* Quick Drop Buttons for Mobile */}
          <div className="flex w-full gap-1.5">
            <button
              onClick={() => addToPan('left', 'bag')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black active:scale-95 text-center border transition ${
                isDark
                  ? 'bg-[#1E293B]/80 hover:bg-[#334155] border-[#334155] text-[#94A3B8]'
                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]'
              }`}
            >
              + ឆ្វេង
            </button>
            <button
              onClick={() => addToPan('right', 'bag')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black active:scale-95 text-center border transition ${
                isDark
                  ? 'bg-[#1E293B]/80 hover:bg-[#334155] border-[#334155] text-[#94A3B8]'
                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]'
              }`}
            >
              + ស្តាំ
            </button>
          </div>
        </div>

        {/* Single Fruit (+itemWeight) Anime Card */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <button
            onPointerDown={() => handlePointerDown('item')}
            className={`w-full h-18 sm:h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 shadow-md ${
              selectedTool === 'item'
                ? 'bg-[#34D399]/20 border-[#34D399] ring-4 ring-[#34D399]/30 shadow-emerald-500/20'
                : isDark
                ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155]'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Apple className="w-6 h-6 text-[#EF4444]" />
              <span className="font-black text-lg text-[#10B981] font-['Outfit',sans-serif]">+{itemWeight}</span>
            </div>
            <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>
              {STRINGS.objects.singleItem}
            </span>
          </button>

          {/* Quick Drop Buttons for Mobile */}
          <div className="flex w-full gap-1.5">
            <button
              onClick={() => addToPan('left', 'item')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black active:scale-95 text-center border transition ${
                isDark
                  ? 'bg-[#1E293B]/80 hover:bg-[#334155] border-[#334155] text-[#94A3B8]'
                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]'
              }`}
            >
              + ឆ្វេង
            </button>
            <button
              onClick={() => addToPan('right', 'item')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black active:scale-95 text-center border transition ${
                isDark
                  ? 'bg-[#1E293B]/80 hover:bg-[#334155] border-[#334155] text-[#94A3B8]'
                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]'
              }`}
            >
              + ស្តាំ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
