"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import HeroSection from "@/components/HeroSection";
import BentoFeaturesSection from "@/components/BentoFeaturesSection";

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="w-full min-h-screen bg-[#F4F4F1] flex flex-col font-sans">
      {/* ── On Home Page: Swiss Editorial Hero Section ── */}
      {isHomePage && (
        <>
          <HeroSection />
          <BentoFeaturesSection />
        </>
      )}

      {/* ── Main App Shell: Left Sidebar (User ID, Auth, Nav) + Main Workspace ── */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row flex-grow px-2 sm:px-4 py-6 gap-6">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Right Content Area */}
        <main className="flex-1 w-full min-w-0 bg-[#F4F4F1] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
