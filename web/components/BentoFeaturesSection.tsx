"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Zap,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function BentoFeaturesSection() {
  const { lang } = useTranslation();

  const features = [
    {
      id: "district-radar",
      tag: "01 // DISTRICT INTELLIGENCE",
      title: "District Core Sectors & Growth",
      tamilTitle: "மாவட்ட தொழில் பகுப்பாய்வு",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-600",
      iconBg: "bg-blue-300",
      icon: BarChart3,
      desc:
        lang === "ta"
          ? "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் உள்ள SIPCOT தொழிற்பேட்டைகள், NLC மற்றும் கனரக தொழிற்சாலைகளின் விரிவாக்க முதலீடுகளை நேரலையாக ஆய்வு செய்கிறது."
          : "Harvests SIPCOT industrial clusters, NLC capex, and heavy engineering plants across all 38 districts to track real-time hiring demand near home.",
      metaPoints: [
        lang === "ta" ? "760+ உறுதிப்படுத்தப்பட்ட தொழில் குழுமங்கள்" : "760+ Verified Industrial Clusters",
        lang === "ta" ? "நிகர சேமிப்பு +186% அதிகம்" : "+186% Net Discretionary Savings vs Metro",
      ],
      linkText: lang === "ta" ? "மாவட்ட ரேடாரை திறக்கவும் ->" : "Explore District Radar ->",
      linkHref: "/districts",
    },
    {
      id: "role-classifier",
      tag: "02 // DUAL-TRACK CLASSIFIER",
      title: "Public PSU vs. Private Pay Scales",
      tamilTitle: "அரசு மற்றும் தனியார் வேலை வாய்ப்புகள்",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-600",
      iconBg: "bg-emerald-300",
      icon: Building2,
      desc:
        lang === "ta"
          ? "அரசு மற்றும் பொதுத்துறை (PSU) ஊதிய அளவுகோல்களையும், தனியார் தொழிற்சாலைகளின் NAPS உதவித்தொகை மற்றும் போனஸ்களையும் ஒப்பிட்டு வழிகாட்டுகிறது."
          : "Directly contrasts statutory IDA pay scales, DA/HRA allowances, and quarters with private SIPCOT starting stipends and rapid 5-year specialist tracks.",
      metaPoints: [
        lang === "ta" ? "அரசு ஊதிய அளவுகோல்கள் (W-1 முதல் E-2)" : "Official Pay Scales (W-1 to E-2 Cadre)",
        lang === "ta" ? "75%+ NAPS தொழிற்பழகுநர் உறுதி" : "75%+ NAPS Permanent Absorption",
      ],
      linkText: lang === "ta" ? "வேலை வாய்ப்புகளை ஒப்பிடவும் ->" : "Compare Pay Scales ->",
      linkHref: "/districts",
    },
    {
      id: "learner-routes",
      tag: "03 // ZERO-TO-JOB ROADMAP",
      title: "Zero-to-Employed Roadmaps",
      tamilTitle: "கற்றல் மற்றும் வேலைவாய்ப்பு வழிகாட்டி",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-600",
      iconBg: "bg-[#F5C518]",
      icon: Compass,
      desc:
        lang === "ta"
          ? "உங்கள் பட்டப்படிப்பு மற்றும் சுயவிவரத் திறன்களை உள்ளூர் ITI தொழிற்பயிற்சிகளுடன் இணைத்து 6 மாத வேலைவாய்ப்பு வழிகாட்டியை வழங்குகிறது."
          : "Matches your resume and academic background against factory machine tools (DCS, PLC, CNC, HAZOP) with checkable milestones and local ITI addresses.",
      metaPoints: [
        lang === "ta" ? "114 அரசு ITI மையங்கள் மற்றும் முகவரிகள்" : "114 Nearby Govt ITIs & Addresses",
        lang === "ta" ? "நடைமுறைத் திறன் இடைவெளி ஒப்பீடு" : "Interactive Resume Skill-Gap Diff",
      ],
      linkText: lang === "ta" ? "பயிற்சி பாதையை பார்க்க ->" : "Open Personalized Roadmap ->",
      linkHref: "/routes",
    },
  ];

  return (
    <section className="w-full bg-[#F4F4F1] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t-2 border-black">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ── Section Header (Swiss Minimalist) ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-black rounded-full font-mono text-sm font-extrabold shadow-[2px_2px_0px_0px_#000000]">
            <Sparkles className="w-4 h-4 text-[#F5C518]" />
            <span>
              {lang === "ta"
                ? "தமிழ்நாடு 38 மாவட்ட திறன் நுண்ணறிவு கட்டமைப்பு"
                : "BUILT FOR TAMIL NADU LEARNERS & POLICYMAKERS"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight font-sans uppercase">
            {lang === "ta"
              ? "உங்கள் மாவட்டத்திற்கு லேபர்லென்ஸ் என்ன செய்கிறது?"
              : "What Labourlens AI Does For Your District."}
          </h2>

          <p className="text-base sm:text-lg text-zinc-800 font-sans leading-relaxed font-medium">
            {lang === "ta"
              ? "அரசு தரவுத்தளங்கள், தொழிற்சாலை அறிவிப்புகள் மற்றும் வேலைவாய்ப்பு விபரங்களை ஒருங்கிணைத்து ஒவ்வொரு மாவட்டத்திற்கும் பிரத்யேக வழிகாட்டல்."
              : "Bridging the gap between college classroom theory and real shopfloor machine requirements across all 38 districts of Tamil Nadu."}
          </p>
        </div>

        {/* ── 3-Column Bento Cards Grid (Neo-Brutalist Layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] hover:translate-y-[-3px] hover:shadow-[7px_7px_0px_0px_#000000] transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-5">
                  {/* Top Square Icon Box with Outline (Reference Style) */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 ${feat.iconBg} text-black border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]`}>
                      <Icon className="w-7 h-7 text-black stroke-[2.2]" />
                    </div>
                    <span className="font-mono text-xs font-extrabold px-3 py-1 bg-[#FAF9F5] border-2 border-black rounded-full uppercase shadow-[1px_1px_0px_0px_#000000]">
                      {feat.tag}
                    </span>
                  </div>

                  {/* Title & Tamil Sub-label */}
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-black font-sans leading-snug uppercase">
                      {feat.title}
                    </h3>
                    <p className="text-sm font-mono font-bold text-zinc-600">
                      {feat.tamilTitle}
                    </p>
                  </div>

                  {/* Description Copy */}
                  <p className="text-base text-zinc-900 leading-relaxed font-sans font-medium">
                    {feat.desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2.5 pt-3 border-t-2 border-zinc-100">
                    {feat.metaPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm font-mono text-black font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-4 border-t-2 border-black">
                  <Link
                    href={feat.linkHref}
                    className="group inline-flex items-center gap-2 text-sm sm:text-base font-mono font-extrabold uppercase text-black hover:text-[#e6b814] transition-colors"
                  >
                    <span>{feat.linkText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
