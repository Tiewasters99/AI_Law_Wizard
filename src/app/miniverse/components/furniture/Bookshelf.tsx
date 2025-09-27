"use client";

import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useMiniverseStore } from '../../data/store';

interface BookshelfProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  onProximityChange?: (isNear: boolean) => void;
  isHighlighted?: boolean;
}

// Interactive area indicator component with pulsing effect
const InteractiveAreaIndicator: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
      
      // Slight rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.1, 0]}>
      <cylinderGeometry args={[5.5, 5.5, 0.02, 32]} />
      <meshBasicMaterial 
        color="#3B82F6" 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Bookshelf: React.FC<BookshelfProps> = ({ 
  position = [0, 0, -16.5], // Position inside the room, closer to the center
  rotation = [0, 0, 0], 
  onProximityChange, 
  isHighlighted = false 
}) => {
  const { camera } = useThree();
  const [isNear, setIsNear] = useState(false);
  const { openBlogModal } = useMiniverseStore();
  
  // Load the GLB model - hooks must be called at top level
  const gltf = useGLTF('/images/bookshelf.glb');
  const scene = gltf.scene;

  // Room dimensions: 36 units wide, 36 units deep, 12 units high
  // Wall in front of door: width=36, height=12, position=[0, 6, -18]
  const wallWidth = 36;
  const wallHeight = 12;
  
  // Make bookshelf bigger but fit 9 bookshelves in the room
  const bookshelfWidth = 4; // Increased width by 0.1 for each bookshelf
  const bookshelfHeight = 11; // Keep the height that looks proper
  const bookshelfDepth = 2; // Adjust depth
  
  // Fit exactly 9 bookshelves across the wall width (reduced for smaller room)
  const bookshelvesPerRow = 9;
  
  // Calculate the total width of all bookshelves
  const totalBookshelfWidth = bookshelvesPerRow * bookshelfWidth;
  
  // Center the bookshelves on the wall
  const startX = -totalBookshelfWidth / 2 + bookshelfWidth / 2;

  // Proximity detection
  useFrame(() => {
    if (onProximityChange) {
      const distance = camera.position.distanceTo(new THREE.Vector3(...position));
      const nearThreshold = 8.0; // Increased threshold for larger bookshelf area
      const newIsNear = distance < nearThreshold;
      
      if (newIsNear !== isNear) {
        setIsNear(newIsNear);
        onProximityChange(newIsNear);
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Interactive area indicator - always visible when near */}
      {isNear && <InteractiveAreaIndicator />}
      
      {/* Highlighting effects when near */}
      {(isHighlighted || isNear) && onProximityChange && (
        <>
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[totalBookshelfWidth, bookshelfHeight, bookshelfDepth]} />
            <meshBasicMaterial 
              color="#3B82F6" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[totalBookshelfWidth + 0.2, bookshelfHeight + 0.2, 0.02]} />
            <meshBasicMaterial 
              color="#1D4ED8" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
      
      {/* Clickable bookshelf area for blog modal */}
      <mesh 
        position={[0, bookshelfHeight/2, 0.1]} 
        onClick={() => openBlogModal()}
        onPointerOver={(e: any) => { 
          e.stopPropagation(); 
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={(e: any) => { 
          e.stopPropagation(); 
          document.body.style.cursor = 'auto'; 
        }}
      >
        <boxGeometry args={[totalBookshelfWidth, bookshelfHeight, 0.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Render 12 bookshelves in a single row touching each other - library style */}
      {Array.from({ length: bookshelvesPerRow }, (_, col) => {
        const x = startX + col * bookshelfWidth;
        
        // Clone the scene for each bookshelf
        const clonedScene = scene.clone();
        clonedScene.scale.setScalar(2.0); // Scale to fit properly
        
        return (
          <group key={`bookshelf-${col}`} position={[x, 0, 0]}>
            <primitive object={clonedScene} />
          </group>
        );
      })}
    </group>
  );
};

// Preload the GLB model
useGLTF.preload('/images/bookshelf.glb');

export default Bookshelf;
