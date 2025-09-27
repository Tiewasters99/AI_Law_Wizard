"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
    <group position={[0, 6, -17.6]}>
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

export default WallClock;
