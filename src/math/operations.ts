import type { EquationState, PanState } from './equationModel';
import { calculateBalance } from './equationModel';

export type PanTarget = 'left' | 'right' | 'both';

export interface EquationStep {
  equation: EquationState;
  descriptionKm: string;
}

/**
 * Add or remove objects directly (e.g. from user drag and drop)
 */
export function modifyPan(
  state: EquationState,
  target: 'left' | 'right',
  type: 'bag' | 'item' | 'balloon',
  delta: number,
  itemWeightValue?: number,
  variableItem?: { name: string; value: number }
): EquationState {
  const customWeights = [...(state[target].customWeights || [])];
  const customVariables = [...(state[target].customVariables || [])];
  const pan: PanState = { 
    ...state[target],
    customWeights,
    customVariables,
  };

  if (type === 'bag') {
    if (variableItem && variableItem.name.toLowerCase() !== 'x') {
      if (delta > 0) {
        customVariables.push({ name: variableItem.name, value: variableItem.value });
      } else {
        const idx = customVariables.findLastIndex((v) => v.name === variableItem.name);
        if (idx >= 0) {
          customVariables.splice(idx, 1);
        } else if (pan.bags > 0) {
          pan.bags = Math.max(0, pan.bags + delta);
        }
      }
    } else {
      if (delta < 0 && pan.bags === 0 && customVariables.length > 0) {
        customVariables.pop();
      } else {
        pan.bags = Math.max(0, pan.bags + delta);
      }
    }
  } else if (type === 'item') {
    if (itemWeightValue !== undefined && itemWeightValue !== (state.itemWeight ?? 1)) {
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          customWeights.push(itemWeightValue);
        }
      } else {
        // remove last matching or last custom weight
        const idx = customWeights.lastIndexOf(itemWeightValue);
        if (idx >= 0) {
          customWeights.splice(idx, 1);
        } else if (customWeights.length > 0) {
          customWeights.pop();
        } else {
          pan.items = Math.max(0, pan.items + delta);
        }
      }
    } else {
      if (delta < 0 && pan.items === 0 && customWeights.length > 0) {
        customWeights.pop();
      } else {
        pan.items = Math.max(0, pan.items + delta);
      }
    }
  } else if (type === 'balloon') {
    pan.balloons = Math.max(0, pan.balloons + delta);
  }

  return {
    ...state,
    [target]: pan,
  };
}

/**
 * Perform symmetric mathematical operation on both sides
 */
export function applyOperationBothSides(
  state: EquationState,
  op: 'addItems' | 'subItems' | 'divide' | 'subBags',
  amount: number
): EquationState {
  const next: EquationState = {
    xValue: state.xValue,
    left: { ...state.left },
    right: { ...state.right },
  };

  if (op === 'addItems') {
    next.left.items += amount;
    next.right.items += amount;
  } else if (op === 'subItems') {
    next.left.items = Math.max(0, next.left.items - amount);
    next.right.items = Math.max(0, next.right.items - amount);
  } else if (op === 'subBags') {
    next.left.bags = Math.max(0, next.left.bags - amount);
    next.right.bags = Math.max(0, next.right.bags - amount);
  } else if (op === 'divide') {
    if (amount > 0 && next.left.bags % amount === 0 && next.left.items % amount === 0 &&
        next.right.bags % amount === 0 && next.right.items % amount === 0) {
      next.left.bags /= amount;
      next.left.items /= amount;
      next.right.bags /= amount;
      next.right.items /= amount;
    }
  }

  return next;
}

/**
 * Generate next optimal hint step for guided mode
 */
export function getNextSuggestedStep(state: EquationState): {
  type: 'subBags' | 'subItems' | 'divide' | 'addItems' | 'done';
  amount: number;
  messageKm: string;
} {
  const balance = calculateBalance(state);
  if (balance.isSolved) {
    return { type: 'done', amount: 0, messageKm: 'សមីការត្រូវបានដោះស្រាយរួចរាល់ហើយ!' };
  }

  // 1. If bags on both sides, remove the smaller number of bags
  if (state.left.bags > 0 && state.right.bags > 0) {
    const minBags = Math.min(state.left.bags, state.right.bags);
    return {
      type: 'subBags',
      amount: minBags,
      messageKm: `ដកថង់ x ចំនួន ${minBags} ចេញពីសងខាង។`,
    };
  }

  // 2. If bags are on left side and left side has items, subtract those items from both sides
  if (state.left.bags > 0 && state.left.items > 0) {
    const itemsToRemove = Math.min(state.left.items, state.right.items);
    if (itemsToRemove > 0) {
      return {
        type: 'subItems',
        amount: itemsToRemove,
        messageKm: `ដកផ្លែឈើ ${itemsToRemove} ចេញពីសងខាង ដើម្បីទុកថង់ x នៅតែឯង។`,
      };
    }
  }

  // 3. If bags are on right side and right side has items, subtract those items from both sides
  if (state.right.bags > 0 && state.right.items > 0) {
    const itemsToRemove = Math.min(state.right.items, state.left.items);
    if (itemsToRemove > 0) {
      return {
        type: 'subItems',
        amount: itemsToRemove,
        messageKm: `ដកផ្លែឈើ ${itemsToRemove} ចេញពីសងខាង។`,
      };
    }
  }

  // 4. If bags > 1 and no extra items on that side, divide by bags count
  const bags = state.left.bags > 0 ? state.left.bags : state.right.bags;
  if (bags > 1) {
    return {
      type: 'divide',
      amount: bags,
      messageKm: `ចែកទាំងសងខាងនឹង ${bags} ដើម្បីរកតម្លៃ x ក្នុង ១ ថង់!`,
    };
  }

  // 5. Balloons cancellation
  if (state.left.balloons > 0) {
    return {
      type: 'addItems',
      amount: state.left.balloons,
      messageKm: `ថែមផ្លែឈើ ${state.left.balloons} ទៅសងខាងដើម្បីបន្សាបប៉េងប៉ោង។`,
    };
  }

  return {
    type: 'done',
    amount: 0,
    messageKm: 'រកឃើញតម្លៃ x = ' + state.xValue,
  };
}
