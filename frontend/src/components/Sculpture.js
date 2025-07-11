import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export default function Sculpture({ path, position, scale = 1 }) {
    const { scene } = useGLTF(path);
    const ref = useRef();

    return (
        <primitive
            ref={ref}
            object={scene}
            position={position}
            scale={[scale, scale, scale]}
            rotation={[0, Math.PI, 0]} // Optional: flip if facing wrong
        />
    );
}
