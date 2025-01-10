import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import IndigoTrack from '../../assets/Indigo.mp3';
import './AudioPlayer.scss';
import { AudioSpectrum } from './AudioSpectrum';
import { Turntable } from './Turntable';
import { useStore } from '../../store/useStore';

interface AudioContextState {
  audioContext: AudioContext;
  sourceNode: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
}

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressAnimationRef = useRef<number>();
  const [audioContextState, setAudioContextState] = useState<AudioContextState | null>(null);
  const setAudioPlaying = useStore(state => state.setAudioPlaying);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      
      const handleLoadedMetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      };

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
      });

      // Initialize Web Audio API
      if (!audioContextState) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sourceNode = audioContext.createMediaElementSource(audioRef.current);
        const analyser = audioContext.createAnalyser();
        
        // Connect nodes
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);

        setAudioContextState({ audioContext, sourceNode, analyser });
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('error', () => {});
        }
        if (audioContextState?.audioContext) {
          audioContextState.audioContext.close();
        }
      };
    }
  }, []);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play().catch(e => {
          console.error('Error playing audio:', e);
        });
        setAudioPlaying(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioPlaying(false);
    }
  };

  const handleResume = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
      });
      setIsPlaying(true);
      setAudioPlaying(true);
    }
  };

  return (
    <motion.div 
      className="audio-player"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="content">
        <div className="corner top-left" />
        <div className="corner top-right" />
        <div className="corner bottom-left" />
        <div className="corner bottom-right" />
        
        <AudioSpectrum 
          audioElement={audioRef.current}
          isPlaying={isPlaying}
          analyserNode={audioContextState?.analyser || null}
        />
        <Turntable 
          isPlaying={isPlaying}
          progress={progress}
          onPause={handlePause}
          onResume={handleResume}
          sourceNode={audioContextState?.sourceNode || null}
          audioContext={audioContextState?.audioContext || null}
        />
        <div className="controls">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayback}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          
          <div className="progress-container" onClick={handleProgressClick}>
            <div 
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <audio 
          ref={audioRef} 
          src={IndigoTrack}
          preload="metadata"
        />
      </div>
    </motion.div>
  );
} 