"use client";

import React from 'react';
import { Float, RoundedBox } from '@react-three/drei';
import { ProximityDetector } from '../controls';
import { useMiniverseStore } from '../../data/store';

const Desk: React.FC = () => {
  const { openMemoModal, setIsNearPaper, setIsNearDesk } = useMiniverseStore();
  
  // Matte off-white materials for desktop and legs
  const deskTopColor = '#F5F5F0'; // Matte off-white
  const deskLegColor = '#F0F0EB'; // Slightly darker off-white for legs

  return (
    <group position={[4, 0, 2]}>
      {/* Desk proximity detector - larger area around entire desk */}
      <ProximityDetector 
        position={[4, 1.5, 2]} // Desk center position
        triggerDistance={2.5} // Larger trigger area for entire desk
        onTrigger={() => openMemoModal()}
        onProximityChange={setIsNearDesk}
        cooldownMs={5000}
      />
      
      {/* Desk area indicator glow */}
      <Float
        speed={1.5}
        rotationIntensity={0}
        floatIntensity={0.2}
      >
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[5.5, 0.05, 3.0]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
        </mesh>
      </Float>
      
      {/* Rounded desktop with matte off-white finish */}
      <RoundedBox position={[0, 1.5, 0]} args={[5, 0.12, 2.5]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={deskTopColor}
          roughness={0.8}
          metalness={0}
        />
      </RoundedBox>

      {/* Structural rails under desktop */}
      {[1.02, -1.02].map((z, i) => (
        <mesh key={`rail-${i}`} position={[0, 1.44, z]}>
          <boxGeometry args={[4.7, 0.08, 0.1]} />
          <meshStandardMaterial color={deskLegColor} roughness={0.8} metalness={0} />
        </mesh>
      ))}
      {[2.25, -2.25].map((x, i) => (
        <mesh key={`side-rail-${i}`} position={[x, 0.9, 0]}>
          <boxGeometry args={[0.1, 1.2, 2.2]} />
          <meshStandardMaterial color={deskLegColor} roughness={0.8} metalness={0} />
        </mesh>
      ))}

      {/* Sturdy desk legs */}
      {[[-2.2, -1], [2.2, -1], [-2.2, 1], [2.2, 1]].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, 0.75, z]}>
          <boxGeometry args={[0.18, 1.5, 0.18]} />
          <meshStandardMaterial color={deskLegColor} roughness={0.8} metalness={0} />
        </mesh>
      ))}

      {/* Minimal drawer on right side */}
      <group position={[2.15, 1.3, 0.4]}>
        <mesh>
          <boxGeometry args={[0.9, 0.35, 0.5]} />
          <meshStandardMaterial color={deskLegColor} roughness={0.8} metalness={0} />
        </mesh>
        {/* Drawer face (slightly proud) */}
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[0.9, 0.35, 0.02]} />
          <meshStandardMaterial color={deskTopColor} roughness={0.8} metalness={0} />
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
          onTrigger={() => openMemoModal()}
          onProximityChange={setIsNearPaper}
          cooldownMs={4000}
        />
        
        {/* Persistent highlight glow - always visible */}
        <Float
          speed={2}
          rotationIntensity={0}
          floatIntensity={0.3}
        >
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.75, 0.008, 0.95]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} />
          </mesh>
        </Float>
        
        {/* Pulsing border - always visible */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.8, 0.003, 1.0]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} />
        </mesh>
        
        {/* Additional attention-grabbing ring */}
        <Float
          speed={1.5}
          rotationIntensity={0}
          floatIntensity={0.2}
        >
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.9, 0.002, 1.1]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
          </mesh>
        </Float>
        
        <mesh onClick={() => openMemoModal()} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}>
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

export default Desk;
