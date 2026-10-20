import { create } from 'zustand';
import type { EquationState, BalanceMetrics, CustomWeightItem } from '../math/equationModel';
import { calculateBalance } from '../math/equationModel';
import { generateProblem } from '../math/problemGenerator';
import { modifyPan, applyOperationBothSides } from '../math/operations';
import type { ItemThemeId } from '../theme';

export type QualityLevel = 'auto' | 'low' | 'medium' | 'high';

interface GameState {
  // Current equation
  level: number;
  equation: EquationState;
  initialEquation: EquationState;
  balanceMetrics: BalanceMetrics;
  storyKm?: string;
  stepsCount: number;

  // History for undo / redo
  history: EquationState[];
  historyIndex: number;

  // Interaction
  hoveredPan: 'left' | 'right' | null;
  draggedType: 'bag' | 'item' | 'balloon' | null;
  draggedWeight?: number;
  draggedVariable?: { name: string; value: number };
  draggedCustomItem?: CustomWeightItem;
  selectedTool: 'bag' | 'item' | 'balloon' | null; // For click-to-place accessibility

  // Solved & celebration
  isSolvedCelebration: boolean;
  revealedItemCount: number;

  // Persistence / settings
  stars: Record<number, number>; // level -> star count (1-3)
  streak: number;
  theme: ItemThemeId;
  quality: QualityLevel;
  colorMode: 'dark' | 'light';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  teacherMode: boolean;
  guidedMode: boolean;

  // Actions
  setLevel: (level: number) => void;
  loadProblem: (level?: number) => void;
  nextProblem: () => void;
  resetCurrentProblem: () => void;
  
  // Pan actions
  addToPan: (
    pan: 'left' | 'right',
    type: 'bag' | 'item' | 'balloon',
    weightValue?: number,
    variableItem?: { name: string; value: number },
    customItem?: CustomWeightItem
  ) => void;
  removeFromPan: (
    pan: 'left' | 'right',
    type: 'bag' | 'item' | 'balloon',
    weightValue?: number,
    variableItem?: { name: string; value: number },
    customItem?: CustomWeightItem
  ) => void;
  applyOperation: (op: 'addItems' | 'subItems' | 'divide' | 'subBags', amount: number) => void;
  
  // History
  undo: () => void;
  redo: () => void;

  // Interaction state
  setHoveredPan: (pan: 'left' | 'right' | null) => void;
  setDraggedType: (
    type: 'bag' | 'item' | 'balloon' | null,
    weightValue?: number,
    variableItem?: { name: string; value: number },
    customItem?: CustomWeightItem
  ) => void;
  setSelectedTool: (tool: 'bag' | 'item' | 'balloon' | null) => void;
  advanceRevealCount: () => void;
  dismissCelebration: () => void;

  // Settings
  setTheme: (theme: ItemThemeId) => void;
  setQuality: (quality: QualityLevel) => void;
  toggleColorMode: () => void;
  toggleSound: () => void;
  toggleTeacherMode: () => void;
  toggleGuidedMode: () => void;
  setCustomEquation: (a: number, b: number, c: number) => void;
  setXValue: (x: number) => void;
  setItemWeight: (weight: number) => void;
  setPanCounts: (side: 'left' | 'right', counts: { bags?: number; items?: number; balloons?: number }) => void;
  autoBalance: () => void;
}

const STORAGE_KEY = 'equation_lab_3d_state_v1';

function loadPersistedData(): {
  stars: Record<number, number>;
  streak: number;
  theme: ItemThemeId;
  quality: QualityLevel;
  colorMode: 'dark' | 'light';
  soundEnabled: boolean;
  teacherMode: boolean;
  guidedMode: boolean;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        stars: parsed.stars || {},
        streak: parsed.streak || 0,
        theme: parsed.theme || 'fruits',
        quality: parsed.quality || 'auto',
        colorMode: parsed.colorMode || 'dark',
        soundEnabled: parsed.soundEnabled ?? false,
        teacherMode: parsed.teacherMode ?? false,
        guidedMode: parsed.guidedMode ?? true,
      };
    }
  } catch {
    // ignore
  }
  return {
    stars: {},
    streak: 0,
    theme: 'fruits',
    quality: 'auto',
    colorMode: 'dark',
    soundEnabled: false,
    teacherMode: false,
    guidedMode: true,
  };
}

function persistData(data: Partial<GameState>) {
  try {
    const prev = loadPersistedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...data }));
  } catch {
    // ignore
  }
}

// Clean Blank Initial Balance (Free experimentation without forced textbook problems)
const blankEquation: EquationState = {
  xValue: 5,
  itemWeight: 1,
  left: { bags: 0, items: 0, balloons: 0 },
  right: { bags: 0, items: 0, balloons: 0 },
};

