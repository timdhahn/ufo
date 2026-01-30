import { ContentPage } from "@/ui/sections/ContentPage";
import { GlassPanel } from "@/ui/components/GlassPanel";
import { Button } from "@/ui/components/Button";
import styles from "./page.module.scss";

export default function SubmissionsPage() {
  return (
    <ContentPage
      title="Redacted Submissions"
      subtitle="Submit a sighting for review. All submissions are marked unverified until validated."
    >
      <GlassPanel className={styles.panel}>
        <form className={styles.form}>
          <label className={styles.field}>
            <span>Name or Alias</span>
            <input type="text" placeholder="Agent or witness name" />
          </label>
          <label className={styles.field}>
            <span>Email (optional)</span>
            <input type="email" placeholder="contact@domain.com" />
          </label>
          <label className={styles.field}>
            <span>Date of Event</span>
            <input type="date" />
          </label>
          <label className={styles.field}>
            <span>Location</span>
            <input type="text" placeholder="City, Region, Country" />
          </label>
          <label className={styles.field}>
            <span>Classification</span>
            <select>
              <option>Unverified</option>
              <option>Unknown</option>
              <option>Likely Explained</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Report Summary</span>
            <textarea rows={5} placeholder="Describe what happened." />
          </label>
          <label className={styles.field}>
            <span>Evidence URL</span>
            <input type="url" placeholder="https://..." />
          </label>
          <div className={styles.actions}>
            <Button label="Transmit Report" />
          </div>
        </form>
      </GlassPanel>
    </ContentPage>
  );
}
