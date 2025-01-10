import { motion } from "framer-motion";
import { useStore, AppView, optionsBarVariants, optionVariants } from "../../store/useStore";
import "./OptionsBar.scss";

interface OptionsBarProps {
  onBackClick: () => void;
  onNavigate: (view: AppView) => void;
}

export function OptionsBar({ onBackClick, onNavigate }: OptionsBarProps) {
  const options = [
    "Play Pong",
    "View Cube",
    "Modus Arena (3D Game)",
    "Option 5"
  ];

  const handleClick = (index: number) => {
    if (index === 0) onNavigate('pong');
    if (index === 1) onNavigate('cube');
    if (index === 2) window.open('https://modusarena.web.app/', '_blank');
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
          className="option-button"
          variants={optionVariants}
          onClick={() => handleClick(index)}
        >
          {option}
        </motion.button>
      ))}
    </motion.div>
  );
} 