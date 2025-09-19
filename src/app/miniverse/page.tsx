"use client";

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Text, useTexture, PerformanceMonitor, Float, Points, PointMaterial, RoundedBox } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

// Keyboard movement controller with Arrow Keys + WASD support
const KeyboardMovement: React.FC = () => {
  const { camera } = useThree();
  const [keys, setKeys] = useState({
    ArrowUp: false, KeyW: false,     // Forward
    ArrowDown: false, KeyS: false,   // Backward
    ArrowLeft: false, KeyA: false,   // Strafe left
    ArrowRight: false, KeyD: false   // Strafe right
  });

  const moveSpeed = 0.08; // Smooth walking speed
  const roomBounds = {
    minX: -10.5, maxX: 10.5,  // Slightly inside walls
    minZ: -7.5, maxZ: 7.5,    // Slightly inside walls
    minY: 1.2, maxY: 2.8      // Keep head height reasonable
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code in keys) {
        event.preventDefault();
        setKeys(prev => ({ ...prev, [event.code]: true }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code in keys) {
        event.preventDefault();
        setKeys(prev => ({ ...prev, [event.code]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    // Get camera's forward and right directions
    camera.getWorldDirection(direction);
    right.crossVectors(camera.up, direction).normalize();
    
    // Calculate movement based on pressed keys
    const movement = new THREE.Vector3();
    
    // Forward/Backward movement (Arrow Up/Down or W/S)
    if (keys.ArrowUp || keys.KeyW) {
      // Move forward (in camera's forward direction, but keep Y stable)
      movement.add(new THREE.Vector3(direction.x, 0, direction.z).normalize().multiplyScalar(moveSpeed));
    }
    if (keys.ArrowDown || keys.KeyS) {
      // Move backward
      movement.add(new THREE.Vector3(direction.x, 0, direction.z).normalize().multiplyScalar(-moveSpeed));
    }
    
    // Strafe movement (Arrow Left/Right or A/D)
    if (keys.ArrowLeft || keys.KeyA) {
      // Strafe left
      movement.add(right.clone().multiplyScalar(moveSpeed));
    }
    if (keys.ArrowRight || keys.KeyD) {
      // Strafe right
      movement.add(right.clone().multiplyScalar(-moveSpeed));
    }

    // Apply movement with boundary checking
    if (movement.length() > 0) {
      const newPosition = camera.position.clone().add(movement);
      
      // Check room boundaries - keep inside walls
      newPosition.x = Math.max(roomBounds.minX, Math.min(roomBounds.maxX, newPosition.x));
      newPosition.z = Math.max(roomBounds.minZ, Math.min(roomBounds.maxZ, newPosition.z));
      newPosition.y = Math.max(roomBounds.minY, Math.min(roomBounds.maxY, newPosition.y));
      
      camera.position.copy(newPosition);
    }
  });

  return null;
};


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

// Procedural wall texture generator (albedo, bump, roughness)
function generateWallTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512; // Keep lightweight but detailed
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = albedo.height = size;
  height.width = height.height = size;
  rough.width = rough.height = size;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  // Fill base color
  actx.fillStyle = baseColor;
  actx.fillRect(0, 0, size, size);

  // Subtle plaster noise using multi-frequency sine noise
  const imageData = actx.getImageData(0, 0, size, size);
  const hData = hctx.createImageData(size, size);
  const rData = rctx.createImageData(size, size);
  const data = imageData.data;
  const hd = hData.data;
  const rd = rData.data;

  // Convert baseColor to RGB
  const tmp = new THREE.Color(baseColor);
  const baseR = Math.round(tmp.r * 255);
  const baseG = Math.round(tmp.g * 255);
  const baseB = Math.round(tmp.b * 255);

  const seed = 37.913;
  const f1 = 0.035, f2 = 0.09, f3 = 0.16;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n1 = Math.sin((x + seed) * f1) * Math.sin((y - seed) * f1);
      const n2 = Math.sin((x * 1.7 + y * 0.5 + seed) * f2);
      const n3 = Math.sin((x * 0.6 - y * 1.3 - seed) * f3);
      let n = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1);
      n = (n + 1) / 2; // 0..1
      const speckle = (Math.random() * 0.04); // micro-variation per pixel
      const brightness = 0.92 + n * 0.06 + speckle; // subtle range

      data[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * brightness)));
      data[i + 3] = 255;

      // Height for bump: stronger response on mid-tones
      const hVal = Math.round(140 + n * 80);
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      // Roughness map: brighter = rougher
      const rVal = Math.round(180 + (1 - n) * 60);
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  // Vertical panel seams
  const seams = 5; // number of panels across
  actx.putImageData(imageData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);
  actx.strokeStyle = 'rgba(0,0,0,0.05)';
  actx.lineWidth = 1;
  hctx.strokeStyle = 'rgba(0,0,0,0.35)';
  hctx.lineWidth = 1;
  for (let s = 1; s < seams; s++) {
    const x = Math.floor((s / seams) * size);
    actx.beginPath();
    actx.moveTo(x, 0);
    actx.lineTo(x, size);
    actx.stroke();
    hctx.beginPath();
    hctx.moveTo(x, 0);
    hctx.lineTo(x, size);
    hctx.stroke();
  }

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  bumpMap.needsUpdate = true;
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}

