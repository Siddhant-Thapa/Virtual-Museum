import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export default function AssistantAvatar({ onClick }) {
    const avatarRef = useRef();
    const { scene } = useGLTF('/models/assistant.glb');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'c') {
                onClick?.(); // trigger chat
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClick]);

    return (
        <primitive
            object={scene}
            ref={avatarRef}
            scale={[0.3, 0.3, 0.3]}
            position={[8, 0, 10]}
            rotation={[0, Math.PI, 0]}
        />
    );
}
