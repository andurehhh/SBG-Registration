import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFBX, OrbitControls, Environment } from '@react-three/drei'

function PenguinModel() {
  const fbx = useFBX('/BabyPenguin.fbx')
  return <primitive object={fbx} scale={0.005} position={[0, 0, 0]} />
}

export function Penguin3D({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0.5, 4.5], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 2]} intensity={1.1} />
        <Suspense fallback={null}>
          <PenguinModel />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  )
}