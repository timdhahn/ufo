import { ReactNode } from "react";
import styles from "./ContentPage.module.scss";
import Link from "next/link";

type ContentPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ContentPage({
  title,
  subtitle,
  children,
}: ContentPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <nav className={styles.breadcrumbs}>
            <Link href="/">Global Map</Link>
            <span>/</span>
            <span>{title}</span>
          </nav>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}
