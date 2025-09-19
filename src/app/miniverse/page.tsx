"use client";

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, OrbitControls, Text, useTexture, PerformanceMonitor, Float, Points, PointMaterial, RoundedBox } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

// Enhanced Controls Component with PointerLock fallback
const EnhancedControls: React.FC<{ onControlsTypeChange?: (type: 'pointer-lock' | 'orbit') => void }> = ({ onControlsTypeChange }) => {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [pointerLockSupported, setPointerLockSupported] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Check if PointerLock API is supported
    const isSupported = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    
    if (!isSupported) {
      console.warn('Pointer Lock API not supported, falling back to OrbitControls');
      setPointerLockSupported(false);
      onControlsTypeChange?.('orbit');
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      console.warn('Pointer Lock API requires secure context (HTTPS), falling back to OrbitControls');
      setPointerLockSupported(false);
      onControlsTypeChange?.('orbit');
      return;
    }

    // Wait for user interaction before enabling pointer lock
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      setControlsEnabled(true);
      onControlsTypeChange?.('pointer-lock');
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (!pointerLockSupported && !userInteracted) {
      onControlsTypeChange?.('orbit');
    }
  }, [pointerLockSupported, userInteracted, onControlsTypeChange]);

  if (!pointerLockSupported || !userInteracted) {
    return (
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI}
        minDistance={1}
        maxDistance={20}
        target={[0, 2, 0]}
      />
    );
  }

  return (
    <PointerLockControls 
      makeDefault={controlsEnabled}
      onLock={() => console.log('Pointer locked')}
      onUnlock={() => console.log('Pointer unlocked')}
    />
  );
};

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.002, 3.5]}>
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

// Enhanced Wall Component with PBR materials, door, and optional window opening
type WindowOpening = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  hasDoor?: boolean;
  windowOpening?: WindowOpening;
}

