"use client";

import React, { useState, useEffect } from "react";
import { Zap, RefreshCw, CheckCircle2 } from "lucide-react";
import { useUserProfile } from "@/lib/UserProfileContext";

export default function SwarmSyncBadge({ district }: { district?: string }) {
  const { selectedDistrict, isSyncing, liveSyncTime, triggerLiveSync } = useUserProfile();
  const [justRefreshed, setJustRefreshed] = useState(false);
  const activeDistrict = district || selectedDistrict || "Krishnagiri";

  const handleForceRefresh = async () => {
    await triggerLiveSync(activeDistrict);
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 3000);
  };

  return (
    <div className="inline-flex items-center gap-3 px-3.5 py-1.5 bg-white border-2 border-black rounded-full text-xs sm:text-sm font-mono text-black font-extrabold shadow-[2px_2px_0px_0px_#000000] select-none">
      {/* Telemetry Indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full border border-black shrink-0 ${
            isSyncing ? "bg-[#F5C518] animate-ping" : "bg-emerald-500 animate-pulse"
          }`}
        />
        <span className="text-black font-extrabold flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-black fill-[#F5C518] shrink-0" />
          <span>
            {isSyncing
              ? `⚡ Querying SIPCOT, NAPS & DGT Portals for ${activeDistrict}...`
              : `Data synced ${liveSyncTime}`}
          </span>
        </span>
        <span className="text-zinc-400 hidden sm:inline">•</span>
        <span className="text-zinc-600 hidden sm:inline">Auto-refreshes 10m</span>
      </div>

      <div className="h-4 w-px bg-black hidden sm:block" />

      {/* Force Refresh Button */}
      <button
        type="button"
        onClick={handleForceRefresh}
        disabled={isSyncing}
        className="flex items-center gap-1.5 px-3 py-1 bg-[#F5C518] hover:bg-[#e6b814] text-black border border-black rounded-full transition-all text-xs font-mono font-extrabold disabled:opacity-50 shadow-[1px_1px_0px_0px_#000000]"
        title="Trigger immediate multi-agent sweep across 50–100 sources"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-black" : ""}`} />
        <span>{isSyncing ? "Syncing..." : "🔄 Force Refresh"}</span>
      </button>

      {justRefreshed && !isSyncing && (
        <span className="text-emerald-800 bg-emerald-100 border border-black px-2 py-0.5 rounded-full text-xs flex items-center gap-1 animate-fade-in font-extrabold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Synced</span>
        </span>
      )}
    </div>
  );
}
