"use client";

import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMiniverseStore } from '../../data/store';

interface KeyboardMovementProps {
  disabled?: boolean;
}

const KeyboardMovement: React.FC<KeyboardMovementProps> = ({ disabled = false }) => {
  const { camera } = useThree();
  const [keys, setKeys] = useState({
    ArrowUp: false, KeyW: false,     // Forward
    ArrowDown: false, KeyS: false,   // Backward
    ArrowLeft: false, KeyA: false,   // Strafe left
    ArrowRight: false, KeyD: false   // Strafe right
  });

  const moveSpeed = 0.08; // Smooth walking speed
  const roomBounds = {
    minX: -21, maxX: 21,  // Slightly inside walls (room is 48 wide, walls at ±24)
    minZ: -15, maxZ: 15,  // Slightly inside walls (room is 36 deep, walls at ±18)
    minY: 1.5, maxY: 3.5  // Keep head height reasonable for tall adult
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
    if (disabled) return; // Disable movement when modal is open
    
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

export default KeyboardMovement;
