import React from 'react';
import { Package, Apple, Plus, Minus, Scale, Sliders } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface LiveValueBarProps {
  onOpenFullConfig: () => void;
}

export const LiveValueBar: React.FC<LiveValueBarProps> = ({ onOpenFullConfig }) => {
  const equation = useGameStore((s) => s.equation);
  const colorMode = useGameStore((s) => s.colorMode);
  const setXValue = useGameStore((s) => s.setXValue);
  const setItemWeight = useGameStore((s) => s.setItemWeight);
  const autoBalance = useGameStore((s) => s.autoBalance);

  const isDark = colorMode === 'dark';
  const itemWeight = equation.itemWeight ?? 1;

  return (
    <div className="w-full flex items-center justify-center px-3 py-1 z-10 pointer-events-none">
      <div className={`flex items-center gap-2 sm:gap-4 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl pointer-events-auto max-w-lg w-full justify-between border transition-colors ${
        isDark
          ? 'bg-[#0F172A]/90 border-[#1E293B]'
          : 'bg-[#FFFFFF]/95 border-[#E2E8F0] shadow-slate-200'
      }`}>
        {/* Mystery Bag X Controller (BIG & TOUCH FRIENDLY) */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
          isDark
            ? 'bg-[#1E293B]/70 border-[#334155]'
            : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-1 text-[#38BDF8]">
            <Package className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-black">x =</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setXValue(Math.max(1, equation.xValue - 1))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black active:scale-90 border transition ${
                isDark
                  ? 'bg-[#0F172A] hover:bg-[#334155] border-[#334155] text-[#F8FAFC]'
                  : 'bg-[#FFFFFF] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]'
              }`}
              title="បន្ថយតម្លៃ x"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-black text-base text-[#38BDF8] font-['Outfit',sans-serif]">
              {equation.xValue}
            </span>
            <button
              onClick={() => setXValue(Math.min(25, equation.xValue + 1))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black active:scale-90 border transition ${
                isDark
                  ? 'bg-[#0F172A] hover:bg-[#334155] border-[#334155] text-[#F8FAFC]'
                  : 'bg-[#FFFFFF] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]'
              }`}
              title="បង្កើនតម្លៃ x"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fruit Weight Controller (BIG & TOUCH FRIENDLY) */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
          isDark
            ? 'bg-[#1E293B]/70 border-[#334155]'
            : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-1 text-[#34D399]">
            <Apple className="w-4 h-4 text-[#EF4444]" />
            <span className="text-xs font-black">ផ្លែ =</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setItemWeight(Math.max(1, itemWeight - 1))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black active:scale-90 border transition ${
                isDark
                  ? 'bg-[#0F172A] hover:bg-[#334155] border-[#334155] text-[#F8FAFC]'
                  : 'bg-[#FFFFFF] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]'
              }`}
              title="បន្ថយទម្ងន់ផ្លែឈើ"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-5 text-center font-black text-base text-[#34D399] font-['Outfit',sans-serif]">
              {itemWeight}
            </span>
            <button
              onClick={() => setItemWeight(Math.min(10, itemWeight + 1))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black active:scale-90 border transition ${
                isDark
                  ? 'bg-[#0F172A] hover:bg-[#334155] border-[#334155] text-[#F8FAFC]'
                  : 'bg-[#FFFFFF] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]'
              }`}
              title="បង្កើនទម្ងន់ផ្លែឈើ"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Auto Balance Button */}
        <button
          onClick={autoBalance}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#34D399]/20 hover:bg-[#34D399]/30 border border-[#34D399]/40 text-[#10B981] rounded-xl text-xs font-black transition active:scale-95 shadow-sm"
          title="ធ្វើឱ្យមានលំនឹងស្វ័យប្រវត្តិ"
        >
          <Scale className="w-4 h-4" />
          <span className="hidden sm:inline">លំនឹង</span>
        </button>

        {/* Full Config Modal Trigger */}
        <button
          onClick={onOpenFullConfig}
          className={`p-2 rounded-xl transition active:scale-95 border ${
            isDark
              ? 'bg-[#1E293B] border-[#334155] text-[#38BDF8] hover:bg-[#334155]'
              : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0284C7] hover:bg-[#E2E8F0]'
          }`}
          title="កំណត់កម្រិតខ្ពស់"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
