import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import './ThreeScene.scss';

function Cube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#7bc6cc" />
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
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Cube />
        <OrbitControls />
      </Canvas>
    </motion.div>
  );
} 