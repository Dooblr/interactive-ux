import { motion } from "framer-motion";
import { useStore, AppView, optionsBarVariants, optionVariants } from "../../store/useStore";
import "./OptionsBar.scss";

interface OptionsBarProps {
  onBackClick: () => void;
  onNavigate: (view: AppView) => void;
}

export function OptionsBar({ onBackClick, onNavigate }: OptionsBarProps) {
  const toggleMenu = useStore(state => state.toggleMenu);
  
  const options = [
    "Picture Cube",
    "Audio Player",
    "Branding",
    "Pong"
  ];

  const handleClick = (index: number) => {
    if (index === 0) {
      onNavigate('home');
      setTimeout(() => onNavigate('cube'), 0);
      return;
    }
    if (index === 1) onNavigate('audio');
    if (index === 2) {
      onNavigate('uxflow');
      toggleMenu();
    }
    if (index === 3) onNavigate('pong');
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