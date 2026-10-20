import type { EquationState } from './equationModel';

export interface ProblemSpec {
  level: number;
  equation: EquationState;
  storyKm?: string;
  storyEn?: string;
  hintStepsKm: string[];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateProblem(level: number): ProblemSpec {
  switch (level) {
    case 1: {
      // Level 1: ax = c (e.g. 3x = 12, so x = 4)
      const a = randInt(2, 4);
      const x = randInt(2, 6);
      const c = a * x;

      return {
        level: 1,
        equation: {
          xValue: x,
          left: { bags: a, items: 0, balloons: 0 },
          right: { bags: 0, items: c, balloons: 0 },
        },
        hintStepsKm: [
          `ខាងឆ្វេងមានថង់ x ចំនួន ${a} និងខាងស្តាំមានផ្លែឈើ ${c}។ ចែកទាំងសងខាងនឹង ${a} ដើម្បីរកតម្លៃ ១ ថង់!`,
        ],
      };
    }

    case 2: {
      // Level 2: x + b = c (e.g. x + 3 = 8, so x = 5)
      const b = randInt(2, 6);
      const x = randInt(2, 7);
      const c = x + b;

      return {
        level: 2,
        equation: {
          xValue: x,
          left: { bags: 1, items: b, balloons: 0 },
          right: { bags: 0, items: c, balloons: 0 },
        },
        hintStepsKm: [
          `ដកផ្លែឈើ ${b} ចេញពីសងខាង ដើម្បីទុកថង់ x នៅតែឯង!`,
        ],
      };
    }

    case 3: {
      // Level 3: ax + b = c (e.g. 2x + 3 = 11, so 2x = 8, x = 4)
      const a = randInt(2, 3);
      const x = randInt(2, 5);
      const b = randInt(2, 5);
      const c = a * x + b;

      return {
        level: 3,
        equation: {
          xValue: x,
          left: { bags: a, items: b, balloons: 0 },
          right: { bags: 0, items: c, balloons: 0 },
        },
        hintStepsKm: [
          `ជំហានទី ១: ដកផ្លែឈើ ${b} ចេញពីសងខាង។`,
          `ជំហានទី ២: ចែកទាំងសងខាងនឹង ${a} ដើម្បីរកតម្លៃ x!`,
        ],
      };
    }

    case 4: {
      // Level 4: ax + b = cx + d (bags on both sides)
      const cCoeff = randInt(1, 2);
      const aCoeff = cCoeff + randInt(1, 2); // a > c
      const x = randInt(2, 5);
      const b = randInt(1, 4);
      const d = (aCoeff - cCoeff) * x + b;

      return {
        level: 4,
        equation: {
          xValue: x,
          left: { bags: aCoeff, items: b, balloons: 0 },
          right: { bags: cCoeff, items: d, balloons: 0 },
        },
        hintStepsKm: [
          `ដកថង់ x ចំនួន ${cCoeff} ចេញពីសងខាងសិន!`,
          `បន្ទាប់មកដកផ្លែឈើ ${b} ចេញពីសងខាង។`,
        ],
      };
    }

    case 5: {
      // Level 5: negatives with balloons: x - b = c
      const b = randInt(2, 5);
      const x = randInt(5, 10);
      const c = x - b;

      return {
        level: 5,
        equation: {
          xValue: x,
          left: { bags: 1, items: 0, balloons: b },
          right: { bags: 0, items: c, balloons: 0 },
        },
        hintStepsKm: [
          `ខាងឆ្វេងមានប៉េងប៉ោង ${b} (ដក ${b})។ ថែមផ្លែឈើ ${b} ទៅសងខាងដើម្បីបន្សាបវា!`,
        ],
      };
    }

    case 6:
    default: {
      // Level 6: word problems with story picture
      const x = randInt(3, 6);
      const extra = randInt(2, 5);
      const total = x + extra;

      return {
        level: 6,
        equation: {
          xValue: x,
          left: { bags: 1, items: extra, balloons: 0 },
          right: { bags: 0, items: total, balloons: 0 },
        },
        storyKm: `តារា មានផ្លែស្វាយ ១ ថង់អាថ៌កំបាំង និងផ្លែស្វាយបន្ថែមចំនួន ${extra} ផ្លែ។ សរុបទម្ងន់ស្មើនឹងផ្លែស្វាយ ${total} ផ្លែនៅលើថាសស្តាំ។ តើក្នុងថង់មានស្វាយប៉ុន្មានផ្លែ?`,
        storyEn: `Dara has 1 mystery bag and ${extra} extra mangoes. The total weight balances ${total} mangoes on the right. How many mangoes in the bag?`,
        hintStepsKm: [
          `ដកផ្លែស្វាយ ${extra} ចេញពីសងខាងដើម្បីដឹងចំនួនក្នុងថង់!`,
        ],
      };
    }
  }
}
