import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Global X-Files Initiative",
  description: "A cinematic, data-driven archive of global UAP sightings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
