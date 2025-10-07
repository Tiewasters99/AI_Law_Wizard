"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Type definitions
interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

interface ChairProps {
  position: [number, number, number];
  rotation: number;
}

interface ReceptionDeskProps {
  onObjectClick: (e: any, userData: UserData) => void;
  receptionTexture: THREE.Texture | null;
}

interface LampProps {
  position: [number, number, number];
  lampsOn: boolean;
  lampShadesRef: React.MutableRefObject<any[]>;
  index: number;
  onObjectClick: (userData: UserData) => void;
}

interface OfficeSceneProps {
  onObjectClick: (userData: UserData) => void;
  lampsOn: boolean;
}

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

function OfficeScene({ onObjectClick, lampsOn }: OfficeSceneProps) {
  const scene = useRef<THREE.Group>(null);
  const lampLightsRef = useRef<(THREE.PointLight | null)[]>([]);
  const lampShadesRef = useRef<(THREE.Mesh | null)[]>([]);
  
  useEffect(() => {
    lampShadesRef.current.forEach(shade => {
      if (shade && shade.material && 'emissiveIntensity' in shade.material) {
        (shade.material as any).emissiveIntensity = lampsOn ? 0.5 : 0;
        (shade.material as any).needsUpdate = true;
      }
    });
    
    lampLightsRef.current.forEach(light => {
      if (light) {
        light.intensity = lampsOn ? 2.0 : 0;
      }
    });
  }, [lampsOn]);

  const handleClick = (e: any, userData: UserData) => {
    e.stopPropagation();
    if (userData && userData.interactive) {
      onObjectClick(userData);
    }
  };

  const brandTexture = createTextTexture('QUAINTON LAW', 120);
  const miniverseTexture = createTextTexture('MINIVERSE™', 80);
  const rightWallBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 80);
  const backWallFarBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 80, '#ffffff');
  const firmVideosTexture = createTextTexture('FIRM VIDEOS', 60, '#ffffff');
  const ourWallTexture = createTextTexture('OUR WALL', 60, '#ffffff');
  const artworkTexture = createTextTexture('FIRM ARTWORK', 70, '#ffffff');
  const profilesTexture = createTextTexture('PROFILES', 40, '#ffffff');
  const firmLibraryTexture = createTextTexture('FIRM LIBRARY', 50, '#ffffff');
  const receptionTexture = createTextTexture('RECEPTION', 60, '#000000');
  const legalMaterialsTexture = createTextTexture('LEGAL MATERIALS', 45, '#ffffff');
  const ideaVaultTexture = createTextTexture('IDEA VAULT', 42, '#1a1a2e');
  const rightArtworkTexture = createTextTexture('ARTWORK', 65, '#ffffff');
  const personalImagesTexture = createTextTexture('PERSONAL IMAGES', 55, '#ffffff');

  return (
    <group ref={scene}>
      {/* Enhanced Ambient Lighting */}
      <ambientLight intensity={0.8} color="#f8fafc" />
      
      {/* Main Directional Lights with Shadows */}
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={2.2} 
        castShadow 
        color="#ffffff"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-12, 8, -8]} intensity={1.2} color="#e2e8f0" />
      <directionalLight position={[0, 20, 0]} intensity={1.8} color="#f1f5f9" />
      
      {/* Fill Lights for Better Illumination */}
      <directionalLight position={[15, 5, 5]} intensity={0.6} color="#fef3c7" />
      <directionalLight position={[-15, 5, 5]} intensity={0.6} color="#ddd6fe" />
      
      <pointLight 
        ref={(ref) => { if (ref) lampLightsRef.current[0] = ref; }}
        position={[-8, 2.5, 8]} 
        intensity={lampsOn ? 3.5 : 0} 
        color="#fbbf24" 
        distance={18}
        decay={2}
        castShadow
      />
      <pointLight 
        ref={(ref) => { if (ref) lampLightsRef.current[1] = ref; }}
        position={[8, 2.5, 8]} 
        intensity={lampsOn ? 3.5 : 0} 
        color="#fbbf24" 
        distance={18}
        decay={2}
        castShadow
      />
      
      {/* Enhanced ceiling lights */}
      <pointLight position={[0, 8, 0]} intensity={2.0} color="#ffffff" distance={20} decay={2} />
      <pointLight position={[-7, 8, 0]} intensity={1.8} color="#fefefe" distance={18} decay={2} />
      <pointLight position={[7, 8, 0]} intensity={1.8} color="#fefefe" distance={18} decay={2} />
      <pointLight position={[0, 8, -7]} intensity={1.8} color="#fefefe" distance={18} decay={2} />
      <pointLight position={[0, 8, 7]} intensity={1.8} color="#fefefe" distance={18} decay={2} />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#2a2a40', 25, 45]} />

      {/* Enhanced Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.8} 
          metalness={0.1}
          normalScale={[2, 2]}
        />
      </mesh>

      {/* Enhanced Walls */}
      <mesh position={[0, 5, -15]} receiveShadow castShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          roughness={0.6} 
          metalness={0.05}
          normalScale={[1.5, 1.5]}
        />
      </mesh>

      <mesh position={[-15, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 30]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          roughness={0.6} 
          metalness={0.05}
          normalScale={[1.5, 1.5]}
        />
      </mesh>

      <mesh position={[15, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 10, 30]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          roughness={0.6} 
          metalness={0.05}
          normalScale={[1.5, 1.5]}
        />
      </mesh>

      {/* Enhanced Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#f8fafc" 
          roughness={0.3} 
          metalness={0.02}
          emissive="#f1f5f9"
          emissiveIntensity={0.1}
        />
      </mesh>

      {brandTexture && (
        <mesh position={[0, 7.5, -14.7]}>
          <planeGeometry args={[12, 3]} />
          <meshBasicMaterial map={brandTexture} transparent />
        </mesh>
      )}

      {miniverseTexture && (
        <mesh position={[0, 5.8, -14.7]}>
          <planeGeometry args={[10, 2.5]} />
          <meshBasicMaterial map={miniverseTexture} transparent />
        </mesh>
      )}

      {rightWallBrandTexture && (
        <mesh position={[14.4, 6, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[6, 2]} />
          <meshBasicMaterial map={rightWallBrandTexture} transparent />
        </mesh>
      )}

      {backWallFarBrandTexture && (
        <mesh position={[0, 6, 14.7]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[8, 2.5]} />
          <meshBasicMaterial map={backWallFarBrandTexture} transparent />
        </mesh>
      )}

      <mesh 
        position={[-6, 3.5, -14.6]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'video', label: 'FIRM VIDEOS', interactive: true })}
      >
        <boxGeometry args={[6, 4, 0.3]} />
        <meshStandardMaterial color="#8b0000" roughness={0.4} metalness={0.6} />
      </mesh>

      {firmVideosTexture && (
        <mesh position={[-6, 3.5, -14.4]}>
          <planeGeometry args={[5, 1.5]} />
          <meshBasicMaterial map={firmVideosTexture} transparent />
        </mesh>
      )}

      <mesh 
        position={[6, 3.5, -14.6]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'ourwall', label: 'OUR WALL', interactive: true })}
      >
        <boxGeometry args={[6, 4, 0.3]} />
        <meshStandardMaterial color="#1e4d8b" roughness={0.4} metalness={0.6} />
      </mesh>

      {ourWallTexture && (
        <mesh position={[6, 3.5, -14.4]}>
          <planeGeometry args={[5, 1.5]} />
          <meshBasicMaterial map={ourWallTexture} transparent />
        </mesh>
      )}

      <mesh 
        position={[0, 3, -14.6]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'art', label: 'FIRM ARTWORK', interactive: true })}
      >
        <boxGeometry args={[5, 3, 0.3]} />
        <meshStandardMaterial color="#2d5016" roughness={0.4} metalness={0.6} />
      </mesh>

      {artworkTexture && (
        <mesh position={[0, 3, -14.4]}>
          <planeGeometry args={[4.5, 1.5]} />
          <meshBasicMaterial map={artworkTexture} transparent />
        </mesh>
      )}

      {[-9, -5, -1, 1, 5, 9].map((x, index) => (
        <group key={`profile-${index}`}>
          <mesh 
            position={[x, 2.5, 14.6]} 
            castShadow
            onClick={(e) => handleClick(e, { type: 'profile', label: `PROFILE ${index + 1}`, interactive: true })}
          >
            <boxGeometry args={[3.5, 1.2, 0.3]} />
            <meshStandardMaterial color="#5a4a6a" roughness={0.4} metalness={0.6} />
          </mesh>
          {profilesTexture && (
            <mesh position={[x, 2.5, 14.8]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[3, 0.8]} />
              <meshBasicMaterial map={profilesTexture} transparent />
            </mesh>
          )}
        </group>
      ))}

      {/* Enhanced Conference Table */}
      <group position={[0, 0, 0]}>
        {/* Table Top */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 0.1, 5]} />
          <meshStandardMaterial 
            color="#1f2937" 
            roughness={0.2} 
            metalness={0.3}
            normalScale={[1.5, 1.5]}
          />
        </mesh>
        
        {/* Table Edge/Trim */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[10.2, 0.05, 5.2]} />
          <meshStandardMaterial 
            color="#374151" 
            roughness={0.1} 
            metalness={0.6}
            emissive="#4b5563"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Table Glass Surface */}
        <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.8, 0.02, 4.8]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.05} 
            metalness={0.9}
            transparent={true}
            opacity={0.1}
          />
        </mesh>
        
        {/* Enhanced Table Legs */}
        <mesh position={[-4.5, 0.4, -2]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial 
            color="#374151" 
            roughness={0.1} 
            metalness={0.7}
            emissive="#4b5563"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[4.5, 0.4, -2]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial 
            color="#374151" 
            roughness={0.1} 
            metalness={0.7}
            emissive="#4b5563"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[-4.5, 0.4, 2]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial 
            color="#374151" 
            roughness={0.1} 
            metalness={0.7}
            emissive="#4b5563"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[4.5, 0.4, 2]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial 
            color="#374151" 
            roughness={0.1} 
            metalness={0.7}
            emissive="#4b5563"
            emissiveIntensity={0.05}
          />
        </mesh>
      </group>

      {/* Chairs around the centered rectangular conference table (10x5 units) */}
      {/* Long sides - 3 chairs each */}
      <Chair position={[-4, 0, 3.5]} rotation={Math.PI} />
      <Chair position={[0, 0, 3.5]} rotation={Math.PI} />
      <Chair position={[4, 0, 3.5]} rotation={Math.PI} />
      
      <Chair position={[-4, 0, -3.5]} rotation={0} />
      <Chair position={[0, 0, -3.5]} rotation={0} />
      <Chair position={[4, 0, -3.5]} rotation={0} />
      
      {/* Short sides - 2 chairs each */}
      <Chair position={[-6.2, 0, 1]} rotation={Math.PI / 2} />
      <Chair position={[-6.2, 0, -1]} rotation={Math.PI / 2} />
      
      <Chair position={[6.2, 0, 1]} rotation={-Math.PI / 2} />
      <Chair position={[6.2, 0, -1]} rotation={-Math.PI / 2} />
      

      <Lamp position={[-8, 0, 8]} lampsOn={lampsOn} lampShadesRef={lampShadesRef} index={0} onObjectClick={onObjectClick} />
      <Lamp position={[8, 0, 8]} lampsOn={lampsOn} lampShadesRef={lampShadesRef} index={1} onObjectClick={onObjectClick} />

      {[
        { label: 'Leave Review', x: -3, z: 0 },
        { label: 'Our Website', x: -1, z: 0 },
        { label: 'Other Sites', x: 1, z: 0 },
        { label: 'Pro Bono', x: 3, z: 0 }
      ].map((item, idx) => {
        const itemTexture = createTextTexture(item.label, 30);
        return (
          <group key={`table-${idx}`}>
            <mesh 
              position={[item.x, 1, item.z]}
              onClick={(e) => handleClick(e, { type: 'tableItem', label: item.label, interactive: true })}
            >
              <boxGeometry args={[0.5, 0.05, 0.7]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {itemTexture && (
              <mesh position={[item.x, 1.03, item.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 0.1]} />
                <meshBasicMaterial map={itemTexture} transparent />
              </mesh>
            )}
          </group>
        );
      })}

      <mesh position={[-14.5, 3, -6]} castShadow>
        <boxGeometry args={[0.4, 6, 6]} />
        <meshStandardMaterial color="#4a2c1a" />
      </mesh>

      {firmLibraryTexture && (
        <mesh position={[-14.3, 5.5, -6]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5, 1.5]} />
          <meshBasicMaterial map={firmLibraryTexture} transparent />
        </mesh>
      )}

      {[...Array(25)].map((_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const bookTitles = [
          'Read Me', 'Explore Me', 'Check Me Out', 'Read Me', 'Explore Me', 
          'Check Me Out', 'Read Me', 'Explore Me', 'Check Me Out', 'Read Me', 
          'Explore Me', 'Check Me Out', 'Read Me', 'Explore Me', 'Check Me Out', 
          'Read Me', 'Explore Me', 'Check Me Out', 'Read Me', 'Explore Me', 
          'Check Me Out', 'Read Me', 'Explore Me', 'Check Me Out', 'Agentic Theory'
        ];
        return (
          <mesh 
            key={`book-${i}`}
            position={[-14.3, 0.8 + row * 1, -8 + col * 1.2]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
            onClick={(e) => handleClick(e, { type: 'book', label: bookTitles[i], interactive: true })}
          >
            <boxGeometry args={[0.15, 0.8, 0.2]} />
            <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)} />
          </mesh>
        );
      })}

      <ReceptionDesk onObjectClick={handleClick} receptionTexture={receptionTexture} />

      <mesh 
        position={[-14.6, 3.5, 6]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'legal', label: 'LEGAL MATERIALS', interactive: true })}
      >
        <boxGeometry args={[0.3, 4, 5]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.6} />
      </mesh>

      {legalMaterialsTexture && (
        <mesh position={[-14.4, 3.5, 6]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4, 2]} />
          <meshBasicMaterial map={legalMaterialsTexture} transparent />
        </mesh>
      )}

      <mesh 
        position={[14.6, 3.5, -8]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'ideaVault', label: 'IDEA VAULT', interactive: true })}
      >
        <boxGeometry args={[0.3, 2.5, 2.5]} />
        <meshStandardMaterial color="#ffd700" roughness={0.4} metalness={0.6} />
      </mesh>

      {ideaVaultTexture && (
        <mesh position={[14.4, 3.5, -8]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.5, 2]} />
          <meshBasicMaterial map={ideaVaultTexture} transparent />
        </mesh>
      )}

      <mesh 
        position={[14.6, 3.8, -4]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'rightArt', label: 'ARTWORK', interactive: true })}
      >
        <boxGeometry args={[0.3, 3.5, 3]} />
        <meshStandardMaterial color="#2d5016" roughness={0.4} metalness={0.6} />
      </mesh>

      {rightArtworkTexture && (
        <mesh position={[14.4, 3.8, -4]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.5, 2]} />
          <meshBasicMaterial map={rightArtworkTexture} transparent />
        </mesh>
      )}

      <mesh 
        position={[14.6, 3.5, 6]} 
        castShadow
        onClick={(e) => handleClick(e, { type: 'personalImages', label: 'PERSONAL IMAGES', interactive: true })}
      >
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color="#4a2c5f" roughness={0.4} metalness={0.6} />
      </mesh>

      {personalImagesTexture && (
        <mesh position={[14.4, 3.5, 6]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.5, 2]} />
          <meshBasicMaterial map={personalImagesTexture} transparent />
        </mesh>
      )}

      {[...Array(6)].map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <mesh 
            key={`cert-${i}`}
            position={[14.6, 2 + row * 2.5, -1 + col * 1.5]}
            castShadow
            onClick={(e) => handleClick(e, { type: 'certificate', label: `Certificate ${i + 1}`, interactive: true })}
          >
            <boxGeometry args={[0.3, 1.5, 1.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

function Chair({ position, rotation }: ChairProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Enhanced Chair Seat */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.17, 0.8]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
          normalScale={[1, 1]}
        />
      </mesh>
      
      {/* Enhanced Seat Cushion */}
      <mesh position={[0, 0.59, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.83, 0.14, 0.77]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.7} 
          metalness={0.05}
          normalScale={[2, 2]}
        />
      </mesh>
      
      {/* Enhanced Chair Back */}
      <mesh position={[0, 1.1, -0.35]} castShadow>
        <boxGeometry args={[0.85, 1.2, 0.08]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
          normalScale={[1, 1]}
        />
      </mesh>
      
      {/* Enhanced Back Cushion */}
      <mesh position={[0, 1.1, -0.31]} castShadow>
        <boxGeometry args={[0.87, 1.1, 0.04]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.7} 
          metalness={0.05}
          normalScale={[2, 2]}
        />
      </mesh>
      
      {/* Enhanced Chair Legs */}
      <mesh position={[-0.35, 0.25, -0.35]} castShadow>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.35, 0.25, -0.35]} castShadow>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[-0.35, 0.25, 0.35]} castShadow>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#374151" 
          roughness={0.2} 
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.35, 0.25, 0.35]} castShadow>
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
      <mesh position={[-0.45, 0.8, 0]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.7]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
          normalScale={[1, 1]}
        />
      </mesh>
      <mesh position={[0.45, 0.8, 0]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.7]} />
        <meshStandardMaterial 
          color="#1f2937" 
          roughness={0.3} 
          metalness={0.2}
          normalScale={[1, 1]}
        />
      </mesh>
    </group>
  );
}

