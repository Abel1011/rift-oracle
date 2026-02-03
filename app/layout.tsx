import type { Metadata } from "next";
import "./globals.css";
import { DraftConfigProvider } from "@/lib/context/DraftConfigContext";

export const metadata: Metadata = {
  title: "RIFT ORACLE | AI-Powered LoL Draft Strategy",
  description: "Professional esports draft intelligence platform. Real-time predictions, team scouting, composition analysis, and strategic recommendations powered by GRID data.",
  keywords: "League of Legends, LoL, Draft, Esports, AI, Strategy, Pick Ban, Pro Play, Scouting",
  authors: [{ name: "Cloud9 x JetBrains Hackathon 2026" }],
  openGraph: {
    title: "RIFT ORACLE",
    description: "AI-Powered Draft Intelligence for League of Legends Esports",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Marcellus&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <DraftConfigProvider>
          {children}
        </DraftConfigProvider>
      </body>
    </html>
  );
}
