import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppLayoutShell from "@/components/AppLayoutShell";
import { LanguageProvider } from "@/lib/i18n";
import { UserProfileProvider } from "@/lib/UserProfileContext";

export const metadata: Metadata = {
  title: "Labourlens AI — Autonomous Workforce Intelligence & Core Industry Routing",
  description:
    "Labourlens AI — Real-time background swarms continuously ingest 50–100+ verified government, NAPS apprenticeship, and private industrial sources across all 38 Tamil Nadu districts to eliminate forced urban migration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#F4F4F1] text-black antialiased selection:bg-[#F5C518] selection:text-black">
        <LanguageProvider>
          <UserProfileProvider>
            <Navbar />
            <AppLayoutShell>{children}</AppLayoutShell>
            <Footer />
          </UserProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
