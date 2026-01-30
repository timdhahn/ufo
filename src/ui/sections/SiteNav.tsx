"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./SiteNav.module.scss";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Methodology", href: "/methodology" },
  { label: "Submissions", href: "/submissions" },
  { label: "Privacy", href: "/privacy" },
];

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className={styles.nav} data-open={isOpen}>
      <div className={styles.navInner}>
        <Link className={styles.brand} href="/">
          Global X-Files Initiative
        </Link>
        <nav className={styles.links}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className={styles.toggle}
          type="button"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={styles.mobilePanel} data-open={isOpen}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
