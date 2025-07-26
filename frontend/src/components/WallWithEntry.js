import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";

export default function WallWithEntry({
    position,
    rotation,
    height,
    length,
    thickness,
    entryWidth,
    entryHeight,
    wallTexture = null
}) {
    const sideWidth = (length - entryWidth) / 2;

    // Always load texture (hooks must be called unconditionally)
    const defaultTexture = useLoader(TextureLoader, "/textures/marble.jpg");
    defaultTexture.wrapS = defaultTexture.wrapT = RepeatWrapping;
    defaultTexture.repeat.set(length / 5, height / 5);

    // Use passed texture or default texture
    const texture = wallTexture || defaultTexture;

    // Wall material with texture
    const wallMaterial = <meshStandardMaterial map={texture} />;

    return (
        <group position={position} rotation={rotation}>
            {/* Left of the door */}
            <mesh position={[-(entryWidth / 2 + sideWidth / 2), 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[sideWidth, height, thickness]} />
                {wallMaterial}
            </mesh>

            {/* Right of the door */}
            <mesh position={[(entryWidth / 2 + sideWidth / 2), 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[sideWidth, height, thickness]} />
                {wallMaterial}
            </mesh>

            {/* Above the door */}
            {entryHeight > 0 && entryHeight < height && (
                <mesh position={[0, (height + entryHeight) / 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[entryWidth, height - entryHeight, thickness]} />
                    {wallMaterial}
                </mesh>
            )}
        </group>
    );
}