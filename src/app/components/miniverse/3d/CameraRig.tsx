import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_SETTINGS } from '../utils/constants';

export const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const moveSpeed = CAMERA_SETTINGS.moveSpeed;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    const keys = keysRef.current;
    const yaw = yawRef.current;

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    if (keys['arrowup'] || keys['w']) camera.position.add(forward.clone().multiplyScalar(moveSpeed));
    if (keys['arrowdown'] || keys['s']) camera.position.add(forward.clone().multiplyScalar(-moveSpeed));
    if (keys['arrowleft'] || keys['a']) camera.position.add(right.clone().multiplyScalar(-moveSpeed));
    if (keys['arrowright'] || keys['d']) camera.position.add(right.clone().multiplyScalar(moveSpeed));
    if (keys['q']) yawRef.current += 0.02;
    if (keys['e']) yawRef.current -= 0.02;

    // Boundary constraints
    camera.position.x = Math.max(CAMERA_SETTINGS.boundary.minX, Math.min(CAMERA_SETTINGS.boundary.maxX, camera.position.x));
    camera.position.z = Math.max(CAMERA_SETTINGS.boundary.minZ, Math.min(CAMERA_SETTINGS.boundary.maxZ, camera.position.z));
    camera.position.y = CAMERA_SETTINGS.boundary.y;

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yawRef.current;
    camera.rotation.x = pitchRef.current;
  });

  return null;
};
