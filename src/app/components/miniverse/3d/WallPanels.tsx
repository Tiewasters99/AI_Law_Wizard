import React from 'react';
import { createTextTexture } from '../utils/textureHelpers';
import { PROFILE_POSITIONS } from '../utils/constants';

interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

interface WallPanelsProps {
  config: {
    panels: {
      [panelId: string]: {
        position: { x: number; y: number; z: number };
        size: [number, number, number];
        color: string;
        label: string;
        visible: boolean;
      };
    };
  };
  onPanelClick: (userData: UserData) => void;
}

export const WallPanels: React.FC<WallPanelsProps> = ({ config, onPanelClick }) => {
  const handleClick = (e: any, userData: UserData) => {
    e.stopPropagation();
    if (userData.interactive) {
      onPanelClick(userData);
    }
  };

  // Text textures
  const rightWallBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 80);
  const backWallFarBrandTexture = createTextTexture('QUAINTON LAW MINIVERSE™', 80, '#ffffff');

  return (
    <group>
      {/* Back Wall Interactive Panels */}
      {Object.entries(config.panels).map(([panelId, panel]) => 
        panel.visible ? (
          <group key={panelId}>
            <mesh 
              position={[panel.position.x, panel.position.y, panel.position.z]} 
              onClick={(e) => handleClick(e, { type: panelId, label: panel.label, interactive: true })}
            >
              <boxGeometry args={panel.size} />
              <meshStandardMaterial color={panel.color} roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[panel.position.x, panel.position.y, panel.position.z + 0.2]}>
              <planeGeometry args={[panel.size[0] * 0.8, panel.size[1] * 0.3]} />
              <meshBasicMaterial map={createTextTexture(panel.label, 60, '#ffffff')} transparent />
            </mesh>
          </group>
        ) : null
      )}

      {/* Far Wall Profile Panels */}
      {PROFILE_POSITIONS.map((position, index) => (
        <group key={`profile-${index}`}>
          <mesh position={[position, 2.5, 24.6]} onClick={(e) => handleClick(e, { type: 'profile', label: `PROFILE ${index + 1}`, interactive: true })}>
            <boxGeometry args={[4.5, 1.5, 0.3]} />
            <meshStandardMaterial color={0x5a4a6a} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[position, 2.5, 24.8]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[3.5, 1]} />
            <meshBasicMaterial map={createTextTexture('PROFILES', 40, '#ffffff')} transparent />
          </mesh>
        </group>
      ))}

      {backWallFarBrandTexture && (
        <mesh position={[0, 6, 24.7]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[10, 2.5]} />
          <meshBasicMaterial map={backWallFarBrandTexture} transparent />
        </mesh>
      )}

      {/* Certificates on Right Wall */}
      {[...Array(6)].map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <mesh
            key={`cert-${i}`}
            position={[24.6, 2 + row * 2.5, -1 + col * 2]}
            onClick={(e) => handleClick(e, { type: 'certificate', label: `Certificate ${i + 1}`, interactive: true })}
          >
            <boxGeometry args={[0.3, 1.5, 1.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        );
      })}

      {/* Right Wall Brand Text */}
      {rightWallBrandTexture && (
        <mesh position={[24.4, 6, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial map={rightWallBrandTexture} transparent />
        </mesh>
      )}
    </group>
  );
};
