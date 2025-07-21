import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export default function Sculpture({ path, position, scale = 1, onClick, proximityThreshold = 4, wireframeSize = [1.5, 2, 1.5], tooltipOffsetY = 2.2 }) {
    const { scene } = useGLTF(path);
    const meshRef = useRef();
    const { camera } = useThree();
    const [hovered, setHovered] = useState(false);
    const [isNearby, setIsNearby] = useState(false);

    //  Track player-camera proximity to the sculpture
    useFrame(() => {
        if (camera && meshRef.current) {
            meshRef.current.updateMatrixWorld();
            const box = new THREE.Box3().setFromObject(meshRef.current);
            const cameraPos = camera.position;
            const closestPoint = box.clampPoint(cameraPos, new THREE.Vector3());
            const dist = cameraPos.distanceTo(closestPoint);
            const boxSize = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
            const threshold = proximityThreshold + (maxDimension * 0.2);
            setIsNearby(dist < threshold);
        }
    });

    // 🎮 Handle E key to trigger interaction
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key.toLowerCase() === 'e' && isNearby && onClick) {
                onClick();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isNearby, onClick]);

    //  Change cursor when hovering near object
    useEffect(() => {
        document.body.style.cursor = hovered && isNearby ? 'pointer' : 'default';
    }, [hovered, isNearby]);

    return (
        <group
            ref={meshRef}
            position={position}
            scale={[scale, scale, scale]}
            rotation={[0, Math.PI, 0]}  // Flip to face forward
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <primitive object={scene} />

            {/* 💠 Yellow glow box when hovered & nearby */}
            {hovered && isNearby && (
                <mesh>
                    <boxGeometry args={wireframeSize} />
                    <meshBasicMaterial color="yellow" wireframe opacity={0.4} transparent />
                </mesh>
            )}

            {/* 📝 Tooltip with fade-in/fade-out animation */}
            <Html
                position={[0, tooltipOffsetY, 0]}  // 🧠 dynamic height based on prop
                center
                style={{
                    background: 'rgba(0,0,0,0.7)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.3s ease',
                    opacity: hovered && isNearby ? 1 : 0
                }}
            >
                Press E to interact
            </Html>
        </group>
    );
}
