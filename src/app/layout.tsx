import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import styles from "./layout.module.scss";
import "./globals.scss";
import { SiteNav } from "@/ui/sections/SiteNav";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Global X-Files Initiative",
  description: "A cinematic, data-driven archive of global UAP sightings.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${spaceGrotesk.variable}`}>
        <div className={styles.page}>
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
