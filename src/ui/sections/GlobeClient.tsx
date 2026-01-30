"use client";

import dynamic from "next/dynamic";
import styles from "./Hero.module.scss";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => <div className={styles.placeholder}>Booting WebGPU...</div>,
});

export function GlobeClient() {
  return <GlobeScene />;
}
