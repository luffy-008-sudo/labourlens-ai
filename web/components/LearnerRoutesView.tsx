"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Layers,
  ChevronDown,
  Activity,
  Zap,
  Target,
  Sparkles,
  Award,
  X,
} from "lucide-react";
import SpecificationTag from "@/components/SpecificationTag";
import GoogleMapsEmbed from "@/components/GoogleMapsEmbed";
import GovtVsPrivateClassifier from "@/components/GovtVsPrivateClassifier";
import { TN_38_DISTRICTS } from "@/lib/districtsData";
import { useTranslation } from "@/lib/i18n";
import { useUserProfile } from "@/lib/UserProfileContext";
import {
  CORE_DOMAINS,
  QUALIFICATION_PATHWAYS,
  getPersonalizedRoadmap,
  getPrimaryDomainForDistrict,
} from "@/lib/coreDomainRoadmaps";
import { resolveDynamicDeepLink } from "@/lib/universalLinkResolver";

function matchDomainFromSector(sectorQuery: string | null): string {
  if (!sectorQuery) return "chemical";
  const s = sectorQuery.toLowerCase();
  if (s.includes("chem") || s.includes("petro") || s.includes("pharma")) return "chemical";
  if (s.includes("ev") || s.includes("electric") || s.includes("battery") || s.includes("auto"))
    return "ev_automotive";
  if (s.includes("renew") || s.includes("wind") || s.includes("solar") || s.includes("green"))
    return "renewable_energy";
  if (s.includes("cnc") || s.includes("tool") || s.includes("mechatron") || s.includes("pump"))
    return "automation_cnc";
  if (s.includes("boiler") || s.includes("heavy") || s.includes("fab") || s.includes("ordnance"))
    return "heavy_engineering";
  if (s.includes("textile") || s.includes("knit") || s.includes("dye") || s.includes("garment"))
    return "textiles_dyeing";
  if (s.includes("agro") || s.includes("food") || s.includes("cold") || s.includes("grain"))
    return "agro_processing";
  return "chemical";
}

