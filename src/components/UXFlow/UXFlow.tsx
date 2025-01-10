import { motion } from 'framer-motion';
import { useState } from 'react';
import './UXFlow.scss';

interface Card {
  id: number;
  title: string;
  content: string;
}

export function UXFlow() {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const cards: Card[] = [
    { id: 1, title: "Step 1", content: "Configure your preferences" },
    { id: 2, title: "Step 2", content: "Select your options" },
    { id: 3, title: "Step 3", content: "Complete setup" }
  ];

  return (
    <motion.div 
      className="ux-flow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-wrapper">
          {/* Front of card */}
          <motion.div 
            className="flow-container front"
            animate={{ 
              rotateY: isFlipped ? 180 : 0,
              scale: isFlipped ? 0.8 : 1,
              zIndex: isFlipped ? 1 : 2
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <h2>Example UX Flow</h2>
            <motion.button
              className="start-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFlipped(true)}
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Back of card (3 cards) */}
          <motion.div 
            className={`cards-row back ${isFlipped ? 'visible' : ''}`}
            initial={{ rotateY: -180 }}
            animate={{ 
              rotateY: isFlipped ? 0 : -180,
              scale: isFlipped ? 1 : 0.8,
              zIndex: isFlipped ? 2 : 1
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {cards.map((card, index) => (
              <motion.div 
                key={card.id}
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                animate={isFlipped ? { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.3 + index * 0.1 }
                } : {}}
              >
                <h3>{card.title}</h3>
                <p>{card.content}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 