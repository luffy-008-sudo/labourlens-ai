"use client";

import React from "react";
import { UserCheck, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export interface Persona {
  id: string;
  name: string;
  nameTa?: string;
  education: string;
  educationTa?: string;
  district: string;
  districtLgd: string;
  interests: string[];
  skills: string[];
  maxTravelKm: number;
  tagline: string;
  taglineTa?: string;
}

export const DEMO_PERSONAS: Persona[] = [
  {
    id: "p1",
    name: "Murugan · 12th Pass",
    nameTa: "முருகன் · 12-ஆம் வகுப்பு",
    education: "12th Standard",
    educationTa: "12-ஆம் வகுப்பு தேர்ச்சி",
    district: "Krishnagiri",
    districtLgd: "582",
    interests: ["ev_auto", "electronics_ems"],
    skills: ["computer literacy", "basic english", "assembly basics"],
    maxTravelKm: 25,
    tagline: "Wants local assembly work in Pochampalli/Hosur EV belt",
    taglineTa: "போச்சம்பள்ளி/ஓசூர் மின்வாகன தொழிற்பேட்டையில் அசெம்பிளி பணி நாடுகிறார்",
  },
  {
    id: "p2",
    name: "Karthik · ITI Electrician",
    nameTa: "கார்த்திக் · ITI எலக்ட்ரீசியன்",
    education: "ITI",
    educationTa: "ITI தொழிற்பயிற்சி",
    district: "Thoothukudi",
    districtLgd: "608",
    interests: ["solar", "green_hydrogen", "offshore_wind"],
    skills: ["wiring", "electrical maintenance", "safety protocols"],
    maxTravelKm: 35,
    tagline: "Looking for green hydrogen & wind turbine maintenance at VOC Port",
    taglineTa: "வி.ஓ.சி துறைமுகத்தில் பசுமை ஹைட்ரஜன் மற்றும் காற்றாலை பராமரிப்பு பணி",
  },
  {
    id: "p3",
    name: "Deepa · Diploma Mechanical",
    nameTa: "தீபா · டிப்ளமோ மெக்கானிக்கல்",
    education: "Diploma (Polytechnic)",
    educationTa: "பாலிடெக்னிக் டிப்ளமோ",
    district: "Coimbatore",
    districtLgd: "584",
    interests: ["auto_components", "precision_tooling", "pumps_motors"],
    skills: ["blueprint reading", "autocad", "lathe operation"],
    maxTravelKm: 30,
    tagline: "Targeting precision CNC tooling and pump manufacturing in Eachanari",
    taglineTa: "ஈச்சனாரியில் துல்லிய CNC மற்றும் பம்ப் உற்பத்தி ஆலை வேலைவாய்ப்பு",
  },
  {
    id: "p4",
    name: "Anand · B.Sc Graduate",
    nameTa: "ஆனந்த் · பி.எஸ்சி பட்டதாரி",
    education: "Graduate",
    educationTa: "இளங்கலை பட்டதாரி",
    district: "Thanjavur",
    districtLgd: "601",
    interests: ["agro_processing", "food_beverage", "cold_chain"],
    skills: ["laboratory testing", "data entry", "inventory management"],
    maxTravelKm: 40,
    tagline: "Exploring modern agro-food cold chain quality assurance",
    taglineTa: "நவீன வேளாண் உணவு பதப்படுத்துதல் & தரக்கட்டுப்பாடு பணி வாய்ப்பு",
  },
];

interface PersonaSelectorProps {
  selectedId: string;
  onSelect: (p: Persona) => void;
  className?: string;
}

export default function PersonaSelector({ selectedId, onSelect, className = "" }: PersonaSelectorProps) {
  const { lang, t } = useTranslation();

  return (
    <div
      className={`bg-[#FAF7F0] border-2 border-[#22201E] p-3 sm:p-4 text-[#22201E] font-mono shadow-sm w-full ${className}`}
      style={{ boxShadow: "3px 3px 0px 0px #22201E" }}
    >
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2.5 border-b-2 border-[#6E2620] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#6E2620] shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#6E2620]">
            {lang === "ta"
              ? "கற்பவர் சுயவிவரங்கள் · மாதிரி அளவீடுகள்"
              : "கற்பவர் சுயவிவரம் · BENCHMARK PERSONA PROFILES"}
          </span>
        </div>
        <span className="text-[10px] text-[#22201E]/70 font-bold bg-[#E5D3B3]/50 px-2 py-0.5 border border-[#22201E]/20">
          {lang === "ta" ? "1-கிளிக் மாதிரி தேர்வு" : "1-CLICK CALIBRATION"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {DEMO_PERSONAS.map((p) => {
          const isSelected = selectedId === p.id;
          const displayName = lang === "ta" && p.nameTa ? p.nameTa : p.name;
          const displayEdu = lang === "ta" && p.educationTa ? p.educationTa : p.education;
          const displayTagline = lang === "ta" && p.taglineTa ? p.taglineTa : p.tagline;

          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`p-2.5 border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? "bg-[#6E2620] text-white border-[#22201E] shadow-[2px_2px_0px_0px_#22201E]"
                  : "bg-white text-[#22201E] border-[#22201E]/30 hover:bg-[#E5D3B3]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 ${
                      isSelected ? "bg-white text-[#6E2620]" : "bg-[#E5D3B3] text-[#22201E]"
                    }`}
                  >
                    {p.id.toUpperCase()} · {p.district}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-[#E5D3B3]" />}
                </div>

                <div className="font-bold text-xs font-serif mt-1">{displayName}</div>
                <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? "text-[#E5D3B3]" : "text-[#22201E]/70"}`}>
                  {displayEdu}
                </div>

                <p
                  className={`text-[10px] font-sans mt-1.5 line-clamp-2 leading-relaxed ${
                    isSelected ? "text-white/90" : "text-[#22201E]/80"
                  }`}
                >
                  {displayTagline}
                </p>
              </div>

              <div
                className={`mt-2 pt-1.5 border-t text-[9px] font-mono flex items-center justify-between ${
                  isSelected ? "border-white/20 text-[#E5D3B3]" : "border-[#22201E]/10 text-[#22201E]/60"
                }`}
              >
                <span>{lang === "ta" ? "பயண வரம்பு" : "Radius"}: {p.maxTravelKm} km</span>
                <span className="font-bold">LGD: {p.districtLgd}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
