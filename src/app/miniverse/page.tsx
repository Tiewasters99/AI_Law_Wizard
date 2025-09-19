"use client";

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useTexture, PerformanceMonitor, Float, Points, PointMaterial } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';


// Enhanced Floor Component with PBR materials and procedural textures
const Floor: React.FC = () => {
  return (
    <group>
      {/* Main floor with marble-like appearance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.8} 
          metalness={0.1}
          normalScale={[0.5, 0.5]}
        />
      </mesh>
      
      {/* Enhanced floor tiles with varied materials */}
      {Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 9 }, (_, j) => (
          <mesh
            key={`${i}-${j}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-11 + i * 2, 0.001, -8 + j * 2]}
            receiveShadow
          >
            <planeGeometry args={[1.9, 1.9]} />
            <meshStandardMaterial 
              color={Math.random() > 0.8 ? "#404040" : "#2a2a2a"} 
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>
        ))
      )}
      
      {/* Office rug under desk area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.002, 3.5]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial 
          color="#8B0000" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

// Enhanced Wall Component with PBR materials and door
interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  hasDoor?: boolean;
}

const Wall: React.FC<WallProps> = ({ position, rotation = [0, 0, 0], width, height, hasDoor = false }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Main wall with paint-like texture */}
      <mesh receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color="#f8f6f0" 
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      
      {/* Wooden baseboard */}
      <mesh position={[0, -height/2 + 0.25, 0.01]}>
        <planeGeometry args={[width, 0.5]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.7}
          metalness={0}
        />
      </mesh>

      {/* Office door (if specified) */}
      {hasDoor && (
        <group position={[width/4, 0, 0.05]}>
          {/* Door frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.2, 7, 0.3]} />
            <meshStandardMaterial color="#654321" roughness={0.6} metalness={0} />
          </mesh>
          
          {/* Door panel */}
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[2, 6.5, 0.1]} />
            <meshStandardMaterial color="#8B4513" roughness={0.5} metalness={0} />
          </mesh>
          
          {/* Door handle */}
          <mesh position={[0.8, 0, 0.25]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Ceiling Component with elegant chandelier
const Ceiling: React.FC = () => {
  return (
    <group>
      {/* Main ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Wooden ceiling beams */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[-9 + i * 6, 7.8, 0]} castShadow>
          <boxGeometry args={[0.3, 0.4, 18]} />
          <meshStandardMaterial 
            color="#8B4513" 
            roughness={0.6}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Elegant office chandelier */}
      <group position={[0, 7.5, 0]}>
        {/* Chandelier body */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.8]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Chandelier arms with light fixtures */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;
          
          return (
            <group key={i} position={[x, -0.3, z]}>
              <mesh>
                <cylinderGeometry args={[0.15, 0.1, 0.3]} />
                <meshStandardMaterial 
                  color="#FFF8DC" 
                  roughness={0.3}
                  metalness={0.1}
                  emissive="#FFF8DC"
                  emissiveIntensity={0.2}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};

// Enhanced Desk Component with PBR materials and interactive lamp
const Desk: React.FC = () => {
  const [lampHovered, setLampHovered] = useState(false);
  const lampRef = useRef<THREE.Group>(null!);

  return (
    <group position={[4, 0, 2]}>
      {/* Desktop surface with wood texture simulation */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.15, 2.5]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.4}
          metalness={0}
        />
      </mesh>
      
      {/* Desk legs with wood material */}
      {[[-2.2, -1], [2.2, -1], [-2.2, 1], [2.2, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.75, z]} castShadow>
          <boxGeometry args={[0.15, 1.5, 0.15]} />
          <meshStandardMaterial 
            color="#654321" 
            roughness={0.5}
            metalness={0}
          />
        </mesh>
      ))}
      
      {/* Computer Monitor with emissive screen */}
      <mesh position={[-0.5, 2.1, -0.3]} castShadow>
        <boxGeometry args={[1.8, 1.2, 0.1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Monitor screen with subtle glow */}
      <mesh position={[-0.5, 2.1, -0.24]} castShadow>
        <boxGeometry args={[1.6, 1, 0.01]} />
        <meshStandardMaterial 
          color="#0a0a1a" 
          roughness={0.1}
          metalness={0}
          emissive="#001122"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Monitor stand with metallic finish */}
      <mesh position={[-0.5, 1.7, -0.1]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial 
          color="#333" 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Keyboard with plastic material */}
      <mesh position={[-0.5, 1.57, 0.5]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.4]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Mouse with ergonomic design */}
      <mesh position={[0.3, 1.57, 0.3]} castShadow>
        <boxGeometry args={[0.15, 0.03, 0.25]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Interactive desk lamp with hover effect */}
      <group 
        ref={lampRef}
        position={[1.8, 1.6, 0.8]}
        onPointerEnter={() => setLampHovered(true)}
        onPointerLeave={() => setLampHovered(false)}
      >
        {/* Lamp base */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        
        {/* Lamp arm */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.5]} />
          <meshStandardMaterial 
            color="#333" 
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        
        {/* Lamp shade with enhanced glow when hovered */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.2, 0.3]} />
          <meshStandardMaterial 
            color="#FFD700" 
            roughness={0.2}
            metalness={0.1}
            emissive="#FFD700"
            emissiveIntensity={lampHovered ? 0.4 : 0.1}
          />
        </mesh>
        
        {/* Spotlight from lamp */}
        <spotLight
          position={[0, 1.6, 0]}
          angle={Math.PI / 4}
          penumbra={0.5}
          intensity={lampHovered ? 1 : 0.5}
          color="#FFD700"
          castShadow
          target-position={[0, 0, 0]}
        />
      </group>
      
      {/* Coffee mug with ceramic material */}
      <mesh position={[1.5, 1.65, -0.8]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.2]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.1}
          metalness={0}
        />
      </mesh>
      
      {/* Law books stack */}
      <group position={[-1.8, 1.57, -0.5]}>
        {/* Red law book */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.25, 0.3, 1]} />
          <meshStandardMaterial 
            color="#8B0000" 
            roughness={0.8}
            metalness={0}
          />
        </mesh>
        
        {/* Brown law book */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.23, 0.3, 0.9]} />
          <meshStandardMaterial 
            color="#654321" 
            roughness={0.7}
            metalness={0}
          />
        </mesh>
        
        {/* Black law book */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.24, 0.3, 0.95]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.6}
            metalness={0}
          />
        </mesh>
      </group>
      
      {/* Papers with realistic paper material */}
      <mesh position={[-1.5, 1.57, 0.2]} castShadow>
        <boxGeometry args={[0.8, 0.02, 1.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Pen holder with wood material */}
      <mesh position={[0.8, 1.7, -0.8]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.3]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.5}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

// Enhanced Chair Component with fabric materials
const Chair: React.FC = () => {
  return (
    <group position={[4, 0, 5]}>
      {/* Seat with fabric texture */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.12, 1.4]} />
        <meshStandardMaterial 
          color="#191970" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Backrest with fabric */}
      <mesh position={[0, 1.9, -0.6]} castShadow>
        <boxGeometry args={[1.4, 1.6, 0.12]} />
        <meshStandardMaterial 
          color="#191970" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Armrests with padding */}
      <mesh position={[-0.6, 1.5, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 1.2]} />
        <meshStandardMaterial 
          color="#000080" 
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.6, 1.5, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 1.2]} />
        <meshStandardMaterial 
          color="#000080" 
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      
      {/* Chair legs with metal finish and wheels */}
      {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0, -0.7]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1]} />
            <meshStandardMaterial 
              color="#333" 
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.1]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Enhanced Bookshelf with law files and decorative items
const Bookshelf: React.FC = () => {
  const bookColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];
  const lawFileColors = ['#8B0000', '#654321', '#1a1a1a'];
  
  return (
    <group position={[-9, 0, -2]}>
      {/* Bookshelf frame with wood material */}
      <mesh position={[-1.8, 3.5, 0]} castShadow>
        <boxGeometry args={[0.3, 7, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[1.8, 3.5, 0]} castShadow>
        <boxGeometry args={[0.3, 7, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[3.6, 0.3, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0} />
      </mesh>
      
      {/* Shelves */}
      {[1.4, 2.8, 4.2, 5.6, 7].map((y, index) => (
        <mesh key={index} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 0.15, 1.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0} />
        </mesh>
      ))}
      
      {/* Books with realistic placement */}
      {[0.9, 2.2, 3.6, 5, 6.4].map((shelfY, shelfIndex) => (
        <group key={shelfIndex}>
          {Array.from({ length: 10 }, (_, bookIndex) => {
            const bookWidth = 0.12 + (bookIndex % 3) * 0.03; // More consistent sizing
            const bookHeight = 0.5 + (bookIndex % 4) * 0.1;
            const bookDepth = 0.8 + (bookIndex % 2) * 0.2;
            const xPosition = -1.3 + (bookIndex * 0.27);
            const colorIndex = (shelfIndex * 10 + bookIndex) % bookColors.length;
            // Use deterministic slight lean instead of random rotation
            const lean = Math.sin(bookIndex) * 0.1; 
            
            return (
              <mesh 
                key={bookIndex} 
                position={[xPosition, shelfY + bookHeight / 2, 0.2]} 
                rotation={[0, lean, 0]}
                castShadow
              >
                <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
                <meshStandardMaterial 
                  color={bookColors[colorIndex]} 
                  roughness={0.8}
                  metalness={0}
                />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* Law files and binders on one shelf */}
      <group position={[0, 3.6, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh
            key={i}
            position={[1 + i * 0.3, 0.4, 0.3]}
            castShadow
          >
            <boxGeometry args={[0.25, 0.8, 1]} />
            <meshStandardMaterial 
              color={lawFileColors[i % lawFileColors.length]} 
              roughness={0.7}
              metalness={0}
            />
          </mesh>
        ))}
        
        {/* Gold law file labels */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh
            key={`label-${i}`}
            position={[1 + i * 0.3, 0.2, 0.31]}
            castShadow
          >
            <boxGeometry args={[0.02, 0.6, 0.8]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Decorative globe on top shelf */}
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <group position={[0.5, 7.3, 0.5]}>
          {/* Globe sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#4169E1" 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          {/* Globe stand */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.1]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.6}
              metalness={0}
            />
          </mesh>
        </group>
      </Float>
      
      {/* Legal statue decoration */}
      <mesh position={[-0.8, 7.3, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial 
          color="#DAA520" 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
};

// Enhanced Filing Cabinet with metal finish
const FilingCabinet: React.FC = () => {
  return (
    <group position={[8, 0, -3]}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
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
          <mesh position={[0, y, 0.76]} castShadow>
            <boxGeometry args={[1.1, 0.3, 0.02]} />
            <meshStandardMaterial 
              color="#2F4F4F" 
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
          <mesh position={[0.4, y, 0.77]} castShadow>
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

// Enhanced Office Plants with realistic materials
const Plant: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Ceramic pot */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.6]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.2}
          metalness={0}
        />
      </mesh>
      
      {/* Soil */}
      <mesh position={[0, 0.58, 0]} receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.02]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Plant leaves with gentle movement */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.2 + (i % 3) * 0.1; // More deterministic positioning
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 0.8 + (i % 4) * 0.2; // More consistent heights
        const leafAngle = angle + (i % 2) * 0.3; // Deterministic leaf angle
        
        return (
          <Float key={i} speed={0.8 + (i % 3) * 0.4} rotationIntensity={0.05} floatIntensity={0.08}>
            <mesh
              position={[x, 0.6 + height / 2, z]}
              rotation={[0, leafAngle, Math.PI / 8]}
              castShadow
            >
              <boxGeometry args={[0.12, height, 0.02]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#228B22" : "#32CD32"}
                roughness={0.8}
                metalness={0}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
};

// Enhanced Window with realistic glass
const Window: React.FC = () => {
  return (
    <group position={[0, 4, -8.9]}>
      {/* Window frame */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.6}
          metalness={0}
        />
      </mesh>
      
      {/* Reflective window glass */}
      <mesh position={[0, 0, 0.1]} receiveShadow>
        <boxGeometry args={[3.6, 2.6, 0.02]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4}
          roughness={0.05}
          metalness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Window cross with wood material */}
      <mesh position={[0, 0, 0.11]} castShadow>
        <boxGeometry args={[0.1, 2.6, 0.02]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.6}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0, 0.11]} castShadow>
        <boxGeometry args={[3.6, 0.1, 0.02]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.6}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

// Enhanced Picture Frame
const PictureFrame: React.FC<{ position: [number, number, number]; isGold?: boolean }> = ({ position, isGold = false }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[1, 0.8, 0.1]} />
        <meshStandardMaterial 
          color={isGold ? "#FFD700" : "#8B4513"} 
          roughness={isGold ? 0.1 : 0.6}
          metalness={isGold ? 0.9 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 0.11]} receiveShadow>
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

// Wall Clock Component with proper hand rotation
const WallClock: React.FC = () => {
  const secondHandRef = useRef<THREE.Mesh>(null!);
  const minuteHandRef = useRef<THREE.Mesh>(null!);
  const hourHandRef = useRef<THREE.Mesh>(null!);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useFrame(() => {
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours() % 12;
    
    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -(seconds * Math.PI / 30);
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -(minutes * Math.PI / 30);
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -(hours * Math.PI / 6 + minutes * Math.PI / 360);
    }
  });

  return (
    <group position={[0, 6, -8.8]}>
      {/* Clock face */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
      </mesh>
      
      {/* Clock frame */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0} />
      </mesh>
      
      {/* Hour hand */}
      <mesh ref={hourHandRef} position={[0, 0.2, 0.08]}>
        <boxGeometry args={[0.03, 0.4, 0.01]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Minute hand */}
      <mesh ref={minuteHandRef} position={[0, 0.3, 0.07]}>
        <boxGeometry args={[0.02, 0.6, 0.01]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Second hand */}
      <mesh ref={secondHandRef} position={[0, 0.35, 0.06]}>
        <boxGeometry args={[0.01, 0.7, 0.01]} />
        <meshStandardMaterial color="#ff0000" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Clock center */}
      <mesh position={[0, 0, 0.09]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Diploma Component
const Diploma: React.FC = () => {
  return (
    <group position={[6, 5, -8.8]}>
      {/* Gold frame */}
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[1.2, 0.9, 0.08]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Parchment diploma */}
      <mesh position={[0, 0, 0.1]} receiveShadow>
        <boxGeometry args={[1, 0.7, 0.01]} />
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      
      {/* Gold seal */}
      <mesh position={[0.3, -0.2, 0.11]} castShadow>
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

// Floating Dust Particles
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

// Enhanced Main Scene Component with all improvements
const LawyerOfficeScene: React.FC = () => {
  const [dpr, setDpr] = useState(1.5);
  
  return (
    <>
      {/* Enhanced Professional Lighting System */}
      <ambientLight intensity={0.25} color="#f5f5f0" />
      
      {/* Main sunlight from window */}
      <directionalLight
        position={[12, 15, 8]}
        intensity={1.5}
        color="#fff8e1"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />
      
      {/* Warm accent lighting */}
      <pointLight position={[4, 6, 2]} intensity={0.6} color="#FFD700" distance={15} decay={2} />
      <pointLight position={[-8, 5, -2]} intensity={0.4} color="#ffffff" distance={12} decay={2} />
      
      {/* Chandelier lighting */}
      <pointLight position={[0, 7, 0]} intensity={0.8} color="#FFF8DC" distance={20} decay={1.5} />
      
      {/* Room Structure */}
      <Floor />
      <Ceiling />
      
      {/* Walls with door */}
      <Wall position={[0, 4, -9]} width={24} height={8} />
      <Wall position={[0, 4, 9]} rotation={[0, Math.PI, 0]} width={24} height={8} hasDoor />
      <Wall position={[-12, 4, 0]} rotation={[0, Math.PI / 2, 0]} width={18} height={8} />
      <Wall position={[12, 4, 0]} rotation={[0, -Math.PI / 2, 0]} width={18} height={8} />
      
      {/* Main Furniture */}
      <Desk />
      <Chair />
      <Bookshelf />
      <FilingCabinet />
      
      {/* Enhanced Plant Decorations */}
      <Plant position={[-3, 0, 6]} />
      <Plant position={[8, 0, 6]} />
      <Plant position={[-10, 0, 4]} />
      
      {/* Wall Decorations */}
      <Window />
      <WallClock />
      <Diploma />
      <PictureFrame position={[-11.9, 5, 2]} />
      <PictureFrame position={[-11.9, 5, -1]} />
      <PictureFrame position={[11.9, 5, 0]} isGold />
      
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

// Main Page Component with enhanced performance
export default function MiniversePage() {
  const router = useRouter();
  const [dpr, setDpr] = useState(1.5);

  const handleExit = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Handle keyboard shortcuts and movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            handleExit();
          }
          break;
        case 'F11':
          event.preventDefault();
          handleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit, handleFullscreen]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <Canvas
        shadows
        camera={{
          position: [5.5, 1.7, 5], // Standing beside chair at human height
          fov: 75, // Wider FOV for immersive feel
          near: 0.1,
          far: 100,
        }}
        dpr={dpr}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <LawyerOfficeScene />
        
        {/* First-person style controls for room exploration */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.8} // Prevent getting too close to walls
          maxDistance={12}  // Keep within room bounds
          minPolarAngle={Math.PI / 8} // Prevent extreme upward looking
          maxPolarAngle={Math.PI - Math.PI / 8} // Prevent looking down too much
          target={[4, 1.7, 2]} // Look towards desk area initially
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.1} // Slightly more responsive
          panSpeed={1.0} // Balanced panning speed
          rotateSpeed={0.9} // Smooth rotation
          zoomSpeed={1.2} // Controlled zoom speed
          // Full 360-degree rotation for room exploration
          minAzimuthAngle={-Math.PI}
          maxAzimuthAngle={Math.PI}
        />
      </Canvas>
      
      {/* Enhanced UI overlay for first-person exploration */}
      <div className="absolute top-4 left-4 text-white bg-black/40 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
        <div className="text-lg font-bold mb-1">🚶 Law Office Walkthrough</div>
        <div className="text-xs opacity-70 mt-1 space-y-1">
          <div>🖱️ <strong>Left-click + Drag:</strong> Look around (360°)</div>
          <div>🖱️ <strong>Right-click + Drag:</strong> Move around room</div>
          <div>🔍 <strong>Scroll Wheel:</strong> Walk closer/further</div>
        </div>
        <div className="text-xs opacity-60 mt-2 space-y-1">
          <div>📍 <strong>Starting Position:</strong> Beside office chair</div>
          <div>🏢 <strong>Room Layout:</strong> Fully enclosed office</div>
          <div>🎯 <strong>Explore:</strong> Desk area, bookshelf, window, door</div>
          <div>⚡ <strong>Interactive:</strong> Hover desk lamp for glow</div>
        </div>
            </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Exit button */}
        <button
          onClick={handleExit}
          className="text-white bg-red-600/80 hover:bg-red-600 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-400/30 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          title="Exit 3D World"
        >
          <span>✕</span>
          Exit
        </button>
        
        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          className="text-white bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-400/30 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          title="Toggle Fullscreen"
        >
          <span>⛶</span>
          Fullscreen
        </button>
        
        {/* Performance indicator */}
        <div className="text-white bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
          <div className="text-xs">React Three Fiber</div>
        </div>
            </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 text-white bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
        <div className="text-xs opacity-80">
          ESC to exit • F11 for fullscreen
        </div>
      </div>

      {/* Room layout reference map */}
      <div className="absolute bottom-4 right-4 w-36 h-28 bg-black/70 border border-white/30 rounded-lg p-2">
        <div className="text-white text-xs mb-1 text-center font-medium">Office Layout</div>
        <div className="relative w-full h-full bg-gray-800 rounded border border-gray-600">
          {/* Room outline */}
          <div className="absolute inset-1 border border-gray-400 rounded"></div>
          
          {/* Room features with better positioning */}
          <div className="absolute" style={{ top: '4px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-1.5 h-1 bg-blue-400 rounded" title="Window"></div>
          </div>
          <div className="absolute" style={{ bottom: '4px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-1.5 h-1 bg-green-400 rounded" title="Door"></div>
          </div>
          <div className="absolute" style={{ top: '40%', right: '20%' }}>
            <div className="w-1.5 h-1 bg-yellow-400 rounded" title="Desk"></div>
          </div>
          <div className="absolute" style={{ top: '60%', right: '20%' }}>
            <div className="w-1 h-1 bg-purple-400 rounded-full" title="Chair (Start)"></div>
          </div>
          <div className="absolute" style={{ top: '25%', left: '12%' }}>
            <div className="w-1 h-1.5 bg-orange-400 rounded" title="Bookshelf"></div>
          </div>
          <div className="absolute" style={{ top: '25%', right: '12%' }}>
            <div className="w-1 h-1 bg-gray-400 rounded" title="Filing"></div>
          </div>
          
          {/* Starting position indicator */}
          <div className="absolute" style={{ top: '60%', right: '15%' }}>
            <div className="w-2 h-2 border border-red-400 rounded-full animate-pulse" title="Your starting position"></div>
          </div>
        </div>
        
        {/* Mini legend */}
        <div className="text-xs text-white opacity-70 mt-1 text-center">
          🔴 Start Position
        </div>
      </div>
    </div>
  );
}