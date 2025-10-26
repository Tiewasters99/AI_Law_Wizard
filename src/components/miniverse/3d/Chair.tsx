import React from "react";

interface ChairProps {
  position: [number, number, number];
  rotation: number;
}

export const Chair: React.FC<ChairProps> = ({ position, rotation }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Enhanced Chair Seat */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.9, 0.17, 0.8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Enhanced Seat Cushion */}
      <mesh position={[0, 0.59, 0]}>
        <boxGeometry args={[0.83, 0.14, 0.77]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Enhanced Chair Back */}
      <mesh position={[0, 1.1, -0.35]}>
        <boxGeometry args={[0.85, 1.2, 0.08]} />
        <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Enhanced Back Cushion */}
      <mesh position={[0, 1.1, -0.31]}>
        <boxGeometry args={[0.87, 1.1, 0.04]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Enhanced Chair Legs */}
      <mesh position={[-0.35, 0.25, -0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.2}
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.35, 0.25, -0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.2}
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[-0.35, 0.25, 0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.2}
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.35, 0.25, 0.35]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.2}
          metalness={0.6}
          emissive="#4b5563"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Enhanced Armrests */}
      <mesh position={[-0.45, 0.8, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.45, 0.8, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
};
