"use client";

import React from "react";
import Link from "next/link";
import { Compass, MapPin, ShieldCheck, ArrowUpRight, User, Activity, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { lang, t } = useTranslation();

  return (
    <footer className="w-full bg-[#FAF9F5] border-t-2 border-black text-black">
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 py-12 space-y-10">

        {/* ── Top Header Strip ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#F5C518] text-black border-2 border-black rounded-full flex items-center justify-center font-extrabold text-base font-mono shadow-[2px_2px_0px_0px_#000000]">
              LL
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-black font-mono uppercase">
                  LABOURLENS AI
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 bg-[#F5C518] text-black font-extrabold border border-black rounded-full">
                  TN-38
                </span>
              </div>
              <span className="text-sm font-mono text-zinc-700 block uppercase font-bold mt-0.5">
                {lang === "ta"
                  ? "தன்னாட்சி மல்டி-ஏஜென்ட் தொழிலாளர் நுண்ணறிவு அமைப்பு"
                  : "Autonomous Multi-Agent Workforce Intelligence System"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-mono">
            <span className="px-4 py-1.5 bg-white border-2 border-black rounded-full text-black font-extrabold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
              88 SOURCES VERIFIED &lt;10M AGO
            </span>
            <span className="px-4 py-1.5 bg-white border-2 border-black rounded-full text-black font-bold shadow-[2px_2px_0px_0px_#000000]">
              GODL-INDIA OPEN DATA
            </span>
          </div>
        </div>

        {/* ── Main Footer Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Col 1: Mission */}
          <div className="space-y-3">
            <h4 className="font-mono font-extrabold text-sm uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C518] border border-black" />
              01 // MISSION STATEMENT
            </h4>
            <p className="text-base text-zinc-800 leading-relaxed font-sans font-medium">
              {lang === "ta"
                ? "தமிழ்நாட்டின் கிராமப்புற மற்றும் நகர்ப்புற மாவட்டங்களை திறமை ஏற்றுமதியாளர்களிலிருந்து தன்னிறைவு பெற்ற மாவட்டங்களாக மாற்றுவது லேபர்லென்ஸ் AI-ன் முக்கிய நோக்கமாகும். உள்ளூர் SIPCOT மற்றும் பொதுத்துறை நிறுவனங்களில் நேரடி வேலைவாய்ப்புகளை உருவாக்கி நகரங்களை நோக்கிய கட்டாய இடப்பெயர்வை தடுக்கிறது."
                : "Labourlens AI transforms rural and semi-urban districts of Tamil Nadu from talent exporters into self-sustaining GDP engines. Real-time background swarms continuously ingest verified government, NAPS apprenticeship, and private industrial sources across all 38 districts to eliminate forced urban migration."}
            </p>
            <div className="pt-2 text-xs sm:text-sm font-mono font-extrabold text-black">
              REGISTER CODE: TN-LGD-38D-2026 • 100% LGD VERIFIED
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono font-extrabold text-sm uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C518] border border-black" />
              02 // SYSTEM MODULES
            </h4>
            <ul className="space-y-3 text-sm sm:text-base font-mono font-extrabold">
              <li>
                <Link href="/districts" className="hover:text-black hover:underline flex items-center justify-between transition-colors group p-1">
                  <span>01 // DISTRICT INTELLIGENCE RADAR</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-black hover:underline flex items-center justify-between transition-colors group p-1">
                  <span>02 // LEARNER VOCATIONAL ROADMAP</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-black hover:underline flex items-center justify-between transition-colors group p-1">
                  <span>03 // USER PROFILE &amp; RESUME INTAKE</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-black hover:underline flex items-center justify-between transition-colors group p-1">
                  <span>04 // CONSTITUTIONAL REVIEW QUEUE</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compensation & Provenance */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h4 className="font-mono font-extrabold text-sm uppercase tracking-wider text-black">
                03 // CONSENSUS PAY SCALES
              </h4>
              <span className="px-2.5 py-0.5 bg-[#F5C518] text-black border border-black rounded-full font-mono text-xs font-bold">
                SIPCOT &amp; NAPS
              </span>
            </div>
            <p className="text-sm text-zinc-700 font-medium">
              Multi-source compensation verified across statutory IDA grids and factory apprenticeships:
            </p>
            <div className="space-y-2.5 font-mono text-sm pt-1">
              <div className="flex justify-between py-1.5 border-b border-zinc-200">
                <span className="text-zinc-600 font-bold">NAPS Apprentice:</span>
                <span className="font-extrabold text-black">₹10,500 – ₹16,000 / mo</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-200">
                <span className="text-zinc-600 font-bold">Entry ITI/Diploma:</span>
                <span className="font-extrabold text-emerald-800 bg-emerald-100 px-1.5 rounded">₹2.2L – ₹3.6L LPA</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-600 font-bold">5-Yr Senior Cadre:</span>
                <span className="font-extrabold text-black bg-[#F5C518] px-1.5 rounded">₹7.5L – ₹12.0L LPA</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── 38 Districts Micro Grid ── */}
        <div className="p-5 bg-white border-2 border-black rounded-2xl text-xs sm:text-sm font-mono text-zinc-800 leading-relaxed shadow-[3px_3px_0px_0px_#000000]">
          <span className="font-extrabold uppercase text-black block mb-1.5 text-sm">
            TAMIL NADU 38-DISTRICT REGISTRY COVERAGE:
          </span>
          Ariyalur · Chengalpattu · Chennai · Coimbatore · Cuddalore · Dharmapuri · Dindigul · Erode · Kallakurichi · Kanchipuram · Kanyakumari · Karur · Krishnagiri · Madurai · Mayiladuthurai · Nagapattinam · Namakkal · Nilgiris · Perambalur · Pudukkottai · Ramanathapuram · Ranipet · Salem · Sivaganga · Tenkasi · Thanjavur · Theni · Thoothukudi · Tiruchirappalli · Tirunelveli · Tirupathur · Tiruppur · Tiruvallur · Tiruvannamalai · Tiruvarur · Vellore · Viluppuram · Virudhunagar
        </div>

        {/* ── Bottom Legal Notice ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-mono text-zinc-700 gap-3 border-t-2 border-black pt-6">
          <span>
            {lang === "ta"
              ? "© 2026 Labourlens AI. இந்திய அரசு திறந்த தரவு உரிமம் (GODL-India). Zero PII persisted."
              : "© 2026 Labourlens AI. Published under Government Open Data License (GODL-India). Zero PII persisted."}
          </span>
          <span className="text-black font-extrabold uppercase">
            LABOURLENS AI // TN-38 ENGINE
          </span>
        </div>

      </div>
    </footer>
  );
}
