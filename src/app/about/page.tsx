import { ContentPage } from "@/ui/sections/ContentPage";
import { GlassPanel } from "@/ui/components/GlassPanel";
import styles from "./page.module.scss";

export default function AboutPage() {
  return (
    <ContentPage
      title="About the Initiative"
      subtitle="A global archive of high-strangeness encounters built for clarity, curiosity, and context."
    >
      <GlassPanel className={styles.panel}>
        <p>
          The Global X-Files Initiative is a curated index of anomalous
          sightings and unexplained events, designed to surface patterns across
          time and geography. We emphasize verified sources, eyewitness
          consistency, and transparent classification.
        </p>
      </GlassPanel>
      <GlassPanel className={styles.panel}>
        <h2>Core Principles</h2>
        <ul>
          <li>Evidence-first storytelling with clear sourcing.</li>
          <li>Context over sensationalism.</li>
          <li>Open categorization for future reanalysis.</li>
        </ul>
      </GlassPanel>
    </ContentPage>
  );
}
