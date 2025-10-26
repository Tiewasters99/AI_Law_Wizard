import React, { useRef } from "react";
import * as THREE from "three";
import { BOOK_TITLES } from "../utils/constants";

interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

interface DecorationsProps {
  config: {
    objects: {
      lamps: Array<{
        id: string;
        position: { x: number; y: number; z: number };
        visible: boolean;
      }>;
      plants: Array<{
        id: string;
        position: { x: number; y: number; z: number };
        visible: boolean;
      }>;
    };
  };
  lampsOn: boolean;
  onBookClick: (userData: UserData) => void;
  onLampClick: (userData: UserData) => void;
  lampShadesRef: React.MutableRefObject<THREE.Mesh[]>;
}

export const Decorations: React.FC<DecorationsProps> = ({
  config,
  lampsOn,
  onBookClick,
  onLampClick,
  lampShadesRef,
}) => {
  const handleClick = (e: any, userData: UserData) => {
    e.stopPropagation();
    if (userData.interactive) {
      if (userData.type === "book") {
        onBookClick(userData);
      } else if (userData.type === "lamp") {
        onLampClick(userData);
      }
    }
  };

  return (
    <group>
      {/* Books - 25 books with exact positions from temp.js */}
      {[...Array(25)].map((_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <mesh
            key={`book-${i}`}
            position={[-24.3, 0.8 + row * 1, -11 + col * 1.5]}
            rotation={[0, Math.PI / 2, 0]}
            onClick={e =>
              handleClick(e, {
                type: "book",
                label: BOOK_TITLES[i],
                interactive: true,
              })
            }
          >
            <boxGeometry args={[0.15, 0.8, 0.2]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)}
            />
          </mesh>
        );
      })}

      {/* Lamps */}
      {config.objects.lamps.map((lamp, index) =>
        lamp.visible ? (
          <group
            key={`lamp-${lamp.id}`}
            position={[lamp.position.x, lamp.position.y, lamp.position.z]}
          >
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
              <meshStandardMaterial color={0x8b7355} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
              <meshStandardMaterial color={0x8b7355} />
            </mesh>
            <mesh
              ref={ref => {
                if (ref) lampShadesRef.current[index] = ref;
              }}
              position={[0, 1.6, 0]}
              onClick={e =>
                handleClick(e, {
                  type: "lamp",
                  label: "Lamp",
                  interactive: true,
                })
              }
            >
              <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
              <meshStandardMaterial
                color={0xffd700}
                emissive={0xffd700}
                emissiveIntensity={lampsOn ? 0.5 : 0}
              />
            </mesh>
          </group>
        ) : null
      )}

      {/* Plants */}
      {config.objects.plants.map(plant =>
        plant.visible ? (
          <group key={`plant-${plant.id}`}>
            <mesh position={[plant.position.x, 0.2, plant.position.z]}>
              <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
              <meshStandardMaterial color={0x8b4513} />
            </mesh>
            <mesh position={[plant.position.x, 0.6, plant.position.z]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial color={0x228b22} />
            </mesh>
          </group>
        ) : null
      )}
    </group>
  );
};
