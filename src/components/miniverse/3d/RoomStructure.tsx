import React from "react";
import { createTextTexture } from "../utils/textureHelpers";
import { ROOM_DIMENSIONS } from "../utils/constants";

interface RoomStructureProps {
  config: {
    floor: { color: string };
    walls: { color: string };
  };
}

export const RoomStructure: React.FC<RoomStructureProps> = ({ config }) => {
  // Text textures
  const brandTexture = createTextTexture("QUAINTON LAW", 120);
  const miniverseTexture = createTextTexture("MINIVERSE™", 80);

  return (
    <group>
      {/* Floor - EXACT dimensions from temp.js with current colors */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_DIMENSIONS.size, ROOM_DIMENSIONS.size]} />
        <meshStandardMaterial
          color={config.floor.color}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Walls - EXACT dimensions from temp.js with current colors */}
      <mesh
        position={[
          0,
          ROOM_DIMENSIONS.ceilingHeight / 2,
          -ROOM_DIMENSIONS.halfSize,
        ]}
      >
        <boxGeometry
          args={[ROOM_DIMENSIONS.size, ROOM_DIMENSIONS.ceilingHeight, 0.5]}
        />
        <meshStandardMaterial
          color={config.walls.color}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      <mesh
        position={[
          -ROOM_DIMENSIONS.halfSize,
          ROOM_DIMENSIONS.ceilingHeight / 2,
          0,
        ]}
      >
        <boxGeometry
          args={[0.5, ROOM_DIMENSIONS.ceilingHeight, ROOM_DIMENSIONS.size]}
        />
        <meshStandardMaterial
          color={config.walls.color}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      <mesh
        position={[
          ROOM_DIMENSIONS.halfSize,
          ROOM_DIMENSIONS.ceilingHeight / 2,
          0,
        ]}
      >
        <boxGeometry
          args={[0.5, ROOM_DIMENSIONS.ceilingHeight, ROOM_DIMENSIONS.size]}
        />
        <meshStandardMaterial
          color={config.walls.color}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, ROOM_DIMENSIONS.ceilingHeight, 0]}
      >
        <planeGeometry args={[ROOM_DIMENSIONS.size, ROOM_DIMENSIONS.size]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Brand Text on Back Wall */}
      {brandTexture && (
        <mesh position={[0, 7.5, -24.7]}>
          <planeGeometry args={[16, 4]} />
          <meshBasicMaterial map={brandTexture} transparent />
        </mesh>
      )}

      {miniverseTexture && (
        <mesh position={[0, 5.8, -24.7]}>
          <planeGeometry args={[12, 3]} />
          <meshBasicMaterial map={miniverseTexture} transparent />
        </mesh>
      )}
    </group>
  );
};
