import React from "react";

export default function WallWithEntry({
    position,
    rotation,
    height,
    length,
    thickness,
    entryWidth,
    entryHeight,
}) {
    const sideWidth = (length - entryWidth) / 2;
    const [x, y, z] = position;

    return (
        <group position={position} rotation={rotation}>
            {/* Left of the door */}
            <mesh position={[-(entryWidth / 2 + sideWidth / 2), 0, 0]}>
                <boxGeometry args={[sideWidth, height, thickness]} />
                <meshStandardMaterial color="#888" />
            </mesh>

            {/* Right of the door */}
            <mesh position={[(entryWidth / 2 + sideWidth / 2), 0, 0]}>
                <boxGeometry args={[sideWidth, height, thickness]} />
                <meshStandardMaterial color="#888" />
            </mesh>

            {/* Above the door */}
            {/* <mesh position={[0, (height + entryHeight) / 2, 0]}>
                <boxGeometry args={[entryWidth, height - entryHeight, thickness]} />
                <meshStandardMaterial color="#888" />
            </mesh> */}
        </group>
    );
}
