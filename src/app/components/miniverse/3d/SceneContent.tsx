import React from 'react';
import * as THREE from 'three';
import { RoomStructure } from './RoomStructure';
import { WallPanels } from './WallPanels';
import { Furniture } from './Furniture';
import { Decorations } from './Decorations';
import { UserData, MiniverseConfig } from './types';

interface SceneContentProps {
  config: MiniverseConfig;
  onObjectClick: (userData: UserData) => void;
  lampsOn: boolean;
  lampShadesRef: React.MutableRefObject<THREE.Mesh[]>;
}

export const SceneContent: React.FC<SceneContentProps> = ({ 
  config, 
  onObjectClick, 
  lampsOn, 
  lampShadesRef 
}) => {
  // Create wrapper functions for different component interfaces
  const handlePanelClick = (userData: UserData) => {
    onObjectClick(userData);
  };

  const handleItemClick = (userData: UserData) => {
    onObjectClick(userData);
  };

  const handleBookClick = (userData: UserData) => {
    onObjectClick(userData);
  };

  const handleLampClick = (userData: UserData) => {
    onObjectClick(userData);
  };

  return (
    <group>
      <RoomStructure config={config} />
      <WallPanels config={config} onPanelClick={handlePanelClick} />
      <Furniture config={config} onItemClick={handleItemClick} />
      <Decorations 
        config={config} 
        lampsOn={lampsOn} 
        onBookClick={handleBookClick}
        onLampClick={handleLampClick}
        lampShadesRef={lampShadesRef}
      />
    </group>
  );
};
