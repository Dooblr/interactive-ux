import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { OptionsBar } from "./components/OptionsBar/OptionsBar";
import { Pong } from './components/Pong/Pong';
import { ThreeScene } from './components/ThreeScene/ThreeScene';
import { Home } from './components/Home/Home';
import { useStore, shouldShowBackButton, heroVariants } from "./store/useStore";
import "./App.scss";
import { AudioPlayer } from './components/AudioPlayer/AudioPlayer';
import { UXFlow } from './components/UXFlow/UXFlow';

function App() {
  const {
    currentView,
    bokehElements,
    isMenuVisible,
    navigateTo,
    goBack,
    initializeBokehElements,
    updateBokehElements,
    toggleMenu
  } = useStore();

  const isAudioPlaying = useStore(state => state.isAudioPlaying);
  const setMousePosition = useStore(state => state.setMousePosition);

  // Initialize bokeh elements
  useEffect(() => {
    if (currentView === 'start') {
      initializeBokehElements();
    }
  }, [currentView, initializeBokehElements]);

  // Bokeh animation
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      updateBokehElements();
      animationFrame = requestAnimationFrame(animate);
    };

    // Always animate
    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [updateBokehElements]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setMousePosition]);

  return (
    <div className="app-container">
      {/* Bokeh Background */}
      <div
        className="bokeh-container"
        style={{
          display: currentView === 'cube' ? 'none' : 'block'
        }}
      >
        {bokehElements?.map((element) => (
          <div
            key={element.id}
            className="bokeh"
            style={{
              width: element.size,
              height: element.size,
              background: element.color,
              transform: `translate(${element.x}px, ${element.y}px) translateZ(${element.size / 2}px)`,
            }}
          />
        ))}
      </div>

      {/* Start Screen */}
      <AnimatePresence mode="wait">
        {currentView === 'start' && (
          <motion.div
            className="hero-container"
            variants={heroVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="corner top-left" />
            <div className="corner top-right" />
            <div className="corner bottom-left" />
            <div className="corner bottom-right" />
            <h1>Interactive UI</h1>
            <motion.button
              className="begin-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('home')}
            >
              Begin
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <AnimatePresence>
        {isMenuVisible && currentView !== 'start' && (
          <OptionsBar 
            onBackClick={goBack}
            onNavigate={navigateTo}
          />
        )}
      </AnimatePresence>

      {/* Content Views */}
      <AnimatePresence>
        {currentView === 'home' && <Home />}
        {currentView === 'pong' && (
          <Pong 
            isActive={true}
            onToggleMenu={toggleMenu}
            isMenuVisible={isMenuVisible}
          />
        )}
        {currentView === 'cube' && <ThreeScene />}
        {currentView === 'audio' && <AudioPlayer />}
        {currentView === 'uxflow' && <UXFlow />}
      </AnimatePresence>

      {/* Back Button */}
      {shouldShowBackButton(currentView) && (
        <motion.button
          className="back-button"
          onClick={goBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          ←
        </motion.button>
      )}
    </div>
  );
}

export default App;
