"use client";

import React from 'react';

const FilingCabinet: React.FC = () => {
  return (
    <group position={[16, 0, -6]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.2, 2, 1.5]} />
        <meshStandardMaterial 
          color="#696969" 
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      
      {/* Drawers with realistic handles */}
      {[0.5, 1.5].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0.76]}>
            <boxGeometry args={[1.1, 0.3, 0.02]} />
            <meshStandardMaterial 
              color="#2F4F4F" 
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
          <mesh position={[0.4, y, 0.77]}>
            <cylinderGeometry args={[0.03, 0.03, 0.05]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default FilingCabinet;