const Wall: React.FC<WallProps> = ({ position, rotation = [0, 0, 0], width, height, hasDoor = false, windowOpening }) => {
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

  // Window trim sizing
  const casingWidth = 0.12;
  const casingDepth = 0.05;
  const jambDepth = 0.12;

  return (
    <group position={position} rotation={rotation}>
      {/* Main wall with optional window opening (constructed from 4 strips) */}
      {!windowOpening && (
        <mesh>
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
      )}

      {windowOpening && (
        <group>
          {(() => {
            const { x: wx, y: wy, width: ww, height: wh } = windowOpening;
            const topHeight = Math.max(0, height / 2 - (wy + wh / 2));
            const bottomHeight = Math.max(0, height / 2 - (wh / 2 - wy));
            const leftWidth = Math.max(0, width / 2 + (wx - ww / 2));
            const rightWidth = Math.max(0, width / 2 - (wx + ww / 2));

            const makeWallStripMaterial = (
              <meshStandardMaterial 
                color={'#ffffff'}
                map={textures.map}
                roughnessMap={textures.roughnessMap}
                bumpMap={textures.bumpMap}
                bumpScale={0.02}
                roughness={0.85}
                metalness={0}
              />
            );

            return (
              <group>
                {/* Top strip */}
                {topHeight > 0 && (
                  <mesh position={[0, (height / 2 + wy + wh / 2) / 2, 0]}>
                    <planeGeometry args={[width, topHeight]} />
                    {makeWallStripMaterial}
                  </mesh>
                )}
                {/* Bottom strip */}
                {bottomHeight > 0 && (
                  <mesh position={[0, (-height / 2 + wy - wh / 2) / 2 + (-height / 2 + bottomHeight / 2) - (-height / 2), 0]}>
                    {/* Simplify: center = -height/2 + bottomHeight/2 */}
                    <planeGeometry args={[width, bottomHeight]} />
                    {makeWallStripMaterial}
                  </mesh>
                )}
                {/* Left strip */}
                {leftWidth > 0 && (
                  <mesh position={[-width / 2 + leftWidth / 2, wy, 0]}>
                    <planeGeometry args={[leftWidth, wh]} />
                    {makeWallStripMaterial}
                  </mesh>
                )}
                {/* Right strip */}
                {rightWidth > 0 && (
                  <mesh position={[width / 2 - rightWidth / 2, wy, 0]}>
                    <planeGeometry args={[rightWidth, wh]} />
                    {makeWallStripMaterial}
                  </mesh>
                )}

                {/* Interior jambs around the opening (depth into wall) */}
                <mesh position={[wx - ww / 2 + casingWidth / 2, wy, -jambDepth / 2]}>
                  <boxGeometry args={[casingWidth, wh, jambDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                <mesh position={[wx + ww / 2 - casingWidth / 2, wy, -jambDepth / 2]}>
                  <boxGeometry args={[casingWidth, wh, jambDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                <mesh position={[wx, wy + wh / 2 - casingWidth / 2, -jambDepth / 2]}>
                  <boxGeometry args={[ww, casingWidth, jambDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                {/* Sill (slightly deeper) */}
                <mesh position={[wx, wy - wh / 2 + casingWidth / 2, -jambDepth / 2]}>
                  <boxGeometry args={[ww, casingWidth, jambDepth + 0.06]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                {/* Sill board protruding slightly into the room */}
                <mesh position={[wx, wy - wh / 2 - 0.04, casingDepth / 2]}>
                  <boxGeometry args={[ww + 0.25, 0.08, casingDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                {/* Outer casing around opening */}
                <mesh position={[wx - ww / 2 - casingWidth / 2, wy, casingDepth / 2]}>
                  <boxGeometry args={[casingWidth, wh + casingWidth * 2, casingDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                <mesh position={[wx + ww / 2 + casingWidth / 2, wy, casingDepth / 2]}>
                  <boxGeometry args={[casingWidth, wh + casingWidth * 2, casingDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                <mesh position={[wx, wy + wh / 2 + casingWidth / 2, casingDepth / 2]}>
                  <boxGeometry args={[ww + casingWidth * 2, casingWidth, casingDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
                <mesh position={[wx, wy - wh / 2 - casingWidth / 2, casingDepth / 2]}>
                  <boxGeometry args={[ww + casingWidth * 2, casingWidth, casingDepth]} />
                  <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
                </mesh>
              </group>
            );
          })()}
        </group>
      )}

      {/* Crown molding */}
      <mesh position={[0, height/2 - crownHeight/2, 0.035]}>
        <boxGeometry args={[width, crownHeight, crownDepth]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
      </mesh>

      {/* Baseboard with thickness */}
      <mesh position={[0, -height/2 + baseboardHeight/2, 0.04]}>
        <boxGeometry args={[width, baseboardHeight, baseboardDepth]} />
        <meshStandardMaterial color={trimColor} roughness={0.65} metalness={0} />
      </mesh>

      {/* Corner trims */}
      <mesh position={[width/2 - 0.05, 0, 0.03]}>
        <boxGeometry args={[0.1, height, 0.05]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[-width/2 + 0.05, 0, 0.03]}>
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
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
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
        <mesh position={[0, 0, 0]}>
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

// Proximity Detection Component for Interactive Elements
const ProximityDetector: React.FC<{ 
  position: [number, number, number]; 
  triggerDistance: number; 
  onTrigger: () => void;
  onProximityChange?: (isNear: boolean) => void;
  cooldownMs?: number;
}> = ({ position, triggerDistance, onTrigger, onProximityChange, cooldownMs = 3000 }) => {
  const { camera } = useThree();
  const [lastTriggered, setLastTriggered] = useState(0);
  const [isInRange, setIsInRange] = useState(false);
  
  useFrame(() => {
    const now = Date.now();
    if (now - lastTriggered < cooldownMs) return;
    
    const cameraPos = camera.position;
    const distance = Math.sqrt(
      Math.pow(cameraPos.x - position[0], 2) + 
      Math.pow(cameraPos.z - position[2], 2) // Only check X and Z (horizontal distance)
    );
    
    const inRange = distance <= triggerDistance;
    
    if (inRange && !isInRange) {
      setIsInRange(true);
      onProximityChange?.(true);
      onTrigger();
      setLastTriggered(now);
    } else if (!inRange && isInRange) {
      setIsInRange(false);
      onProximityChange?.(false);
    }
  });
  
  return null;
};

// Enhanced Desk Component with PBR materials, rounded edges, and minimal tabletop items
const Desk: React.FC<{ 
  onPaperClick: () => void; 
  onPaperProximity: () => void;
  onProximityChange?: (isNear: boolean) => void;
}> = ({ onPaperClick, onPaperProximity, onProximityChange }) => {
  // Procedural wood textures for desktop and legs (separate instances for different repeats)
  const woodTop = useMemo(() => {
    const t = generateWoodTextures('#EAE0D5');
    [t.map, t.bumpMap, t.roughnessMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      // A few planks across the width
      tex.repeat.set(3, 1);
    });
    return t;
  }, []);

  const woodLeg = useMemo(() => {
    const t = generateWoodTextures('#D8CFC3');
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
      <RoundedBox position={[0, 1.5, 0]} args={[5, 0.12, 2.5]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#EAE0D5"
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
        <mesh key={`rail-${i}`} position={[0, 1.44, z]}>
          <boxGeometry args={[4.7, 0.08, 0.1]} />
          <meshStandardMaterial color="#D8CFC3" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
      ))}
      {[2.25, -2.25].map((x, i) => (
        <mesh key={`side-rail-${i}`} position={[x, 0.9, 0]}>
          <boxGeometry args={[0.1, 1.2, 2.2]} />
          <meshStandardMaterial color="#D8CFC3" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
      ))}

      {/* Sturdy wooden legs */}
      {[[-2.2, -1], [2.2, -1], [-2.2, 1], [2.2, 1]].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, 0.75, z]}>
          <boxGeometry args={[0.18, 1.5, 0.18]} />
          <meshStandardMaterial color="#D8CFC3" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
      ))}

      {/* Minimal drawer on right side */}
      <group position={[2.15, 1.3, 0.4]}>
        <mesh>
          <boxGeometry args={[0.9, 0.35, 0.5]} />
          <meshStandardMaterial color="#D8CFC3" map={woodLeg.map} roughnessMap={woodLeg.roughnessMap} bumpMap={woodLeg.bumpMap} bumpScale={0.02} roughness={0.6} metalness={0} />
        </mesh>
        {/* Drawer face (slightly proud) */}
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[0.9, 0.35, 0.02]} />
          <meshStandardMaterial color="#F0EBE3" roughness={0.55} metalness={0} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0, 0.31]}>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Computer monitor centered with improved stand */}
      <mesh position={[0, 2.1, -0.35]}>
        <boxGeometry args={[1.8, 1.2, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.1, -0.29]}>
        <boxGeometry args={[1.68, 1.04, 0.01]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.1} emissive="#001122" emissiveIntensity={0.35} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, 1.86, 0.0]}>
        <boxGeometry args={[0.08, 0.45, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Stand foot */}
      <RoundedBox position={[0, 1.58, 0.18]} args={[0.7, 0.05, 0.28]} radius={0.04} smoothness={3}>
        <meshStandardMaterial color="#303030" roughness={0.25} metalness={0.9} />
      </RoundedBox>
      {/* Open book (left) */}
      <group position={[-1.55, 1.535, 0.35]} rotation={[0, Math.PI / 14, 0]}>
        {/* Left cover */}
        <RoundedBox position={[-0.46, 0, 0]} args={[0.45, 0.06, 0.7]} radius={0.03} smoothness={2}>
          <meshPhysicalMaterial color="#6b2f1a" roughness={0.85} metalness={0.1} sheen={1} sheenRoughness={0.6} sheenColor={'#552a1a'} />
        </RoundedBox>
        {/* Right cover */}
        <RoundedBox position={[0.46, 0, 0]} args={[0.45, 0.06, 0.7]} radius={0.03} smoothness={2}>
          <meshPhysicalMaterial color="#6b2f1a" roughness={0.85} metalness={0.1} sheen={1} sheenRoughness={0.6} sheenColor={'#552a1a'} />
        </RoundedBox>

        {/* Left pages stack */}
        <RoundedBox position={[-0.46, 0.008, 0]} rotation={[0, 0.06, 0]} args={[0.43, 0.048, 0.66]} radius={0.01} smoothness={1}>
          <meshStandardMaterial color="#f7f5ef" roughness={0.95} metalness={0} />
        </RoundedBox>
        {/* Right pages stack */}
        <RoundedBox position={[0.46, 0.008, 0]} rotation={[0, -0.06, 0]} args={[0.43, 0.048, 0.66]} radius={0.01} smoothness={1}>
          <meshStandardMaterial color="#f7f5ef" roughness={0.95} metalness={0} />
        </RoundedBox>

        {/* Center gutter */}
        <mesh position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.7, 24]} />
          <meshStandardMaterial color="#5a3a22" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Bookmark ribbon between pages */}
        <mesh position={[0.12, -0.05, 0.22]}>
          <boxGeometry args={[0.04, 0.01, 0.32]} />
          <meshStandardMaterial color="#b71c1c" roughness={0.6} metalness={0.1} />
        </mesh>
      </group>

      {/* Second open book (center-right) */}
      <group position={[-0.5, 1.58, 0.2]} rotation={[0, Math.PI / 6, 0]}>
        {/* Left cover */}
        <RoundedBox position={[-0.42, 0, 0]} args={[0.4, 0.05, 0.6]} radius={0.025} smoothness={2}>
          <meshPhysicalMaterial color="#1e3a8a" roughness={0.8} metalness={0.15} sheen={0.8} sheenRoughness={0.7} sheenColor={'#1e40af'} />
        </RoundedBox>
        {/* Right cover */}
        <RoundedBox position={[0.42, 0, 0]} args={[0.4, 0.05, 0.6]} radius={0.025} smoothness={2}>
          <meshPhysicalMaterial color="#1e3a8a" roughness={0.8} metalness={0.15} sheen={0.8} sheenRoughness={0.7} sheenColor={'#1e40af'} />
        </RoundedBox>

        {/* Left pages stack */}
        <RoundedBox position={[-0.42, 0.007, 0]} rotation={[0, 0.08, 0]} args={[0.38, 0.042, 0.56]} radius={0.008} smoothness={1}>
          <meshStandardMaterial color="#faf9f6" roughness={0.9} metalness={0} />
        </RoundedBox>
        {/* Right pages stack */}
        <RoundedBox position={[0.42, 0.007, 0]} rotation={[0, -0.08, 0]} args={[0.38, 0.042, 0.56]} radius={0.008} smoothness={1}>
          <meshStandardMaterial color="#faf9f6" roughness={0.9} metalness={0} />
        </RoundedBox>

        {/* Center gutter */}
        <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.6, 20]} />
          <meshStandardMaterial color="#1e40af" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Gold bookmark ribbon */}
        <mesh position={[-0.15, -0.04, 0.18]}>
          <boxGeometry args={[0.03, 0.008, 0.28]} />
          <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Reading glasses on the book */}
        <group position={[0.1, 0.04, 0.1]} rotation={[0, 0, 0.1]}>
          {/* Left lens frame */}
          <mesh position={[-0.08, 0, 0]}>
            <torusGeometry args={[0.06, 0.003, 8, 16]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Right lens frame */}
          <mesh position={[0.08, 0, 0]}>
            <torusGeometry args={[0.06, 0.003, 8, 16]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.04, 8]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Left temple */}
          <mesh position={[-0.06, 0, -0.04]} rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.12, 8]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Right temple */}
          <mesh position={[0.06, 0, -0.04]} rotation={[0, -Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.12, 8]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Lenses */}
          <mesh position={[-0.08, 0, 0]}>
            <circleGeometry args={[0.055, 16]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.0} metalness={0.0} transmission={0.95} ior={1.5} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <circleGeometry args={[0.055, 16]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.0} metalness={0.0} transmission={0.95} ior={1.5} />
          </mesh>
        </group>
      </group>

      {/* Refined pen stand with pens (right) */}
      <group position={[1.6, 1.61, -0.55]}>
        {/* Cup */}
        <mesh>
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
            <mesh>
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

      {/* Interactive Legal Paper */}
      <group position={[0.8, 1.565, -0.6]} rotation={[0, -Math.PI / 12, 0]}>
        {/* Proximity detector for automatic trigger */}
        <ProximityDetector 
          position={[4.8, 1.565, 1.4]} // Adjusted for desk position offset
          triggerDistance={1.5}
          onTrigger={onPaperProximity}
          onProximityChange={onProximityChange}
          cooldownMs={4000}
        />
        
        {/* Animated proximity indicator glow */}
        <Float
          speed={2}
          rotationIntensity={0}
          floatIntensity={0.3}
        >
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.75, 0.008, 0.95]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
          </mesh>
        </Float>
        
        {/* Subtle pulsing border */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.8, 0.003, 1.0]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
        </mesh>
        
        <mesh onClick={onPaperClick} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}>
          <boxGeometry args={[0.6, 0.01, 0.8]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.8} metalness={0} />
        </mesh>
        {/* Legal letterhead */}
        <mesh position={[0, 0.005, 0.32]}>
          <boxGeometry args={[0.55, 0.005, 0.08]} />
          <meshStandardMaterial color="#1e40af" roughness={0.9} metalness={0} />
        </mesh>
        {/* Text lines simulation */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, 0.005, 0.2 - i * 0.08]}>
            <boxGeometry args={[0.5, 0.003, 0.005]} />
            <meshStandardMaterial color="#333333" roughness={0.9} metalness={0} />
          </mesh>
        ))}
        {/* Signature line */}
        <mesh position={[0.15, 0.005, -0.45]}>
          <boxGeometry args={[0.3, 0.003, 0.005]} />
          <meshStandardMaterial color="#666666" roughness={0.9} metalness={0} />
        </mesh>
        {/* Legal seal */}
        <mesh position={[-0.2, 0.005, -0.35]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.002, 12]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.7} metalness={0.1} />
        </mesh>
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
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 24]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Base hub */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.12, 24]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Star base with 5 legs and casters */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            {/* Leg */}
            <mesh position={[0.55, 0.40, 0]}>
              <boxGeometry args={[1.1, 0.06, 0.14]} />
              <meshStandardMaterial color="#303030" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Caster bracket */}
            <mesh position={[1.06, 0.34, 0]}>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Wheel */}
            <mesh position={[1.06, 0.26, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 20]} />
              <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Seat support plate */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Seat cushion */}
      <RoundedBox position={[0, 1.08, 0]} args={[1.6, 0.16, 1.6]} radius={0.1} smoothness={4}>
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
      <RoundedBox position={[0, 1.9, -0.62]} args={[1.5, 1.7, 0.18]} radius={0.1} smoothness={4}>
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
      <RoundedBox position={[-0.66, 1.5, 0]} args={[0.14, 0.16, 1.25]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color="#0e1228" roughness={0.8} metalness={0.05} />
      </RoundedBox>
      <RoundedBox position={[0.66, 1.5, 0]} args={[0.14, 0.16, 1.25]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color="#0e1228" roughness={0.8} metalness={0.05} />
      </RoundedBox>
    </group>
  );
};

