"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Factory,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";
import { getDistrictRegistry, DistrictRegistryEntry } from "@/lib/tnDistrictsRegistry";
import { TN_38_DISTRICTS } from "@/lib/districtsData";
import { useTranslation } from "@/lib/i18n";

interface GovtVsPrivateClassifierProps {
  initialDistrict?: string;
  districtName?: string;
  initialQualification?: "iti" | "diploma" | "degree";
}

export default function GovtVsPrivateClassifier({
  initialDistrict = "Krishnagiri",
  districtName,
  initialQualification = "diploma",
}: GovtVsPrivateClassifierProps) {
  const { lang } = useTranslation();
  const [district, setDistrict] = useState(districtName || initialDistrict);
  const [qualification, setQualification] = useState<"iti" | "diploma" | "degree">(initialQualification);
  const [showPayCalculator, setShowPayCalculator] = useState(false);

  React.useEffect(() => {
    if (districtName) {
      setDistrict(districtName);
    }
  }, [districtName]);

  const reg: DistrictRegistryEntry = getDistrictRegistry(district);
  const govt = reg.govtPsuTrack || {
    employers: reg.govtPsuEmployers || ["TANGEDCO", "State Technical Boards"],
    roles: {
      iti: "Technician Trainee / Operator",
      diploma: "Junior Engineer / Supervisor",
      degree: "Assistant Engineer (Executive)",
    },
    payScales: {
      iti: "₹20,600 – ₹46,500 (IDA W-1 Cadre)",
      diploma: "₹30,000 – ₹60,000 (IDA W-4 Cadre)",
      degree: "₹50,000 – ₹1,60,000 (IDA E-2 Cadre)",
    },
    allowances: [
      "Dearness Allowance (43.8% IDA) updated quarterly",
      "House Rent Allowance (9% to 18%) or Official Quarters",
      "Comprehensive Contributory Health Scheme",
      "Provident Fund (12%) + Gratuity + Superannuation",
    ],
    entryExams: ["TNPSC Combined Engineering Services", "GATE Exam", "Direct PSU Written Test (CBT)"],
    portalUrl: "https://www.tn.gov.in",
  };
  const priv = reg.privateTrack || {
    employers: reg.privateEmployers || ["SIPCOT Private Anchors", "MSME Supply Chain Units"],
    roles: {
      iti: "Shopfloor Machine Operator / Apprentice",
      diploma: "Production Line Supervisor / Maintenance Specialist",
      degree: "Graduate Engineer Trainee (GET) - Operations",
    },
    startingStipendNaps: "₹12,500 – ₹15,500 / mo (NAPS Scheme)",
    entryFullTimeCtc: "₹2.4L – ₹3.6L LPA",
    experienced5yrCtc: "₹6.5L – ₹10.5L LPA",
    perks: [
      "Production Performance Bonus (Quarterly)",
      "Factory Canteen Subsidy & Commuter Bus Pickup",
      "Overtime at 2x Base Rate (Factory Act Compliance)",
      "Employee State Insurance (ESI) & Group Term Life Coverage",
    ],
    directEntryPaths: [
      "National Apprenticeship Promotion Scheme (NAPS) Walk-In",
      "Direct SIPCOT Campus Recruitment Drives",
      "District Employment Exchange Placement Camps",
    ],
    portalUrl: "https://apprenticeshipindia.gov.in",
  };

  return (
    <div className="w-full bg-white border-2 border-black rounded-[28px] overflow-hidden shadow-[5px_5px_0px_0px_#000000] font-sans select-none">
      {/* ── Header Bar (Unified Cream Background) ── */}
      <div className="p-6 sm:p-8 bg-[#FAF9F5] text-black border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-mono font-extrabold text-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C518] border border-black inline-block" />
            <span>02 // DUAL-TRACK ROLE CLASSIFIER // TAMIL NADU</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black uppercase font-sans">
            🏛️ Government &amp; PSU vs. 🏭 Private Core Industry
          </h2>
          <p className="text-base font-sans text-zinc-800 max-w-2xl leading-relaxed font-medium">
            Select your academic credential and target district to classify official statutory pay scales, DA/HRA allowances, and direct private recruitment paths.
          </p>
        </div>

        {/* District Selector Pill */}
        <div className="shrink-0 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-black" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="p-3 bg-white text-black font-mono text-sm font-extrabold border-2 border-black rounded-xl focus:outline-none shadow-[2px_2px_0px_0px_#F5C518]"
          >
            {Object.values(TN_38_DISTRICTS).map((d) => (
              <option key={d.lgd} value={d.name}>
                {d.name} ({d.tamil})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Qualification Tier Switcher ── */}
      <div className="p-5 sm:p-6 bg-white border-b-2 border-black flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-mono font-extrabold uppercase text-black mr-2">
            Filter Credential Tier:
          </span>
          {[
            { id: "iti", label: "🔧 ITI Trades (NSQF L4-5)" },
            { id: "diploma", label: "📜 Polytechnic Diploma (L5-6)" },
            { id: "degree", label: "🎓 B.E. / B.Tech (L7)" },
          ].map((q) => (
            <button
              key={q.id}
              onClick={() => setQualification(q.id as any)}
              className={`px-4 py-2 font-mono text-sm font-extrabold uppercase rounded-full border-2 border-black transition-all ${
                qualification === q.id
                  ? "bg-[#F5C518] text-black shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#FAF9F5]"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Action Toggle */}
        <button
          onClick={() => setShowPayCalculator(!showPayCalculator)}
          className="px-5 py-2.5 bg-[#F5C518] text-black border-2 border-black rounded-full font-mono text-sm font-extrabold uppercase flex items-center gap-2 transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <TrendingUp className="w-4 h-4" />
          <span>{showPayCalculator ? "Hide Take-Home Math" : "📊 Compare Monthly Take-Home Math"}</span>
        </button>
      </div>

      {/* ── Interactive Monthly Take-Home Math Drawer ── */}
      {showPayCalculator && (
        <div className="p-6 sm:p-8 bg-[#FFFBEA] border-b-2 border-black font-mono text-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-extrabold text-black uppercase gap-2 text-base">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-black" />
              Anti-Migration Net Discretionary Cashflow Model ({reg.district})
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border-2 border-black rounded-full text-xs font-extrabold">
              Zero Metro Relocation Overheads
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white border-2 border-black rounded-2xl space-y-2.5 shadow-[3px_3px_0px_0px_#000000]">
              <span className="font-extrabold text-black block uppercase text-base">🏛️ Local PSU / Government Cadre</span>
              <div className="text-zinc-800 text-sm">Basic Pay: <strong className="text-black">{govt.payScales[qualification].split(" ")[0]}</strong></div>
              <div className="text-zinc-800 text-sm">DA (43.8%) + HRA (18%): <strong className="text-black">+₹9,000 – ₹16,000 / mo</strong></div>
              <div className="text-zinc-800 text-sm">Living Costs in {reg.district}: <strong className="text-emerald-800 font-extrabold">₹0 (Govt Township / Family Home)</strong></div>
              <div className="pt-2 border-t-2 border-black text-black font-extrabold text-base">
                Net Monthly Surplus: ₹32,000 – ₹68,000 / mo
              </div>
            </div>

            <div className="p-5 bg-white border-2 border-black rounded-2xl space-y-2.5 shadow-[3px_3px_0px_0px_#000000]">
              <span className="font-extrabold text-black block uppercase text-base">🏭 Local Private SIPCOT Cadre</span>
              <div className="text-zinc-800 text-sm">NAPS Stipend: <strong className="text-black">{priv.startingStipendNaps.split("(")[0]}</strong></div>
              <div className="text-zinc-800 text-sm">Overtime 2x (30 hrs) + Attendance Bonus: <strong className="text-black">+₹5,500 / mo</strong></div>
              <div className="text-zinc-800 text-sm">Local Living Overheads: <strong className="text-emerald-800 font-extrabold">₹0 (Free Factory Canteen &amp; Bus)</strong></div>
              <div className="pt-2 border-t-2 border-black text-black font-extrabold text-base">
                Net Monthly Surplus: ₹16,500 – ₹24,000 / mo (+186% vs Metro IT trap)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDE-BY-SIDE COMPARATIVE CLASSIFIER COLUMNS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x-2 divide-black">

        {/* ── LEFT COLUMN: 🏛️ GOVERNMENT & PSU TRACK ── */}
        <div className="p-6 sm:p-8 bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Track Header */}
            <div className="pb-4 border-b-2 border-black">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 border-2 border-black rounded-full text-xs font-mono font-extrabold uppercase tracking-wider">
                  STATUTORY CADRE
                </span>
                <span className="text-sm font-mono text-emerald-800 font-extrabold">100% Pension &amp; Security</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mt-3 flex items-center gap-2 uppercase font-sans">
                <Building2 className="w-6 h-6 text-black" />
                <span>Government &amp; PSU Career Track</span>
              </h3>
              <p className="text-base text-zinc-700 mt-1 font-medium leading-relaxed">
                Central &amp; Tamil Nadu public sector undertakings, electricity boards, and statutory authorities in {reg.district}.
              </p>
            </div>

            {/* Targeted Role for Selected Credential */}
            <div className="p-5 bg-[#FAF9F5] border-2 border-black rounded-2xl space-y-2 shadow-[2px_2px_0px_0px_#000000]">
              <span className="text-xs font-mono text-zinc-700 uppercase font-extrabold block">
                Targeted Entry Cadre ({qualification.toUpperCase()}):
              </span>
              <div className="font-extrabold text-black text-lg font-sans">
                {govt.roles[qualification]}
              </div>
              <div className="text-sm font-mono text-black font-extrabold pt-1">
                Official Pay Scale: <span className="bg-[#F5C518] px-2 py-0.5 rounded border border-black">{govt.payScales[qualification]}</span>
              </div>
            </div>

            {/* PSU Employers in this District */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Anchor Government &amp; PSU Employers ({govt.employers.length}):
              </span>
              <div className="flex flex-wrap gap-2.5">
                {govt.employers.map((emp, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 bg-[#FAF9F5] text-black border-2 border-black rounded-full text-sm font-mono font-bold shadow-[1px_1px_0px_0px_#000000]"
                  >
                    {emp}
                  </span>
                ))}
              </div>
            </div>

            {/* Statutory Allowances & Benefits */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Statutory Allowances &amp; Benefits:
              </span>
              <ul className="space-y-2.5 text-base text-zinc-900 font-medium">
                {govt.allowances.map((alw, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{alw}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Entrance Gateways & Exams */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Mandatory Entrance &amp; Selection Gateway:
              </span>
              <div className="space-y-2.5">
                {govt.entryExams.map((exam, i) => (
                  <div key={i} className="p-3.5 bg-[#FAF9F5] border-2 border-black rounded-xl text-sm font-mono flex items-center justify-between">
                    <span className="font-extrabold text-black">{exam}</span>
                    <span className="text-xs px-2.5 py-0.5 bg-[#F5C518] text-black font-extrabold border border-black rounded-full">Official</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t-2 border-black">
            <a
              href={govt.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-swiss-yellow w-full text-center inline-flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Explore PSU &amp; Government Vacancies Portal ↗</span>
            </a>
          </div>
        </div>

        {/* ── RIGHT COLUMN: 🏭 PRIVATE CORE INDUSTRY TRACK ── */}
        <div className="p-6 sm:p-8 bg-[#FAF9F5] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Track Header */}
            <div className="pb-4 border-b-2 border-black">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border-2 border-black rounded-full text-xs font-mono font-extrabold uppercase tracking-wider">
                  MARKET CORRIDOR
                </span>
                <span className="text-sm font-mono text-black font-extrabold">Fast-Track 5-Yr Promotion</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mt-3 flex items-center gap-2 uppercase font-sans">
                <Factory className="w-6 h-6 text-black" />
                <span>Private Core Industry Track</span>
              </h3>
              <p className="text-base text-zinc-700 mt-1 font-medium leading-relaxed">
                SIPCOT &amp; SIDCO industrial park anchors, gigafactories, and automated manufacturing plants in {reg.district}.
              </p>
            </div>

            {/* Targeted Role for Selected Credential */}
            <div className="p-5 bg-white border-2 border-black rounded-2xl space-y-2 shadow-[2px_2px_0px_0px_#000000]">
              <span className="text-xs font-mono text-zinc-700 uppercase font-extrabold block">
                Targeted Entry Cadre ({qualification.toUpperCase()}):
              </span>
              <div className="font-extrabold text-black text-lg font-sans">
                {priv.roles[qualification]}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono pt-1 text-zinc-900">
                <div>NAPS Stipend: <strong className="text-black bg-[#F5C518] px-1.5 rounded">{priv.startingStipendNaps.split("(")[0]}</strong></div>
                <div>Confirmed CTC: <strong className="text-black font-extrabold">{priv.entryFullTimeCtc}</strong></div>
              </div>
            </div>

            {/* Private Employers in this District */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Major SIPCOT &amp; Private Anchors ({priv.employers.length}):
              </span>
              <div className="flex flex-wrap gap-2.5">
                {priv.employers.map((emp, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 bg-white text-black border-2 border-black rounded-full text-sm font-mono font-bold shadow-[1px_1px_0px_0px_#000000]"
                  >
                    {emp}
                  </span>
                ))}
              </div>
            </div>

            {/* Perks & Shift Allowances */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Production Incentives &amp; Overtime Structure:
              </span>
              <ul className="space-y-2.5 text-base text-zinc-900 font-medium">
                {priv.perks.map((prk, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{prk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Entry Paths */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Immediate Application &amp; Conversion Pathways:
              </span>
              <div className="space-y-2.5">
                {priv.directEntryPaths.map((pth, i) => (
                  <div key={i} className="p-3.5 bg-white border-2 border-black rounded-xl text-sm font-mono flex items-center justify-between shadow-[1px_1px_0px_0px_#000000]">
                    <span className="font-extrabold text-black">{pth}</span>
                    <span className="text-xs px-2.5 py-0.5 bg-emerald-200 text-emerald-900 border border-black rounded-full font-bold">Fast-Track</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t-2 border-black">
            <a
              href="https://apprenticeshipindia.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-swiss-white w-full text-center inline-flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Apply on National Apprenticeship (NAPS) Portal ↗</span>
            </a>
          </div>
        </div>

      </div>

      {/* ── Bottom Summary Footer (Unified Cream Neo-Brutalist Strip) ── */}
      <div className="p-6 bg-[#FAF9F5] text-black text-sm font-mono flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-black">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-black" />
          <span className="font-bold">Labourlens AI Recommendation: Start with local NAPS/ITI apprenticeship to lock in verified shopfloor hours.</span>
        </div>
        <Link
          href={`/routes?district=${encodeURIComponent(district)}`}
          className="text-black bg-[#F5C518] px-4 py-2 border-2 border-black rounded-full font-extrabold flex items-center gap-1.5 transition-transform hover:translate-x-0.5 uppercase shadow-[2px_2px_0px_0px_#000000]"
        >
          <span>Open Full 4-Stage Roadmap for {district} →</span>
        </Link>
      </div>
    </div>
  );
}
