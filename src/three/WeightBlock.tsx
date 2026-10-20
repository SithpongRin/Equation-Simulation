import React from 'react';
import { Text } from '@react-three/drei';

interface WeightBlockProps {
  position: [number, number, number];
  weight?: number;
  label?: string;
  isUnknown?: boolean;
  isHovered?: boolean;
  scale?: number;
  onPointerDown?: (e: any) => void;
  onClick?: () => void;
}

export const WeightBlock: React.FC<WeightBlockProps> = ({
  position,
  weight = 1,
  label,
  isUnknown = false,
  isHovered = false,
  scale = 1.0,
  onPointerDown,
  onClick,
}) => {
  // Ghibli Aesthetic:
  // If unknown x: Beautiful warm pastel Teal / Celadon Blue Box with painted wooden edges and bold white "x"
  // If known weight: Vintage cast-iron bell weight / brass ingot with gold ring handle and clearly stamped weight number with "kg"!

  if (isUnknown) {
    // ================= GHIBLI MYSTERY BOX (x) =================
    return (
      <group
        position={position}
        scale={scale}
        onPointerDown={onPointerDown}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {/* Soft pastel teal wooden crate with rounded bevels */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshStandardMaterial
            color={isHovered ? '#38BDF8' : '#0284C7'}
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>

        {/* Cream / Golden Wooden Corner Brackets */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.65, 0.58, 0.58]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.58, 0.65, 0.58]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.58, 0.58, 0.65]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>

        {/* Front Bold Variable Tag Plaque */}
        <group position={[0, 0.32, 0.33]}>
          <mesh>
            <planeGeometry args={[0.44, 0.44]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.3} />
          </mesh>
          {/* Bold text for variable, e.g. "x", "y", "a" */}
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.28}
            color="#0369A1"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {label || 'x'}
          </Text>
        </group>
      </group>
    );
  }

  // ================= GHIBLI CAST-IRON METAL CUBE / BLOCK (1kg) =================
  // Cubical block matching the box shape, dark slate-iron metallic texture with brass corners and prominent "1kg" badge
  return (
    <group
      position={position}
      scale={scale}
      onPointerDown={onPointerDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Heavy Cubical Cast-Iron Body (matching box dimensions) */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={isHovered ? '#38BDF8' : '#334155'} // Clean Slate Iron
          roughness={0.4}
          metalness={0.75}
        />
      </mesh>

      {/* Brass Edge Brackets / Corner Caps for Ghibli aesthetic */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.62, 0.55, 0.55]} />
        <meshStandardMaterial color="#D97706" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.55, 0.62, 0.55]} />
        <meshStandardMaterial color="#D97706" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.62]} />
        <meshStandardMaterial color="#D97706" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Front Face Stamped Number Plate (e.g. "1kg") */}
      <group position={[0, 0.32, 0.315]}>
        {/* Soft Brass / Ivory engraved plaque */}
        <mesh>
          <planeGeometry args={[0.42, 0.32]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Brass Border Rim */}
        <mesh position={[0, 0, -0.003]}>
          <planeGeometry args={[0.45, 0.35]} />
          <meshStandardMaterial color="#D97706" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Clear Crisp Text: "1kg" or "{weight}kg" or custom label */}
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.15}
          color="#0F172A"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {label ? label : `${weight}kg`}
        </Text>
      </group>
    </group>
  );
};
