import { notFound } from "next/navigation";
import styles from "./page.module.scss";
import { getCaseBySlug, getCases } from "@/services/caseService";
import { GlassPanel } from "@/ui/components/GlassPanel";
import { Button } from "@/ui/components/Button";
import { DataPill } from "@/ui/components/DataPill";
import { HudLabel } from "@/ui/components/HudLabel";

type CasePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCases().map((caseFile) => ({ slug: caseFile.slug }));
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const caseFile = getCaseBySlug(slug);

  if (!caseFile) {
    notFound();
  }

  const primaryMedia = caseFile.media[0];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <HudLabel text="Case File" />
        <h1 className={styles.title}>{caseFile.title}</h1>
        <div className={styles.subhead}>
          <span>{caseFile.date}</span>
          <span>{caseFile.location}</span>
        </div>
      </div>

      <section className={styles.contentGrid}>
        <GlassPanel className={styles.mediaPanel}>
          <div className={styles.mediaPlaceholder}>
            <div className={styles.mediaIcon}>PLAY</div>
            <div>
              {primaryMedia?.type ?? "media"} placeholder
              {primaryMedia?.caption ? ` - ${primaryMedia.caption}` : ""}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className={styles.briefPanel}>
          <div className={styles.briefHeader}>
            <h2>Mission Brief</h2>
            <div className={styles.pills}>
              <DataPill label="Status" value={caseFile.status} />
              <DataPill label="Severity" value={caseFile.severity} />
            </div>
          </div>
          <div className={styles.briefBody}>
            <p>{caseFile.summary}</p>
            <div className={styles.briefMeta}>
              <span>Date: {caseFile.date}</span>
              <span>Location: {caseFile.location}</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className={styles.analysisPanel}>
          <h3>Initial Analysis</h3>
          <p>
            Reports indicate sustained visual contact and coordinated witness
            accounts. Additional corroboration and archival sources pending.
          </p>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <span>20:00</span>
              <span>First sightings reported.</span>
            </div>
            <div className={styles.timelineItem}>
              <span>20:22</span>
              <span>Object crosses metro corridor.</span>
            </div>
            <div className={styles.timelineItem}>
              <span>20:40</span>
              <span>Multiple camera feeds captured.</span>
            </div>
          </div>
        </GlassPanel>
      </section>

      <div className={styles.footer}>
        <Button label="Return to Global Map" href="/#global-map" />
      </div>
    </main>
  );
}
