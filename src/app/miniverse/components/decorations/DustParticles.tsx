"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const DustParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const particlePositions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 24;
    particlePositions[i * 3 + 1] = Math.random() * 8;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        positions[i] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.0005;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={particlePositions}>
      <PointMaterial 
        size={0.02} 
        color="#ffffff" 
        transparent 
        opacity={0.3}
        sizeAttenuation={true}
      />
    </Points>
  );
};

export default DustParticles;
