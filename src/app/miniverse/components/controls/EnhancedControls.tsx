"use client";

import React, { useEffect, useState } from 'react';
import { PointerLockControls, OrbitControls } from '@react-three/drei';
import { useMiniverseStore } from '../../data/store';

interface EnhancedControlsProps {
  disabled?: boolean;
}

const EnhancedControls: React.FC<EnhancedControlsProps> = ({ disabled = false }) => {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [pointerLockSupported, setPointerLockSupported] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [wasInPointerLock, setWasInPointerLock] = useState(false);
  const { setControlsType } = useMiniverseStore();

  useEffect(() => {
    // Check if PointerLock API is supported
    const isSupported = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    
    if (!isSupported) {
      console.warn('Pointer Lock API not supported, falling back to OrbitControls');
      setPointerLockSupported(false);
      setControlsType('orbit');
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      console.warn('Pointer Lock API requires secure context (HTTPS), falling back to OrbitControls');
      setPointerLockSupported(false);
      setControlsType('orbit');
      return;
    }

    // Don't add event listeners if modal is open (disabled = true)
    if (disabled) {
      return;
    }

    // Wait for user interaction before enabling pointer lock
    const handleFirstInteraction = (event: Event) => {
      // Only enable FPS controls if clicking on the canvas
      const target = event.target as Element;
      const isCanvasClick = target && target.tagName === 'CANVAS';
      
      if (isCanvasClick) {
        setUserInteracted(true);
        setControlsEnabled(true);
        setControlsType('pointer-lock');
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    const handleKeyInteraction = () => {
      setUserInteracted(true);
      setControlsEnabled(true);
      setControlsType('pointer-lock');
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleKeyInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleKeyInteraction);
    };
  }, [disabled, setControlsType]);

  useEffect(() => {
    if (!pointerLockSupported && !userInteracted) {
      setControlsType('orbit');
    }
  }, [pointerLockSupported, userInteracted, setControlsType]);

  // Handle re-engagement of pointer lock when disabled state changes
  useEffect(() => {
    if (!disabled && wasInPointerLock && userInteracted && pointerLockSupported) {
      // Re-engage pointer lock after modal closes
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas && !document.pointerLockElement) {
          canvas.click();
        }
      }, 150);
    }
  }, [disabled, wasInPointerLock, userInteracted, pointerLockSupported]);

  if (!pointerLockSupported || !userInteracted) {
    return (
      <OrbitControls
        enablePan={!disabled}
        enableZoom={!disabled}
        enableRotate={!disabled}
        maxPolarAngle={Math.PI}
        minDistance={1}
        maxDistance={20}
        target={[0, 2, 0]}
      />
    );
  }

  return (
    <PointerLockControls 
      makeDefault={controlsEnabled && !disabled}
      onLock={() => {
        console.log('Pointer locked');
        setWasInPointerLock(true);
      }}
      onUnlock={() => {
        console.log('Pointer unlocked');
        if (disabled) {
          // Only set to false if we're disabled (modal is open)
          // This preserves the state for re-engagement
        } else {
          setWasInPointerLock(false);
        }
      }}
    />
  );
};

export default EnhancedControls;
