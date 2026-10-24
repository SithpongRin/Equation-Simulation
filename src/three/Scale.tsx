import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Pan } from './Pan';
import { useGameStore } from '../store/useGameStore';
import { ANTIQUE } from '../theme';
import {
  latheFromPairs,
  makeScrollGeometry,
  makePiercedBeamGeometry,
  makeStayRodGeometry,
  makePointerNeedleGeometry,
} from './ornaments';

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
  ctx.fillStyle = '#4A2614';
  ctx.fillRect(0, 0, size, size);

  // Layered wavy wood grain
  for (let i = 0; i < 200; i++) {
    const y0 = rand() * size;
    const amp = 3 + rand() * 8;
    const freq = 0.003 + rand() * 0.008;
    const phase = rand() * Math.PI * 2;
    const isDark = rand() > 0.45;

    ctx.strokeStyle = isDark
      ? `rgba(24, 10, 4, ${0.12 + rand() * 0.25})`
      : `rgba(195, 120, 65, ${0.07 + rand() * 0.16})`;
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
  const stayBarRef = useRef<THREE.Group>(null);
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

  // Core mechanical proportions (Roberval parallel linkage)
  const BEAM_HALF_SPAN = 2.85;
  const FULCRUM_Y = 1.08;
  const STAY_BAR_DROP = 0.28; // Vertical distance between main beam and lower parallel stay-bar
  const PAN_MOUNT_OFFSET_Y = 0.32;

  // Indicator dial geometry
  const DIAL_INNER_R = 0.72;
  const DIAL_OUTER_R = 0.92;
  const DIAL_HALF_ANGLE = 0.44;

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

    // Rotate main lever beam & parallel lower Roberval stay-bar in unison
    if (beamRef.current) {
      beamRef.current.rotation.z = angle;
    }
    if (stayBarRef.current) {
      stayBarRef.current.rotation.z = angle;
    }

    // Counter-rotate pan pivot groups right at the beam end pins (±BEAM_HALF_SPAN, 0, 0)
    // so the vertical stems stay strictly vertical and locked to both upper & lower pins
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

  // Shared luxury physical & standard materials
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
        roughness: 0.14,
        clearcoat: 0.75,
        clearcoatRoughness: 0.1,
      }),
      brassDark: new THREE.MeshStandardMaterial({
        color: ANTIQUE.brassDark,
        metalness: 0.84,
        roughness: 0.36,
      }),
      bronze: new THREE.MeshPhysicalMaterial({
        color: ANTIQUE.bronze,
        metalness: 0.82,
        roughness: 0.26,
        clearcoat: 0.45,
      }),
      iron: new THREE.MeshStandardMaterial({
        color: '#2F3644',
        metalness: 0.82,
        roughness: 0.28,
      }),
      ironDark: new THREE.MeshStandardMaterial({
        color: '#1C2029',
        metalness: 0.88,
        roughness: 0.32,
      }),
      steel: new THREE.MeshStandardMaterial({
        color: ANTIQUE.steel,
        metalness: 0.94,
        roughness: 0.16,
      }),
      velvet: new THREE.MeshStandardMaterial({
        color: ANTIQUE.velvet,
        roughness: 0.85,
        metalness: 0.04,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#E0F2FE',
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        roughness: 0.08,
        ior: 1.5,
      }),
    }),
    []
  );

  // 1. Classical baluster pillar geometry with fluted rings & stepped capital
  const columnGeometry = useMemo(() => {
    return latheFromPairs(
      [
        0.0, 0.0,
        0.35, 0.0,
        0.35, 0.03,
        0.31, 0.05,
        0.26, 0.085,
        0.28, 0.105,
        0.21, 0.14,
        0.16, 0.19,
        0.125, 0.27,
        0.11, 0.37,
        0.105, 0.45,
        0.135, 0.48,
        0.16, 0.50,
        0.135, 0.52,
        0.095, 0.54,
        0.095, 0.62,
        0.135, 0.65,
        0.175, 0.68,
        0.15, 0.71,
        0.0, 0.71,
      ],
      56
    );
  }, []);

  // 2. Pierced Victorian open-work truss beam geometry
  const beamGeometry = useMemo(() => makePiercedBeamGeometry(BEAM_HALF_SPAN), [BEAM_HALF_SPAN]);

  // 3. Lower parallel Roberval stay-rod geometry
  const stayRodGeometry = useMemo(() => makeStayRodGeometry(BEAM_HALF_SPAN), [BEAM_HALF_SPAN]);

  // 4. Sculpted clockwork pointer needle geometry
  const needleGeometry = useMemo(() => makePointerNeedleGeometry(), []);

  // 5. Ornate S-scroll side brackets flanking the pillar
  const scrollBracketGeo = useMemo(() => {
    return makeScrollGeometry({
      height: 0.48,
      topRadius: 0.095,
      bottomRadius: 0.075,
      tube: 0.017,
    });
  }, []);

  // 6. Indicator dial arc plate geometry
  const dialGeometry = useMemo(() => {
    const start = Math.PI / 2 - DIAL_HALF_ANGLE;
    const end = Math.PI / 2 + DIAL_HALF_ANGLE;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, DIAL_OUTER_R, start, end, false);
    shape.absarc(0, 0, DIAL_INNER_R, end, start, true);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      curveSegments: 56,
    });
  }, [DIAL_INNER_R, DIAL_OUTER_R, DIAL_HALF_ANGLE]);

  // Dial graduations
  const ticks = useMemo(() => {
    const list: { angle: number; major: boolean; label?: string }[] = [];
    const count = 17;
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
  }, [DIAL_HALF_ANGLE]);

  const isBalanced = balance.isBalanced;
  const jewelColor = isBalanced ? ANTIQUE.emerald : ANTIQUE.ruby;

  // Cutout positions along beam arms (must match makePiercedBeamGeometry)
  const beamCutouts = [
    { x: 0.58, r: 0.082 },
    { x: 1.12, r: 0.068 },
    { x: 1.62, r: 0.054 },
    { x: 2.08, r: 0.042 },
    { x: 2.46, r: 0.032 },
  ];

  return (
    <group position={[0, -0.65, 0]} scale={1.0}>
      {/* ================= 1. LUXURY MAHOGANY PLINTH WITH BAIZE INLAY & BRASS ORNAMENTS ================= */}
      {/* 4 Lathe-Turned Brass Claw/Bun Feet with Knurled Leveling Rings */}
      {[
        [-1.12, 0.44],
        [1.12, 0.44],
        [-1.12, -0.44],
        [1.12, -0.44],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.028, z]}>
          <mesh material={materials.brassBright} castShadow>
            <cylinderGeometry args={[0.082, 0.10, 0.055, 28]} />
          </mesh>
          <mesh position={[0, 0.032, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.brassDark}>
            <torusGeometry args={[0.085, 0.013, 12, 28]} />
          </mesh>
        </group>
      ))}

      {/* Lower Mahogany Tier */}
      <RoundedBox
        args={[2.52, 0.135, 1.08]}
        radius={0.038}
        smoothness={4}
        position={[0, 0.118, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={woodTexture} color="#6E3E22" roughness={0.34} metalness={0.05} />
      </RoundedBox>

      {/* Polished Brass Molding Trim around Lower Tier */}
      <mesh position={[0, 0.118, 0]} material={materials.brassBright}>
        <boxGeometry args={[2.538, 0.018, 1.098]} />
      </mesh>

      {/* Upper Stepped Walnut Tier */}
      <RoundedBox
        args={[1.96, 0.085, 0.80]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.222, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={woodTexture} color="#5A3018" roughness={0.32} metalness={0.05} />
      </RoundedBox>

      {/* Brass Edge Trim around Upper Tier */}
      <mesh position={[0, 0.222, 0]} material={materials.brass}>
        <boxGeometry args={[1.976, 0.014, 0.816]} />
      </mesh>

      {/* Recessed Apothecary Emerald-Teal Velvet / Baize Inlay Pad on Upper Plinth */}
      <mesh position={[0, 0.266, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.velvet}>
        <planeGeometry args={[1.76, 0.62]} />
      </mesh>
      {/* Brass Inlay Border around Velvet Pad */}
      <mesh position={[0, 0.265, 0]} material={materials.brassBright}>
        <boxGeometry args={[1.79, 0.004, 0.65]} />
      </mesh>

      {/* 4 Brass Corner Rosette Medallions on Upper Plinth */}
      {[
        [-0.86, 0.31],
        [0.86, 0.31],
        [-0.86, -0.31],
        [0.86, -0.31],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.268, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <circleGeometry args={[0.042, 20]} />
          </mesh>
          <mesh position={[0, 0.005, 0]} material={materials.brassDark}>
            <sphereGeometry args={[0.015, 12, 10]} />
          </mesh>
        </group>
      ))}

      {/* Dual Embedded Brass Spirit Bubble Levels */}
      {[-0.66, 0.66].map((x, i) => (
        <group key={i} position={[x, 0.268, 0.18]}>
          <mesh material={materials.brassBright} castShadow>
            <cylinderGeometry args={[0.068, 0.072, 0.02, 28]} />
          </mesh>
          <mesh position={[0, 0.011, 0]} material={materials.glass}>
            <cylinderGeometry args={[0.054, 0.054, 0.008, 24]} />
          </mesh>
          <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.052, 24]} />
            <meshBasicMaterial color={isBalanced ? '#34D399' : '#F59E0B'} opacity={0.75} transparent />
          </mesh>
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.018, 0.023, 24]} />
            <meshBasicMaterial color="#064E3B" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Ornate Engraved Maker's Plate on Front of Lower Tier */}
      <group position={[0, 0.12, 0.548]}>
        <RoundedBox
          args={[0.84, 0.084, 0.012]}
          radius={0.008}
          smoothness={3}
          material={materials.brassBright}
          castShadow
        />
        <mesh position={[0, 0, 0.007]}>
          <planeGeometry args={[0.79, 0.062]} />
          <meshStandardMaterial color="#18110B" roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.011]}
          fontSize={0.028}
          color={ANTIQUE.brassBright}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          fontWeight="bold"
        >
          ROBERVAL & CO. • PARIS 1884
        </Text>
        {[
          [-0.38, 0.027],
          [0.38, 0.027],
          [-0.38, -0.027],
          [0.38, -0.027],
        ].map(([rx, ry], idx) => (
          <mesh key={idx} position={[rx, ry, 0.008]} material={materials.brassDark}>
            <sphereGeometry args={[0.0065, 10, 8]} />
          </mesh>
        ))}
      </group>

      {/* ================= 2. CLASSICAL BRASS PILLAR, ROBERVAL CHEEKS & FULCRUM ================= */}
      {/* Molded Square Pedestal Base for Column */}
      <group position={[0, 0.268, 0]}>
        <RoundedBox args={[0.46, 0.042, 0.46]} radius={0.01} smoothness={3} position={[0, 0.02, 0]} material={materials.brass} castShadow />
        <mesh position={[0, 0.048, 0]} material={materials.brassDark}>
          <boxGeometry args={[0.38, 0.018, 0.38]} />
        </mesh>
      </group>

      {/* Turned Baluster Brass Column */}
      <mesh
        geometry={columnGeometry}
        position={[0, 0.31, 0]}
        material={materials.brass}
        castShadow
        receiveShadow
      />

      {/* Polished Brass Astragal Rings on Column */}
      <mesh position={[0, 0.67, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
        <torusGeometry args={[0.135, 0.016, 14, 40]} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
        <torusGeometry args={[0.20, 0.014, 14, 40]} />
      </mesh>

      {/* Twin Classical S-Scroll Side Brackets flanking the Column */}
      <group position={[-0.25, 0.46, 0]} rotation={[0, 0, 0.1]}>
        <mesh geometry={scrollBracketGeo} material={materials.brassBright} castShadow />
      </group>
      <group position={[0.25, 0.46, 0]} rotation={[0, Math.PI, -0.1]}>
        <mesh geometry={scrollBracketGeo} material={materials.brassBright} castShadow />
      </group>

      {/* Heavy Fulcrum Capital & Roberval Trunnion Housing */}
      <RoundedBox
        args={[0.44, 0.08, 0.28]}
        radius={0.02}
        smoothness={3}
        position={[0, 1.01, 0]}
        material={materials.brassDark}
        castShadow
      />

      {/* Front & Back Roberval Bearing Cheek Plates (supporting both Upper Fulcrum & Lower Stay-Bar) */}
      {[-0.125, 0.125].map((z, idx) => (
        <group key={idx} position={[0, 0.94, z]}>
          {/* Sculpted vertical cheek plate */}
          <RoundedBox
            args={[0.22, 0.40, 0.026]}
            radius={0.012}
            smoothness={3}
            material={materials.brass}
            castShadow
          />
          {/* Upper Fulcrum Bearing Cap */}
          <mesh position={[0, 0.14, z > 0 ? 0.018 : -0.018]} rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <cylinderGeometry args={[0.056, 0.056, 0.032, 24]} />
          </mesh>
          <mesh position={[0, 0.14, z > 0 ? 0.035 : -0.035]} material={materials.brassDark}>
            <torusGeometry args={[0.044, 0.009, 10, 24]} />
          </mesh>
          {/* Lower Roberval Stay-Bar Bearing Cap */}
          <mesh position={[0, -0.14, z > 0 ? 0.016 : -0.016]} rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
            <cylinderGeometry args={[0.042, 0.042, 0.026, 20]} />
          </mesh>
          <mesh position={[0, -0.14, z > 0 ? 0.032 : -0.032]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}>
            <cylinderGeometry args={[0.02, 0.02, 0.015, 16]} />
          </mesh>
        </group>
      ))}

      {/* Twin Rear Lyre Uprights Supporting the Sector Dial */}
      {[-0.22, 0.22].map((x, idx) => (
        <mesh
          key={idx}
          position={[x, 1.46, -0.13]}
          rotation={[0, 0, x > 0 ? -0.16 : 0.16]}
          material={materials.brass}
          castShadow
        >
          <cylinderGeometry args={[0.022, 0.028, 0.92, 16]} />
        </mesh>
      ))}
      {/* Central Rear Spine Post */}
      <mesh position={[0, 1.46, -0.135]} material={materials.brassDark} castShadow>
        <boxGeometry args={[0.055, 0.92, 0.032]} />
      </mesh>

      {/* ================= 3. ORNATE APOTHECARY SECTOR DIAL & EQUILIBRIUM JEWEL ================= */}
      <group position={[0, FULCRUM_Y, -0.13]}>
        {/* Outer Heavy Arched Brass Bezel */}
        <mesh geometry={dialGeometry} material={materials.brass} castShadow />

        {/* Polished Gold Rim Inlay */}
        <mesh position={[0, 0, 0.028]} material={materials.brassBright}>
          <ringGeometry
            args={[
              DIAL_OUTER_R - 0.02,
              DIAL_OUTER_R,
              56,
              1,
              Math.PI / 2 - DIAL_HALF_ANGLE,
              DIAL_HALF_ANGLE * 2,
            ]}
          />
        </mesh>
        <mesh position={[0, 0, 0.028]} material={materials.brassBright}>
          <ringGeometry
            args={[
              DIAL_INNER_R,
              DIAL_INNER_R + 0.018,
              56,
              1,
              Math.PI / 2 - DIAL_HALF_ANGLE,
              DIAL_HALF_ANGLE * 2,
            ]}
          />
        </mesh>

        {/* Ivory Porcelain Enamel Dial Sector Face */}
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry
            args={[
              DIAL_INNER_R + 0.018,
              DIAL_OUTER_R - 0.02,
              56,
              1,
              Math.PI / 2 - DIAL_HALF_ANGLE * 0.97,
              DIAL_HALF_ANGLE * 1.94,
            ]}
          />
          <meshStandardMaterial color={ANTIQUE.ivory} roughness={0.35} />
        </mesh>

        {/* Calibrated Tick Marks & Numerical Graduations */}
        {ticks.map((t, i) => {
          const rMid = (DIAL_INNER_R + DIAL_OUTER_R) / 2 + 0.015;
          const len = t.major ? 0.078 : 0.042;
          const isCenter = t.label === '0';
          const tickColor = isCenter ? jewelColor : t.major ? '#27190E' : '#785A40';

          return (
            <group key={i}>
              <mesh
                position={[-Math.sin(t.angle) * rMid, Math.cos(t.angle) * rMid, 0.033]}
                rotation={[0, 0, t.angle]}
              >
                <planeGeometry args={[t.major ? 0.013 : 0.007, len]} />
                <meshBasicMaterial color={tickColor} toneMapped={false} />
              </mesh>

              {t.label && (
                <Text
                  position={[
                    -Math.sin(t.angle) * (DIAL_INNER_R + 0.048),
                    Math.cos(t.angle) * (DIAL_INNER_R + 0.048),
                    0.034,
                  ]}
                  rotation={[0, 0, t.angle]}
                  fontSize={0.034}
                  color={isCenter ? jewelColor : '#27190E'}
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

        {/* Ornate Filigree Crown Cresting & Faceted Status Gemstone atop Dial */}
        <group position={[0, DIAL_OUTER_R + 0.06, 0.012]}>
          {/* Side Finial Volutes */}
          {[-0.12, 0.12].map((cx, idx) => (
            <mesh key={idx} position={[cx, -0.025, 0]} material={materials.brassBright}>
              <sphereGeometry args={[0.024, 14, 12]} />
            </mesh>
          ))}

          {/* Beaded Gold Mounting Base */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright} castShadow>
            <cylinderGeometry args={[0.095, 0.105, 0.034, 28]} />
          </mesh>
          <mesh material={materials.brassDark}>
            <torusGeometry args={[0.088, 0.013, 12, 28]} />
          </mesh>

          {/* Faceted Crystal Status Gemstone (Cabochon) */}
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.056, 28, 20]} />
            <meshStandardMaterial
              color={jewelColor}
              emissive={jewelColor}
              emissiveIntensity={isBalanced ? 2.8 : 1.8}
              roughness={0.1}
              metalness={0.12}
            />
          </mesh>

          {/* Top Finial Spire */}
          <mesh position={[0, 0.12, 0]} material={materials.brassBright} castShadow>
            <coneGeometry args={[0.026, 0.09, 16]} />
          </mesh>
          <mesh position={[0, 0.17, 0]} material={materials.brassBright}>
            <sphereGeometry args={[0.018, 12, 10]} />
          </mesh>

          {/* Point Light Casting Ambient Glow from Jewel */}
          <pointLight
            position={[0, 0, 0.14]}
            color={jewelColor}
            intensity={isBalanced ? 2.8 : 1.3}
            distance={2.8}
          />
        </group>
      </group>

      {/* ================= 4. LOWER PARALLEL ROBERVAL STAY-ROD ================= */}
      <group ref={stayBarRef} position={[0, FULCRUM_Y - STAY_BAR_DROP, 0]}>
        <mesh geometry={stayRodGeometry} material={materials.bronze} castShadow receiveShadow />
        {/* Central Stay-Rod Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright}>
          <cylinderGeometry args={[0.072, 0.072, 0.09, 24]} />
        </mesh>
      </group>

      {/* ================= 5. ROTATING PIERCED OPEN-WORK TRUSS BEAM ================= */}
      <group ref={beamRef} position={[0, FULCRUM_Y, 0]}>
        {/* Main Pierced Victorian Beam in Rich Burnished Gunmetal-Bronze */}
        <mesh geometry={beamGeometry} material={materials.iron} castShadow receiveShadow />

        {/* Polished Brass Beveled Rings Around the Pierced Cutouts (Both Front & Back Faces) */}
        {beamCutouts.map(({ x, r }, idx) => (
          <React.Fragment key={idx}>
            {[-x, x].map((cx, sIdx) => (
              <group key={sIdx} position={[cx, 0, 0]}>
                <mesh position={[0, 0, 0.056]} material={materials.brassBright}>
                  <torusGeometry args={[r + 0.008, 0.009, 10, 28]} />
                </mesh>
                <mesh position={[0, 0, -0.056]} material={materials.brassBright}>
                  <torusGeometry args={[r + 0.008, 0.009, 10, 28]} />
                </mesh>
              </group>
            ))}
          </React.Fragment>
        ))}

        {/* Dual Sliding Brass Poise Counterweights on Top Ridge */}
        {[-1.35, 1.35].map((x, idx) => (
          <group key={idx} position={[x, 0.14, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brassBright} castShadow>
              <cylinderGeometry args={[0.042, 0.042, 0.085, 24]} />
            </mesh>
            <mesh position={[0, 0.048, 0]} material={materials.brassDark}>
              <coneGeometry args={[0.018, 0.032, 14]} />
            </mesh>
          </group>
        ))}

        {/* Central Hub Boss with Stepped Brass Rings & Steel Knife-Edge Axle */}
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brass} castShadow>
            <cylinderGeometry args={[0.20, 0.20, 0.15, 36]} />
          </mesh>
          <mesh position={[0, 0, 0.08]} material={materials.brassBright}>
            <torusGeometry args={[0.16, 0.016, 12, 36]} />
          </mesh>
          <mesh position={[0, 0, -0.08]} material={materials.brassBright}>
            <torusGeometry args={[0.16, 0.016, 12, 36]} />
          </mesh>
          {/* Hardened Steel Axle Pin */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.steel}>
            <cylinderGeometry args={[0.068, 0.068, 0.19, 24]} />
          </mesh>
          {/* Center Front Brass Medallion */}
          <mesh position={[0, 0, 0.10]} material={materials.brassBright}>
            <sphereGeometry args={[0.034, 18, 14]} />
          </mesh>
        </group>

        {/* Sculpted Clockwork Spade-and-Lancet Indicator Needle */}
        <group position={[0, 0, -0.085]}>
          {/* Lower Teardrop Plumb-Bob Counterweight below pivot */}
          <mesh position={[0, -0.35, 0]} material={materials.brassBright} castShadow>
            <sphereGeometry args={[0.056, 20, 16]} />
          </mesh>
          <mesh position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]} material={materials.brassDark}>
            <coneGeometry args={[0.032, 0.06, 16]} />
          </mesh>

          {/* Sculpted Pierced Needle Blade */}
          <mesh geometry={needleGeometry} material={materials.brassBright} castShadow />

          {/* Glowing Status Jewel Inset Inside Needle's Diamond Eye */}
          <mesh position={[0, 0.555, 0.008]}>
            <sphereGeometry args={[0.018, 14, 12]} />
            <meshBasicMaterial color={jewelColor} />
          </mesh>
        </group>

        {/* End Pivot Bearing Housings at (±BEAM_HALF_SPAN, 0, 0) */}
        {[-BEAM_HALF_SPAN, BEAM_HALF_SPAN].map((x, idx) => (
          <group key={idx} position={[x, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.brass} castShadow>
              <cylinderGeometry args={[0.125, 0.125, 0.15, 32]} />
            </mesh>
            <mesh position={[0, 0, 0.078]} material={materials.brassBright}>
              <torusGeometry args={[0.10, 0.014, 12, 32]} />
            </mesh>
            <mesh position={[0, 0, -0.078]} material={materials.brassBright}>
              <torusGeometry args={[0.10, 0.014, 12, 32]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.steel}>
              <cylinderGeometry args={[0.046, 0.046, 0.175, 20]} />
            </mesh>
          </group>
        ))}

        {/* ================= LEFT TOP-MOUNTED PAN (Pivoted at exact left beam trunnion) ================= */}
        <group ref={leftPanPivotRef} position={[-BEAM_HALF_SPAN, 0, 0]}>
          <group position={[0, PAN_MOUNT_OFFSET_Y, 0]}>
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
        </group>

        {/* ================= RIGHT TOP-MOUNTED PAN (Pivoted at exact right beam trunnion) ================= */}
        <group ref={rightPanPivotRef} position={[BEAM_HALF_SPAN, 0, 0]}>
          <group position={[0, PAN_MOUNT_OFFSET_Y, 0]}>
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
    </group>
  );
};
