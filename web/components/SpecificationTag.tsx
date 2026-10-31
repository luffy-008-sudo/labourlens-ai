"use client";

import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface SpecificationTagProps {
  categoryTamil?: string;
  categoryJapanese?: string;
  categoryEnglish?: string;
  itemCode?: string;
  title: string;
  subtitle?: string;
  meta: Array<{ label: string; value: string | number; accent?: boolean }>;
  stamp?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function SpecificationTag({
  categoryTamil = "விவரக் குறிப்பு",
  categoryJapanese,
  categoryEnglish = "SPECIFICATION TAG",
  itemCode = "LL-TN-2026",
  title,
  subtitle,
  meta,
  stamp = "LABOURLENS AI // GROUNDED",
  children,
  className = "",
}: SpecificationTagProps) {
  const displayCategory = categoryTamil || categoryJapanese || "விவரக் குறிப்பு";

  return (
    <div
      className={`relative bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 text-black font-sans shadow-[5px_5px_0px_0px_#000000] transition-all overflow-hidden ${className}`}
    >
      {/* Top Header Rule */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b-2 border-black gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 bg-[#F5C518] border border-black inline-block shrink-0 rounded-full" />
          <span className="text-sm font-mono font-extrabold tracking-wider text-black uppercase truncate">
            {displayCategory} · {categoryEnglish}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-mono tracking-wider text-black font-extrabold bg-[#F5C518] px-3 py-1 border border-black rounded-full shrink-0 shadow-[1px_1px_0px_0px_#000000]">
          {itemCode}
        </span>
      </div>

      {/* Main Title Area */}
      <div className="my-4">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black leading-snug break-words uppercase font-sans">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-zinc-700 font-mono mt-1 tracking-tight leading-relaxed break-words font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Structured Meta Grid */}
      {meta && meta.length > 0 && (
        <div className="my-5 border-2 border-black rounded-2xl py-4 bg-[#FAF9F5] px-5 shadow-[2px_2px_0px_0px_#000000]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm font-mono">
            {meta.map((m, idx) => (
              <div
                key={idx}
                className="flex items-baseline justify-between border-b border-black/15 pb-2 gap-3 min-w-0"
              >
                <span className="text-zinc-700 shrink-0 truncate max-w-[50%] uppercase font-bold text-xs sm:text-sm">{m.label}</span>
                <span
                  className={`font-extrabold text-right truncate text-sm sm:text-base ${
                    m.accent ? "text-black bg-[#F5C518] px-2 py-0.5 rounded border border-black" : "text-black"
                  }`}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Body / Children Slots */}
      {children}

      {/* Bottom Clean Verification Footer */}
      <div className="pt-4 mt-5 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-sm font-mono">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-800 font-extrabold tracking-wide uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">{stamp}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="border border-black px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-mono text-xs font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>NSQF-VERIFIED</span>
          </div>
          <span className="text-xs text-zinc-600 font-mono hidden sm:inline uppercase font-bold">
            GODL-INDIA 2026
          </span>
        </div>
      </div>
    </div>
  );
}
