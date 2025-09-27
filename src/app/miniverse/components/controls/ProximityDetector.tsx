"use client";

import React, { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface ProximityDetectorProps {
  position: [number, number, number];
  triggerDistance: number;
  onTrigger: () => void;
  onProximityChange?: (isNear: boolean) => void;
  cooldownMs?: number;
}

const ProximityDetector: React.FC<ProximityDetectorProps> = ({ 
  position, 
  triggerDistance, 
  onTrigger, 
  onProximityChange, 
  cooldownMs = 3000 
}) => {
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

export default ProximityDetector;
