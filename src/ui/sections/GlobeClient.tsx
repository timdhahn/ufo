"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./Hero.module.scss";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => <div className={styles.placeholder}>Booting WebGPU...</div>,
});

export function GlobeClient() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    const target = mountRef.current;
    if (!target) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const rafId = window.requestAnimationFrame(() => {
        setShouldRender(true);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: isMobile ? "0px" : "200px",
        threshold: isMobile ? 0.2 : 0,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div className={styles.globeMount} ref={mountRef}>
      {shouldRender ? (
        <GlobeScene />
      ) : (
        <div className={styles.placeholder}>Booting WebGPU...</div>
      )}
    </div>
  );
}
