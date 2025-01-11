import { motion } from 'framer-motion';
import './LoadingScreen.scss';

interface LoadingScreenProps {
  progress: number;
  retryCount: number;
  onRetry?: () => void;
  error?: string | null;
}

export function LoadingScreen({ progress, retryCount, onRetry, error }: LoadingScreenProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  if (error) {
    return (
      <motion.div 
        className="loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loading-content error">
          <h3>{error}</h3>
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reload Scene
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="loading-content">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="progress-ring__circle-bg"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className="progress-ring__circle"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(123, 198, 204, 0.8)" />
              <stop offset="100%" stopColor="rgba(254, 180, 123, 0.8)" />
            </linearGradient>
          </defs>
        </svg>
        <p>Loading Assets {Math.round(progress)}%</p>
        {retryCount > 0 && (
          <span className="retry-count">Attempt {retryCount} of 5</span>
        )}
      </div>
    </motion.div>
  );
} 