// Subtle plaster textures for ceiling (no seams, softer variation)
function generateCeilingTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = albedo.height = size;
  height.width = height.height = size;
  rough.width = rough.height = size;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  actx.fillStyle = baseColor;
  actx.fillRect(0, 0, size, size);

  const imageData = actx.getImageData(0, 0, size, size);
  const hData = hctx.createImageData(size, size);
  const rData = rctx.createImageData(size, size);
  const data = imageData.data;
  const hd = hData.data;
  const rd = rData.data;

  const tmp = new THREE.Color(baseColor);
  const baseR = Math.round(tmp.r * 255);
  const baseG = Math.round(tmp.g * 255);
  const baseB = Math.round(tmp.b * 255);

  const seed = 11.71;
  const f1 = 0.025, f2 = 0.065, f3 = 0.12;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n1 = Math.sin((x + seed) * f1) * Math.sin((y - seed) * f1);
      const n2 = Math.sin((x * 1.2 + y * 0.7 + seed) * f2);
      const n3 = Math.sin((x * 0.5 - y * 1.1 - seed) * f3);
      let n = (n1 * 0.55 + n2 * 0.35 + n3 * 0.1);
      n = (n + 1) / 2;
      const speckle = 0.015 * Math.sin(i * 0.0007);
      const brightness = 0.96 + n * 0.03 + speckle;

      data[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * brightness)));
      data[i + 3] = 255;

      const hVal = Math.round(150 + n * 40);
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      const rVal = Math.round(170 + (1 - n) * 40);
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  actx.putImageData(imageData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  bumpMap.needsUpdate = true;
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}

// Procedural wood texture generator (linear grain with subtle variation)
function generateWoodTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const sizeX = 1024;
  const sizeY = 512;
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = sizeX; albedo.height = sizeY;
  height.width = sizeX; height.height = sizeY;
  rough.width = sizeX; rough.height = sizeY;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  const aData = actx.createImageData(sizeX, sizeY);
  const hData = hctx.createImageData(sizeX, sizeY);
  const rData = rctx.createImageData(sizeX, sizeY);
  const ad = aData.data;
  const hd = hData.data;
  const rd = rData.data;

  const base = new THREE.Color(baseColor);
  const baseR = Math.round(base.r * 255);
  const baseG = Math.round(base.g * 255);
  const baseB = Math.round(base.b * 255);

  // Grain frequencies
  const fPrimary = 0.015; // long grain
  const fSecondary = 0.12; // fine grain
  const fWobble = 0.005; // warp in grain
  const seed = 73.291;

  for (let y = 0; y < sizeY; y++) {
    for (let x = 0; x < sizeX; x++) {
      const i = (y * sizeX + x) * 4;

      // Horizontal grain with slight vertical wobble
      const wobble = Math.sin((y + seed) * fWobble) * 24;
      const gx = x + wobble;
      const longGrain = Math.sin(gx * fPrimary) * 0.6 + 0.4;
      const fineGrain = Math.sin((gx + y * 0.35 + seed) * fSecondary) * 0.25 + 0.75;
      const ring = Math.pow(longGrain * fineGrain, 1.2);

      // Occasional darker streaks
      const streak = (Math.sin((x * 0.03 + y * 0.02) + seed) * 0.5 + 0.5) * 0.06;
      const brightness = 0.88 + ring * 0.12 - streak;

      ad[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      ad[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness * (0.98 + ring * 0.02))));
      ad[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * (0.94 + ring * 0.06))));
      ad[i + 3] = 255;

      // Height map for bump (responds around mid-tones of ring)
      const hVal = Math.round(120 + ring * 100 - streak * 80);
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      // Roughness: darker grains slightly smoother
      const rVal = Math.round(170 + (1 - ring) * 60 + streak * 30);
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  actx.putImageData(aData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  bumpMap.needsUpdate = true;
  roughnessMap.needsUpdate = true;
  return { map, bumpMap, roughnessMap };
}

