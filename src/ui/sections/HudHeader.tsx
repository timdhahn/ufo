import styles from "./HudHeader.module.scss";
import { HudLabel } from "../components/HudLabel";
import { DataPill } from "../components/DataPill";

export function HudHeader() {
  return (
    <header className={styles.header}>
      <HudLabel text="Global X-Files Initiative" />
      <div className={styles.metaRow}>
        <DataPill label="Active Cases" value="1,432" />
        <DataPill label="Unresolved" value="987" />
      </div>
    </header>
  );
}
