"use client";

import React from "react";
import { Compass, TrendingUp, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface EquityToggleProps {
  mode: "local_priority" | "market";
  onChange: (mode: "local_priority" | "market") => void;
  className?: string;
}

export default function EquityToggle({ mode, onChange, className = "" }: EquityToggleProps) {
  const { lang, t } = useTranslation();

  return (
    <div
      className={`bg-[#FAF7F0] border-2 border-[#22201E] p-3 text-[#22201E] font-mono shadow-sm w-full ${className}`}
      style={{ boxShadow: "3px 3px 0px 0px #22201E" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b-2 border-[#6E2620] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#6E2620] shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#6E2620]">
            {lang === "ta"
              ? "முன்னுரிமை தெரிவு · கொள்கை & சந்தை வழித்தடம்"
              : "முன்னுரிமை தெரிவு · POLICY & MARKET ROUTING TOGGLE"}
          </span>
        </div>
        <span className="text-[10px] text-[#22201E]/80 font-bold bg-[#E5D3B3]/60 px-2 py-0.5 border border-[#22201E]/20 self-start sm:self-auto">
          {mode === "local_priority"
            ? lang === "ta" ? "பயன்முறை: உள்ளூர் முன்னுரிமை" : "MODE: LOCAL PRIORITY"
            : lang === "ta" ? "பயன்முறை: சந்தை வாய்ப்பு" : "MODE: MARKET OPPORTUNITY"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Local Priority Mode Button */}
        <button
          onClick={() => onChange("local_priority")}
          className={`text-left p-2.5 border transition-all flex flex-col justify-between ${
            mode === "local_priority"
              ? "bg-[#6E2620] text-white border-[#22201E] shadow-[2px_2px_0px_0px_#22201E]"
              : "bg-white text-[#22201E] border-[#22201E]/30 hover:bg-[#E5D3B3]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold flex items-center gap-1.5 font-serif text-sm">
              <Compass className="w-4 h-4 text-[#E5D3B3]" />
              {t("home.localPriority", "Local Retention Priority")}
            </span>
            <span
              className={`text-[9px] px-1 py-0.2 border ${
                mode === "local_priority"
                  ? "bg-white text-[#6E2620] border-white"
                  : "bg-[#E5D3B3] text-[#22201E] border-[#22201E]/30"
              }`}
            >
              DEFAULT
            </span>
          </div>
          <p
            className={`text-[11px] leading-relaxed font-sans ${
              mode === "local_priority" ? "text-white/90" : "text-[#22201E]/75"
            }`}
          >
            {t("home.localPriorityDesc", "Prioritizes immediate high-deficit jobs inside candidate's home district or within 35km radius.")}
          </p>
          <div
            className={`mt-2 pt-1 border-t text-[10px] ${
              mode === "local_priority" ? "border-white/20 text-[#E5D3B3]" : "border-[#22201E]/10 text-[#22201E]/60"
            }`}
          >
            +0.15 Equity Boost · Zero Migration Cost
          </div>
        </button>

        {/* Market Mode Button */}
        <button
          onClick={() => onChange("market")}
          className={`text-left p-2.5 border transition-all flex flex-col justify-between ${
            mode === "market"
              ? "bg-[#6E2620] text-white border-[#22201E] shadow-[2px_2px_0px_0px_#22201E]"
              : "bg-white text-[#22201E] border-[#22201E]/30 hover:bg-[#E5D3B3]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold flex items-center gap-1.5 font-serif text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {t("home.marketPriority", "Market Opportunity Mode")}
            </span>
            <span
              className={`text-[9px] px-1 py-0.2 border ${
                mode === "market"
                  ? "bg-white text-[#6E2620] border-white"
                  : "bg-[#E5D3B3] text-[#22201E] border-[#22201E]/30"
              }`}
            >
              METRO
            </span>
          </div>
          <p
            className={`text-[11px] leading-relaxed font-sans ${
              mode === "market" ? "text-white/90" : "text-[#22201E]/75"
            }`}
          >
            {t("home.marketPriorityDesc", "Maximizes entry-level salary and metro career trajectory regardless of geographic distance.")}
          </p>
          <div
            className={`mt-2 pt-1 border-t text-[10px] ${
              mode === "market" ? "border-white/20 text-[#E5D3B3]" : "border-[#22201E]/10 text-[#22201E]/60"
            }`}
          >
            Highest Salary Route · Tier-1 Hubs (Chennai/Hosur)
          </div>
        </button>
      </div>
    </div>
  );
}
