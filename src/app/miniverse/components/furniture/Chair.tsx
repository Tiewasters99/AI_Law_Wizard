"use client";

import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { generateFabricTextures } from '../../utils/textures';

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

export default Chair;
