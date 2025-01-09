import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./App.scss";

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [bokehElements, setBokehElements] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      velocity: { x: number; y: number };
    }>
  >([]);

  // Create initial bokeh elements
  useEffect(() => {
    const colors = ["#ff7e5f", "#feb47b", "#7bc6cc", "#be93c5", "#7ed6df"];
    const elements = Array.from({ length: 15 }, (_, i) => ({
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
    setBokehElements(elements);
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate bokeh elements
  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setBokehElements((prevElements) => {
        return prevElements.map((element) => {
          let newX = element.x + element.velocity.x;
          let newY = element.y + element.velocity.y;

          // Bounce off walls
          if (newX < 0 || newX > window.innerWidth) element.velocity.x *= -1;
          if (newY < 0 || newY > window.innerHeight) element.velocity.y *= -1;

          // Keep within bounds
          newX = Math.max(0, Math.min(window.innerWidth, newX));
          newY = Math.max(0, Math.min(window.innerHeight, newY));

          return {
            ...element,
            x: newX,
            y: newY,
          };
        });
      });
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const perspective = `
    perspective(1000px)
    rotateX(${mousePosition.y * -10}deg)
    rotateY(${mousePosition.x * 10}deg)
  `;

  const heroVariants = {
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
    collapsed: {
      x: "-100%",
      width: "4rem",
      transition: {
        width: { duration: 0.3 },
        x: { type: "spring", stiffness: 400, damping: 40 }
      }
    }
  };

  const optionsBarVariants = {
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

  const optionVariants = {
    initial: {
      y: 20,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1
    }
  };

  const handleBeginClick = () => {
    setIsCollapsed(true);
    setTimeout(() => setShowOptions(true), 500); // Show options after hero collapses
  };

  const handleBackClick = () => {
    setShowOptions(false);
    setTimeout(() => setIsCollapsed(false), 300); // Expand hero after options hide
  };

  const options = ["Back", "Option 2", "Option 3", "Option 4", "Option 5"];

  return (
    <div className="app-container">
      <div
        className="bokeh-container"
        style={{
          transform: perspective,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        {bokehElements.map((element) => (
          <div
            key={element.id}
            className="bokeh"
            style={{
              width: element.size,
              height: element.size,
              background: element.color,
              transform: `translate(${element.x}px, ${
                element.y
              }px) translateZ(${element.size / 2}px)`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="hero-container"
          variants={heroVariants}
          initial="initial"
          animate={isCollapsed ? "collapsed" : "animate"}
        >
          <h1>Interactive UI</h1>
          <motion.button
            className="begin-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBeginClick}
          >
            Begin
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            className="options-bar"
            variants={optionsBarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {options.map((option, index) => (
              <motion.button
                key={option}
                className="option-button"
                variants={optionVariants}
                onClick={index === 0 ? handleBackClick : undefined}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
