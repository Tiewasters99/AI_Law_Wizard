import React, { useEffect } from "react";
import * as THREE from "three";

interface LampManagerProps {
  lampsOn: boolean;
  lampShadesRef: React.MutableRefObject<THREE.Mesh[]>;
}

export const LampManager: React.FC<LampManagerProps> = ({
  lampsOn,
  lampShadesRef,
}) => {
  useEffect(() => {
    lampShadesRef.current.forEach(shade => {
      if (shade && shade.material) {
        (shade.material as THREE.MeshStandardMaterial).emissiveIntensity =
          lampsOn ? 0.5 : 0;
      }
    });
  }, [lampsOn, lampShadesRef]);

  return null;
};
