"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { WebGPURenderer } from "three/webgpu";
import styles from "./GlobeScene.module.scss";
import { getCases } from "@/services/caseService";
import { sortCasesByDate } from "@/logic/caseSelectors";

const CAMERA_DISTANCE = 3.6;
const GLOBE_RADIUS = 1.55;

type MarkerMesh = {
  mesh: THREE.Mesh;
  ring: THREE.Mesh;
  phase: number;
};

const cases = sortCasesByDate(getCases(), "desc");

function latLongToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export default function GlobeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!("gpu" in navigator)) {
      setIsSupported(false);
      return;
    }

    let renderer: WebGPURenderer | null = null;
    let controls: OrbitControls | null = null;
    let animationFrame = 0;
    let isDisposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, CAMERA_DISTANCE);

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96);
    const earthTexture = new THREE.TextureLoader().load(
      "/textures/earth-day.png",
    );
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
      emissive: new THREE.Color("#071426"),
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#1d4761"),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframe = new THREE.Mesh(globeGeometry, wireframeMaterial);
    scene.add(wireframe);

    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.04, 96, 96);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#3bb9ff"),
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const ambientLight = new THREE.AmbientLight(0x88a2c9, 0.6);
    const keyLight = new THREE.DirectionalLight(0x9ad6ff, 1);
    keyLight.position.set(4, 2, 3);
    scene.add(ambientLight, keyLight);

    const markerGroup = new THREE.Group();
    const markers: MarkerMesh[] = [];
    const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const ringGeometry = new THREE.RingGeometry(0.04, 0.07, 32);

    cases.forEach((caseFile, index) => {
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#60e4ff"),
        emissive: new THREE.Color("#60e4ff"),
        emissiveIntensity: 1.1,
      });
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#60e4ff"),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      const position = latLongToVector3(
        caseFile.coordinates[0],
        caseFile.coordinates[1],
        GLOBE_RADIUS + 0.02,
      );

      marker.position.copy(position);
      ring.position.copy(position);
      ring.lookAt(position.clone().multiplyScalar(1.05));

      markerGroup.add(marker);
      markerGroup.add(ring);
      markers.push({ mesh: marker, ring, phase: index * 0.7 });
    });

    scene.add(markerGroup);

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 12 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const starsMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#6dd6ff"),
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    renderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
    });

    const initRenderer = async () => {
      if (!renderer) {
        return;
      }

      try {
        await renderer.init();
      } catch (error) {
        if (!isDisposed) {
          setIsSupported(false);
        }
        return;
      }

      if (isDisposed) {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.minDistance = 2.6;
      controls.maxDistance = 5.2;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;

      const render = (time: number) => {
        const pulse = Math.sin(time * 0.0015);
        markers.forEach((marker) => {
          const scale = 1 + 0.25 * Math.sin(time * 0.002 + marker.phase);
          marker.mesh.scale.setScalar(scale);
          marker.ring.material.opacity = 0.45 + 0.25 * (pulse + 1) * 0.5;
        });

        globe.rotation.y += 0.0008;
        wireframe.rotation.y += 0.0008;
        controls?.update();
        renderer?.render(scene, camera);
        animationFrame = window.requestAnimationFrame(render);
      };

      animationFrame = window.requestAnimationFrame(render);
    };

    initRenderer();

    const handleResize = () => {
      if (!renderer) {
        return;
      }

      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      controls?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      globeGeometry.dispose();
      earthTexture.dispose();
      globeMaterial.dispose();
      wireframeMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      markerGeometry.dispose();
      ringGeometry.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      markers.forEach((marker) => {
        const meshMaterial = marker.mesh.material;
        if (Array.isArray(meshMaterial)) {
          meshMaterial.forEach((material) => material.dispose());
        } else {
          meshMaterial.dispose();
        }

        const ringMaterial = marker.ring.material;
        if (Array.isArray(ringMaterial)) {
          ringMaterial.forEach((material) => material.dispose());
        } else {
          ringMaterial.dispose();
        }
      });
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {!isSupported && (
        <div className={styles.fallback}>
          WebGPU is not supported in this browser. Please use a recent
          Chromium-based browser to view the live globe.
        </div>
      )}
    </div>
  );
}
