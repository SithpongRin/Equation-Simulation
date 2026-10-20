import React, { useMemo } from 'react';
import { WeightBlock } from './WeightBlock';

interface PanProps {
  bagsCount: number;
  itemsCount: number;
  itemWeight?: number;
  customWeights?: number[];
  customVariables?: { name: string; value: number }[];
  balloonsCount?: number;
  isHovered: boolean;
  isSolved?: boolean;
  onPanClick: () => void;
  onRemoveItem: (
    type: 'bag' | 'item' | 'balloon',
    weightVal?: number,
    variableItem?: { name: string; value: number }
  ) => void;
}

export const Pan: React.FC<PanProps> = ({
  bagsCount,
  itemsCount,
  itemWeight = 1,
  customWeights = [],
  customVariables = [],
  isHovered,
  onPanClick,
  onRemoveItem,
}) => {
  const panRadius = 1.35;
  const panDepth = 0.12;
  const surfaceY = 0.08 + panDepth / 2; // Exact top surface of the plate: 0.14

  // Combine default bags (x) and custom variables (y, z, etc.)
  const allVariables = useMemo(() => {
    const list: { name: string; value: number }[] = [];
    for (let i = 0; i < bagsCount; i++) {
      list.push({ name: 'x', value: 1 });
    }
    for (const v of customVariables) {
      list.push(v);
    }
    return list;
  }, [bagsCount, customVariables]);

  const totalVariablesCount = allVariables.length;

  // Combine default weights and customWeights array
  const allWeights = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < itemsCount; i++) {
      list.push(itemWeight);
    }
    for (const w of customWeights) {
      list.push(w);
    }
    return list;
  }, [itemsCount, itemWeight, customWeights]);

  const totalWeightsCount = allWeights.length;

  // Staggered layout for mystery boxes (x, y) and weights (+kg)
  const { bagPositions, itemPositions } = useMemo(() => {
    const bags: [number, number, number][] = [];
    const items: [number, number, number][] = [];

    // If both boxes and weights are on the pan, place boxes on the left/front and weights on the right/back
    if (totalVariablesCount > 0 && totalWeightsCount > 0) {
      // Place boxes on left side (X < 0)
      if (totalVariablesCount === 1) {
        bags.push([-0.42, surfaceY, 0]);
      } else {
        for (let i = 0; i < totalVariablesCount; i++) {
          const z = (i - (totalVariablesCount - 1) / 2) * 0.45;
          bags.push([-0.44, surfaceY, z]);
        }
      }

      // Place weights on right side (X > 0)
      if (totalWeightsCount === 1) {
        items.push([0.42, surfaceY, 0]);
      } else {
        const cols = totalWeightsCount > 4 ? 2 : 1;
        for (let i = 0; i < totalWeightsCount; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const totalRows = Math.ceil(totalWeightsCount / cols);
          const x = 0.28 + col * 0.45;
          const z = (row - (totalRows - 1) / 2) * 0.45;
          items.push([x, surfaceY, z]);
        }
      }

      return { bagPositions: bags, itemPositions: items };
    }

    // Only bags
    if (totalVariablesCount === 1) {
      bags.push([0, surfaceY, 0]);
    } else if (totalVariablesCount === 2) {
      bags.push([-0.44, surfaceY, 0], [0.44, surfaceY, 0]);
    } else if (totalVariablesCount === 3) {
      bags.push([-0.48, surfaceY, -0.2], [0, surfaceY, 0.26], [0.48, surfaceY, -0.2]);
    } else {
      const step = 1.2 / Math.max(1, totalVariablesCount - 1);
      for (let i = 0; i < totalVariablesCount; i++) {
        const x = -0.6 + i * step;
        const z = (i % 2 === 0 ? -0.18 : 0.2);
        bags.push([x, surfaceY, z]);
      }
    }

    // Only weights
    if (totalWeightsCount > 0) {
      if (totalWeightsCount === 1) {
        items.push([0, surfaceY, 0]);
      } else {
        const cols = totalWeightsCount > 12 ? 4 : totalWeightsCount > 6 ? 3 : totalWeightsCount > 2 ? 3 : 2;
        for (let i = 0; i < totalWeightsCount; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const totalRows = Math.ceil(totalWeightsCount / cols);
          const x = (col - (cols - 1) / 2) * 0.52;
          const z = (row - (totalRows - 1) / 2) * 0.48;
          items.push([x, surfaceY, z]);
        }
      }
    }

    return { bagPositions: bags, itemPositions: items };
  }, [totalVariablesCount, totalWeightsCount, surfaceY]);

  return (
    <group onClick={(e) => {
      e.stopPropagation();
      onPanClick();
    }}>
      {/* ================= TOP-MOUNTED PAN DISH (Clean Flat White Plate) ================= */}
      {/* Upper flat tray disc */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[panRadius, panRadius * 0.94, panDepth, 48]} />
        <meshStandardMaterial
          color={isHovered ? '#E0F2FE' : '#E8EEF5'}
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* Under-pan support connector bracket */}
      <mesh position={[0, -0.12, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.16, 24]} />
        <meshStandardMaterial
          color="#1D4E89"
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* Under-pan round pivot joint / hinge connecting to beam */}
      <group position={[0, -0.28, 0]}>
        {/* Outer pivot cylinder ring */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.18, 24]} />
          <meshStandardMaterial color="#1D4E89" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Inner white pivot core */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.19, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.2} />
        </mesh>
      </group>

      {/* Ghibli Mystery Boxes (x, y, etc.) on this pan */}
      {bagPositions.map((pos, idx) => {
        const curVar = allVariables[idx] || { name: 'x', value: 1 };
        return (
          <WeightBlock
            key={`box-${idx}`}
            position={pos}
            weight={curVar.value}
            label={curVar.name}
            isUnknown={true}
            onClick={() => onRemoveItem('bag', curVar.value, curVar)}
          />
        );
      })}

      {/* Ghibli Metal Weights on this pan */}
      {itemPositions.map((pos, idx) => {
        const curWeight = allWeights[idx] ?? itemWeight;
        return (
          <WeightBlock
            key={`weight-${idx}`}
            position={pos}
            weight={curWeight}
            label={`${curWeight}kg`}
            isUnknown={false}
            onClick={() => onRemoveItem('item', curWeight)}
          />
        );
      })}
    </group>
  );
};
