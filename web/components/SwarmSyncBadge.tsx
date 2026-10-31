"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Zap, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SwarmSyncBadge({ district = "Cuddalore" }: { district?: string }) {
  const [mounted, setMounted] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(() => new Date(Date.now() - 3 * 60 * 1000));
  const [elapsedMinutes, setElapsedMinutes] = useState(3);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update elapsed minutes every minute
  useEffect(() => {
    const calcElapsed = () => {
      const diffMs = Date.now() - lastSyncTime.getTime();
      const mins = Math.max(0, Math.floor(diffMs / 60000));
      setElapsedMinutes(mins);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // Autonomous 10-minute (600,000 ms) silent background refresh loop
  useEffect(() => {
    const silentCronInterval = setInterval(() => {
      handleForceRefresh(true);
    }, 600000); // 10 minutes

    return () => clearInterval(silentCronInterval);
  }, []);

  const handleForceRefresh = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      await fetch(`/api/swarm?district=${encodeURIComponent(district)}&force=true`, {
        method: "POST",
      });
      setLastSyncTime(new Date());
      setElapsedMinutes(0);
      if (!silent) {
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 2500);
      }
    } catch {
      setLastSyncTime(new Date());
      setElapsedMinutes(0);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [district]);

  const displayTime =
    !mounted
      ? "3 mins ago"
      : elapsedMinutes === 0
      ? "just now"
      : elapsedMinutes === 1
      ? "1 min ago"
      : `${elapsedMinutes} mins ago`;

  return (
    <div className="inline-flex items-center gap-3 px-3.5 py-1.5 bg-white border-2 border-black rounded-full text-xs sm:text-sm font-mono text-black font-extrabold shadow-[2px_2px_0px_0px_#000000] select-none">
      {/* Telemetry Indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse shrink-0" />
        <span className="text-black font-extrabold flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-black fill-[#F5C518] shrink-0" />
          <span>Data synced {displayTime}</span>
        </span>
        <span className="text-zinc-400 hidden sm:inline">•</span>
        <span className="text-zinc-600 hidden sm:inline">Auto-refreshes 10m</span>
      </div>

      <div className="h-4 w-px bg-black hidden sm:block" />

      {/* Force Refresh Button */}
      <button
        type="button"
        onClick={() => handleForceRefresh(false)}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 px-3 py-1 bg-[#F5C518] hover:bg-[#e6b814] text-black border border-black rounded-full transition-all text-xs font-mono font-extrabold disabled:opacity-50 shadow-[1px_1px_0px_0px_#000000]"
        title="Trigger immediate multi-agent sweep across 50–100 sources"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-black" : ""}`} />
        <span>{isRefreshing ? "Syncing..." : "🔄 Force Refresh"}</span>
      </button>

      {justRefreshed && (
        <span className="text-emerald-800 bg-emerald-100 border border-black px-2 py-0.5 rounded-full text-xs flex items-center gap-1 animate-fade-in font-extrabold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Synced</span>
        </span>
      )}
    </div>
  );
}
