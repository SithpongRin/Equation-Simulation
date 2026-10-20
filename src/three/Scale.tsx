import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';

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
  const colorMode = useGameStore((s) => s.colorMode);
  const addToPan = useGameStore((s) => s.addToPan);
  const removeFromPan = useGameStore((s) => s.removeFromPan);

  const isDark = colorMode === 'dark';

  // Proportions faithfully matching reference vector design
  const BEAM_HALF_SPAN = 2.85;
  const FULCRUM_Y = 1.05;
  const PAN_MOUNT_OFFSET_Y = 0.32;

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

  // Authentic Marine Blue Palette from Reference
  const marineBlue = '#1D4E89';       // Deep marine blue lacquer
  const chromeMetal = '#E2E8F0';      // Polished stainless steel / chrome
  const basePlinth = isDark ? '#1E293B' : '#FFFFFF';
  const baseTrim = isDark ? '#334155' : '#E2E8F0';

  // 1. Single Continuous Gothic Arch Pillar Shape (Smooth curves, beveled edge, no stacked primitive glitches)
  const gothicArchGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at bottom center-left
    shape.moveTo(-0.48, 0);
    // Smooth flare at bottom left
    shape.quadraticCurveTo(-0.40, 0.22, -0.28, 0.55);
    // Waist curve up to fulcrum
    shape.quadraticCurveTo(-0.24, 0.95, -0.22, 1.05);
    // Gothic teardrop peak arch
    shape.quadraticCurveTo(-0.18, 1.48, 0, 1.62);
    // Symmetrical right side
    shape.quadraticCurveTo(0.18, 1.48, 0.22, 1.05);
    shape.quadraticCurveTo(0.24, 0.95, 0.28, 0.55);
    shape.quadraticCurveTo(0.40, 0.22, 0.48, 0);
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  // 2. Single Continuous Tapered Architectural Lever Beam Shape with Bevels
  const taperedBeamGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const halfSpan = BEAM_HALF_SPAN;
    // Top center -> Top right end -> Bottom right end -> Bottom center -> Bottom left end -> Top left end
    shape.moveTo(0, 0.15);
    shape.lineTo(halfSpan, 0.09);
    shape.lineTo(halfSpan, -0.09);
    shape.lineTo(0, -0.15);
    shape.lineTo(-halfSpan, -0.09);
    shape.lineTo(-halfSpan, 0.09);
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.018,
      bevelThickness: 0.018,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, [BEAM_HALF_SPAN]);

  return (
    <group position={[0, -0.65, 0]} scale={1.15}>
      {/* ================= 1. CLEAN TIERED PEDESTAL BASE ================= */}
      {/* Lower tiered plinth with soft chamfer */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.06, 0.62]} />
        <meshStandardMaterial
          color={baseTrim}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* Upper tiered plinth */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 0.05, 0.52]} />
        <meshStandardMaterial
          color={basePlinth}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* ================= 2. ARCHED TEARDROP FULCRUM HOUSING (BEVELED EXTRUSION) ================= */}
      <mesh
        geometry={gothicArchGeometry}
        position={[0, 0.81, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={marineBlue}
          roughness={0.28}
          metalness={0.18}
        />
      </mesh>

      {/* ================= 3. FORWARD-FACING HIGH-TECH STATUS LED ================= */}
      {/* Centered directly at fulcrum pivot height facing camera (+Z) */}
      <group position={[0, FULCRUM_Y, 0.15]}>
        {/* Outer Circular Chrome Bezel Collar */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 36]} />
          <meshStandardMaterial color={chromeMetal} metalness={0.88} roughness={0.12} />
        </mesh>

        {/* Dark Inner Cavity */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
          <cylinderGeometry args={[0.16, 0.16, 0.025, 32]} />
          <meshStandardMaterial color="#0B132B" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Glowing LED Outer Halo Ring */}
        <mesh position={[0, 0, 0.05]}>
          <torusGeometry args={[0.12, 0.016, 16, 36]} />
          <meshStandardMaterial
            color={balance.isBalanced ? '#10B981' : '#EF4444'}
            emissive={balance.isBalanced ? '#10B981' : '#EF4444'}
            emissiveIntensity={balance.isBalanced ? 2.5 : 2.0}
            roughness={0.1}
          />
        </mesh>

        {/* Forward-Facing Domed Crystal LED Lens */}
        <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.10, 24, 16]} />
          <meshStandardMaterial
            color={balance.isBalanced ? '#34D399' : '#F87171'}
            emissive={balance.isBalanced ? '#10B981' : '#EF4444'}
            emissiveIntensity={balance.isBalanced ? 3.5 : 3.0}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>

        {/* Real Front Illuminating Point Light */}
        <pointLight
          position={[0, 0, 0.18]}
          color={balance.isBalanced ? '#10B981' : '#EF4444'}
          intensity={balance.isBalanced ? 3.0 : 2.2}
          distance={3.2}
        />
      </group>

      {/* ================= 4. ROTATING TAPERED LEVER BEAM (BEVELED EXTRUSION) ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Main Solid Tapered Beam */}
        <mesh
          geometry={taperedBeamGeometry}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={marineBlue}
            roughness={0.28}
            metalness={0.2}
          />
        </mesh>

        {/* Left End Bearing Housing (Facing Camera +Z) */}
        <group position={[-BEAM_HALF_SPAN, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.20, 0.20, 0.18, 28]} />
            <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
          </mesh>
          {/* White Center Pivot Axle Dot */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} />
            <meshStandardMaterial color={chromeMetal} metalness={0.8} roughness={0.15} />
          </mesh>
        </group>

        {/* Right End Bearing Housing (Facing Camera +Z) */}
        <group position={[BEAM_HALF_SPAN, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.20, 0.20, 0.18, 28]} />
            <meshStandardMaterial color={marineBlue} roughness={0.3} metalness={0.2} />
          </mesh>
          {/* White Center Pivot Axle Dot */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} />
            <meshStandardMaterial color={chromeMetal} metalness={0.8} roughness={0.15} />
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
