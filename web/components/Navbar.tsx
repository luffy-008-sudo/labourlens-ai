"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  User,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useUserProfile } from "@/lib/UserProfileContext";
import SwarmSyncBadge from "@/components/SwarmSyncBadge";

export default function Navbar() {
  const { lang, setLang } = useTranslation();
  const { profile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/",
      label: "Overview",
      tamilLabel: "முகப்பு",
      icon: Layers,
    },
    {
      href: "/districts",
      label: "District Intelligence",
      tamilLabel: "மாவட்ட ரேடார்",
      icon: BarChart3,
    },
    {
      href: "/routes",
      label: "Learner Roadmap",
      tamilLabel: "தொழில் பாதை",
      icon: Compass,
    },
    {
      href: "/profile",
      label: "Profile & Resume",
      tamilLabel: "சுயவிவரம்",
      icon: User,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F4F4F1] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* ── Brand Logo & Title (Swiss Pill Style) ── */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
            >
              <div className="w-9 h-9 bg-black text-[#F5C518] rounded-full flex items-center justify-center font-extrabold font-mono text-base shrink-0">
                LL
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-black font-mono">
                  LABOURLENS AI
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 bg-[#F5C518] text-black font-extrabold border border-black rounded-full uppercase">
                  TN-38
                </span>
              </div>
            </Link>
          </div>

          {/* ── Desktop Navigation Links ── */}
          <nav className="hidden lg:flex items-center gap-2 font-sans">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/districts"
                  ? pathname === "/districts" || pathname === "/district"
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full font-extrabold text-sm uppercase tracking-tight transition-all border-2 ${
                    isActive
                      ? "bg-[#F5C518] text-black border-black shadow-[2px_2px_0px_0px_#000000]"
                      : "bg-transparent text-black border-transparent hover:border-black hover:bg-white"
                  }`}
                >
                  <span>{lang === "ta" ? link.tamilLabel : link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right Session Status & Controls ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 10-Minute Background Cron Header Badge */}
            <div className="hidden xl:block">
              <SwarmSyncBadge district={profile?.district || "Krishnagiri"} />
            </div>

            {/* User Profile Pill */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white border-2 border-black rounded-full text-sm font-mono font-extrabold shadow-[2px_2px_0px_0px_#000000] hover:bg-[#F5C518] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-black text-[#F5C518] font-extrabold text-xs flex items-center justify-center">
                {(profile?.name || "Guest").charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[120px] text-black">
                {profile?.name || "Guest Learner"}
              </span>
            </Link>

            {/* Bilingual Tamil/English Language Switcher Pill */}
            <div
              className="flex items-center border-2 border-black bg-white rounded-full p-1 text-sm font-mono shadow-[2px_2px_0px_0px_#000000]"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full font-extrabold transition-all text-xs sm:text-sm ${
                  lang === "en"
                    ? "bg-black text-[#F5C518]"
                    : "text-black hover:bg-black/10"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("ta")}
                className={`px-3 py-1 rounded-full font-extrabold transition-all text-xs sm:text-sm ${
                  lang === "ta"
                    ? "bg-black text-[#F5C518]"
                    : "text-black hover:bg-black/10"
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-black border-2 border-black bg-white rounded-full shadow-[2px_2px_0px_0px_#000000] focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Dropdown ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-black py-4 space-y-2 bg-[#F4F4F1]">
            <div className="p-3 mb-2 bg-white border-2 border-black rounded-2xl flex items-center justify-between text-xs font-mono shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black text-[#F5C518] font-bold text-xs flex items-center justify-center">
                  {(profile?.name || "Guest").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-black">{profile?.name || "Guest Learner"}</div>
                  <div className="text-[10px] text-zinc-600 font-mono">{profile?.district || "Krishnagiri"}</div>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1 bg-[#F5C518] text-black border border-black rounded-full font-bold text-[11px]"
              >
                Profile →
              </Link>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/districts"
                  ? pathname === "/districts" || pathname === "/district"
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl flex items-center justify-between font-bold text-xs uppercase tracking-wide transition-all border-2 ${
                    isActive
                      ? "bg-[#F5C518] text-black border-black shadow-[2px_2px_0px_0px_#000000]"
                      : "bg-white text-black border-black/20 hover:border-black"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{lang === "ta" ? link.tamilLabel : link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