// Procedural fabric texture (woven) for upholstered furniture
function generateFabricTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = albedo.height = size;
  height.width = height.height = size;
  rough.width = rough.height = size;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  const base = new THREE.Color(baseColor);
  const baseR = Math.round(base.r * 255);
  const baseG = Math.round(base.g * 255);
  const baseB = Math.round(base.b * 255);

  const imageData = actx.createImageData(size, size);
  const hData = hctx.createImageData(size, size);
  const rData = rctx.createImageData(size, size);
  const ad = imageData.data;
  const hd = hData.data;
  const rd = rData.data;

  // Weave parameters
  const threadSize = 6; // pixels per thread
  const variation = 6;  // subtle brightness variation

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const warp = Math.floor(x / threadSize) % 2 === 0; // vertical thread
      const weft = Math.floor(y / threadSize) % 2 === 0; // horizontal thread
      const weave = (warp ? 1 : 0) ^ (weft ? 1 : 0); // over/under pattern

      // Thread profile: rounded cross-section
      const rx = x % threadSize;
      const ry = y % threadSize;
      const dx = Math.min(rx, threadSize - rx) / (threadSize * 0.5);
      const dy = Math.min(ry, threadSize - ry) / (threadSize * 0.5);
      const radial = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));

      const noise = (Math.sin((x + y * 7) * 0.07) * 0.5 + 0.5) * 0.06;
      const weaveBoost = weave ? 0.08 : -0.04;
      const brightness = 0.86 + radial * 0.10 + weaveBoost + noise;

      ad[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      ad[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness)));
      ad[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * brightness)));
      ad[i + 3] = 255;

      // Bump: higher on thread centers
      const hVal = Math.round(140 + radial * 90 + (weave ? 10 : 0));
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      // Roughness: slightly rougher between threads
      const rVal = Math.round(180 + (1 - radial) * 60 + (weave ? -10 : 10));
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  actx.putImageData(imageData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.needsUpdate = true;
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);
  bumpMap.needsUpdate = true;
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}

// Enhanced Wall Component with PBR materials and door
interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  hasDoor?: boolean;
}