export const useGameStore = create<GameState>((set, get) => {
  const persisted = loadPersistedData();
  const initialEq = blankEquation;
  const initialBalance = calculateBalance(initialEq);

  return {
    level: 1,
    equation: initialEq,
    initialEquation: initialEq,
    balanceMetrics: initialBalance,
    stepsCount: 0,
    history: [initialEq],
    historyIndex: 0,

    hoveredPan: null,
    draggedType: null,
    selectedTool: null,

    isSolvedCelebration: false,
    revealedItemCount: 0,

    stars: persisted.stars,
    streak: persisted.streak,
    theme: persisted.theme,
    quality: persisted.quality,
    colorMode: persisted.colorMode,
    soundEnabled: persisted.soundEnabled,
    hapticsEnabled: true,
    teacherMode: persisted.teacherMode,
    guidedMode: persisted.guidedMode,

    setLevel: (level: number) => {
      const problem = generateProblem(level);
      const balance = calculateBalance(problem.equation);
      set({
        level,
        equation: problem.equation,
        initialEquation: problem.equation,
        balanceMetrics: balance,
        storyKm: problem.storyKm,
        stepsCount: 0,
        history: [problem.equation],
        historyIndex: 0,
        isSolvedCelebration: false,
        revealedItemCount: 0,
      });
    },

    loadProblem: (targetLevel?: number) => {
      const lvl = targetLevel ?? get().level;
      const problem = generateProblem(lvl);
      const balance = calculateBalance(problem.equation);
      set({
        level: lvl,
        equation: problem.equation,
        initialEquation: problem.equation,
        balanceMetrics: balance,
        storyKm: problem.storyKm,
        stepsCount: 0,
        history: [problem.equation],
        historyIndex: 0,
        isSolvedCelebration: false,
        revealedItemCount: 0,
      });
    },

    nextProblem: () => {
      const currentLevel = get().level;
      const nextLevel = currentLevel >= 6 ? 1 : currentLevel + 1;
      get().loadProblem(nextLevel);
    },

    resetCurrentProblem: () => {
      const initial: EquationState = {
        xValue: 5,
        itemWeight: 1,
        left: { bags: 0, items: 0, balloons: 0 },
        right: { bags: 0, items: 0, balloons: 0 },
      };
      const balance = calculateBalance(initial);
      set({
        equation: initial,
        initialEquation: initial,
        balanceMetrics: balance,
        stepsCount: 0,
        history: [initial],
        historyIndex: 0,
        isSolvedCelebration: false,
        revealedItemCount: 0,
      });
    },

    addToPan: (pan, type, weightValue, variableItem, customItem) => {
      const { equation, history, historyIndex, stepsCount } = get();
      const nextEq = modifyPan(equation, pan, type, 1, weightValue, variableItem, customItem);
      const nextBalance = calculateBalance(nextEq);

      const nextHistory = [...history.slice(0, historyIndex + 1), nextEq];

      let solved = nextBalance.isSolved;
      let streak = get().streak;
      let stars = { ...get().stars };

      if (solved && !get().isSolvedCelebration) {
        streak += 1;
        const currentLevel = get().level;
        const earnedStars = stepsCount <= 3 ? 3 : stepsCount <= 5 ? 2 : 1;
        stars[currentLevel] = Math.max(stars[currentLevel] || 0, earnedStars);
        persistData({ streak, stars });
      }

      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        stepsCount: stepsCount + 1,
        isSolvedCelebration: solved,
        revealedItemCount: 0,
        streak,
        stars,
      });
    },

    removeFromPan: (pan, type, weightValue, variableItem, customItem) => {
      const { equation, history, historyIndex, stepsCount } = get();
      const panObj = equation[pan];
      const count = type === 'bag'
        ? (panObj.bags + (panObj.customVariables?.length || 0))
        : type === 'item'
        ? (panObj.items + (panObj.customWeights?.length || 0))
        : panObj.balloons;
      if (count <= 0) {
        return;
      }
      const nextEq = modifyPan(equation, pan, type, -1, weightValue, variableItem, customItem);
      const nextBalance = calculateBalance(nextEq);
      const nextHistory = [...history.slice(0, historyIndex + 1), nextEq];

      let solved = nextBalance.isSolved;
      let streak = get().streak;
      let stars = { ...get().stars };

      if (solved && !get().isSolvedCelebration) {
        streak += 1;
        const currentLevel = get().level;
        const earnedStars = stepsCount <= 3 ? 3 : stepsCount <= 5 ? 2 : 1;
        stars[currentLevel] = Math.max(stars[currentLevel] || 0, earnedStars);
        persistData({ streak, stars });
      }

      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        stepsCount: stepsCount + 1,
        isSolvedCelebration: solved,
        revealedItemCount: 0,
        streak,
        stars,
      });
    },

    applyOperation: (op, amount) => {
      const { equation, history, historyIndex, stepsCount } = get();
      const nextEq = applyOperationBothSides(equation, op, amount);
      const nextBalance = calculateBalance(nextEq);
      const nextHistory = [...history.slice(0, historyIndex + 1), nextEq];

      let solved = nextBalance.isSolved;
      let streak = get().streak;
      let stars = { ...get().stars };

      if (solved && !get().isSolvedCelebration) {
        streak += 1;
        const currentLevel = get().level;
        const earnedStars = stepsCount <= 3 ? 3 : stepsCount <= 5 ? 2 : 1;
        stars[currentLevel] = Math.max(stars[currentLevel] || 0, earnedStars);
        persistData({ streak, stars });
      }

      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        stepsCount: stepsCount + 1,
        isSolvedCelebration: solved,
        revealedItemCount: 0,
        streak,
        stars,
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        const prevEq = history[prevIndex];
        set({
          historyIndex: prevIndex,
          equation: prevEq,
          balanceMetrics: calculateBalance(prevEq),
          isSolvedCelebration: false,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const nextEq = history[nextIndex];
        set({
          historyIndex: nextIndex,
          equation: nextEq,
          balanceMetrics: calculateBalance(nextEq),
          isSolvedCelebration: false,
        });
      }
    },

    setHoveredPan: (pan) => set({ hoveredPan: pan }),
    setDraggedType: (type, weightValue, variableItem, customItem) =>
      set({ draggedType: type, draggedWeight: weightValue, draggedVariable: variableItem, draggedCustomItem: customItem }),
    setSelectedTool: (tool) => set({ selectedTool: tool }),
    advanceRevealCount: () => set((s) => ({ revealedItemCount: s.revealedItemCount + 1 })),
    dismissCelebration: () => set({ isSolvedCelebration: false }),

    setTheme: (theme) => {
      persistData({ theme });
      set({ theme });
    },

    setQuality: (quality) => {
      persistData({ quality });
      set({ quality });
    },

    toggleColorMode: () => {
      const next = get().colorMode === 'dark' ? 'light' : 'dark';
      persistData({ colorMode: next });
      set({ colorMode: next });
      if (typeof document !== 'undefined') {
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },

    toggleSound: () => {
      const next = !get().soundEnabled;
      persistData({ soundEnabled: next });
      set({ soundEnabled: next });
    },

    toggleTeacherMode: () => {
      const next = !get().teacherMode;
      persistData({ teacherMode: next });
      set({ teacherMode: next });
    },

    toggleGuidedMode: () => {
      const next = !get().guidedMode;
      persistData({ guidedMode: next });
      set({ guidedMode: next });
    },

    setCustomEquation: (a, b, c) => {
      const xVal = a > 0 ? Math.max(1, Math.round((c - b) / a)) : 1;
      const customEq: EquationState = {
        xValue: xVal,
        left: { bags: a, items: b, balloons: 0 },
        right: { bags: 0, items: c, balloons: 0 },
      };
      set({
        equation: customEq,
        initialEquation: customEq,
        balanceMetrics: calculateBalance(customEq),
        stepsCount: 0,
        history: [customEq],
        historyIndex: 0,
        isSolvedCelebration: false,
      });
    },

    setXValue: (x: number) => {
      const { equation, history, historyIndex } = get();
      const nextX = Math.max(1, x);
      const nextEq: EquationState = {
        ...equation,
        xValue: nextX,
      };
      const nextBalance = calculateBalance(nextEq);
      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: [...history.slice(0, historyIndex + 1), nextEq],
        historyIndex: historyIndex + 1,
      });
    },

    setItemWeight: (weight: number) => {
      const { equation, history, historyIndex } = get();
      const nextWeight = Math.max(1, weight);
      const nextEq: EquationState = {
        ...equation,
        itemWeight: nextWeight,
      };
      const nextBalance = calculateBalance(nextEq);
      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: [...history.slice(0, historyIndex + 1), nextEq],
        historyIndex: historyIndex + 1,
      });
    },

    setPanCounts: (side, counts) => {
      const { equation, history, historyIndex } = get();
      const currentPan = equation[side];
      const nextPan = {
        bags: counts.bags !== undefined ? Math.max(0, counts.bags) : currentPan.bags,
        items: counts.items !== undefined ? Math.max(0, counts.items) : currentPan.items,
        balloons: counts.balloons !== undefined ? Math.max(0, counts.balloons) : currentPan.balloons,
      };
      const nextEq: EquationState = {
        ...equation,
        [side]: nextPan,
      };
      const nextBalance = calculateBalance(nextEq);
      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: [...history.slice(0, historyIndex + 1), nextEq],
        historyIndex: historyIndex + 1,
      });
    },

    autoBalance: () => {
      const { equation, history, historyIndex } = get();
      const itemWeight = equation.itemWeight ?? 1;
      const leftWeight = equation.left.bags * equation.xValue + equation.left.items * itemWeight - equation.left.balloons * itemWeight;
      // Auto set right side to balance
      const rightBagsWeight = equation.right.bags * equation.xValue;
      const neededItems = Math.max(0, Math.round((leftWeight - rightBagsWeight) / itemWeight));
      const nextEq: EquationState = {
        ...equation,
        right: {
          ...equation.right,
          items: neededItems,
          balloons: 0,
        },
      };
      const nextBalance = calculateBalance(nextEq);
      set({
        equation: nextEq,
        balanceMetrics: nextBalance,
        history: [...history.slice(0, historyIndex + 1), nextEq],
        historyIndex: historyIndex + 1,
      });
    },
  };
});
