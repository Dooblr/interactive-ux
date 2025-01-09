import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import './Pong.scss';

interface PongProps {
  isActive: boolean;
  onToggleMenu: () => void;
  isMenuVisible: boolean;
}

interface GameState {
  paddleY: number;
  computerY: number;
  ballPos: { x: number; y: number };
  ballDirection: { x: number; y: number };
  ballSpeed: number;
}

export function Pong({ isActive, onToggleMenu, isMenuVisible }: PongProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const [score, setScore] = useState({ player: 0, computer: 0 });
  
  const [gameState, setGameState] = useState<GameState>({
    paddleY: 50,
    computerY: 50,
    ballPos: { x: 50, y: 50 },
    ballDirection: { x: 1, y: 1 },
    ballSpeed: 0.4
  });

  const INITIAL_BALL_SPEED = 0.4;
  const SPEED_INCREASE = 0.05;
  const MAX_BALL_SPEED = 1.2;
  const COMPUTER_SPEED = 0.3;
  const PADDLE_HEIGHT = 20;
  const PADDLE_WIDTH = 5;
  const BALL_SIZE = 1.5;

  const resetBall = useCallback((winner: 'player' | 'computer') => {
    setScore(prev => ({
      ...prev,
      [winner]: prev[winner] + 1
    }));

    // Randomize initial direction
    const randomY = (Math.random() - 0.5) * 2;
    setGameState(prev => ({
      ...prev,
      ballPos: { x: 50, y: 50 },
      ballDirection: {
        x: winner === 'player' ? 1 : -1,
        y: randomY
      },
      ballSpeed: INITIAL_BALL_SPEED
    }));
  }, []);

  const updateGame = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    setGameState(prev => {
      let newState = { ...prev };

      // Update ball position using current ball speed
      const newX = prev.ballPos.x + prev.ballDirection.x * prev.ballSpeed * deltaTime * 0.1;
      const newY = prev.ballPos.y + prev.ballDirection.y * prev.ballSpeed * deltaTime * 0.1;

      // Ball collisions with top and bottom
      if (newY <= BALL_SIZE || newY >= 100 - BALL_SIZE) {
        newState.ballDirection.y *= -1;
      }

      // Paddle collisions
      const paddleCollisionCheck = (x: number, paddleY: number, isPlayer: boolean) => {
        const paddleTop = paddleY - PADDLE_HEIGHT / 2;
        const paddleBottom = paddleY + PADDLE_HEIGHT / 2;
        
        if (newY >= paddleTop && newY <= paddleBottom) {
          const relativeIntersectY = (paddleY - newY) / (PADDLE_HEIGHT / 2);
          const bounceAngle = relativeIntersectY * 0.75;
          
          // Increase ball speed on paddle hit
          const newSpeed = Math.min(prev.ballSpeed + SPEED_INCREASE, MAX_BALL_SPEED);
          
          return {
            direction: {
              x: isPlayer ? Math.abs(prev.ballDirection.x) : -Math.abs(prev.ballDirection.x),
              y: -bounceAngle
            },
            speed: newSpeed
          };
        }
        return null;
      };

      // Player paddle collision
      if (newX <= PADDLE_WIDTH + BALL_SIZE) {
        const collision = paddleCollisionCheck(newX, prev.paddleY, true);
        if (collision) {
          newState.ballDirection = collision.direction;
          newState.ballSpeed = collision.speed;
        }
      }

      // Computer paddle collision
      if (newX >= 100 - PADDLE_WIDTH - BALL_SIZE) {
        const collision = paddleCollisionCheck(newX, prev.computerY, false);
        if (collision) {
          newState.ballDirection = collision.direction;
          newState.ballSpeed = collision.speed;
        }
      }

      // Scoring
      if (newX <= 0) {
        resetBall('computer');
        return prev;
      }
      if (newX >= 100) {
        resetBall('player');
        return prev;
      }

      // Update computer position - speed scales with ball speed
      const targetY = prev.ballPos.y;
      const computerDiff = targetY - prev.computerY;
      const computerMove = Math.sign(computerDiff) * 
        Math.min(Math.abs(computerDiff), 
          COMPUTER_SPEED * (prev.ballSpeed / INITIAL_BALL_SPEED) * deltaTime * 0.1);
      
      newState.computerY = Math.max(PADDLE_HEIGHT / 2, 
        Math.min(100 - PADDLE_HEIGHT / 2, prev.computerY + computerMove));

      // Update ball position
      newState.ballPos = { x: newX, y: newY };

      return newState;
    });

    frameRef.current = requestAnimationFrame(updateGame);
  }, [resetBall]);

  useEffect(() => {
    if (!isActive || !gameRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = gameRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
      const clampedY = Math.max(PADDLE_HEIGHT / 2, Math.min(100 - PADDLE_HEIGHT / 2, relativeY));
      
      setGameState(prev => ({
        ...prev,
        paddleY: clampedY
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    frameRef.current = requestAnimationFrame(updateGame);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isActive, updateGame]);

  return (
    <motion.div
      className="pong-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        className="menu-toggle"
        onClick={onToggleMenu}
        animate={{ opacity: isMenuVisible ? 0.5 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Menu
      </motion.button>
      
      <div className="pong-game" ref={gameRef}>
        <div className="score">
          <span>{score.player}</span>
          <span>{score.computer}</span>
        </div>
        <div 
          className="paddle player" 
          style={{ top: `${gameState.paddleY}%` }}
        />
        <div 
          className="paddle computer" 
          style={{ top: `${gameState.computerY}%` }}
        />
        <div 
          className="ball"
          style={{ 
            left: `${gameState.ballPos.x}%`,
            top: `${gameState.ballPos.y}%`
          }}
        />
      </div>
    </motion.div>
  );
} 