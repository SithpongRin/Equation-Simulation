import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BagProps {
  position: [number, number, number];
  isOpen?: boolean;
  scale?: number;
  onClick?: () => void;
}

export const Bag: React.FC<BagProps> = ({
  position,
  isOpen = false,
  scale = 1.05,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const badgeRef = useRef<THREE.Group>(null);

  // Soft anime floating bob
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 2 + position[0] * 3;
      groupRef.current.position.y = position[1] + Math.sin(t) * 0.018;
    }
    if (badgeRef.current) {
      const t = clock.getElapsedTime() * 2.5 + position[0] * 2;
      badgeRef.current.rotation.z = Math.sin(t) * 0.06;
    }
  });

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
      {/* Anime Treasure Pouch - Rounded Chibi Silhouette */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.34, 24, 20]} />
        <meshStandardMaterial
          color="#6366F1" // Anime Royal Indigo Velvet
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Sack Bottom Stable Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.35, 0.18, 24]} />
        <meshStandardMaterial
          color="#4F46E5"
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* Golden Anime Ribbon Collar */}
      <mesh position={[0, 0.54, 0]} castShadow>
        <torusGeometry args={[0.14, 0.045, 12, 24]} />
        <meshStandardMaterial
          color="#FBBF24"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Flared Anime Pouch Ruffle */}
      <mesh
        position={[0, isOpen ? 0.76 : 0.65, 0]}
        scale={isOpen ? [1.5, 0.7, 1.5] : [1, 1, 1]}
        castShadow
      >
        <coneGeometry args={[0.24, 0.22, 20, 1, true]} />
        <meshStandardMaterial
          color="#818CF8"
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Golden Tag Badge with Big Bold Anime 'X' */}
      <group ref={badgeRef} position={[0, 0.34, 0.32]} rotation={[0.15, 0, 0]}>
        {/* Golden Ribbon Loop */}
        <mesh position={[0, 0.18, -0.04]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} />
        </mesh>

        {/* Anime Star Diamond Board */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.32, 0.32, 0.04]} />
          <meshStandardMaterial
            color="#FEF08A"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Shiny Golden Bevel Rim */}
        <mesh position={[0, 0, -0.005]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.35, 0.35, 0.035]} />
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Big Crisp Neon Cyan Anime 'X' */}
        <group position={[0, 0, 0.028]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.24, 0.055, 0.02]} />
            <meshStandardMaterial
              color="#0284C7"
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.24, 0.055, 0.02]} />
            <meshStandardMaterial
              color="#0284C7"
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
