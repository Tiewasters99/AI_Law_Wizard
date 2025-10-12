"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-800/40 animate-pulse rounded-lg" />
}) as any;

// Type definitions
interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

interface OfficeSceneProps {
  onObjectClick: (userData: UserData) => void;
  lampsOn: boolean;
}

// Create text texture helper
function createTextTexture(text: string, fontSize: number, color: string = '#1a1a2e') {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return new THREE.CanvasTexture(canvas);
}

// Camera controls component
function CameraRig() {
  const { camera } = useThree();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const moveSpeed = 0.12;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    const keys = keysRef.current;
    const yaw = yawRef.current;

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    if (keys['arrowup'] || keys['w']) camera.position.add(forward.clone().multiplyScalar(moveSpeed));
    if (keys['arrowdown'] || keys['s']) camera.position.add(forward.clone().multiplyScalar(-moveSpeed));
    if (keys['arrowleft'] || keys['a']) camera.position.add(right.clone().multiplyScalar(-moveSpeed));
    if (keys['arrowright'] || keys['d']) camera.position.add(right.clone().multiplyScalar(moveSpeed));
    if (keys['q']) yawRef.current += 0.02;
    if (keys['e']) yawRef.current -= 0.02;

    // Boundary constraints
    camera.position.x = Math.max(-23, Math.min(23, camera.position.x));
    camera.position.z = Math.max(-23, Math.min(23, camera.position.z));
    camera.position.y = 1.6;

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yawRef.current;
    camera.rotation.x = pitchRef.current;
  });

  return null;
}

