import { ContentPage } from "@/ui/sections/ContentPage";
import { GlassPanel } from "@/ui/components/GlassPanel";
import styles from "./page.module.scss";

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      subtitle="Our commitment to transparency and minimal data retention."
    >
      <GlassPanel className={styles.panel}>
        <h2>Data Collection</h2>
        <p>
          The Global X-Files Initiative does not collect personal data beyond
          what you voluntarily submit in the Redacted Submissions form. Optional
          contact details are stored only for follow-up verification.
        </p>
      </GlassPanel>
      <GlassPanel className={styles.panel}>
        <h2>Analytics</h2>
        <p>
          Basic usage metrics may be enabled to improve the experience. No
          sensitive personal identifiers are collected.
        </p>
      </GlassPanel>
      <GlassPanel className={styles.panel}>
        <h2>Data Retention</h2>
        <p>
          Submission data is retained only as long as necessary for validation
          and archival purposes. You may request removal of any personal details
          associated with a submission.
        </p>
      </GlassPanel>
    </ContentPage>
  );
}
