import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// Performance optimized v3 — reduced geometry, fewer objects, lower DPR

function GlassOrb({ position, color, scale = 1 }: { position: [number, number, number], color: string, scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.6;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.85}
          transparent
          opacity={0.75}
        />
      </mesh>
    </Float>
  );
}

function WobbleTorus({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.8, 0.35, 12, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const particlesCount = 50;

  const particles = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#a78bfa" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#a78bfa" />
      <pointLight position={[-10, -5, -10]} intensity={0.6} color="#6366f1" />
      
      <GlassOrb position={[-3.5, 1.5, -2]} color="#8b5cf6" scale={0.8} />
      <GlassOrb position={[3, -1, -1]} color="#06b6d4" scale={0.6} />
      
      <WobbleTorus position={[-2, -2.5, 0.5]} color="#c084fc" />
      
      <ParticleField />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2} 
        minPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-cyan-900/30 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-violet-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-cyan-500/15 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}

export default function Hero3D() {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) return <WebGLFallback />;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        frameloop="demand"
        onCreated={({ gl, invalidate }) => {
          if (!gl) setWebglSupported(false);
          // Use a throttled render loop instead of continuous
          let rafId: number;
          const loop = () => {
            invalidate();
            rafId = requestAnimationFrame(loop);
          };
          // Run at ~30fps to save GPU
          const interval = setInterval(() => invalidate(), 33);
          return () => {
            cancelAnimationFrame(rafId);
            clearInterval(interval);
          };
        }}
      >
        <Scene3D />
      </Canvas>
    </div>
  );
}
