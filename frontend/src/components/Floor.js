// src/components/Floor.js
import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";

export default function Floor({ width = 60, height = 60, position = [0, 0, 15] }) {
    const texture = useLoader(TextureLoader, "/textures/marble.jpg");

    // Optional: Tile the texture so it doesn't stretch
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(width / 10, height / 10); // Adjust tiling

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}