// Wall-mounted floating shelf system with refined materials and layout
const Bookshelf: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number] }> = ({ position = [-9.0, 0, -8.5], rotation = [0, 0, 0] }) => {
  const woodColor = '#9c6b3c';
  const metalColor = '#444444';
  const shelfWidth = 3.2;
  const shelfDepth = 1.0;
  const shelfThickness = 0.12;
  const shelfYs = [1.3, 2.6, 4.0, 5.3, 6.6];
  const bracketXs = [-shelfWidth * 0.35, 0, shelfWidth * 0.35];

  const bookColors = [
    '#8B0000', '#2F4F4F', '#800080', '#B22222', '#006400',
    '#4B0082', '#8B4513', '#2E8B57', '#DC143C', '#4682B4',
    '#D2691E', '#556B2F', '#8B008B', '#B8860B', '#CD853F'
  ];
  const lawFileColors = ['#8B0000', '#654321', '#1a1a1a', '#2F2F2F', '#4A4A4A'];

  // Deterministic jitter per index for pleasant variation
  const jitter = (seed: number, scale: number) => Math.sin(seed * 12.9898) * 43758.5453 % 1 * scale - scale / 2;

	return (
		<group position={position} rotation={rotation}>
      {/* Mounting rails against the wall (thin, subtle) */}
      <mesh position={[-shelfWidth/2 + 0.12, 3.5, -shelfDepth/2 + 0.015]}>
        <boxGeometry args={[0.06, 7, 0.03]} />
        <meshStandardMaterial color={woodColor} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[shelfWidth/2 - 0.12, 3.5, -shelfDepth/2 + 0.015]}>
        <boxGeometry args={[0.06, 7, 0.03]} />
        <meshStandardMaterial color={woodColor} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Floating shelves with rounded edges */}
      {shelfYs.map((y, si) => (
        <group key={si}>
          <RoundedBox position={[0, y, 0]} args={[shelfWidth, shelfThickness, shelfDepth]} radius={0.06} smoothness={3}>
            <meshPhysicalMaterial color={woodColor} roughness={0.8} metalness={0.05} clearcoat={0.08} clearcoatRoughness={0.9} />
          </RoundedBox>

          {/* Discrete steel brackets under each shelf near the wall */}
          {bracketXs.map((bx, i) => (
            <group key={`br-${si}-${i}`} position={[bx, y - shelfThickness/2 - 0.04, -shelfDepth/2 + 0.02]}>
              {/* Vertical plate on wall */}
              <mesh>
                <boxGeometry args={[0.12, 0.14, 0.02]} />
                <meshStandardMaterial color={metalColor} roughness={0.4} metalness={0.85} />
              </mesh>
              {/* Horizontal support under shelf */}
              <mesh position={[0, 0.06, 0.12]}>
                <boxGeometry args={[0.12, 0.02, 0.24]} />
                <meshStandardMaterial color={metalColor} roughness={0.4} metalness={0.85} />
              </mesh>
              {/* Screws */}
              {[-0.035, 0.035].map((sx, j) => (
                <mesh key={j} position={[sx, 0.03, 0.001]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.018, 12]} />
                  <meshStandardMaterial color="#BBBBBB" roughness={0.3} metalness={0.9} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Books on this shelf */}
          <group>
            {Array.from({ length: si === shelfYs.length - 1 ? 8 : 11 }, (_, bi) => {
              const bookWidth = 0.10 + (bi % 5) * 0.02;
              const bookHeight = 0.46 + (bi % 4) * 0.08;
              const bookDepth = 0.72 + (bi % 2) * 0.12;
              const usableWidth = shelfWidth - 0.36;
              const step = usableWidth / (si === shelfYs.length - 1 ? 8 : 11);
              const baseX = -usableWidth / 2 + step * bi;
              const xPosition = baseX + jitter((si + 1) * 100 + bi, 0.05);
              const zPosition = -shelfDepth / 2 + bookDepth / 2 + 0.02;
              const colorIndex = (si * 13 + bi) % bookColors.length;
              const lean = Math.sin(bi * 0.55 + si * 0.3) * 0.06;

              // Occasionally lay a book flat for realism
              const layFlat = (bi + si) % 7 === 0 && si !== shelfYs.length - 1;

              return (
                <group key={`bk-${si}-${bi}`}>
                  {layFlat ? (
                    <mesh position={[xPosition, y + shelfThickness / 2 + 0.04, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
                      <boxGeometry args={[bookWidth * 1.1, bookDepth, 0.06]} />
                      <meshStandardMaterial color={bookColors[colorIndex]} roughness={0.85} metalness={0.05} />
                    </mesh>
                  ) : (
                    <>
                      {/* Main book body */}
                      <mesh position={[xPosition, y + bookHeight / 2, zPosition]} rotation={[0, lean, 0]}>
                        <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
                        <meshStandardMaterial color={bookColors[colorIndex]} roughness={0.9} metalness={0} />
                      </mesh>
                      {/* Spine */}
                      <mesh position={[xPosition - bookWidth / 2 - 0.008, y + bookHeight / 2, zPosition]} rotation={[0, lean, 0]}>
                        <boxGeometry args={[0.016, bookHeight * 0.82, bookDepth * 0.92]} />
                        <meshStandardMaterial color={bookColors[colorIndex]} roughness={0.75} metalness={0.1} />
                      </mesh>
                      {/* Title strip */}
                      <mesh position={[xPosition - bookWidth / 2 - 0.004, y + bookHeight * 0.62, zPosition]} rotation={[0, lean, 0]}>
                        <boxGeometry args={[0.008, bookHeight * 0.26, bookDepth * 0.7]} />
                        <meshStandardMaterial color="#FFFFFF" roughness={0.35} metalness={0.15} />
                      </mesh>
                    </>
                  )}
                </group>
              );
            })}
          </group>
        </group>
      ))}

      {/* Law files and binders on a middle shelf (right side) */}
      <group>
        {Array.from({ length: 5 }, (_, i) => (
          <group key={`lf-${i}`} position={[0.6 + i * 0.28, 3.6, 0]}>
            <mesh position={[0, 0.42, -shelfDepth/2 + 0.46]}>
              <boxGeometry args={[0.24, 0.84, 0.88]} />
              <meshStandardMaterial color={lawFileColors[i % lawFileColors.length]} roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Binder rings */}
            <mesh position={[0, 0.22, -shelfDepth/2 + 0.47]}>
              <cylinderGeometry args={[0.01, 0.01, 0.36]} />
              <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.62, -shelfDepth/2 + 0.47]}>
              <cylinderGeometry args={[0.01, 0.01, 0.36]} />
              <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Gold label */}
            <mesh position={[0, 0.22, -shelfDepth/2 + 0.48]}>
              <boxGeometry args={[0.018, 0.62, 0.72]} />
              <meshStandardMaterial color="#FFD700" roughness={0.12} metalness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Top-shelf decor */}
      <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.08}>
        <group position={[shelfWidth/2 - 0.6, 6.9, 0.15]}>
          <mesh>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#4169E1" roughness={0.12} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.1]} />
            <meshStandardMaterial color={woodColor} roughness={0.8} metalness={0.1} />
          </mesh>
        </group>
      </Float>

      <mesh position={[-shelfWidth/2 + 0.55, 6.8, 0.1]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color="#DAA520" roughness={0.1} metalness={0.9} />
      </mesh>

      <mesh position={[0, 6.78, 0]}>
        <boxGeometry args={[0.22, 0.16, 0.18]} />
        <meshStandardMaterial color={woodColor} roughness={0.75} metalness={0.05} />
      </mesh>
    </group>
  );
};

// Enhanced Filing Cabinet with metal finish
const FilingCabinet: React.FC = () => {
  return (
    <group position={[8, 0, -3]}>
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


// Enhanced Window with realistic sea view - Optimized and realistic
const Window: React.FC = () => {
  const waveMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const cloudsMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const oceanMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Shared materials for efficiency
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#654321",
    roughness: 0.8,
    metalness: 0.0,
    normalScale: new THREE.Vector2(0.5, 0.5),
  }), []);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.05,
    roughness: 0.0,
    metalness: 0.0,
    transmission: 0.95,
    thickness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    ior: 1.52,
  }), []);

  // Store material references for animation
  useEffect(() => {
    if (waveMaterialRef.current) {
      (window as any).waveMaterial = waveMaterialRef.current;
    }
    if (cloudsMaterialRef.current) {
      (window as any).cloudsMaterial = cloudsMaterialRef.current;
    }
    if (oceanMaterialRef.current) {
      (window as any).oceanMaterial = oceanMaterialRef.current;
    }
  }, []);

  // Combined window frame geometry for efficiency
  const frameGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    // Helper function to add a box
    const addBox = (x: number, y: number, z: number, width: number, height: number, depth: number) => {
      const hw = width / 2, hh = height / 2, hd = depth / 2;
      
      // Front face
      positions.push(
        x - hw, y - hh, z + hd,  x + hw, y - hh, z + hd,  x + hw, y + hh, z + hd,
        x - hw, y - hh, z + hd,  x + hw, y + hh, z + hd,  x - hw, y + hh, z + hd
      );
      normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Back face
      positions.push(
        x + hw, y - hh, z - hd,  x - hw, y - hh, z - hd,  x - hw, y + hh, z - hd,
        x + hw, y - hh, z - hd,  x - hw, y + hh, z - hd,  x + hw, y + hh, z - hd
      );
      normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Top, bottom, left, right faces...
      // Top face
      positions.push(
        x - hw, y + hh, z + hd,  x + hw, y + hh, z + hd,  x + hw, y + hh, z - hd,
        x - hw, y + hh, z + hd,  x + hw, y + hh, z - hd,  x - hw, y + hh, z - hd
      );
      normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Bottom face
      positions.push(
        x - hw, y - hh, z - hd,  x + hw, y - hh, z - hd,  x + hw, y - hh, z + hd,
        x - hw, y - hh, z - hd,  x + hw, y - hh, z + hd,  x - hw, y - hh, z + hd
      );
      normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Left face
      positions.push(
        x - hw, y - hh, z - hd,  x - hw, y - hh, z + hd,  x - hw, y + hh, z + hd,
        x - hw, y - hh, z - hd,  x - hw, y + hh, z + hd,  x - hw, y + hh, z - hd
      );
      normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Right face
      positions.push(
        x + hw, y - hh, z + hd,  x + hw, y - hh, z - hd,  x + hw, y + hh, z - hd,
        x + hw, y - hh, z + hd,  x + hw, y + hh, z - hd,  x + hw, y + hh, z + hd
      );
      normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    
    // Add frame components with depth
    addBox(-2.05, 0, 0, 0.2, 3.2, 0.3); // Left rail
    addBox(2.05, 0, 0, 0.2, 3.2, 0.3);  // Right rail
    addBox(0, 1.55, 0, 4.3, 0.2, 0.3);  // Top rail
    addBox(0, -1.55, 0, 4.3, 0.2, 0.3); // Bottom rail
    addBox(0, -1.75, 0, 4.5, 0.2, 0.15); // Window sill
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(normals), 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  return (
    <group position={[0, 4, -9.06]}>
      {/* Optimized window frame */}
      <mesh geometry={frameGeometry} material={woodMaterial} />
      
      {/* Enhanced sky with clouds */}
      <mesh position={[0, 0, -0.45]}>
        <planeGeometry args={[3.8, 2.8]} />
        <shaderMaterial
          ref={cloudsMaterialRef}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            // Noise function for clouds
            float noise(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float smoothNoise(vec2 st) {
              vec2 i = floor(st);
              vec2 f = fract(st);
              vec2 u = f * f * (3.0 - 2.0 * f);
              
              return mix(
                mix(noise(i + vec2(0.0, 0.0)), noise(i + vec2(1.0, 0.0)), u.x),
                mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), u.x), u.y);
            }
            
            float fbm(vec2 st) {
              float value = 0.0;
              float amplitude = 0.5;
              float frequency = 0.0;
              
              for (int i = 0; i < 6; i++) {
                value += amplitude * smoothNoise(st);
                st *= 2.0;
                amplitude *= 0.5;
              }
              return value;
            }
            
            void main() {
              vec2 st = vUv;
              
              // Sky gradient
              vec3 skyTop = vec3(0.4, 0.7, 1.0);
              vec3 skyMiddle = vec3(0.7, 0.85, 0.95);
              vec3 skyBottom = vec3(0.9, 0.95, 1.0);
              
              // Ocean colors
              vec3 oceanDeep = vec3(0.0, 0.2, 0.4);
              vec3 oceanShallow = vec3(0.0, 0.4, 0.7);
              vec3 oceanSurface = vec3(0.2, 0.6, 0.8);
              
              float horizonY = 0.35;
              float isOcean = step(st.y, horizonY);
              float isSky = 1.0 - isOcean;
              
              // Sky color with gradient
              vec3 skyColor = mix(skyBottom, skyTop, smoothstep(horizonY, 1.0, st.y));
              
              // Add clouds
              vec2 cloudUv = st * 3.0 + vec2(time * 0.02, 0.0);
              float cloudNoise = fbm(cloudUv);
              float cloudMask = smoothstep(0.4, 0.8, cloudNoise);
              vec3 cloudColor = vec3(1.0, 1.0, 1.0);
              skyColor = mix(skyColor, cloudColor, cloudMask * 0.8 * isSky);
              
              // Ocean color with depth
              float oceanDepth = (horizonY - st.y) / horizonY;
              vec3 oceanColor = mix(oceanSurface, oceanDeep, oceanDepth * oceanDepth);
              
              // Add sun glow
              vec2 sunPos = vec2(0.3, 0.7);
              float sunDist = distance(st, sunPos);
              float sunGlow = exp(-sunDist * 8.0);
              vec3 sunColor = vec3(1.0, 0.9, 0.7);
              
              vec3 finalColor = mix(oceanColor, skyColor, isSky);
              finalColor += sunColor * sunGlow * 0.5;
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
          uniforms={{
            time: { value: 0 }
          }}
        />
      </mesh>

      {/* Enhanced animated ocean */}
      <mesh position={[0, -0.8, -0.4]}>
        <planeGeometry args={[4, 1.2, 64, 32]} />
        <shaderMaterial
          ref={oceanMaterialRef}
          vertexShader={`
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            // Wave function
            vec3 wave(vec2 position, float time) {
              vec2 k = vec2(0.8, 0.6);
              float w = length(k) * sqrt(9.8 * length(k));
              float phase = dot(k, position) - w * time;
              float amplitude = 0.08;
              
              vec3 wave_position;
              wave_position.x = k.x * amplitude * sin(phase);
              wave_position.y = amplitude * cos(phase);
              wave_position.z = k.y * amplitude * sin(phase);
              
              return wave_position;
            }
            
            void main() {
              vUv = uv;
              vec3 pos = position;
              
              // Multiple wave layers
              pos += wave(position.xy * 2.0, time * 1.5);
              pos += wave(position.xy * 4.0 + vec2(1.0, 0.5), time * 2.0) * 0.5;
              pos += wave(position.xy * 8.0 + vec2(0.5, 1.0), time * 3.0) * 0.25;
              
              // Calculate normal for lighting
              vec3 tangentX = normalize(vec3(1.0, 0.0, 0.0));
              vec3 tangentZ = normalize(vec3(0.0, 0.0, 1.0));
              vNormal = normalize(cross(tangentX, tangentZ));
              
              vPosition = pos;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
              vec3 deepWater = vec3(0.0, 0.2, 0.4);
              vec3 shallowWater = vec3(0.0, 0.4, 0.7);
              vec3 foam = vec3(0.9, 0.95, 1.0);
              
              // Wave-based coloring
              float waveHeight = vPosition.y;
              float foam_mask = smoothstep(0.02, 0.08, waveHeight);
              
              // Fresnel effect
              vec3 viewDirection = normalize(cameraPosition - vPosition);
              float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
              fresnel = pow(fresnel, 2.0);
              
              vec3 waterColor = mix(deepWater, shallowWater, fresnel);
              waterColor = mix(waterColor, foam, foam_mask);
              
              // Add sparkles
              float sparkle = sin(vUv.x * 100.0 + time * 5.0) * sin(vUv.y * 100.0 + time * 3.0);
              sparkle = pow(max(0.0, sparkle), 10.0);
              waterColor += vec3(0.5, 0.7, 1.0) * sparkle * 0.3;
              
              gl_FragColor = vec4(waterColor, 0.9);
            }
          `}
          uniforms={{
            time: { value: 0 }
          }}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Realistic window glass with proper reflections */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[3.6, 2.6, 0.04]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Window mullions (cross) with better positioning */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.08, 2.6, 0.02]} />
        <primitive object={woodMaterial} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[3.6, 0.08, 0.02]} />
        <primitive object={woodMaterial} />
      </mesh>
      
      {/* Window handles */}
      <mesh position={[-0.9, 0, 0.08]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.9, 0, 0.08]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Enhanced Picture Frame
