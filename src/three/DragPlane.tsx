import React from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';

export const DragPlane: React.FC = () => {
  const draggedType = useGameStore((s) => s.draggedType);
  const draggedWeight = useGameStore((s) => s.draggedWeight);
  const draggedVariable = useGameStore((s) => s.draggedVariable);
  const draggedCustomItem = useGameStore((s) => s.draggedCustomItem);
  const hoveredPan = useGameStore((s) => s.hoveredPan);
  const setHoveredPan = useGameStore((s) => s.setHoveredPan);
  const setDraggedType = useGameStore((s) => s.setDraggedType);
  const addToPan = useGameStore((s) => s.addToPan);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggedType) return;
    e.stopPropagation();

    const x = e.point.x;
    const y = e.point.y;

    // Left pan is at x ~ -2.85, Right pan at x ~ +2.85
    if (y > -1.8 && y < 2.5) {
      if (x < -0.8) {
        if (hoveredPan !== 'left') setHoveredPan('left');
      } else if (x > 0.8) {
        if (hoveredPan !== 'right') setHoveredPan('right');
      } else {
        if (hoveredPan !== null) setHoveredPan(null);
      }
    } else {
      if (hoveredPan !== null) setHoveredPan(null);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!draggedType) return;
    e.stopPropagation();

    if (hoveredPan === 'left' || hoveredPan === 'right') {
      addToPan(hoveredPan, draggedType, draggedWeight, draggedVariable, draggedCustomItem);
    }

    setDraggedType(null);
    setHoveredPan(null);
  };

  return (
    <mesh
      position={[0, 1.2, 0]}
      visible={false}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[35, 35]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};
