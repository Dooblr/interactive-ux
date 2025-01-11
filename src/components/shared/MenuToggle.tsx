import { motion } from 'framer-motion';
import './MenuToggle.scss';

interface MenuToggleProps {
  onClick: () => void;
  isVisible?: boolean;
}

export function MenuToggle({ onClick, isVisible = true }: MenuToggleProps) {
  return (
    <motion.button
      className="menu-toggle"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0.5 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Menu
    </motion.button>
  );
} 