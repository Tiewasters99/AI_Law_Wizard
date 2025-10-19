export interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface ObjectConfig {
  id: string;
  position: Position;
  rotation?: number;
  visible: boolean;
  color?: string;
}

export interface PanelConfig {
  position: Position;
  size: [number, number, number];
  color: string;
  label: string;
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