// Enhanced Chair Component
function Chair({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Enhanced Chair Seat */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.9, 0.17, 0.8]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
      
      {/* Enhanced Seat Cushion */}
      <mesh position={[0, 0.59, 0]}>
        <boxGeometry args={[0.83, 0.14, 0.77]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.7} 
          metalness={0.05}
        />
      </mesh>
      
      {/* Enhanced Chair Back */}
      <mesh position={[0, 1.1, -0.35]}>
        <boxGeometry args={[0.85, 1.2, 0.08]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
      
      {/* Enhanced Back Cushion */}
      <mesh position={[0, 1.1, -0.31]}>
        <boxGeometry args={[0.87, 1.1, 0.04]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.7} 
          metalness={0.05}
        />
      </mesh>
      
      {/* Enhanced Chair Legs */}
      <mesh position={[-0.35, 0.25, -0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.35, 0.25, -0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[-0.35, 0.25, 0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.35, 0.25, 0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Enhanced Armrests */}
      <mesh position={[-0.45, 0.8, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.7]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0.45, 0.8, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.7]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// Office Scene Component
function OfficeScene({ onObjectClick, lampsOn }: OfficeSceneProps) {
  const lampLightsRef = useRef<THREE.PointLight[]>([]);
  const lampShadesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    lampShadesRef.current.forEach(shade => {
      if (shade && shade.material) {
        (shade.material as THREE.MeshStandardMaterial).emissiveIntensity = lampsOn ? 0.5 : 0;
      }
    });
    
    lampLightsRef.current.forEach(light => {
      if (light) {
        light.intensity = lampsOn ? 0.8 : 0;
      }
    });
  }, [lampsOn]);

  const handleClick = (e: any, userData: UserData) => {
    e.stopPropagation();
    if (userData.interactive) {
      onObjectClick(userData);
    }
  };

  // Text textures
  const brandTexture = createTextTexture('QUAINTON LAW', 120);
  const miniverseTexture = createTextTexture('MINIVERSE™', 80);
  const rightWallBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 80);
  const backWallFarBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 80, '#ffffff');
  const receptionBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 50);
  const receptionTexture = createTextTexture('RECEPTION', 60, '#000000');
  const firmDocsTexture = createTextTexture('Firm Documents Below', 60, '#000000');
  const firmLibraryTexture = createTextTexture('FIRM LIBRARY', 50, '#ffffff');

  return (
    <group>
      {/* Maximum Lighting - No Shadows, Fully Bright */}
      <ambientLight intensity={2.0} color="#ffffff" />
      
      {/* Main Directional Lights - High Intensity */}
      <directionalLight position={[10, 15, 10]} intensity={3.5} color="#ffffff" />
      <directionalLight position={[-12, 8, -8]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[0, 20, 0]} intensity={3.0} color="#ffffff" />
      <directionalLight position={[15, 5, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-15, 5, 5]} intensity={2.0} color="#ffffff" />
      
      {/* Additional directional lights for even coverage */}
      <directionalLight position={[0, 15, -15]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[0, 15, 15]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-15, 10, 0]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[15, 10, 0]} intensity={2.0} color="#ffffff" />
      
      {/* Ceiling Point Lights - Evenly Distributed for Full Coverage */}
      <pointLight position={[0, 9, 0]} intensity={4.0} color="#ffffff" distance={50} decay={1.5} />
      <pointLight position={[-10, 9, -10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      <pointLight position={[10, 9, -10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      <pointLight position={[-10, 9, 10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      <pointLight position={[10, 9, 10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      
      {/* Corner Lights for Complete Coverage - Increased Range */}
      <pointLight position={[-20, 6, -20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[20, 6, -20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[-20, 6, 20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[20, 6, 20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      
      {/* Additional Mid-Wall Lights for Even Distribution */}
      <pointLight position={[0, 7, -20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[0, 7, 20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[-20, 7, 0]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[20, 7, 0]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      
      {/* Table Lamps (Decorative when on) */}
      <pointLight 
        ref={(ref) => { if (ref) lampLightsRef.current[0] = ref; }}
        position={[-8, 2, 8]} 
        intensity={lampsOn ? 2.0 : 0} 
        color="#ffd700" 
        distance={25}
        decay={1.5}
      />
      <pointLight 
        ref={(ref) => { if (ref) lampLightsRef.current[1] = ref; }}
        position={[8, 2, 8]} 
        intensity={lampsOn ? 2.0 : 0} 
        color="#ffd700" 
        distance={25}
        decay={1.5}
      />

      {/* Floor - EXACT dimensions from temp.js with current colors */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Walls - EXACT dimensions from temp.js with current colors */}
      <mesh position={[0, 5, -25]}>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.05} />
      </mesh>

      <mesh position={[-25, 5, 0]}>
        <boxGeometry args={[0.5, 10, 50]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.05} />
      </mesh>

      <mesh position={[25, 5, 0]}>
        <boxGeometry args={[0.5, 10, 50]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.05} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Brand Text on Back Wall */}
      {brandTexture && (
        <mesh position={[0, 7.5, -24.7]}>
          <planeGeometry args={[16, 4]} />
          <meshBasicMaterial map={brandTexture} transparent />
        </mesh>
      )}

      {miniverseTexture && (
        <mesh position={[0, 5.8, -24.7]}>
          <planeGeometry args={[12, 3]} />
          <meshBasicMaterial map={miniverseTexture} transparent />
        </mesh>
      )}

      {/* Back Wall Interactive Panels */}
      <mesh position={[-10, 3.5, -24.6]} onClick={(e) => handleClick(e, { type: 'video', label: 'FIRM VIDEOS', interactive: true })}>
        <boxGeometry args={[8, 5, 0.3]} />
        <meshStandardMaterial color={0x8b0000} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-10, 3.5, -24.4]}>
        <planeGeometry args={[6, 1.5]} />
        <meshBasicMaterial map={createTextTexture('FIRM VIDEOS', 60, '#ffffff')} transparent />
      </mesh>

      <mesh position={[0, 3, -24.6]} onClick={(e) => handleClick(e, { type: 'art', label: 'FIRM ARTWORK', interactive: true })}>
        <boxGeometry args={[6, 4, 0.3]} />
        <meshStandardMaterial color={0x2d5016} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 3, -24.4]}>
        <planeGeometry args={[5.5, 1.5]} />
        <meshBasicMaterial map={createTextTexture('FIRM ARTWORK', 70, '#ffffff')} transparent />
      </mesh>

      <mesh position={[10, 3.5, -24.6]} onClick={(e) => handleClick(e, { type: 'ourwall', label: 'OUR WALL', interactive: true })}>
        <boxGeometry args={[8, 5, 0.3]} />
        <meshStandardMaterial color={0x1e4d8b} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[10, 3.5, -24.4]}>
        <planeGeometry args={[6, 1.5]} />
        <meshBasicMaterial map={createTextTexture('OUR WALL', 60, '#ffffff')} transparent />
      </mesh>

      {/* Far Wall Profile Panels */}
      {[...Array(6)].map((_, index) => {
        const positions = [-15, -9, -3, 3, 9, 15];
        return (
          <group key={`profile-${index}`}>
            <mesh position={[positions[index], 2.5, 24.6]} onClick={(e) => handleClick(e, { type: 'profile', label: `PROFILE ${index + 1}`, interactive: true })}>
              <boxGeometry args={[4.5, 1.5, 0.3]} />
              <meshStandardMaterial color={0x5a4a6a} roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[positions[index], 2.5, 24.8]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[3.5, 1]} />
              <meshBasicMaterial map={createTextTexture('PROFILES', 40, '#ffffff')} transparent />
            </mesh>
          </group>
        );
      })}

      {backWallFarBrandTexture && (
        <mesh position={[0, 6, 24.7]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[10, 2.5]} />
          <meshBasicMaterial map={backWallFarBrandTexture} transparent />
        </mesh>
      )}

      {/* Conference Table - current colors, temp.js dimensions */}
      <mesh position={[0, 0.8, 4]}>
        <boxGeometry args={[10, 0.2, 5]} />
        <meshStandardMaterial color="#1f2937" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Table Items */}
      {[
        { label: 'Leave Review', x: -3, z: 4 },
        { label: 'Our Website', x: -1, z: 4 },
        { label: 'Other Sites', x: 1, z: 4 },
        { label: 'Pro Bono', x: 3, z: 4 }
      ].map((item) => (
        <group key={item.label}>
          <mesh position={[item.x, 1, item.z]} onClick={(e) => handleClick(e, { type: 'tableItem', label: item.label, interactive: true })}>
            <boxGeometry args={[0.5, 0.05, 0.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[item.x, 1.03, item.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.4, 0.1]} />
            <meshBasicMaterial map={createTextTexture(item.label, 30)} transparent />
          </mesh>
        </group>
      ))}

      {/* Enhanced Chairs - aligned with table spacing, all facing table */}
      {/* Back side - 2 chairs */}
      <Chair position={[-1, 0, 7.5]} rotation={Math.PI} />
      <Chair position={[1, 0, 7.5]} rotation={Math.PI} />
      
      {/* Left side */}
      <Chair position={[-6, 0, 4]} rotation={Math.PI / 2} />
      
      {/* Right side */}
      <Chair position={[6, 0, 4]} rotation={-Math.PI / 2} />
      
      {/* Front side - 2 chairs */}
      <Chair position={[-1, 0, 0.5]} rotation={0} />
      <Chair position={[1, 0, 0.5]} rotation={0} />

      {/* Bookshelf on Left Wall */}
      <mesh position={[-24.5, 3, -8]}>
        <boxGeometry args={[0.4, 6, 8]} />
        <meshStandardMaterial color={0x4a2c1a} />
      </mesh>

      {firmLibraryTexture && (
        <mesh position={[-24.3, 5.5, -8]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6, 1.5]} />
          <meshBasicMaterial map={firmLibraryTexture} transparent />
        </mesh>
      )}

      {/* Books - 25 books with exact positions from temp.js */}
      {[...Array(25)].map((_, i) => {
        const bookTitles = [
          'Agentic Theory', 'Agentic AI and Law', "Law's Empire", 'Russia Company', 'Superintelligence',
          'Alignment Problem', 'Liberation Theologies', 'You Might be a Robot', 'Black Box Society',
          'AI Legal Personhood', 'Unknowable Unknown', 'Logical Calculus', 'Augmenting LLMs',
          'Read Me', 'Explore Me', 'Check Me Out', 'Read Me', 'Explore Me', 'Check Me Out',
          'Read Me', 'Explore Me', 'Check Me Out', 'Read Me', 'Explore Me', 'Check Me Out'
        ];
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <mesh
            key={`book-${i}`}
            position={[-24.3, 0.8 + row * 1, -11 + col * 1.5]}
            rotation={[0, Math.PI / 2, 0]}
            onClick={(e) => handleClick(e, { type: 'book', label: bookTitles[i], interactive: true })}
          >
            <boxGeometry args={[0.15, 0.8, 0.2]} />
            <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)} />
          </mesh>
        );
      })}

      {/* Reception Desk */}
      <mesh position={[-24, 0.5, 0]}>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color={0x3d2817} />
      </mesh>

      {/* Receptionist */}
      <mesh position={[-24, 1.8, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.5, 16]} />
        <meshStandardMaterial color={0x2c5f8d} />
      </mesh>
      <mesh position={[-24, 2.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={0xffdbac} />
      </mesh>

      {/* Reception Labels */}
      {receptionBrandTexture && (
        <mesh position={[-24, 6.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial map={receptionBrandTexture} transparent />
        </mesh>
      )}

      {receptionTexture && (
        <mesh position={[-24, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5, 1.2]} />
          <meshBasicMaterial map={receptionTexture} transparent />
        </mesh>
      )}

      {firmDocsTexture && (
        <mesh position={[-24, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6, 1.5]} />
          <meshBasicMaterial map={firmDocsTexture} transparent />
        </mesh>
      )}

      {/* Desk Items */}
      {[
        { label: 'Engagement Letters', z: -0.6 },
        { label: 'Firm Brochure', z: -0.1 },
        { label: 'NDAs', z: 0.4 }
      ].map((item) => (
        <group key={item.label}>
          <mesh position={[-24, 1.03, item.z]} rotation={[-Math.PI / 8, 0, 0]} onClick={(e) => handleClick(e, { type: 'deskItem', label: item.label, interactive: true })}>
            <boxGeometry args={[0.4, 0.04, 0.5]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-24, 1.05, item.z]} rotation={[-Math.PI / 2.3, 0, 0]}>
            <planeGeometry args={[0.35, 0.08]} />
            <meshBasicMaterial map={createTextTexture(item.label, 35)} transparent />
          </mesh>
        </group>
      ))}

      {/* Legal Materials Panel on Left Wall */}
      <mesh position={[-24.6, 3.5, 8]} onClick={(e) => handleClick(e, { type: 'legal', label: 'LEGAL MATERIALS', interactive: true })}>
        <boxGeometry args={[0.3, 5, 6]} />
        <meshStandardMaterial color={0x4a4a4a} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-24.4, 3.5, 8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.5, 2.2]} />
        <meshBasicMaterial map={createTextTexture('LEGAL MATERIALS\nSupreme Court, Podcasts\nand more', 45, '#ffffff')} transparent />
      </mesh>

      {/* Right Wall Elements */}
      {/* Credits Panel */}
      <mesh position={[24.6, 3.5, -16]}>
        <boxGeometry args={[0.3, 3, 4]} />
        <meshStandardMaterial color={0x1e3a5f} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[24.4, 3.5, -16]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.5, 2.6]} />
        <meshBasicMaterial map={createTextTexture('Brought to you by\nAI Law Wizard\n&\nClaude Sonnet 4.5', 45, '#ffffff')} transparent />
      </mesh>

      {/* Idea Vault Panel */}
      <mesh position={[24.6, 3.5, -11]} onClick={(e) => handleClick(e, { type: 'ideaVault', label: 'IDEA VAULT', interactive: true })}>
        <boxGeometry args={[0.3, 2.5, 3]} />
        <meshStandardMaterial color={0xffd700} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[24.4, 3.5, -11]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 2.1]} />
        <meshBasicMaterial map={createTextTexture('💡\nIDEA\nVAULT', 42, '#1a1a2e')} transparent />
      </mesh>

      {/* Artwork Panel on Right Wall */}
      <mesh position={[24.6, 3.8, -6]} onClick={(e) => handleClick(e, { type: 'rightArt', label: 'ARTWORK', interactive: true })}>
        <boxGeometry args={[0.3, 4.5, 3.5]} />
        <meshStandardMaterial color={0x2d5016} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[24.4, 3.8, -6]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2.2]} />
        <meshBasicMaterial map={createTextTexture('ARTWORK', 65, '#ffffff')} transparent />
      </mesh>

      {/* Certificates on Right Wall */}
      {[...Array(6)].map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <mesh
            key={`cert-${i}`}
            position={[24.6, 2 + row * 2.5, -1 + col * 2]}
            onClick={(e) => handleClick(e, { type: 'certificate', label: `Certificate ${i + 1}`, interactive: true })}
          >
            <boxGeometry args={[0.3, 1.5, 1.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        );
      })}

      {/* Personal Images Panel on Right Wall */}
      <mesh position={[24.6, 3.5, 8]} onClick={(e) => handleClick(e, { type: 'personalImages', label: 'PERSONAL IMAGES', interactive: true })}>
        <boxGeometry args={[0.3, 5, 4]} />
        <meshStandardMaterial color={0x4a2c5f} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[24.4, 3.5, 8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.5, 2.6]} />
        <meshBasicMaterial map={createTextTexture('PERSONAL\nIMAGES', 55, '#ffffff')} transparent />
      </mesh>

      {/* Right Wall Brand Text */}
      {rightWallBrandTexture && (
        <mesh position={[24.4, 6, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial map={rightWallBrandTexture} transparent />
        </mesh>
      )}

      {/* Lamps */}
      {[
        { pos: [-8, 0, 8] as [number, number, number], index: 0 },
        { pos: [8, 0, 8] as [number, number, number], index: 1 }
      ].map((lamp) => (
        <group key={`lamp-${lamp.index}`} position={lamp.pos}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
            <meshStandardMaterial color={0x8b7355} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
            <meshStandardMaterial color={0x8b7355} />
          </mesh>
          <mesh 
            ref={(ref) => { if (ref) lampShadesRef.current[lamp.index] = ref; }}
            position={[0, 1.6, 0]}
            onClick={(e) => handleClick(e, { type: 'lamp', label: 'Lamp', interactive: true })}
          >
            <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
            <meshStandardMaterial 
              color={0xffd700} 
              emissive={0xffd700} 
              emissiveIntensity={lampsOn ? 0.5 : 0} 
            />
          </mesh>
        </group>
      ))}

      {/* Plants */}
      {[
        { pos: [-10, 0, -5] as [number, number, number] },
        { pos: [10, 0, -5] as [number, number, number] }
      ].map((plant, i) => (
        <group key={`plant-${i}`}>
          <mesh position={[plant.pos[0], 0.2, plant.pos[2]]}>
            <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
            <meshStandardMaterial color={0x8b4513} />
          </mesh>
          <mesh position={[plant.pos[0], 0.6, plant.pos[2]]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color={0x228b22} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Track interface
interface Track {
  url: string;
  title: string;
  icon: string;
}

// Main component
export default function MiniversePage() {
  const [showHelp, setShowHelp] = useState(true);
  const [selectedContent, setSelectedContent] = useState<UserData | null>(null);
  const [lampsOn, setLampsOn] = useState(true);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  
  // Music player state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  // Track list - memoized to prevent recreation
  const tracks = useMemo<Track[]>(() => [
    { 
      url: 'https://www.youtube.com/watch?v=4iZOLt63ZFk', 
      title: 'Classical', 
      icon: '🎻' 
    },
    { 
      url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', 
      title: 'Lofi Jazz', 
      icon: '🎷' 
    },
    { 
      url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c', 
      title: 'Ambient', 
      icon: '🎸' 
    }
  ], []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setShowHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Debug effect for tracking player state
  useEffect(() => {
    if (currentTrack) {
      console.log('Current track changed:', currentTrack.title, currentTrack.url);
      console.log('Player state - Open:', isPlayerOpen, 'Ready:', playerReady, 'Playing:', isPlaying);
    }
  }, [currentTrack, isPlayerOpen, playerReady, isPlaying]);

  const handleObjectClick = useCallback((userData: UserData) => {
    if (userData.type === 'lamp') {
      setLampsOn(prev => !prev);
    } else {
      setSelectedContent(userData);
    }
  }, []);

  // Music player handlers
  const handleTrackSelect = useCallback((track: Track) => {
    // Reset error state
    setPlayerError(null);
    
    // If switching tracks, pause first then switch
    if (currentTrack && currentTrack.url !== track.url) {
      setIsPlaying(false);
      setPlayerReady(false);
      setTimeout(() => {
        setCurrentTrack(track);
        setIsPlayerOpen(true);
        setShowMusicPanel(false);
        setIsMinimized(false);
      }, 100);
    } else {
      // New track
      setCurrentTrack(track);
      setIsPlayerOpen(true);
      setShowMusicPanel(false);
      setIsMinimized(false);
      setPlayerReady(false);
    }
  }, [currentTrack]);

  const handlePlayPause = useCallback(() => {
    if (playerReady) {
      setIsPlaying(prev => !prev);
    }
  }, [playerReady]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setIsPlaying(false);
    setPlayerReady(false);
    setTimeout(() => {
      setIsPlayerOpen(false);
      setCurrentTrack(null);
      setShowMusicPanel(false);
    }, 100);
  }, []);

  const handleMinimizeToggle = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // Player event handlers - memoized
  const handlePlayerReady = useCallback(() => {
    console.log('Player ready - callback fired!');
    setPlayerReady(true);
    // Don't auto-play - let user click play button
    // YouTube may block autoplay without user interaction
  }, []);

  // Fallback: Set player ready after timeout if callback doesn't fire
  useEffect(() => {
    if (currentTrack && isPlayerOpen && !playerReady) {
      const timeout = setTimeout(() => {
        console.log('Fallback: Setting player ready after 2 seconds');
        setPlayerReady(true);
      }, 2000); // Reduced from 3000 to 2000ms
      
      return () => clearTimeout(timeout);
    }
  }, [currentTrack, isPlayerOpen, playerReady]);

  const handlePlayerPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePlayerPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePlayerEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePlayerError = useCallback((e: any) => {
    console.error('Player error:', e);
    setPlayerError('Failed to load video. Video may have embedding restrictions.');
    // Set ready anyway so user can try to interact
    setPlayerReady(true);
  }, []);

  const renderContentModal = useCallback(() => {
    if (!selectedContent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setSelectedContent(null)}>
        <div className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <button 
            className="absolute top-4 right-4 bg-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-red-900"
            onClick={() => setSelectedContent(null)}
          >
            ×
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-5">{selectedContent.label}</h2>
          
          {selectedContent.type === 'video' && (
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-3">Featured Firm Videos</h3>
              <a 
                href="https://www.youtube.com/watch?v=FUnCvHnitPQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-red-900"
              >
                Watch Our Featured Video
              </a>
              <p className="text-center text-gray-600 text-sm mb-4">Click to open video in new tab</p>
            </div>
          )}

          {selectedContent.type === 'art' && (
            <div>
              <p className="text-gray-700 mb-4">Display your firm artwork gallery</p>
              <a 
                href="https://i.imgur.com/Gc59Q6K.png" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-green-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-green-900"
              >
                Artwork #1
              </a>
              <a 
                href="https://i.imgur.com/6YKVvhG.png" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-green-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-green-900"
              >
                Artwork #2
              </a>
            </div>
          )}

          {/* Continue with all book types from temp.js */}
          {selectedContent.type === 'book' && selectedContent.label === 'Agentic Theory' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1ebvUaV9y3LvxpmgItgSTkMmHa4Ls_ZIZ/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Agentic Theory
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Agentic AI and Law' && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">Agentic AI and the Practice of Law</h3>
              <a 
                href="https://docs.google.com/document/d/1kby4LMs0PVUCy8IA0qWD5LWh54jr5Vxb1hftmfPw4Uk/edit?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read Full Paper
              </a>
              <p className="text-gray-600 italic">Trust, Imagination, and the New Calculus of Liability</p>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === "Law's Empire" && (
            <div>
              <a 
                href="https://drive.google.com/file/d/18_1XREv0fHn_3exOWgMntjd-jWnE_SED/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Law's Empire
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Russia Company' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1RcVU6tKOYtABxR4hlMUdXmRPjI8ZxHeP/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Origin and Early History of the Russia or Muscovy Company
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Superintelligence' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1YikBAleixDVc2fCMhPTCAhFEkNZYV04i/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Superintelligence
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Alignment Problem' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1wNTyTDzbx_dsP7mlOo_7-6BLVjMJDVHU/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Alignment Problem
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Liberation Theologies' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1GjVSJ0q-7Y7IcEPxaUk8G88nXHX9I8k2/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Decolonizing Liberation Theologies
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'You Might be a Robot' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1bjgLlKHPQCEGNykgBPN2CuORnalP4929/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: You Might be a Robot
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Black Box Society' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1ZgrAtpCpWWStD8mtx5bayV93w232Uard/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Black Box Society
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'AI Legal Personhood' && (
            <div>
              <a 
                href="https://drive.google.com/file/d/1Cw9hBnjo9QR-blGMizc1CQp-MwG7Rjsp/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Ethics and Challenges of Legal Personhood for AI
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Unknowable Unknown' && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">The Unknowable Unknown</h3>
              <a 
                href="https://docs.google.com/document/d/1pB10z2YfGgHVYPf5kl9Pj62NMVvlPoGs/edit?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read Full Paper
              </a>
              <p className="text-gray-600 italic">The Case for AI Arms Control</p>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Logical Calculus' && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">Featured Paper</h3>
              <a 
                href="https://drive.google.com/file/d/1iBAI7spq1vJiP7PNzal3d4yY-VaHOWHQ/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                A Logical Calculus of Ideas Immanent in Nervous Activity
              </a>
              <p className="text-gray-600">McCulloch & Pitts (1943)</p>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Augmenting LLMs' && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">Featured Research Paper</h3>
              <a 
                href="https://arxiv.org/pdf/2306.07174" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Augmenting Language Models with Long-Term Memory
              </a>
              <p className="text-gray-600">"LONGMEM: Enabling LLMs to memorize long history"</p>
            </div>
          )}

          {selectedContent.type === 'ideaVault' && (
            <div>
              <div className="p-12 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-2xl text-center mb-6">
                <div className="text-7xl mb-4">💡</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">Coming Soon</h3>
                <p className="text-gray-700 text-lg">The Idea Vault will let you capture and save thoughts as you explore the Miniverse</p>
              </div>
            </div>
          )}

          {selectedContent.type === 'profile' && (
            <div>
              <div className="p-8 bg-gray-100 rounded-xl text-center">
                <p className="text-gray-700 text-lg">Videos, articles, testimonials from team members, partners, clients and more.</p>
              </div>
            </div>
          )}

          {selectedContent.type === 'ourwall' && (
            <div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">Our Wall - Firm Updates & Information</h3>
              <a 
                href="#testimonials"
                className="block w-full bg-purple-700 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-purple-800"
              >
                Client Testimonials
              </a>
              <a 
                href="#cases"
                className="block w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-red-900"
              >
                Featured Cases
              </a>
            </div>
          )}

          {selectedContent.type === 'legal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Supreme Court Resources</h3>
                <a href="https://www.oyez.org" target="_blank" rel="noopener noreferrer" className="block bg-blue-900 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-blue-950">
                  Oyez Project - SCOTUS Arguments (1955-Present)
                </a>
                <a href="https://www.supremecourt.gov" target="_blank" rel="noopener noreferrer" className="block bg-blue-900 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-blue-950">
                  Supreme Court Official Audio & Transcripts
                </a>
                <a href="https://podcasts.apple.com/us/podcast/the-supreme-court-oral-arguments/id1649139910" target="_blank" rel="noopener noreferrer" className="block bg-blue-900 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-blue-950">
                  SCOTUS Oral Arguments Podcast
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Federal Circuit Courts</h3>
                <a href="https://www.courtlistener.com/audio/" target="_blank" rel="noopener noreferrer" className="block bg-gray-700 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-gray-800">
                  CourtListener - All Federal Circuit Courts
                </a>
                <a href="https://www.ca9.uscourts.gov/media/" target="_blank" rel="noopener noreferrer" className="block bg-gray-700 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-gray-800">
                  9th Circuit Oral Arguments
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Law School Podcasts</h3>
                <a href="https://law.stanford.edu/stanford-legal-podcast/" target="_blank" rel="noopener noreferrer" className="block bg-red-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-red-900">
                  Stanford Legal Podcast
                </a>
                <a href="https://hls.harvard.edu/communications-office/podcast-conversations-from-harvard-law-school/" target="_blank" rel="noopener noreferrer" className="block bg-red-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-red-900">
                  Conversations from Harvard Law School
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Live Trials & Courtrooms</h3>
                <a href="https://www.courttv.com/title/court-tv-live-stream-web/" target="_blank" rel="noopener noreferrer" className="block bg-green-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-green-900">
                  Court TV - Live Trial Coverage
                </a>
                <a href="https://cvn.com/" target="_blank" rel="noopener noreferrer" className="block bg-green-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-green-900">
                  Courtroom View Network (CVN)
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Legal Skills Training</h3>
                <a href="https://www.nita.org" target="_blank" rel="noopener noreferrer" className="block bg-yellow-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-yellow-900">
                  NITA - National Institute for Trial Advocacy
                </a>
                <a href="https://www.nacdl.org" target="_blank" rel="noopener noreferrer" className="block bg-yellow-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-yellow-900">
                  NACDL - Criminal Defense Trial Skills
                </a>
              </div>
            </div>
          )}

          {(selectedContent.type === 'rightArt' || selectedContent.type === 'certificate' || 
            selectedContent.type === 'tableItem' || selectedContent.type === 'deskItem' || 
            selectedContent.type === 'personalImages') && (
            <div>
              <div className="p-6 bg-gray-100 rounded-xl">
                <p className="text-gray-700">Add your content via URL embeds (Vimeo, SoundCloud, Imgur, Google Drive, PDFs, etc.)</p>
              </div>
            </div>
          )}

          {(selectedContent.type === 'book' && !['Agentic Theory', 'Agentic AI and Law', "Law's Empire", 'Russia Company', 
            'Superintelligence', 'Alignment Problem', 'Liberation Theologies', 'You Might be a Robot', 
            'Black Box Society', 'AI Legal Personhood', 'Unknowable Unknown', 'Logical Calculus', 
            'Augmenting LLMs'].includes(selectedContent.label)) && (
            <div>
              <div className="p-6 bg-gray-100 rounded-xl">
                <p className="text-gray-700">Legal resources and documents available via Google Drive or your website hosting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [selectedContent]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <Canvas 
        camera={{ position: [0, 1.6, 12], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#2a2a40']} />
        <CameraRig />
        <OfficeScene onObjectClick={handleObjectClick} lampsOn={lampsOn} />
      </Canvas>

      {showHelp && (
        <div className="fixed top-4 left-4 max-w-xs z-50">
          {/* Compact Glassmorphic Container */}
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 border border-slate-400/40 rounded-2xl shadow-2xl overflow-hidden">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-blue-900/20 to-slate-800/20"></div>
            
            {/* Content */}
            <div className="relative p-5">
              {/* Close button */}
              <button 
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300 group"
                onClick={() => setShowHelp(false)}
              >
                <span className="text-white text-lg font-light group-hover:rotate-90 transition-transform duration-300">×</span>
              </button>
              
              {/* Header */}
              <div className="mb-4 pr-8">
                <h3 className="text-base font-bold text-white mb-1">
                  Quainton Law
                </h3>
                <p className="text-xs text-gray-300">Miniverse™ Controls</p>
              </div>
              
              {/* Controls - Compact */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-white py-1">
                  <span className="flex items-center space-x-1.5">
                    <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">WASD</kbd>
                    <span className="text-gray-400">/</span>
                    <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">↑←↓→</kbd>
                  </span>
                  <span className="text-gray-200">Move</span>
                </div>
                <div className="flex items-center justify-between text-white py-1">
                  <span className="flex items-center space-x-1.5">
                    <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">Q</kbd>
                    <span className="text-gray-400">/</span>
                    <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">E</kbd>
                  </span>
                  <span className="text-gray-200">Rotate</span>
                </div>
                <div className="flex items-center justify-between text-white py-1">
                  <kbd className="px-2.5 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">Click</kbd>
                  <span className="text-gray-200">Interact</span>
                </div>
                <div className="flex items-center justify-between text-white py-1">
                  <kbd className="px-2.5 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">H</kbd>
                  <span className="text-gray-200">Show/Hide help</span>
                </div>
              </div>
              
              {/* Footer hint */}
              <div className="mt-4 pt-3 border-t border-slate-500/40">
                <p className="text-[10px] text-gray-300 text-center leading-relaxed">
                  Click panels to explore
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-slate-700/70 shadow-xl transition-all duration-300 group"
        onClick={() => setShowHelp(true)}
      >
        <span className="flex items-center space-x-2">
          <span className="text-sm group-hover:scale-110 transition-transform">🎮</span>
          <span className="hidden sm:inline">Help & Controls</span>
          <span className="sm:hidden">Help</span>
        </span>
      </button>

      <button 
        className="fixed top-4 right-4 backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 p-3 rounded-full hover:bg-slate-700/70 shadow-xl transition-all duration-300 group"
        onClick={() => setShowMusicPanel(prev => !prev)}
      >
        <span className="text-lg group-hover:scale-110 transition-transform inline-block">🎵</span>
      </button>

      {/* Music Panel or Player */}
      {showMusicPanel && !isPlayerOpen && (
        <div className="fixed top-20 right-4 w-48 z-50">
          {/* Compact Music Panel - Track Selection */}
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 border border-slate-400/40 rounded-2xl shadow-2xl overflow-hidden">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-blue-900/20 to-slate-800/20"></div>
            
            {/* Content */}
            <div className="relative p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Music</h4>
                <button
                  onClick={() => setShowMusicPanel(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300 group"
                >
                  <span className="text-white text-sm font-light group-hover:rotate-90 transition-transform duration-300">×</span>
                </button>
              </div>
              
              {/* Music Tracks - Clickable */}
              <div className="space-y-2">
                {tracks.map((track) => (
                  <button
                    key={track.title}
                    onClick={() => handleTrackSelect(track)}
                    className="w-full backdrop-blur-md bg-gradient-to-r from-purple-900/40 to-purple-800/40 border border-purple-400/30 text-white py-2 px-3 rounded-xl text-xs font-medium hover:from-purple-800/50 hover:to-purple-700/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center space-x-1.5">
                      <span className="text-sm">{track.icon}</span>
                      <span>{track.title}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer hint */}
              <p className="text-[10px] text-gray-300 text-center mt-2">
                Click to play
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Music Player */}
      {isPlayerOpen && currentTrack && (
        <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-64' : 'w-80'}`}>
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 border border-slate-400/40 rounded-2xl shadow-2xl overflow-hidden">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-blue-900/20 to-slate-800/20"></div>
            
            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-600/40">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{currentTrack.icon}</span>
                  <h4 className="text-sm font-semibold text-white">{currentTrack.title}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleMinimizeToggle}
                    className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300"
                    title={isMinimized ? "Maximize" : "Minimize"}
                  >
                    <span className="text-white text-xs">{isMinimized ? '▢' : '▬'}</span>
                  </button>
                  <button
                    onClick={handleClosePlayer}
                    className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300 group"
                  >
                    <span className="text-white text-sm font-light group-hover:rotate-90 transition-transform duration-300">×</span>
                  </button>
                </div>
              </div>

              {/* Video Player Container */}
              <div className={`relative ${isMinimized ? 'hidden' : 'block'}`}>
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
                  {/* Loading indicator */}
                  {!playerReady && !playerError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                      <div className="text-white text-sm flex items-center space-x-2 mb-2">
                        <div className="animate-spin">⏳</div>
                        <span>Loading player...</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {currentTrack.title} - {currentTrack.icon}
                      </div>
                    </div>
                  )}

                  {/* Error indicator */}
                  {playerError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10 p-4">
                      <div className="text-red-400 text-sm mb-3 text-center">
                        {playerError}
                      </div>
                      <div className="space-y-2">
                        <a
                          href={currentTrack.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 text-center"
                        >
                          Open in YouTube
                        </a>
                        <button
                          onClick={() => {
                            setPlayerError(null);
                            setPlayerReady(false);
                          }}
                          className="block bg-gray-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-0 left-0 w-full h-full">
                    {typeof window !== 'undefined' && currentTrack && (
                      <ReactPlayer
                        key={currentTrack.url}
                        url={currentTrack.url}
                        width="100%"
                        height="100%"
                        controls={true}
                        light={false}
                        pip={false}
                        config={{
                          youtube: {
                            playerVars: {
                              autoplay: 0,
                              controls: 1,
                              modestbranding: 1,
                              rel: 0,
                              showinfo: 0,
                              fs: 1,
                              enablejsapi: 1,
                              iv_load_policy: 3,
                              cc_load_policy: 0
                            }
                          }
                        }}
                        onReady={() => {
                          console.log('Player ready - YouTube controls active');
                          setPlayerReady(true);
                          setPlayerError(null);
                        }}
                        onStart={() => {
                          console.log('Video started playing');
                        }}
                        onError={(e: any) => {
                          console.error('Player error:', e);
                          setPlayerError('Failed to load video. Try a different track or open in YouTube.');
                        }}
                        onLoad={() => {
                          console.log('Video loaded successfully');
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-3 space-y-3">
                {/* Info */}
                <div className="text-xs text-gray-400 text-center bg-slate-800/30 rounded-lg p-2">
                  Use YouTube controls to play/pause
                </div>


                {/* Track List */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-300 mb-2">Tracks</p>
                  <div className="space-y-1">
                    {tracks.map((track) => (
                      <button
                        key={track.title}
                        onClick={() => handleTrackSelect(track)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                          currentTrack.title === track.title
                            ? 'bg-blue-500/40 border border-blue-400/40 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-gray-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{track.icon}</span>
                          <span>{track.title}</span>
                          {currentTrack.title === track.title && isPlaying && (
                            <span className="ml-auto">♪</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderContentModal()}
    </div>
  );
}
