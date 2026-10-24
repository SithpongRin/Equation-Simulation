import React, { useMemo } from 'react';
import * as THREE from 'three';
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

// Suspension drop distance from the beam end knob (y = 0) down to the pan rim
const HANG_DROP = 1.55;
const PAN_RADIUS = 1.28;

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
  // Exact top surface of the golden pan where boxes & weights sit
  const surfaceY = -HANG_DROP + 0.04;

  // Shared lightweight materials for 120fps rendering
  const materials = useMemo(
    () => ({
      cord: new THREE.MeshStandardMaterial({
        color: '#94A3B8',
        roughness: 0.35,
        metalness: 0.65,
      }),
      panRim: new THREE.MeshStandardMaterial({
        color: '#FBBF24', // Bright golden yellow top lip (matches reference image)
        roughness: 0.28,
        metalness: 0.25,
      }),
      panRimHover: new THREE.MeshStandardMaterial({
        color: '#FDE047',
        emissive: '#F59E0B',
        emissiveIntensity: 0.4,
        roughness: 0.25,
        metalness: 0.2,
      }),
      panBowl: new THREE.MeshStandardMaterial({
        color: '#F59E0B', // Warm deep amber-gold lower bowl (matches reference image)
        roughness: 0.32,
        metalness: 0.28,
      }),
      panFloor: new THREE.MeshStandardMaterial({
        color: '#FEF3C7', // Soft warm cream inner floor so items pop clearly
        roughness: 0.45,
        metalness: 0.1,
      }),
    }),
    []
  );

  // Smooth rounded-bottom lower bowl profile matching the reference image
  const bowlGeometry = useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const r = PAN_RADIUS * 0.9;
    const profile = [
      p(0, -0.24),
      p(r * 0.68, -0.24),
      p(r * 0.86, -0.21),
      p(r * 0.96, -0.14),
      p(r, -0.04),
      p(0, -0.04),
    ];
    return new THREE.LatheGeometry(profile, 40);
  }, []);

  // Left & right angled suspension cord geometries from knob (0, 0, 0) to rim (±attachX, -HANG_DROP, 0)
  const { leftCordGeo, rightCordGeo } = useMemo(() => {
    const attachX = PAN_RADIUS * 0.86;
    const makeCord = (targetX: number) => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(targetX, -HANG_DROP, 0);
      const curve = new THREE.LineCurve3(start, end);
      return new THREE.TubeGeometry(curve, 1, 0.018, 8, false);
    };
    return {
      leftCordGeo: makeCord(-attachX),
      rightCordGeo: makeCord(attachX),
    };
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

    if (totalVariablesCount > 0 && totalWeightsCount > 0) {
      if (totalVariablesCount === 1) {
        bags.push([-0.4, surfaceY, 0]);
      } else {
        for (let i = 0; i < totalVariablesCount; i++) {
          const z = (i - (totalVariablesCount - 1) / 2) * 0.44;
          bags.push([-0.42, surfaceY, z]);
        }
      }

      if (totalWeightsCount === 1) {
        items.push([0.4, surfaceY, 0]);
      } else {
        const cols = totalWeightsCount > 4 ? 2 : 1;
        for (let i = 0; i < totalWeightsCount; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const totalRows = Math.ceil(totalWeightsCount / cols);
          const x = 0.26 + col * 0.44;
          const z = (row - (totalRows - 1) / 2) * 0.44;
          items.push([x, surfaceY, z]);
        }
      }

      return { bagPositions: bags, itemPositions: items };
    }

    if (totalVariablesCount === 1) {
      bags.push([0, surfaceY, 0]);
    } else if (totalVariablesCount === 2) {
      bags.push([-0.42, surfaceY, 0], [0.42, surfaceY, 0]);
    } else if (totalVariablesCount === 3) {
      bags.push([-0.45, surfaceY, -0.18], [0, surfaceY, 0.24], [0.45, surfaceY, -0.18]);
    } else {
      const step = 1.1 / Math.max(1, totalVariablesCount - 1);
      for (let i = 0; i < totalVariablesCount; i++) {
        const x = -0.55 + i * step;
        const z = i % 2 === 0 ? -0.16 : 0.18;
        bags.push([x, surfaceY, z]);
      }
    }

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
          const x = (col - (cols - 1) / 2) * 0.48;
          const z = (row - (totalRows - 1) / 2) * 0.45;
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
      {/* ================= 1. INVERTED-V SUSPENSION CORDS (/\ FROM BEAM TIP TO PAN RIM) ================= */}
      <mesh geometry={leftCordGeo} material={materials.cord} castShadow />
      <mesh geometry={rightCordGeo} material={materials.cord} castShadow />

      {/* ================= 2. GOLDEN HANGING PAN DISH (MATCHING REFERENCE IMAGE) ================= */}
      <group position={[0, -HANG_DROP, 0]}>
        {/* Wide Bright-Yellow Top Rim Lip */}
        <mesh
          material={isHovered ? materials.panRimHover : materials.panRim}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[PAN_RADIUS, PAN_RADIUS, 0.08, 44]} />
        </mesh>

        {/* Inner Soft Cream Weighing Pad */}
        <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.panFloor} receiveShadow>
          <circleGeometry args={[PAN_RADIUS * 0.88, 40]} />
        </mesh>

        {/* Rounded-Bottom Deep Amber-Gold Bowl Underneath Rim */}
        <mesh geometry={bowlGeometry} material={materials.panBowl} castShadow receiveShadow />

        {/* Hover Glow Indicator Ring */}
        {isHovered && (
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[PAN_RADIUS - 0.05, PAN_RADIUS + 0.06, 48]} />
            <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* ================= 3. ITEMS ON THIS PAN ================= */}
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
              <mesh
                position={[0, 0.35, 0]}
                onClick={handleRemove}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <sphereGeometry args={[0.55, 12, 12]} />
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
