import { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Scale } from './Scale';
import { DragPlane } from './DragPlane';
import { useGameStore } from '../store/useGameStore';

export interface SceneHandle {
  resetCamera: () => void;
}

// Atmospheric anime magical particles
const AnimeParticles: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const count = 40;
  const meshRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 8 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.025;
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
        size={0.07}
        color={isDark ? '#60A5FA' : '#818CF8'}
        transparent
        opacity={isDark ? 0.45 : 0.3}
        depthWrite={false}
      />
    </points>
  );
};

// Pedestal Plinth Table
const TableSurface: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <group position={[0, -0.72, 0]}>
      {/* Rectangular Wooden Pedestal Table */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[9, 0.2, 5]} />
        <meshStandardMaterial
          color={isDark ? '#0A0F24' : '#E2E8F0'}
          roughness={0.7}
          metalness={0.1}
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
        camera={{ position: [0, 1.2, 7.5], fov: 36 }}
        dpr={[1, maxDpr]}
        gl={{
          antialias: !isLowQuality,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        shadows={!isLowQuality}
      >
        <fog attach="fog" args={[fogColor, 10, 25]} />

        {/* Ambient lighting */}
        <ambientLight intensity={isDark ? 0.9 : 1.2} color={isDark ? '#E2E8F0' : '#FFFFFF'} />

        {/* Crisp Front/Top Key Light */}
        <directionalLight
          position={[0, 6, 8]}
          intensity={isDark ? 1.4 : 1.5}
          color="#FFFFFF"
          castShadow={!isLowQuality}
        />

        {/* Soft fill light from left and right */}
        <directionalLight
          position={[-6, 4, 3]}
          intensity={0.6}
          color="#E2E8F0"
        />
        <directionalLight
          position={[6, 4, 3]}
          intensity={0.6}
          color="#E2E8F0"
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
          minDistance={5}
          maxDistance={11}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={-Math.PI / 5}
          maxAzimuthAngle={Math.PI / 5}
          dampingFactor={0.06}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
});

Scene.displayName = 'Scene';
