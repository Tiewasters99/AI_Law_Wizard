import React from "react";
import { Chair } from "./Chair";
import { createTextTexture } from "../utils/textureHelpers";
import { TABLE_ITEMS, DESK_ITEMS } from "../utils/constants";

interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

interface FurnitureProps {
  config: {
    objects: {
      table: {
        position: { x: number; y: number; z: number };
        color?: string;
        visible: boolean;
      };
      chairs: Array<{
        id: string;
        position: { x: number; y: number; z: number };
        rotation?: number;
        visible: boolean;
      }>;
      bookshelf: {
        position: { x: number; y: number; z: number };
        color?: string;
        visible: boolean;
      };
      reception: {
        position: { x: number; y: number; z: number };
        color?: string;
        visible: boolean;
      };
    };
  };
  onItemClick: (userData: UserData) => void;
}

export const Furniture: React.FC<FurnitureProps> = ({
  config,
  onItemClick,
}) => {
  const handleClick = (e: any, userData: UserData) => {
    e.stopPropagation();
    if (userData.interactive) {
      onItemClick(userData);
    }
  };

  // Text textures
  const firmLibraryTexture = createTextTexture("FIRM LIBRARY", 50, "#ffffff");
  const receptionBrandTexture = createTextTexture(
    "QUAINTON LAW MINIVERSE™",
    50
  );
  const receptionTexture = createTextTexture("RECEPTION", 60, "#000000");
  const firmDocsTexture = createTextTexture(
    "Firm Documents Below",
    60,
    "#000000"
  );

  return (
    <group>
      {/* Conference Table - current colors, temp.js dimensions */}
      {config.objects.table.visible && (
        <mesh
          position={[
            config.objects.table.position.x,
            config.objects.table.position.y,
            config.objects.table.position.z,
          ]}
        >
          <boxGeometry args={[10, 0.2, 5]} />
          <meshStandardMaterial
            color={config.objects.table.color || "#1f2937"}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      )}

      {/* Table Items */}
      {TABLE_ITEMS.map(item => (
        <group key={item.label}>
          <mesh
            position={[item.x, 1, item.z]}
            onClick={e =>
              handleClick(e, {
                type: "tableItem",
                label: item.label,
                interactive: true,
              })
            }
          >
            <boxGeometry args={[0.5, 0.05, 0.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh
            position={[item.x, 1.03, item.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.4, 0.1]} />
            <meshBasicMaterial
              map={createTextTexture(item.label, 30)}
              transparent
            />
          </mesh>
        </group>
      ))}

      {/* Enhanced Chairs - aligned with table spacing, all facing table */}
      {config.objects.chairs.map(chair =>
        chair.visible ? (
          <Chair
            key={chair.id}
            position={[chair.position.x, chair.position.y, chair.position.z]}
            rotation={chair.rotation || 0}
          />
        ) : null
      )}

      {/* Bookshelf on Left Wall */}
      {config.objects.bookshelf.visible && (
        <mesh
          position={[
            config.objects.bookshelf.position.x,
            config.objects.bookshelf.position.y,
            config.objects.bookshelf.position.z,
          ]}
        >
          <boxGeometry args={[0.4, 6, 8]} />
          <meshStandardMaterial
            color={config.objects.bookshelf.color || "#4a2c1a"}
          />
        </mesh>
      )}

      {firmLibraryTexture && (
        <mesh position={[-24.3, 5.5, -8]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6, 1.5]} />
          <meshBasicMaterial map={firmLibraryTexture} transparent />
        </mesh>
      )}

      {/* Reception Desk */}
      {config.objects.reception.visible && (
        <mesh
          position={[
            config.objects.reception.position.x,
            config.objects.reception.position.y,
            config.objects.reception.position.z,
          ]}
        >
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial
            color={config.objects.reception.color || "#3d2817"}
          />
        </mesh>
      )}

      {/* Receptionist */}
      <mesh position={[-24, 1.8, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.5, 16]} />
        <meshStandardMaterial color={0x2c5f8d} />
      </mesh>
      <mesh position={[-24, 2.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={0xffdbac} />
      </mesh>

      {/* Reception Labels */}
      {receptionBrandTexture && (
        <mesh position={[-24, 6.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial map={receptionBrandTexture} transparent />
        </mesh>
      )}

      {receptionTexture && (
        <mesh position={[-24, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5, 1.2]} />
          <meshBasicMaterial map={receptionTexture} transparent />
        </mesh>
      )}

      {firmDocsTexture && (
        <mesh position={[-24, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6, 1.5]} />
          <meshBasicMaterial map={firmDocsTexture} transparent />
        </mesh>
      )}

      {/* Desk Items */}
      {DESK_ITEMS.map(item => (
        <group key={item.label}>
          <mesh
            position={[-24, 1.03, item.z]}
            rotation={[-Math.PI / 8, 0, 0]}
            onClick={e =>
              handleClick(e, {
                type: "deskItem",
                label: item.label,
                interactive: true,
              })
            }
          >
            <boxGeometry args={[0.4, 0.04, 0.5]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh
            position={[-24, 1.05, item.z]}
            rotation={[-Math.PI / 2.3, 0, 0]}
          >
            <planeGeometry args={[0.35, 0.08]} />
            <meshBasicMaterial
              map={createTextTexture(item.label, 35)}
              transparent
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
