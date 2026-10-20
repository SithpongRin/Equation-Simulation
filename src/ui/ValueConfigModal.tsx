import React from 'react';
import { X, Sliders, Scale, Plus, Minus, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface ValueConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValueConfigModal: React.FC<ValueConfigModalProps> = ({ isOpen, onClose }) => {
  const equation = useGameStore((s) => s.equation);
  const colorMode = useGameStore((s) => s.colorMode);
  const setXValue = useGameStore((s) => s.setXValue);
  const setItemWeight = useGameStore((s) => s.setItemWeight);
  const setPanCounts = useGameStore((s) => s.setPanCounts);
  const autoBalance = useGameStore((s) => s.autoBalance);

  if (!isOpen) return null;

  const isDark = colorMode === 'dark';
  const currentItemWeight = equation.itemWeight ?? 1;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`border-2 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto ${
        isDark
          ? 'bg-[#0F172A] border-[#1E293B] text-[#F8FAFC]'
          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${
          isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#38BDF8]/20 text-[#38BDF8]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                កំណត់តម្លៃ និង ចំនួនវត្ថុ
              </h2>
              <p className={`text-xs font-semibold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                កែប្រែតម្លៃ x ទម្ងន់វត្ថុ និងចំនួនលើថាសទាំងសងខាង
              </p>
            </div>
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

        {/* 1. Value of X */}
        <div className={`flex flex-col gap-2 p-3.5 rounded-2xl border ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#38BDF8]">
              តម្លៃថង់អាថ៌កំបាំង x
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              ១ ថង់ = {equation.xValue} ឯកតា
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setXValue(Math.max(1, equation.xValue - 1))}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold active:scale-95 transition ${
                isDark ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]' : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={equation.xValue}
              onChange={(e) => setXValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max="25"
              className={`flex-1 h-11 border rounded-2xl text-center text-xl font-black text-[#38BDF8] font-['Outfit',sans-serif] ${
                isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
              }`}
            />
            <button
              onClick={() => setXValue(Math.min(25, equation.xValue + 1))}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold active:scale-95 transition ${
                isDark ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]' : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets for X */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className={`text-[11px] font-bold mr-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              តម្លៃលឿន៖
            </span>
            {[2, 3, 4, 5, 6, 8, 10, 12].map((v) => (
              <button
                key={v}
                onClick={() => setXValue(v)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition active:scale-95 ${
                  equation.xValue === v
                    ? 'bg-[#38BDF8] text-[#0A0F24]'
                    : isDark
                    ? 'bg-[#0F172A] text-[#94A3B8] hover:text-[#F8FAFC]'
                    : 'bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Weight per single item */}
        <div className={`flex flex-col gap-2 p-3.5 rounded-2xl border ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#34D399]">
              ទម្ងន់ផ្លែឈើ ១ ផ្លែ
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {currentItemWeight} ឯកតា
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setItemWeight(Math.max(1, currentItemWeight - 1))}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold active:scale-95 transition ${
                isDark ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]' : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className={`flex-1 h-11 border rounded-2xl flex items-center justify-center text-xl font-black text-[#34D399] font-['Outfit',sans-serif] ${
              isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
            }`}>
              {currentItemWeight}
            </div>
            <button
              onClick={() => setItemWeight(Math.min(10, currentItemWeight + 1))}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold active:scale-95 transition ${
                isDark ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]' : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Left and Right Pan Quantity Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Pan */}
          <div className={`flex flex-col gap-2.5 p-3 rounded-2xl border ${
            isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <span className={`text-xs font-black text-[#38BDF8] text-center border-b pb-1 ${
              isDark ? 'border-[#334155]' : 'border-[#E2E8F0]'
            }`}>
              ថាសខាងឆ្វេង
            </span>
            
            {/* Left Bags */}
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>ថង់ x៖</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPanCounts('left', { bags: equation.left.bags - 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm font-['Outfit',sans-serif]">
                  {equation.left.bags}
                </div>
                <button
                  onClick={() => setPanCounts('left', { bags: equation.left.bags + 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Left Items */}
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>ផ្លែឈើ៖</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPanCounts('left', { items: equation.left.items - 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm font-['Outfit',sans-serif]">
                  {equation.left.items}
                </div>
                <button
                  onClick={() => setPanCounts('left', { items: equation.left.items + 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Right Pan */}
          <div className={`flex flex-col gap-2.5 p-3 rounded-2xl border ${
            isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <span className={`text-xs font-black text-[#34D399] text-center border-b pb-1 ${
              isDark ? 'border-[#334155]' : 'border-[#E2E8F0]'
            }`}>
              ថាសខាងស្តាំ
            </span>

            {/* Right Bags */}
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>ថង់ x៖</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPanCounts('right', { bags: equation.right.bags - 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm font-['Outfit',sans-serif]">
                  {equation.right.bags}
                </div>
                <button
                  onClick={() => setPanCounts('right', { bags: equation.right.bags + 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Right Items */}
            <div className="flex flex-col gap-1">
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>ផ្លែឈើ៖</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPanCounts('right', { items: equation.right.items - 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm font-['Outfit',sans-serif]">
                  {equation.right.items}
                </div>
                <button
                  onClick={() => setPanCounts('right', { items: equation.right.items + 1 })}
                  className={`w-8 h-8 rounded-xl font-black flex items-center justify-center border active:scale-90 ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Auto-balance Button */}
        <button
          onClick={autoBalance}
          className="w-full py-3 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border-2 border-[#38BDF8]/50 text-[#0284C7] dark:text-[#38BDF8] rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <Scale className="w-4 h-4" />
          <span>ធ្វើឱ្យមានលំនឹងស្វ័យប្រវត្តិ (Auto-Balance)</span>
        </button>

        {/* Confirm / Close */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#34D399] hover:bg-[#10B981] text-[#0A0F24] rounded-2xl text-sm font-black transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#34D399]/30"
        >
          <Check className="w-4 h-4" />
          <span>រួចរាល់</span>
        </button>
      </div>
    </div>
  );
};
