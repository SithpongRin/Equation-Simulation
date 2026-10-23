import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WeightBlock } from './WeightBlock';
import { Item } from './Item';
import { ANTIQUE } from '../theme';
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

  const materials = useMemo(
    () => ({
      brass: new THREE.MeshStandardMaterial({
        color: ANTIQUE.brass,
        metalness: 0.95,
        roughness: 0.24,
      }),
      brassBright: new THREE.MeshStandardMaterial({
        color: ANTIQUE.brassBright,
        metalness: 0.98,
        roughness: 0.16,
      }),
      brassDark: new THREE.MeshStandardMaterial({
        color: ANTIQUE.brassDark,
        metalness: 0.92,
        roughness: 0.38,
      }),
    }),
    []
  );

  // Concave dish profile (radius, height) revolved around Y
  const dishGeometry = useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const profile = [
      p(0, 0.03),
      p(0.55, 0.03),
      p(1.05, 0.085),
      p(1.28, 0.17),
      p(panRadius + 0.02, 0.245),
      p(panRadius - 0.02, 0.25),
      p(1.24, 0.19),
      p(1.12, surfaceY),
      p(0, surfaceY),
    ];
    return new THREE.LatheGeometry(profile, 72);
  }, [panRadius, surfaceY]);

  // Turned stem from beam pivot (y=0) up to the dish underside
  const stemGeometry = useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const profile = [
      p(0, 0),
      p(0.055, 0),
      p(0.055, 0.14),
      p(0.085, 0.16),
      p(0.085, 0.185),
      p(0.05, 0.205),
      p(0.04, 0.26),
      p(0.08, 0.3),
      p(0.28, 0.34),
      p(0.28, 0.355),
      p(0, 0.355),
    ];
    return new THREE.LatheGeometry(profile, 40);
  }, []);

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
      {/* ================= ANTIQUE BRASS WEIGHING DISH ================= */}
      {/* Concave lathe-turned dish: flat floor at surfaceY, sloped wall, rolled rim */}
      <mesh geometry={dishGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={isHovered ? ANTIQUE.brassBright : ANTIQUE.brass}
          metalness={0.96}
          roughness={0.24}
          emissive={isHovered ? '#FDE68A' : '#000000'}
          emissiveIntensity={isHovered ? 0.35 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Spun brass concentric decorative rings inside the pan floor */}
      <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.44, 48]} />
        <meshStandardMaterial color={ANTIQUE.brassBright} metalness={0.98} roughness={0.18} />
      </mesh>
      <mesh position={[0, surfaceY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 0.84, 48]} />
        <meshStandardMaterial color={ANTIQUE.brassDark} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* Rolled rim bead */}
      <mesh position={[0, 0.255, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[panRadius + 0.02, 0.025, 12, 72]} />
        <meshStandardMaterial
          color={isHovered ? ANTIQUE.brassBright : ANTIQUE.brassDark}
          metalness={0.98}
          roughness={0.25}
          emissive={isHovered ? '#FDE68A' : '#000000'}
          emissiveIntensity={isHovered ? 0.4 : 0}
        />
      </mesh>

      {/* Cast-Brass Trunnion Support Cradle beneath the dish (curves DOWNWARD to cradle the dish from below) */}
      <group position={[0, -0.02, 0]}>
        <mesh rotation={[Math.PI, 0, 0]} material={materials.brass} castShadow>
          <torusGeometry args={[0.58, 0.024, 10, 36, Math.PI]} />
        </mesh>
        <mesh rotation={[Math.PI, Math.PI / 2, 0]} material={materials.brass} castShadow>
          <torusGeometry args={[0.58, 0.024, 10, 36, Math.PI]} />
        </mesh>
        {/* Support hub connector */}
        <mesh position={[0, -0.16, 0]} material={materials.brassBright} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.12, 20]} />
        </mesh>
      </group>

      {/* Turned brass stem down to the beam pivot */}
      <mesh geometry={stemGeometry} position={[0, -0.32, 0]} castShadow>
        <meshStandardMaterial color={ANTIQUE.brass} metalness={0.95} roughness={0.28} />
      </mesh>

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
