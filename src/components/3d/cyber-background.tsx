import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

function CyberParticles() {
  const ref = React.useRef<THREE.Points>(null!)
  const [sphere] = React.useState(() => {
    const positions = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  })

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.1
      ref.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00d4aa"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function CyberGrid() {
  const ref = React.useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <group ref={ref}>
      <gridHelper args={[20, 20, "#00d4aa", "#1a1a1a"]} />
      <gridHelper args={[20, 20, "#9333ea", "#1a1a1a"]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

export const CyberBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <CyberParticles />
        <CyberGrid />
      </Canvas>
    </div>
  )
}