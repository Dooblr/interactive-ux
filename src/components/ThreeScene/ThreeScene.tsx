import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import { motion } from 'framer-motion';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useLoadingManager } from './LoadingManager';
import './ThreeScene.scss';
import * as THREE from 'three';

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

function ImageGrid({ textures, visible }: { textures: THREE.Texture[], visible: boolean }) {
  return (
    <group visible={visible}>
      {textures.map((texture, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = (col - 1) * 2.5;
        const y = -(row - 0.5) * 2.5;

        return (
          <mesh
            key={index}
            position={[x, y, 0]}
            scale={visible ? 1 : 0}
          >
            <planeGeometry args={[2, 2]} />
            <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

function Cube({ onCubeReady }: { onCubeReady: (textures: THREE.Texture[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  useLoadingManager((url) => setError(`Failed to load texture: ${url}`));

  useEffect(() => {
    const urls = Object.keys(imageContext).map(path => path);
    const finalUrls = [...urls];
    while (finalUrls.length < 6) {
      finalUrls.push(urls[urls.length - 1]);
    }
    setImageUrls(finalUrls.slice(0, 6));
  }, []);

  const textures = useLoader(TextureLoader, imageUrls);
  
  useEffect(() => {
    if (textures.length === 6) {
      onCubeReady(textures);
    }
  }, [textures, onCubeReady]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#7bc6cc" />
      </mesh>
    );
  }

  return (
    <mesh>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const cubeRef = useRef<THREE.Group>();
  const controlsRef = useRef<OrbitControls>();

  const handleCubeReady = useCallback((loadedTextures: THREE.Texture[]) => {
    setTextures(loadedTextures);
  }, []);

  const expandToGrid = async () => {
    if (isExpanded) return;

    // 1. Collapse cube to origin
    if (cubeRef.current) {
      const duration = 500;
      const startTime = Date.now();
      const startScale = { ...cubeRef.current.scale };

      function collapseCube() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        if (cubeRef.current) {
          cubeRef.current.scale.set(
            startScale.x * (1 - eased),
            startScale.y * (1 - eased),
            startScale.z * (1 - eased)
          );
        }

        if (progress < 1) {
          requestAnimationFrame(collapseCube);
        } else {
          // 2. Hide cube and show grid
          if (cubeRef.current) cubeRef.current.visible = false;
          setShowGrid(true);
        }
      }

      collapseCube();
    }

    setIsExpanded(true);
  };

  const reconstructCube = () => {
    if (!isExpanded) return;

    setShowGrid(false);
    
    if (cubeRef.current) {
      cubeRef.current.visible = true;
      const duration = 500;
      const startTime = Date.now();

      function expandCube() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = Math.pow(progress, 3);
        
        if (cubeRef.current) {
          cubeRef.current.scale.set(eased, eased, eased);
        }

        if (progress < 1) {
          requestAnimationFrame(expandCube);
        }
      }

      expandCube();
    }

    setIsExpanded(false);
  };

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
          
          <group ref={cubeRef}>
            <Cube onCubeReady={handleCubeReady} />
          </group>
          
          <ImageGrid textures={textures} visible={showGrid} />
          
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            autoRotate={!isExpanded}
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>

      <div className="controls">
        <button 
          onClick={expandToGrid}
          disabled={isExpanded}
          className={isExpanded ? 'disabled' : ''}
        >
          View Images
        </button>
        <button 
          onClick={reconstructCube}
          disabled={!isExpanded}
          className={!isExpanded ? 'disabled' : ''}
        >
          View Cube
        </button>
      </div>
    </motion.div>
  );
} 