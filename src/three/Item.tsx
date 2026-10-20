import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ItemThemeId } from '../theme';

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
      // ================= BEAUTIFUL CURVED FACETED 3D BANANA =================
      // Naturally curved crescent banana with 5 facets, green/brown stem, and dark tip
      return (
        <group position={[0, 0.08, 0]} rotation={[0.2, 0.5, 0.1]}>
          {/* Main curved banana body assembled from gracefully tapered arched segments */}
          {[-0.24, -0.16, -0.08, 0, 0.08, 0.16, 0.24].map((xOffset, i, arr) => {
            const t = (i + 0.5) / arr.length;
            // Crescent sag: middle is lowest, tips curve up
            const yOffset = 0.08 + Math.pow(t - 0.5, 2) * 0.42;
            const zOffset = Math.sin(t * Math.PI) * 0.06;
            // Radius profile: thick in belly, tapered at ends
            const radius = Math.sin(t * Math.PI) * 0.075 + 0.028;
            // Subtle angle along curve
            const rotZ = -(t - 0.5) * 0.9;

            return (
              <mesh
                key={i}
                position={[xOffset * 0.95, yOffset, zOffset]}
                rotation={[0, 0, rotZ]}
                castShadow
                receiveShadow
              >
                {/* 5-sided faceted banana geometry */}
                <cylinderGeometry args={[radius * 0.92, radius, 0.09, 5]} />
                <meshStandardMaterial
                  color="#FACC15"
                  roughness={0.25}
                  metalness={0.06}
                />
              </mesh>
            );
          })}

          {/* Green-tinged curved stem at top */}
          <group position={[-0.26, 0.22, 0]} rotation={[0, 0, 0.45]}>
            <mesh position={[0, 0.03, 0]} castShadow>
              <cylinderGeometry args={[0.016, 0.024, 0.07, 6]} />
              <meshStandardMaterial color="#65A30D" roughness={0.5} />
            </mesh>
            {/* Dark cut stem end */}
            <mesh position={[0, 0.068, 0]}>
              <cylinderGeometry args={[0.017, 0.017, 0.016, 6]} />
              <meshStandardMaterial color="#451A03" roughness={0.8} />
            </mesh>
          </group>

          {/* Dark blossom tip at bottom */}
          <mesh position={[0.26, 0.20, 0]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#451A03" roughness={0.8} />
          </mesh>
        </group>
      );
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
