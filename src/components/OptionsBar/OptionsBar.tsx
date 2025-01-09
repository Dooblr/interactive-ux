import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import "./OptionsBar.scss";

const BackArrow = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

interface OptionsBarProps {
  onBackClick: () => void;
  onPongClick: () => void;
}

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
  }
};

export function OptionsBar({ onBackClick, onPongClick }: OptionsBarProps) {
  const setShowCube = useStore(state => state.setShowCube);

  const options = [
    <BackArrow key="back" />,
    "Play Pong",
    "View Cube",
    "Option 4",
    "Option 5"
  ];

  const handleClick = (index: number) => {
    if (index === 0) onBackClick();
    if (index === 1) onPongClick();
    if (index === 2) setShowCube(true);
  };

  return (
    <motion.div
      className="options-bar"
      variants={optionsBarVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {options.map((option, index) => (
        <motion.button
          key={index}
          className={`option-button ${index === 0 ? 'back-button' : ''}`}
          variants={optionVariants}
          onClick={() => handleClick(index)}
        >
          {option}
        </motion.button>
      ))}
    </motion.div>
  );
} 