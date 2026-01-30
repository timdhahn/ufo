"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { WebGPURenderer } from "three/webgpu";
import styles from "./GlobeScene.module.scss";
import { getCases } from "@/services/caseService";
import { sortCasesByDate } from "@/logic/caseSelectors";
import type { CaseFile } from "@/models/case";
import { GlassPanel } from "../components/GlassPanel";
import { CaseCard } from "../components/CaseCard";
import { feature } from "topojson-client";

const CAMERA_DISTANCE = 3.6;
const GLOBE_RADIUS = 1.55;
const GLOBE_ROTATION_OFFSET = -Math.PI / 2;
const INTRO_DURATION = 7000;
const INTRO_PHASES = {
  galaxyIn: 900,
  galaxyOut: 3600,
  solarIn: 2100,
  solarOut: 5200,
  earthReveal: 4700,
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type MarkerMesh = {
  mesh: THREE.Mesh;
  phase: number;
  caseFile: CaseFile;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const activeMarkerRef = useRef<MarkerMesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pauseRotationRef = useRef(false);
  const targetQuaternionRef = useRef<THREE.Quaternion | null>(null);
  const activeCaseRef = useRef<CaseFile | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [activeCase, setActiveCase] = useState<CaseFile | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const closeActiveCase = useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setPanelVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveCase(null);
      activeMarkerRef.current = null;
      pauseRotationRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.enableRotate = true;
      }
    }, 260);
  }, []);

  useEffect(() => {
    activeCaseRef.current = activeCase;
  }, [activeCase]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!("gpu" in navigator)) {
      setIsSupported(false);
      return;
    }

    pauseRotationRef.current = true;

    let renderer: WebGPURenderer | null = null;
    let animationFrame = 0;
    let isDisposed = false;
    let handlePointerDown: ((event: PointerEvent) => void) | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      450,
    );
    const cameraStart = new THREE.Vector3(0, 0, 220);
    const cameraEnd = new THREE.Vector3(0, 0, CAMERA_DISTANCE);
    camera.position.copy(cameraStart);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = GLOBE_ROTATION_OFFSET;
    scene.add(globeGroup);

    const introGroup = new THREE.Group();
    scene.add(introGroup);

    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyCount = 5200;
    const galaxyPositions = new Float32Array(galaxyCount * 3);
    const galaxyColors = new Float32Array(galaxyCount * 3);
    const galaxyRadius = 140;
    const galaxyArms = 4;
    for (let i = 0; i < galaxyCount; i += 1) {
      const radius = Math.pow(Math.random(), 0.6) * galaxyRadius;
      const armAngle =
        (i % galaxyArms) * ((Math.PI * 2) / galaxyArms) + radius * 0.06;
      const scatter = (Math.random() - 0.5) * 0.8;
      const angle = armAngle + scatter;
      const height = (Math.random() - 0.5) * 12 * (1 - radius / galaxyRadius);
      galaxyPositions[i * 3] = Math.cos(angle) * radius;
      galaxyPositions[i * 3 + 1] = height;
      galaxyPositions[i * 3 + 2] = Math.sin(angle) * radius;

      const coreMix = 1 - radius / galaxyRadius;
      const baseColor = new THREE.Color().setHSL(0.58, 0.7, 0.55 + coreMix * 0.3);
      galaxyColors[i * 3] = baseColor.r;
      galaxyColors[i * 3 + 1] = baseColor.g;
      galaxyColors[i * 3 + 2] = baseColor.b;
    }
    galaxyGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(galaxyPositions, 3),
    );
    galaxyGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(galaxyColors, 3),
    );
    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    galaxyPoints.rotation.x = -0.35;
    introGroup.add(galaxyPoints);

    const solarSystemGroup = new THREE.Group();
    solarSystemGroup.rotation.x = 0.15;
    introGroup.add(solarSystemGroup);
    const planetMaterials: THREE.MeshStandardMaterial[] = [];
    const planetGeometries: THREE.SphereGeometry[] = [];

    const sunGeometry = new THREE.SphereGeometry(2.1, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffcc7a"),
      emissive: new THREE.Color("#ffb347"),
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    const sunPosition = new THREE.Vector3(6, 3, 104);
    sun.position.copy(sunPosition);
    solarSystemGroup.add(sun);

    const sunLight = new THREE.PointLight(0xffcf87, 1.2, 120, 2);
    sunLight.position.copy(sunPosition);
    solarSystemGroup.add(sunLight);

    const saturnGeometry = new THREE.SphereGeometry(1.25, 28, 28);
    const saturnMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8b48a"),
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    const saturnPosition = new THREE.Vector3(6.2, -0.6, 40);
    saturn.position.copy(saturnPosition);
    solarSystemGroup.add(saturn);

    const saturnRingGeometry = new THREE.RingGeometry(1.8, 2.9, 64);
    const saturnRingMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e1c49a"),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRing.position.copy(saturnPosition);
    saturnRing.rotation.x = Math.PI * 0.55;
    saturnRing.rotation.y = Math.PI * 0.2;
    saturnRing.rotation.z = Math.PI * 0.1;
    solarSystemGroup.add(saturnRing);

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#5fd8ff"),
      transparent: true,
      opacity: 0,
    });
    const orbitCurve = new THREE.EllipseCurve(
      0,
      0,
      12,
      7,
      0,
      Math.PI * 2,
      false,
      0,
    );
    const orbitPoints = orbitCurve.getPoints(120);
    orbitPoints.push(orbitPoints[0].clone());
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = Math.PI * 0.35;
    orbitLine.rotation.z = Math.PI * 0.1;
    orbitLine.position.copy(sunPosition);
    solarSystemGroup.add(orbitLine);

    const addPlanet = (options: {
      radius: number;
      color: string;
      position: THREE.Vector3;
    }) => {
      const geometry = new THREE.SphereGeometry(options.radius, 22, 22);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(options.color),
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(options.position);
      solarSystemGroup.add(mesh);
      planetGeometries.push(geometry);
      planetMaterials.push(material);
    };

    addPlanet({
      radius: 0.22,
      color: "#a3927a",
      position: new THREE.Vector3(-2.6, 0.5, 82),
    });
    addPlanet({
      radius: 0.42,
      color: "#d6b48a",
      position: new THREE.Vector3(2.8, -0.2, 74),
    });
    addPlanet({
      radius: 0.32,
      color: "#b5644d",
      position: new THREE.Vector3(-2.1, 0.3, 62),
    });
    addPlanet({
      radius: 0.95,
      color: "#d7b18a",
      position: new THREE.Vector3(3.4, -0.6, 52),
    });
    addPlanet({
      radius: 0.62,
      color: "#8cc2d6",
      position: new THREE.Vector3(-3.2, -0.8, 30),
    });
    addPlanet({
      radius: 0.58,
      color: "#5b76d6",
      position: new THREE.Vector3(2.4, 0.4, 22),
    });

    const earthIntroGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32);
    const earthIntroMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2f7dd9"),
      emissive: new THREE.Color("#1a4f99"),
      emissiveIntensity: 0.35,
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    });
    const earthIntro = new THREE.Mesh(earthIntroGeometry, earthIntroMaterial);
    earthIntro.position.set(0, 0, 0);
    solarSystemGroup.add(earthIntro);

    const moonGeometry = new THREE.SphereGeometry(0.28, 20, 20);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#cfd6e0"),
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(GLOBE_RADIUS + 0.55, 0.15, 0);
    const moonGroup = new THREE.Group();
    moonGroup.position.set(0, 0, 0);
    moonGroup.add(moon);
    solarSystemGroup.add(moonGroup);

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#0a1524"),
      roughness: 0.5,
      metalness: 0.15,
      emissive: new THREE.Color("#0b1f33"),
      transparent: true,
      opacity: 0,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    const wireframeBaseOpacity = 0.25;
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#1d4761"),
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const wireframe = new THREE.Mesh(globeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    const atmosphereBaseOpacity = 0.18;
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.04, 96, 96);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#3bb9ff"),
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphere);

    const ambientLight = new THREE.AmbientLight(0x88a2c9, 0.6);
    const keyLight = new THREE.DirectionalLight(0x9ad6ff, 1);
    keyLight.position.set(4, 2, 3);
    scene.add(ambientLight, keyLight);

    let introStart = 0;
    let introComplete = false;

    const cameraPosition = new THREE.Vector3();
    const cameraLookAt = new THREE.Vector3(0, 0, 0);

    const markerGroup = new THREE.Group();
    const markers: MarkerMesh[] = [];
    let countryLines: THREE.LineSegments | null = null;
    let countryGlow: THREE.LineSegments | null = null;
    let countryGeometry: THREE.BufferGeometry | null = null;
    let countryMaterial: THREE.LineBasicMaterial | null = null;
    let countryGlowMaterial: THREE.LineBasicMaterial | null = null;
    const countryBaseOpacity = 0.38;
    const countryGlowBaseOpacity = 0.16;
    const markerGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    cases.forEach((caseFile, index) => {
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#60e4ff"),
        emissive: new THREE.Color("#60e4ff"),
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      const position = latLongToVector3(
        caseFile.coordinates[0],
        caseFile.coordinates[1],
        GLOBE_RADIUS + 0.02,
      );

      marker.position.copy(position);

      marker.userData.caseFile = caseFile;
      markerGroup.add(marker);
      markers.push({ mesh: marker, phase: index * 0.7, caseFile });
    });

    globeGroup.add(markerGroup);

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

    const loadCountryOutlines = async () => {
      try {
        const response = await fetch("/data/world-110m.json");
        if (!response.ok) {
          return;
        }

        const worldData = await response.json();
        if (isDisposed) {
          return;
        }

        const countries = feature(
          worldData,
          worldData.objects.countries,
        ) as GeoJSON.FeatureCollection;

        const positions: number[] = [];
        const outlineRadius = GLOBE_RADIUS + 0.012;

        const appendRing = (ring: number[][]) => {
          if (ring.length < 2) {
            return;
          }
          for (let i = 0; i < ring.length; i += 1) {
            const [lon1, lat1] = ring[i];
            const [lon2, lat2] = ring[(i + 1) % ring.length];
            const start = latLongToVector3(lat1, lon1, outlineRadius);
            const end = latLongToVector3(lat2, lon2, outlineRadius);
            positions.push(start.x, start.y, start.z);
            positions.push(end.x, end.y, end.z);
          }
        };

        countries.features.forEach((country) => {
          const geometry = country.geometry;
          if (!geometry) {
            return;
          }

          if (geometry.type === "Polygon") {
            geometry.coordinates.forEach((ring) => appendRing(ring));
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((polygon) => {
              polygon.forEach((ring) => appendRing(ring));
            });
          }
        });

        countryGeometry = new THREE.BufferGeometry();
        countryGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3),
        );

        countryMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color("#60e4ff"),
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });

        countryGlowMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color("#60e4ff"),
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });

        countryGlow = new THREE.LineSegments(countryGeometry, countryGlowMaterial);
        countryLines = new THREE.LineSegments(countryGeometry, countryMaterial);
        globeGroup.add(countryGlow);
        globeGroup.add(countryLines);
      } catch (error) {
        // ignore outline load failures
      }
    };

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
      loadCountryOutlines();

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.minDistance = 2.6;
      controls.maxDistance = 5.2;
      controls.autoRotate = false;
      controls.enabled = false;
      controls.enableRotate = false;
      controlsRef.current = controls;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      handlePointerDown = (event: PointerEvent) => {
        if (!renderer) {
          return;
        }
        if (!introComplete) {
          return;
        }

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          markers.map((marker) => marker.mesh),
          false,
        );

        if (hits.length > 0) {
          const hitMarker = hits[0].object as THREE.Mesh;
          const caseFile = hitMarker.userData.caseFile as CaseFile | undefined;
          if (caseFile) {
            const found = markers.find(
              (marker) => marker.caseFile.id === caseFile.id,
            );
            activeMarkerRef.current = found ?? null;
            pauseRotationRef.current = true;
            controls.enableRotate = false;
            targetQuaternionRef.current = new THREE.Quaternion().setFromUnitVectors(
              (found?.mesh.position ?? hitMarker.position).clone().normalize(),
              new THREE.Vector3(0, 0, 1),
            );
            if (closeTimeoutRef.current) {
              window.clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
            setActiveCase(caseFile);
            setPanelVisible(true);
          }
        } else if (activeCaseRef.current) {
          closeActiveCase();
        }
      };

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);

      const render = (time: number) => {
        if (!introStart) {
          introStart = time;
        }

        const introElapsed = time - introStart;
        const introProgress = easeInOutCubic(
          clamp01(introElapsed / INTRO_DURATION),
        );
        const introActive = introElapsed < INTRO_DURATION;
        const galaxyFadeIn = easeInOutCubic(
          clamp01(introElapsed / INTRO_PHASES.galaxyIn),
        );
        const galaxyFadeOut =
          1 -
          easeInOutCubic(
            clamp01((introElapsed - INTRO_PHASES.galaxyOut) / 1800),
          );
        const galaxyOpacity = galaxyFadeIn * galaxyFadeOut;
        const solarFadeIn = easeInOutCubic(
          clamp01((introElapsed - INTRO_PHASES.solarIn) / 1200),
        );
        const solarFadeOut =
          1 -
          easeInOutCubic(
            clamp01((introElapsed - INTRO_PHASES.solarOut) / 1200),
          );
        const solarOpacity = solarFadeIn * solarFadeOut;
        const detailReveal = easeInOutCubic(
          clamp01((introElapsed - INTRO_PHASES.earthReveal) / 1200),
        );

        galaxyMaterial.opacity = introActive ? galaxyOpacity : 0;
        sunMaterial.opacity = introActive ? solarOpacity : 0;
        saturnMaterial.opacity = introActive ? solarOpacity : 0;
        saturnRingMaterial.opacity = introActive ? solarOpacity * 0.95 : 0;
        orbitMaterial.opacity = introActive ? solarOpacity * 0.35 : 0;
        sunLight.intensity = introActive ? 1.2 * solarOpacity : 0;
        planetMaterials.forEach((material) => {
          material.opacity = introActive ? solarOpacity : 0;
        });
        earthIntroMaterial.opacity = introActive
          ? solarOpacity * (1 - detailReveal)
          : 0;
        moonMaterial.opacity = earthIntroMaterial.opacity;

        if (introActive) {
          galaxyPoints.rotation.y += 0.00008;
          solarSystemGroup.rotation.y += 0.0002;
          moonGroup.rotation.y += 0.0022;
        }

        wireframeMaterial.opacity = wireframeBaseOpacity * (introActive ? detailReveal : 1);
        atmosphereMaterial.opacity =
          atmosphereBaseOpacity * (introActive ? detailReveal : 1);
        globeMaterial.emissiveIntensity = 0.25 + 0.75 * (introActive ? detailReveal : 1);
        globeMaterial.opacity = introActive ? detailReveal : 1;
        globe.visible = !introActive || detailReveal > 0.02;

        if (countryMaterial) {
          countryMaterial.opacity = countryBaseOpacity * (introActive ? detailReveal : 1);
        }
        if (countryGlowMaterial) {
          countryGlowMaterial.opacity =
            countryGlowBaseOpacity * (introActive ? detailReveal : 1);
        }

        markers.forEach((marker) => {
          const scale = 1 + 0.25 * Math.sin(time * 0.002 + marker.phase);
          marker.mesh.scale.setScalar(scale);
          const markerMaterial = marker.mesh
            .material as THREE.MeshStandardMaterial;
          markerMaterial.opacity = introActive ? detailReveal : 1;
        });

        ambientLight.intensity = 0.25 + 0.35 * (introActive ? detailReveal : 1);
        keyLight.intensity = 0.6 + 0.4 * (introActive ? detailReveal : 1);

        if (introActive) {
          cameraPosition.lerpVectors(cameraStart, cameraEnd, introProgress);
          camera.position.copy(cameraPosition);
          camera.lookAt(cameraLookAt);
        } else if (!introComplete) {
          introComplete = true;
          introGroup.visible = false;
          globeMaterial.opacity = 1;
          globeMaterial.transparent = false;
          globeMaterial.needsUpdate = true;
          camera.position.copy(cameraEnd);
          camera.lookAt(cameraLookAt);
          pauseRotationRef.current = false;
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.enableRotate = true;
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
        }

        if (introComplete) {
          if (targetQuaternionRef.current) {
            globeGroup.quaternion.slerp(targetQuaternionRef.current, 0.08);
            if (
              globeGroup.quaternion.angleTo(targetQuaternionRef.current) < 0.001
            ) {
              globeGroup.quaternion.copy(targetQuaternionRef.current);
              targetQuaternionRef.current = null;
            }
          } else if (!pauseRotationRef.current) {
            globeGroup.rotation.y += 0.0006;
          }
          controlsRef.current?.update();
        }

        renderer?.render(scene, camera);

        const activeMarker = activeMarkerRef.current;
        if (
          activeMarker &&
          lineRef.current &&
          cardRef.current &&
          containerRef.current
        ) {
          const markerPosition = new THREE.Vector3();
          activeMarker.mesh.getWorldPosition(markerPosition);
          markerPosition.project(camera);

          const containerRect = containerRef.current.getBoundingClientRect();
          const cardRect = cardRef.current.getBoundingClientRect();
          const markerX =
            (markerPosition.x * 0.5 + 0.5) * containerRect.width;
          const markerY =
            (-markerPosition.y * 0.5 + 0.5) * containerRect.height;
          const anchorX = cardRect.left - containerRect.left + 24;
          const anchorY = cardRect.top - containerRect.top + 40;

          const dx = anchorX - markerX;
          const dy = anchorY - markerY;
          const length = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);

          lineRef.current.style.width = `${length}px`;
          lineRef.current.style.transform = `translate(${markerX}px, ${markerY}px) rotate(${angle}rad)`;
        }

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
      controlsRef.current?.dispose();
      controlsRef.current = null;
      if (renderer?.domElement && handlePointerDown) {
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      }

      globeGeometry.dispose();
      globeMaterial.dispose();
      wireframeMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      markerGeometry.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      markers.forEach((marker) => {
        const meshMaterial = marker.mesh.material;
        if (Array.isArray(meshMaterial)) {
          meshMaterial.forEach((material) => material.dispose());
        } else {
          meshMaterial.dispose();
        }
      });

      scene.remove(introGroup);
      galaxyGeometry.dispose();
      galaxyMaterial.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      saturnGeometry.dispose();
      saturnMaterial.dispose();
      saturnRingGeometry.dispose();
      saturnRingMaterial.dispose();
      orbitGeometry.dispose();
      orbitMaterial.dispose();
      earthIntroGeometry.dispose();
      earthIntroMaterial.dispose();
      moonGeometry.dispose();
      moonMaterial.dispose();
      planetGeometries.forEach((geometry) => geometry.dispose());
      planetMaterials.forEach((material) => material.dispose());

      if (countryLines) {
        globeGroup.remove(countryLines);
      }
      if (countryGlow) {
        globeGroup.remove(countryGlow);
      }
      countryGeometry?.dispose();
      countryMaterial?.dispose();
      countryGlowMaterial?.dispose();

      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [closeActiveCase]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
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
      {activeCase && (
        <div
          className={`${styles.overlay} ${
            panelVisible ? styles.overlayVisible : styles.overlayHidden
          }`}
        >
          <div className={styles.connector} ref={lineRef} />
          <div className={styles.card} ref={cardRef}>
            <button
              className={styles.closeButton}
              type="button"
              onClick={closeActiveCase}
              aria-label="Close case file"
            >
              x
            </button>
            <GlassPanel>
              <CaseCard caseFile={activeCase} />
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
