// Music tracks are now managed by user's personal collection
// See musicStorage.ts for user track management

// Book titles for the bookshelf
export const BOOK_TITLES = [
  "Agentic Theory",
  "Agentic AI and Law",
  "Law's Empire",
  "Russia Company",
  "Superintelligence",
  "Alignment Problem",
  "Liberation Theologies",
  "You Might be a Robot",
  "Black Box Society",
  "AI Legal Personhood",
  "Unknowable Unknown",
  "Logical Calculus",
  "Augmenting LLMs",
  "Read Me",
  "Explore Me",
  "Check Me Out",
  "Read Me",
  "Explore Me",
  "Check Me Out",
  "Read Me",
  "Explore Me",
  "Check Me Out",
  "Read Me",
  "Explore Me",
  "Check Me Out",
] as const;

// Table items for conference table
export const TABLE_ITEMS = [
  { label: "Leave Review", x: -3, z: 4 },
  { label: "Our Website", x: -1, z: 4 },
  { label: "Other Sites", x: 1, z: 4 },
  { label: "Pro Bono", x: 3, z: 4 },
] as const;

// Desk items for reception desk
export const DESK_ITEMS = [
  { label: "Engagement Letters", z: -0.6 },
  { label: "Firm Brochure", z: -0.1 },
  { label: "NDAs", z: 0.4 },
] as const;

// Camera and movement constants
export const CAMERA_SETTINGS = {
  position: [0, 1.6, 12] as [number, number, number],
  fov: 75,
  moveSpeed: 0.12,
  boundary: {
    minX: -23,
    maxX: 23,
    minZ: -23,
    maxZ: 23,
    y: 1.6,
  },
} as const;

// Room dimensions
export const ROOM_DIMENSIONS = {
  size: 50,
  halfSize: 25,
  wallThickness: 0.5,
  ceilingHeight: 10,
} as const;

// Profile panel count
export const PROFILE_PANEL_COUNT = 6;

// Profile panel positions
export const PROFILE_POSITIONS = [-15, -9, -3, 3, 9, 15] as const;
