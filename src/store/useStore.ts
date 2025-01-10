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
export type AppView = 'start' | 'navigation' | 'pong' | 'cube' | 'home' | 'audio';

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
  // Main theme colors
  'rgba(123, 198, 204, 0.4)',  // Cyan
  'rgba(254, 180, 123, 0.4)',  // Orange
  'rgba(190, 147, 197, 0.4)',  // Purple
  // Subtle variations
  'rgba(142, 214, 223, 0.4)',  // Light cyan
  'rgba(255, 166, 158, 0.4)',  // Coral
  'rgba(126, 214, 223, 0.4)',  // Turquoise
];

const createBokehElement = (id: number): BokehElement => {
  const size = Math.random() * 100 + 50;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.3 + Math.random() * 0.7;

  // Select a random theme color
  const color = themeColors[Math.floor(Math.random() * themeColors.length)];

  return {
    id,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: Math.random() * 200 - 100,
    size,
    baseSize: size,
    color,
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    pulseOffset: Math.random() * Math.PI * 2,
    pulseSpeed: 0.001 + Math.random() * 0.002,
    lifespan: 15000 + Math.random() * 15000,
    opacity: 0,
    angle,
    speed
  };
};

const createInitialBokehElements = (): BokehElement[] => {
  return Array.from({ length: 15 }, (_, i) => ({
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

    // Mouse influence calculations
    const mouseX = state.mousePosition.x;
    const mouseY = state.mousePosition.y;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const mouseOffsetX = (mouseX - centerX) / centerX;
    const mouseOffsetY = (mouseY - centerY) / centerY;

    // Always maintain 15 elements
    if (bokehElements.length < 15) {
      const newId = Math.max(...bokehElements.map(e => e.id), 0) + 1;
      bokehElements.push(createBokehElement(newId));
    }

    return {
      bokehElements: bokehElements.map(element => {
        // Natural movement - increased base speed
        const angleChange = (Math.random() - 0.5) * 0.03;  // Reduced for smoother turns
        const newAngle = element.angle + angleChange;
        const speedChange = (Math.random() - 0.5) * 0.01;  // Reduced for more consistent speed
        const newSpeed = Math.max(0.5, Math.min(1.5, element.speed + speedChange));  // Increased speed range

        const newVelocity = {
          x: Math.cos(newAngle) * newSpeed,
          y: Math.sin(newAngle) * newSpeed,
        };

        // Calculate new position with mouse influence
        const zFactor = (element.z + 100) / 200;
        const mouseInfluence = 0.3 * zFactor;  // Reduced mouse influence

        let newX = element.x + newVelocity.x + (mouseOffsetX * mouseInfluence);
        let newY = element.y + newVelocity.y + (mouseOffsetY * mouseInfluence);
        let newZ = element.z;

        // Screen wrapping with depth change
        if (newX < -element.size) {
          newX = window.innerWidth + element.size;
          newZ = Math.random() * 200 - 100;
        }
        if (newX > window.innerWidth + element.size) {
          newX = -element.size;
          newZ = Math.random() * 200 - 100;
        }
        if (newY < -element.size) {
          newY = window.innerHeight + element.size;
          newZ = Math.random() * 200 - 100;
        }
        if (newY > window.innerHeight + element.size) {
          newY = -element.size;
          newZ = Math.random() * 200 - 100;
        }

        // Calculate perspective scale based on depth
        const perspectiveScale = 1 + (element.z / 1000);

        // Base animation with theme-aware glow
        const baseAnimation = Math.sin(currentTime * element.pulseSpeed + element.pulseOffset) * 0.02;
        let size = element.baseSize * perspectiveScale * (1 + baseAnimation);
        
        // Extract original color values
        const matches = element.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (!matches) return element;

        const [_, r, g, b] = matches;
        let glowIntensity = 0.4 + (baseAnimation * 2); // Increased base opacity

        // Additional effects when music is playing
        if (state.isAudioPlaying) {
          const musicBump = Math.sin(currentTime * element.pulseSpeed * 2 + element.pulseOffset) * 0.03;
          size *= (1 + musicBump);
          const glowVariation = Math.sin(currentTime * element.pulseSpeed * 0.5 + element.pulseOffset) * 0.15;
          glowIntensity += glowVariation;
        }

        // Ensure glow intensity stays within reasonable bounds
        glowIntensity = Math.max(0.2, Math.min(0.8, glowIntensity));

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
          color: `rgba(${r}, ${g}, ${b}, ${glowIntensity})`
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