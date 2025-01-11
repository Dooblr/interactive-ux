import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DefaultLoadingManager, TextureLoader } from "three";
import "./ThreeScene.scss";

// Import all jpg files from assets directory
const imageContext = import.meta.glob("/src/assets/**/*.jpg", { eager: true });

function ImageGrid({
  textures,
  visible,
}: {
  textures: THREE.Texture[];
  visible: boolean;
}) {
  return (
    <group visible={visible}>
      {textures.map((texture, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = (col - 1) * 2.5;
        const y = -(row - 0.5) * 2.5;

        return (
          <mesh key={index} position={[x, y, 0]} scale={visible ? 1 : 0}>
            <planeGeometry args={[2, 2]} />
            <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

function Cube({
  onCubeReady,
}: {
  onCubeReady: (textures: THREE.Texture[]) => void;
}) {
  const textureUrls = Object.values(imageContext).map(
    (module) => (module as { default: string }).default
  );
  const textures = useLoader(TextureLoader, textureUrls);

  useEffect(() => {
    if (textures.length > 0) {
      onCubeReady(textures);
    }
  }, [textures, onCubeReady]);

  return (
    <group>
      {/* Front */}
      <mesh position={[0, 0, 1]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={textures[0]} side={THREE.DoubleSide} />
      </mesh>

      {/* Back */}
      <mesh position={[0, 0, -1]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={textures[1]} side={THREE.DoubleSide} />
      </mesh>

      {/* Right */}
      <mesh position={[1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={textures[2]} side={THREE.DoubleSide} />
      </mesh>

      {/* Left */}
      <mesh position={[-1, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={textures[3]} side={THREE.DoubleSide} />
      </mesh>

      {/* Top */}
      <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={textures[4]} side={THREE.DoubleSide} />
      </mesh>

      {/* Bottom */}
      <mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={textures[5]} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Grid
        renderOrder={-1}
        position={[0, -1.85, 0]}
        infiniteGrid
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#6f6f6f"
        sectionSize={2.4}
        sectionThickness={1.2}
        sectionColor="#9d4b4b"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />
    </>
  );
}

export function ThreeScene() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const cubeRef = useRef<THREE.Group>(null);
  const controlsRef = useRef(null);
  const mountedRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (!mountedRef.current) return;

    // Dispose textures
    textures.forEach((texture) => {
      texture.dispose();
    });
    setTextures([]);

    // Reset state
    setIsExpanded(false);
    setShowGrid(false);

    // Reset cube
    if (cubeRef.current) {
      cubeRef.current.scale.set(1, 1, 1);
      cubeRef.current.visible = true;
    }

    // Reset controls
    if (controlsRef.current) {
      (controlsRef.current as any).reset();
    }

    // Clear loading manager
    DefaultLoadingManager.onProgress = () => {};
    DefaultLoadingManager.onLoad = () => {};
    DefaultLoadingManager.onError = () => {};
  }, []);

  // Initialize component
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

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
      <Canvas
        camera={{ position: [4, 3, 4], fov: 50 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
      >
        <Suspense fallback={null}>
          <Scene />

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
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.5}
            makeDefault
            domElement={document.body}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
        </Suspense>
      </Canvas>

      <div className="controls">
        <button
          onClick={expandToGrid}
          disabled={isExpanded}
          className={isExpanded ? "disabled" : ""}
        >
          View Images
        </button>
        <button
          onClick={reconstructCube}
          disabled={!isExpanded}
          className={!isExpanded ? "disabled" : ""}
        >
          View Cube
        </button>
      </div>
    </motion.div>
  );
}
