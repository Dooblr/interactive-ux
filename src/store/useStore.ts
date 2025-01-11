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
export type AppView = 'start' | 'navigation' | 'pong' | 'cube' | 'home' | 'audio' | 'uxflow';

interface AppState {
  // Core State
  currentView: AppView;
  previousView: AppView | null;
  viewHistory: AppView[];
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
  isAudioPlaying: boolean;
  setAudioPlaying: (isPlaying: boolean) => void;
  mousePosition: { x: number; y: number };
  setMousePosition: (x: number, y: number) => void;
}

// Theme colors with variations
export const themeColors = {
  primary: {
    cyan: 'rgba(123, 198, 204, 0.3)',     // #7bc6cc
    orange: 'rgba(254, 180, 123, 0.3)',    // #feb47b
    purple: 'rgba(190, 147, 197, 0.3)',    // #be93c5
  },
  gradients: {
    primary: 'linear-gradient(90deg, rgba(123, 198, 204, 0.8), rgba(254, 180, 123, 0.8))',
    secondary: 'linear-gradient(90deg, rgba(254, 180, 123, 0.8), rgba(190, 147, 197, 0.8))',
    full: 'linear-gradient(90deg, rgba(123, 198, 204, 0.8) 0%, rgba(254, 180, 123, 0.8) 50%, rgba(190, 147, 197, 0.8) 100%)'
  }
};

// Helper function to create a single bokeh element
const createBokehElement = (id: number): BokehElement => {
  const size = Math.random() * 100 + 50; // Size between 50-150px
  const colors = [
    themeColors.primary.cyan,
    themeColors.primary.orange,
    themeColors.primary.purple
  ];
  
  return {
    id,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size,
    color: colors[Math.floor(Math.random() * colors.length)],
    velocity: {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5
    }
  };
};

// Create initial bokeh elements
const createInitialBokehElements = (): BokehElement[] => {
  return Array.from({ length: 15 }, (_, i) => createBokehElement(i));
};

export const useStore = create<AppState>((set, get) => ({
  // Initial States
  currentView: 'start',
  previousView: null,
  viewHistory: ['start'],
  isMenuVisible: true,
  bokehElements: [],
  isAudioPlaying: false,
  mousePosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },

  // Navigation Actions
  navigateTo: (view) => {
    const current = get().currentView;
    const history = get().viewHistory;

    set({
      currentView: view,
      previousView: current,
      viewHistory: [...history, view],
      isMenuVisible: view !== 'start'
    });

    // Only clear bokeh elements for cube view, maintain for home
    if (view === 'start') {
      setTimeout(() => {
        set(() => ({
          bokehElements: createInitialBokehElements()
        }));
      }, 300);
    } else if (view === 'cube') {
      set({ bokehElements: [] });
    }
  },

  goBack: () => {
    const { viewHistory } = get();
    
    if (viewHistory.length > 1) {
      const newHistory = viewHistory.slice(0, -1);
      const previousView = newHistory[newHistory.length - 1];
      
      set({
        currentView: previousView,
        previousView: null,
        viewHistory: newHistory,
        isMenuVisible: previousView !== 'start'
      });

      // Only reinitialize bokeh for start view
      if (previousView === 'start') {
        setTimeout(() => {
          set(() => ({
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
  initializeBokehElements: () => {
    set({ bokehElements: createInitialBokehElements() });
  },
  updateBokehElements: () => set((state) => {
    return {
      bokehElements: state.bokehElements.map(element => {
        // Simple boundary checking and position updates
        let newX = element.x + element.velocity.x;
        let newY = element.y + element.velocity.y;

        // Wrap around screen edges
        if (newX < -element.size) newX = window.innerWidth + element.size;
        if (newX > window.innerWidth + element.size) newX = -element.size;
        if (newY < -element.size) newY = window.innerHeight + element.size;
        if (newY > window.innerHeight + element.size) newY = -element.size;

        return {
          ...element,
          x: newX,
          y: newY
        };
      })
    };
  }),

  setAudioPlaying: (isPlaying) => set({ isAudioPlaying: isPlaying }),

  setMousePosition: (x, y) => set({ mousePosition: { x, y } })
}));

// Helper to check if back button should be shown
export const shouldShowBackButton = (view: AppView) => {
  const state = useStore.getState();
  return view !== 'start' && state.viewHistory.length > 1;
};

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