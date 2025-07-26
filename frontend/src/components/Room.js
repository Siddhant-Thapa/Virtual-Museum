import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";
import WallWithEntry from "./WallWithEntry";

export default function Room({
    centerZ,
    width,
    depth,
    height,
    thickness,
    hasFrontEntry,
    hasBackEntry,
    hasRoof = true  // New prop to control roof
}) {
    const halfW = width / 2;
    const halfD = depth / 2;

    // Load wall texture
    const wallTexture = useLoader(TextureLoader, "/textures/marble.jpg");
    wallTexture.wrapS = wallTexture.wrapT = RepeatWrapping;
    wallTexture.repeat.set(width / 5, height / 5); // Adjust tiling

    // Load ceiling texture (can be same or different)
    const ceilingTexture = useLoader(TextureLoader, "/textures/marble.jpg");
    ceilingTexture.wrapS = ceilingTexture.wrapT = RepeatWrapping;
    ceilingTexture.repeat.set(width / 8, depth / 8);

    return (
        <group position={[0, height / 2, centerZ]}>
            {/* BACK WALL */}
            {hasBackEntry ? (
                <WallWithEntry
                    position={[0, 0, -halfD]}
                    rotation={[0, 0, 0]}
                    height={height}
                    length={width}
                    thickness={thickness}
                    entryWidth={8}
                    entryHeight={6}
                    wallTexture={wallTexture}
                />
            ) : (
                <mesh position={[0, 0, -halfD]} castShadow receiveShadow>
                    <boxGeometry args={[width, height, thickness]} />
                    <meshStandardMaterial map={wallTexture} />
                </mesh>
            )}

            {/* FRONT WALL */}
            {hasFrontEntry ? (
                <WallWithEntry
                    position={[0, 0, halfD]}
                    rotation={[0, 0, 0]}
                    height={height}
                    length={width}
                    thickness={thickness}
                    entryWidth={8}
                    entryHeight={6}
                    wallTexture={wallTexture}
                />
            ) : (
                <mesh position={[0, 0, halfD]} castShadow receiveShadow>
                    <boxGeometry args={[width, height, thickness]} />
                    <meshStandardMaterial map={wallTexture} />
                </mesh>
            )}

            {/* LEFT WALL */}
            <WallWithEntry
                position={[-halfW, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                height={height}
                length={depth}
                thickness={thickness}
                entryWidth={0} // Solid
                entryHeight={0}
                wallTexture={wallTexture}
            />

            {/* RIGHT WALL */}
            <WallWithEntry
                position={[halfW, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                height={height}
                length={depth}
                thickness={thickness}
                entryWidth={0} // Solid
                entryHeight={0}
                wallTexture={wallTexture}
            />

            {/* ROOF/CEILING */}
            {hasRoof && (
                <mesh position={[0, height / 2 + thickness / 2, 0]} receiveShadow>
                    <boxGeometry args={[width + thickness * 2, thickness, depth + thickness * 2]} />
                    <meshStandardMaterial map={ceilingTexture} />
                </mesh>
            )}
        </group>
    );
}