"use client";

import React from 'react';

interface PictureFrameProps {
  position: [number, number, number];
  isGold?: boolean;
}

const PictureFrame: React.FC<PictureFrameProps> = ({ position, isGold = false }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1, 0.8, 0.1]} />
        <meshStandardMaterial 
          color={isGold ? "#FFD700" : "#8B4513"} 
          roughness={isGold ? 0.1 : 0.6}
          metalness={isGold ? 0.9 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[0.8, 0.6, 0.02]} />
        <meshStandardMaterial 
          color={isGold ? "#F5F5DC" : "#4169E1"} 
          roughness={isGold ? 0.8 : 0.7}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

export default PictureFrame;
