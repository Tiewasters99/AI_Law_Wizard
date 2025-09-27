"use client";

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { generateCeilingTextures } from '../../utils/textures';

const Ceiling: React.FC = () => {
  const ceilingTextures = useMemo(() => generateCeilingTextures('#f7f7f5'), []);
  const downlightPositions: Array<[number, number, number]> = useMemo(() => (
    [
      [-9, 11.96, -8], [9, 11.96, -8],
      [-9, 11.96, 8],  [9, 11.96, 8],
    ]
  ), []);
  
  // Load GLB models
  const chandelierGltf = useGLTF('/images/Chandelier.glb');
  const ceilingGltf = useGLTF('/images/ceiling.glb');
  
  // Ceiling lights vertically arranged between door and bookshelf
  const ceilingLightPositions: Array<[number, number, number]> = useMemo(() => (
    Array.from({ length: 5 }, (_, i) => {
      const z = 12 - (i * 6); // Spread vertically from door to bookshelf
      return [-15, 11.96, z]; // Fixed X position on left side (adjusted for smaller room)
    })
  ), []);

  return (
    <group>
      {/* Main ceiling with subtle plaster texture */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 12, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial 
          color="#f7f7f5"
          map={ceilingTextures.map}
          roughnessMap={ceilingTextures.roughnessMap}
          bumpMap={ceilingTextures.bumpMap}
          bumpScale={0.01}
          roughness={0.88}
          metalness={0}
        />
      </mesh>

      {/* Recessed downlights (minimal, realistic) */}
      {downlightPositions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Trim ring */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.02, 24]} />
            <meshStandardMaterial color="#e6e6e1" roughness={0.6} metalness={0.05} />
          </mesh>
          {/* Light emitter */}
          <mesh position={[0, -0.015, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.01, 24]} />
            <meshStandardMaterial color="#fffbe6" emissive="#fff6cc" emissiveIntensity={0.6} roughness={0.4} />
          </mesh>
          {/* Downward spotlight */}
          <spotLight
            position={[0, -0.02, 0]}
            angle={Math.PI / 10}
            penumbra={0.6}
            intensity={0.35}
            color="#fff9e6"
            distance={10}
            decay={1.5}
            castShadow={false}
            target-position={[x, 0, z]}
          />
        </group>
      ))}

      {/* Chandelier GLB model */}
      <group position={[0, 7.5, 0]}>
        <primitive 
          object={chandelierGltf.scene.clone()} 
          scale={[3.5, 3.5, 3.5]}
        />
      </group>
      
      {/* Ceiling lights vertically arranged on left side, rotated */}
      {ceilingLightPositions.map(([x, y, z], i) => (
        <group key={`ceiling-light-${i}`} position={[x, y, z]} rotation={[0, Math.PI / 4, 0]}>
          <primitive 
            object={ceilingGltf.scene.clone()} 
            scale={[3, 3, 3]}
          />
          {/* Light emission */}
          <spotLight
            position={[0, -0.5, 0]}
            angle={Math.PI / 8}
            penumbra={0.7}
            intensity={0.4}
            color="#fff9e6"
            distance={12}
            decay={1.5}
            castShadow={false}
            target-position={[x, 0, z]}
          />
        </group>
      ))}
    </group>
  );
};

// Preload GLB models
useGLTF.preload('/images/Chandelier.glb');
useGLTF.preload('/images/ceiling.glb');

export default Ceiling;
