import React, { useState } from 'react';
import { X, Palette, Cpu, Volume2, VolumeX, GraduationCap, Check, Sun, Moon } from 'lucide-react';
import { useGameStore, type QualityLevel } from '../store/useGameStore';
import { ITEM_THEMES, type ItemThemeId } from '../theme';
import { STRINGS } from '../strings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const theme = useGameStore((s) => s.theme);
  const setTheme = useGameStore((s) => s.setTheme);
  const quality = useGameStore((s) => s.quality);
  const setQuality = useGameStore((s) => s.setQuality);
  const colorMode = useGameStore((s) => s.colorMode);
  const toggleColorMode = useGameStore((s) => s.toggleColorMode);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const teacherMode = useGameStore((s) => s.teacherMode);
  const toggleTeacherMode = useGameStore((s) => s.toggleTeacherMode);
  const setCustomEquation = useGameStore((s) => s.setCustomEquation);

  const isDark = colorMode === 'dark';

  // Custom teacher equation state
  const [customA, setCustomA] = useState('2');
  const [customB, setCustomB] = useState('3');
  const [customC, setCustomC] = useState('11');

  if (!isOpen) return null;

  const handleApplyCustomEquation = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Math.max(1, parseInt(customA, 10) || 1);
    const b = Math.max(0, parseInt(customB, 10) || 0);
    const c = Math.max(b + 1, parseInt(customC, 10) || b + 1);
    setCustomEquation(a, b, c);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`border-2 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto ${
        isDark
          ? 'bg-[#0F172A] border-[#1E293B] text-[#F8FAFC]'
          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${
          isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'
        }`}>
          <h2 className="text-lg font-black">
            {STRINGS.settings.title}
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

        {/* 1. Light and Dark Mood Switch */}
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            {isDark ? (
              <Moon className="w-4 h-4 text-[#38BDF8]" />
            ) : (
              <Sun className="w-4 h-4 text-[#FBBF24]" />
            )}
            <span>ទិដ្ឋភាពពន្លឺ / ងងឹត (Theme Mode)</span>
          </div>
          <button
            onClick={toggleColorMode}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition active:scale-95 border ${
              isDark
                ? 'bg-[#0F172A] border-[#38BDF8]/40 text-[#38BDF8]'
                : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0284C7] shadow-sm'
            }`}
          >
            {isDark ? 'ងងឹត (Dark Mode)' : 'ពន្លឺ (Light Mode)'}
          </button>
        </div>

        {/* 2. Theme Picker */}
        <div className="flex flex-col gap-2">
          <label className={`text-xs font-bold flex items-center gap-1.5 ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{STRINGS.settings.themeSelect}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ITEM_THEMES) as ItemThemeId[]).map((themeKey) => {
              const opt = ITEM_THEMES[themeKey];
              const isSelected = theme === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#0284C7] dark:text-[#38BDF8]'
                      : isDark
                      ? 'bg-[#1E293B]/70 hover:bg-[#1E293B] border-[#334155] text-[#94A3B8]'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <span>{opt.nameKm}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#38BDF8]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 3D Graphics Quality */}
        <div className="flex flex-col gap-2">
          <label className={`text-xs font-bold flex items-center gap-1.5 ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>{STRINGS.settings.quality}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as QualityLevel[]).map((q) => {
              const isSelected = quality === q;
              const label =
                q === 'low'
                  ? 'ទាប (30fps)'
                  : q === 'medium'
                  ? 'មធ្យម'
                  : 'ខ្ពស់ (ស្រមោល)';
              return (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? 'bg-[#FBBF24]/20 border-[#FBBF24] text-[#D97706] dark:text-[#FBBF24]'
                      : isDark
                      ? 'bg-[#1E293B]/70 hover:bg-[#1E293B] border-[#334155] text-[#94A3B8]'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Audio Sound */}
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#34D399]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#94A3B8]" />
            )}
            <span>{STRINGS.settings.sound}</span>
          </div>
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              soundEnabled
                ? 'bg-[#34D399]/20 text-[#10B981] border border-[#34D399]/40'
                : isDark ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#E2E8F0] text-[#64748B]'
            }`}
          >
            {soundEnabled ? STRINGS.settings.soundOn : STRINGS.settings.soundOff}
          </button>
        </div>

        {/* 5. Teacher Mode Custom Equations */}
        <div className={`flex flex-col gap-3 p-3.5 rounded-2xl border ${
          isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-[#38BDF8]" />
              <span>{STRINGS.header.teacherMode}</span>
            </div>
            <button
              onClick={toggleTeacherMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                teacherMode
                  ? 'bg-[#38BDF8]/20 text-[#0284C7] dark:text-[#38BDF8] border border-[#38BDF8]/40'
                  : isDark ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {teacherMode ? 'បើក' : 'បិទ'}
            </button>
          </div>

          {teacherMode && (
            <form onSubmit={handleApplyCustomEquation} className={`flex flex-col gap-2 pt-2 border-t ${
              isDark ? 'border-[#334155]' : 'border-[#E2E8F0]'
            }`}>
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                {STRINGS.teacher.customEquation} (ax + b = c):
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={customA}
                  onChange={(e) => setCustomA(e.target.value)}
                  className={`w-12 p-2 border rounded-xl text-center text-xs font-black text-[#38BDF8] ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                  placeholder="a"
                  min="1"
                  max="6"
                />
                <span className="text-xs font-bold text-[#94A3B8]">x +</span>
                <input
                  type="number"
                  value={customB}
                  onChange={(e) => setCustomB(e.target.value)}
                  className={`w-12 p-2 border rounded-xl text-center text-xs font-black ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                  placeholder="b"
                  min="0"
                  max="15"
                />
                <span className="text-xs font-bold text-[#94A3B8]">=</span>
                <input
                  type="number"
                  value={customC}
                  onChange={(e) => setCustomC(e.target.value)}
                  className={`w-14 p-2 border rounded-xl text-center text-xs font-black text-[#34D399] ${
                    isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FFFFFF] border-[#CBD5E1]'
                  }`}
                  placeholder="c"
                  min="1"
                  max="25"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0F24] rounded-xl text-xs font-black transition active:scale-95"
                >
                  {STRINGS.teacher.applyCustom}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
