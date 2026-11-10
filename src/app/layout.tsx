import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Thai, Mali, Nanum_Pen_Script, Sriracha } from "next/font/google";
import "./globals.css";

// Print face for the planner; Thai and Latin in one family.
const plex = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

// Marker hand for your own entries (Latin), with Sriracha covering Thai.
const nanum = Nanum_Pen_Script({ subsets: ["latin"], weight: "400", variable: "--font-nanum", display: "swap" });
const sriracha = Sriracha({ subsets: ["latin", "thai"], weight: "400", variable: "--font-sriracha", display: "swap" });

// Only used by the "Rounded" font choice.
const mali = Mali({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
  variable: "--font-mali",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "Life Planner", template: "%s | Life Planner" },
  description: "Personal life planner and daily organizer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e9e3d6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${nanum.variable} ${sriracha.variable} ${mali.variable}`}>
      <body>{children}</body>
    </html>
  );
}
