import { useRef, useState, useEffect } from 'react';
import {
  RotateCcw,
  Undo2,
  Redo2,
  Settings as SettingsIcon,
  Sun,
  Moon,
  CheckCircle2,
  Scale as ScaleIcon,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Scene } from './three/Scene';
import type { SceneHandle } from './three/Scene';
import { useGameStore } from './store/useGameStore';
import { formatSideExpression } from './math/equationModel';
import confetti from 'canvas-confetti';

export function App() {
  const sceneRef = useRef<SceneHandle>(null);

  // Store
  const equation = useGameStore((s) => s.equation);
  const balance = useGameStore((s) => s.balanceMetrics);
  const colorMode = useGameStore((s) => s.colorMode);
  const toggleColorMode = useGameStore((s) => s.toggleColorMode);
  const resetCurrentProblem = useGameStore((s) => s.resetCurrentProblem);
  const setXValue = useGameStore((s) => s.setXValue);
  const setItemWeight = useGameStore((s) => s.setItemWeight);
  const updateFruitValue = useGameStore((s) => s.updateFruitValue);
  const updateWeightValue = useGameStore((s) => s.updateWeightValue);
  const autoBalance = useGameStore((s) => s.autoBalance);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const historyIndex = useGameStore((s) => s.historyIndex);
  const history = useGameStore((s) => s.history);
  const setDraggedType = useGameStore((s) => s.setDraggedType);
  const draggedType = useGameStore((s) => s.draggedType);
  const draggedWeight = useGameStore((s) => s.draggedWeight);
  const draggedVariable = useGameStore((s) => s.draggedVariable);

  // Drag ghost tracking state for touch / mouse
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Sidebar collapsible state ("ផ្ទាំងនេះអាចទាញចេញចូលបាន")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Quick active weight preset for dragging/adding
  const [activeWeight, setActiveWeight] = useState<number>(1);
  const WEIGHT_PRESETS = [1, 2, 5, 10];

  // Custom User-Created Blocks & Variables
  interface CustomBlock {
    id: string;
    type: 'variable' | 'weight' | 'fruit';
    name: string; // e.g. "x", "y", "a" or "2kg", "ចេក", "ប៉ោម", "ស្វាយ"
    value: number; // numeric value for balance calculation (can be negative!)
    fruitType?: 'apple' | 'banana' | 'mango';
    color?: string;
  }

  const CUSTOM_BLOCKS_KEY = 'equation_lab_custom_blocks_v2';

  const fruitEmoji = (type?: string) => (type === 'apple' ? '🍎' : type === 'banana' ? '🍌' : '🥭');

  const defaultBlocks: CustomBlock[] = [
    { id: 'var-x', type: 'variable', name: 'x', value: 5 },
    { id: 'w-1', type: 'weight', name: '1kg', value: 1 },
    { id: 'w-2', type: 'weight', name: '2kg', value: 2 },
    { id: 'w-3', type: 'weight', name: '3kg', value: 3 },
    { id: 'fruit-apple', type: 'fruit', name: 'ប៉ោម', value: 2, fruitType: 'apple' },
    { id: 'fruit-banana', type: 'fruit', name: 'ចេក', value: 1, fruitType: 'banana' },
    { id: 'fruit-mango', type: 'fruit', name: 'ស្វាយ', value: 3, fruitType: 'mango' },
  ];

  const [customBlocks, setCustomBlocks] = useState<CustomBlock[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_BLOCKS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return defaultBlocks;
  });

  // Automatically save to localStorage whenever customBlocks change
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_BLOCKS_KEY, JSON.stringify(customBlocks));
    } catch {
      // ignore
    }
  }, [customBlocks]);

  // Form states for creating custom variable / weight / fruit blocks
  const [newBlockType, setNewBlockType] = useState<'variable' | 'weight' | 'fruit'>('variable');
  const [newBlockName, setNewBlockName] = useState<string>('y');
  const [newBlockValue, setNewBlockValue] = useState<number>(3);
  const [newFruitType, setNewFruitType] = useState<'apple' | 'banana' | 'mango'>('apple');

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBlockName.trim();
    if (!trimmed && newBlockType !== 'weight') return;
    const finalName = newBlockType === 'weight' ? `${newBlockValue}kg` : trimmed;
    const block: CustomBlock = {
      id: `custom-${Date.now()}`,
      type: newBlockType,
      name: finalName,
      value: newBlockValue, // can be positive or negative e.g. -1, 4
      fruitType: newBlockType === 'fruit' ? newFruitType : undefined,
    };
    setCustomBlocks((prev) => [...prev, block]);
    if (newBlockType === 'variable') {
      setNewBlockName(String.fromCharCode(trimmed.charCodeAt(0) + 1));
    } else if (newBlockType === 'weight') {
      const nextVal = newBlockValue >= 0 ? newBlockValue + 1 : newBlockValue;
      setNewBlockValue(nextVal);
      setNewBlockName(`${nextVal}kg`);
    } else {
      setNewBlockName(newFruitType === 'apple' ? 'ចេក' : newFruitType === 'banana' ? 'ស្វាយ' : 'ប៉ោម');
      setNewFruitType(newFruitType === 'apple' ? 'banana' : newFruitType === 'banana' ? 'mango' : 'apple');
    }
  };

  const handleUpdateBlockValue = (id: string, deltaOrValue: number, isDirect = false) => {
    setCustomBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const nextVal = isDirect ? deltaOrValue : b.value + deltaOrValue;
        const nextName = b.type === 'weight' ? `${nextVal}kg` : b.name;
        if (b.type === 'fruit' && b.fruitType) {
          updateFruitValue(b.fruitType, nextVal);
        } else if (b.type === 'weight') {
          updateWeightValue(b.id, nextVal);
        } else if (b.type === 'variable' && b.name.toLowerCase() === 'x') {
          setXValue(nextVal);
        }
        return { ...b, value: nextVal, name: nextName };
      })
    );
  };

  const handleDeleteBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const isDark = colorMode === 'dark';
  const itemWeight = equation.itemWeight ?? 1;
  const leftStr = formatSideExpression(equation.left, itemWeight);
  const rightStr = formatSideExpression(equation.right, itemWeight);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode]);

  const prevBalancedRef = useRef(false);
  useEffect(() => {
    if (balance.isBalanced && !prevBalancedRef.current) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#38BDF8', '#F59E0B', '#EF4444'],
      });
    }
    prevBalancedRef.current = balance.isBalanced;
  }, [balance.isBalanced]);

  // Global pointer move & up listeners for smooth drag & drop
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggedType) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragPointer({ x: clientX, y: clientY });
    };

    const handleUp = () => {
      setDragPointer(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggedType]);

  const startDrag = (
    type: 'bag' | 'item',
    clientX: number,
    clientY: number,
    weightValue?: number,
    variableItem?: { name: string; value: number },
    customItem?: any
  ) => {
    setDraggedType(type, weightValue, variableItem, customItem);
    setDragPointer({ x: clientX, y: clientY });
  };

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden select-none font-['Noto_Sans_Khmer',system-ui,sans-serif] ${
      isDark ? 'bg-[#0B1020] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* ================= 1. CLEAN TOP HEADER ================= */}
      <header className={`h-14 px-4 flex items-center justify-between border-b shrink-0 z-20 ${
        isDark ? 'bg-[#10172A]/90 border-[#1E293B]' : 'bg-[#FFFFFF]/90 border-[#E2E8F0] shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition active:scale-95 flex items-center justify-center ${
              isDark
                ? 'bg-[#1E293B] border-[#334155] text-[#38BDF8] hover:bg-[#334155]'
                : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0284C7] hover:bg-[#E2E8F0]'
            }`}
            title={isSidebarOpen ? 'បិទផ្ទាំងបញ្ជា (Hide Sidebar)' : 'បើកផ្ទាំងបញ្ជា (Show Sidebar)'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Live Equation Clean Text (Moved here to completely free the 3D canvas) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-['Outfit',sans-serif]">
            <span className="text-xl sm:text-2xl font-black text-[#0284C7] dark:text-[#38BDF8]">
              {leftStr}
            </span>
            <span className="text-lg sm:text-xl font-black text-[#94A3B8]">=</span>
            <span className={`text-xl sm:text-2xl font-black ${
              isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
            }`}>
              {rightStr}
            </span>
          </div>

          {/* Balance Status indicator */}
          <div>
            {balance.isBalanced ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>មានលំនឹង</span>
              </div>
            ) : balance.difference > 0 ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F59E0B]/15 text-[#D97706] dark:text-[#F59E0B] border border-[#F59E0B]/30">
                <ScaleIcon className="w-3 h-3" />
                <span>ឆ្វេងធ្ងន់ (+{balance.difference})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444]/15 text-[#DC2626] dark:text-[#EF4444] border border-[#EF4444]/30">
                <ScaleIcon className="w-3 h-3" />
                <span>ស្តាំធ្ងន់ (+{Math.abs(balance.difference)})</span>
              </div>
            )}
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleColorMode}
            className={`p-2 rounded-xl transition ${
              isDark ? 'text-[#F59E0B] hover:bg-[#1E293B]' : 'text-[#0284C7] hover:bg-[#F1F5F9]'
            }`}
            title="ប្តូរពន្លឺ / ងងឹត"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => sceneRef.current?.resetCamera()}
            className={`p-2 rounded-xl transition ${
              isDark ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
            title="កំណត់ទិដ្ឋភាពឡើងវិញ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-xl transition ${
              canUndo
                ? isDark ? 'text-[#F8FAFC] hover:bg-[#1E293B]' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                : 'opacity-25 cursor-not-allowed'
            }`}
            title="ត្រឡប់ក្រោយ"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-xl transition ${
              canRedo
                ? isDark ? 'text-[#F8FAFC] hover:bg-[#1E293B]' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                : 'opacity-25 cursor-not-allowed'
            }`}
            title="ទៅមុខ"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-xl transition ${
              isDark ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
            title="ការកំណត់"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= 2. MAIN LAYOUT: LEFT SIDEBAR & 3D CANVAS ================= */}
      <div className="flex-1 w-full flex flex-col md:flex-row overflow-hidden relative">
        {/* ================= LEFT SIDEBAR (Controls & Draggable Tray) ================= */}
        <aside
          className={`shrink-0 border-b md:border-b-0 md:border-r flex flex-col gap-3 p-4 overflow-y-auto z-20 transition-all duration-300 relative ${
            isSidebarOpen
              ? 'w-full md:w-84 lg:w-96 translate-x-0'
              : 'w-0 p-0 overflow-hidden -translate-x-full border-none opacity-0 pointer-events-none'
          } ${
            isDark ? 'bg-[#10172A] border-[#1E293B]' : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-md'
          }`}
        >
          {/* Header row in sidebar with close button */}
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8]">
              ផ្ទាំងបញ្ជា (Controls)
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] transition"
              title="បិទផ្ទាំង (Collapse Sidebar)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Draggable Items Box: Clean Ghibli Style Drag Tray */}
          <div className="flex flex-col gap-3 w-full">
            <span className="text-xs font-black text-[#64748B] dark:text-[#94A3B8]">
              សម្ភារៈពិសោធន៍
            </span>

            {/* Draggable Mystery Box (x) */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 shadow-xs ${
              isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div
                onMouseDown={(e) => startDrag('bag', e.clientX, e.clientY)}
                onTouchStart={(e) => startDrag('bag', e.touches[0].clientX, e.touches[0].clientY)}
                className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex-1"
                title="អូសដាក់លើថាស"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0284C7] border-2 border-amber-300 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  x
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8]">ប្រអប់ (x)</span>
                  <span className="text-[10px] text-[#94A3B8]">អូសដាក់លើថាស</span>
                </div>
              </div>
            </div>

            {/* Draggable Metal Weights Tray */}
            <div className={`p-3 rounded-2xl border flex flex-col gap-2.5 shadow-xs ${
              isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#10B981]">ដុំទម្ងន់ ({activeWeight}kg)</span>
                {/* Weight Presets Selector */}
                <div className="flex items-center gap-1">
                  {WEIGHT_PRESETS.map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        setActiveWeight(w);
                        setItemWeight(w);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-black transition active:scale-95 ${
                        activeWeight === w
                          ? 'bg-[#10B981] text-white shadow-xs'
                          : isDark
                          ? 'bg-[#334155] text-[#94A3B8] hover:text-white'
                          : 'bg-[#E2E8F0] text-[#64748B] hover:text-black'
                      }`}
                    >
                      {w}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div
                  onMouseDown={(e) => startDrag('item', e.clientX, e.clientY, activeWeight)}
                  onTouchStart={(e) => startDrag('item', e.touches[0].clientX, e.touches[0].clientY, activeWeight)}
                  className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex-1"
                  title="ចុចអូស (Drag) ទៅដាក់លើថាសឆ្វេង ឬស្តាំ"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#334155] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xs shadow-sm">
                    {activeWeight}kg
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#10B981]">{activeWeight} គីឡូក្រាម</span>
                    <span className="text-[10px] text-[#94A3B8]">អូសដាក់លើថាស</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= DEDICATED SECTION: កំណត់តម្លៃផ្លែឈើ (Fruit Weights Configuration) ================= */}
          <div className={`p-3 rounded-2xl border flex flex-col gap-2.5 shadow-xs ${
            isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/20">
              <span className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                <span>🍎</span>
                <span>កំណត់តម្លៃផ្លែឈើ</span>
              </span>
              <span className="text-[10px] text-[#94A3B8] font-bold">កែតម្លៃបានភ្លាមៗ</span>
            </div>

            <div className="flex flex-col gap-2">
              {customBlocks.filter((b) => b.type === 'fruit').map((fruit) => (
                <div
                  key={fruit.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition ${
                    isDark ? 'bg-[#0F172A]/70 border-[#334155]' : 'bg-white border-[#E2E8F0] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {fruit.fruitType === 'apple' ? '🍎' : fruit.fruitType === 'banana' ? '🍌' : '🥭'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{fruit.name}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">{fruit.value} គីឡូក្រាម</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateBlockValue(fruit.id, -1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center font-black border text-xs hover:bg-black/5 dark:hover:bg-white/10 active:scale-90"
                      title="បន្ថយទម្ងន់"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={fruit.value}
                      onChange={(e) => handleUpdateBlockValue(fruit.id, parseInt(e.target.value) || 0, true)}
                      className={`w-12 h-6 rounded border text-center text-xs font-black ${
                        isDark ? 'bg-[#1E293B] border-[#334155] text-amber-300' : 'bg-[#FEF3C7] border-amber-300 text-amber-800'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateBlockValue(fruit.id, 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center font-black border text-xs hover:bg-black/5 dark:hover:bg-white/10 active:scale-90"
                      title="បង្កើនទម្ងន់"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Create Custom Box Variable & Box Value */}
          <div className={`p-3 rounded-2xl border flex flex-col gap-2.5 shadow-xs ${
            isDark ? 'bg-[#1E293B]/70 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <span className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8] flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>បង្កើតប្រអប់ / ដុំទម្ងន់ / ផ្លែឈើ</span>
            </span>

            <form onSubmit={handleCreateBlock} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewBlockType('variable');
                    setNewBlockName('y');
                    setNewBlockValue(3);
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                    newBlockType === 'variable'
                      ? 'bg-[#0284C7] text-white border-[#0284C7]'
                      : isDark ? 'bg-[#334155] text-[#94A3B8] border-transparent' : 'bg-[#E2E8F0] text-[#64748B] border-transparent'
                  }`}
                >
                  អថេរ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewBlockType('weight');
                    setNewBlockValue(4);
                    setNewBlockName('4kg');
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                    newBlockType === 'weight'
                      ? 'bg-[#10B981] text-white border-[#10B981]'
                      : isDark ? 'bg-[#334155] text-[#94A3B8] border-transparent' : 'bg-[#E2E8F0] text-[#64748B] border-transparent'
                  }`}
                >
                  ដុំទម្ងន់
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewBlockType('fruit');
                    setNewBlockName('ចេក');
                    setNewBlockValue(2);
                    setNewFruitType('banana');
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                    newBlockType === 'fruit'
                      ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
                      : isDark ? 'bg-[#334155] text-[#94A3B8] border-transparent' : 'bg-[#E2E8F0] text-[#64748B] border-transparent'
                  }`}
                >
                  ផ្លែឈើ
                </button>
              </div>

              {newBlockType === 'fruit' && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold">
                    ប្រភេទផ្លែឈើ៖
                  </label>
                  <select
                    value={newFruitType}
                    onChange={(e) => {
                      const ft = e.target.value as 'apple' | 'banana' | 'mango';
                      setNewFruitType(ft);
                      setNewBlockName(ft === 'apple' ? 'ប៉ោម' : ft === 'banana' ? 'ចេក' : 'ស្វាយ');
                    }}
                    className={`px-2 py-1 rounded-lg border text-xs font-bold flex-1 ${
                      isDark ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-[#CBD5E1] text-black'
                    }`}
                  >
                    <option value="apple">ប៉ោម (Apple)</option>
                    <option value="banana">ចេក (Banana)</option>
                    <option value="mango">ស្វាយ (Mango)</option>
                  </select>
                </div>
              )}

              {/* Weight Block: Label & Numeric Value are ALWAYS strictly unified */}
              {newBlockType === 'weight' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#10B981] font-bold">
                    ស្លាកទម្ងន់ និង ទម្ងន់ kg (មានតម្លៃដូចគ្នាជានិច្ច)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={-100}
                      max={100}
                      value={newBlockValue}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setNewBlockValue(val);
                        setNewBlockName(`${val}kg`);
                      }}
                      className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                        isDark ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-[#CBD5E1] text-black'
                      }`}
                    />
                    <span className="text-xs font-black px-2.5 py-1.5 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 rounded-lg">
                      {newBlockValue}kg
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col">
                    <label className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold">
                      {newBlockType === 'variable' ? 'ឈ្មោះអថេរ' : 'ឈ្មោះផ្លែឈើ'}
                    </label>
                    <input
                      type="text"
                      value={newBlockName}
                      onChange={(e) => setNewBlockName(e.target.value)}
                      maxLength={8}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-bold ${
                        isDark ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-[#CBD5E1] text-black'
                      }`}
                      placeholder={newBlockType === 'variable' ? 'y, z, a' : 'ចេក'}
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold">
                      ទម្ងន់ kg (វិជ្ជមាន / អវិជ្ជមាន)
                    </label>
                    <input
                      type="number"
                      min={-100}
                      max={100}
                      value={newBlockValue}
                      onChange={(e) => setNewBlockValue(parseInt(e.target.value) || 0)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-bold ${
                        isDark ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-[#CBD5E1] text-black'
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-black shadow-xs transition active:scale-95"
              >
                + បង្កើត
              </button>
            </form>
          </div>

          {/* Bottom Action: Auto Balance */}
          <div className="pt-2 mt-auto">
            <button
              onClick={autoBalance}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs"
            >
              <ScaleIcon className="w-4 h-4" />
              <span>ធ្វើឱ្យមានលំនឹងស្វ័យប្រវត្តិ</span>
            </button>
          </div>
        </aside>

        {/* ================= 3D BALANCE SCALE CANVAS (EXPANDED TO FULL SPACE) ================= */}
        <main className="flex-1 h-full relative touch-none overflow-hidden">
          {/* Floating trigger button to reopen sidebar when collapsed */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`absolute top-4 left-4 z-30 p-2.5 rounded-2xl shadow-xl border flex items-center gap-1.5 font-bold text-xs transition active:scale-95 ${
                isDark
                  ? 'bg-[#10172A] border-[#334155] text-[#38BDF8] hover:bg-[#1E293B]'
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0284C7] hover:bg-[#F8FAFC]'
              }`}
              title="បើកផ្ទាំងបញ្ជា (Open Sidebar)"
            >
              <ChevronRight className="w-4 h-4" />
              <span>ផ្ទាំងបញ្ជា</span>
            </button>
          )}

          {/* 3D WebGL Canvas */}
          <Scene ref={sceneRef} />

          {/* Floating Drag Ghost when dragging */}
          {draggedType && dragPointer && (
            <div
              className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse"
              style={{ left: dragPointer.x, top: dragPointer.y }}
            >
              {draggedType === 'bag' ? (
                <div className="w-14 h-14 rounded-2xl bg-[#0284C7] border-2 border-amber-300 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {draggedVariable?.name || 'x'}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#334155] border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 font-black text-sm shadow-xl">
                  {draggedWeight ?? activeWeight}kg
                </div>
              )}
            </div>
          )}

          {/* ================= 4. BOTTOM BENCH SHELF (Where created boxes appear and can be dragged) ================= */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-11/12">
            <div className={`px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 overflow-x-auto ${
              isDark ? 'bg-[#10172A]/90 border-[#334155]' : 'bg-[#FFFFFF]/95 border-[#CBD5E1]'
            }`}>
              <div className="shrink-0 flex flex-col pr-2 border-r border-gray-300 dark:border-gray-700">
                <span className="text-[11px] font-black text-[#0284C7] dark:text-[#38BDF8]">
                  ធ្នើដាក់ប្រអប់
                </span>
                <span className="text-[9px] text-[#94A3B8]">
                  អូសដាក់លើថាស
                </span>
              </div>

              {/* List of Custom Boxes & Values on the Bottom Shelf */}
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {customBlocks.map((b) => (
                  <div
                    key={b.id}
                    className={`group relative shrink-0 p-2 rounded-xl border flex items-center gap-2 transition shadow-xs select-none ${
                      b.type === 'variable'
                        ? isDark ? 'bg-[#0284C7]/20 border-[#0284C7]/50' : 'bg-sky-50 border-sky-300'
                        : b.type === 'fruit'
                        ? isDark ? 'bg-amber-950/30 border-amber-500/40' : 'bg-amber-50 border-amber-300'
                        : isDark ? 'bg-[#10B981]/20 border-[#10B981]/50' : 'bg-emerald-50 border-emerald-300'
                    }`}
                  >
                    {/* Draggable block thumbnail */}
                    <div
                      onMouseDown={(e) => {
                        if (b.type === 'variable') {
                          startDrag('bag', e.clientX, e.clientY, undefined, { name: b.name, value: b.value });
                        } else if (b.type === 'fruit') {
                          setActiveWeight(b.value);
                          startDrag('item', e.clientX, e.clientY, b.value, undefined, {
                            id: b.id,
                            name: b.name,
                            value: b.value,
                            fruitType: b.fruitType,
                          });
                        } else {
                          setActiveWeight(b.value);
                          startDrag('item', e.clientX, e.clientY, b.value, undefined, {
                            id: b.id,
                            name: `${b.value}kg`,
                            value: b.value,
                          });
                        }
                      }}
                      onTouchStart={(e) => {
                        if (b.type === 'variable') {
                          startDrag('bag', e.touches[0].clientX, e.touches[0].clientY, undefined, { name: b.name, value: b.value });
                        } else if (b.type === 'fruit') {
                          setActiveWeight(b.value);
                          startDrag('item', e.touches[0].clientX, e.touches[0].clientY, b.value, undefined, {
                            id: b.id,
                            name: b.name,
                            value: b.value,
                            fruitType: b.fruitType,
                          });
                        } else {
                          setActiveWeight(b.value);
                          startDrag('item', e.touches[0].clientX, e.touches[0].clientY, b.value, undefined, {
                            id: b.id,
                            name: `${b.value}kg`,
                            value: b.value,
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing p-1"
                      title="ចុចអូស (Drag) ទៅដាក់លើថាសឆ្វេង ឬស្តាំ"
                    >
                      {b.type === 'variable' ? (
                        <div className="w-10 h-10 rounded-xl bg-[#0284C7] border-2 border-amber-300 flex items-center justify-center text-white font-black text-base shadow-xs">
                          {b.name}
                        </div>
                      ) : b.type === 'fruit' ? (
                        <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/60 border-2 border-amber-400 flex flex-col items-center justify-center text-sm font-black shadow-xs">
                          <span>{fruitEmoji(b.fruitType)}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#334155] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xs shadow-xs">
                          {b.value}kg
                        </div>
                      )}
                    </div>

                    {/* Block label (no - + buttons, and variable value is strictly HIDDEN) */}
                    <div className="flex flex-col pr-1 select-none">
                      {b.type === 'variable' ? (
                        <span className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8] px-1">
                          {b.name}
                        </span>
                      ) : b.type === 'fruit' ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold leading-tight">{b.name}</span>
                          <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit',sans-serif]">
                            {b.value}kg
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-[#10B981] font-['Outfit',sans-serif] px-1">
                          {b.value}kg
                        </span>
                      )}
                    </div>

                    {/* Delete button (for custom created items) */}
                    {customBlocks.length > 2 && (
                      <button
                        onClick={(e) => handleDeleteBlock(b.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 transition"
                        title="លុបចេញ"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 ${
            isDark ? 'bg-[#10172A] border-[#1E293B] text-[#F8FAFC]' : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
          }`}>
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-base font-bold">ការកំណត់</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => {
                resetCurrentProblem();
                setIsSettingsOpen(false);
              }}
              className="w-full py-2.5 bg-[#EF4444] text-white rounded-xl text-xs font-bold"
            >
              ជម្រះជញ្ជីង (Clear Scale)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
