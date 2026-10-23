import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';
import { ANTIQUE } from '../theme';
import { latheFromPairs, makeScrollGeometry, makePiercedBeamGeometry } from './ornaments';

// Procedural rich mahogany wood-grain texture (built once and cached)
let woodTextureCache: THREE.CanvasTexture | null = null;

const getWoodTexture = (): THREE.CanvasTexture => {
  if (woodTextureCache) return woodTextureCache;

  let seed = 4289;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm deep mahogany base
  ctx.fillStyle = '#462515';
  ctx.fillRect(0, 0, size, size);

  // Layered wavy wood grain
  for (let i = 0; i < 180; i++) {
    const y0 = rand() * size;
    const amp = 3 + rand() * 8;
    const freq = 0.003 + rand() * 0.008;
    const phase = rand() * Math.PI * 2;
    const isDark = rand() > 0.45;

    ctx.strokeStyle = isDark
      ? `rgba(28, 12, 5, ${0.1 + rand() * 0.25})`
      : `rgba(180, 110, 60, ${0.06 + rand() * 0.16})`;
    ctx.lineWidth = 0.8 + rand() * 2.5;

    ctx.beginPath();
    for (let x = 0; x <= size; x += 6) {
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

  // Core proportions
  const BEAM_HALF_SPAN = 2.85;
  const FULCRUM_Y = 1.05;
  const PAN_MOUNT_OFFSET_Y = 0.32;

  // Indicator dial geometry
  const DIAL_INNER_R = 0.74;
  const DIAL_OUTER_R = 0.90;
  const DIAL_HALF_ANGLE = 0.42;

  const woodTexture = useWoodTexture();

  useFrame((_, delta) => {
    const targetAngle = balance.angleRad;
    const dt = Math.min(delta, 0.05);

    // Realistic physics spring-damping
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

  // Shared antique materials
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
      bronze: new THREE.MeshStandardMaterial({
        color: ANTIQUE.bronze,
        metalness: 0.88,
        roughness: 0.32,
      }),
      iron: new THREE.MeshStandardMaterial({
        color: '#383E4A',
        metalness: 0.85,
        roughness: 0.30,
      }),
      ironDark: new THREE.MeshStandardMaterial({
        color: '#20242C',
        metalness: 0.88,
        roughness: 0.36,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#E0F2FE',
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
      }),
    }),
    []
  );

  // 1. Classical baluster pillar geometry with fluted rings & stepped capital
  const columnGeometry = useMemo(() => {
    return latheFromPairs([
      0.0, 0.0,
      0.34, 0.0,
      0.34, 0.03,
      0.30, 0.05,
      0.26, 0.08,
      0.28, 0.10,
      0.22, 0.13,
      0.17, 0.18,
      0.13, 0.25,
      0.11, 0.35,
      0.10, 0.44,
      0.125, 0.47,
      0.15, 0.49,
      0.125, 0.51,
      0.09, 0.53,
      0.09, 0.60,
      0.13, 0.63,
      0.17, 0.65,
      0.14, 0.68,
      0.0, 0.68,
    ], 48);
  }, []);

  // 2. Pierced Victorian open-work truss beam geometry
  const beamGeometry = useMemo(() => {
    const geo = makePiercedBeamGeometry(BEAM_HALF_SPAN);
    geo.center();
    return geo;
  }, [BEAM_HALF_SPAN]);

  // 3. Ornate S-scroll side brackets flanking the pillar
  const scrollBracketGeo = useMemo(() => {
    return makeScrollGeometry({
      height: 0.45,
      topRadius: 0.09,
      bottomRadius: 0.07,
      tube: 0.016,
    });
  }, []);

  // 4. Indicator dial arc plate geometry
  const dialGeometry = useMemo(() => {
    const start = Math.PI / 2 - DIAL_HALF_ANGLE;
    const end = Math.PI / 2 + DIAL_HALF_ANGLE;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, DIAL_OUTER_R, start, end, false);
    shape.absarc(0, 0, DIAL_INNER_R, end, start, true);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      curveSegments: 48,
    });
  }, []);

  // Dial graduations
  const ticks = useMemo(() => {
    const list: { angle: number; major: boolean; label?: string }[] = [];
    const count = 17; // Detailed fine graduations
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const a = -DIAL_HALF_ANGLE * 0.88 + t * DIAL_HALF_ANGLE * 1.76;
      const isCenter = i === (count - 1) / 2;
      const isMajor = i % 4 === 0 || isCenter;
      const val = (i - (count - 1) / 2) / 2;
      list.push({
        angle: a,
        major: isMajor,
        label: isMajor ? (val === 0 ? '0' : val > 0 ? `+${val}` : `${val}`) : undefined,
      });
    }
    return list;
  }, []);

  const isBalanced = balance.isBalanced;
  const jewelColor = isBalanced ? ANTIQUE.emerald : ANTIQUE.ruby;

  return (
    <group position={[0, -0.65, 0]} scale={1.0}>
      {/* ================= 1. LUXURY MAHOGANY PLINTH WITH BRASS ORNAMENTS ================= */}
      {/* 4 Lathe-Turned Brass Bun Feet with Knurled Leveling Rings */}
      {[
        [-1.02, 0.40],
        [1.02, 0.40],
        [-1.02, -0.40],
        [1.02, -0.40],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.025, z]}>
          <mesh material={materials.brassBright} castShadow>
            <cylinderGeometry args={[0.075, 0.09, 0.05, 24]} />
          </mesh>
          <mesh position={[0, 0.035, 0]} material={materials.brassDark}>
            <torusGeometry args={[0.078, 0.012, 10, 24]} />
          </mesh>
        </group>
      ))}

      {/* Lower Walnut Tier */}
      <RoundedBox
        args={[2.3, 0.13, 1.0]}
        radius={0.035}
        smoothness={4}
        position={[0, 0.115, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={woodTexture} color="#683B20" roughness={0.38} metalness={0.04} />
      </RoundedBox>

      {/* Polished Brass Inlay Bead around Lower Tier */}
      <mesh position={[0, 0.115, 0]} material={materials.brassBright}>
        <boxGeometry args={[2.316, 0.016, 1.016]} />
      </mesh>

      {/* Upper Walnut Tier with soft chamfer */}
      <RoundedBox
        args={[1.8, 0.08, 0.74]}
        radius={0.028}
        smoothness={4}
        position={[0, 0.22, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={woodTexture} color="#582F18" roughness={0.34} metalness={0.04} />
      </RoundedBox>

      {/* Brass Edge Trim around Upper Tier */}
      <mesh position={[0, 0.22, 0]} material={materials.brass}>
        <boxGeometry args={[1.812, 0.012, 0.752]} />
      </mesh>

      {/* 4 Brass Corner Filigree L-Brackets on Upper Plinth */}
      {[
        [-0.84, 0.32],
        [0.84, 0.32],
        [-0.84, -0.32],
        [0.84, -0.32],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.262, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <planeGeometry args={[0.09, 0.09]} />
          </mesh>
          {/* Corner Stud Rivet */}
          <mesh position={[0, 0.006, 0]} material={materials.brassDark}>
            <sphereGeometry args={[0.014, 12, 8]} />
          </mesh>
        </group>
      ))}

      {/* Dual Embedded Brass Spirit Bubble Levels */}
      {[-0.62, 0.62].map((x, i) => (
        <group key={i} position={[x, 0.262, -0.22]}>
          {/* Brass Bezel Collar */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <cylinderGeometry args={[0.065, 0.065, 0.018, 24]} />
          </mesh>
          {/* Glass Lens */}
          <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.glass}>
            <cylinderGeometry args={[0.052, 0.052, 0.008, 24]} />
          </mesh>
          {/* Emerald / Gold spirit fluid */}
          <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 24]} />
            <meshBasicMaterial color="#34D399" opacity={0.65} transparent />
          </mesh>
          {/* Center Target Bubble Ring */}
          <mesh position={[0, 0.011, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.018, 0.022, 20]} />
            <meshBasicMaterial color="#064E3B" />
          </mesh>
        </group>
      ))}

      {/* Ornate Engraved Maker's Plate on Front */}
      <group position={[0, 0.12, 0.508]}>
        {/* Main Brass Plaque */}
        <RoundedBox args={[0.74, 0.08, 0.01]} radius={0.006} smoothness={3} material={materials.brassBright} castShadow />
        {/* Dark Inset Panel */}
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[0.70, 0.06]} />
          <meshStandardMaterial color="#1C140D" roughness={0.6} />
        </mesh>
        {/* Engraved Gold Text */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.030}
          color={ANTIQUE.brassBright}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          fontWeight="bold"
        >
          ROBERVAL & CO. • 1884
        </Text>
        {/* 4 Corner Rivets */}
        {[
          [-0.34, 0.026],
          [0.34, 0.026],
          [-0.34, -0.026],
          [0.34, -0.026],
        ].map(([rx, ry], idx) => (
          <mesh key={idx} position={[rx, ry, 0.007]} material={materials.brassDark}>
            <sphereGeometry args={[0.006, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* ================= 2. CLASSICAL BRASS PILLAR & FULCRUM ================= */}
      {/* Molded Square Pedestal Base for Column */}
      <group position={[0, 0.26, 0]}>
        <mesh position={[0, 0.02, 0]} material={materials.brass} castShadow>
          <boxGeometry args={[0.42, 0.04, 0.42]} />
        </mesh>
        <mesh position={[0, 0.045, 0]} material={materials.brassDark}>
          <boxGeometry args={[0.36, 0.016, 0.36]} />
        </mesh>
      </group>

      {/* Turned Baluster Brass Column */}
      <mesh
        geometry={columnGeometry}
        position={[0, 0.30, 0]}
        material={materials.brass}
        castShadow
        receiveShadow
      />

      {/* Polished Brass Astragal Ring on Column */}
      <mesh position={[0, 0.65, 0]} material={materials.brassBright}>
        <torusGeometry args={[0.13, 0.015, 12, 36]} />
      </mesh>

      {/* Twin Classical S-Scroll Side Brackets flanking the Column */}
      <group position={[-0.24, 0.44, 0]} rotation={[0, 0, 0.12]}>
        <mesh geometry={scrollBracketGeo} material={materials.brassBright} castShadow />
      </group>
      <group position={[0.24, 0.44, 0]} rotation={[0, Math.PI, -0.12]}>
        <mesh geometry={scrollBracketGeo} material={materials.brassBright} castShadow />
      </group>

      {/* Heavy Knife-Edge Saddle Block */}
      <RoundedBox
        args={[0.42, 0.09, 0.28]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.98, 0]}
        material={materials.brassDark}
        castShadow
      />

      {/* Side Trunnion Bearing Caps with Knurled Thumb-Nuts */}
      {[-0.15, 0.15].map((z, idx) => (
        <group key={idx} position={[0, 0.98, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 24]} />
          </mesh>
          <mesh position={[0, 0, z > 0 ? 0.025 : -0.025]} material={materials.brassDark}>
            <torusGeometry args={[0.042, 0.008, 8, 20]} />
          </mesh>
        </group>
      ))}

      {/* Rear Upright Supporting the Fixed Dial */}
      <mesh position={[0, 1.48, -0.14]} material={materials.brassDark} castShadow>
        <boxGeometry args={[0.06, 0.95, 0.04]} />
      </mesh>

      {/* ================= 3. ORNATE APOTHECARY SECTOR DIAL & JEWEL ================= */}
      <group position={[0, FULCRUM_Y, -0.13]}>
        {/* Outer Heavy Arched Brass Bezel */}
        <mesh geometry={dialGeometry} material={materials.brass} castShadow />

        {/* Polished Rim Inlay */}
        <mesh position={[0, 0, 0.026]} material={materials.brassBright}>
          <ringGeometry
            args={[
              DIAL_OUTER_R - 0.018,
              DIAL_OUTER_R,
              48,
              1,
              Math.PI / 2 - DIAL_HALF_ANGLE,
              DIAL_HALF_ANGLE * 2,
            ]}
          />
        </mesh>

        {/* Ivory Enamel Dial Sector Face */}
        <mesh position={[0, 0, 0.028]}>
          <ringGeometry
            args={[
              DIAL_INNER_R + 0.018,
              DIAL_OUTER_R - 0.022,
              48,
              1,
              Math.PI / 2 - DIAL_HALF_ANGLE * 0.96,
              DIAL_HALF_ANGLE * 1.92,
            ]}
          />
          <meshStandardMaterial color={ANTIQUE.ivory} roughness={0.42} />
        </mesh>

        {/* Calibrated Tick Marks & Numerical Graduations */}
        {ticks.map((t, i) => {
          const rMid = (DIAL_INNER_R + DIAL_OUTER_R) / 2;
          const len = t.major ? 0.075 : 0.040;
          const isCenter = t.label === '0';
          const tickColor = isCenter
            ? jewelColor
            : t.major
            ? '#2C1D11'
            : '#71533B';

          return (
            <group key={i}>
              <mesh
                position={[-Math.sin(t.angle) * rMid, Math.cos(t.angle) * rMid, 0.032]}
                rotation={[0, 0, t.angle]}
              >
                <planeGeometry args={[t.major ? 0.012 : 0.007, len]} />
                <meshBasicMaterial color={tickColor} toneMapped={false} />
              </mesh>

              {/* Major labels */}
              {t.label && (
                <Text
                  position={[
                    -Math.sin(t.angle) * (DIAL_INNER_R + 0.045),
                    Math.cos(t.angle) * (DIAL_INNER_R + 0.045),
                    0.033,
                  ]}
                  rotation={[0, 0, t.angle]}
                  fontSize={0.032}
                  color={isCenter ? jewelColor : '#2C1D11'}
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                >
                  {t.label}
                </Text>
              )}
            </group>
          );
        })}

        {/* Ornate Filigree Crown Cresting atop Dial */}
        <group position={[0, DIAL_OUTER_R + 0.05, 0.01]}>
          {/* Beaded Mounting Base */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <cylinderGeometry args={[0.09, 0.09, 0.03, 24]} />
          </mesh>

          {/* Golden Beaded Rim */}
          <mesh material={materials.brassDark}>
            <torusGeometry args={[0.082, 0.012, 10, 24]} />
          </mesh>

          {/* Faceted Crystal Status Gemstone (Cabochon) */}
          <mesh position={[0, 0, 0.018]}>
            <sphereGeometry args={[0.052, 24, 16]} />
            <meshStandardMaterial
              color={jewelColor}
              emissive={jewelColor}
              emissiveIntensity={isBalanced ? 2.6 : 1.8}
              roughness={0.12}
              metalness={0.1}
            />
          </mesh>

          {/* Point Light Casting Ambient Glow from Jewel */}
          <pointLight
            position={[0, 0, 0.12]}
            color={jewelColor}
            intensity={isBalanced ? 2.5 : 1.2}
            distance={2.5}
          />
        </group>
      </group>

      {/* ================= 4. ROTATING PIERCED OPEN-WORK TRUSS BEAM ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Main Pierced Victorian Beam */}
        <mesh
          geometry={beamGeometry}
          material={materials.iron}
          castShadow
          receiveShadow
        />

        {/* Polished Brass Top & Bottom Inlay Ribs along the Beam */}
        <mesh position={[0, 0.065, 0.062]} material={materials.brassBright}>
          <boxGeometry args={[BEAM_HALF_SPAN * 1.85, 0.014, 0.005]} />
        </mesh>
        <mesh position={[0, -0.065, 0.062]} material={materials.brassBright}>
          <boxGeometry args={[BEAM_HALF_SPAN * 1.85, 0.014, 0.005]} />
        </mesh>

        {/* Brass Beveled Rings Around the Pierced Cutouts */}
        {[-2.05, -1.35, -0.65, 0.65, 1.35, 2.05].map((x, idx) => {
          const r = Math.abs(x) > 1.8 ? 0.04 : Math.abs(x) > 1.0 ? 0.055 : 0.075;
          return (
            <group key={idx} position={[x, 0, 0.058]}>
              <mesh material={materials.brassBright}>
                <torusGeometry args={[r + 0.008, 0.009, 10, 24]} />
              </mesh>
            </group>
          );
        })}

        {/* Dual Sliding Poise Counterweights on Top Ridge */}
        {[-1.15, 1.15].map((x, idx) => (
          <group key={idx} position={[x, 0.11, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.08, 20]} />
            </mesh>
            <mesh position={[0, 0.045, 0]} material={materials.brassDark}>
              <coneGeometry args={[0.018, 0.03, 12]} />
            </mesh>
          </group>
        ))}

        {/* Central Hub Boss with Stepped Brass Rings */}
        <group position={[0, 0, 0.02]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brass} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.18, 36]} />
          </mesh>
          {/* Outer Beaded Ring */}
          <mesh position={[0, 0, 0.095]} material={materials.brassBright}>
            <torusGeometry args={[0.145, 0.016, 12, 36]} />
          </mesh>
          {/* Inner Steel Hardened Axle Pin */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.105]} material={materials.ironDark}>
            <cylinderGeometry args={[0.065, 0.065, 0.035, 24]} />
          </mesh>
          {/* Center Brass Medallion */}
          <mesh position={[0, 0, 0.125]} material={materials.brassBright}>
            <sphereGeometry args={[0.028, 16, 12]} />
          </mesh>
        </group>

        {/* Ornate Pierced Indicator Needle Rising from Hub */}
        <group position={[0, 0, -0.082]}>
          {/* Lower Teardrop Plumb-Bob Counterweight below pivot */}
          <mesh position={[0, -0.32, 0]} material={materials.brassBright} castShadow>
            <sphereGeometry args={[0.062, 18, 14]} />
          </mesh>
          <mesh position={[0, -0.16, 0]} material={materials.brass}>
            <cylinderGeometry args={[0.016, 0.028, 0.28, 12]} />
          </mesh>

          {/* Main Needle Shaft - Polished Golden Brass */}
          <mesh position={[0, 0.44, 0]} material={materials.brassBright} castShadow>
            <cylinderGeometry args={[0.012, 0.024, 0.62, 12]} />
          </mesh>

          {/* Ornate Pierced Fleur-de-lis / Arrow Pointer Tip */}
          <group position={[0, 0.82, 0]}>
            {/* Fine Pointer Tip Arrow */}
            <mesh material={materials.brassBright}>
              <coneGeometry args={[0.032, 0.16, 16]} />
            </mesh>
            {/* Diamond filigree crest on needle */}
            <mesh position={[0, -0.07, 0]} rotation={[0, 0, Math.PI / 4]} material={materials.brassBright}>
              <boxGeometry args={[0.065, 0.065, 0.014]} />
            </mesh>
            {/* Center Jewel Dot on needle */}
            <mesh position={[0, -0.07, 0.008]}>
              <sphereGeometry args={[0.016, 12, 10]} />
              <meshBasicMaterial color={jewelColor} />
            </mesh>
          </group>
        </group>

        {/* End Pivot Bearing Housings */}
        {[-BEAM_HALF_SPAN, BEAM_HALF_SPAN].map((x, idx) => (
          <group key={idx} position={[x, 0, 0]}>
            {/* Turned Outer Housing */}
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brass} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.16, 30]} />
            </mesh>
            {/* Beaded Ring */}
            <mesh position={[0, 0, 0.082]} material={materials.brassBright}>
              <torusGeometry args={[0.105, 0.014, 10, 30]} />
            </mesh>
            {/* Steel Knife-Edge Bearing Pin */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]} material={materials.ironDark}>
              <cylinderGeometry args={[0.048, 0.048, 0.03, 20]} />
            </mesh>
          </group>
        ))}

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