const Wall: React.FC<WallProps> = ({ position, rotation = [0, 0, 0], width, height, hasDoor = false }) => {
  const wallColor = '#e9e7e3'; // warm neutral
  const textures = useMemo(() => generateWallTextures(wallColor), [wallColor]);

  // Scale textures to world units for consistent texel density
  useMemo(() => {
    const repeatX = Math.max(1, Math.round(width / 4));
    const repeatY = Math.max(1, Math.round(height / 4));
    [textures.map, textures.bumpMap, textures.roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeatX, repeatY);
      t.needsUpdate = true;
    });
  }, [textures, width, height]);

  const baseboardHeight = 0.5;
  const baseboardDepth = 0.08;
  const crownHeight = 0.35;
  const crownDepth = 0.07;
  const trimColor = '#d8d6cf';

  return (
    <group position={position} rotation={rotation}>
      {/* Main wall with procedural plaster and PBR-like properties */}
      <mesh receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color={'#ffffff'}
          map={textures.map}
          roughnessMap={textures.roughnessMap}
          bumpMap={textures.bumpMap}
          bumpScale={0.02}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Crown molding */}
      <mesh position={[0, height/2 - crownHeight/2, 0.035]} castShadow receiveShadow>
        <boxGeometry args={[width, crownHeight, crownDepth]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
      </mesh>

      {/* Baseboard with thickness */}
      <mesh position={[0, -height/2 + baseboardHeight/2, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[width, baseboardHeight, baseboardDepth]} />
        <meshStandardMaterial color={trimColor} roughness={0.65} metalness={0} />
      </mesh>

      {/* Corner trims */}
      <mesh position={[width/2 - 0.05, 0, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height, 0.05]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[-width/2 + 0.05, 0, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height, 0.05]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
      </mesh>

      {/* Office door (if specified) */}
      {hasDoor && (
        <group position={[width/4, 0, 0.05]}>
          {/* Door frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.2, 7, 0.3]} />
            <meshStandardMaterial color="#5a3d28" roughness={0.55} metalness={0} />
          </mesh>
          
          {/* Door panel */}
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[2, 6.5, 0.1]} />
            <meshStandardMaterial color="#7a4a28" roughness={0.5} metalness={0} />
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

// Ceiling Component with subtle plaster and recessed downlights
const Ceiling: React.FC = () => {
  const ceilingTextures = useMemo(() => generateCeilingTextures('#f7f7f5'), []);
  const downlightPositions: Array<[number, number, number]> = useMemo(() => (
    [
      [-6, 7.96, -4], [6, 7.96, -4],
      [-6, 7.96, 4],  [6, 7.96, 4],
    ]
  ), []);

  return (
    <group>
      {/* Main ceiling with subtle plaster texture */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
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

      {/* Existing chandelier kept minimal */}
      <group position={[0, 7.5, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.8]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} />
        </mesh>
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
                  emissiveIntensity={0.18}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};

// Enhanced Desk Component with PBR materials, rounded edges, and minimal tabletop items
const Desk: React.FC = () => {
  // Procedural wood textures for desktop and legs (separate instances for different repeats)
  const woodTop = useMemo(() => {
    const t = generateWoodTextures('#8B5A2B');
    [t.map, t.bumpMap, t.roughnessMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      // A few planks across the width
      tex.repeat.set(3, 1);
    });
    return t;
  }, []);

  const woodLeg = useMemo(() => {
    const t = generateWoodTextures('#6D4C41');
    [t.map, t.bumpMap, t.roughnessMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      // Stretch grain along leg height
      tex.repeat.set(1, 3);
    });
    return t;
  }, []);

  return (
    <group position={[4, 0, 2]}>
      {/* Rounded desktop with procedural wood and light clearcoat */}
      <RoundedBox position={[0, 1.5, 0]} args={[5, 0.12, 2.5]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#8B5A2B"
          map={woodTop.map}
          roughnessMap={woodTop.roughnessMap}
          bumpMap={woodTop.bumpMap}
          bumpScale={0.03}
          roughness={0.55}
          metalness={0}
          clearcoat={0.05}
          clearcoatRoughness={0.6}
        />
      </RoundedBox>

      {/* Structural rails under desktop */}
      {[1.02, -1.02].map((z, i) => (
        <mesh key={`rail-${i}`} position={[0, 1.44, z]} castShadow receiveShadow>
          <boxGeometry args={[4.7, 0.08, 0.1]} />
          <meshStandardMaterial color="#6D4C41" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
      ))}
      {[2.25, -2.25].map((x, i) => (
        <mesh key={`side-rail-${i}`} position={[x, 0.9, 0]} castShadow>
          <boxGeometry args={[0.1, 1.2, 2.2]} />
          <meshStandardMaterial color="#6D4C41" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
      ))}

      {/* Sturdy wooden legs */}
      {[[-2.2, -1], [2.2, -1], [-2.2, 1], [2.2, 1]].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, 0.75, z]} castShadow>
          <boxGeometry args={[0.18, 1.5, 0.18]} />
          <meshStandardMaterial color="#6D4C41" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
      ))}

      {/* Minimal drawer on right side */}
      <group position={[2.15, 1.3, 0.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.35, 0.5]} />
          <meshStandardMaterial color="#6D4C41" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
        {/* Drawer face (slightly proud) */}
        <mesh position={[0, 0, 0.26]} castShadow>
          <boxGeometry args={[0.9, 0.35, 0.02]} />
          <meshStandardMaterial color="#7A5A3A" roughness={0.55} metalness={0} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0, 0.31]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Computer monitor centered with improved stand */}
      <mesh position={[0, 2.1, -0.35]} castShadow>
        <boxGeometry args={[1.8, 1.2, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.1, -0.29]} castShadow>
        <boxGeometry args={[1.68, 1.04, 0.01]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.1} emissive="#001122" emissiveIntensity={0.35} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, 1.86, 0.0]} castShadow>
        <boxGeometry args={[0.08, 0.45, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Stand foot */}
      <RoundedBox position={[0, 1.58, 0.18]} args={[0.7, 0.05, 0.28]} radius={0.04} smoothness={3} castShadow>
        <meshStandardMaterial color="#303030" roughness={0.25} metalness={0.9} />
      </RoundedBox>
      {/* Open book (left) */}
      <group position={[-1.55, 1.535, 0.35]} rotation={[0, Math.PI / 14, 0]}>
        {/* Left cover */}
        <RoundedBox position={[-0.46, 0, 0]} args={[0.45, 0.06, 0.7]} radius={0.03} smoothness={2} castShadow receiveShadow>
          <meshPhysicalMaterial color="#6b2f1a" roughness={0.85} metalness={0.1} sheen={1} sheenRoughness={0.6} sheenColor={'#552a1a'} />
        </RoundedBox>
        {/* Right cover */}
        <RoundedBox position={[0.46, 0, 0]} args={[0.45, 0.06, 0.7]} radius={0.03} smoothness={2} castShadow receiveShadow>
          <meshPhysicalMaterial color="#6b2f1a" roughness={0.85} metalness={0.1} sheen={1} sheenRoughness={0.6} sheenColor={'#552a1a'} />
        </RoundedBox>

        {/* Left pages stack */}
        <RoundedBox position={[-0.46, 0.008, 0]} rotation={[0, 0.06, 0]} args={[0.43, 0.048, 0.66]} radius={0.01} smoothness={1} castShadow>
          <meshStandardMaterial color="#f7f5ef" roughness={0.95} metalness={0} />
        </RoundedBox>
        {/* Right pages stack */}
        <RoundedBox position={[0.46, 0.008, 0]} rotation={[0, -0.06, 0]} args={[0.43, 0.048, 0.66]} radius={0.01} smoothness={1} castShadow>
          <meshStandardMaterial color="#f7f5ef" roughness={0.95} metalness={0} />
        </RoundedBox>

        {/* Center gutter */}
        <mesh position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.7, 24]} />
          <meshStandardMaterial color="#5a3a22" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Bookmark ribbon between pages */}
        <mesh position={[0.12, -0.05, 0.22]} castShadow>
          <boxGeometry args={[0.04, 0.01, 0.32]} />
          <meshStandardMaterial color="#b71c1c" roughness={0.6} metalness={0.1} />
        </mesh>
      </group>

      {/* Refined pen stand with pens (right) */}
      <group position={[1.6, 1.61, -0.55]}>
        {/* Cup */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.22, 24]} />
          <meshPhysicalMaterial color="#ececec" roughness={0.22} metalness={0.05} clearcoat={0.2} clearcoatRoughness={0.7} />
        </mesh>
        {/* Rim ring */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.01, 12, 48]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Pens */}
        {[
          { x: -0.045, z: 0.0, color: '#1565C0', rot: 0.06 },
          { x: 0.0, z: 0.04, color: '#2E7D32', rot: -0.03 },
          { x: 0.05, z: -0.02, color: '#EF5350', rot: 0.02 },
        ].map((p, i) => (
          <group key={i} position={[p.x, 0.16, p.z]} rotation={[p.rot, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.18, 12]} />
              <meshStandardMaterial color={p.color} roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Tip */}
            <mesh position={[0, 0.095, 0]}>
              <coneGeometry args={[0.008, 0.015, 12]} />
              <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Clip */}
            <mesh position={[0.008, 0.02, 0]}>
              <boxGeometry args={[0.002, 0.04, 0.01]} />
              <meshStandardMaterial color="#9e9e9e" roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// Enhanced Chair Component with fabric materials and star base
const Chair: React.FC = () => {
  const fabric = useMemo(() => generateFabricTextures('#1a2456'), []);

  return (
    <group position={[4, 0, 3.4]} rotation={[0, Math.PI, 0]}>
      {/* Gas lift */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 24]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Base hub */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.12, 24]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Star base with 5 legs and casters */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            {/* Leg */}
            <mesh position={[0.55, 0.40, 0]} castShadow>
              <boxGeometry args={[1.1, 0.06, 0.14]} />
              <meshStandardMaterial color="#303030" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Caster bracket */}
            <mesh position={[1.06, 0.34, 0]} castShadow>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Wheel */}
            <mesh position={[1.06, 0.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 20]} />
              <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Seat support plate */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Seat cushion */}
      <RoundedBox position={[0, 1.08, 0]} args={[1.6, 0.16, 1.6]} radius={0.1} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1b275f"
          map={fabric.map}
          roughnessMap={fabric.roughnessMap}
          bumpMap={fabric.bumpMap}
          bumpScale={0.03}
          roughness={0.9}
          metalness={0}
          clearcoat={0.02}
          clearcoatRoughness={0.9}
        />
      </RoundedBox>

      {/* Backrest */}
      <RoundedBox position={[0, 1.9, -0.62]} args={[1.5, 1.7, 0.18]} radius={0.1} smoothness={4} castShadow>
        <meshPhysicalMaterial
          color="#1b275f"
          map={fabric.map}
          roughnessMap={fabric.roughnessMap}
          bumpMap={fabric.bumpMap}
          bumpScale={0.03}
          roughness={0.92}
          metalness={0}
          clearcoat={0.02}
          clearcoatRoughness={0.95}
        />
      </RoundedBox>

      {/* Armrests */}
      <RoundedBox position={[-0.66, 1.5, 0]} args={[0.14, 0.16, 1.25]} radius={0.06} smoothness={3} castShadow>
        <meshStandardMaterial color="#0e1228" roughness={0.8} metalness={0.05} />
      </RoundedBox>
      <RoundedBox position={[0.66, 1.5, 0]} args={[0.14, 0.16, 1.25]} radius={0.06} smoothness={3} castShadow>
        <meshStandardMaterial color="#0e1228" roughness={0.8} metalness={0.05} />
      </RoundedBox>
    </group>
  );
};

