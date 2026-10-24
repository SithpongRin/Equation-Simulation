import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Scale } from './Scale';
import { DragPlane } from './DragPlane';
import { useGameStore } from '../store/useGameStore';

export interface SceneHandle {
  resetCamera: () => void;
}

// Clean Floor & Subtle Shadow Disc (0ms GPU overhead for ultra-smooth 120 FPS)
const TableSurface: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <group position={[0, -0.68, 0]}>
      {/* Soft Ground Shadow Disc under the scale base */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 40]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isDark ? 0.38 : 0.14}
          depthWrite={false}
        />
      </mesh>

      {/* Seamless Clean Studio Floor */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={isDark ? '#0B1020' : '#F8FAFC'}
          roughness={0.92}
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

  const fogColor = isDark ? '#0B1020' : '#F8FAFC';

  return (
    <div className="w-full h-full relative select-none">
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
        <fog attach="fog" args={[fogColor, 12, 28]} />

        {/* Bright, Clean Studio Lighting (Fast single-pass lighting, no heavy environment cubemap pass) */}
        <ambientLight intensity={isDark ? 0.85 : 1.15} color="#FFFFFF" />

        <hemisphereLight
          args={['#FFFBEB', isDark ? '#1E293B' : '#E2E8F0', isDark ? 0.65 : 0.85]}
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

        {/* Clean Studio Floor */}
        <TableSurface isDark={isDark} />

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
