import styles from "./Hero.module.scss";
import { Button } from "../components/Button";
import { GlassPanel } from "../components/GlassPanel";
import { DataPill } from "../components/DataPill";
import { GlobeClient } from "./GlobeClient";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <p className={styles.kicker}>Global archive</p>
        <h1 className={styles.title}>Global anomalous activity, one map.</h1>
        <p className={styles.subtitle}>
          A cinematic, data-driven archive of sightings and high-strangeness
          events from 1940 to present.
        </p>
        <div className={styles.metrics}>
          <DataPill label="Active Cases" value="1,432" />
          <DataPill label="Unresolved" value="987" />
        </div>
        <div className={styles.actions} />
      </div>
      <GlassPanel className={styles.heroFrame}>
        <div id="global-map" className={styles.anchor} />
        <div className={styles.globeWrap}>
          <GlobeClient />
        </div>
      </GlassPanel>
    </section>
  );
}
