import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';

export const Scale: React.FC = () => {
  const beamRef = useRef<THREE.Group>(null);
  const pointerRef = useRef<THREE.Group>(null);
  const leftPanRef = useRef<THREE.Group>(null);
  const rightPanRef = useRef<THREE.Group>(null);

  // Physics animation state
  const currentAngleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const equation = useGameStore((s) => s.equation);
  const balance = useGameStore((s) => s.balanceMetrics);
  const hoveredPan = useGameStore((s) => s.hoveredPan);
  const selectedTool = useGameStore((s) => s.selectedTool);
  const colorMode = useGameStore((s) => s.colorMode);
  const addToPan = useGameStore((s) => s.addToPan);
  const removeFromPan = useGameStore((s) => s.removeFromPan);

  const isDark = colorMode === 'dark';

  // Compact Modern Lab Scale Dimensions (Matching the reference design)
  const BEAM_HALF_SPAN = 3.2;
  const FULCRUM_Y = 1.05;
  const PAN_MOUNT_OFFSET_Y = 0.28;

  useFrame((_, delta) => {
    const targetAngle = balance.angleRad;
    const dt = Math.min(delta, 0.05);

    // Realistic physics spring-damping
    const stiffness = 24.0;
    const damping = 4.8;

    const angleDiff = targetAngle - currentAngleRef.current;
    velocityRef.current += (angleDiff * stiffness - velocityRef.current * damping) * dt;
    currentAngleRef.current += velocityRef.current * dt;

    const angle = currentAngleRef.current;

    // Rotate beam
    if (beamRef.current) {
      beamRef.current.rotation.z = angle;
    }

    // Needle pointer
    if (pointerRef.current) {
      pointerRef.current.rotation.z = angle;
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

  // High quality blue theme matching reference image
  const primaryBlue = '#1D4E89';       // Deep marine blue from user image
  const pivotAccent = '#E2E8F0';       // Crisp white-grey pivot circle
  const baseWhite = '#FFFFFF';         // White base plate

  return (
    <group position={[0, -0.65, 0]} scale={1.12}>
      {/* ================= 1. CLEAN FLAT WHITE/GREY PEDESTAL BASE ================= */}
      {/* Lower plinth */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.08, 0.8]} />
        <meshStandardMaterial
          color={isDark ? '#1E293B' : baseWhite}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>
      {/* Upper stepped trim */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.06, 0.68]} />
        <meshStandardMaterial
          color={isDark ? '#334155' : '#F1F5F9'}
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      {/* ================= 2. ARCHED TRIANGULAR CENTRAL FULCRUM HOUSING ================= */}
      <group position={[0, 0.13, 0]}>
        {/* Flared bottom support */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.52, 0.36, 32]} />
          <meshStandardMaterial color={primaryBlue} roughness={0.35} metalness={0.15} />
        </mesh>

        {/* Central pointed Gothic / Teardrop Arch Fulcrum */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.42, 1.05, 32]} />
          <meshStandardMaterial color={primaryBlue} roughness={0.35} metalness={0.15} />
        </mesh>

        {/* Round Central Fulcrum Pivot Ring with crisp white axle dot */}
        <group position={[0, 0.88, 0.18]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.12, 32]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.3} metalness={0.15} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.04]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 28]} />
            <meshStandardMaterial color={pivotAccent} roughness={0.2} metalness={0.05} />
          </mesh>
        </group>
      </group>

      {/* ================= 3. ROTATING TAPERED LEVER BEAM ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Left Tapered Beam Arm (thick at center, gentle taper outward) */}
        <group position={[-BEAM_HALF_SPAN / 2, 0, 0]}>
          {/* Main arm bar */}
          <mesh castShadow>
            <boxGeometry args={[BEAM_HALF_SPAN - 0.2, 0.18, 0.12]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.35} metalness={0.15} />
          </mesh>
          {/* Subtle wedge taper */}
          <mesh position={[0.5, 0.03, 0]} rotation={[0, 0, -0.03]}>
            <boxGeometry args={[BEAM_HALF_SPAN - 1.2, 0.08, 0.11]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.35} metalness={0.15} />
          </mesh>
        </group>

        {/* Right Tapered Beam Arm */}
        <group position={[BEAM_HALF_SPAN / 2, 0, 0]}>
          {/* Main arm bar */}
          <mesh castShadow>
            <boxGeometry args={[BEAM_HALF_SPAN - 0.2, 0.18, 0.12]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.35} metalness={0.15} />
          </mesh>
          {/* Subtle wedge taper */}
          <mesh position={[-0.5, 0.03, 0]} rotation={[0, 0, 0.03]}>
            <boxGeometry args={[BEAM_HALF_SPAN - 1.2, 0.08, 0.11]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.35} metalness={0.15} />
          </mesh>
        </group>

        {/* Left End Bearing / Circular Hinge Housing */}
        <group position={[-BEAM_HALF_SPAN, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 28]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.3} metalness={0.15} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.06]}>
            <cylinderGeometry args={[0.11, 0.11, 0.08, 24]} />
            <meshStandardMaterial color={pivotAccent} roughness={0.2} metalness={0.05} />
          </mesh>
        </group>

        {/* Right End Bearing / Circular Hinge Housing */}
        <group position={[BEAM_HALF_SPAN, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 28]} />
            <meshStandardMaterial color={primaryBlue} roughness={0.3} metalness={0.15} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.06]}>
            <cylinderGeometry args={[0.11, 0.11, 0.08, 24]} />
            <meshStandardMaterial color={pivotAccent} roughness={0.2} metalness={0.05} />
          </mesh>
        </group>

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
            onRemoveItem={(type, weightVal, varItem) => removeFromPan('left', type, weightVal, varItem)}
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
            onRemoveItem={(type, weightVal, varItem) => removeFromPan('right', type, weightVal, varItem)}
          />
        </group>
      </group>
    </group>
  );
};
