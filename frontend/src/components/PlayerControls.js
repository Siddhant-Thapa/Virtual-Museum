import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { wallBounds } from "./colliders";

const speed = 0.1;

export default function PlayerControls() {
  const { camera } = useThree();
  const keys = useRef({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase())) return;
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, camera.up).normalize();

    if (keys.current["w"]) direction.add(forward);
    if (keys.current["s"]) direction.sub(forward);
    if (keys.current["a"]) direction.sub(right);
    if (keys.current["d"]) direction.add(right);

    direction.normalize().multiplyScalar(speed);

    const nextX = camera.position.x + direction.x;
    const nextZ = camera.position.z + direction.z;

    // 🧱 Check against wallBounds
    const blocked = wallBounds.some(([minX, minZ, maxX, maxZ]) =>
      nextX > minX && nextX < maxX && nextZ > minZ && nextZ < maxZ
    );

    if (!blocked) {
      camera.position.x = nextX;
      camera.position.z = nextZ;
    }
  });

  return null;
}
