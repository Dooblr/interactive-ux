import { useRef, useEffect } from 'react';
import './AudioSpectrum.scss';

interface AudioSpectrumProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  analyserNode: AnalyserNode | null;
}

export function AudioSpectrum({ audioElement, isPlaying, analyserNode }: AudioSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(123, 198, 204, 0.8)');
    gradient.addColorStop(0.5, 'rgba(254, 180, 123, 0.8)');
    gradient.addColorStop(1, 'rgba(190, 147, 197, 0.8)');

    const draw = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyserNode]);

  return (
    <div className="audio-spectrum">
      <canvas 
        ref={canvasRef}
        width={300}
        height={100}
      />
    </div>
  );
} 