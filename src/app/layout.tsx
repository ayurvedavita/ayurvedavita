import type { Metadata } from "next";
import { getTheme } from "@/lib/theme-server";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ayurveda•Vita", template: "%s – Ayurveda•Vita" },
  description: "Ayurveda retreats, courses and consultations in Switzerland, Italy, India and Greece.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();
  return (
    <html lang="en" data-theme={theme} className={fontVariables}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
