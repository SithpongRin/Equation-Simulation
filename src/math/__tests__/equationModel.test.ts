import { describe, it, expect } from 'vitest';
import {
  calculatePanWeight,
  calculateBalance,
  formatSideExpression,
  formatEquationString,
} from '../equationModel';
import type { EquationState } from '../equationModel';
import { generateProblem } from '../problemGenerator';
import { modifyPan, applyOperationBothSides, getNextSuggestedStep } from '../operations';

describe('equationModel', () => {
  it('calculates pan weight correctly with bags, items, and balloons', () => {
    // 2 bags with x=4, 3 items, 1 balloon: 2*4 + 3 - 1 = 10
    const weight = calculatePanWeight({ bags: 2, items: 3, balloons: 1 }, 4);
    expect(weight).toBe(10);
  });

  it('determines balanced state correctly', () => {
    const eq: EquationState = {
      xValue: 5,
      left: { bags: 2, items: 2, balloons: 0 },   // 2*5 + 2 = 12
      right: { bags: 0, items: 12, balloons: 0 }, // 12
    };
    const balance = calculateBalance(eq);
    expect(balance.isBalanced).toBe(true);
    expect(balance.difference).toBe(0);
    expect(balance.angleRad).toBe(0);
    expect(balance.isSolved).toBe(false); // not yet isolated to 1x
  });

  it('detects solved state when x is isolated on one side', () => {
    const eq: EquationState = {
      xValue: 4,
      left: { bags: 1, items: 0, balloons: 0 },
      right: { bags: 0, items: 4, balloons: 0 },
    };
    const balance = calculateBalance(eq);
    expect(balance.isBalanced).toBe(true);
    expect(balance.isSolved).toBe(true);
    expect(balance.isolatedSide).toBe('left');
  });

  it('clamps beam tilt angle properly when weights are unbalanced', () => {
    const eq: EquationState = {
      xValue: 4,
      left: { bags: 5, items: 20, balloons: 0 }, // 40
      right: { bags: 0, items: 2, balloons: 0 },  // 2
    };
    const balance = calculateBalance(eq);
    expect(balance.difference).toBe(38);
    expect(balance.angleRad).toBe(0.28); // clamped to MAX_ANGLE
  });

  it('formats algebraic expressions accurately', () => {
    expect(formatSideExpression({ bags: 2, items: 3, balloons: 0 })).toBe('2x + 3');
    expect(formatSideExpression({ bags: 1, items: 0, balloons: 0 })).toBe('x');
    expect(formatSideExpression({ bags: 0, items: 5, balloons: 0 })).toBe('5');
    expect(formatSideExpression({ bags: 1, items: 0, balloons: 2 })).toBe('x - 2');
    expect(formatSideExpression({ bags: 0, items: 0, balloons: 0 })).toBe('0');
  });

  it('formats full equation string', () => {
    const eq: EquationState = {
      xValue: 3,
      left: { bags: 2, items: 4, balloons: 0 },
      right: { bags: 0, items: 10, balloons: 0 },
    };
    expect(formatEquationString(eq)).toBe('2x + 4 = 10');
  });
});

describe('problemGenerator', () => {
  it('generates valid integer problems for all levels', () => {
    for (let lvl = 1; lvl <= 6; lvl++) {
      const prob = generateProblem(lvl);
      expect(prob.equation.xValue).toBeGreaterThanOrEqual(1);
      expect(prob.equation.xValue).toBeLessThanOrEqual(12);
      
      const balance = calculateBalance(prob.equation);
      expect(balance.isBalanced).toBe(true);
    }
  });
});

describe('operations', () => {
  it('modifies pan items correctly', () => {
    const eq: EquationState = {
      xValue: 4,
      left: { bags: 1, items: 2, balloons: 0 },
      right: { bags: 0, items: 6, balloons: 0 },
    };
    const updated = modifyPan(eq, 'left', 'item', 1);
    expect(updated.left.items).toBe(3);
  });

  it('applies symmetric operations to both sides', () => {
    const eq: EquationState = {
      xValue: 4,
      left: { bags: 1, items: 2, balloons: 0 },
      right: { bags: 0, items: 6, balloons: 0 },
    };
    const updated = applyOperationBothSides(eq, 'subItems', 2);
    expect(updated.left.items).toBe(0);
    expect(updated.right.items).toBe(4);
    
    const balance = calculateBalance(updated);
    expect(balance.isSolved).toBe(true);
  });

  it('suggests optimal next step in guided mode', () => {
    // 2x + 3 = 11: first step is subtract 3 items
    const eq: EquationState = {
      xValue: 4,
      left: { bags: 2, items: 3, balloons: 0 },
      right: { bags: 0, items: 11, balloons: 0 },
    };
    const hint = getNextSuggestedStep(eq);
    expect(hint.type).toBe('subItems');
    expect(hint.amount).toBe(3);
  });
});
