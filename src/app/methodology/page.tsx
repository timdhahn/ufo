import { ContentPage } from "@/ui/sections/ContentPage";
import { GlassPanel } from "@/ui/components/GlassPanel";
import styles from "./page.module.scss";

export default function MethodologyPage() {
  return (
    <ContentPage
      title="Methodology"
      subtitle="How cases are evaluated, classified, and presented on the map."
    >
      <GlassPanel className={styles.panel}>
        <h2>Data Intake</h2>
        <p>
          Each case is reviewed for origin, documentation quality, and
          corroboration. Reports with multiple independent witnesses and
          contemporaneous media are prioritized.
        </p>
      </GlassPanel>
      <GlassPanel className={styles.panel}>
        <h2>Classification</h2>
        <ul>
          <li>Unresolved: credible reports without a settled explanation.</li>
          <li>Likely Explained: strong evidence for conventional causes.</li>
          <li>Unknown: conflicting data or incomplete corroboration.</li>
        </ul>
      </GlassPanel>
      <GlassPanel className={styles.panel}>
        <h2>Transparency</h2>
        <p>
          We maintain clear metadata for each case, including date, location,
          severity, and source notes. Classifications are open to revision as
          new evidence emerges.
        </p>
      </GlassPanel>
    </ContentPage>
  );
}
