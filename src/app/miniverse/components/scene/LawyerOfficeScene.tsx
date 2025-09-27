"use client";

import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Floor, Wall, Ceiling } from '../room';
import { Bookshelf, FilingCabinet, SofaTable, Desk, Chair } from '../furniture';
import { Diploma, DustParticles } from '../decorations';
import { useMiniverseStore } from '../../data/store';

const LawyerOfficeScene: React.FC = () => {
  const { setDpr } = useMiniverseStore();

  // Animate the sea waves
  useFrame((state) => {
    const waveMaterial = (window as any).waveMaterial;
    if (waveMaterial) {
      waveMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      {/* Enhanced Professional Lighting System - bright, shadow-free */}
      <ambientLight intensity={0.9} color="#ffffff" />
      <hemisphereLight color="#ffffff" groundColor="#ffffff" intensity={0.6} />
      
      {/* Main sunlight from window (no shadows) */}
      <directionalLight
        position={[12, 15, 8]}
        intensity={0.9}
        color="#fff8e1"
      />
      
      {/* Warm accent lighting (balanced) */}
      <pointLight position={[4, 6, 2]} intensity={0.5} color="#FFD700" distance={15} decay={2} />
      <pointLight position={[-8, 5, -2]} intensity={0.35} color="#ffffff" distance={12} decay={2} />
      
      {/* Chandelier lighting */}
      <pointLight position={[0, 7, 0]} intensity={0.6} color="#FFF8DC" distance={20} decay={1.5} />
      
      {/* Bookshelf accent lighting (no shadows) */}
      <spotLight
        position={[-9.5, 6, -1]}
        target-position={[-9.5, 3.5, -2.5]}
        angle={Math.PI / 6}
        penumbra={0.8}
        intensity={0.5}
        color="#FFF8DC"
        distance={12}
        decay={2}
      />
      
      {/* Room Structure */}
      <Floor />
      <Ceiling />
      
      {/* Walls with door opening on back wall */}
      <Wall 
        position={[0, 6, -18]} 
        width={36} 
        height={12}
      />
      <Wall position={[0, 6, 18]} rotation={[0, Math.PI, 0]} width={36} height={12} hasDoor />
      <Wall position={[-18, 6, 0]} rotation={[0, Math.PI / 2, 0]} width={36} height={12} />
      <Wall position={[18, 6, 0]} rotation={[0, -Math.PI / 2, 0]} width={36} height={12} />
      
      {/* Main Furniture */}
      <Bookshelf />
      <FilingCabinet />
      
      {/* Sofa Table in left center between door and bookshelf */}
      <group position={[-12, 0, 0]}>
        <SofaTable />
      </group>
      
      {/* Desk and Chair in center-right area */}
      <Desk />
      <Chair />
      
      {/* Wall Decorations */}
      <Diploma />
      
      {/* Floating dust particles for atmosphere */}
      <DustParticles />
      
      {/* Performance optimization */}
      <PerformanceMonitor 
        onIncline={() => setDpr(2)} 
        onDecline={() => setDpr(1)} 
      />
    </>
  );
};

export default LawyerOfficeScene;
