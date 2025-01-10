import { create } from 'zustand';

// Animation variants
export const heroVariants = {
  initial: { 
    opacity: 0,
    x: "-100%",
    width: "30rem"
  },
  animate: { 
    opacity: 1,
    x: 0,
    width: "30rem",
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: {
      duration: 0.3
    }
  }
};

export const navigationVariants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    y: 20,
    opacity: 0
  }
};

export const optionsBarVariants = {
  initial: {
    y: "100%",
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

export const optionVariants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1
  },
  exit: {
    y: 20,
    opacity: 0
  }
};

type BokehElement = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
};

// Define possible application states
export type AppView = 'start' | 'navigation' | 'pong' | 'cube' | 'home';

interface AppState {
  // Core State
  currentView: AppView;
  previousView: AppView | null;
  isMenuVisible: boolean;

  // Bokeh State
  bokehElements: BokehElement[];

  // Actions
  navigateTo: (view: AppView) => void;
  goBack: () => void;
  toggleMenu: () => void;
  setBokehElements: (elements: BokehElement[]) => void;
  clearBokehElements: () => void;
  initializeBokehElements: () => void;
  updateBokehElements: () => void;
}

const createInitialBokehElements = (): BokehElement[] => {
  const colors = ["#ff7e5f", "#feb47b", "#7bc6cc", "#be93c5", "#7ed6df"];
  return Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 100 + 50,
    color: colors[Math.floor(Math.random() * colors.length)],
    velocity: {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    },
  }));
};

export const useStore = create<AppState>((set, get) => ({
  // Initial States
  currentView: 'start',
  previousView: null,
  isMenuVisible: true,
  bokehElements: createInitialBokehElements(),

  // Navigation Actions
  navigateTo: (view) => {
    const current = get().currentView;
    set({
      currentView: view,
      previousView: current,
      isMenuVisible: view !== 'start'
    });

    // Handle bokeh elements based on view
    if (view === 'start') {
      setTimeout(() => {
        set(state => ({
          bokehElements: createInitialBokehElements()
        }));
      }, 300);
    } else {
      set({ bokehElements: [] });
    }
  },

  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({
        currentView: previousView,
        previousView: null,
        isMenuVisible: previousView !== 'start'
      });

      if (previousView === 'start') {
        setTimeout(() => {
          set(state => ({
            bokehElements: createInitialBokehElements()
          }));
        }, 300);
      }
    }
  },

  toggleMenu: () => set(state => ({ isMenuVisible: !state.isMenuVisible })),

  // Bokeh related actions
  setBokehElements: (elements) => set({ bokehElements: elements }),
  clearBokehElements: () => set({ bokehElements: [] }),
  initializeBokehElements: () => set({ bokehElements: createInitialBokehElements() }),
  updateBokehElements: () => set((state) => ({
    bokehElements: state.bokehElements.map(element => {
      let newX = element.x + element.velocity.x;
      let newY = element.y + element.velocity.y;

      if (newX < 0 || newX > window.innerWidth) element.velocity.x *= -1;
      if (newY < 0 || newY > window.innerHeight) element.velocity.y *= -1;

      newX = Math.max(0, Math.min(window.innerWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight, newY));

      return {
        ...element,
        x: newX,
        y: newY,
      };
    })
  }))
}));

// Helper to check if back button should be shown
export const shouldShowBackButton = (view: AppView) => view !== 'start';

// Helper to get animation variants based on view
export const getAnimationVariants = (view: AppView) => {
  switch (view) {
    case 'start':
      return heroVariants;
    case 'navigation':
      return navigationVariants;
    // ... add other variants as needed
    default:
      return {};
  }
}; 