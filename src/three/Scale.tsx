import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';
import { ANTIQUE } from '../theme';

// Procedural walnut wood-grain texture (no external assets needed).
// Uses a seeded PRNG and a module-level cache so it is deterministic and built once.
let woodTextureCache: THREE.CanvasTexture | null = null;

const getWoodTexture = (): THREE.CanvasTexture => {
  if (woodTextureCache) return woodTextureCache;

  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#6B4128';
  ctx.fillRect(0, 0, size, size);

  // Long wavy grain lines running horizontally
  for (let i = 0; i < 140; i++) {
    const y0 = rand() * size;
    const amp = 2 + rand() * 6;
    const freq = 0.004 + rand() * 0.01;
    const phase = rand() * Math.PI * 2;
    const dark = rand() > 0.5;
    ctx.strokeStyle = dark
      ? `rgba(40, 20, 8, ${0.08 + rand() * 0.22})`
      : `rgba(150, 100, 60, ${0.05 + rand() * 0.12})`;
    ctx.lineWidth = 0.6 + rand() * 2.2;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const y = y0 + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  woodTextureCache = tex;
  return tex;
};

const useWoodTexture = () => useMemo(() => getWoodTexture(), []);

export const Scale: React.FC = () => {
  const beamRef = useRef<THREE.Group>(null);
  const leftPanRef = useRef<THREE.Group>(null);
  const rightPanRef = useRef<THREE.Group>(null);

  // Physics animation state
  const currentAngleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const equation = useGameStore((s) => s.equation);
  const balance = useGameStore((s) => s.balanceMetrics);
  const hoveredPan = useGameStore((s) => s.hoveredPan);
  const selectedTool = useGameStore((s) => s.selectedTool);
  const addToPan = useGameStore((s) => s.addToPan);
  const removeFromPan = useGameStore((s) => s.removeFromPan);

  // Core proportions (kept identical so pans / items / physics line up)
  const BEAM_HALF_SPAN = 2.85;
  const FULCRUM_Y = 1.05;
  const PAN_MOUNT_OFFSET_Y = 0.32;

  // Indicator dial geometry (arc centred on the fulcrum)
  const DIAL_INNER_R = 0.74;
  const DIAL_OUTER_R = 0.86;
  const DIAL_HALF_ANGLE = 0.42; // ~24 degrees each side

  const woodTexture = useWoodTexture();

  useFrame((_, delta) => {
    const targetAngle = balance.angleRad;
    const dt = Math.min(delta, 0.05);

    // Realistic physics spring-damping with subtle natural inertia
    const stiffness = 22.0;
    const damping = 4.6;

    const angleDiff = targetAngle - currentAngleRef.current;
    velocityRef.current += (angleDiff * stiffness - velocityRef.current * damping) * dt;
    currentAngleRef.current += velocityRef.current * dt;

    const angle = currentAngleRef.current;

    // Rotate main lever beam
    if (beamRef.current) {
      beamRef.current.rotation.z = angle;
    }

    // Top-mounted pans stay horizontally level
    if (leftPanRef.current) {
      leftPanRef.current.rotation.z = -angle;
    }
    if (rightPanRef.current) {
      rightPanRef.current.rotation.z = -angle;
    }
  });

  const handlePanClick = (side: 'left' | 'right') => {
    if (selectedTool) {
      addToPan(side, selectedTool);
    }
  };

  // ---------- Shared materials (created once, reused by many meshes) ----------
  const materials = useMemo(
    () => ({
      brass: new THREE.MeshStandardMaterial({ color: ANTIQUE.brass, metalness: 1, roughness: 0.28 }),
      brassDark: new THREE.MeshStandardMaterial({ color: ANTIQUE.brassDark, metalness: 1, roughness: 0.4 }),
      iron: new THREE.MeshStandardMaterial({ color: ANTIQUE.iron, metalness: 0.75, roughness: 0.42 }),
    }),
    []
  );

  // 1. Turned baluster column (lathe profile, like a machined brass pillar)
  const columnGeometry = useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const profile = [
      p(0.0, 0.0),
      p(0.3, 0.0),
      p(0.3, 0.035),
      p(0.26, 0.05),
      p(0.26, 0.08),
      p(0.2, 0.1),
      p(0.15, 0.15),
      p(0.115, 0.24),
      p(0.095, 0.36),
      p(0.085, 0.46),
      p(0.11, 0.48),
      p(0.13, 0.5),
      p(0.11, 0.52),
      p(0.075, 0.54),
      p(0.075, 0.6),
      p(0.12, 0.62),
      p(0.15, 0.64),
      p(0.0, 0.64),
    ];
    return new THREE.LatheGeometry(profile, 48);
  }, []);

  // 2. Elegant tapered beam with flared ends
  const beamGeometry = useMemo(() => {
    const s = BEAM_HALF_SPAN;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.11);
    shape.quadraticCurveTo(s * 0.5, 0.075, s - 0.18, 0.06);
    shape.quadraticCurveTo(s - 0.06, 0.06, s, 0.085);
    shape.lineTo(s, -0.085);
    shape.quadraticCurveTo(s - 0.06, -0.06, s - 0.18, -0.06);
    shape.quadraticCurveTo(s * 0.5, -0.075, 0, -0.11);
    shape.quadraticCurveTo(-s * 0.5, -0.075, -(s - 0.18), -0.06);
    shape.quadraticCurveTo(-(s - 0.06), -0.06, -s, -0.085);
    shape.lineTo(-s, 0.085);
    shape.quadraticCurveTo(-(s - 0.06), 0.06, -(s - 0.18), 0.06);
    shape.quadraticCurveTo(-s * 0.5, 0.075, 0, 0.11);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.014,
      bevelThickness: 0.014,
      curveSegments: 24,
    });
    geo.center();
    return geo;
  }, [BEAM_HALF_SPAN]);

  // 3. Indicator dial arc plate (fixed, behind the pointer)
  const dialGeometry = useMemo(() => {
    const start = Math.PI / 2 - DIAL_HALF_ANGLE;
    const end = Math.PI / 2 + DIAL_HALF_ANGLE;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, DIAL_OUTER_R, start, end, false);
    shape.absarc(0, 0, DIAL_INNER_R, end, start, true);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      curveSegments: 48,
    });
  }, []);

  // Tick marks along the dial
  const ticks = useMemo(() => {
    const list: { angle: number; major: boolean; center: boolean }[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const a = -DIAL_HALF_ANGLE * 0.88 + t * DIAL_HALF_ANGLE * 1.76;
      list.push({ angle: a, major: i % 2 === 0, center: i === (count - 1) / 2 });
    }
    return list;
  }, []);

  const statusColor = balance.isBalanced ? '#22C55E' : '#EF4444';

  // Beam end boss + knife-edge pivot (shared for both sides)
  const renderEndBoss = (x: number) => (
    <group key={x} position={[x, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brass} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.16, 32]} />
      </mesh>
      {/* Decorative ring */}
      <mesh position={[0, 0, 0.082]} material={materials.brassDark}>
        <torusGeometry args={[0.1, 0.012, 10, 32]} />
      </mesh>
      {/* Hardened steel pivot pin */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.085]} material={materials.iron}>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 20]} />
      </mesh>
    </group>
  );

  return (
    <group position={[0, -0.65, 0]} scale={1.15}>
      {/* ================= 1. WALNUT BASE WITH BRASS FEET ================= */}
      {[
        [-0.9, 0.31],
        [0.9, 0.31],
        [-0.9, -0.31],
        [0.9, -0.31],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]} scale={[1, 0.55, 1]} material={materials.brass} castShadow>
          <sphereGeometry args={[0.065, 20, 12]} />
        </mesh>
      ))}

      {/* Lower plinth */}
      <RoundedBox args={[2.1, 0.13, 0.82]} radius={0.04} smoothness={4} position={[0, 0.105, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={woodTexture} color="#8A5A3A" roughness={0.45} metalness={0} />
      </RoundedBox>

      {/* Upper tier */}
      <RoundedBox args={[1.6, 0.08, 0.64]} radius={0.03} smoothness={4} position={[0, 0.205, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={woodTexture} color="#7A4C2E" roughness={0.4} metalness={0} />
      </RoundedBox>

      {/* Brass inlay band around the lower plinth */}
      <mesh position={[0, 0.105, 0]} material={materials.brassDark}>
        <boxGeometry args={[2.115, 0.018, 0.835]} />
      </mesh>

      {/* Front brass name plate */}
      <RoundedBox args={[0.5, 0.06, 0.012]} radius={0.005} smoothness={2} position={[0, 0.115, 0.415]} material={materials.brass} />

      {/* ================= 2. TURNED BRASS COLUMN ================= */}
      <mesh geometry={columnGeometry} position={[0, 0.245, 0]} material={materials.brass} castShadow receiveShadow />

      {/* Knife-edge saddle block the beam rests on */}
      <RoundedBox args={[0.36, 0.08, 0.26]} radius={0.015} smoothness={3} position={[0, 0.87, 0]} material={materials.brassDark} castShadow />

      {/* Rear upright supporting the indicator dial */}
      <mesh position={[0, 1.37, -0.12]} material={materials.brassDark} castShadow>
        <boxGeometry args={[0.05, 0.92, 0.03]} />
      </mesh>

      {/* ================= 3. INDICATOR DIAL (fixed) ================= */}
      <group position={[0, FULCRUM_Y, -0.11]}>
        <mesh geometry={dialGeometry} material={materials.brass} castShadow />
        {/* Ivory scale face */}
        <mesh position={[0, 0, 0.031]}>
          <ringGeometry
            args={[DIAL_INNER_R + 0.015, DIAL_OUTER_R - 0.015, 48, 1, Math.PI / 2 - DIAL_HALF_ANGLE * 0.95, DIAL_HALF_ANGLE * 1.9]}
          />
          <meshStandardMaterial color="#F3E9D2" roughness={0.6} />
        </mesh>
        {ticks.map((t, i) => {
          const r = (DIAL_INNER_R + DIAL_OUTER_R) / 2;
          const len = t.center ? 0.1 : t.major ? 0.075 : 0.045;
          return (
            <mesh
              key={i}
              position={[-Math.sin(t.angle) * r, Math.cos(t.angle) * r, 0.034]}
              rotation={[0, 0, t.angle]}
            >
              <planeGeometry args={[t.center ? 0.016 : 0.009, len]} />
              <meshBasicMaterial color={t.center ? statusColor : '#3B2A1A'} toneMapped={false} />
            </mesh>
          );
        })}
        {/* Status jewel on top of the dial (green = balanced, red = not) */}
        <mesh position={[0, DIAL_OUTER_R + 0.07, 0.02]}>
          <sphereGeometry args={[0.045, 24, 16]} />
          <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.6} roughness={0.15} />
        </mesh>
        <mesh position={[0, DIAL_OUTER_R + 0.07, 0.0]} rotation={[Math.PI / 2, 0, 0]} material={materials.brass}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 24]} />
        </mesh>
      </group>

      {/* ================= 4. ROTATING BEAM ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Blackened cast-iron beam */}
        <mesh geometry={beamGeometry} material={materials.iron} castShadow receiveShadow />

        {/* Brass inlay line along the front face */}
        <mesh position={[0, 0, 0.066]} material={materials.brass}>
          <boxGeometry args={[BEAM_HALF_SPAN * 2 - 0.3, 0.016, 0.004]} />
        </mesh>

        {/* Central hub boss */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]} material={materials.brass} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.18, 40]} />
        </mesh>
        <mesh position={[0, 0, 0.112]} material={materials.brassDark}>
          <torusGeometry args={[0.135, 0.016, 12, 40]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.115]} material={materials.iron}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 24]} />
        </mesh>

        {/* Pointer needle rising from the hub */}
        <group position={[0, 0, -0.03]}>
          <mesh position={[0, 0.48, 0]} material={materials.iron} castShadow>
            <cylinderGeometry args={[0.008, 0.02, 0.62, 12]} />
          </mesh>
          <mesh position={[0, 0.84, 0]} material={materials.iron}>
            <coneGeometry args={[0.022, 0.1, 12]} />
          </mesh>
        </group>

        {/* Beam end pivots */}
        {renderEndBoss(-BEAM_HALF_SPAN)}
        {renderEndBoss(BEAM_HALF_SPAN)}

        {/* ================= LEFT TOP-MOUNTED PAN ================= */}
        <group
          ref={leftPanRef}
          position={[-BEAM_HALF_SPAN, PAN_MOUNT_OFFSET_Y, 0]}
        >
          <Pan
            bagsCount={equation.left.bags}
            itemsCount={equation.left.items}
            itemWeight={equation.itemWeight ?? 1}
            customWeights={equation.left.customWeights}
            customVariables={equation.left.customVariables}
            isHovered={hoveredPan === 'left'}
            isSolved={balance.isSolved}
            onPanClick={() => handlePanClick('left')}
            onRemoveItem={(type, weightVal, varItem, customItem) =>
              removeFromPan('left', type, weightVal, varItem, customItem)
            }
          />
        </group>

        {/* ================= RIGHT TOP-MOUNTED PAN ================= */}
        <group
          ref={rightPanRef}
          position={[BEAM_HALF_SPAN, PAN_MOUNT_OFFSET_Y, 0]}
        >
          <Pan
            bagsCount={equation.right.bags}
            itemsCount={equation.right.items}
            itemWeight={equation.itemWeight ?? 1}
            customWeights={equation.right.customWeights}
            customVariables={equation.right.customVariables}
            isHovered={hoveredPan === 'right'}
            isSolved={balance.isSolved}
            onPanClick={() => handlePanClick('right')}
            onRemoveItem={(type, weightVal, varItem, customItem) =>
              removeFromPan('right', type, weightVal, varItem, customItem)
            }
          />
        </group>
      </group>
    </group>
  );
};
