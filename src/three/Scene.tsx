import { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { Scale } from './Scale';
import { DragPlane } from './DragPlane';
import { useGameStore } from '../store/useGameStore';

export interface SceneHandle {
  resetCamera: () => void;
}

// Atmospheric antique amber dust motes
const AnimeParticles: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const count = 48;
  const meshRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    let seed = 9182;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 16;
      pos[i * 3 + 1] = rand() * 8 - 1;
      pos[i * 3 + 2] = (rand() - 0.5) * 10 - 2;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={isDark ? '#FBBF24' : '#D97706'}
        transparent
        opacity={isDark ? 0.45 : 0.28}
        depthWrite={false}
      />
    </points>
  );
};

// Laboratory / Apothecary Desk Mat & Floor Surface
const TableSurface: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <group position={[0, -0.68, 0]}>
      {/* Jeweler's Baize Felt Desk Mat directly beneath the scale */}
      <group position={[0, 0.005, 0]}>
        {/* Outer Brass / Walnut Desk Mat Frame */}
        <mesh receiveShadow position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.4, 3.6]} />
          <meshStandardMaterial
            color={isDark ? '#1E293B' : '#CBD5E1'}
            roughness={0.55}
            metalness={0.25}
          />
        </mesh>
        {/* Soft recessed baize desk mat */}
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.16, 3.36]} />
          <meshStandardMaterial
            color={isDark ? '#0F172A' : '#E2E8F0'}
            roughness={0.75}
            metalness={0.05}
          />
        </mesh>
        {/* Subtle center calibration ring beneath the scale plinth */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.48, 1.50, 64]} />
          <meshBasicMaterial color="#D4A843" opacity={isDark ? 0.35 : 0.45} transparent />
        </mesh>
      </group>

      {/* Infinite Seamless Floor Plane */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={isDark ? '#080C1E' : '#F1F5F9'}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
};

export const Scene = forwardRef<SceneHandle>((_, ref) => {
  const controlsRef = useRef<any>(null);
  const quality = useGameStore((s) => s.quality);
  const colorMode = useGameStore((s) => s.colorMode);
  const balance = useGameStore((s) => s.balanceMetrics);

  const isDark = colorMode === 'dark';
  const isLowQuality = quality === 'low';
  const maxDpr = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1;

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    },
  }));

  const fogColor = isDark ? '#0A0F24' : '#F1F5F9';

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 1.4, 10.0], fov: 40 }}
        dpr={[1, maxDpr]}
        gl={{
          antialias: !isLowQuality,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        shadows={!isLowQuality}
      >
        <fog attach="fog" args={[fogColor, 10, 25]} />

        {/* Local studio reflections so polished brass / iron read as real metal */}
        <Environment resolution={256} environmentIntensity={isDark ? 0.6 : 0.85}>
          <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[10, 3, 1]} rotation-x={Math.PI / 2.5} />
          <Lightformer form="rect" intensity={1.5} position={[-6, 2, 2]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.5} position={[6, 2, 2]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="ring" color="#FFE8C2" intensity={2} position={[0, 2, 8]} scale={3} />
          <Lightformer form="rect" color="#3B2A1A" intensity={0.6} position={[0, -3, 0]} scale={[20, 20, 1]} rotation-x={-Math.PI / 2} />
        </Environment>

        {/* Ambient lighting */}
        <ambientLight intensity={isDark ? 0.55 : 0.75} color={isDark ? '#E2E8F0' : '#FFFFFF'} />

        {/* Crisp Front/Top Key Light */}
        <directionalLight
          position={[2, 7, 7]}
          intensity={isDark ? 1.4 : 1.6}
          color="#FFF7EA"
          castShadow={!isLowQuality}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={5}
          shadow-camera-bottom={-3}
        />

        {/* Soft fill light from left and right */}
        <directionalLight
          position={[-6, 4, 3]}
          intensity={0.65}
          color="#FFF7EA"
        />
        <directionalLight
          position={[6, 4, 3]}
          intensity={0.65}
          color="#FFF7EA"
        />

        {/* Warm Front Key Fill for rich brass specular highlights */}
        <directionalLight
          position={[0, 2.5, 7.5]}
          intensity={isDark ? 0.95 : 1.1}
          color="#FFE8CE"
        />

        {/* Under-glow when solved */}
        {balance.isSolved && (
          <pointLight
            position={[0, 1.4, 0]}
            intensity={3.5}
            distance={10}
            color="#34D399"
          />
        )}

        {/* Particles */}
        {!isLowQuality && <AnimeParticles isDark={isDark} />}

        {/* Contact Shadows */}
        {!isLowQuality && (
          <ContactShadows
            position={[0, -0.64, 0]}
            opacity={isDark ? 0.7 : 0.45}
            scale={12}
            blur={1.8}
            far={4}
          />
        )}

        {/* 3D Balance Scale & Objects */}
        <Scale />

        {/* Table Surface Plinth */}
        <TableSurface isDark={isDark} />

        {/* Invisible Raycasting Drag Plane */}
        <DragPlane />

        {/* Controlled Orbit with Safe Bounds */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          minDistance={6}
          maxDistance={15}
          minPolarAngle={Math.PI / 4.5}
          maxPolarAngle={Math.PI / 2.15}
          minAzimuthAngle={-Math.PI / 3.8}
          maxAzimuthAngle={Math.PI / 3.8}
          dampingFactor={0.06}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
});

Scene.displayName = 'Scene';
