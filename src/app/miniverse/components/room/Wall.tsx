"use client";

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateWallTextures } from '../../utils/textures';

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
        <group position={[width/4, -3, 0.05]}>
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

export default Wall;
