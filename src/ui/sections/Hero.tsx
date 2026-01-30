import styles from "./Hero.module.scss";
import { Button } from "../components/Button";
import { GlassPanel } from "../components/GlassPanel";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <p className={styles.kicker}>Global X-Files Initiative</p>
        <h1 className={styles.title}>Global anomalous activity, one map.</h1>
        <p className={styles.subtitle}>
          A cinematic, data-driven archive of sightings and high-strangeness
          events from 1940 to present.
        </p>
        <div className={styles.actions}>
          <Button label="Enter Global Map" href="/" />
          <Button label="View Methodology" href="/methodology" variant="ghost" />
        </div>
      </div>
      <GlassPanel className={styles.heroFrame}>
        <div className={styles.placeholder}>
          Globe placeholder (WebGPU coming next)
        </div>
      </GlassPanel>
    </section>
  );
}
