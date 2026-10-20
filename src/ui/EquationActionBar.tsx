import React from 'react';
import { Minus, Divide, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getNextSuggestedStep } from '../math/operations';

interface EquationActionBarProps {
  onNextProblem?: () => void;
}

export const EquationActionBar: React.FC<EquationActionBarProps> = ({ onNextProblem }) => {
  const equation = useGameStore((s) => s.equation);
  const balance = useGameStore((s) => s.balanceMetrics);
  const colorMode = useGameStore((s) => s.colorMode);
  const applyOperation = useGameStore((s) => s.applyOperation);
  const resetCurrentProblem = useGameStore((s) => s.resetCurrentProblem);

  const isDark = colorMode === 'dark';

  // Determine possible pedagogic operations based on current equation
  const hasExtraItems = equation.left.items > 0 && equation.right.items > 0;
  const commonItems = Math.min(equation.left.items, equation.right.items);
  const hasBagsToDivide = equation.left.bags > 1 && equation.left.items === 0 && equation.right.items > 0;
  const bagDivisor = equation.left.bags;

  // Pedagogical suggestion
  const suggested = getNextSuggestedStep(equation);

  return (
    <div className={`w-full max-w-2xl px-4 py-3 rounded-2xl border flex flex-col gap-2.5 shadow-lg transition-colors ${
      isDark
        ? 'bg-[#10172A] border-[#1E293B]'
        : 'bg-[#FFFFFF] border-[#CBD5E1] shadow-slate-200'
    }`}>
      {/* Title & Pedagogical Explanation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
          <span className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8]">
            អនុវត្តប្រតិបត្តិការទៅលើភាគីទាំងសងខាង (Apply to Both Sides):
          </span>
        </div>
        <button
          onClick={resetCurrentProblem}
          className="text-xs text-[#64748B] hover:text-[#EF4444] flex items-center gap-1 font-bold"
          title="កំណត់ឡើងវិញ"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>កំណត់ឡើងវិញ</span>
        </button>
      </div>

      {/* Suggested next step hint pill */}
      {!balance.isSolved && suggested.type !== 'done' && (
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
          isDark ? 'bg-[#1E293B] text-[#FBBF24]' : 'bg-[#FEF3C7] text-[#92400E]'
        }`}>
          <span>ជំហានណែនាំ៖</span>
          <span>{suggested.messageKm}</span>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-col gap-2 w-full">
        {/* Operation 1: Subtract Items from Both Sides */}
        <button
          onClick={() => applyOperation('subItems', commonItems > 0 ? commonItems : 1)}
          disabled={equation.left.items === 0 && equation.right.items === 0}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border ${
            hasExtraItems
              ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
              : 'opacity-40 cursor-not-allowed bg-[#E2E8F0] dark:bg-[#1E293B] text-[#64748B] border-transparent'
          }`}
          title="ដកដុំដែកចេញពីសងខាងឱ្យស្មើគ្នា"
        >
          <Minus className="w-4 h-4" />
          <span>ដកដុំដែក -{commonItems > 0 ? commonItems : 1} សងខាង</span>
        </button>

        {/* Operation 2: Divide Both Sides by Bag Count */}
        <button
          onClick={() => applyOperation('divide', bagDivisor)}
          disabled={!hasBagsToDivide}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border ${
            hasBagsToDivide
              ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-[#0284C7] shadow-sm animate-pulse'
              : 'opacity-40 cursor-not-allowed bg-[#E2E8F0] dark:bg-[#1E293B] text-[#64748B] border-transparent'
          }`}
          title="ចែកទាំងសងខាងនឹងចំនួនប្រអប់ x ដើម្បីរកតម្លៃ ១ ប្រអប់"
        >
          <Divide className="w-4 h-4" />
          <span>ចែកសងខាងនឹង ÷{bagDivisor > 1 ? bagDivisor : 2}</span>
        </button>

        {/* When Solved: Next Problem Button */}
        {balance.isSolved && onNextProblem && (
          <button
            onClick={onNextProblem}
            className="w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white shadow-md active:scale-95 transition"
          >
            <span>លំហាត់បន្ទាប់</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