const PictureFrame: React.FC<{ position: [number, number, number]; isGold?: boolean }> = ({ position, isGold = false }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1, 0.8, 0.1]} />
        <meshStandardMaterial 
          color={isGold ? "#FFD700" : "#8B4513"} 
          roughness={isGold ? 0.1 : 0.6}
          metalness={isGold ? 0.9 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
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
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
      </mesh>
      
      {/* Clock frame */}
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
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
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
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
const LawyerOfficeScene: React.FC<{ 
  onPaperClick: () => void; 
  onPaperProximity: () => void;
  onProximityChange?: (isNear: boolean) => void;
}> = ({ onPaperClick, onPaperProximity, onProximityChange }) => {
  const [dpr, setDpr] = useState(1.5);

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
      
      {/* Walls with door and window opening on back wall */}
      <Wall 
        position={[0, 4, -9]} 
        width={24} 
        height={8}
        windowOpening={{ x: 0, y: 0, width: 3.8, height: 2.8 }}
      />
      <Wall position={[0, 4, 9]} rotation={[0, Math.PI, 0]} width={24} height={8} hasDoor />
      <Wall position={[-12, 4, 0]} rotation={[0, Math.PI / 2, 0]} width={18} height={8} />
      <Wall position={[12, 4, 0]} rotation={[0, -Math.PI / 2, 0]} width={18} height={8} />
      
      {/* Main Furniture */}
      <Desk onPaperClick={onPaperClick} onPaperProximity={onPaperProximity} onProximityChange={onProximityChange} />
      <Chair />
      {/* Multiple bookshelves */}
      <Bookshelf position={[-9.0, 0, -8.5]} rotation={[0, 0, 0]} />
      <Bookshelf position={[9.0, 0, -8.5]} rotation={[0, Math.PI, 0]} />
      <Bookshelf position={[0, 0, 8.5]} rotation={[0, Math.PI, 0]} />
      <FilingCabinet />
      
      
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
    const spawnPosition = new THREE.Vector3(6, 3.7, 7.4);
    camera.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
    camera.lookAt(0, 1.7, 0);
  }, [camera]);
  return null;
};

