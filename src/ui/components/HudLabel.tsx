import styles from "./HudLabel.module.scss";

type HudLabelProps = {
  text: string;
  accent?: "primary" | "muted";
};

export function HudLabel({ text, accent = "primary" }: HudLabelProps) {
  const className =
    accent === "primary" ? styles.primary : styles.muted;

  return <span className={className}>{text}</span>;
}
