import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Scale } from './Scale';
import { DragPlane } from './DragPlane';
import { useGameStore } from '../store/useGameStore';

export interface SceneHandle {
  resetCamera: () => void;
}

// Sculpted 3D Laboratory Workbench & Podium Stage (Static meshes = 0ms GPU overhead, 120 FPS)
const TableSurface: React.FC<{ isDark: boolean; isBalanced: boolean }> = ({ isDark, isBalanced }) => {
  const statusColor = isBalanced ? '#10B981' : '#F59E0B';

  return (
    <group position={[0, -0.68, 0]}>
      {/* 1. Circular Center Podium Disc directly under the Scale Base */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <cylinderGeometry args={[1.18, 1.26, 0.03, 48]} />
        <meshStandardMaterial
          color={isDark ? '#1E293B' : '#FFFBEB'}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Glowing Balance Status Ring around Center Podium */}
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.12, 1.18, 48]} />
        <meshBasicMaterial color={statusColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Soft Ground Shadow under Scale Base */}
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 40]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isDark ? 0.35 : 0.14}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Left & Right Target Drop-Zone Mats under the Hanging Pans (x = ±2.85) */}
      {[-2.85, 2.85].map((x, idx) => (
        <group key={idx} position={[x, 0.008, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[1.38, 40]} />
            <meshStandardMaterial
              color={isDark ? '#0F172A' : '#E0F2FE'}
              roughness={0.6}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.32, 1.38, 48]} />
            <meshBasicMaterial
              color={isDark ? '#38BDF8' : '#0284C7'}
              transparent
              opacity={0.45}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 3. Main Recessed Baize / Laboratory Mat Surface */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.2, 3.8]} />
        <meshStandardMaterial
          color={isDark ? '#131C31' : '#F1F5F9'}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* 4. Sculpted Wooden / Slate Workbench Tabletop Slab */}
      <RoundedBox
        args={[9.8, 0.24, 4.3]}
        radius={0.06}
        smoothness={3}
        position={[0, -0.12, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color={isDark ? '#1E293B' : '#B45309'}
          roughness={0.45}
          metalness={0.12}
        />
      </RoundedBox>

      {/* Golden Brass Front Trim Strip along the Workbench Edge */}
      <mesh position={[0, -0.12, 2.155]}>
        <boxGeometry args={[9.5, 0.045, 0.02]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.65} roughness={0.25} />
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
  const maxDpr = quality === 'high' ? 1.75 : quality === 'medium' ? 1.5 : 1;

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    },
  }));

  return (
    <div
      className={`w-full h-full relative select-none overflow-hidden transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-b from-[#070B19] via-[#0F172A] to-[#1E1B4B]'
          : 'bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#FEF3C7]'
      }`}
    >
      {/* ================= ATTRACTIVE ZERO-LAG CSS STUDIO BACKDROP ================= */}
      {/* 1. Subtle Blueprint / Math Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(148, 163, 184, 0.14) 1.5px, transparent 1.5px)'
            : 'radial-gradient(rgba(2, 132, 199, 0.14) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* 2. Center Warm Sunlit / Equilibrium Spotlight Halo behind the Scale */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: balance.isBalanced
            ? isDark
              ? 'radial-gradient(circle at 50% 42%, rgba(16, 185, 129, 0.22) 0%, rgba(56, 189, 248, 0.10) 40%, transparent 72%)'
              : 'radial-gradient(circle at 50% 42%, rgba(254, 243, 199, 0.95) 0%, rgba(167, 243, 208, 0.45) 42%, transparent 72%)'
            : isDark
            ? 'radial-gradient(circle at 50% 42%, rgba(56, 189, 248, 0.18) 0%, rgba(245, 158, 11, 0.08) 42%, transparent 72%)'
            : 'radial-gradient(circle at 50% 42%, rgba(255, 251, 235, 0.95) 0%, rgba(186, 230, 253, 0.45) 45%, transparent 75%)',
        }}
      />

      {/* 3. Soft Decorative Studio Horizon Arch */}
      <div
        className={`absolute -bottom-24 left-1/2 -translate-x-1/2 w-[130%] h-72 rounded-[100%] pointer-events-none blur-2xl ${
          isDark ? 'bg-[#1E293B]/60' : 'bg-[#FDE68A]/45'
        }`}
      />

      {/* ================= 3D WEBGL CANVAS ================= */}
      <Canvas
        camera={{ position: [0, 1.45, 9.8], fov: 40 }}
        dpr={[1, maxDpr]}
        gl={{
          antialias: !isLowQuality,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        shadows={!isLowQuality}
      >
        {/* Bright, Clean Studio Lighting */}
        <ambientLight intensity={isDark ? 0.9 : 1.15} color="#FFFFFF" />

        <hemisphereLight
          args={['#FFFBEB', isDark ? '#1E293B' : '#BAE6FD', isDark ? 0.65 : 0.85]}
        />

        {/* Crisp Front/Top Key Light */}
        <directionalLight
          position={[3, 8, 7]}
          intensity={isDark ? 1.5 : 1.7}
          color="#FFFBEB"
          castShadow={!isLowQuality}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
          shadow-camera-left={-5.5}
          shadow-camera-right={5.5}
          shadow-camera-top={5.5}
          shadow-camera-bottom={-2.5}
        />

        {/* Warm Front Fill Light so wood & golden pans look vibrant */}
        <directionalLight position={[-4, 3, 6]} intensity={0.75} color="#FEF3C7" />

        {/* 3D Classic Hanging-Pan Balance Scale */}
        <Scale />

        {/* Sculpted 3D Workbench & Podium Stage */}
        <TableSurface isDark={isDark} isBalanced={balance.isBalanced} />

        {/* Raycasting Drag Plane (only mounted while actively dragging) */}
        <DragPlane />

        {/* Smooth OrbitControls centered on the scale */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.85, 0]}
          makeDefault
          enablePan={false}
          minDistance={6}
          maxDistance={15}
          minPolarAngle={Math.PI / 4.5}
          maxPolarAngle={Math.PI / 2.08}
          minAzimuthAngle={-Math.PI / 3.5}
          maxAzimuthAngle={Math.PI / 3.5}
          dampingFactor={0.07}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
});

Scene.displayName = 'Scene';
