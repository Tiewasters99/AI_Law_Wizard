"use client";

import React from 'react';
import { useGLTF } from '@react-three/drei';
import { ProximityDetector } from '../controls';
import { useMiniverseStore } from '../../data/store';

interface BookProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const Book: React.FC<BookProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}) => {
  const { scene } = useGLTF('/images/brown book.glb');
  const { openBookModal } = useMiniverseStore();

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Proximity detector for automatic book modal */}
      <ProximityDetector 
        position={[0, 0, 0]} // Relative to book position
        triggerDistance={2.0}
        onTrigger={() => openBookModal()}
        cooldownMs={4000}
      />
      
      {/* Clickable book mesh */}
      <primitive 
        object={scene.clone()} 
        position={[0, 0, 0]} 
        scale={[1, 1, 1]}
        onClick={() => openBookModal()}
        onPointerOver={(e: any) => { 
          e.stopPropagation(); 
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={(e: any) => { 
          e.stopPropagation(); 
          document.body.style.cursor = 'auto'; 
        }}
      />
    </group>
  );
};

useGLTF.preload('/images/brown book.glb');

export default Book;
