import React from "react";
import WallWithEntry from "./WallWithEntry";

export default function Room({
    centerZ,
    width,
    depth,
    height,
    thickness,
    hasFrontEntry,
    hasBackEntry,
}) {
    const halfW = width / 2;
    const halfD = depth / 2;

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
                />
            ) : (
                <mesh position={[0, 0, -halfD]}>
                    <boxGeometry args={[width, height, thickness]} />
                    <meshStandardMaterial color="#888" />
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
                />
            ) : (
                <mesh position={[0, 0, halfD]}>
                    <boxGeometry args={[width, height, thickness]} />
                    <meshStandardMaterial color="#888" />
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
            />
        </group>
    );
}
