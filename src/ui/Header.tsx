import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Undo2,
  Redo2,
  HelpCircle,
  Settings as SettingsIcon,
  Flame,
  Star,
  GraduationCap,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { STRINGS } from '../strings';

interface HeaderProps {
  onOpenLevels: () => void;
  onOpenSettings: () => void;
  onOpenValueConfig: () => void;
  onResetCamera: () => void;
  onShowHint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLevels,
  onOpenSettings,
  onOpenValueConfig,
  onResetCamera,
  onShowHint,
}) => {
  const level = useGameStore((s) => s.level);
  const stars = useGameStore((s) => s.stars);
  const streak = useGameStore((s) => s.streak);
  const colorMode = useGameStore((s) => s.colorMode);
  const toggleColorMode = useGameStore((s) => s.toggleColorMode);
  const historyIndex = useGameStore((s) => s.historyIndex);
  const history = useGameStore((s) => s.history);
  const teacherMode = useGameStore((s) => s.teacherMode);
  const toggleTeacherMode = useGameStore((s) => s.toggleTeacherMode);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);

  const isDark = colorMode === 'dark';
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className={`w-full flex items-center justify-between px-3 sm:px-5 py-2.5 backdrop-blur-xl border-b z-20 transition-colors ${
      isDark
        ? 'bg-[#0F172A]/90 border-[#1E293B] text-[#F8FAFC]'
        : 'bg-[#FFFFFF]/90 border-[#E2E8F0] text-[#0F172A] shadow-sm'
    }`}>
      {/* Left: Level selector and Stats */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenLevels}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-black transition active:scale-95 border ${
            isDark
              ? 'bg-[#1E293B] hover:bg-[#334155] border-[#334155] text-[#38BDF8]'
              : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0284C7]'
          }`}
          title={STRINGS.header.level}
        >
          <Sparkles className="w-4 h-4" />
          <span>{STRINGS.header.level} {level}</span>
        </button>

        {/* Stars */}
        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border ${
          isDark
            ? 'bg-[#1E293B]/80 border-[#334155]'
            : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
          <span className="text-[#FBBF24] text-sm">{totalStars}</span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F43F5E]/15 rounded-2xl text-xs font-bold text-[#F43F5E] border border-[#F43F5E]/30">
            <Flame className="w-4 h-4 fill-[#F43F5E]" />
            <span>{streak}</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Light / Dark Mode Toggle Switch */}
        <button
          onClick={toggleColorMode}
          className={`p-2 rounded-2xl transition active:scale-95 border flex items-center justify-center ${
            isDark
              ? 'bg-[#1E293B] border-[#334155] text-[#FBBF24] hover:bg-[#334155]'
              : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0284C7] hover:bg-[#E2E8F0]'
          }`}
          title={isDark ? 'ប្តូរទៅពន្លឺ (Light Mode)' : 'ប្តូរទៅងងឹត (Dark Mode)'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetCamera}
          className={`p-2 rounded-2xl transition active:scale-90 ${
            isDark
              ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
          title={STRINGS.header.resetView}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-2xl transition active:scale-90 ${
            canUndo
              ? isDark ? 'text-[#F8FAFC] hover:bg-[#1E293B]' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
              : 'text-[#94A3B8]/30 cursor-not-allowed'
          }`}
          title={STRINGS.header.undo}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-2xl transition active:scale-90 ${
            canRedo
              ? isDark ? 'text-[#F8FAFC] hover:bg-[#1E293B]' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
              : 'text-[#94A3B8]/30 cursor-not-allowed'
          }`}
          title={STRINGS.header.redo}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Hint */}
        <button
          onClick={onShowHint}
          className="p-2 text-[#FBBF24] hover:bg-[#FBBF24]/15 rounded-2xl transition active:scale-90"
          title={STRINGS.header.hint}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Configure Values Modal */}
        <button
          onClick={onOpenValueConfig}
          className="p-2 text-[#38BDF8] hover:bg-[#38BDF8]/15 rounded-2xl transition active:scale-90"
          title="កំណត់តម្លៃវត្ថុ"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Teacher Mode */}
        <button
          onClick={toggleTeacherMode}
          className={`p-2 rounded-2xl transition active:scale-90 ${
            teacherMode
              ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
              : isDark ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
          }`}
          title={STRINGS.header.teacherMode}
        >
          <GraduationCap className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-2xl transition active:scale-90 ${
            isDark
              ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
          title={STRINGS.header.settings}
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
