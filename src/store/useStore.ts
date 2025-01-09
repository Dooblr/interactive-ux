import { create } from 'zustand';

interface AppState {
  showCube: boolean;
  setShowCube: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  showCube: false,
  setShowCube: (show) => set({ showCube: show }),
})); 