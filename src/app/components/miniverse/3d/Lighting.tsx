import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface LightingProps {
  lampsOn: boolean;
}

export const Lighting: React.FC<LightingProps> = ({ lampsOn }) => {
  const lampLightsRef = useRef<THREE.PointLight[]>([]);
  const lampShadesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    lampShadesRef.current.forEach(shade => {
      if (shade && shade.material) {
        (shade.material as THREE.MeshStandardMaterial).emissiveIntensity = lampsOn ? 0.5 : 0;
      }
    });
    
    lampLightsRef.current.forEach(light => {
      if (light) {
        light.intensity = lampsOn ? 0.8 : 0;
      }
    });
  }, [lampsOn]);

  return (
    <group>
      {/* Maximum Lighting - No Shadows, Fully Bright */}
      <ambientLight intensity={2.0} color="#ffffff" />
      
      {/* Main Directional Lights - High Intensity */}
      <directionalLight position={[10, 15, 10]} intensity={3.5} color="#ffffff" />
      <directionalLight position={[-12, 8, -8]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[0, 20, 0]} intensity={3.0} color="#ffffff" />
      <directionalLight position={[15, 5, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-15, 5, 5]} intensity={2.0} color="#ffffff" />
      
      {/* Additional directional lights for even coverage */}
      <directionalLight position={[0, 15, -15]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[0, 15, 15]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-15, 10, 0]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[15, 10, 0]} intensity={2.0} color="#ffffff" />
      
      {/* Ceiling Point Lights - Evenly Distributed for Full Coverage */}
      <pointLight position={[0, 9, 0]} intensity={4.0} color="#ffffff" distance={50} decay={1.5} />
      <pointLight position={[-10, 9, -10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      <pointLight position={[10, 9, -10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      <pointLight position={[-10, 9, 10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      <pointLight position={[10, 9, 10]} intensity={3.5} color="#ffffff" distance={45} decay={1.5} />
      
      {/* Corner Lights for Complete Coverage - Increased Range */}
      <pointLight position={[-20, 6, -20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[20, 6, -20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[-20, 6, 20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[20, 6, 20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      
      {/* Additional Mid-Wall Lights for Even Distribution */}
      <pointLight position={[0, 7, -20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[0, 7, 20]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[-20, 7, 0]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      <pointLight position={[20, 7, 0]} intensity={3.0} color="#ffffff" distance={40} decay={1.5} />
      
      {/* Table Lamps (Decorative when on) */}
      <pointLight 
        ref={(ref) => { if (ref) lampLightsRef.current[0] = ref; }}
        position={[-8, 2, 8]} 
        intensity={lampsOn ? 2.0 : 0} 
        color="#ffd700" 
        distance={25}
        decay={1.5}
      />
      <pointLight 
        ref={(ref) => { if (ref) lampLightsRef.current[1] = ref; }}
        position={[8, 2, 8]} 
        intensity={lampsOn ? 2.0 : 0} 
        color="#ffd700" 
        distance={25}
        decay={1.5}
      />
    </group>
  );
};
