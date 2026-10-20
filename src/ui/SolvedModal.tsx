import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { STRINGS } from '../strings';

export const SolvedModal: React.FC = () => {
  const isSolved = useGameStore((s) => s.isSolvedCelebration);
  const colorMode = useGameStore((s) => s.colorMode);
  const equation = useGameStore((s) => s.equation);
  const stepsCount = useGameStore((s) => s.stepsCount);
  const nextProblem = useGameStore((s) => s.nextProblem);
  const resetCurrentProblem = useGameStore((s) => s.resetCurrentProblem);
  const dismissCelebration = useGameStore((s) => s.dismissCelebration);

  const isDark = colorMode === 'dark';
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (isSolved) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34D399', '#38BDF8', '#FBBF24', '#F43F5E', '#A855F7'],
      });

      setCounter(0);
      const interval = setInterval(() => {
        setCounter((prev) => {
          if (prev < equation.xValue) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 180);

      return () => clearInterval(interval);
    }
  }, [isSolved, equation.xValue]);

  if (!isSolved) return null;

  const earnedStars = stepsCount <= 3 ? 3 : stepsCount <= 5 ? 2 : 1;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`border-2 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-90 duration-200 ${
        isDark
          ? 'bg-[#0F172A] border-[#34D399]/50 text-[#F8FAFC]'
          : 'bg-[#FFFFFF] border-[#34D399]/60 text-[#0F172A]'
      }`}>
        {/* Trophy Glow */}
        <div className="w-16 h-16 rounded-3xl bg-[#34D399]/20 border-2 border-[#34D399]/40 flex items-center justify-center text-[#10B981] shadow-lg shadow-[#34D399]/20">
          <Trophy className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black">
            {STRINGS.feedback.solvedTitle}
          </h2>
          <p className={`text-xs font-semibold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            {STRINGS.feedback.solvedDesc}
          </p>
        </div>

        {/* Big Animated Result Box */}
        <div className={`w-full py-4 rounded-3xl border-2 flex flex-col items-center gap-1 shadow-inner ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <span className={`text-xs font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            {STRINGS.objects.mysteryBag} (x) =
          </span>
          <div className="text-5xl font-black text-[#10B981] tracking-wider animate-bounce font-['Outfit',sans-serif]">
            {counter}
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            {STRINGS.feedback.countItems}
          </span>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-7 h-7 transition-transform ${
                starIdx <= earnedStars
                  ? 'fill-[#FBBF24] text-[#FBBF24] scale-110'
                  : isDark ? 'text-[#334155]' : 'text-[#CBD5E1]'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-2 pt-2">
          <button
            onClick={() => {
              dismissCelebration();
              resetCurrentProblem();
            }}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 border ${
              isDark
                ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155] text-[#F8FAFC]'
                : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{STRINGS.feedback.retry}</span>
          </button>

          <button
            onClick={() => {
              dismissCelebration();
              nextProblem();
            }}
            className="flex-1 py-3.5 bg-[#34D399] hover:bg-[#10B981] text-[#0A0F24] rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-[#34D399]/30"
          >
            <span>{STRINGS.feedback.nextProblem}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
