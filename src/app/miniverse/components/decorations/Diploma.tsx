"use client";

import React from 'react';

const Diploma: React.FC = () => {
  return (
    <group position={[12, 5, -17.6]}>
      {/* Gold frame */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.2, 0.9, 0.08]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Parchment diploma */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[1, 0.7, 0.01]} />
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      
      {/* Gold seal */}
      <mesh position={[0.3, -0.2, 0.11]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.1}
          metalness={0.9}
          emissive="#FFD700"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

export default Diploma;
