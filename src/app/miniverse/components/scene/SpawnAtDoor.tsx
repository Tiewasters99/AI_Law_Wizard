"use client";

import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SpawnAtDoor: React.FC = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position further from door to avoid collision (back wall, center, moved forward)
    // Adult FPS height: 6 feet = ~1.83 meters (significantly increased for proper adult perspective)
    const spawnPosition = new THREE.Vector3(0, 2.2, 14.0);
    camera.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
    // Look towards the center of the room (desk area)
    camera.lookAt(4, 2.2, 2);
  }, [camera]);
  
  return null;
};

export default SpawnAtDoor;
