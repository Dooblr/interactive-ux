import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import "./App.scss";
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer";
import { Branding } from "./components/Branding/Branding";
import { Home } from "./components/Home/Home";
import { OptionsBar } from "./components/OptionsBar/OptionsBar";
import { Pong } from "./components/Pong/Pong";
import { MenuToggle } from "./components/shared/MenuToggle";
import { ThreeScene } from "./components/ThreeScene/ThreeScene";
import { heroVariants, shouldShowBackButton, useStore } from "./store/useStore";

function App() {
  const {
    currentView,
    bokehElements,
    isMenuVisible,
    navigateTo,
    goBack,
    initializeBokehElements,
    updateBokehElements,
    toggleMenu,
  } = useStore();
  const setMousePosition = useStore((state) => state.setMousePosition);
  const animationFrameRef = useRef<number>();

  // Initialize bokeh elements
  useEffect(() => {
    initializeBokehElements();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeBokehElements]);

  // Bokeh animation with stable frame timing
  useEffect(() => {
    let lastTime = performance.now();
    const fps = 60;
    const frameInterval = 1000 / fps;

    const animate = (currentTime: number) => {
      if (currentView === "cube") return;

      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        lastTime = currentTime;
        updateBokehElements();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [updateBokehElements, currentView]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [setMousePosition]);

  return (
    <div className="app-container">
      <div
        className="bokeh-container"
        style={{
          opacity: currentView === "cube" ? 0 : 1,
          transition: "opacity 0.3s ease-out",
        }}
      >
        {bokehElements?.map((element) => (
          <div
            key={element.id}
            className="bokeh"
            style={{
              width: element.size,
              height: element.size,
              transform: `translate(${element.x}px, ${element.y}px)`,
              background: element.color,
            }}
          />
        ))}
      </div>

      {/* Start Screen */}
      <AnimatePresence mode="wait">
        {currentView === "start" && (
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
            <h1>Interactive UX</h1>
            <motion.button
              className="begin-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo("home")}
            >
              Begin
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <AnimatePresence>
        {isMenuVisible && currentView !== "start" && (
          <OptionsBar onBackClick={goBack} onNavigate={navigateTo} />
        )}
      </AnimatePresence>

      {/* Content Views */}
      <AnimatePresence>
        {currentView === "home" && <Home />}
        {currentView === "pong" && (
          <Pong
            isActive={true}
            onToggleMenu={toggleMenu}
            isMenuVisible={isMenuVisible}
          />
        )}
        {currentView === "cube" && <ThreeScene />}
        {currentView === "audio" && <AudioPlayer />}
        {currentView === "uxflow" && (
          <>
            <MenuToggle onClick={toggleMenu} />
            <Branding />
          </>
        )}
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
          <span>←</span>
        </motion.button>
      )}
    </div>
  );
}

export default App;
