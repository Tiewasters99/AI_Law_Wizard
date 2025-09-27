import { create } from 'zustand';

export interface MiniverseState {
  // Modal states
  isMemoModalOpen: boolean;
  isBlogModalOpen: boolean;
  isBookModalOpen: boolean;
  
  // Control states
  controlsType: 'loading' | 'pointer-lock' | 'orbit';
  
  // Proximity states
  isNearPaper: boolean;
  isNearDesk: boolean;
  
  // Performance state
  dpr: number;
  
  // Music states
  isMusicEnabled: boolean;
  musicVolume: number;
  
  // Actions
  setMemoModalOpen: (open: boolean) => void;
  setBlogModalOpen: (open: boolean) => void;
  setBookModalOpen: (open: boolean) => void;
  setControlsType: (type: 'loading' | 'pointer-lock' | 'orbit') => void;
  setIsNearPaper: (near: boolean) => void;
  setIsNearDesk: (near: boolean) => void;
  setDpr: (dpr: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  
  // Combined actions
  openMemoModal: () => void;
  closeMemoModal: () => void;
  openBlogModal: () => void;
  closeBlogModal: () => void;
  openBookModal: () => void;
  closeBookModal: () => void;
  toggleMusic: () => void;
}

export const useMiniverseStore = create<MiniverseState>((set) => ({
  // Initial state
  isMemoModalOpen: false,
  isBlogModalOpen: false,
  isBookModalOpen: false,
  controlsType: 'loading',
  isNearPaper: false,
  isNearDesk: false,
  dpr: 1.5,
  isMusicEnabled: true, // Start with music enabled
  musicVolume: 0.3, // Moderate volume (30%)
  
  // Basic setters
  setMemoModalOpen: (open) => set({ isMemoModalOpen: open }),
  setBlogModalOpen: (open) => set({ isBlogModalOpen: open }),
  setBookModalOpen: (open) => set({ isBookModalOpen: open }),
  setControlsType: (type) => set({ controlsType: type }),
  setIsNearPaper: (near) => set({ isNearPaper: near }),
  setIsNearDesk: (near) => set({ isNearDesk: near }),
  setDpr: (dpr) => set({ dpr }),
  setMusicEnabled: (enabled) => set({ isMusicEnabled: enabled }),
  setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
  
  // Combined actions
  openMemoModal: () => set({ isMemoModalOpen: true }),
  closeMemoModal: () => set({ isMemoModalOpen: false }),
  openBlogModal: () => set({ isBlogModalOpen: true }),
  closeBlogModal: () => set({ isBlogModalOpen: false }),
  openBookModal: () => set({ isBookModalOpen: true }),
  closeBookModal: () => set({ isBookModalOpen: false }),
  toggleMusic: () => set((state) => ({ isMusicEnabled: !state.isMusicEnabled })),
}));
