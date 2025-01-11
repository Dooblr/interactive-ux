import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import './Branding.scss';

type Step = 'hero' | 'options' | 'detail';

export function Branding() {
  const [currentStep, setCurrentStep] = useState<Step>('hero');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleBeginClick = () => {
    setCurrentStep('options');
  };

  const handleBackClick = () => {
    setCurrentStep('options');
  };

  const options = [
    {
      title: "Personal Style",
      description: "Curated wardrobe essentials tailored to your taste",
      icon: "👔"
    },
    {
      title: "Seasonal Edit",
      description: "Stay ahead with our seasonal collections",
      icon: "🌸"
    },
    {
      title: "Sustainable Choice",
      description: "Eco-friendly fashion that makes a difference",
      icon: "🌿"
    }
  ];

  return (
    <motion.div 
      className="branding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {currentStep === 'hero' && (
          <motion.div 
            className="hero-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              x: '-100%',
              transition: { duration: 0.3 }
            }}
            key="hero"
          >
            <div className="hero-content">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ESSENCE
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Discover Your Style Journey
              </motion.p>
              <motion.button
                className="cta-button"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleBeginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Begin
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentStep === 'options' && (
          <motion.div 
            className="options-step"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ 
              opacity: 0,
              x: '-100%',
              transition: { duration: 0.3 }
            }}
            key="options"
          >
            <h2>Choose Your Path</h2>
            <div className="options-grid">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  className="option-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.2 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedOption(index);
                    setCurrentStep('detail');
                  }}
                >
                  <span className="icon">{option.icon}</span>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 'detail' && selectedOption !== null && (
          <motion.div 
            className="detail-step"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            key="detail"
          >
            <motion.button
              className="back-button"
              onClick={handleBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Back to Options
            </motion.button>

            <motion.div 
              className="detail-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="icon">{options[selectedOption].icon}</span>
              <h2>{options[selectedOption].title}</h2>
              <p className="description">{options[selectedOption].description}</p>
              <div className="features">
                <motion.div 
                  className="feature"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4>Personalized Experience</h4>
                  <p>Tailored to your unique preferences and style goals</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 