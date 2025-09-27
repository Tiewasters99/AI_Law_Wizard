"use client";

import React from 'react';
import { useGLTF } from '@react-three/drei';

const Floor: React.FC = () => {
  const floorGltf = useGLTF('/images/floor.glb');

  // Room dimensions: 36 units wide, 36 units deep (reduced width)
  const roomWidth = 36;
  const roomDepth = 36;
  
  // Assuming each tile is approximately 2x2 units (adjust based on your GLB model)
  const tileSize = 2;
  
  // Calculate number of tiles needed
  const tilesX = Math.ceil(roomWidth / tileSize);
  const tilesZ = Math.ceil(roomDepth / tileSize);
  
  // Calculate starting positions to center the tiles
  const startX = -(tilesX * tileSize) / 2 + tileSize / 2;
  const startZ = -(tilesZ * tileSize) / 2 + tileSize / 2;

  return (
    <group>
      {/* Arrange floor tiles across entire room */}
      {Array.from({ length: tilesX }, (_, i) =>
        Array.from({ length: tilesZ }, (_, j) => (
          <group 
            key={`floor-tile-${i}-${j}`}
            position={[
              startX + i * tileSize,
              0,
              startZ + j * tileSize
            ]}
          >
            <primitive 
              object={floorGltf.scene.clone()} 
              scale={[1, 1, 1]}
            />
          </group>
        ))
      )}
    </group>
  );
};

// Preload the GLB model
useGLTF.preload('/images/floor.glb');

export default Floor;
