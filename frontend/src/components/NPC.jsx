import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { wallBounds } from "./colliders";

export default function NPC({
    modelPath = "/models/npc2.glb",
    name = "Visitor",
    areaSize = 9,
    speed = 0.01,
    startPos = [0, 0, 0],
    scale = 0.8,
    wanderBounds = null,
    debug = false,
    bodyRadius = 0.4  // Add body radius prop
}) {
    const group = useRef();
    const { scene, animations } = useGLTF(modelPath);
    const { actions } = useAnimations(animations, group);

    const [target, setTarget] = useState(null);
    const [isStuck, setIsStuck] = useState(false);
    const [lastPosition, setLastPosition] = useState(new THREE.Vector3(...startPos));
    const [stuckTimer, setStuckTimer] = useState(0);

    // Generate a new random point within allowed area
    function getRandomTarget() {
        let attempts = 0;
        let newTarget;

        do {
            if (wanderBounds) {
                const [minX, minZ, maxX, maxZ] = wanderBounds;
                newTarget = [
                    THREE.MathUtils.randFloat(minX + 1, maxX - 1), // Add padding
                    0,
                    THREE.MathUtils.randFloat(minZ + 1, maxZ - 1)  // Add padding
                ];
            } else {
                const safeDistance = areaSize - 1; // Reduce wander area slightly
                newTarget = [
                    startPos[0] + THREE.MathUtils.randFloatSpread(safeDistance * 2),
                    0,
                    startPos[2] + THREE.MathUtils.randFloatSpread(safeDistance * 2)
                ];
            }
            attempts++;
        } while (attempts < 20 && isPositionBlocked(newTarget[0], newTarget[2], 0, bodyRadius)); // More attempts

        if (debug) {
            console.log(`${name} new target:`, newTarget, `(attempts: ${attempts})`);
        }
        return newTarget;
    }

    // Enhanced collision detection with height support and NPC radius
    function isPositionBlocked(x, z, y = 0, radius = 0.5) {
        return wallBounds.some(bounds => {
            if (bounds.length === 6) {
                // 3D bounds: [minX, minZ, maxX, maxZ, minY, maxY]
                const [minX, minZ, maxX, maxZ, minY, maxY] = bounds;
                return (x - radius) < maxX && (x + radius) > minX &&
                    (z - radius) < maxZ && (z + radius) > minZ &&
                    y >= minY && y <= maxY;
            } else {
                // 2D bounds (legacy): [minX, minZ, maxX, maxZ] - assume full height
                const [minX, minZ, maxX, maxZ] = bounds;
                return (x - radius) < maxX && (x + radius) > minX &&
                    (z - radius) < maxZ && (z + radius) > minZ;
            }
        });
    }

    useEffect(() => {
        if (!target) {
            setTarget(getRandomTarget());
        }
    }, []);

    useEffect(() => {
        if (!actions) return;

        const keys = Object.keys(actions);
        if (keys.length === 0) {
            console.warn(`❌ ${name}: No animations found in model.`);
        } else if (debug) {
            console.log(`✅ ${name}: Playing animations:`, keys);
        }

        // Play all animations
        keys.forEach((name) => {
            const action = actions[name];
            if (action) {
                action.reset().fadeIn(0.5).play();
            }
        });

        // Cleanup on unmount
        return () => {
            keys.forEach((name) => {
                const action = actions[name];
                if (action) {
                    action.fadeOut(0.5);
                }
            });
        };
    }, [actions]);

    useFrame((state, delta) => {
        if (!group.current || !target) return;

        const pos = group.current.position;
        const dir = new THREE.Vector3(...target).sub(pos);
        const distance = dir.length();

        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
        const movementDistance = currentPos.distanceTo(lastPosition);

        // Improved stuck detection
        if (movementDistance < 0.005) {  // Increased threshold slightly
            setStuckTimer(prev => prev + delta);
            if (stuckTimer > 1.5) {      // Reduced from 2 seconds
                if (debug) {
                    console.log(`${name} is stuck, finding new target`);
                }
                setIsStuck(true);
                setTarget(getRandomTarget());
                setStuckTimer(0);
                setLastPosition(currentPos.clone());
                return;
            }
        } else {
            setStuckTimer(0);
            setIsStuck(false);
            setLastPosition(currentPos.clone());
        }

        // Reached target
        if (distance < 0.3) { // Slightly larger reach distance
            setTarget(getRandomTarget());
            return;
        }

        dir.normalize();
        const nextX = pos.x + dir.x * speed;
        const nextZ = pos.z + dir.z * speed;

        // Collision check points around the NPC's body
        const checkPoints = [
            [nextX, nextZ],                    // Center
            [nextX + bodyRadius, nextZ],       // Right
            [nextX - bodyRadius, nextZ],       // Left
            [nextX, nextZ + bodyRadius],       // Forward
            [nextX, nextZ - bodyRadius],       // Back
            [nextX + bodyRadius * 0.7, nextZ + bodyRadius * 0.7], // Diagonal corners
            [nextX - bodyRadius * 0.7, nextZ + bodyRadius * 0.7],
            [nextX + bodyRadius * 0.7, nextZ - bodyRadius * 0.7],
            [nextX - bodyRadius * 0.7, nextZ - bodyRadius * 0.7]
        ];

        const blocked = checkPoints.some(([x, z]) => {
            const isBlocked = isPositionBlocked(x, z, pos.y, 0); // Don't double-apply radius here
            if (debug && isBlocked) {
                console.log(`${name} blocked at:`, x, z);
            }
            return isBlocked;
        });

        if (!blocked) {
            group.current.position.x = nextX;
            group.current.position.z = nextZ;

            // Smooth rotation towards target
            const targetRotation = Math.atan2(dir.x, dir.z);
            group.current.rotation.y = THREE.MathUtils.lerp(
                group.current.rotation.y,
                targetRotation,
                0.08  // Slightly faster rotation
            );
        } else {
            // Try alternative movement directions
            const alternatives = [
                [dir.x * 0.3 + 0.7, dir.z * 0.3],      // More perpendicular movement
                [dir.x * 0.3 - 0.7, dir.z * 0.3],
                [dir.x * 0.3, dir.z * 0.3 + 0.7],
                [dir.x * 0.3, dir.z * 0.3 - 0.7],
                [0.5, 0],                                // Simple cardinal directions
                [-0.5, 0],
                [0, 0.5],
                [0, -0.5]
            ];

            let moved = false;
            for (const [altX, altZ] of alternatives) {
                const altNextX = pos.x + altX * speed * 0.7; // Slightly slower alternative movement
                const altNextZ = pos.z + altZ * speed * 0.7;

                if (!isPositionBlocked(altNextX, altNextZ, pos.y, bodyRadius)) {
                    group.current.position.x = altNextX;
                    group.current.position.z = altNextZ;

                    // Rotate towards alternative movement direction
                    const altTargetRotation = Math.atan2(altX, altZ);
                    group.current.rotation.y = THREE.MathUtils.lerp(
                        group.current.rotation.y,
                        altTargetRotation,
                        0.05
                    );

                    moved = true;
                    break;
                }
            }

            // If no alternative worked, get a new target
            if (!moved) {
                if (debug) {
                    console.log(`${name} completely blocked, getting new target`);
                }
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
                color={isStuck ? "red" : (debug ? "blue" : "black")}
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>

            {/* Debug Target (optional) */}
            {debug && target && (
                <mesh position={target}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="red" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Debug body radius visualization */}
            {debug && (
                <mesh position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[bodyRadius, bodyRadius, 0.1, 16]} />
                    <meshBasicMaterial color="yellow" transparent opacity={0.3} />
                </mesh>
            )}
        </group>
    );
}