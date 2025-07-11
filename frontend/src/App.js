import React from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Room from "./components/Room";
import PlayerControls from "./components/PlayerControls";
import { wallBounds } from "./components/colliders";
import Sculpture from "./components/Sculpture";
import Floor from "./components/Floor";

export default function App() {
  const roomWidth = 30;
  const roomDepth = 30;
  const roomHeight = 10;
  const wallThickness = 1;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, -25], fov: 75 }}>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 25, 10]} intensity={1.2} />
        <Floor width={60} height={60} position={[0, 0, 15]} />

        {/* Rooms */}
        <Room
          centerZ={0}
          width={roomWidth}
          depth={roomDepth}
          height={roomHeight}
          thickness={wallThickness}
          hasFrontEntry={true}
          hasBackEntry={true}
        />
        <Room
          centerZ={roomDepth}
          width={roomWidth}
          depth={roomDepth}
          height={roomHeight}
          thickness={wallThickness}
          hasFrontEntry={false}
          hasBackEntry={true}
        />

        {/* Debug - Visualize wall collisions */}
        {wallBounds.map(([minX, minZ, maxX, maxZ], i) => (
          <mesh key={i} position={[(minX + maxX) / 2, 0.5, (minZ + maxZ) / 2]}>
            <boxGeometry args={[Math.abs(maxX - minX), 1, Math.abs(maxZ - minZ)]} />
            <meshStandardMaterial color="red" transparent opacity={0.3} />
          </mesh>
        ))}

        {/* Sculptures in Room 1 */}
        <Sculpture path="/models/statue.glb" position={[0, 0, 0]} scale={1.6} />
        <Sculpture path="/models/T-Rex.glb" position={[8, 5, -2]} scale={0.04} />
        <mesh position={[-8, 0.75, 8]}>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <Sculpture path="/models/Knife.glb" position={[-8, 1.5, 8]} scale={3} />


        {/* Front-right: Arrow Man */}
        <Sculpture path="/models/arrow_man.glb" position={[10, 2.5, 20]} scale={3} />

        {/* Back-left: Diplodocus - large dino, tiny scale, lifted */}
        <Sculpture path="/models/Diplodocus.glb" position={[0, 3.3, 30]} scale={0.01} />


        {/* Back-right: Spear Man */}
        <Sculpture path="/models/spear_man.glb" position={[10, 4.2, 40]} scale={3} />

        {/* Front-left: GN Model (unknown model) */}
        <Sculpture path="/models/gn.glb" position={[-8, 1.2, 35]} scale={9} />


        {/* Controls */}
        <PointerLockControls />
        <PlayerControls />
      </Canvas>
    </div>
  );
} 
