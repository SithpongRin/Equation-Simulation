import React, { useMemo } from 'react';
import { WeightBlock } from './WeightBlock';
import { Item } from './Item';
import type { CustomWeightItem } from '../math/equationModel';
import { getWeightNumericValue } from '../math/equationModel';

interface PanProps {
  bagsCount: number;
  itemsCount: number;
  itemWeight?: number;
  customWeights?: (number | CustomWeightItem)[];
  customVariables?: { name: string; value: number }[];
  balloonsCount?: number;
  isHovered: boolean;
  isSolved?: boolean;
  onPanClick: () => void;
  onRemoveItem: (
    type: 'bag' | 'item' | 'balloon',
    weightVal?: number,
    variableItem?: { name: string; value: number },
    customItem?: CustomWeightItem
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
    const list: (number | CustomWeightItem)[] = [];
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
      {/* ================= TOP-MOUNTED WEIGHING DISH (Matching Vector Reference) ================= */}
      {/* Distinct Raised Top Lip Rim */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[panRadius + 0.04, panRadius + 0.04, 0.04, 48]} />
        <meshStandardMaterial
          color={isHovered ? '#BAE6FD' : '#F1F5F9'}
          roughness={0.2}
          metalness={0.08}
        />
      </mesh>

      {/* Main Shallow Weighing Dish Bowl */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[panRadius, panRadius * 0.88, 0.20, 48]} />
        <meshStandardMaterial
          color={isHovered ? '#E0F2FE' : '#E8EEF5'}
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* Vertical Support Stem Lug */}
      <mesh position={[0, -0.14, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.18, 20]} />
        <meshStandardMaterial color="#1D4E89" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Under-pan round pivot joint facing camera (+Z) */}
      <group position={[0, -0.28, 0]}>
        {/* Outer pivot cylinder ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.16, 28]} />
          <meshStandardMaterial color="#1D4E89" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Inner white axle pin */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 20]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.15} />
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

      {/* Ghibli Metal Weights or 3D Fruits on this pan */}
      {itemPositions.map((pos, idx) => {
        const curItem = allWeights[idx] ?? itemWeight;
        const numVal = getWeightNumericValue(curItem);
        const isFruit = typeof curItem === 'object' && curItem.fruitType;

        if (isFruit && typeof curItem === 'object') {
          const fruitIdx = curItem.fruitType === 'apple' ? 0 : curItem.fruitType === 'banana' ? 2 : 1;
          const handleRemove = (e: any) => {
            e.stopPropagation();
            onRemoveItem('item', numVal, undefined, curItem);
          };

          return (
            <group
              key={`fruit-${idx}`}
              position={pos}
              onClick={handleRemove}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* Invisible clickable hit mesh for 100% reliable raycast click & removal */}
              <mesh
                position={[0, 0.35, 0]}
                onClick={handleRemove}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <Item position={[0, 0.1, 0]} variantIndex={fruitIdx} scale={2.6} onClick={() => onRemoveItem('item', numVal, undefined, curItem)} />
            </group>
          );
        }

        return (
          <WeightBlock
            key={`weight-${idx}`}
            position={pos}
            weight={numVal}
            label={`${numVal}kg`}
            isUnknown={false}
            onClick={() => onRemoveItem('item', numVal, undefined, typeof curItem === 'object' ? curItem : undefined)}
          />
        );
      })}
    </group>
  );
};
