import styles from "./DataPill.module.scss";

type DataPillProps = {
  label: string;
  value: string;
};

export function DataPill({ label, value }: DataPillProps) {
  return (
    <div className={styles.pill}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
