import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import { motion } from 'framer-motion';
import { Suspense, useState, useEffect } from 'react';
import { useLoadingManager } from './LoadingManager';
import './ThreeScene.scss';

// Import all jpg files from assets directory
const imageContext = import.meta.glob('/src/assets/**/*.jpg', { eager: true });

function LoadingFallback() {
  return (
    <Html center>
      <div className="loading">
        <span>Loading textures...</span>
      </div>
    </Html>
  );
}

function Cube() {
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  useLoadingManager((url) => setError(`Failed to load texture: ${url}`));

  useEffect(() => {
    // Get all image URLs from the context
    const urls = Object.keys(imageContext).map(path => path);
    
    // If we have less than 6 images, duplicate the last one to fill the cube
    const finalUrls = [...urls];
    while (finalUrls.length < 6) {
      finalUrls.push(urls[urls.length - 1]);
    }
    // If we have more than 6 images, take only the first 6
    setImageUrls(finalUrls.slice(0, 6));
  }, []);

  // Load available textures
  const textures = useLoader(TextureLoader, imageUrls);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#7bc6cc" />
      </mesh>
    );
  }

  return (
    <mesh rotation={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      {textures.map((texture, index) => (
        <meshStandardMaterial 
          key={index} 
          attach={`material-${index}`} 
          map={texture}
        />
      ))}
    </mesh>
  );
}

export function ThreeScene() {
  return (
    <motion.div 
      className="three-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Cube />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
} 