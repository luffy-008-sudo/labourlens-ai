"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LogOut,
  LogIn,
  MapPin,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Compass,
  ShieldCheck,
  Activity,
  FileText,
  Search,
  Sparkles,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useUserProfile } from "@/lib/UserProfileContext";
import { useTranslation } from "@/lib/i18n";

export default function AppSidebar() {
  const { profile, logout } = useUserProfile();
  const { lang, t } = useTranslation();
  const pathname = usePathname();

  // Collapsible groups in the left sidebar tree
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    districts: true,
    pathways: true,
    user: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const keyDistricts = [
    { name: "Krishnagiri", lgd: "582", tag: "EV & Electronics" },
    { name: "Thoothukudi", lgd: "608", tag: "Green H2 & Wind" },
    { name: "Cuddalore", lgd: "585", tag: "Chemical & Energy" },
    { name: "Coimbatore", lgd: "583", tag: "Precision CNC" },
    { name: "Tiruchirappalli", lgd: "603", tag: "Heavy Fabrication" },
  ];

  const keyDomains = [
    { slug: "chemical", name: "Chemical & Petrochemical" },
    { slug: "ev_automotive", name: "Electric Vehicles & Auto" },
    { slug: "automation_cnc", name: "Automation & CNC Machining" },
    { slug: "renewable_energy", name: "Renewable Energy & Wind" },
  ];

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-white border-2 border-black rounded-[28px] p-6 shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between select-none space-y-6">
      <div className="space-y-6">

        {/* ── Search Input (Swiss Neo-Brutalist Pill) ── */}
        <div className="relative">
          <Search className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === "ta" ? "மாவட்டங்கள் தேடுக..." : "Search districts, trades..."}
            className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-[#FAF9F5] border-2 border-black rounded-full focus:outline-none focus:bg-white placeholder:text-zinc-600 font-bold shadow-[2px_2px_0px_0px_#000000] transition-colors"
          />
        </div>

        {/* ── User Authentication & Session Card (Neo-Brutalist Framed Box) ── */}
        <div className="p-5 bg-[#FAF9F5] border-2 border-black rounded-2xl text-sm shadow-[3px_3px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
              USER SESSION
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 bg-[#F5C518] text-black font-extrabold border border-black rounded-full">
              {profile.userId}
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-black text-[#F5C518] border-2 border-black flex items-center justify-center font-extrabold text-base shrink-0 font-mono shadow-[2px_2px_0px_0px_#000000]">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-black truncate font-sans text-base">{profile.name}</div>
              <div className="text-xs text-zinc-700 font-mono font-bold truncate">{profile.email}</div>
            </div>
          </div>

          {/* Quick Profile Meta */}
          <div className="grid grid-cols-2 gap-2 py-2 border-t-2 border-b-2 border-black/10 text-xs font-mono">
            <div>
              <span className="text-zinc-600 font-bold block">HOME DISTRICT</span>
              <span className="font-extrabold text-black truncate block text-sm">{profile.district}</span>
            </div>
            <div>
              <span className="text-zinc-600 font-bold block">TRACK</span>
              <span className="font-extrabold text-black uppercase block text-sm">{profile.careerTrack}</span>
            </div>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center justify-between pt-1">
            <Link
              href="/profile"
              className="text-sm font-extrabold text-black hover:underline flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-black" />
              <span>{lang === "ta" ? "சுயவிவரம்" : "Edit Profile"}</span>
            </Link>

            {profile.isLoggedIn ? (
              <button
                onClick={logout}
                className="text-xs font-mono font-extrabold text-zinc-700 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "வெளியேறு" : "Sign Out"}</span>
              </button>
            ) : (
              <Link
                href="/profile"
                className="text-xs font-mono font-extrabold text-black hover:bg-[#F5C518] px-3 py-1 border-2 border-black rounded-full flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "உள்நுழை" : "Sign In"}</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Navigation Tree ── */}
        <div className="space-y-4 font-sans text-sm">

          {/* Group 1: District Intelligence */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("districts")}
              className="w-full flex items-center justify-between py-2.5 px-3.5 bg-[#FAF9F5] border-2 border-black rounded-xl text-black font-extrabold hover:bg-[#F5C518] transition-all uppercase text-xs sm:text-sm tracking-tight shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-black" />
                <span>{lang === "ta" ? "மாவட்ட நுண்ணறிவு" : "District Intelligence"}</span>
              </div>
              {openSections.districts ? (
                <ChevronDown className="w-4 h-4 text-black" />
              ) : (
                <ChevronRight className="w-4 h-4 text-black" />
              )}
            </button>

            {openSections.districts && (
              <ul className="pl-3 pt-1 space-y-1.5 border-l-2 border-black ml-3">
                <li>
                  <Link
                    href="/districts"
                    className={`block py-2 px-3 text-sm font-extrabold rounded-lg transition-all ${
                      pathname === "/districts"
                        ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                        : "text-zinc-800 hover:text-black hover:bg-[#FAF9F5]"
                    }`}
                  >
                    38 Districts Full Radar →
                  </Link>
                </li>
                {keyDistricts.map((d) => (
                  <li key={d.lgd}>
                    <Link
                      href={`/districts?district=${d.name}`}
                      className="flex items-center justify-between py-1.5 px-3 text-zinc-800 hover:text-black hover:bg-[#FAF9F5] rounded-lg transition-colors font-bold text-sm"
                    >
                      <span>{d.name}</span>
                      <span className="text-xs font-mono text-zinc-600 font-extrabold">{d.tag}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Group 2: Learner Career Pathways */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("pathways")}
              className="w-full flex items-center justify-between py-2.5 px-3.5 bg-[#FAF9F5] border-2 border-black rounded-xl text-black font-extrabold hover:bg-[#F5C518] transition-all uppercase text-xs sm:text-sm tracking-tight shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-black" />
                <span>{lang === "ta" ? "தொழில் பாதைகள்" : "Learner Pathways"}</span>
              </div>
              {openSections.pathways ? (
                <ChevronDown className="w-4 h-4 text-black" />
              ) : (
                <ChevronRight className="w-4 h-4 text-black" />
              )}
            </button>

            {openSections.pathways && (
              <ul className="pl-3 pt-1 space-y-1.5 border-l-2 border-black ml-3">
                <li>
                  <Link
                    href="/routes"
                    className={`block py-2 px-3 text-sm font-extrabold rounded-lg transition-all ${
                      pathname === "/routes"
                        ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                        : "text-zinc-800 hover:text-black hover:bg-[#FAF9F5]"
                    }`}
                  >
                    Personalized Roadmap Engine →
                  </Link>
                </li>
                {keyDomains.map((dom) => (
                  <li key={dom.slug}>
                    <Link
                      href={`/routes?sector=${encodeURIComponent(dom.name)}`}
                      className="block py-1.5 px-3 text-zinc-800 hover:text-black hover:bg-[#FAF9F5] rounded-lg transition-colors truncate font-bold text-sm"
                    >
                      {dom.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Group 3: Core App Modules */}
          <div className="pt-2 border-t-2 border-black space-y-2">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                pathname === "/"
                  ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  : "text-black hover:bg-[#FAF9F5] border border-transparent hover:border-black"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>AI Agents Overview &amp; Hero</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                pathname === "/profile"
                  ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  : "text-black hover:bg-[#FAF9F5] border border-transparent hover:border-black"
              }`}
            >
              <User className="w-4 h-4" />
              <span>User Profile &amp; Resume</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                pathname === "/admin"
                  ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  : "text-black hover:bg-[#FAF9F5] border border-transparent hover:border-black"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review Queue &amp; Audit</span>
            </Link>

            <Link
              href="/behind-the-data"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                pathname === "/behind-the-data"
                  ? "bg-[#F5C518] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  : "text-black hover:bg-[#FAF9F5] border border-transparent hover:border-black"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Grounding Telemetry &amp; Sources</span>
            </Link>
          </div>

        </div>

      </div>

      {/* ── Status Pill Badge at Bottom of Left Sidebar ── */}
      <div className="p-4 bg-[#FAF9F5] border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000000]">
        <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-black mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
          <span>AUTONOMOUS SWARM ACTIVE</span>
        </div>
        <p className="text-xs font-mono text-zinc-700 leading-tight font-medium">
          88 Sources Verified &lt;10m ago · 38 Districts Synced
        </p>
      </div>
    </aside>
  );
}
