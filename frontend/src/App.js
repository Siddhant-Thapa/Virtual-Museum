import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Room from "./components/Room";
import PlayerControls from "./components/PlayerControls";
import { wallBounds } from "./components/colliders";
import Sculpture from "./components/Sculpture";
import Floor from "./components/Floor";
import AssistantAvatar from './components/AssistantAvatar';
import ChatBox from './components/ChatBox';
import NPC from './components/NPC';
export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [autoQuestion, setAutoQuestion] = useState("");

  // 🎯 Open/close chat with "C" key
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'c') {
        setShowChat(prev => !prev);
        setAutoQuestion(""); // reset question on manual toggle
      } else if (key === 'q') {
        setShowChat(false);
        setAutoQuestion(""); // force close chat
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🧠 Open chat automatically when a sculpture asks a question
  useEffect(() => {
    if (autoQuestion) {
      setShowChat(true);
    }
  }, [autoQuestion]);

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

        {/* Wall Colliders Debug */}
        {wallBounds.map(([minX, minZ, maxX, maxZ], i) => (
          <mesh key={i} position={[(minX + maxX) / 2, 0.5, (minZ + maxZ) / 2]}>
            <boxGeometry args={[Math.abs(maxX - minX), 1, Math.abs(maxZ - minZ)]} />
            <meshStandardMaterial color="red" transparent opacity={0.3} />
          </mesh>
        ))}

        {/* Room 1 Sculptures */}
        <Sculpture
          path="/models/statue.glb"
          position={[0, 0, 0]}
          scale={1.6}
          wireframeSize={[2.5, 8.5, 2.5]}
          onClick={() => {
            setAutoQuestion("Tell me about the stag sculpture in the center of Room 1.");
          }}
        />
        <Sculpture
          path="/models/T-Rex.glb"
          position={[8, 4, 0]}
          proximityThreshold={0.2}
          scale={0.03}
          wireframeSize={[200, 200, 200]}
          onClick={() => {
            setAutoQuestion("Tell me about the T-Rex scupture.");
          }}
        />
        <mesh position={[-8, 0.75, 8]}>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <Sculpture
          path="/models/Knife.glb"
          position={[-8, 1.5, 8]}
          scale={3}
          onClick={() => {
            setAutoQuestion("Tell me about the ceremonial sword.");
          }}
        />

        {/* Room 2 Sculptures */}
        <Sculpture
          path="/models/arrow_man.glb"
          position={[10, 2.5, 20]}
          scale={3}
          onClick={() => {
            setAutoQuestion("Tell me about the Arrow Man statue.");
          }}
        />
        <Sculpture
          path="/models/Diplodocus.glb"
          position={[0, 3.3, 28]}
          proximityThreshold={0.1}
          scale={0.009}
          wireframeSize={[900, 900, 900]}
          onClick={() => {
            setAutoQuestion("Tell me about the Diplodocus dinosaur.");
          }}
        />
        <Sculpture
          path="/models/spear_man.glb"
          position={[10, 4.2, 40]}
          scale={3}
          onClick={() => {
            setAutoQuestion("Tell me about the Spear Man statue.");
          }}
        />
        <Sculpture
          path="/models/Hephaestus temple.glb"
          position={[-8, 1.2, 35]}
          scale={9}
          tooltipOffsetY={0.5}
          wireframeSize={[0.8, 0.5, 0.8]}
          onClick={() => {
            setAutoQuestion("What is the Hephaestus temple in the back room?");
          }}
        />
        <NPC modelPath="/models/npc1.glb" name="Visitor A" startPos={[2, 0, -3]} scale={1.6} />
        <NPC modelPath="/models/npc2.glb" name="Visitor B" startPos={[-3, 0, 2]} scale={1.6} />
        <NPC
          modelPath="/models/npc3.glb"
          name="Visitor C"
          startPos={[4, 0, 30]}
          scale={0.6}
        />

        <NPC
          modelPath="/models/npc4.glb"
          name="small skeleton"
          startPos={[6, 1, 35]}
          // wanderBounds={[-5, -5, 15, 15]}
          scale={2.8}
        />

        <NPC
          modelPath="/models/npc5.glb"
          name="Zombie"
          startPos={[4, 0, 43]}
          wanderBounds={[-5, -5, 35, 15]}
          scale={0.3}
        />

        {/* AI Assistant Model */}
        {/* onClick removed to avoid accidental triggers */}
        <AssistantAvatar />
        {/* Controls */}
        <PointerLockControls />
        <PlayerControls />
      </Canvas>

      {/* Chat Interface */}
      {showChat && (
        <ChatBox
          onClose={() => {
            setShowChat(false);
            setAutoQuestion("");
          }}
          autoQuestion={autoQuestion}
        />
      )}
    </div>
  );
}
