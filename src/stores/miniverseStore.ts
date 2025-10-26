import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Type definitions for the Miniverse configuration
export type ViewMode = "3d" | "2d";

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface ObjectConfig {
  id: string;
  position: Position;
  rotation?: number;
  color?: string;
  visible: boolean;
}

export interface PanelConfig {
  id: string;
  position: Position;
  size: [number, number, number];
  color: string;
  label: string;
  contentUrl?: string;
  visible: boolean;
}

export interface MiniverseConfig {
  walls: { color: string };
  floor: { color: string };
  objects: {
    chairs: ObjectConfig[];
    lamps: ObjectConfig[];
    plants: ObjectConfig[];
    table: ObjectConfig;
    bookshelf: ObjectConfig;
    reception: ObjectConfig;
  };
  panels: {
    [panelId: string]: PanelConfig;
  };
}

interface MiniverseState {
  // View mode
  viewMode: ViewMode;

  // Configuration
  config: MiniverseConfig;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  updateWallColor: (color: string) => void;
  updateFloorColor: (color: string) => void;
  updateObject: (
    type: keyof MiniverseConfig["objects"],
    objectId: string,
    updates: Partial<ObjectConfig>
  ) => void;
  updatePanel: (panelId: string, updates: Partial<PanelConfig>) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (jsonString: string) => boolean;
}

// Default configuration matching the current scene
const defaultConfig: MiniverseConfig = {
  walls: { color: "#e2e8f0" },
  floor: { color: "#2d3748" },
  objects: {
    chairs: [
      {
        id: "chair-1",
        position: { x: -1, y: 0, z: 7.5 },
        rotation: Math.PI,
        color: "#1f2937",
        visible: true,
      },
      {
        id: "chair-2",
        position: { x: 1, y: 0, z: 7.5 },
        rotation: Math.PI,
        color: "#1f2937",
        visible: true,
      },
      {
        id: "chair-3",
        position: { x: -6, y: 0, z: 4 },
        rotation: Math.PI / 2,
        color: "#1f2937",
        visible: true,
      },
      {
        id: "chair-4",
        position: { x: 6, y: 0, z: 4 },
        rotation: -Math.PI / 2,
        color: "#1f2937",
        visible: true,
      },
      {
        id: "chair-5",
        position: { x: -1, y: 0, z: 0.5 },
        rotation: 0,
        color: "#1f2937",
        visible: true,
      },
      {
        id: "chair-6",
        position: { x: 1, y: 0, z: 0.5 },
        rotation: 0,
        color: "#1f2937",
        visible: true,
      },
    ],
    lamps: [
      { id: "lamp-1", position: { x: -8, y: 0, z: 8 }, visible: true },
      { id: "lamp-2", position: { x: 8, y: 0, z: 8 }, visible: true },
    ],
    plants: [
      { id: "plant-1", position: { x: -10, y: 0, z: -5 }, visible: true },
      { id: "plant-2", position: { x: 10, y: 0, z: -5 }, visible: true },
    ],
    table: {
      id: "table-1",
      position: { x: 0, y: 0.8, z: 4 },
      color: "#1f2937",
      visible: true,
    },
    bookshelf: {
      id: "bookshelf-1",
      position: { x: -24.5, y: 3, z: -8 },
      color: "#4a2c1a",
      visible: true,
    },
    reception: {
      id: "reception-1",
      position: { x: -24, y: 0.5, z: 0 },
      color: "#3d2817",
      visible: true,
    },
  },
  panels: {
    "firm-videos": {
      id: "firm-videos",
      position: { x: -10, y: 3.5, z: -24.6 },
      size: [8, 5, 0.3],
      color: "#8b0000",
      label: "FIRM VIDEOS",
      visible: true,
    },
    "firm-artwork": {
      id: "firm-artwork",
      position: { x: 0, y: 3, z: -24.6 },
      size: [6, 4, 0.3],
      color: "#2d5016",
      label: "FIRM ARTWORK",
      visible: true,
    },
    "our-wall": {
      id: "our-wall",
      position: { x: 10, y: 3.5, z: -24.6 },
      size: [8, 5, 0.3],
      color: "#1e4d8b",
      label: "OUR WALL",
      visible: true,
    },
    "legal-materials": {
      id: "legal-materials",
      position: { x: -24.6, y: 3.5, z: 8 },
      size: [0.3, 5, 6],
      color: "#4a4a4a",
      label: "LEGAL MATERIALS",
      visible: true,
    },
    credits: {
      id: "credits",
      position: { x: 24.6, y: 3.5, z: -16 },
      size: [0.3, 3, 4],
      color: "#1e3a5f",
      label: "CREDITS",
      visible: true,
    },
    "idea-vault": {
      id: "idea-vault",
      position: { x: 24.6, y: 3.5, z: -11 },
      size: [0.3, 2.5, 3],
      color: "#ffd700",
      label: "IDEA VAULT",
      visible: true,
    },
    artwork: {
      id: "artwork",
      position: { x: 24.6, y: 3.8, z: -6 },
      size: [0.3, 4.5, 3.5],
      color: "#2d5016",
      label: "ARTWORK",
      visible: true,
    },
    "personal-images": {
      id: "personal-images",
      position: { x: 24.6, y: 3.5, z: 8 },
      size: [0.3, 5, 4],
      color: "#4a2c5f",
      label: "PERSONAL IMAGES",
      visible: true,
    },
  },
};

export const useMiniverseStore = create<MiniverseState>()(
  devtools(
    persist(
      (set, get) => ({
        viewMode: "3d",
        config: defaultConfig,

        setViewMode: mode => set({ viewMode: mode }),

        updateWallColor: color =>
          set(state => ({
            config: {
              ...state.config,
              walls: { ...state.config.walls, color },
            },
          })),

        updateFloorColor: color =>
          set(state => ({
            config: {
              ...state.config,
              floor: { ...state.config.floor, color },
            },
          })),

        updateObject: (type, objectId, updates) =>
          set(state => {
            if (
              type === "table" ||
              type === "bookshelf" ||
              type === "reception"
            ) {
              // Single objects
              return {
                config: {
                  ...state.config,
                  objects: {
                    ...state.config.objects,
                    [type]: { ...state.config.objects[type], ...updates },
                  },
                },
              };
            } else {
              // Array objects
              const objects = state.config.objects[type] as ObjectConfig[];
              const updatedObjects = objects.map(obj =>
                obj.id === objectId ? { ...obj, ...updates } : obj
              );
              return {
                config: {
                  ...state.config,
                  objects: {
                    ...state.config.objects,
                    [type]: updatedObjects,
                  },
                },
              };
            }
          }),

        updatePanel: (panelId, updates) =>
          set(state => ({
            config: {
              ...state.config,
              panels: {
                ...state.config.panels,
                [panelId]: { ...state.config.panels[panelId], ...updates },
              },
            },
          })),

        resetConfig: () => set({ config: defaultConfig }),

        exportConfig: () => {
          const state = get();
          return JSON.stringify(state.config, null, 2);
        },

        importConfig: jsonString => {
          try {
            const importedConfig = JSON.parse(jsonString) as MiniverseConfig;

            // Basic validation
            if (
              !importedConfig.walls ||
              !importedConfig.floor ||
              !importedConfig.objects ||
              !importedConfig.panels
            ) {
              return false;
            }

            set({ config: importedConfig });
            return true;
          } catch (error) {
            console.error("Failed to import configuration:", error);
            return false;
          }
        },
      }),
      {
        name: "miniverse-store",
        partialize: state => ({
          config: state.config,
        }),
      }
    ),
    { name: "MiniverseStore" }
  )
);
