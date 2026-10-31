"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  User,
  ShieldCheck,
  BarChart3,
  Building,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle2,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Terminal,
} from "lucide-react";
import { useUserProfile } from "@/lib/UserProfileContext";
import { useTranslation } from "@/lib/i18n";

export default function HeroSection() {
  const { profile } = useUserProfile();
  const { lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<"psu" | "private" | "iti">("psu");

  return (
    <section className="w-full bg-[#F4F4F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* ── Main Swiss Framed Sheet (Inspired by Reference) ── */}
      <div className="max-w-7xl mx-auto bg-white border-2 border-black rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 md:p-14 shadow-[6px_6px_0px_0px_#000000]">

        {/* ── 2-Column Asymmetric Swiss Editorial Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* ══════════════════════════════════════════════════════════════
              LEFT COLUMN: HERO TYPOGRAPHY & CALL TO ACTION
          ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">

            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#FAF9F5] border-2 border-black rounded-full font-mono text-sm font-extrabold text-black shadow-[2px_2px_0px_0px_#000000]">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse border border-black" />
              <span>
                {lang === "ta"
                  ? "தமிழ்நாடு 38 மாவட்டங்கள் இயக்கம் • 88 தகவல் வாயில்கள்"
                  : "TAMIL NADU 38 DISTRICTS ACTIVE • 88 SOURCES VERIFIED"}
              </span>
            </div>

            {/* Main Bold Headline (Grotesk Heavy) */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-black tracking-tight leading-[1.05] font-sans uppercase">
                Labourlens AI <br />
                <span className="underline decoration-[#F5C518] decoration-wavy decoration-4">
                  Workforce
                </span>{" "}
                Intelligence.
              </h1>
              <p className="text-base font-mono font-extrabold text-zinc-700 uppercase tracking-wider pt-1">
                {lang === "ta"
                  ? "கற்றல் மற்றும் வேலைவாய்ப்பு ஒருங்கிணைப்பு தளம்"
                  : "Predictive District Mismatch & Anti-Migration Routing Engine"}
              </p>
            </div>

            {/* Subtitle / Paragraph */}
            <p className="text-lg sm:text-xl text-zinc-900 max-w-2xl leading-relaxed font-sans font-medium">
              {lang === "ta"
                ? "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் உள்ள SIPCOT, அரசு தொழிற்பயிற்சி நிலையங்கள் (ITI), மற்றும் NAPS தொழிற்பழகுநர் வாய்ப்புகளை 10 நிமிட இடைவெளியில் ஆய்வு செய்து உள்ளூர் இளைஞர்களுக்கு நேரடி வேலைவாய்ப்பு வழிகாட்டுகிறது."
                : "Autonomous background agents analyzing 50–100+ verified government, NAPS apprenticeship, and private SIPCOT industrial sources every 10 minutes to route local learners to core careers near home."}
            </p>

            {/* CTA Buttons (Signature Swiss Yellow Button) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/districts"
                className="btn-swiss-yellow inline-flex items-center justify-center gap-2.5 text-sm sm:text-base group"
              >
                <span>
                  {lang === "ta"
                    ? "மாவட்ட ரேடாரை பார்க்க ->"
                    : "Explore District Intelligence ->"}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/routes"
                className="btn-swiss-white inline-flex items-center justify-center gap-2 text-sm sm:text-base group"
              >
                <Compass className="w-4 h-4 text-black group-hover:rotate-45 transition-transform" />
                <span>
                  {lang === "ta" ? "தொழில் பாதை வழிகாட்டி" : "Learner Roadmaps"}
                </span>
              </Link>
            </div>

            {/* User Session Quick Meta */}
            {profile.isLoggedIn && (
              <div className="pt-2 flex items-center gap-2.5 text-sm font-mono text-zinc-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                <span>
                  Candidate Active: <strong className="text-black bg-[#F5C518] px-1.5 py-0.5 rounded">{profile.name}</strong> ({profile.district})
                </span>
              </div>
            )}

          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: EDITORIAL FEATURE GRAPHIC BOX & TELEMETRY
          ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 relative">

            {/* Floating Top Pill Badge (Speech Bubble Style) */}
            <div className="absolute -top-4 -right-2 sm:-top-5 sm:right-6 z-20 px-4 py-2 bg-[#F5C518] text-black border-2 border-black rounded-full font-mono text-sm font-extrabold shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span>88 Sources • Real-Time Swarm</span>
            </div>

            {/* Main Graphic Container (Neo-Brutalist Frame) */}
            <div className="bg-[#FAF9F5] border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] relative space-y-6">

              {/* Graphic Header Pill */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#F5C518] border-2 border-black" />
                  <span className="font-mono text-sm font-extrabold uppercase text-black">
                    Live Telemetry Core
                  </span>
                </div>
                <span className="px-3 py-1 bg-white border border-black rounded-full font-mono text-xs font-extrabold text-black">
                  AUTONOMOUS
                </span>
              </div>

              {/* Graphical Tabs (Govt / Private / ITI) */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-white border-2 border-black rounded-2xl">
                {[
                  { id: "psu", label: "Govt / PSU" },
                  { id: "private", label: "Private Core" },
                  { id: "iti", label: "Govt ITI" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`py-2 text-center font-mono text-sm font-extrabold rounded-xl transition-all ${
                      activeTab === t.id
                        ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                        : "text-zinc-700 hover:text-black hover:bg-zinc-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Feature Box */}
              <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-4 shadow-[3px_3px_0px_0px_#000000]">
                {activeTab === "psu" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-100">
                      <span className="text-sm font-mono font-extrabold text-black uppercase">
                        🏛️ Statutory PSU Cadre
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-black rounded-full font-mono text-xs font-extrabold">
                        Central / State
                      </span>
                    </div>
                    <p className="text-base text-zinc-900 leading-relaxed font-sans font-medium">
                      Verified pay scales for NLC, BHEL, TANGEDCO, and Southern Railway. ITI artisans start at Level 8 (₹20,600 basic + 43.8% DA) with complete medical coverage.
                    </p>
                    <div className="pt-2 border-t-2 border-zinc-100 flex items-center justify-between text-sm font-mono">
                      <span className="text-zinc-600 font-bold">Recruitment Gateway:</span>
                      <strong className="text-black bg-[#F5C518] px-2 py-0.5 rounded">TNPSC &amp; PSU CBT Tests</strong>
                    </div>
                  </div>
                )}

                {activeTab === "private" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-100">
                      <span className="text-sm font-mono font-extrabold text-black uppercase">
                        🏭 Private Core SIPCOT
                      </span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-black rounded-full font-mono text-xs font-extrabold">
                        High Growth
                      </span>
                    </div>
                    <p className="text-base text-zinc-900 leading-relaxed font-sans font-medium">
                      TANFAC, Asian Paints, Ashok Leyland, and Tata Electronics. Fast-track NAPS stipends (₹12,500–₹16,500/mo) converting to permanent full-time roles in 18 months.
                    </p>
                    <div className="pt-2 border-t-2 border-zinc-100 flex items-center justify-between text-sm font-mono">
                      <span className="text-zinc-600 font-bold">Absorption Track:</span>
                      <strong className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-extrabold">75%+ NAPS Conversion</strong>
                    </div>
                  </div>
                )}

                {activeTab === "iti" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-100">
                      <span className="text-sm font-mono font-extrabold text-black uppercase">
                        🔧 114 Accredited Govt ITIs
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-black rounded-full font-mono text-xs font-extrabold">
                        Hands-On
                      </span>
                    </div>
                    <p className="text-base text-zinc-900 leading-relaxed font-sans font-medium">
                      DCS Plant Operators, Instrument Mechanics, and CNC Machinists. Direct shopfloor equipment learning replacing theoretical classroom textbooks.
                    </p>
                    <div className="pt-2 border-t-2 border-zinc-100 flex items-center justify-between text-sm font-mono">
                      <span className="text-zinc-600 font-bold">Curriculum Level:</span>
                      <strong className="text-black bg-[#F5C518] px-2 py-0.5 rounded">NSQF Level 4–6 Certified</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Telemetry Floating Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-mono text-sm">
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000000]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                  <span className="font-extrabold">38 Districts Synced</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F5C518] text-black border-2 border-black rounded-full font-extrabold shadow-[2px_2px_0px_0px_#000000]">
                  <Eye className="w-4 h-4 text-black" />
                  <span>திறன் நுண்ணறிவு அமைப்பு</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
