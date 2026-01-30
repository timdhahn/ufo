import { ReactNode } from "react";
import styles from "./GlassPanel.module.scss";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className }: GlassPanelProps) {
  const combinedClassName = className
    ? `${styles.panel} ${className}`
    : styles.panel;

  return <div className={combinedClassName}>{children}</div>;
}
