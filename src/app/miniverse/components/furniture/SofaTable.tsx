"use client";

import React from 'react';
import { useGLTF } from '@react-three/drei';
import { useMiniverseStore } from '../../data/store';

const SofaTable: React.FC = () => {
  const { scene: tableScene } = useGLTF('/images/sofa-table.glb');
  const { scene: bookScene } = useGLTF('/images/brown book.glb');
  const { openBookModal } = useMiniverseStore();

  const handleBookClick = (event: any) => {
    console.log('Book clicked!'); // Debug log
    event.stopPropagation();
    openBookModal();
  };

  return (
    <group>
      <primitive 
        object={tableScene.clone()} 
        position={[0, 0, 0]} 
        scale={[4, 4, 4]}
      />
      {/* Book placed on table surface */}
      <group 
        position={[0, 1.2, 0]} 
        scale={[0.5, 0.5, 0.5]}
      >
        <primitive object={bookScene.clone()} />
        {/* Invisible clickable area around the book */}
        <mesh
          onClick={handleBookClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <boxGeometry args={[3, 2, 1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
};

useGLTF.preload('/images/sofa-table.glb');
useGLTF.preload('/images/brown book.glb');

export default SofaTable;