// Main Page Component with enhanced performance
// Memo Modal Component
const MemoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [userType, setUserType] = useState<'client' | 'attorney' | null>(null);
  const [selectedAttorney, setSelectedAttorney] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);

  // Static attorney list for now
  const attorneys = [
    { id: 'john_smith', name: 'John Smith, Esq. - Corporate Law' },
    { id: 'sarah_johnson', name: 'Sarah Johnson, Esq. - Family Law' },
    { id: 'michael_brown', name: 'Michael Brown, Esq. - Criminal Defense' },
    { id: 'lisa_davis', name: 'Lisa Davis, Esq. - Personal Injury' },
    { id: 'robert_wilson', name: 'Robert Wilson, Esq. - Real Estate' },
    { id: 'emily_garcia', name: 'Emily Garcia, Esq. - Immigration' },
  ];

  const handleSubmit = () => {
    if (userType === 'client') {
      console.log('Client Review Submitted:', {
        attorney: selectedAttorney,
        subject,
        message,
        rating,
        date: new Date().toISOString()
      });
      alert('Review submitted successfully!');
    } else {
      console.log('Attorney Memo Sent:', {
        to: selectedAttorney,
        subject,
        message,
        date: new Date().toISOString()
      });
      alert('Memo sent successfully!');
    }
    
    // Reset form
    setUserType(null);
    setSelectedAttorney('');
    setSubject('');
    setMessage('');
    setRating(5);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Legal Network Communication</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6">
          {/* User Type Selection */}
          {!userType && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Please select your role:</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setUserType('client')}
                  className="flex-1 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg font-medium">Client</div>
                  <div className="text-sm text-gray-600">Leave a review for an attorney</div>
                </button>
                <button 
                  onClick={() => setUserType('attorney')}
                  className="flex-1 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg font-medium">Attorney</div>
                  <div className="text-sm text-gray-600">Send a memo to colleague</div>
                </button>
              </div>
            </div>
          )}

          {/* Memo Form */}
          {userType && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  {userType === 'client' ? 'ATTORNEY REVIEW FORM' : 'INTER-OFFICE MEMORANDUM'}
                </div>
                <div className="text-xs text-gray-500">
                  Date: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* To Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To: {userType === 'client' ? 'Attorney to Review' : 'Recipient Attorney'}
                </label>
                <select 
                  value={selectedAttorney} 
                  onChange={(e) => setSelectedAttorney(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an attorney...</option>
                  {attorneys.map(attorney => (
                    <option key={attorney.id} value={attorney.id}>{attorney.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Re: {userType === 'client' ? 'Review Subject' : 'Subject Matter'}
                </label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={userType === 'client' ? 'Brief description of your experience...' : 'Legal matter or case reference...'}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Rating (for clients only) */}
              {userType === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating:
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                  </div>
                </div>
              )}

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'client' ? 'Review Details:' : 'Message:'}
                </label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={userType === 'client' 
                    ? 'Please describe your experience with this attorney...' 
                    : 'Enter your memo content here...'}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setUserType(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!selectedAttorney || !subject || !message}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {userType === 'client' ? 'Submit Review' : 'Send Memo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MiniversePage() {
  const router = useRouter();
  const [dpr, setDpr] = useState(1.5);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [controlsType, setControlsType] = useState<'loading' | 'pointer-lock' | 'orbit'>('loading');
  const [isNearPaper, setIsNearPaper] = useState(false);

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
        /* Remove all renderer shadows */
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
          gl.shadowMap.enabled = false;
          // Ensure consistent color management and non-black clear color
          // Use outputColorSpace when available (Three r152+), otherwise fallback
          if ('outputColorSpace' in (gl as any)) {
            (gl as any).outputColorSpace = THREE.SRGBColorSpace;
          }
          gl.setClearColor(new THREE.Color('#f6fbff'), 1);
          gl.toneMapping = THREE.NoToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        {/* Bright background to keep page fully lighted */}
        <color attach="background" args={["#f6fbff"]} />
        {/* Postprocessing removed for performance */}
        <LawyerOfficeScene 
          onPaperClick={() => setIsMemoModalOpen(true)} 
          onPaperProximity={() => setIsMemoModalOpen(true)}
          onProximityChange={setIsNearPaper}
        />
        <SpawnAtDoor />
        <KeyboardMovement />
        
        {/* Enhanced controls with fallback */}
        <EnhancedControls onControlsTypeChange={setControlsType} />
      </Canvas>
      
      {/* Enhanced UI overlay for first-person exploration */}
      <div className="absolute top-4 left-4 text-slate-800 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-300">
        <div className="text-lg font-bold mb-1">🚶 Law Office Walkthrough</div>
        
        {/* Proximity indicator */}
        {isNearPaper && (
          <div className="text-xs text-emerald-600 mb-2 animate-pulse">
            ✨ <strong>Near Interactive Paper</strong> - Memo will auto-open
          </div>
        )}
        
        {/* Control mode indicator */}
        {controlsType === 'loading' && (
          <div className="text-xs text-blue-600 mb-2">⏳ Loading controls...</div>
        )}
        {controlsType === 'orbit' && (
          <div className="text-xs text-orange-600 mb-2">🔄 Orbit Controls Mode (Drag to look, scroll to zoom)</div>
        )}
        {controlsType === 'pointer-lock' && (
          <div className="text-xs text-green-600 mb-2">🎯 FPS Controls Mode (Mouse locked)</div>
        )}
        
        <div className="text-xs opacity-70 mt-1 space-y-1">
          {controlsType === 'orbit' ? (
            <>
              <div>🖱️ <strong>Drag:</strong> Look around • <strong>Right-click + drag:</strong> Pan</div>
              <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
              <div>🔄 <strong>Scroll:</strong> Zoom in/out</div>
            </>
          ) : controlsType === 'pointer-lock' ? (
            <>
              <div>🖱️ <strong>Mouse:</strong> Look around (locked)</div>
              <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
              <div>⎋ <strong>Escape:</strong> Unlock mouse</div>
            </>
          ) : (
            <>
              <div>🖱️ <strong>Click:</strong> Lock mouse for FPS controls (or drag to orbit)</div>
              <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
              <div>⎋ <strong>Escape:</strong> Unlock mouse / 🔄 <strong>Scroll:</strong> Zoom</div>
            </>
          )}
        </div>
        <div className="text-xs opacity-60 mt-2 space-y-1">
          <div>📍 <strong>Starting Position:</strong> At the door</div>
          <div>🏢 <strong>Room Layout:</strong> Fully enclosed office</div>
          <div>🎯 <strong>Explore:</strong> Desk area, bookshelf, window, door</div>
          <div>⚡ <strong>Interactive:</strong> Walk near or click paper on desk for legal memo</div>
              </div>
            </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Exit button */}
        <button
          onClick={handleExit}
          className="text-white bg-red-600 hover:bg-red-700 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-500/40 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          title="Exit 3D World"
        >
          <span>✕</span>
          Exit
        </button>
        
        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          className="text-white bg-blue-600 hover:bg-blue-700 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/40 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          title="Toggle Fullscreen"
        >
          <span>⛶</span>
          Fullscreen
        </button>
        
       
            </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 text-slate-800 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-300">
        <div className="text-xs opacity-80 space-y-1">
          <div>ESC to exit • F11 for fullscreen</div>
          {controlsType === 'orbit' ? (
            <div>↑↓←→ Arrow keys or WASD to walk • Drag to orbit • Scroll to zoom</div>
          ) : controlsType === 'pointer-lock' ? (
            <div>↑↓←→ Arrow keys or WASD to walk • Mouse to look (locked)</div>
          ) : (
            <div>↑↓←→ Arrow keys or WASD to walk • Mouse to look/orbit</div>
          )}
          {isNearPaper && (
            <div className="text-emerald-600 font-medium animate-pulse">📄 Legal memo ready - Auto-triggered!</div>
          )}
        </div>
      </div>

      {/* Room layout reference map */}
      <div className="absolute bottom-4 right-4 w-36 h-28 bg-white/90 border border-slate-300 rounded-lg p-2">
        <div className="text-slate-800 text-xs mb-1 text-center font-medium">Office Layout</div>
        <div className="relative w-full h-full bg-gray-100 rounded border border-gray-300">
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

      {/* Memo Modal */}
      <MemoModal 
        isOpen={isMemoModalOpen} 
        onClose={() => setIsMemoModalOpen(false)} 
      />
    </div>
  );
}