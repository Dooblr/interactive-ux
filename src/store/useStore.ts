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
  z: number;
  size: number;
  baseSize: number;
  color: string;
  velocity: { x: number; y: number };
  pulseOffset: number;
  pulseSpeed: number;
  lifespan: number;
  opacity: number;
  angle: number;
  speed: number;
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
const themeColors = [
  // Reduced number of colors for simplicity
  'rgba(123, 198, 204, 0.2)',  // Cyan
  'rgba(254, 180, 123, 0.2)',  // Orange
  'rgba(190, 147, 197, 0.2)',  // Purple
];

const createBokehElement = (id: number): BokehElement => {
  const size = Math.random() * 150 + 100;  // Larger, softer circles
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.1 + Math.random() * 0.2;  // Much slower movement

  return {
    id,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: Math.random() * 200 - 100,
    size,
    baseSize: size,
    color: themeColors[Math.floor(Math.random() * themeColors.length)],
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    pulseOffset: Math.random() * Math.PI * 2,
    pulseSpeed: 0.0005 + Math.random() * 0.001,  // Slower pulsing
    lifespan: 30000 + Math.random() * 30000,  // Longer lifespan
    opacity: 0,
    angle,
    speed
  };
};

const createInitialBokehElements = (): BokehElement[] => {
  return Array.from({ length: 10 }, (_, i) => ({  // Fewer elements
    ...createBokehElement(i),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    opacity: 0.3
  }));
};

export const useStore = create<AppState>((set, get) => ({
  // Initial States
  currentView: 'start',
  previousView: null,
  viewHistory: ['start'],
  isMenuVisible: true,
  bokehElements: createInitialBokehElements(),
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
        set(state => ({
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
  updateBokehElements: () => set((state) => {
    const currentTime = Date.now();
    let bokehElements = state.bokehElements.filter(element => element.opacity > 0);

    // Maintain fewer elements
    if (bokehElements.length < 10) {
      const newId = Math.max(...bokehElements.map(e => e.id), 0) + 1;
      bokehElements.push(createBokehElement(newId));
    }

    // Get mouse position from state
    const { x: mouseX, y: mouseY } = state.mousePosition;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    return {
      bokehElements: bokehElements.map(element => {
        // More subtle direction changes
        const angleChange = (Math.random() - 0.5) * 0.01;
        const newAngle = element.angle + angleChange;
        const speedChange = (Math.random() - 0.5) * 0.005;
        const newSpeed = Math.max(0.1, Math.min(0.3, element.speed + speedChange));

        const newVelocity = {
          x: Math.cos(newAngle) * newSpeed,
          y: Math.sin(newAngle) * newSpeed,
        };

        // Calculate mouse influence for each element
        const mouseOffsetX = (mouseX - centerX) / centerX;
        const mouseOffsetY = (mouseY - centerY) / centerY;
        const zFactor = (element.z + 100) / 200;
        const mouseInfluence = 0.1 * zFactor;

        let newX = element.x + newVelocity.x + (mouseOffsetX * mouseInfluence);
        let newY = element.y + newVelocity.y + (mouseOffsetY * mouseInfluence);
        let newZ = element.z;

        // Gentle screen wrapping
        if (newX < -element.size) newX = window.innerWidth + element.size;
        if (newX > window.innerWidth + element.size) newX = -element.size;
        if (newY < -element.size) newY = window.innerHeight + element.size;
        if (newY > window.innerHeight + element.size) newY = -element.size;

        // Very subtle base animation
        const baseAnimation = Math.sin(currentTime * element.pulseSpeed + element.pulseOffset) * 0.01;
        let size = element.baseSize * (1 + baseAnimation);
        let glowIntensity = 0.2 + (baseAnimation * 1.5);

        // Additional effects when music is playing
        if (state.isAudioPlaying) {
          const musicBump = Math.sin(currentTime * element.pulseSpeed * 2 + element.pulseOffset) * 0.02;
          size *= (1 + musicBump);
          const glowVariation = Math.sin(currentTime * element.pulseSpeed * 0.5 + element.pulseOffset) * 0.1;
          glowIntensity += glowVariation;
        }

        // Keep glow intensity subtle
        glowIntensity = Math.max(0.1, Math.min(0.4, glowIntensity));

        return {
          ...element,
          x: newX,
          y: newY,
          z: newZ,
          size,
          opacity: element.opacity,
          angle: newAngle,
          speed: newSpeed,
          velocity: newVelocity,
          lifespan: element.lifespan - 16.67,
          color: element.color.replace(
            /rgba\((.*?),(.*?),(.*?),.*?\)/,
            `rgba($1,$2,$3,${glowIntensity})`
          )
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