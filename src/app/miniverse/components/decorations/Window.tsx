"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const Window: React.FC = () => {
  const cloudsMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Shared materials for efficiency
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#654321",
    roughness: 0.8,
    metalness: 0.0,
    normalScale: new THREE.Vector2(0.5, 0.5),
  }), []);

  // Store material references for animation
  useEffect(() => {
    if (cloudsMaterialRef.current) {
      (window as any).cloudsMaterial = cloudsMaterialRef.current;
    }
  }, []);

  // Combined window frame geometry for efficiency
  const frameGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    // Helper function to add a box
    const addBox = (x: number, y: number, z: number, width: number, height: number, depth: number) => {
      const hw = width / 2, hh = height / 2, hd = depth / 2;
      
      // Front face
      positions.push(
        x - hw, y - hh, z + hd,  x + hw, y - hh, z + hd,  x + hw, y + hh, z + hd,
        x - hw, y - hh, z + hd,  x + hw, y + hh, z + hd,  x - hw, y + hh, z + hd
      );
      normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Back face
      positions.push(
        x + hw, y - hh, z - hd,  x - hw, y - hh, z - hd,  x - hw, y + hh, z - hd,
        x + hw, y - hh, z - hd,  x - hw, y + hh, z - hd,  x + hw, y + hh, z - hd
      );
      normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Top, bottom, left, right faces...
      // Top face
      positions.push(
        x - hw, y + hh, z + hd,  x + hw, y + hh, z + hd,  x + hw, y + hh, z - hd,
        x - hw, y + hh, z + hd,  x + hw, y + hh, z - hd,  x - hw, y + hh, z - hd
      );
      normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Bottom face
      positions.push(
        x - hw, y - hh, z - hd,  x + hw, y - hh, z - hd,  x + hw, y - hh, z + hd,
        x - hw, y - hh, z - hd,  x + hw, y - hh, z + hd,  x - hw, y - hh, z + hd
      );
      normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Left face
      positions.push(
        x - hw, y - hh, z - hd,  x - hw, y - hh, z + hd,  x - hw, y + hh, z + hd,
        x - hw, y - hh, z - hd,  x - hw, y + hh, z + hd,  x - hw, y + hh, z - hd
      );
      normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      
      // Right face
      positions.push(
        x + hw, y - hh, z + hd,  x + hw, y - hh, z - hd,  x + hw, y + hh, z - hd,
        x + hw, y - hh, z + hd,  x + hw, y + hh, z - hd,  x + hw, y + hh, z + hd
      );
      normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    
    // Add frame components with depth
    addBox(-2.05, 0, 0, 0.2, 3.2, 0.3); // Left rail
    addBox(2.05, 0, 0, 0.2, 3.2, 0.3);  // Right rail
    addBox(0, 1.55, 0, 4.3, 0.2, 0.3);  // Top rail
    addBox(0, -1.55, 0, 4.3, 0.2, 0.3); // Bottom rail
    addBox(0, -1.75, 0, 4.5, 0.2, 0.15); // Window sill
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(normals), 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  return (
    <group position={[0, 6, -17.8]}>
      {/* Optimized window frame */}
      <mesh geometry={frameGeometry} material={woodMaterial} />
      
      {/* Enhanced sky with clouds */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[3.8, 2.8]} />
        <shaderMaterial
          ref={cloudsMaterialRef}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            // Noise function for clouds
            float noise(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float smoothNoise(vec2 st) {
              vec2 i = floor(st);
              vec2 f = fract(st);
              vec2 u = f * f * (3.0 - 2.0 * f);
              
              return mix(
                mix(noise(i + vec2(0.0, 0.0)), noise(i + vec2(1.0, 0.0)), u.x),
                mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), u.x), u.y);
            }
            
            float fbm(vec2 st) {
              float value = 0.0;
              float amplitude = 0.5;
              float frequency = 0.0;
              
              for (int i = 0; i < 6; i++) {
                value += amplitude * smoothNoise(st);
                st *= 2.0;
                amplitude *= 0.5;
              }
              return value;
            }
            
            void main() {
              vec2 st = vUv;
              
              // Simple sky gradient
              vec3 skyTop = vec3(0.4, 0.7, 1.0);
              vec3 skyBottom = vec3(0.9, 0.95, 1.0);
              vec3 skyColor = mix(skyBottom, skyTop, st.y);
              
              // Simple clouds
              vec2 cloudUv = st * 3.0 + vec2(time * 0.02, 0.0);
              float cloudNoise = fbm(cloudUv);
              float cloudMask = smoothstep(0.4, 0.8, cloudNoise);
              vec3 cloudColor = vec3(1.0, 1.0, 1.0);
              skyColor = mix(skyColor, cloudColor, cloudMask * 0.6);
              
              // Add sun glow
              vec2 sunPos = vec2(0.3, 0.7);
              float sunDist = distance(st, sunPos);
              float sunGlow = exp(-sunDist * 8.0);
              vec3 sunColor = vec3(1.0, 0.9, 0.7);
              skyColor += sunColor * sunGlow * 0.3;
              
              gl_FragColor = vec4(skyColor, 1.0);
            }
          `}
          uniforms={{
            time: { value: 0 }
          }}
        />
      </mesh>
    </group>
  );
};

export default Window;
