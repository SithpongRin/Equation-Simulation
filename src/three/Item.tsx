import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ItemThemeId } from '../theme';

// ================= CONTINUOUS SMOOTH 3D CURVED BANANA MESH =================
const SeamlessBanana: React.FC = () => {
  const geometry = useMemo(() => {
    const numSlices = 28; // high density smooth curve
    const numRadial = 7;  // subtle faceted ridges with smooth normals
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    // Crescent curve math: smooth sag in the middle, curving upward at both ends
    for (let i = 0; i <= numSlices; i++) {
      const t = i / numSlices;
      const x = (t - 0.5) * 0.58;
      const y = 0.05 + Math.pow(t - 0.5, 2) * 0.42;
      const z = Math.sin(t * Math.PI) * 0.05;

      // Curve tangent vector
      const dx = 0.58;
      const dy = 2 * (t - 0.5) * 0.42;
      const dz = Math.cos(t * Math.PI) * Math.PI * 0.05;
      const tangent = new THREE.Vector3(dx, dy, dz).normalize();

      // Normal and binormal for radial expansion
      const up = new THREE.Vector3(0, 0, 1);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      // Realistic banana tapering: thick at belly, slender at ends
      const r = Math.sin(t * Math.PI) * 0.072 + 0.014;

      for (let j = 0; j <= numRadial; j++) {
        const theta = (j / numRadial) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const vx = x + (normal.x * cos + binormal.x * sin) * r;
        const vy = y + (normal.y * cos + binormal.y * sin) * r;
        const vz = z + (normal.z * cos + binormal.z * sin) * r;

        positions.push(vx, vy, vz);
        uvs.push(t, j / numRadial);
      }
    }

    // Connect vertices into smooth triangle mesh
    for (let i = 0; i < numSlices; i++) {
      for (let j = 0; j < numRadial; j++) {
        const a = i * (numRadial + 1) + j;
        const b = (i + 1) * (numRadial + 1) + j;
        const c = (i + 1) * (numRadial + 1) + (j + 1);
        const d = i * (numRadial + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group rotation={[0.2, 0.45, 0.1]} position={[0, 0.08, 0]}>
      {/* 1. Continuous Seamless Glossy Yellow Banana Body */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#FDE047"
          roughness={0.22}
          metalness={0.06}
        />
      </mesh>

      {/* 2. Realistic Curved Green Stem at top end */}
      <group position={[-0.30, 0.17, 0]} rotation={[0, 0, 0.52]}>
        <mesh position={[0, 0.035, 0]} castShadow>
          <cylinderGeometry args={[0.013, 0.021, 0.075, 12]} />
          <meshStandardMaterial color="#84CC16" roughness={0.4} />
        </mesh>
        {/* Cut brown stalk cap */}
        <mesh position={[0, 0.074, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.016, 10]} />
          <meshStandardMaterial color="#5A3A1A" roughness={0.8} />
        </mesh>
      </group>

      {/* 3. Dark flower tip at bottom end */}
      <mesh position={[0.30, 0.17, 0]} castShadow>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshStandardMaterial color="#3E2712" roughness={0.9} />
      </mesh>
    </group>
  );
};

interface ItemProps {
  position: [number, number, number];
  theme?: ItemThemeId;
  variantIndex?: number;
  scale?: number;
  onClick?: () => void;
}

export const Item: React.FC<ItemProps> = ({
  position,
  theme = 'fruits',
  variantIndex = 0,
  scale = 2.2,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Soft resting floating bob
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 2.2 + position[0] * 4 + position[2] * 3;
      groupRef.current.position.y = position[1] + Math.sin(t) * 0.01;
    }
  });

  const renderFruit = () => {
    const fruitType = variantIndex % 6;

    if (fruitType === 0) {
      // Anime Cherry Red Apple with Cute Leaf
      return (
        <group>
          {/* Main Apple Body - Vibrant Red Gloss */}
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.17, 20, 16]} />
            <meshStandardMaterial
              color="#EF4444"
              roughness={0.15}
              metalness={0.15}
            />
          </mesh>
          {/* Top indentation */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.12, 0.04, 16]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.25} />
          </mesh>
          {/* Cute Anime Stem */}
          <mesh position={[0, 0.36, 0]} rotation={[0.15, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.018, 0.024, 0.12, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.6} />
          </mesh>
          {/* Vibrant Green Anime Leaf */}
          <mesh position={[0.06, 0.38, 0]} rotation={[0.3, 0.2, 0.6]} castShadow>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshStandardMaterial color="#22C55E" roughness={0.25} />
          </mesh>
        </group>
      );
    } else if (fruitType === 1) {
      // Golden Anime Mango
      return (
        <group rotation={[0.2, 0.4, 0.2]}>
          <mesh position={[0, 0.18, 0]} scale={[1, 1.45, 0.85]} castShadow receiveShadow>
            <sphereGeometry args={[0.14, 18, 16]} />
            <meshStandardMaterial
              color="#FBBF24"
              roughness={0.18}
              metalness={0.12}
            />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.018, 0.07, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.7} />
          </mesh>
        </group>
      );
    } else if (fruitType === 2) {
      // Authentic Seamless Curved 3D Banana
      return <SeamlessBanana />;
    } else if (fruitType === 3) {
      // Ruby Anime Rambutan
      return (
        <group>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.16, 18, 16]} />
            <meshStandardMaterial color="#E11D48" roughness={0.25} />
          </mesh>
          {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.16, 0.19, Math.sin(angle) * 0.16]}
              scale={[0.55, 0.55, 0.55]}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#FDE047" roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    } else if (fruitType === 4) {
      // Neon Anime Dragon Fruit
      return (
        <group>
          <mesh position={[0, 0.17, 0]} scale={[0.9, 1.35, 0.9]} castShadow receiveShadow>
            <sphereGeometry args={[0.15, 18, 16]} />
            <meshStandardMaterial
              color="#F43F5E"
              roughness={0.2}
              metalness={0.12}
            />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <coneGeometry args={[0.055, 0.095, 8]} />
            <meshStandardMaterial color="#10B981" roughness={0.3} />
          </mesh>
        </group>
      );
    } else {
      // Cute Anime Coconut
      return (
        <group>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.17, 18, 16]} />
            <meshStandardMaterial
              color="#92400E"
              roughness={0.75}
              metalness={0.06}
            />
          </mesh>
          <mesh position={[0.045, 0.3, 0.08]} scale={0.7}>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshStandardMaterial color="#451A03" />
          </mesh>
          <mesh position={[-0.045, 0.3, 0.08]} scale={0.7}>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshStandardMaterial color="#451A03" />
          </mesh>
        </group>
      );
    }
  };

  const renderOtherTheme = () => {
    if (theme === 'sweets') {
      return (
        <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.16, 18, 16]} />
          <meshStandardMaterial color="#EC4899" roughness={0.15} metalness={0.2} />
        </mesh>
      );
    } else if (theme === 'toys') {
      return (
        <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.2} metalness={0.25} />
        </mesh>
      );
    } else {
      return (
        <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.16, 18, 16]} />
          <meshStandardMaterial color="#8B5CF6" roughness={0.15} metalness={0.5} />
        </mesh>
      );
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {theme === 'fruits' ? renderFruit() : renderOtherTheme()}
    </group>
  );
};
