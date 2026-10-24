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
  isSolved = false,
  onPanClick,
  onRemoveItem,
}) => {
  const panRadius = 1.38;
  const panDepth = 0.12;
  const surfaceY = 0.08 + panDepth / 2; // Exact top surface of the plate: 0.14

  const materials = useMemo(
    () => ({
      brass: new THREE.MeshPhysicalMaterial({
        color: ANTIQUE.brass,
        metalness: 0.86,
        roughness: 0.22,
        clearcoat: 0.55,
        clearcoatRoughness: 0.18,
      }),
      brassBright: new THREE.MeshPhysicalMaterial({
        color: ANTIQUE.brassBright,
        metalness: 0.90,
        roughness: 0.15,
        clearcoat: 0.7,
        clearcoatRoughness: 0.12,
      }),
      brassDark: new THREE.MeshStandardMaterial({
        color: ANTIQUE.brassDark,
        metalness: 0.85,
        roughness: 0.34,
      }),
      steel: new THREE.MeshStandardMaterial({
        color: ANTIQUE.steel,
        metalness: 0.92,
        roughness: 0.18,
      }),
    }),
    []
  );

  // Concave dish profile (radius, height) revolved around Y
  const dishGeometry = useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const profile = [
      p(0, 0.03),
      p(0.62, 0.03),
      p(1.08, 0.08),
      p(1.30, 0.165),
      p(panRadius + 0.02, 0.245),
      p(panRadius - 0.02, 0.252),
      p(1.26, 0.185),
      p(1.14, surfaceY),
      p(0, surfaceY),
    ];
    return new THREE.LatheGeometry(profile, 72);
  }, [panRadius, surfaceY]);

  // Turned upper stem from beam pivot (y=0 in parent, y=-0.32 in Pan) up to the dish underside
  const stemGeometry = useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const profile = [
      // Lower acorn finial below stay-bar pivot (y = -0.38 relative to stem base)
      p(0, -0.38),
      p(0.022, -0.36),
      p(0.042, -0.33),
      p(0.028, -0.30),
      // Stay-bar bearing boss (y = -0.28)
      p(0.052, -0.29),
      p(0.052, -0.26),
      // Slender turned shaft between lower stay-bar and main beam pivot
      p(0.032, -0.24),
      p(0.028, -0.14),
      p(0.045, -0.12),
      p(0.028, -0.10),
      p(0.035, -0.02),
      // Main beam pivot collar (y = 0)
      p(0.062, 0),
      p(0.062, 0.12),
      p(0.092, 0.15),
      p(0.092, 0.18),
      p(0.054, 0.205),
      p(0.046, 0.255),
      p(0.095, 0.30),
      p(0.32, 0.34),
      p(0.32, 0.355),
      p(0, 0.355),
    ];
    return new THREE.LatheGeometry(profile, 44);
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
      if (totalVariablesCount === 1) {
        bags.push([-0.42, surfaceY, 0]);
      } else {
        for (let i = 0; i < totalVariablesCount; i++) {
          const z = (i - (totalVariablesCount - 1) / 2) * 0.45;
          bags.push([-0.44, surfaceY, z]);
        }
      }

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
        const z = i % 2 === 0 ? -0.18 : 0.2;
        bags.push([x, surfaceY, z]);
      }
    }

    // Only weights
    if (totalWeightsCount > 0) {
      if (totalWeightsCount === 1) {
        items.push([0, surfaceY, 0]);
      } else {
        const cols =
          totalWeightsCount > 12 ? 4 : totalWeightsCount > 6 ? 3 : totalWeightsCount > 2 ? 3 : 2;
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
    <group
      onClick={(e) => {
        e.stopPropagation();
        onPanClick();
      }}
    >
      {/* ================= ANTIQUE BRASS WEIGHING DISH ================= */}
      {/* Concave lathe-turned dish: flat floor at surfaceY, sloped wall, rolled rim */}
      <mesh geometry={dishGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={isHovered ? ANTIQUE.goldHighlight : ANTIQUE.brass}
          metalness={0.86}
          roughness={0.20}
          clearcoat={0.65}
          clearcoatRoughness={0.14}
          emissive={isHovered ? '#FDE68A' : '#000000'}
          emissiveIntensity={isHovered ? 0.35 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Recessed Warm Ivory / Champagne Inner Weighing Pad for high contrast with blocks */}
      <mesh position={[0, surfaceY + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.08, 64]} />
        <meshStandardMaterial
          color={isHovered ? '#FEF3C7' : '#F5E6C8'}
          roughness={0.42}
          metalness={0.15}
        />
      </mesh>

      {/* Spun brass concentric precision calibration rings inside the pan floor */}
      <mesh position={[0, surfaceY + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.24, 48]} />
        <meshStandardMaterial color={ANTIQUE.brassDark} metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh position={[0, surfaceY + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.58, 0.605, 64]} />
        <meshStandardMaterial color={ANTIQUE.brass} metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh position={[0, surfaceY + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.09, 64]} />
        <meshStandardMaterial
          color={isSolved ? ANTIQUE.emerald : ANTIQUE.brassDark}
          emissive={isSolved ? ANTIQUE.emerald : '#000000'}
          emissiveIntensity={isSolved ? 0.6 : 0}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Rolled outer rim bead */}
      <mesh position={[0, 0.252, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[panRadius + 0.015, 0.028, 16, 72]} />
        <meshPhysicalMaterial
          color={isHovered ? ANTIQUE.goldHighlight : ANTIQUE.brassBright}
          metalness={0.92}
          roughness={0.16}
          clearcoat={0.7}
          emissive={isHovered ? '#38BDF8' : '#000000'}
          emissiveIntensity={isHovered ? 0.45 : 0}
        />
      </mesh>

      {/* 8 Decorative Brass Rim Studs around the Rolled Lip */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i * Math.PI) / 4;
        const r = panRadius + 0.015;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.276, Math.sin(a) * r]}
            material={materials.brassDark}
          >
            <sphereGeometry args={[0.016, 10, 8]} />
          </mesh>
        );
      })}

      {/* Hover Drop-Target Halo Ring */}
      {isHovered && (
        <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[panRadius - 0.04, panRadius + 0.07, 64]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Cast-Brass 4-Arm Spider Support Cradle beneath the dish */}
      <group position={[0, -0.01, 0]}>
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((rotY, idx) => (
          <mesh key={idx} rotation={[Math.PI, rotY, 0]} material={materials.brass} castShadow>
            <torusGeometry args={[0.64, 0.022, 12, 40, Math.PI]} />
          </mesh>
        ))}
        {/* Under-bowl reinforcing compression ring */}
        <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
          <torusGeometry args={[0.42, 0.018, 10, 48]} />
        </mesh>
        {/* Central hub collar */}
        <mesh position={[0, -0.16, 0]} material={materials.brassBright} castShadow>
          <cylinderGeometry args={[0.105, 0.09, 0.13, 24]} />
        </mesh>
      </group>

      {/* Turned brass & steel vertical Roberval stem extending through upper & lower pivots */}
      <mesh geometry={stemGeometry} position={[0, -0.32, 0]} material={materials.brass} castShadow />

      {/* Lower Roberval Stay-Pin Clevis Collar at y = -0.60 */}
      <group position={[0, -0.60, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright} castShadow>
          <cylinderGeometry args={[0.068, 0.068, 0.11, 24]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.steel}>
          <cylinderGeometry args={[0.032, 0.032, 0.135, 16]} />
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
          const fruitIdx =
            curItem.fruitType === 'apple' ? 0 : curItem.fruitType === 'banana' ? 2 : 1;
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
              <Item
                position={[0, 0.1, 0]}
                variantIndex={fruitIdx}
                scale={2.6}
                onClick={() => onRemoveItem('item', numVal, undefined, curItem)}
              />
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
            onClick={() =>
              onRemoveItem('item', numVal, undefined, typeof curItem === 'object' ? curItem : undefined)
            }
          />
        );
      })}
    </group>
  );
};
