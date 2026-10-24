import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';
import { latheFromPairs } from './ornaments';

export const Scale: React.FC = () => {
  const beamRef = useRef<THREE.Group>(null);
  const leftPanPivotRef = useRef<THREE.Group>(null);
  const rightPanPivotRef = useRef<THREE.Group>(null);

  // Physics animation state
  const currentAngleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const equation = useGameStore((s) => s.equation);
  const balance = useGameStore((s) => s.balanceMetrics);
  const hoveredPan = useGameStore((s) => s.hoveredPan);
  const selectedTool = useGameStore((s) => s.selectedTool);
  const addToPan = useGameStore((s) => s.addToPan);
  const removeFromPan = useGameStore((s) => s.removeFromPan);

  // Core proportions matching the classic hanging-pan reference scale
  const BEAM_HALF_SPAN = 2.85;
  const FULCRUM_Y = 2.66;

  useFrame((_, delta) => {
    // Note: in a hanging scale, heavier side goes DOWN:
    // balance.angleRad is positive when left is heavier (or right is heavier depending on convention).
    const targetAngle = balance.angleRad;
    const dt = Math.min(delta, 0.033);

    // Smooth, natural spring-damping with zero jitter
    const stiffness = 24.0;
    const damping = 5.4;

    const angleDiff = targetAngle - currentAngleRef.current;
    velocityRef.current += (angleDiff * stiffness - velocityRef.current * damping) * dt;
    currentAngleRef.current += velocityRef.current * dt;

    const angle = currentAngleRef.current;

    if (beamRef.current) {
      beamRef.current.rotation.z = angle;
    }

    // Hanging pans always hang straight down under gravity from the beam tip knobs
    if (leftPanPivotRef.current) {
      leftPanPivotRef.current.rotation.z = -angle;
    }
    if (rightPanPivotRef.current) {
      rightPanPivotRef.current.rotation.z = -angle;
    }
  });

  const handlePanClick = (side: 'left' | 'right') => {
    if (selectedTool) {
      addToPan(side, selectedTool);
    }
  };

  // Clean, rich dark-wood materials matching the reference image (fast single-pass shaders)
  const materials = useMemo(
    () => ({
      woodDark: new THREE.MeshStandardMaterial({
        color: '#4E1F0E', // Deep rich espresso-mahogany for base & top cap
        roughness: 0.42,
        metalness: 0.06,
      }),
      woodMid: new THREE.MeshStandardMaterial({
        color: '#632914', // Warm redwood-mahogany for main pillar & beam
        roughness: 0.38,
        metalness: 0.08,
      }),
      woodHub: new THREE.MeshStandardMaterial({
        color: '#7A371E', // Warm lighter brown circular pivot boss at center of beam
        roughness: 0.35,
        metalness: 0.12,
      }),
    }),
    []
  );

  // Single unified lathe geometry for the entire central pillar + stepped base + trapezoidal top cap!
  // (1 draw call for the entire stand = maximum 120 FPS performance & seamless silhouette)
  const standGeometry = useMemo(() => {
    return latheFromPairs(
      [
        // 1. Wide flat bottom base step
        0.0, 0.0,
        0.96, 0.0,
        0.96, 0.11,
        0.78, 0.11,
        // 2. Rounded second base tier
        0.78, 0.22,
        0.72, 0.27,
        0.32, 0.27,
        // 3. Column pedestal collar
        0.32, 0.42,
        0.20, 0.42,
        // 4. Thick lower pillar trunk (y = 0.42 to 1.46)
        0.19, 1.42,
        0.16, 1.47,
        0.11, 1.50,
        // 5. Slender upper pillar with turned middle bead ring at y = 2.02
        0.105, 1.94,
        0.145, 1.99,
        0.155, 2.02,
        0.145, 2.05,
        0.105, 2.10,
        // 6. Upper neck through fulcrum (y = 2.66) up to 2.86
        0.105, 2.86,
        // 7. Flared Trapezoidal Top Cap / Crown (ក្បាលជញ្ជីងខាងលើ)
        0.15, 2.86,
        0.28, 3.24,
        0.0, 3.24,
      ],
      48
    );
  }, []);

  return (
    <group position={[0, -0.68, 0]} scale={1.0}>
      {/* ================= 1. UNIFIED STEPPED WOODEN BASE & CENTRAL PILLAR ================= */}
      <mesh
        geometry={standGeometry}
        material={materials.woodMid}
        castShadow
        receiveShadow
      />

      {/* Darker accent overlay on bottom step & top trapezoidal crown for crisp two-tone contrast */}
      <mesh position={[0, 0.056, 0]} material={materials.woodDark} receiveShadow>
        <cylinderGeometry args={[0.965, 0.965, 0.112, 48]} />
      </mesh>
      <mesh position={[0, 3.05, 0]} material={materials.woodDark} castShadow>
        <cylinderGeometry args={[0.282, 0.152, 0.38, 48]} />
      </mesh>

      {/* ================= 2. TAPERED WOODEN BALANCE BEAM & HANGING PANS ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Left Tapered Beam Arm (thick at center, slender at outer tip) */}
        <mesh
          position={[-BEAM_HALF_SPAN / 2, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.woodMid}
          castShadow
        >
          <cylinderGeometry args={[0.045, 0.095, BEAM_HALF_SPAN, 24]} />
        </mesh>

        {/* Right Tapered Beam Arm (thick at center, slender at outer tip) */}
        <mesh
          position={[BEAM_HALF_SPAN / 2, 0, 0]}
          rotation={[0, 0, -Math.PI / 2]}
          material={materials.woodMid}
          castShadow
        >
          <cylinderGeometry args={[0.045, 0.095, BEAM_HALF_SPAN, 24]} />
        </mesh>

        {/* Central Circular Pivot Boss (matches the round center joint in the reference image) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.woodHub} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.24, 32]} />
        </mesh>
        {/* Subtle inner pivot pin */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.woodDark}>
          <cylinderGeometry args={[0.07, 0.07, 0.26, 20]} />
        </mesh>

        {/* Left & Right Spherical Beam-Tip Knobs */}
        <mesh position={[-BEAM_HALF_SPAN, 0, 0]} material={materials.woodDark} castShadow>
          <sphereGeometry args={[0.105, 20, 16]} />
        </mesh>
        <mesh position={[BEAM_HALF_SPAN, 0, 0]} material={materials.woodDark} castShadow>
          <sphereGeometry args={[0.105, 20, 16]} />
        </mesh>

        {/* ================= LEFT HANGING PAN (Suspended from Left Tip Knob) ================= */}
        <group ref={leftPanPivotRef} position={[-BEAM_HALF_SPAN, 0, 0]}>
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

        {/* ================= RIGHT HANGING PAN (Suspended from Right Tip Knob) ================= */}
        <group ref={rightPanPivotRef} position={[BEAM_HALF_SPAN, 0, 0]}>
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
