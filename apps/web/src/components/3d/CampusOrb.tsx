"use client";

import { useRef, useMemo, Suspense } from "react";

import { OrbitControls, Sphere, Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

/* ─── Neural Network Nodes ──────────────────────────── */
function NeuralNodes({ count = 60 }: { count?: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 0.8;
      pts.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return pts;
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.025 + Math.random() * 0.02, 8, 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#00D4FF" : i % 3 === 1 ? "#8B5CF6" : "#38F2B5"}
            emissive={i % 3 === 0 ? "#00D4FF" : i % 3 === 1 ? "#8B5CF6" : "#38F2B5"}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Floating Particle Field ───────────────────────── */
function ParticleField({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.03;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#00D4FF" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── Core Orb ──────────────────────────────────────── */
function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={ref} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#0066FF"
          emissive="#001133"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.85}
          distort={0.2}
          speed={2}
          wireframe
        />
      </Sphere>
      {/* Inner glow sphere */}
      <Sphere args={[0.95, 32, 32]}>
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.15}
          transparent
          opacity={0.12}
        />
      </Sphere>
    </Float>
  );
}

/* ─── Scene ─────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 3, 3]} intensity={0.8} color="#38F2B5" />
      <directionalLight position={[-3, -3, -3]} intensity={0.5} color="#FF7A18" />
      <pointLight position={[0, 0, 0]} intensity={1} color="#00D4FF" distance={5} />

      <Stars radius={40} depth={30} count={2000} factor={2} saturation={0} fade speed={0.5} />
      <ParticleField />
      <NeuralNodes />
      <CoreOrb />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

/* ─── Exported Component ────────────────────────────── */
export function CampusOrb() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-black/30 lg:h-[380px]">
      {/* Ambient border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-accent/10" />

      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
              <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-purple" style={{ animationDirection: "reverse" }} />
            </div>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
