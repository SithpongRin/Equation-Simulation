import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';

export const Scale: React.FC = () => {
  const beamRef = useRef<THREE.Group>(null);
  const lowerBeamRef = useRef<THREE.Group>(null);
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

  // Precision Laboratory Roberval Dimensions
  const BEAM_HALF_SPAN = 3.2;
  const FULCRUM_Y = 1.35;
  const LOWER_BEAM_Y = 0.82;
  const PAN_MOUNT_OFFSET_Y = 0.35;

  useFrame((_, delta) => {
    const targetAngle = balance.angleRad;
    const dt = Math.min(delta, 0.05);

    // Realistic physics spring-damping with subtle inertia
    const stiffness = 22.0;
    const damping = 4.5;

    const angleDiff = targetAngle - currentAngleRef.current;
    velocityRef.current += (angleDiff * stiffness - velocityRef.current * damping) * dt;
    currentAngleRef.current += velocityRef.current * dt;

    const angle = currentAngleRef.current;

    // Rotate main upper beam
    if (beamRef.current) {
      beamRef.current.rotation.z = angle;
    }

    // Rotate lower parallel Roberval guide beam
    if (lowerBeamRef.current) {
      lowerBeamRef.current.rotation.z = angle;
    }

    // Pointer needle swings with beam
    if (pointerRef.current) {
      pointerRef.current.rotation.z = angle * 1.35;
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

  // Premium Laboratory Palette
  const marineBlue = '#1E3A8A';       // Deep precision navy lacquer
  const beamBlue = '#2563EB';         // Polished cobalt beam
  const chromeMetal = '#E2E8F0';      // Polished stainless steel / chrome
  const darkSteel = '#0F172A';        // Gunmetal accents
  const brassAccent = '#F59E0B';      // Machined brass thumbscrews & dial
  const dialPlate = isDark ? '#1E293B' : '#F8FAFC';

  return (
    <group position={[0, -0.65, 0]} scale={1.12}>
      {/* ================= 1. HEAVY CAST-IRON BEVELED BASE PLINTH ================= */}
      {/* 4 Precision Machined Brass Leveling Screws at Base Corners */}
      {[
        [-0.88, 0.03, -0.36],
        [0.88, 0.03, -0.36],
        [-0.88, 0.03, 0.36],
        [0.88, 0.03, 0.36],
      ].map((pos, idx) => (
        <group key={`foot-${idx}`} position={pos as [number, number, number]}>
          {/* Knurled brass thumb wheel */}
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.085, 0.045, 24]} />
            <meshStandardMaterial color={brassAccent} metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Rubber foot pad */}
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Main Base Casting Plinth with Beveled Edge */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.08, 0.88]} />
        <meshStandardMaterial
          color={isDark ? '#0F172A' : '#E2E8F0'}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* Upper Precision Stepped Plate */}
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.05, 0.74]} />
        <meshStandardMaterial
          color={isDark ? '#1E293B' : '#FFFFFF'}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Centered Brass Manufacturer & Calibration Plaque */}
      <mesh position={[0, 0.14, 0.28]} castShadow>
        <boxGeometry args={[0.48, 0.015, 0.12]} />
        <meshStandardMaterial color={brassAccent} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ================= 2. ARCHITECTURAL CENTRAL FULCRUM COLUMN ================= */}
      {/* Heavy Flanged Column Pedestal */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.52, 0.42, 32]} />
        <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Twin Fluted Gothic Central Towers (Front & Rear Pillars) */}
      <mesh position={[0, 0.95, -0.06]} castShadow>
        <boxGeometry args={[0.38, 0.85, 0.12]} />
        <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.95, 0.06]} castShadow>
        <boxGeometry args={[0.38, 0.85, 0.12]} />
        <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ================= 3. CALIBRATED DEGREE DIAL & SWINGING NEEDLE ================= */}
      {/* Semi-circular Degree Arc Plate */}
      <group position={[0, 0.62, 0.14]}>
        {/* Dial Face Plate */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.018, 36, 1, false, Math.PI * 0.72, Math.PI * 0.56]} />
          <meshStandardMaterial color={dialPlate} roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Outer Dial Brass Rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.015, 12, 36, Math.PI * 0.56]} />
          <meshStandardMaterial color={brassAccent} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Center Zero Calibration Mark */}
        <mesh position={[0, -0.22, 0.012]}>
          <boxGeometry args={[0.015, 0.07, 0.01]} />
          <meshStandardMaterial color={balance.isBalanced ? '#10B981' : '#EF4444'} roughness={0.2} />
        </mesh>
        {/* Left & Right Graduation Ticks */}
        {[-0.14, -0.07, 0.07, 0.14].map((xOffset, i) => (
          <mesh key={`tick-${i}`} position={[xOffset, -0.23, 0.012]}>
            <boxGeometry args={[0.008, 0.045, 0.008]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Swinging Needle Pointer (Hangs from Fulcrum, points down at dial) */}
      <group position={[0, FULCRUM_Y, 0.15]}>
        <group ref={pointerRef}>
          {/* Slender tapered needle */}
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.006, 0.016, 0.74, 12]} />
            <meshStandardMaterial color={balance.isBalanced ? '#10B981' : '#EF4444'} roughness={0.2} metalness={0.3} />
          </mesh>
          {/* Arrowhead pointer tip */}
          <mesh position={[0, -0.80, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.024, 0.06, 12]} />
            <meshStandardMaterial color={balance.isBalanced ? '#10B981' : '#EF4444'} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* ================= 4. CENTRAL FULCRUM PIVOT WITH FORWARD-FACING HIGH-TECH STATUS LED ================= */}
      <group position={[0, FULCRUM_Y, 0.15]}>
        {/* Outer Heavy Circular Chrome Bezel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.09, 36]} />
          <meshStandardMaterial color={chromeMetal} metalness={0.9} roughness={0.12} />
        </mesh>

        {/* Marine Blue Housing Collar */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.22, 0.22, 0.07, 36]} />
          <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Dark Inner Bezel Cavity */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.045]}>
          <cylinderGeometry args={[0.17, 0.17, 0.05, 32]} />
          <meshStandardMaterial color={darkSteel} roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Glowing LED Outer Halo Ring */}
        <mesh position={[0, 0, 0.075]}>
          <torusGeometry args={[0.13, 0.016, 16, 36]} />
          <meshStandardMaterial
            color={balance.isBalanced ? '#10B981' : '#EF4444'}
            emissive={balance.isBalanced ? '#10B981' : '#EF4444'}
            emissiveIntensity={balance.isBalanced ? 2.5 : 2.0}
            roughness={0.1}
          />
        </mesh>

        {/* Forward-Facing Domed Crystal LED Lens */}
        <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.11, 24, 16]} />
          <meshStandardMaterial
            color={balance.isBalanced ? '#34D399' : '#F87171'}
            emissive={balance.isBalanced ? '#10B981' : '#EF4444'}
            emissiveIntensity={balance.isBalanced ? 3.5 : 3.0}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>

        {/* Front Point Light illuminating scale and indicator */}
        <pointLight
          position={[0, 0, 0.22]}
          color={balance.isBalanced ? '#10B981' : '#EF4444'}
          intensity={balance.isBalanced ? 3.2 : 2.4}
          distance={3.5}
        />
      </group>

      {/* ================= 5. LOWER PARALLEL ROBERVAL GUIDE BEAM ================= */}
      <group ref={lowerBeamRef} position={[0, LOWER_BEAM_Y, 0]}>
        {/* Slender lower stabilizing bar with chrome end pivots */}
        <mesh castShadow>
          <boxGeometry args={[BEAM_HALF_SPAN * 2 - 0.2, 0.09, 0.08]} />
          <meshStandardMaterial color={marineBlue} roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Center pivot pin */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
          <meshStandardMaterial color={chromeMetal} metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* ================= 6. MAIN ROTATING UPPER LATTICE TRUSS BEAM ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Left Beam Arm with Relief Cutouts & Taper */}
        <group position={[-BEAM_HALF_SPAN / 2, 0, 0]}>
          {/* Main Top Rail */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[BEAM_HALF_SPAN - 0.15, 0.07, 0.13]} />
            <meshStandardMaterial color={beamBlue} roughness={0.3} metalness={0.25} />
          </mesh>
          {/* Main Bottom Rail */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <boxGeometry args={[BEAM_HALF_SPAN - 0.15, 0.07, 0.13]} />
            <meshStandardMaterial color={beamBlue} roughness={0.3} metalness={0.25} />
          </mesh>
          {/* Webbing & Truss Struts */}
          {[-1.0, -0.4, 0.2, 0.8].map((x, i) => (
            <mesh key={`l-strut-${i}`} position={[x, 0, 0]} rotation={[0, 0, i % 2 === 0 ? 0.35 : -0.35]}>
              <boxGeometry args={[0.06, 0.18, 0.11]} />
              <meshStandardMaterial color={marineBlue} roughness={0.35} metalness={0.2} />
            </mesh>
          ))}
          {/* Brass Counter-Balance End Nut */}
          <mesh position={[-BEAM_HALF_SPAN / 2 + 0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
            <meshStandardMaterial color={brassAccent} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Beam Arm with Relief Cutouts & Taper */}
        <group position={[BEAM_HALF_SPAN / 2, 0, 0]}>
          {/* Main Top Rail */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[BEAM_HALF_SPAN - 0.15, 0.07, 0.13]} />
            <meshStandardMaterial color={beamBlue} roughness={0.3} metalness={0.25} />
          </mesh>
          {/* Main Bottom Rail */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <boxGeometry args={[BEAM_HALF_SPAN - 0.15, 0.07, 0.13]} />
            <meshStandardMaterial color={beamBlue} roughness={0.3} metalness={0.25} />
          </mesh>
          {/* Webbing & Truss Struts */}
          {[-0.8, -0.2, 0.4, 1.0].map((x, i) => (
            <mesh key={`r-strut-${i}`} position={[x, 0, 0]} rotation={[0, 0, i % 2 === 0 ? -0.35 : 0.35]}>
              <boxGeometry args={[0.06, 0.18, 0.11]} />
              <meshStandardMaterial color={marineBlue} roughness={0.35} metalness={0.2} />
            </mesh>
          ))}
          {/* Brass Counter-Balance End Nut */}
          <mesh position={[BEAM_HALF_SPAN / 2 - 0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
            <meshStandardMaterial color={brassAccent} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Left End Bearing Housing */}
        <group position={[-BEAM_HALF_SPAN, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 28]} />
            <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
            <meshStandardMaterial color={chromeMetal} metalness={0.85} roughness={0.15} />
          </mesh>
        </group>

        {/* Right End Bearing Housing */}
        <group position={[BEAM_HALF_SPAN, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 28]} />
            <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
            <meshStandardMaterial color={chromeMetal} metalness={0.85} roughness={0.15} />
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
