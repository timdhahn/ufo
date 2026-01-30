import styles from "./CaseCard.module.scss";
import type { CaseFile } from "@/models/case";
import { Button } from "./Button";

type CaseCardProps = {
  caseFile: CaseFile;
};

export function CaseCard({ caseFile }: CaseCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.caseId}>Case File</span>
        <span className={styles.status}>{caseFile.status}</span>
      </div>
      <h3 className={styles.title}>{caseFile.title}</h3>
      <p className={styles.meta}>
        {caseFile.location} · {caseFile.date}
      </p>
      <p className={styles.summary}>{caseFile.summary}</p>
      <div className={styles.actions}>
        <Button label="Read More" href={`/cases/${caseFile.slug}`} />
        <Button label="Add to Watchlist" variant="ghost" />
      </div>
    </div>
  );
}
