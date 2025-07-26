import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Environment } from "@react-three/drei";
import Room from "./components/Room";
import PlayerControls from "./components/PlayerControls";
import { wallBounds } from "./components/colliders";
import Sculpture from "./components/Sculpture";
import Floor from "./components/Floor";
import AssistantAvatar from './components/AssistantAvatar';
import ChatBox from './components/ChatBox';
import NPC from './components/NPC';
import './App.css';

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [autoQuestion, setAutoQuestion] = useState("");

  //  Open/close chat with "C" key
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

  //  Open chat automatically when a sculpture asks a question
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

        {/* HDRI Environment Lighting - Reduced intensity */}
        <Environment preset="night" background={false} intensity={0.6} />

        {/* Option 1: Local HDRI file with much lower intensity */}
        {/* <Environment
          files="/hdri/studio_small_03_4k.hdr"
          background={false}
          intensity={0.2}
        /> */}


        {/* Much reduced additional lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 25, 10]}
          intensity={0.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

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
          hasRoof={true}
        />
        <Room
          centerZ={roomDepth}
          width={roomWidth}
          depth={roomDepth}
          height={roomHeight}
          thickness={wallThickness}
          hasFrontEntry={false}
          hasBackEntry={true}
          hasRoof={true}
        />

        {/* Wall Colliders Debug - DISABLED */}
        {/* {wallBounds.map(([minX, minZ, maxX, maxZ], i) => (
          <mesh key={i} position={[(minX + maxX) / 2, 5, (minZ + maxZ) / 2]}>
            <boxGeometry args={[Math.abs(maxX - minX), 10, Math.abs(maxZ - minZ)]} />
            <meshStandardMaterial color="red" transparent opacity={0.3} />
          </mesh>
        ))} */}

        {/* Room 1 Sculptures */}
        <Sculpture
          path="/models/statue.glb"
          position={[0, 0, 0]}
          scale={1.6}
          wireframeSize={[2.5, 8.5, 2.5]}
          title="Marble Stag Sculpture"
          info="This beautiful marble sculpture depicts a majestic stag native to Africa. Notice the intricate detail in the long, curved horns and the powerful stance of this magnificent creature."
          onClick={() => {
            setAutoQuestion("Tell me about the stag sculpture in the center of Room 1.");
          }}
        />

        <Sculpture
          path="/models/T-Rex.glb"
          position={[8, 4, 0]}
          proximityThreshold={4}
          scale={0.03}
          wireframeSize={[200, 200, 200]}
          title="Tyrannosaurus Rex Skeleton"
          info="This fearsome T-Rex skeleton showcases one of the most powerful predators that ever lived. With massive jaws capable of crushing bone and a towering 12-foot height, this apex predator ruled the Late Cretaceous period."
          onClick={() => {
            setAutoQuestion("Tell me about the T-Rex sculpture.");
          }}
        />

        {/* sword */}
        <mesh position={[-8, 0.75, 8]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
          <meshStandardMaterial
            color="#2c2c2c"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
        <Sculpture
          path="/models/Knife.glb"
          position={[-8, 1.5, 8]}
          tooltipOffsetY={1}
          proximityThreshold={4}
          scale={3}
          title="Ancient Ceremonial Sword"
          info="This ancient ceremonial sword was reportedly used by Julius Caesar during his legendary quests. The intricate metalwork and preserved condition make it a remarkable piece of Roman history."
          onClick={() => {
            setAutoQuestion("Tell me about the ceremonial sword.");
          }}
        />

        {/* Room 2 Sculptures */}
        <Sculpture
          path="/models/arrow_man.glb"
          position={[10, 2.5, 20]}
          scale={3}
          tooltipOffsetY={1}
          title="Arrow Man Warrior"
          info="This classical sculpture showcases a warrior in battle stance, bow drawn and ready. The craftsmanship represents the pinnacle of ancient sculptural art, symbolizing strength and precision in combat."
          onClick={() => {
            setAutoQuestion("Tell me about the Arrow Man statue.");
          }}
        />

        <Sculpture
          path="/models/Diplodocus.glb"
          position={[0, 3.3, 28]}
          proximityThreshold={2}
          scale={0.009}
          wireframeSize={[700, 700, 700]}
          title="Diplodocus Skeleton"
          info="This magnificent Diplodocus skeleton displays the elegant long neck and whip-like tail that made these gentle giants one of the most recognizable dinosaurs. Suspended from above, you can appreciate its full 85-foot length."
          onClick={() => {
            setAutoQuestion("Tell me about the long neck Diplodocus dinosaur.");
          }}
        />

        <Sculpture
          path="/models/spear_man.glb"
          position={[10, 3.4, 40]}
          scale={2.5}
          tooltipOffsetY={0.5}
          title="Spear Man Warrior"
          info="This imposing warrior sculpture depicts a battle-ready soldier with spear in hand. The detailed armor and powerful stance represent the martial traditions of ancient civilizations."
          onClick={() => {
            setAutoQuestion("Tell me about the Spear Man?");
          }}
        />

        <Sculpture
          path="/models/Hephaestus temple.glb"
          position={[-8, 1.2, 35]}
          scale={9}
          tooltipOffsetY={1}
          wireframeSize={[0.8, 1, 0.8]}
          title="Temple of Hephaestus"
          info="This miniature recreation of the ancient Greek Temple of Hephaestus showcases classical Doric architecture. Dedicated to Hephaestus, the god of fire and metalworking, this temple represents the pinnacle of ancient Greek engineering and artistry."
          onClick={() => {
            setAutoQuestion("What is the greek-temple?");
          }}
        />

        {/* NPCs with different models */}
        <NPC
          modelPath="/models/npc1.glb"
          name="Visitor A"
          startPos={[2, 0, -3]}
          scale={0.8}
        />
        <NPC
          modelPath="/models/npc2.glb"
          name="Visitor B"
          startPos={[-3, 0, 2]}
          scale={0.8}
        />
        <NPC
          modelPath="/models/npc3.glb"
          name="Visitor C"
          startPos={[8, 0, 30]}
          scale={0.8}
        />
        {/* <NPC
          modelPath="/models/npc4.glb"
          name="Visitor D"
          startPos={[6, 0, 30]}
          scale={0.8}
        /> */}
        <NPC
          modelPath="/models/npc5.glb"
          name="Visitor E"
          startPos={[-8, 0, 23]}
          wanderBounds={[-5, -5, 35, 15]}
          scale={0.8}
        />

        {/* AI Assistant Model */}
        <AssistantAvatar position={[0, 1, -5]} />

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