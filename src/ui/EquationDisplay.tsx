import React from 'react';
import { Scale as ScaleIcon, CheckCircle2, BookOpen, GraduationCap, Sliders } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { formatSideExpression } from '../math/equationModel';
import { STRINGS } from '../strings';

interface EquationDisplayProps {
  onOpenValueConfig?: () => void;
}

export const EquationDisplay: React.FC<EquationDisplayProps> = ({ onOpenValueConfig }) => {
  const equation = useGameStore((s) => s.equation);
  const balance = useGameStore((s) => s.balanceMetrics);
  const colorMode = useGameStore((s) => s.colorMode);
  const teacherMode = useGameStore((s) => s.teacherMode);
  const storyKm = useGameStore((s) => s.storyKm);

  const isDark = colorMode === 'dark';
  const itemWeight = equation.itemWeight ?? 1;
  const leftStr = formatSideExpression(equation.left, itemWeight);
  const rightStr = formatSideExpression(equation.right, itemWeight);
  const leftWeight = equation.left.bags * equation.xValue + equation.left.items * itemWeight - equation.left.balloons * itemWeight;
  const rightWeight = equation.right.bags * equation.xValue + equation.right.items * itemWeight - equation.right.balloons * itemWeight;

  return (
    <div className="w-full flex flex-col items-center gap-2 px-3 pt-3 pb-1 z-10 pointer-events-none">
      {/* Word Problem Story Card if present */}
      {storyKm && (
        <div className={`max-w-lg w-full backdrop-blur-md rounded-2xl p-3 text-xs leading-relaxed shadow-lg pointer-events-auto flex items-start gap-2 border ${
          isDark
            ? 'bg-[#0F172A]/90 border-[#1E293B] text-[#F8FAFC]'
            : 'bg-[#FFFFFF]/95 border-[#E2E8F0] text-[#0F172A]'
        }`}>
          <BookOpen className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#38BDF8] font-bold mr-1">ចំណោទ៖</span>
            {storyKm}
          </div>
        </div>
      )}

      {/* Main VIP Anime Equation Display Box (BIG and PROMINENT) */}
      <div className={`flex items-center gap-3 sm:gap-6 backdrop-blur-xl px-5 sm:px-8 py-3 rounded-3xl shadow-2xl pointer-events-auto border transition-colors ${
        isDark
          ? 'bg-[#0F172A]/95 border-[#38BDF8]/40 ring-1 ring-[#38BDF8]/20'
          : 'bg-[#FFFFFF]/95 border-[#38BDF8]/60 shadow-sky-100 ring-1 ring-[#38BDF8]/30'
      }`}>
        {/* Left Side Term */}
        <div className="flex flex-col items-center">
          <div className="font-black text-2xl sm:text-4xl text-[#38BDF8] tracking-wider font-['Outfit',sans-serif]">
            {leftStr}
          </div>
          <span className={`text-[11px] font-bold ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            {leftWeight} ឯកតា
          </span>
        </div>

        {/* Equals Sign */}
        <div className={`text-2xl sm:text-4xl font-black ${
          isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'
        }`}>
          =
        </div>

        {/* Right Side Term */}
        <div className="flex flex-col items-center">
          <div className={`font-black text-2xl sm:text-4xl tracking-wider font-['Outfit',sans-serif] ${
            isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
          }`}>
            {rightStr}
          </div>
          <span className={`text-[11px] font-bold ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            {rightWeight} ឯកតា
          </span>
        </div>

        {/* Quick config button */}
        {onOpenValueConfig && (
          <button
            onClick={onOpenValueConfig}
            className={`ml-1 p-2 rounded-2xl border transition active:scale-95 ${
              isDark
                ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155] text-[#38BDF8]'
                : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0284C7]'
            }`}
            title="កំណត់តម្លៃវត្ថុ"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Balance Status Badge (Clear & Visual) */}
      <div className="flex items-center gap-2">
        {balance.isBalanced ? (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#34D399]/20 border border-[#34D399]/50 rounded-full text-xs font-black text-[#10B981] backdrop-blur-md shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{STRINGS.scale.balanced}</span>
          </div>
        ) : balance.difference > 0 ? (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FBBF24]/20 border border-[#FBBF24]/50 rounded-full text-xs font-black text-[#D97706] backdrop-blur-md shadow-sm">
            <ScaleIcon className="w-4 h-4" />
            <span>{STRINGS.scale.leftHeavy} (+{balance.difference})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#F43F5E]/20 border border-[#F43F5E]/50 rounded-full text-xs font-black text-[#E11D48] backdrop-blur-md shadow-sm">
            <ScaleIcon className="w-4 h-4" />
            <span>{STRINGS.scale.rightHeavy} (+{Math.abs(balance.difference)})</span>
          </div>
        )}
      </div>

      {/* Teacher Mode Live Inspector */}
      {teacherMode && (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md pointer-events-auto border ${
          isDark
            ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8]'
            : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]'
        }`}>
          <GraduationCap className="w-4 h-4" />
          <span>{STRINGS.teacher.hiddenX}:</span>
          <span className="text-sm font-black underline">x = {equation.xValue}</span>
        </div>
      )}
    </div>
  );
};
