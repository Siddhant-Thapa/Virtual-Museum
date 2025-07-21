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
    wanderBounds = null
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
                    THREE.MathUtils.randFloat(minX, maxX),
                    0,
                    THREE.MathUtils.randFloat(minZ, maxZ)
                ];
            } else {
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

    function isPositionBlocked(x, z) {
        return wallBounds.some(([minX, minZ, maxX, maxZ]) =>
            x > minX && x < maxX && z > minZ && z < maxZ
        );
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
            console.warn(" No animations found in model.");
        } else {
            console.log("✅Playing all available animations:", keys);
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

        if (movementDistance < 0.001) {
            setStuckTimer(prev => prev + delta);
            if (stuckTimer > 2) {
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

        if (distance < 0.2) {
            setTarget(getRandomTarget());
            return;
        }

        dir.normalize();
        const nextX = pos.x + dir.x * speed;
        const nextZ = pos.z + dir.z * speed;

        const checkPoints = [
            [nextX, nextZ],
            [nextX + 0.2, nextZ],
            [nextX - 0.2, nextZ],
            [nextX, nextZ + 0.2],
            [nextX, nextZ - 0.2]
        ];

        const blocked = checkPoints.some(([x, z]) => isPositionBlocked(x, z));

        if (!blocked) {
            group.current.position.x = nextX;
            group.current.position.z = nextZ;

            const targetRotation = Math.atan2(dir.x, dir.z);
            group.current.rotation.y = THREE.MathUtils.lerp(
                group.current.rotation.y,
                targetRotation,
                0.05
            );
        } else {
            const alternatives = [
                [dir.x * 0.5 + 0.5, dir.z],
                [dir.x * 0.5 - 0.5, dir.z],
                [dir.x, dir.z * 0.5 + 0.5],
                [dir.x, dir.z * 0.5 - 0.5],
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

            {/* Debug Target (optional) */}
            {target && (
                <mesh position={target}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="red" transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    );
}
