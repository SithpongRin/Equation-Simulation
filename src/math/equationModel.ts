export interface CustomVariableItem {
  id?: string;
  name: string; // e.g. "x", "y", "a"
  value: number; // numeric value (kg)
}

export interface PanState {
  bags: number;     // number of 'x' mystery bags
  items: number;    // number of positive single items
  balloons: number; // number of helium balloons
  customWeights?: number[]; // list of individual weight values on this pan, e.g. [2, 3, 4]
  customVariables?: CustomVariableItem[]; // list of variables on this pan, e.g. [{name: "y", value: 3}]
}

export interface EquationState {
  xValue: number;          // value of mystery bag x (e.g. 4)
  itemWeight?: number;     // default weight of single item (default 1)
  left: PanState;
  right: PanState;
}

export interface BalanceMetrics {
  leftWeight: number;
  rightWeight: number;
  difference: number;      // leftWeight - rightWeight
  isBalanced: boolean;
  angleRad: number;        // target beam tilt angle in radians
  isSolved: boolean;       // whether x is isolated on one side
  isolatedSide: 'left' | 'right' | null;
}

/**
 * Calculate the effective weight of a pan given the xValue and itemWeight
 */
export function calculatePanWeight(pan: PanState, xValue: number, itemWeight: number = 1): number {
  let customSum = 0;
  if (pan.customWeights && pan.customWeights.length > 0) {
    customSum = pan.customWeights.reduce((a, b) => a + b, 0);
  }
  let varSum = pan.bags * xValue;
  if (pan.customVariables && pan.customVariables.length > 0) {
    varSum += pan.customVariables.reduce((a, b) => a + b.value, 0);
  }
  return varSum + pan.items * itemWeight + customSum - pan.balloons * itemWeight;
}

/**
 * Calculate balance physics metrics & solved status
 * Beam tilt angle is clamped between -0.28 rad (-16 deg) and +0.28 rad (+16 deg)
 */
export function calculateBalance(state: EquationState): BalanceMetrics {
  const itemWeight = state.itemWeight ?? 1;
  const leftWeight = calculatePanWeight(state.left, state.xValue, itemWeight);
  const rightWeight = calculatePanWeight(state.right, state.xValue, itemWeight);
  const difference = leftWeight - rightWeight;
  const isBalanced = difference === 0;

  // Maximum tilt angle (about 16 degrees)
  const MAX_ANGLE = 0.28;
  // Angle sensitivity constant k
  const K = 0.055;
  const rawAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, difference * K));

  // Check solved status:
  // Is x isolated? Left: bags=1, items=0, balloons=0, Right: bags=0, balloons=0, items * itemWeight = xValue (or vice versa)
  let isSolved = false;
  let isolatedSide: 'left' | 'right' | null = null;

  if (isBalanced) {
    const leftCustom = (state.left.customWeights || []).reduce((a, b) => a + b, 0);
    const rightCustom = (state.right.customWeights || []).reduce((a, b) => a + b, 0);
    const leftTotalItems = state.left.items * itemWeight + leftCustom;
    const rightTotalItems = state.right.items * itemWeight + rightCustom;

    if (state.left.bags === 1 && leftTotalItems === 0 && state.left.balloons === 0 &&
        state.right.bags === 0 && state.right.balloons === 0 && rightTotalItems === state.xValue) {
      isSolved = true;
      isolatedSide = 'left';
    } else if (state.right.bags === 1 && rightTotalItems === 0 && state.right.balloons === 0 &&
               state.left.bags === 0 && state.left.balloons === 0 && leftTotalItems === state.xValue) {
      isSolved = true;
      isolatedSide = 'right';
    }
  }

  return {
    leftWeight,
    rightWeight,
    difference,
    isBalanced,
    angleRad: rawAngle,
    isSolved,
    isolatedSide,
  };
}

/**
 * Format a side into an algebraic expression string, e.g. "2x + 4" or "- 3" or "0"
 */
export function formatSideExpression(pan: PanState, itemWeight: number = 1): string {
  const parts: string[] = [];

  if (pan.bags > 0) {
    parts.push(pan.bags === 1 ? 'x' : `${pan.bags}x`);
  }

  if (pan.customVariables && pan.customVariables.length > 0) {
    // Group variables by name, e.g. "y", "2y"
    const varCounts: Record<string, number> = {};
    for (const cv of pan.customVariables) {
      varCounts[cv.name] = (varCounts[cv.name] || 0) + 1;
    }
    for (const [name, count] of Object.entries(varCounts)) {
      parts.push(count === 1 ? name : `${count}${name}`);
    }
  }

  const customSum = (pan.customWeights || []).reduce((a, b) => a + b, 0);
  const totalItemVal = pan.items * itemWeight + customSum;

  if (totalItemVal > 0) {
    if (parts.length > 0) {
      parts.push(`+ ${totalItemVal}`);
    } else {
      parts.push(`${totalItemVal}`);
    }
  }

  if (pan.balloons > 0) {
    const val = pan.balloons * itemWeight;
    parts.push(`- ${val}`);
  }

  if (parts.length === 0) {
    return '0';
  }

  return parts.join(' ');
}

/**
 * Formats full symbolic equation: e.g. "2x + 4 = 10" or "3x = 12"
 */
export function formatEquationString(state: EquationState): string {
  const itemWeight = state.itemWeight ?? 1;
  const leftStr = formatSideExpression(state.left, itemWeight);
  const rightStr = formatSideExpression(state.right, itemWeight);
  return `${leftStr} = ${rightStr}`;
}
