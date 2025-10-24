import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, Float, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function FloatingLogo() {
  const meshRef = React.useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <MeshDistortMaterial
          color="#00d4aa"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      <Text
        position={[0, -3, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-bold.woff"
      >
        AetherLock
      </Text>
    </Float>
  )
}

export const FloatingLogoCanvas = () => {
  return (
    <div className="w-full h-64">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#9333ea" intensity={0.5} />
        <FloatingLogo />
      </Canvas>
    </div>
  )
}