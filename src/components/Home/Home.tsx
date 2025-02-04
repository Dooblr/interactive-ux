import { motion } from 'framer-motion';
import './Home.scss';

export function Home() {
  return (
    <motion.div 
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="content">
        <div className="corner top-left" />
        <div className="corner top-right" />
        <div className="corner bottom-left" />
        <div className="corner bottom-right" />
        <h1>Dan Feinstein Web Design</h1>
        <p>Explore a collection of interactive experiences built with modern web technologies. 
           Use the menu below to navigate through different examples.</p>
      </div>
    </motion.div>
  );
} 