function ReceptionDesk({ onObjectClick, receptionTexture }: ReceptionDeskProps) {
  const receptionBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 50);

  return (
    <group>
      <mesh position={[-24, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>

      <mesh position={[-24, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 1.5, 16]} />
        <meshStandardMaterial color="#2c5f8d" />
      </mesh>

      <mesh position={[-24, 2.8, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

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

      {['Engagement Letters', 'Firm Brochure', 'NDAs'].map((item, i) => (
        <mesh 
          key={`desk-${i}`}
          position={[-24, 1.03, -0.6 + i * 0.5]}
          rotation={[-Math.PI / 8, 0, 0]}
          onClick={(e) => onObjectClick(e, { type: 'deskItem', label: item, interactive: true })}
        >
          <boxGeometry args={[0.4, 0.04, 0.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function Lamp({ position, lampsOn, lampShadesRef, index, onObjectClick }: LampProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh 
        ref={(ref) => { if (ref) lampShadesRef.current[index] = ref; }}
        position={[0, 1.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onObjectClick({ type: 'lamp', label: `Lamp ${index + 1}`, interactive: true });
        }}
      >
        <coneGeometry args={[0.4, 0.6, 16]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={lampsOn ? 0.5 : 0} 
        />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const keysRef = useRef({ 
    w: false, a: false, s: false, d: false, 
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false 
  });

  // Initialize camera position
  useEffect(() => {
    camera.position.set(0, 1.6, 12);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Mouse/touch controls for camera rotation
  useEffect(() => {
    const canvas = gl.domElement;

    const handleStart = (clientX: number, clientY: number) => {
      setIsDragging(true);
      setLastTouch({ x: clientX, y: clientY });
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        const deltaX = clientX - lastTouch.x;
        const deltaY = clientY - lastTouch.y;
        
        // Rotate camera around the center point
        const currentPos = camera.position.clone();
        const center = new THREE.Vector3(0, 0, 0);
        
        // Calculate current angle from center
        const currentAngle = Math.atan2(currentPos.x, currentPos.z);
        const radius = Math.sqrt(currentPos.x * currentPos.x + currentPos.z * currentPos.z);
        
        // Apply rotation
        const newAngle = currentAngle + deltaX * 0.005;
        const newX = Math.sin(newAngle) * radius;
        const newZ = Math.cos(newAngle) * radius;
        
        // Update camera position
        camera.position.set(newX, currentPos.y, newZ);
        camera.lookAt(center);
        
        setLastTouch({ x: clientX, y: clientY });
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, lastTouch, camera, gl]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'w') keysRef.current.w = true;
      else if (key === 'a') keysRef.current.a = true;
      else if (key === 's') keysRef.current.s = true;
      else if (key === 'd') keysRef.current.d = true;
      else if (e.key === 'ArrowUp') keysRef.current.ArrowUp = true;
      else if (e.key === 'ArrowLeft') keysRef.current.ArrowLeft = true;
      else if (e.key === 'ArrowDown') keysRef.current.ArrowDown = true;
      else if (e.key === 'ArrowRight') keysRef.current.ArrowRight = true;
      
      if (['w', 'a', 's', 'd'].includes(key) || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'w') keysRef.current.w = false;
      else if (key === 'a') keysRef.current.a = false;
      else if (key === 's') keysRef.current.s = false;
      else if (key === 'd') keysRef.current.d = false;
      else if (e.key === 'ArrowUp') keysRef.current.ArrowUp = false;
      else if (e.key === 'ArrowLeft') keysRef.current.ArrowLeft = false;
      else if (e.key === 'ArrowDown') keysRef.current.ArrowDown = false;
      else if (e.key === 'ArrowRight') keysRef.current.ArrowRight = false;
      
      if (['w', 'a', 's', 'd'].includes(key) || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Movement animation loop
  useFrame(() => {
    const moveSpeed = 0.1;
    const { w, a, s, d, ArrowUp, ArrowLeft, ArrowDown, ArrowRight } = keysRef.current;
    
    // Calculate movement direction
    let moveForward = 0;
    let moveRight = 0;
    
    // WASD and Arrow keys
    if (w || ArrowUp) moveForward += moveSpeed;
    if (s || ArrowDown) moveForward -= moveSpeed;
    if (a || ArrowLeft) moveRight -= moveSpeed;
    if (d || ArrowRight) moveRight += moveSpeed;
    
    // Apply movement relative to camera direction
    if (moveForward !== 0 || moveRight !== 0) {
      const currentPos = camera.position.clone();
      
      // Get camera's current direction vectors
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      camera.getWorldDirection(forward);
      forward.y = 0; // Keep movement on horizontal plane
      forward.normalize();
      
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
      right.normalize();
      
      // Calculate new position
      const newPos = currentPos.clone();
      newPos.add(forward.multiplyScalar(moveForward));
      newPos.add(right.multiplyScalar(moveRight));
      
      // Keep camera at eye level
      newPos.y = 1.6;
      
        // Boundary constraints (room is now 30x30 units)
        newPos.x = Math.max(-13, Math.min(13, newPos.x));
        newPos.z = Math.max(-13, Math.min(13, newPos.z));
      
      camera.position.copy(newPos);
    }
  });

  return null;
}

export default function MiniversePage() {
  const [showHelp, setShowHelp] = useState(true);
  const [selectedContent, setSelectedContent] = useState<UserData | null>(null);
  const [lampsOn, setLampsOn] = useState(true);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Audio control functions
  const playAudio = (trackName: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setIsLoading(true);
    setCurrentTrack(trackName);

    // Create new audio element with proper error handling
    const audio = new Audio(`/images/${trackName}`);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    // Enhanced error handling and loading
    const handleAudioReady = () => {
      console.log('Audio ready to play:', trackName);
      audio.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setCurrentTrack(trackName);
        setCurrentAudio(audio);
      }).catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentTrack(null);
      });
    };

    const handleAudioError = (e: any) => {
      console.error('Error loading audio:', trackName, e);
      console.error('Audio src:', audio.src);
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTrack(null);
      
      // Try alternative paths
      console.log('Trying alternative audio paths...');
      const alternativePaths = [
        `./images/${trackName}`,
        `/public/images/${trackName}`,
        `images/${trackName}`
      ];
      
      let pathIndex = 0;
      const tryNextPath = () => {
        if (pathIndex < alternativePaths.length) {
          const altAudio = new Audio(alternativePaths[pathIndex]);
          altAudio.loop = true;
          altAudio.volume = 0.5;
          altAudio.crossOrigin = 'anonymous';
          
          altAudio.addEventListener('canplaythrough', () => {
            altAudio.play().then(() => {
              setIsPlaying(true);
              setIsLoading(false);
              setCurrentTrack(trackName);
              setCurrentAudio(altAudio);
            }).catch((altError) => {
              console.error(`Alternative path ${pathIndex + 1} failed:`, altError);
              pathIndex++;
              tryNextPath();
            });
          });
          
          altAudio.addEventListener('error', () => {
            console.error(`Alternative path ${pathIndex + 1} failed to load`);
            pathIndex++;
            tryNextPath();
          });
        } else {
          console.error('All audio paths failed');
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentTrack(null);
        }
      };
      
      tryNextPath();
    };

    audio.addEventListener('canplaythrough', handleAudioReady);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('loadstart', () => {
      console.log('Starting to load audio:', trackName);
    });

    setCurrentAudio(audio);
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  const toggleAudio = () => {
    if (isPlaying && currentAudio) {
      // Pause the audio without stopping it completely
      currentAudio.pause();
      setIsPlaying(false);
    } else if (currentTrack && currentAudio) {
      // Resume current track
      currentAudio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error resuming audio:', error);
        setIsPlaying(false);
        // If resume fails, try to restart the track
        if (currentTrack) {
          playAudio(currentTrack);
        }
      });
    } else if (currentTrack && !currentAudio) {
      // If we have a track but no audio element, restart it
      playAudio(currentTrack);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = '';
        currentAudio.load(); // Reset the audio element
      }
    };
  }, [currentAudio]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      setCurrentAudio(null);
      setIsPlaying(false);
      setCurrentTrack(null);
    };
  }, [currentAudio]);

  const handleObjectClick = (userData: UserData) => {
    if (userData.type === 'lamp') {
      setLampsOn(prev => !prev);
    } else {
      setSelectedContent(userData);
    }
  };

  const renderContentModal = () => {
    if (!selectedContent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl max-h-[85vh] overflow-hidden">
          <div className="max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">{selectedContent.label}</h2>
            
            {selectedContent.type === 'video' && (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Featured Firm Videos</h3>
                <button 
                  className="w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold"
                  onClick={() => window.open('https://www.youtube.com/watch?v=FUnCvHnitPQ', '_blank')}
                >
                  Watch Our Featured Video
                </button>
                <p className="text-center text-gray-600 text-sm mb-4">Click to open video in new tab</p>
              </div>
            )}

            {selectedContent.type === 'art' && (
              <div>
                <p className="text-gray-700 mb-4">Display your firm artwork gallery</p>
                <button 
                  className="w-full bg-green-800 text-white py-4 px-6 rounded-xl mb-3 font-bold"
                  onClick={() => window.open('https://i.imgur.com/Gc59Q6K.png', '_blank')}
                >
                  Artwork #1
                </button>
                <button 
                  className="w-full bg-green-800 text-white py-4 px-6 rounded-xl mb-3 font-bold"
                  onClick={() => window.open('https://i.imgur.com/6YKVvhG.png', '_blank')}
                >
                  Artwork #2
                </button>
          </div>
        )}

            {selectedContent.type === 'book' && selectedContent.label === 'Read Me' && (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Featured Article</h3>
                <button 
                  className="w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold"
                  onClick={() => window.open('https://drive.google.com/file/d/1iBAI7spq1vJiP7PNzal3d4yY-VaHOWHQ/view?usp=sharing', '_blank')}
                >
                  The Unknowable Unknown: The Case for AI Arms Control
                </button>
                <p className="text-gray-700">Why a Global Cap on AI Compute Is Essential for Human Survival</p>
          </div>
        )}

            {selectedContent.type === 'book' && selectedContent.label === 'Explore Me' && (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Featured Research Paper</h3>
                <button 
                  className="w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold"
                  onClick={() => window.open('https://arxiv.org/pdf/2306.07174', '_blank')}
                >
                  Augmenting Language Models with Long-Term Memory
                </button>
                <p className="text-gray-700">LONGMEM: Enabling LLMs to memorize long history</p>
          </div>
        )}
        
            {selectedContent.type === 'book' && selectedContent.label === 'Agentic Theory' && (
              <div>
                <button 
                  className="w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold"
                  onClick={() => window.open('https://drive.google.com/file/d/1ebvUaV9y3LvxpmgItgSTkMmHa4Ls_ZIZ/view?usp=drivesdk', '_blank')}
                >
                  Read: Agentic Theory
                </button>
              </div>
            )}

            {selectedContent.type === 'ideaVault' && (
              <div className="bg-yellow-400 p-8 rounded-2xl text-center mb-5">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">Coming Soon</h3>
                <p className="text-gray-700">The Idea Vault will let you capture and save thoughts as you explore the Miniverse</p>
              </div>
            )}

            {selectedContent.type === 'profile' && (
              <div>
                <p className="text-gray-700">Videos, articles, testimonials from team members, partners, clients and more.</p>
              </div>
            )}

            {selectedContent.type === 'ourwall' && (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Our Wall - Firm Updates & Information</h3>
                <button className="w-full bg-purple-800 text-white py-4 px-6 rounded-xl mb-3 font-bold">
                  Client Testimonials
                </button>
                <button className="w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold">
                  Featured Cases
                </button>
              </div>
            )}

            {(selectedContent.type === 'legal' || selectedContent.type === 'rightArt' || 
              selectedContent.type === 'certificate' || selectedContent.type === 'tableItem' || 
              selectedContent.type === 'deskItem' || selectedContent.type === 'personalImages') && (
              <div>
                <p className="text-gray-700">Add your content via URL embeds (Vimeo, SoundCloud, Imgur, Google Drive, PDFs, etc.)</p>
        </div>
            )}

            {(selectedContent.type === 'book' && !['Read Me', 'Explore Me', 'Agentic Theory'].includes(selectedContent.label)) && (
              <div>
                <p className="text-gray-700">Legal resources and documents available via Google Drive or your website hosting</p>
              </div>
            )}
            </div>

        <button
            className="absolute top-4 right-4 bg-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold"
            onClick={() => setSelectedContent(null)}
          >
            ×
        </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative">
      <Canvas 
        camera={{ position: [0, 1.6, 12], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#2a2a40']} />
          <CameraRig />
          <OfficeScene onObjectClick={handleObjectClick} lampsOn={lampsOn} />
        </Suspense>
      </Canvas>

      {showHelp && (
        <div className="absolute top-4 left-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-5 max-w-sm">
          <button 
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors duration-200 text-lg font-bold"
            onClick={() => setShowHelp(false)}
          >
            ×
          </button>
          <h3 className="text-white text-base font-semibold mb-3 tracking-wide">Quainton Law Miniverse</h3>
          <div className="space-y-2">
            <h4 className="text-white/90 text-sm font-medium">Controls:</h4>
            <div className="space-y-1 text-xs text-white/80">
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>WASD/Arrows: Move</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Mouse drag: Rotate</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Click: Interact</span>
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-white/70 text-xs leading-relaxed">
                Explore: Bookshelf, Desk, Materials, Artwork, Table, Lamps
              </p>
            </div>
          </div>
        </div>
      )}

      <button 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-300"
        onClick={() => setShowHelp(true)}
      >
        <span className="flex items-center space-x-2">
          <span>🎮</span>
          <span>WASD/Arrows to move • Click panels to explore • Click here for help</span>
        </span>
      </button>

      <button 
        className="absolute top-5 right-5 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl p-4 rounded-full hover:bg-white/20 transition-all duration-300 group"
        onClick={() => setShowMusicPanel(prev => !prev)}
      >
        <span className="text-xl text-white group-hover:scale-110 transition-transform duration-200">🎵</span>
        {isPlaying && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
        )}
      </button>

      {showMusicPanel && (
        <div className="absolute top-20 right-5 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6 max-w-sm">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white text-lg font-semibold tracking-wide">Audio Player</h4>
            <button
              onClick={() => setShowMusicPanel(false)}
              className="text-white/70 hover:text-white transition-colors duration-200 text-xl hover:scale-110 transform transition-transform"
            >
              ×
            </button>
          </div>
          
          {/* Track Selection */}
          <div className="space-y-3 mb-4">
            {/* Audio Track 1 */}
            <button 
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm ${
                currentTrack === 'audio1.mp3' 
                  ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/50 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20 hover:border-white/30'
              }`}
              onClick={() => {
                if (currentTrack === 'audio1.mp3' && isPlaying) {
                  toggleAudio();
                } else {
                  playAudio('audio1.mp3');
                }
              }}
              disabled={isLoading && currentTrack !== 'audio1.mp3'}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🎵</span>
                <span>
                  {currentTrack === 'audio1.mp3' && isLoading 
                    ? 'Loading...' 
                    : currentTrack === 'audio1.mp3' && isPlaying 
                    ? 'Track 1 • Playing' 
                    : currentTrack === 'audio1.mp3' && !isPlaying
                    ? 'Track 1 • Paused'
                    : 'Track 1'
                  }
                </span>
                {currentTrack === 'audio1.mp3' && isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {currentTrack === 'audio1.mp3' && isPlaying && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            </button>
            
            {/* Audio Track 2 */}
            <button 
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm ${
                currentTrack === 'audio2.mp3' 
                  ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/50 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20 hover:border-white/30'
              }`}
              onClick={() => {
                if (currentTrack === 'audio2.mp3' && isPlaying) {
                  toggleAudio();
                } else {
                  playAudio('audio2.mp3');
                }
              }}
              disabled={isLoading && currentTrack !== 'audio2.mp3'}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🎶</span>
                <span>
                  {currentTrack === 'audio2.mp3' && isLoading 
                    ? 'Loading...' 
                    : currentTrack === 'audio2.mp3' && isPlaying 
                    ? 'Track 2 • Playing' 
                    : currentTrack === 'audio2.mp3' && !isPlaying
                    ? 'Track 2 • Paused'
                    : 'Track 2'
                  }
                </span>
                {currentTrack === 'audio2.mp3' && isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {currentTrack === 'audio2.mp3' && isPlaying && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            </button>
          </div>
          
          {/* Control Buttons */}
          <div className="flex space-x-2 mb-4">
            <button 
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm ${
                isPlaying 
                  ? 'bg-red-500/20 text-red-100 border border-red-400/50 hover:bg-red-500/30' 
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
              }`}
              onClick={toggleAudio}
              disabled={!currentTrack}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button 
              className="py-2.5 px-4 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
              onClick={stopAudio}
              disabled={!currentTrack}
            >
              ⏹ Stop
            </button>
          </div>
          
          {/* Volume Control */}
          {isPlaying && (
            <div className="mb-4">
              <label className="text-white/80 text-sm font-medium block mb-3">Volume</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.5"
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: 'linear-gradient(to right, #10b981 0%, #10b981 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 100%)'
                  }}
                  onChange={(e) => {
                    if (currentAudio) {
                      currentAudio.volume = parseFloat(e.target.value);
                    }
                  }}
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Status Display */}
          <div className="text-center">
            <div className="text-white/70 text-sm font-medium">
              {currentTrack ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Now Playing</span>
                </div>
              ) : (
                'Select a track to begin'
              )}
            </div>
          </div>
        </div>
      )}

      {renderContentModal()}
    </div>
  );
}