// Enhanced Bookshelf with law files and decorative items
const Bookshelf: React.FC = () => {
  const bookColors = [
    '#8B0000', '#2F4F4F', '#800080', '#B22222', '#006400', 
    '#4B0082', '#8B4513', '#2E8B57', '#DC143C', '#4682B4',
    '#D2691E', '#556B2F', '#8B008B', '#B8860B', '#CD853F'
  ];
  const lawFileColors = ['#8B0000', '#654321', '#1a1a1a', '#2F2F2F', '#4A4A4A'];
  
  // Book titles for realistic appearance
  const bookTitles = [
    'Civil Code', 'Criminal Law', 'Constitutional Law', 'Contract Law', 'Tort Law',
    'Property Law', 'Family Law', 'Corporate Law', 'Tax Law', 'Labor Law',
    'Environmental Law', 'Intellectual Property', 'International Law', 'Evidence', 'Procedure',
    'Legal Ethics', 'Jurisprudence', 'Legal History', 'Comparative Law', 'Administrative Law'
  ];
  
  return (
    <group position={[-9.5, 0, -2.5]}>
      {/* Bookshelf frame with enhanced wood material */}
      <mesh position={[-1.8, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 7, 1.5]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8} 
          metalness={0.1}
          normalScale={[0.5, 0.5]}
        />
      </mesh>
      <mesh position={[1.8, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 7, 1.5]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8} 
          metalness={0.1}
          normalScale={[0.5, 0.5]}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.3, 1.5]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8} 
          metalness={0.1}
          normalScale={[0.5, 0.5]}
        />
      </mesh>
      
      {/* Back panel for bookshelf */}
      <mesh position={[0, 3.5, -0.75]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 7, 0.05]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.9} 
          metalness={0}
        />
      </mesh>
      
      {/* Enhanced shelves with better wood grain */}
      {[1.4, 2.8, 4.2, 5.6, 7].map((y, index) => (
        <mesh key={index} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 0.15, 1.5]} />
          <meshStandardMaterial 
            color="#8B4513" 
            roughness={0.8} 
            metalness={0.1}
            normalScale={[0.3, 0.3]}
          />
        </mesh>
      ))}
      
      {/* Enhanced books with realistic placement and titles */}
      {[0.9, 2.2, 3.6, 5, 6.4].map((shelfY, shelfIndex) => (
        <group key={shelfIndex}>
          {Array.from({ length: 12 }, (_, bookIndex) => {
            const bookWidth = 0.11 + (bookIndex % 4) * 0.02;
            const bookHeight = 0.45 + (bookIndex % 3) * 0.08;
            const bookDepth = 0.75 + (bookIndex % 2) * 0.15;
            const xPosition = -1.4 + (bookIndex * 0.23);
            const colorIndex = (shelfIndex * 12 + bookIndex) % bookColors.length;
            const lean = Math.sin(bookIndex * 0.5) * 0.05; 
            
            return (
              <group key={bookIndex}>
                {/* Main book body */}
                <mesh 
                  position={[xPosition, shelfY + bookHeight / 2, 0.15]} 
                  rotation={[0, lean, 0]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
                  <meshStandardMaterial 
                    color={bookColors[colorIndex]} 
                    roughness={0.9}
                    metalness={0}
                    normalScale={[0.2, 0.2]}
                  />
                </mesh>
                
                {/* Book spine with title */}
                <mesh 
                  position={[xPosition - bookWidth/2 - 0.01, shelfY + bookHeight / 2, 0.15]} 
                  rotation={[0, lean, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.02, bookHeight * 0.8, bookDepth * 0.9]} />
                  <meshStandardMaterial 
                    color={bookColors[colorIndex]} 
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>
                
                {/* Book title text (simplified as colored strip) */}
                <mesh 
                  position={[xPosition - bookWidth/2 - 0.005, shelfY + bookHeight / 2, 0.15]} 
                  rotation={[0, lean, 0]}
                >
                  <boxGeometry args={[0.01, bookHeight * 0.3, bookDepth * 0.7]} />
                  <meshStandardMaterial 
                    color="#FFFFFF" 
                    roughness={0.3}
                    metalness={0.2}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
      
      {/* Enhanced law files and binders */}
      <group position={[0, 3.6, 0]}>
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i}>
            <mesh
              position={[0.8 + i * 0.28, 0.4, 0.3]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.25, 0.8, 1]} />
              <meshStandardMaterial 
                color={lawFileColors[i % lawFileColors.length]} 
                roughness={0.8}
                metalness={0.1}
                normalScale={[0.3, 0.3]}
              />
            </mesh>
            
            {/* Binder rings */}
            <mesh
              position={[0.8 + i * 0.28, 0.2, 0.31]}
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.4]} />
              <meshStandardMaterial 
                color="#C0C0C0" 
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <mesh
              position={[0.8 + i * 0.28, 0.6, 0.31]}
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.4]} />
              <meshStandardMaterial 
                color="#C0C0C0" 
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          </group>
        ))}
        
        {/* Enhanced gold law file labels */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={`label-${i}`}
            position={[0.8 + i * 0.28, 0.2, 0.32]}
            castShadow
          >
            <boxGeometry args={[0.02, 0.6, 0.8]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        ))}
      </group>
      
      {/* Enhanced decorative globe with better materials */}
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <group position={[0.5, 7.3, 0.5]}>
          {/* Globe sphere with enhanced material */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial 
              color="#4169E1" 
              roughness={0.1}
              metalness={0.3}
              normalScale={[0.5, 0.5]}
            />
          </mesh>
          {/* Globe stand with wood material */}
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.1]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>
      </Float>
      
      {/* Enhanced legal statue decoration */}
      <mesh position={[-0.8, 7.3, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial 
          color="#DAA520" 
          roughness={0.1}
          metalness={0.9}
          normalScale={[0.3, 0.3]}
        />
      </mesh>
      
      {/* Additional decorative elements */}
      <mesh position={[1.2, 7.3, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.3, 0.15]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.7}
          metalness={0.2}
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
      
      {/* Warm accent lighting (balanced) */}
      <pointLight position={[4, 6, 2]} intensity={0.5} color="#FFD700" distance={15} decay={2} />
      <pointLight position={[-8, 5, -2]} intensity={0.35} color="#ffffff" distance={12} decay={2} />
      
      {/* Chandelier lighting */}
      <pointLight position={[0, 7, 0]} intensity={0.6} color="#FFF8DC" distance={20} decay={1.5} />
      
      {/* Bookshelf accent lighting */}
      <spotLight
        position={[-9.5, 6, -1]}
        target-position={[-9.5, 3.5, -2.5]}
        angle={Math.PI / 6}
        penumbra={0.8}
        intensity={0.4}
        color="#FFF8DC"
        distance={12}
        decay={2}
        castShadow
      />
      
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

// Spawn the camera at the door facing into the room
const SpawnAtDoor: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    const spawnPosition = new THREE.Vector3(6, 1.7, 7.4);
    camera.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
    camera.lookAt(0, 1.7, 0);
  }, [camera]);
  return null;
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

  // Handle keyboard shortcuts (excluding movement keys which are handled by KeyboardMovement)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip movement keys as they're handled by KeyboardMovement component
      const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'];
      if (movementKeys.includes(event.code)) {
        return;
      }
      
      switch (event.key) {
        case 'Escape':
          // If pointer is locked, just unlock (browser handles it) and do nothing else
          if (document.pointerLockElement) {
            return;
          }
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
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Canvas
        shadows
        camera={{
          position: [6, 1.7, 7.4], // Spawn at door
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
          // Ensure consistent color management and non-black clear color
          // Use outputColorSpace when available (Three r152+), otherwise fallback
          if ('outputColorSpace' in (gl as any)) {
            (gl as any).outputColorSpace = THREE.SRGBColorSpace;
          }
          gl.setClearColor(new THREE.Color('#0b1220'), 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        {/* Scene background to avoid default black if nothing renders */}
        <color attach="background" args={["#0b1220"]} />
        {/* Postprocessing removed for performance */}
        <LawyerOfficeScene />
        <SpawnAtDoor />
        <KeyboardMovement />
        
        {/* FPS mouse look controls */}
        <PointerLockControls makeDefault />
      </Canvas>
      
      {/* Enhanced UI overlay for first-person exploration */}
      <div className="absolute top-4 left-4 text-white bg-black/40 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
        <div className="text-lg font-bold mb-1">🚶 Law Office Walkthrough</div>
        <div className="text-xs opacity-70 mt-1 space-y-1">
          <div>🖱️ <strong>Click:</strong> Lock mouse, move to look around</div>
          <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
          <div>⎋ <strong>Escape:</strong> Unlock mouse</div>
        </div>
        <div className="text-xs opacity-60 mt-2 space-y-1">
          <div>📍 <strong>Starting Position:</strong> At the door</div>
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
        
       
            </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 text-white bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
        <div className="text-xs opacity-80 space-y-1">
          <div>ESC to exit • F11 for fullscreen</div>
          <div>↑↓←→ Arrow keys or WASD to walk</div>
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
          <div className="absolute" style={{ bottom: '8%', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-1 h-1 bg-purple-400 rounded-full" title="Door (Start)"></div>
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