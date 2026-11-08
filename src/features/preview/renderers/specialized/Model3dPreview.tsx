import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, RotateCw } from 'lucide-react';

interface Model3dPreviewProps {
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const Model3dPreview: React.FC<Model3dPreviewProps> = ({ rawBuffer, fileName }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f5);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0x3e5670, 0xdeddd8);
    grid.position.y = -1;
    scene.add(grid);

    // 3D Object Mesh
    const geometry = new THREE.DodecahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3e5670,
      metalness: 0.2,
      roughness: 0.4,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotating) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isRotating]);

  return (
    <div className="w-full h-full relative flex flex-col bg-surface-1">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border shadow-xs transition-colors cursor-pointer ${
            isRotating ? 'bg-accent text-white' : 'bg-surface-1 text-text-primary hover:bg-surface-2'
          }`}
        >
          <RotateCw size={13} className={isRotating ? 'animate-spin' : ''} />
          <span>{isRotating ? 'Auto Rotate' : 'Paused'}</span>
        </button>
      </div>

      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-surface-1/90 border border-border rounded-lg text-[11px] font-mono text-text-secondary pointer-events-none">
        3D Viewport: {fileName}
      </div>

      <div ref={mountRef} className="flex-1 w-full h-full min-h-[300px]" />
    </div>
  );
};
