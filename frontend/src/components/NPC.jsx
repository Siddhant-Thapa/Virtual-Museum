import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { wallBounds } from "./colliders";

export default function NPC({
    modelPath = "/models/statue.glb",
    name = "Visitor",
    areaSize = 9,
    speed = 0.01,
    startPos = [0, 0, 0],
    scale = 1,
    wanderBounds = null  // New prop: [minX, minZ, maxX, maxZ] for this NPC's area
}) {
    const group = useRef();
    const { scene, animations } = useGLTF(modelPath);
    const { actions, mixer } = useAnimations(animations, group);

    const [target, setTarget] = useState(null);
    const [isStuck, setIsStuck] = useState(false);
    const [lastPosition, setLastPosition] = useState(new THREE.Vector3(...startPos));
    const [stuckTimer, setStuckTimer] = useState(0);

    // Generate a new random point within the allowed area
    function getRandomTarget() {
        let attempts = 0;
        let newTarget;

        do {
            if (wanderBounds) {
                // Use specific bounds for this NPC
                const [minX, minZ, maxX, maxZ] = wanderBounds;
                newTarget = [
                    THREE.MathUtils.randFloat(minX, maxX),
                    0,
                    THREE.MathUtils.randFloat(minZ, maxZ)
                ];
            } else {
                // Default behavior - wander around starting position
                newTarget = [
                    startPos[0] + THREE.MathUtils.randFloatSpread(areaSize * 2),
                    0,
                    startPos[2] + THREE.MathUtils.randFloatSpread(areaSize * 2)
                ];
            }
            attempts++;
        } while (attempts < 10 && isPositionBlocked(newTarget[0], newTarget[2]));

        return newTarget;
    }

    // Check if a position is blocked by walls
    function isPositionBlocked(x, z) {
        return wallBounds.some(([minX, minZ, maxX, maxZ]) =>
            x > minX && x < maxX && z > minZ && z < maxZ
        );
    }

    // Initialize target after component mounts
    useEffect(() => {
        if (!target) {
            setTarget(getRandomTarget());
        }
    }, []);

    // Play "Walk" animation if available
    useEffect(() => {
        if (actions["Walk"]) {
            actions["Walk"].reset().fadeIn(0.5).play();
        } else if (actions["Idle"]) {
            actions["Idle"].reset().fadeIn(0.5).play();
        }
    }, [actions]);

    useFrame((state, delta) => {
        if (!group.current || !target) return;

        const pos = group.current.position;
        const dir = new THREE.Vector3(...target).sub(pos);
        const distance = dir.length();

        // Check if NPC is stuck (hasn't moved much)
        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
        const movementDistance = currentPos.distanceTo(lastPosition);

        if (movementDistance < 0.001) {
            setStuckTimer(prev => prev + delta);
            if (stuckTimer > 2) { // If stuck for 2 seconds
                setIsStuck(true);
                setTarget(getRandomTarget());
                setStuckTimer(0);
                return;
            }
        } else {
            setStuckTimer(0);
            setIsStuck(false);
            setLastPosition(currentPos.clone());
        }

        // If close to target, get new target
        if (distance < 0.2) {
            setTarget(getRandomTarget());
            return;
        }

        dir.normalize();
        const nextX = pos.x + dir.x * speed;
        const nextZ = pos.z + dir.z * speed;

        // Enhanced collision detection with multiple check points
        const checkPoints = [
            [nextX, nextZ], // Main position
            [nextX + 0.2, nextZ], // Slightly ahead X
            [nextX - 0.2, nextZ], // Slightly behind X
            [nextX, nextZ + 0.2], // Slightly ahead Z
            [nextX, nextZ - 0.2]  // Slightly behind Z
        ];

        const blocked = checkPoints.some(([x, z]) => isPositionBlocked(x, z));

        if (!blocked) {
            group.current.position.x = nextX;
            group.current.position.z = nextZ;

            // Smooth rotation towards target
            const targetRotation = Math.atan2(dir.x, dir.z);
            group.current.rotation.y = THREE.MathUtils.lerp(
                group.current.rotation.y,
                targetRotation,
                0.05
            );
        } else {
            // If blocked, try alternative directions
            const alternatives = [
                [dir.x * 0.5 + 0.5, dir.z], // Turn right
                [dir.x * 0.5 - 0.5, dir.z], // Turn left
                [dir.x, dir.z * 0.5 + 0.5], // Turn up
                [dir.x, dir.z * 0.5 - 0.5], // Turn down
            ];

            let moved = false;
            for (const [altX, altZ] of alternatives) {
                const altNextX = pos.x + altX * speed * 0.5;
                const altNextZ = pos.z + altZ * speed * 0.5;

                if (!isPositionBlocked(altNextX, altNextZ)) {
                    group.current.position.x = altNextX;
                    group.current.position.z = altNextZ;
                    moved = true;
                    break;
                }
            }

            if (!moved) {
                // If all alternatives are blocked, get completely new target
                setTarget(getRandomTarget());
            }
        }
    });

    return (
        <group ref={group} position={startPos} scale={scale} dispose={null}>
            <primitive object={scene} />

            {/* Floating Name */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={0.3}
                color={isStuck ? "red" : "black"}
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>

            {/* Debug: Show target position (remove in production) 
            {target && (
                <mesh position={target}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="red" transparent opacity={0.5} />
                </mesh>
            )}
            */}
        </group>
    );
}