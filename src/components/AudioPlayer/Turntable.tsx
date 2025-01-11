import { useRef, useEffect, useCallback } from 'react';
import './Turntable.scss';

interface TurntableProps {
  isPlaying: boolean;
  progress: number;
  onPause: () => void;
  onResume: () => void;
  sourceNode: MediaElementAudioSourceNode | null;
  audioContext: AudioContext | null;
}

export function Turntable({ 
  isPlaying,
  onPause, 
  onResume,
  sourceNode,
}: TurntableProps) {
  const turntableRef = useRef<HTMLDivElement>(null);
  const vinylRef = useRef<HTMLDivElement>(null);
  const wasPlayingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (vinylRef.current) {
      vinylRef.current.style.animationPlayState = isPlaying ? 'running' : 'paused';
    }
  }, [isPlaying]);

  const calculateRotation = (e: MouseEvent) => {
    if (!vinylRef.current) return 0;
    
    const rect = vinylRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angles
    const prevAngle = Math.atan2(
      lastMousePosRef.current.y - centerY,
      lastMousePosRef.current.x - centerX
    );
    const newAngle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    );
    
    // Update last position
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    
    return newAngle - prevAngle;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPlaying) {
      wasPlayingRef.current = true;
      onPause();
    }
    
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [isPlaying, onPause]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !vinylRef.current || !sourceNode) return;

    const rotation = calculateRotation(e);
    const currentRotation = parseFloat(vinylRef.current.style.transform?.match(/-?\d+\.?\d*/)?.[0] || '0');
    
    vinylRef.current.style.transform = `rotate(${currentRotation + (rotation * 180 / Math.PI)}deg)`;

    const speed = Math.abs(rotation * 180 / Math.PI) * 0.1;
    (sourceNode as any).playbackRate.value = rotation > 0 ? speed : -speed;
  }, [sourceNode]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (wasPlayingRef.current) {
      wasPlayingRef.current = false;
      
      // Reset playback rate before resuming
      if (sourceNode) {
        (sourceNode as any).playbackRate.value = 1;
      }
      
      onResume();
    }
  }, [onResume]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="turntable" ref={turntableRef}>
      <div className="platter">
        <div 
          className="vinyl" 
          ref={vinylRef}
          onMouseDown={handleMouseDown}
          style={{ transform: 'rotate(0deg)' }}
        >
          <div className="label">
            <span>Indigo</span>
          </div>
          <div className="grooves" />
        </div>
        <div className="spindle" />
      </div>
      <div className="tonearm">
        <div className="base" />
        <div className={`arm ${isPlaying ? 'playing' : ''}`}>
          <div className="head" />
        </div>
      </div>
    </div>
  );
} 