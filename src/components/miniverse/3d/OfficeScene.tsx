import React, { useRef } from "react";
import * as THREE from "three";
import { Lighting } from "./Lighting";
import { LampManager } from "./LampManager";
import { SceneContent } from "./SceneContent";
import { UserData, MiniverseConfig } from "./types";

interface OfficeSceneProps {
  onObjectClick: (userData: UserData) => void;
  lampsOn: boolean;
  config: MiniverseConfig;
}

export const OfficeScene: React.FC<OfficeSceneProps> = ({
  onObjectClick,
  lampsOn,
  config,
}) => {
  const lampShadesRef = useRef<THREE.Mesh[]>([]);

  return (
    <group>
      <Lighting lampsOn={lampsOn} />
      <LampManager lampsOn={lampsOn} lampShadesRef={lampShadesRef} />
      <SceneContent
        config={config}
        onObjectClick={onObjectClick}
        lampsOn={lampsOn}
        lampShadesRef={lampShadesRef}
      />
    </group>
  );
};
