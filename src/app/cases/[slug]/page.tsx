import Image from "next/image";
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

  const mediaList = caseFile.media ?? [];
  const primaryMedia = mediaList[0];
  const mediaLabel = primaryMedia?.type === "video" ? "PLAY" : "VIEW";
  const mediaImage =
    primaryMedia?.type === "image" ? primaryMedia.src : "/textures/earth-day.png";
  const mediaAlt = primaryMedia?.caption ?? "Case media placeholder";
  const readMore = caseFile.readMore?.split("\n\n") ?? [];

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
          <div className={styles.mediaFrame}>
            <Image
              alt={mediaAlt}
              className={styles.mediaImage}
              fill
              priority={false}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 520px"
              src={mediaImage}
            />
            <div className={styles.mediaOverlay}>
              <div className={styles.mediaIcon}>{mediaLabel}</div>
              <div>
                {primaryMedia?.type ?? "media"} placeholder
                {primaryMedia?.caption ? ` - ${primaryMedia.caption}` : ""}
              </div>
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

        {readMore.length > 0 ? (
          <GlassPanel className={styles.readMorePanel}>
            <h3>Read More</h3>
            <div className={styles.readMoreBody}>
              {readMore.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </GlassPanel>
        ) : null}
      </section>

      <div className={styles.footer}>
        <Button label="Return to Global Map" href="/#global-map" />
      </div>
    </main>
  );
}