function AnimatedMeter({
  label,
  value,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="font-mono text-sm space-y-1">
      <div className="flex justify-between mb-1">
        <span className="text-zinc-700 font-extrabold uppercase">{label}</span>
        <span className="font-extrabold text-black bg-[#F5C518] px-1.5 rounded">{value}%</span>
      </div>
      <div className="w-full bg-[#E5E5DF] h-3 border-2 border-black rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

interface StepperPhase {
  label: string;
  badge: string;
  action: string;
  content: React.ReactNode;
}

function RoadmapStepper({ phases }: { phases: StepperPhase[] }) {
  const [openStep, setOpenStep] = useState<number>(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("labourlens_completed_milestones");
      if (saved) setCompleted(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleComplete = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem("labourlens_completed_milestones", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="divide-y-2 divide-black border-2 border-black rounded-[24px] overflow-hidden bg-white shadow-[4px_4px_0px_0px_#000000]">
      {phases.map((phase, idx) => {
        const isOpen = openStep === idx;
        const isDone = completed[idx];
        const contentEl = contentRefs.current[idx];

        return (
          <div key={idx} className="transition-all duration-200">
            {/* Header */}
            <button
              className={`w-full flex items-center gap-4 p-5 sm:p-6 text-left transition-colors ${
                isDone ? "bg-emerald-50" : isOpen ? "bg-[#FAF9F5]" : "bg-white hover:bg-[#FAF9F5]"
              }`}
              onClick={() => setOpenStep(isOpen ? -1 : idx)}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-mono font-extrabold text-sm border-2 border-black transition-colors ${
                  isDone
                    ? "bg-emerald-600 text-white border-black"
                    : isOpen
                    ? "bg-[#F5C518] text-black"
                    : "bg-white text-black"
                }`}
              >
                {isDone ? "✓" : `0${idx + 1}`}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 bg-black text-[#F5C518] rounded-full uppercase tracking-wider">
                    {phase.badge}
                  </span>
                  <span className="font-extrabold text-base sm:text-lg uppercase tracking-tight text-black truncate font-sans">
                    {phase.label}
                  </span>
                </div>
                <p className="text-sm font-mono text-zinc-700 mt-1 truncate font-medium">{phase.action}</p>
              </div>

              {/* Functional Milestone Toggle Button */}
              <button
                type="button"
                onClick={(e) => toggleComplete(idx, e)}
                className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-extrabold uppercase rounded-full border-2 transition-all ${
                  isDone
                    ? "bg-emerald-100 text-emerald-900 border-black"
                    : "bg-white text-black border-black hover:bg-[#F5C518] shadow-[1px_1px_0px_0px_#000000]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isDone ? "Milestone Done" : "Mark Complete"}</span>
              </button>

              <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                <ChevronDown className="w-5 h-5 text-black" />
              </div>
            </button>

            {/* Expandable Content */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? (contentEl ? `${contentEl.scrollHeight + 60}px` : "1400px") : "0px",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div
                ref={(el) => { contentRefs.current[idx] = el; }}
                className="p-6 sm:p-8 pt-2 border-t-2 border-black/10 bg-[#FAF9F5]"
              >
                <p className="text-base font-sans text-black leading-relaxed mb-5 font-medium">
                  <strong className="font-mono uppercase text-black bg-[#F5C518] px-2 py-0.5 rounded mr-2">MANDATORY ACTION:</strong>
                  {phase.action}
                </p>
                {phase.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LearnerRoutesContent() {
  const { lang } = useTranslation();
  const { profile, selectedDistrict: contextDistrict, selectedDomain: contextDomain, setSelectedDistrict: setGlobalDistrict, updateProfile } = useUserProfile();
  const searchParams = useSearchParams();
  const queryDistrict = searchParams.get("district");
  const querySector = searchParams.get("sector");

  const [selectedDistrict, setSelectedDistrict] = useState<string>("Krishnagiri");
  const [selectedDomain, setSelectedDomain] = useState<string>("ev_automotive");
  const [selectedQual, setSelectedQual] = useState<string>("iti_polytechnic");
  const [acquiredSkills, setAcquiredSkills] = useState<string[]>([]);
  const [activeModalSkill, setActiveModalSkill] = useState<string | null>(null);

  // Sync with searchParams, context, or Profile
  useEffect(() => {
    const activeDist = queryDistrict || contextDistrict || profile?.district;
    if (activeDist) {
      setSelectedDistrict(activeDist);
      if (!querySector && !contextDomain) {
        setSelectedDomain(getPrimaryDomainForDistrict(activeDist));
      }
    }

    const activeSector = querySector || contextDomain;
    if (activeSector) {
      setSelectedDomain(matchDomainFromSector(activeSector));
    }

    if (profile?.qualification) {
      setSelectedQual(profile.qualification);
    }
  }, [queryDistrict, querySector, contextDistrict, contextDomain, profile]);

  // Synchronize Target District -> Core Domain automatically
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setGlobalDistrict(newDistrict);
    const autoDomain = getPrimaryDomainForDistrict(newDistrict);
    setSelectedDomain(autoDomain);
  };

  const roadmap = getPersonalizedRoadmap(selectedDistrict, selectedDomain, selectedQual);
  const districtObj = Object.values(TN_38_DISTRICTS).find(
    (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
  ) || TN_38_DISTRICTS["582"];

  // Baseline academic skills dynamically shifting by qualification
  const qualificationBaselines: Record<string, string[]> = {
    "10th_12th": [
      "Basic Workshop Safety & PPE Guidelines",
      "Hand Tools & Vernier Caliper Basics",
      "Shopfloor 5S Discipline",
    ],
    iti_polytechnic: [
      "Technical Blueprint & P&ID Reading",
      "Preventive Maintenance Protocols",
      "DISH Factory Safety & Compliance Norms",
      "Vernier Calipers & Micrometer Metrology",
      "Basic Lathe / Milling Machine Handling",
    ],
    btech_graduate: [
      "Engineering Thermodynamics & Mechanics",
      "CAD Modeling (SolidWorks/AutoCAD)",
      "Process Control Logic & PFD Flowsheets",
      "Industrial Quality Assurance & Six Sigma",
      "Emergency Shutdown (ESD) & Safety Management",
    ],
    career_switcher: [
      "Industrial Documentation & Log Recording",
      "Operational Team Communication",
      "General Mechanical & Electrical Aptitude",
    ],
  };

  const academicBase = qualificationBaselines[selectedQual] || qualificationBaselines.iti_polytechnic;
  const userProfileSkills = Array.isArray(profile?.extractedSkills) ? profile.extractedSkills : [];

  // Active verified user skills combining academic degree baseline + profile + newly acquired
  const activeUserSkills = Array.from(
    new Set([...academicBase, ...userProfileSkills, ...acquiredSkills])
  );

  // Dynamic demanded skills: combining domain equipment and verified district JD skills
  const allRequiredSkills = Array.from(
    new Set([
      ...roadmap.domain.factoryEquipmentDemanded.map((s) => s.split("(")[0].trim()),
      ...roadmap.districtRegistry.privateJdSkills.map((s) => s.split("(")[0].trim()),
    ])
  );

  const matchedSkills = allRequiredSkills.filter((req) =>
    activeUserSkills.some((usr) => {
      const u = usr.toLowerCase();
      const r = req.toLowerCase();
      return u.includes(r.slice(0, 8)) || r.includes(u.slice(0, 8));
    })
  );

  const missingSkills = allRequiredSkills.filter((req) => !matchedSkills.includes(req));

  // Dynamic Industry Readiness Score % (shifts with degree level and acquired skills)
  const qualBaseWeight =
    selectedQual === "btech_graduate"
      ? 58
      : selectedQual === "iti_polytechnic"
      ? 44
      : 26;
  const matchRatio = allRequiredSkills.length > 0 ? (matchedSkills.length / allRequiredSkills.length) * 44 : 0;
  const readinessPercent = Math.min(100, Math.max(30, Math.round(qualBaseWeight + matchRatio)));

  // Stepper Phases
  const stepperPhases: StepperPhase[] = [
    {
      label: roadmap.stepByStepPath[0].stage,
      badge: "MONTH 1–2",
      action: roadmap.stepByStepPath[0].objective,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black/10 text-sm font-mono font-extrabold">
            <span className="text-black uppercase">CURATED NPTEL / SWAYAM / BHARAT SKILLS MODULES</span>
            <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-extrabold">100% Free Video Courses</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(roadmap.stepByStepPath[0].recommendedCourses || []).map((crs, cIdx) => (
              <div key={cIdx} className="bg-white p-5 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-extrabold text-black">
                  <span className="bg-[#F5C518] px-2 py-0.5 rounded border border-black uppercase">{crs.platform}</span>
                  <span>{crs.duration}</span>
                </div>
                <h4 className="font-extrabold text-base uppercase tracking-tight text-black font-sans">
                  {crs.title}
                </h4>
                <p className="text-sm font-sans text-zinc-700 font-medium">{crs.topics}</p>
                <div className="pt-3 border-t-2 border-zinc-100">
                  <a
                    href={resolveDynamicDeepLink({
                      category: "SKILL_COURSE_GOVT",
                      district: selectedDistrict,
                      sector: roadmap.domain.name,
                      skillName: crs.title,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-swiss-yellow w-full text-center inline-flex items-center justify-center gap-2 text-xs py-2"
                  >
                    <span>START FREE COURSE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: roadmap.stepByStepPath[1].stage,
      badge: "MONTH 3–4",
      action: roadmap.stepByStepPath[1].objective,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black/10 text-sm font-mono font-extrabold">
            <span className="text-black uppercase">NEARBY ACCREDITED GOVT ITIs IN {roadmap.district.toUpperCase()}</span>
            <span className="text-black font-extrabold bg-[#F5C518] px-2 py-0.5 rounded">Hands-on Workshops</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(roadmap.stepByStepPath[1].trainingCenters || []).map((iti, iIdx) => (
              <div key={iIdx} className="bg-white p-5 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000000] space-y-2">
                <div className="flex items-center gap-1.5 font-extrabold text-base uppercase text-black font-sans">
                  <Building className="w-4 h-4 text-black" />
                  <span>{iti.name}</span>
                </div>
                <div className="text-sm text-zinc-600 font-mono font-bold">{iti.location}</div>
                <div className="pt-2 border-t-2 border-zinc-100 text-sm font-mono space-y-1">
                  <span className="font-extrabold block text-black">TRADES OFFERED:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(iti.relevantTrades || []).map((tr, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 bg-[#FAF9F5] border border-black rounded text-xs font-bold">
                        {tr}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t-2 border-zinc-100 flex justify-end">
                  <a
                    href={resolveDynamicDeepLink({
                      category: "ITI_MAP_LOCATION",
                      district: selectedDistrict,
                      itiName: iti.name,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-extrabold text-black hover:underline inline-flex items-center gap-1"
                  >
                    <span>📍 Locate on Maps ↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: roadmap.stepByStepPath[2].stage,
      badge: "MONTH 5–6",
      action: roadmap.stepByStepPath[2].objective,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black/10 text-sm font-mono font-extrabold">
            <span className="text-black uppercase">MANDATORY ENTRY LICENSES &amp; APPRENTICESHIP CLEARANCE</span>
            <span className="text-black font-extrabold bg-[#F5C518] px-2 py-0.5 rounded">NCVT / Factory Act</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(roadmap.stepByStepPath[2].safetyTickets || []).map((tkt, tIdx) => (
              <div key={tIdx} className="bg-white p-5 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-zinc-100 text-sm font-mono font-extrabold">
                  <span className="text-black uppercase">{tkt.name}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-black rounded-full text-xs">Required</span>
                </div>
                <span className="text-xs font-mono text-zinc-600 block font-bold">AUTHORITY: {tkt.issuingAuthority}</span>
                <p className="text-sm text-zinc-800 font-sans leading-relaxed font-medium">{tkt.whyRequired}</p>
                <div className="pt-2 border-t-2 border-zinc-100 flex justify-end">
                  <a
                    href={resolveDynamicDeepLink({
                      category: "SAFETY_LICENSE_PORTAL",
                      district: selectedDistrict,
                      skillName: tkt.name,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-extrabold text-black hover:underline inline-flex items-center gap-1"
                  >
                    <span>Statutory License &amp; Exam Norms ↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F1] w-full text-black font-sans">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Top Header Eyebar ── */}
        <div className="p-6 sm:p-10 bg-white border-2 border-black rounded-[28px] shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-mono font-extrabold text-black uppercase tracking-wider">
                <span className="w-2.5 h-2.5 bg-[#F5C518] border border-black inline-block rounded-full" />
                <span>ZERO-TO-JOB VERIFIED ROADMAP // LGD SPECIFICATION</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black font-sans">
                CORE SECTOR VOCATIONAL DISPATCH
              </h1>
              <p className="text-base text-zinc-800 max-w-2xl font-medium leading-relaxed">
                Connect your academic background to local factory shopfloor competencies, mandatory trade tickets, and verified pay progression in {roadmap.district}.
              </p>
            </div>
            <div className="bg-[#FAF9F5] border-2 border-black rounded-2xl p-5 font-mono text-sm text-right shrink-0 shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-black font-extrabold block text-base">100% FACTORY GROUNDED</span>
              <span className="text-zinc-600 font-bold">38 TAMIL NADU DISTRICTS</span>
            </div>
          </div>
        </div>

        {/* ── Swiss Filter Matrix ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-black rounded-[24px] overflow-hidden divide-y-2 md:divide-y-0 md:divide-x-2 divide-black bg-white shadow-[5px_5px_0px_0px_#000000]">
          <div className="p-6 space-y-2">
            <span className="text-xs sm:text-sm font-mono text-zinc-700 uppercase font-extrabold block">
              01 // TARGET DISTRICT
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full text-base font-extrabold font-mono bg-[#FAF9F5] border-2 border-black rounded-xl p-3 text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
            >
              {Object.values(TN_38_DISTRICTS).map((d) => (
                <option key={d.lgd} value={d.name}>
                  {d.name} ({d.tamil})
                </option>
              ))}
            </select>
            <span className="text-xs font-mono text-zinc-600 block truncate font-bold">
              {roadmap.districtRegistry.coreSector}
            </span>
          </div>

          <div className="p-6 space-y-2">
            <span className="text-xs sm:text-sm font-mono text-zinc-700 uppercase font-extrabold block">
              02 // CORE DOMAIN
            </span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full text-base font-extrabold font-mono bg-[#FAF9F5] border-2 border-black rounded-xl p-3 text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
            >
              {Object.values(CORE_DOMAINS).map((dom) => (
                <option key={dom.id} value={dom.id}>
                  {dom.name} ({dom.tamilName})
                </option>
              ))}
            </select>
            <span className="text-xs font-mono text-black font-extrabold block">
              YoY Growth: <strong className="bg-[#F5C518] px-1.5 rounded">{roadmap.districtRegistry.growthRateYoY || roadmap.domain.yoyGrowth}</strong>
            </span>
          </div>

          <div className="p-6 space-y-2">
            <span className="text-xs sm:text-sm font-mono text-zinc-700 uppercase font-extrabold block">
              03 // CURRENT PROFILE
            </span>
            <select
              value={selectedQual}
              onChange={(e) => setSelectedQual(e.target.value)}
              className="w-full text-base font-extrabold font-mono bg-[#FAF9F5] border-2 border-black rounded-xl p-3 text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
            >
              {Object.values(QUALIFICATION_PATHWAYS).map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
            <span className="text-xs font-mono text-zinc-600 block font-bold truncate">
              Cadre: {roadmap.qualification.startingCadre}
            </span>
          </div>
        </div>

        {/* ── Main Specification Blocks ── */}
        <div className="space-y-10">

          {/* ══════════════════════════════════════════════════════════════════════
              PERSONALIZED RESUME SKILL-GAP DIFF & INDUSTRY READINESS GAUGE
          ══════════════════════════════════════════════════════════════════════ */}
          <div className="border-2 border-black rounded-[28px] bg-white p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000000] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-2 border-black gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-mono font-extrabold text-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>PERSONALIZED RESUME SKILL-GAP DIFF // CANDIDATE: {(profile?.name || "GUEST LEARNER").toUpperCase()}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase font-sans text-black">
                  Resume Alignment vs. {selectedDistrict} {roadmap.domain.name}
                </h3>
                <p className="text-base font-sans text-zinc-800 font-medium">
                  Comparing your confirmed academic background ({profile?.qualification || "iti_polytechnic"}) and verified competencies against active factory job descriptions.
                </p>
              </div>

              {/* Live Readiness Gauge */}
              <div className="p-4 bg-[#FAF9F5] border-2 border-black rounded-2xl font-mono text-sm text-right shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <span className="text-xs text-zinc-600 font-extrabold uppercase block">INDUSTRY READINESS SCORE</span>
                <span className="text-3xl font-extrabold text-black">{readinessPercent}%</span>
                <span className="text-xs text-emerald-800 block font-extrabold mt-1">
                  {matchedSkills.length} Matched • {missingSkills.length} To Acquire
                </span>
              </div>
            </div>

            {/* 2 Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left Column: Skills You Already Have */}
              <div className="border-2 border-black rounded-2xl p-6 bg-[#FAF9F5] space-y-4 shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
                  <span className="font-mono text-sm font-extrabold text-black uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Skills You Already Have (From Degree/Resume)</span>
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-black rounded-full font-bold">
                    {activeUserSkills.length} Verified
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {activeUserSkills.map((sk, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-white border-2 border-black rounded-full text-black font-mono text-sm font-bold flex items-center gap-2 shadow-[1px_1px_0px_0px_#000000]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{sk}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-zinc-600 font-mono pt-1 font-bold">
                  ✓ Validated against academic syllabus credentials for {profile.qualification}.
                </p>
              </div>

              {/* Right Column: Missing Core Industry Skills to Learn Next */}
              <div className="border-2 border-black rounded-2xl p-6 bg-white space-y-4 shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
                  <span className="font-mono text-sm font-extrabold text-black uppercase flex items-center gap-2">
                    <Target className="w-5 h-5 text-black" />
                    <span>Missing Core Industry Skills to Learn Next</span>
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 bg-[#F5C518] text-black border border-black rounded-full font-extrabold">
                    {missingSkills.length} High-Priority Gaps
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {missingSkills.map((sk, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#FAF9F5] border-2 border-black rounded-xl flex items-center justify-between text-sm font-mono shadow-[1px_1px_0px_0px_#000000] gap-2"
                    >
                      <span className="font-extrabold text-black">{sk}</span>
                      <button
                        type="button"
                        onClick={() => setActiveModalSkill(sk)}
                        className="btn-swiss-yellow text-xs py-1.5 px-3.5 inline-flex items-center gap-1 font-mono font-extrabold shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all shrink-0"
                      >
                        <span>LEARN ↗</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-700 font-bold">
                  <span>Available at local {selectedDistrict} Govt ITIs</span>
                  <Link href="/profile" className="text-black font-extrabold underline hover:text-[#e6b814]">
                    Edit Profile &amp; Resume →
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              INTERACTIVE VOCATIONAL SKILL ACQUISITION MODAL (LEARN ↗)
          ══════════════════════════════════════════════════════════════════════ */}
          {activeModalSkill && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#F4F4F1] border-4 border-black rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6 animate-in fade-in zoom-in-95 font-sans relative">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-black gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5C518] border border-black rounded-full text-xs font-mono font-extrabold uppercase text-black shadow-[1px_1px_0px_0px_#000000]">
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>VOCATIONAL SKILL ACQUISITION</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-black font-sans uppercase">
                      {activeModalSkill}
                    </h3>
                    <span className="text-xs font-mono font-bold text-zinc-600 block">
                      Target Focus: {selectedDistrict} · {roadmap.domain.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalSkill(null)}
                    className="p-2 bg-white border-2 border-black rounded-full hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_#000000]"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-black" />
                  </button>
                </div>

                {/* Local Hands-On Facility */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000000] space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-black uppercase">
                    <Building className="w-4 h-4 text-black" />
                    <span>Local Hands-on Facility ({selectedDistrict}):</span>
                  </div>
                  <div className="font-extrabold text-base text-black font-sans">
                    {roadmap.districtRegistry.nearbyItisAndTraining[0]?.name || `Government ITI ${selectedDistrict}`}
                  </div>
                  <p className="text-xs font-mono text-zinc-700 font-bold">
                    Location: {roadmap.districtRegistry.nearbyItisAndTraining[0]?.location || `${selectedDistrict} District Complex`} · State-Funded Labs &amp; Workshops
                  </p>
                </div>

                {/* Free Government Modules */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-extrabold text-zinc-700 uppercase block">
                    FREE ACCREDITED GOVERNMENT VIDEO &amp; THEORY MODULES:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={resolveDynamicDeepLink({
                        category: "SKILL_COURSE_GOVT",
                        district: selectedDistrict,
                        sector: roadmap.domain.name,
                        skillName: activeModalSkill || "Machine Tool Operations",
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white border-2 border-black rounded-xl hover:bg-[#FAF9F5] shadow-[2px_2px_0px_0px_#000000] flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-[11px] font-mono font-extrabold bg-[#F5C518] px-1.5 py-0.5 rounded border border-black block w-fit mb-1">
                          DGT / SWAYAM CURRICULUM
                        </span>
                        <span className="font-bold text-xs text-black block">Direct Skill Modules</span>
                        <span className="text-[10px] text-zinc-600 font-mono">100% Free · DGT / NSQF Verified</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>

                    <a
                      href={resolveDynamicDeepLink({
                        category: "SKILL_VIDEO_LECTURE",
                        district: selectedDistrict,
                        sector: roadmap.domain.name,
                        skillName: activeModalSkill || "Factory Workshop Operations",
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white border-2 border-black rounded-xl hover:bg-[#FAF9F5] shadow-[2px_2px_0px_0px_#000000] flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-[11px] font-mono font-extrabold bg-[#F5C518] px-1.5 py-0.5 rounded border border-black block w-fit mb-1">
                          NPTEL &amp; DGT LECTURES
                        </span>
                        <span className="font-bold text-xs text-black block">Practical Video Tutorials</span>
                        <span className="text-[10px] text-zinc-600 font-mono">100% Free · Workshop Demos</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeModalSkill) {
                        setAcquiredSkills((prev) => [...prev, activeModalSkill]);
                        updateProfile({
                          extractedSkills: Array.from(new Set([...activeUserSkills, activeModalSkill])),
                        });
                        setActiveModalSkill(null);
                      }
                    }}
                    className="btn-swiss-yellow w-full sm:w-auto text-sm py-3 px-6 inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>✓ Mark Skill as Acquired</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalSkill(null)}
                    className="w-full sm:w-auto text-sm py-2.5 px-5 font-mono font-extrabold text-zinc-700 hover:text-black border-2 border-black rounded-full bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]"
                  >
                    Close Window
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              GOVERNMENT / PSU VS. PRIVATE CORE ROLE CLASSIFIER EMBED
          ══════════════════════════════════════════════════════════════════════ */}
          <div>
            <GovtVsPrivateClassifier
              districtName={selectedDistrict}
              initialQualification={
                selectedQual.startsWith("iti")
                  ? "iti"
                  : selectedQual.includes("diploma")
                  ? "diploma"
                  : "degree"
              }
            />
          </div>

          {/* SECTION 1: The Verdict */}
          <SpecificationTag
            categoryTamil="பகுப்பாய்வு முடிவு"
            categoryEnglish="SECTION 1: THE CONCLUSIVE VERDICT (CORE SECTOR VS. IT)"
            itemCode={`LL-VERDICT-${roadmap.domain.id.toUpperCase()}`}
            title={`Why Enter ${roadmap.domain.name} in ${roadmap.district}?`}
            subtitle={`Grounded in verified industrial data across ${roadmap.district} SIPCOT & SIDCO industrial parks`}
            meta={[
              { label: "Target District", value: `${roadmap.district} (${roadmap.tamilDistrict})` },
              { label: "Core YoY Growth", value: roadmap.verdict.growthRate, accent: true },
              { label: "Selected Profile", value: roadmap.qualification.label },
              { label: "Local Deficit", value: `+${roadmap.skillGap.estimatedShortageSeats} Technician Seats` },
            ]}
          >
            <div className="space-y-4 my-3 text-sm font-mono">
              <div className="p-6 bg-[#FAF9F5] border-2 border-black rounded-2xl space-y-3">
                <span className="font-extrabold text-base text-black block uppercase font-mono">
                  THE EMPLOYEE REALITY: WHY CORE MANUFACTURING BEATS COMMODITIZED IT
                </span>
                <p className="text-base font-sans text-black leading-relaxed font-medium">
                  {roadmap.verdict.whyCoreVsIt}
                </p>
                <div className="bg-white p-4 border-2 border-black rounded-xl text-sm">
                  <span className="font-extrabold text-black block mb-1">DAY-TO-DAY SHOPFLOOR REALITY:</span>
                  <p className="text-zinc-800 font-sans leading-relaxed font-medium">{roadmap.verdict.dayToDayWorkReality}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 border-2 border-black rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-black uppercase">
                    <AlertTriangle className="w-5 h-5 text-black" />
                    <span>THE CHENNAI/BENGALURU URBAN IT TRAP:</span>
                  </div>
                  <p className="text-sm font-sans text-zinc-800 leading-relaxed font-medium">
                    Entry testing/BPO roles offer ₹25,000/mo. Urban rent (₹8,500), food (₹6,000), metro commute (₹3,000) consume ₹17,500/month, leaving &lt; ₹7,500 net savings with zero asset growth.
                  </p>
                </div>
                <div className="bg-white p-5 border-2 border-black rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-black uppercase">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>THE {roadmap.district.toUpperCase()} LOCAL ADVANTAGE:</span>
                  </div>
                  <p className="text-sm font-sans text-zinc-800 leading-relaxed font-medium">
                    {roadmap.verdict.localRetentionBenefit} Starting with ₹12,000–₹16,000 local stipend yields higher net savings, zero relocation friction, and generational security.
                  </p>
                </div>
              </div>
            </div>
          </SpecificationTag>

          {/* SECTION 2: Interactive Roadmap Stepper */}
          <div className="border-2 border-black rounded-[28px] bg-white p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000000] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-4">
              <div>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-black uppercase tracking-widest block mb-1">
                  SECTION 2: 3-PHASE STEP-BY-STEP ACTION PLAN
                </span>
                <h3 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-black font-sans">
                  CONCRETE 6-MONTH ACTION PLAN FOR {roadmap.qualification.label.toUpperCase()}
                </h3>
              </div>
              <span className="text-sm font-mono font-extrabold bg-[#F5C518] border-2 border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#000000]">
                NSQF LEVEL 4–6
              </span>
            </div>

            <RoadmapStepper phases={stepperPhases} />
          </div>

          {/* SECTION 3: Employers & NAPS Apprenticeship Portals */}
          <div className="space-y-6">
            <div className="p-5 bg-[#FAF9F5] border-2 border-black rounded-[24px] shadow-[4px_4px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5C518] border border-black rounded-full text-xs font-mono font-extrabold uppercase text-black">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>DIRECT APPRENTICESHIP &amp; HIRING GATES</span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold uppercase font-sans text-black">
                  Verified Local Recruitment Portals ({selectedDistrict})
                </h4>
                <p className="text-xs font-mono text-zinc-700 font-bold">
                  Bypass unverified job brokers. Apply directly through official central &amp; state portals:
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <a
                  href={resolveDynamicDeepLink({
                    category: "NAPS_APPRENTICESHIP",
                    district: selectedDistrict,
                    sector: roadmap.domain.name,
                    roleTitle: roadmap.qualification.startingCadre,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-[#F5C518] text-black border-2 border-black rounded-full font-mono text-xs font-extrabold shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5"
                >
                  <span>NAPS Openings ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={resolveDynamicDeepLink({
                    category: "GOVT_PSU_VACANCY",
                    district: selectedDistrict,
                    sector: roadmap.domain.name,
                    roleTitle: roadmap.qualification.startingCadre,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-[#F5C518] text-black border-2 border-black rounded-full font-mono text-xs font-extrabold shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5"
                >
                  <span>NCS Vacancies ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={resolveDynamicDeepLink({
                    category: "SAFETY_LICENSE_PORTAL",
                    district: selectedDistrict,
                    sector: roadmap.domain.name,
                    skillName: "TNSDC Naan Mudhalvan skill certification",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-[#F5C518] text-black border-2 border-black rounded-full font-mono text-xs font-extrabold shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5"
                >
                  <span>TNSDC Skills ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Government & PSU Track */}
              <div className="p-6 sm:p-8 bg-white border-2 border-black rounded-[24px] shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black font-mono">
                    <span className="font-extrabold text-base uppercase text-black">GOVERNMENT &amp; PSU UNITS</span>
                    <span className="text-xs bg-[#F5C518] text-black font-extrabold px-2.5 py-0.5 rounded-full border border-black">PERMANENT</span>
                  </div>
                  <ul className="space-y-3 font-mono text-sm">
                    {roadmap.localHiring.govtPsuEmployers.map((emp, idx) => (
                      <li key={idx} className="p-3 bg-[#FAF9F5] border-2 border-black rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[1px_1px_0px_0px_#000000]">
                        <div className="flex items-center gap-2">
                          <span className="text-black font-extrabold">■</span>
                          <span className="font-extrabold text-black">{emp}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <a
                            href={resolveDynamicDeepLink({
                              category: "GOVT_PSU_VACANCY",
                              district: selectedDistrict,
                              companyName: emp,
                              roleTitle: roadmap.qualification.startingCadre,
                              portal: "notification",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono font-extrabold px-2.5 py-1 bg-white hover:bg-[#F5C518] text-black border border-black rounded-lg inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="Search official recruitment gazettes and notices"
                          >
                            <span>Notification</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={resolveDynamicDeepLink({
                              category: "GOVT_PSU_VACANCY",
                              district: selectedDistrict,
                              companyName: emp,
                              roleTitle: roadmap.qualification.startingCadre,
                              portal: "google_jobs",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono font-extrabold px-2.5 py-1 bg-[#F5C518] hover:bg-[#e6b814] text-black border border-black rounded-lg inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="View aggregated postings across all boards"
                          >
                            <span>Google Jobs</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs font-mono text-zinc-600 pt-3 border-t-2 border-zinc-100 font-bold">
                  Recruitment via TRB, TNPSC, NLC/BHEL trade apprentice notifications.
                </p>
              </div>

              {/* Private Anchor Plants */}
              <div className="p-6 sm:p-8 bg-white border-2 border-black rounded-[24px] shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black font-mono">
                    <span className="font-extrabold text-base uppercase text-black">PRIVATE ANCHOR PLANTS</span>
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full border border-black">RAPID HIRING</span>
                  </div>
                  <ul className="space-y-3 font-mono text-sm">
                    {roadmap.localHiring.privateSipcotEmployers.map((emp, idx) => (
                      <li key={idx} className="p-3 bg-[#FAF9F5] border-2 border-black rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[1px_1px_0px_0px_#000000]">
                        <div className="flex items-center gap-2">
                          <span className="text-black font-extrabold">■</span>
                          <span className="font-extrabold text-black">{emp}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <a
                            href={resolveDynamicDeepLink({
                              category: "PRIVATE_FACTORY_JOB",
                              district: selectedDistrict,
                              companyName: emp,
                              roleTitle: roadmap.qualification.startingCadre,
                              portal: "google_jobs",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono font-extrabold px-2.5 py-1 bg-[#F5C518] hover:bg-[#e6b814] text-black border border-black rounded-lg inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="Aggregated across LinkedIn, Indeed, Naukri & company pages"
                          >
                            <span>Google Jobs</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={resolveDynamicDeepLink({
                              category: "PRIVATE_FACTORY_JOB",
                              district: selectedDistrict,
                              companyName: emp,
                              roleTitle: roadmap.qualification.startingCadre,
                              portal: "linkedin",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono font-extrabold px-2 py-1 bg-white hover:bg-[#FAF9F5] text-black border border-black rounded-lg inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="Direct clean search on LinkedIn"
                          >
                            <span>LinkedIn</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={resolveDynamicDeepLink({
                              category: "PRIVATE_FACTORY_JOB",
                              district: selectedDistrict,
                              companyName: emp,
                              roleTitle: roadmap.qualification.startingCadre,
                              portal: "indeed",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono font-extrabold px-2 py-1 bg-white hover:bg-[#FAF9F5] text-black border border-black rounded-lg inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="Direct plant technician search on Indeed India"
                          >
                            <span>Indeed</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={resolveDynamicDeepLink({
                              category: "PRIVATE_FACTORY_JOB",
                              district: selectedDistrict,
                              companyName: emp,
                              roleTitle: roadmap.qualification.startingCadre,
                              portal: "naukri",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono font-extrabold px-2 py-1 bg-white hover:bg-[#FAF9F5] text-black border border-black rounded-lg inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="Direct search on Naukri.com"
                          >
                            <span>Naukri</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs font-mono text-zinc-600 pt-3 border-t-2 border-zinc-100 font-bold">
                  Direct walk-in technical interviews &amp; NAPS apprentice contracts.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Salary Ladder */}
          <div className="border-2 border-black rounded-[28px] p-6 sm:p-10 bg-white shadow-[6px_6px_0px_0px_#000000] space-y-6">
            <div className="pb-4 border-b-2 border-black">
              <span className="text-xs sm:text-sm font-mono font-extrabold text-black uppercase tracking-widest block mb-1">
                COMPENSATION PROGRESSION
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-black font-sans">
                5-YEAR CAREER & SALARY LADDER ({roadmap.qualification.label.toUpperCase()})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm">
              {roadmap.careerLadder.map((cadre, cIdx) => (
                <div key={cIdx} className="p-6 border-2 border-black rounded-2xl bg-[#FAF9F5] flex flex-col justify-between space-y-4 shadow-[2px_2px_0px_0px_#000000]">
                  <div>
                    <div className="flex justify-between pb-2 mb-2 border-b-2 border-black/10 font-extrabold text-xs">
                      <span className="text-black uppercase bg-[#F5C518] px-2 py-0.5 rounded border border-black">{cadre.phase}</span>
                      <span className="text-zinc-600">{cadre.timeframe}</span>
                    </div>
                    <h4 className="font-extrabold text-base uppercase tracking-tight text-black mb-2">{cadre.role}</h4>
                    <div className="bg-white p-3 border-2 border-black rounded-xl mb-3">
                      <span className="text-lg font-extrabold text-black">{cadre.salary}</span>
                    </div>
                    <p className="text-sm text-zinc-800 font-sans font-medium">{cadre.focus}</p>
                  </div>
                  <div className="pt-3 border-t-2 border-black/10 flex justify-between text-xs font-extrabold text-black">
                    <span>ESI + PF + GRATUITY</span>
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">STATUTORY</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maps & District Vocational Centers */}
          <div className="border-2 border-black rounded-[28px] overflow-hidden p-6 sm:p-8 bg-white shadow-[5px_5px_0px_0px_#000000] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-black uppercase tracking-widest block mb-1">
                  SPATIAL VOCATIONAL RADAR
                </span>
                <h4 className="text-xl sm:text-2xl font-extrabold uppercase font-sans text-black">
                  {selectedDistrict} Industrial Parks &amp; Govt ITI Network
                </h4>
              </div>
              <span className="text-xs font-mono font-extrabold bg-[#F5C518] border border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#000000] w-fit">
                38 DISTRICTS CONNECTED
              </span>
            </div>

            <GoogleMapsEmbed
              districtName={districtObj.name}
              lat={districtObj.lat}
              lon={districtObj.lon}
            />

            {/* List of Local ITIs & Polytechnics with One-Click Directions */}
            {roadmap.districtRegistry.nearbyItisAndTraining && roadmap.districtRegistry.nearbyItisAndTraining.length > 0 && (
              <div className="pt-4 border-t-2 border-black space-y-3">
                <span className="text-xs font-mono font-extrabold text-black uppercase tracking-wider block">
                  LOCAL ACCREDITED TRAINING HUBS IN {selectedDistrict.toUpperCase()}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roadmap.districtRegistry.nearbyItisAndTraining.map((iti, iIdx) => (
                    <div
                      key={iIdx}
                      className="p-4 bg-[#FAF9F5] border-2 border-black rounded-xl flex flex-col justify-between shadow-[2px_2px_0px_0px_#000000] space-y-2"
                    >
                      <div>
                        <div className="font-extrabold text-sm text-black font-sans">{iti.name}</div>
                        <div className="text-xs font-mono text-zinc-600 font-bold">{iti.location}</div>
                        {iti.relevantTrades && iti.relevantTrades.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {iti.relevantTrades.slice(0, 3).map((tr, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-mono px-2 py-0.5 bg-white border border-black rounded-full font-bold"
                              >
                                {tr}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <a
                        href={resolveDynamicDeepLink({
                          category: "ITI_MAP_LOCATION",
                          district: selectedDistrict,
                          itiName: iti.name,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-extrabold text-black hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <span>📍 Locate on Maps ↗</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LearnerRoutesView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F4F1] flex items-center justify-center font-mono text-sm font-extrabold text-black">
          LOADING ROADMAP INTELLIGENCE...
        </div>
      }
    >
      <LearnerRoutesContent />
    </Suspense>
  );
}
