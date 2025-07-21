import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export default function Sculpture({
    path,
    position,
    scale = 1,
    onClick,
    proximityThreshold = 4,
    wireframeSize = [1.5, 2, 1.5],
    tooltipOffsetY = 2.2,
    title = "Artifact",
    info = "This is an artifact in the museum."
}) {
    const { scene } = useGLTF(path);
    const meshRef = useRef();
    const { camera } = useThree();
    const [hovered, setHovered] = useState(false);
    const [isNearby, setIsNearby] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Clone the scene to avoid conflicts
    const clonedScene = scene.clone();

    // Track player-camera proximity to the sculpture
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
            const nearby = dist < threshold;

            setIsNearby(nearby);

            // Hide info if player moves away
            if (!nearby && showInfo) {
                setShowInfo(false);
            }
        }
    });

    // 🎮 Handle E key for info display
    useEffect(() => {
        const handleKey = (e) => {
            // Only handle E key when nearby
            if (e.key.toLowerCase() === 'e' && isNearby) {
                e.preventDefault();
                e.stopPropagation();
                setShowInfo(prev => !prev);
                console.log(`${title}: E key pressed, showInfo:`, !showInfo);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isNearby, title, showInfo]);

    // Change cursor when hovering near object
    useEffect(() => {
        document.body.style.cursor = hovered && isNearby ? 'pointer' : 'default';
    }, [hovered, isNearby]);

    const handleClick = () => {
        if (isNearby) {
            setShowInfo(prev => !prev);
            console.log(`${title}: Clicked, showInfo:`, !showInfo);
        }
    };

    const handleChatClick = () => {
        if (onClick) {
            onClick();
            console.log(`${title}: Chat clicked`);
        }
    };

    return (
        <group
            ref={meshRef}
            position={position}
            scale={[scale, scale, scale]}
            rotation={[0, Math.PI, 0]}  // Flip to face forward
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={handleClick}
        >
            <primitive object={clonedScene} />

            {/* 💠 Yellow glow box when hovered & nearby */}
            {hovered && isNearby && (
                <mesh>
                    <boxGeometry args={wireframeSize} />
                    <meshBasicMaterial color="yellow" wireframe opacity={0.4} transparent />
                </mesh>
            )}

            {/* 📝 Interaction Tooltip */}
            <Html
                position={[0, tooltipOffsetY, 0]}
                center
                distanceFactor={15}
            >
                <div
                    className="sculpture-tooltip"
                    style={{
                        opacity: (hovered && isNearby && !showInfo) ? 1 : 0
                    }}
                >
                    <div>Press E to view info</div>
                    {onClick && <div className="sculpture-tooltip-sub">Press C for chat</div>}
                </div>
            </Html>

            {/* 📋 Info Display Box */}
            <Html
                position={[0, tooltipOffsetY - 1, 0]}
                center
                distanceFactor={8}
                occlude={false}
            >
                <div
                    className="sculpture-info-container"
                    style={{
                        opacity: (showInfo && isNearby) ? 1 : 0,
                        transform: showInfo ? 'scale(1)' : 'scale(0.9)',
                        pointerEvents: showInfo ? 'auto' : 'none'
                    }}
                >
                    <div className="sculpture-info-box">
                        {/* Close button */}
                        <button
                            className="sculpture-close-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowInfo(false);
                                console.log(`${title}: Close button clicked`);
                            }}
                        >
                            ×
                        </button>

                        {/* Title */}
                        <h3 className="sculpture-title">
                            {title}
                        </h3>

                        {/* Info text */}
                        <p className="sculpture-info-text">
                            {info}
                        </p>

                        {/* Action buttons */}
                        <div className="sculpture-buttons">
                            {onClick && (
                                <button
                                    className="sculpture-chat-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleChatClick();
                                    }}
                                >
                                    💬 Ask AI Guide
                                </button>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="sculpture-footer">
                            Press E again or click × to close
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}