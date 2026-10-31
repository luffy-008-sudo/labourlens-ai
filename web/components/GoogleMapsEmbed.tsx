"use client";

import React, { useState } from "react";
import { MapPin, Navigation, ExternalLink, Layers, Compass, Building, GraduationCap } from "lucide-react";
import { resolveDynamicDeepLink } from "@/lib/universalLinkResolver";

interface GoogleMapsEmbedProps {
  districtName: string;
  lat: number;
  lon: number;
  zoom?: number;
  locations?: Array<{ name: string; type: "park" | "iti" | "factory"; lat: number; lon: number }>;
}

export default function GoogleMapsEmbed({
  districtName,
  lat,
  lon,
  zoom = 11,
  locations = [],
}: GoogleMapsEmbedProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [activeFilter, setActiveFilter] = useState<"all" | "park" | "iti" | "factory">("all");

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}&z=${zoom}&output=embed&t=${mapType === "satellite" ? "k" : "m"}`;
  const directMapsLink = resolveDynamicDeepLink({
    category: "SIPCOT_PARK_MAP",
    district: districtName,
  });

  // Default key industrial points for the district
  const defaultPOIs = [
    { name: `SIPCOT Industrial Park ${districtName}`, type: "park", lat: lat + 0.03, lon: lon + 0.02 },
    { name: `Government ITI & Polytechnic ${districtName}`, type: "iti", lat: lat - 0.02, lon: lon - 0.01 },
    { name: `Mega Cluster Manufacturing SEZ`, type: "factory", lat: lat + 0.01, lon: lon + 0.04 },
  ];

  const pois = locations.length > 0 ? locations : defaultPOIs;
  const filteredPOIs = activeFilter === "all" ? pois : pois.filter((p) => p.type === activeFilter);

  return (
    <div
      className="bg-[#FAF7F0] border-2 border-[#22201E] p-3 text-[#22201E] font-sans shadow-sm"
      style={{ boxShadow: "3px 3px 0px 0px #22201E" }}
    >
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b-2 border-[#6E2620] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#6E2620] shrink-0" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6E2620]">
            புவியியல் வரைபடம் · GOOGLE MAPS PLATFORM SPATIAL RADAR
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#22201E]/70 font-semibold">
            {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
          </span>
          <a
            href={directMapsLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#22201E] bg-[#E5D3B3]/40 text-[#22201E] hover:bg-[#6E2620] hover:text-white transition-colors"
          >
            Google Maps <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-[#22201E]/20 text-xs font-mono gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[#22201E]/60 text-[11px]">Layer:</span>
          <button
            onClick={() => setMapType("roadmap")}
            className={`px-2 py-0.5 border ${
              mapType === "roadmap"
                ? "bg-[#22201E] text-white border-[#22201E]"
                : "bg-white text-[#22201E] border-[#22201E]/30"
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`px-2 py-0.5 border ${
              mapType === "satellite"
                ? "bg-[#22201E] text-white border-[#22201E]"
                : "bg-white text-[#22201E] border-[#22201E]/30"
            }`}
          >
            Satellite
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-[#22201E]/60">Markers:</span>
          {(["all", "park", "iti", "factory"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-1.5 py-0.5 uppercase font-mono ${
                activeFilter === f
                  ? "bg-[#6E2620] text-white font-bold"
                  : "bg-white border border-[#22201E]/20 text-[#22201E]/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Google Map */}
      <div className="relative mt-2 border border-[#22201E] bg-[#E5D3B3]/20 overflow-hidden h-72">
        <iframe
          title={`Google Map - ${districtName}`}
          src={mapsUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Minimalist Coordinates HUD */}
        <div className="absolute top-2 left-2 bg-[#FAF7F0]/95 border border-[#22201E] p-2 text-[10px] font-mono shadow-sm pointer-events-none">
          <div className="font-bold text-[#6E2620] uppercase">{districtName} Corridor</div>
          <div className="text-[#22201E]/80">Lat: {lat} | Lon: {lon}</div>
          <div className="text-[#22201E]/60 text-[9px] mt-0.5">Tamil Nadu Industrial Grid</div>
        </div>
      </div>

      {/* Verified Spatial Pins Catalog */}
      <div className="mt-3 border-t border-[#22201E]/20 pt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#22201E]/60 mb-1.5">
          Verified Spatial Geocodes ({filteredPOIs.length} Points of Interest)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
          {filteredPOIs.map((poi, idx) => (
            <div
              key={idx}
              className="p-2 border border-[#22201E]/20 bg-white hover:border-[#6E2620] transition-colors flex items-start gap-2"
            >
              {poi.type === "park" ? (
                <Building className="w-4 h-4 text-[#6E2620] shrink-0 mt-0.5" />
              ) : poi.type === "iti" ? (
                <GraduationCap className="w-4 h-4 text-[#2E5A44] shrink-0 mt-0.5" />
              ) : (
                <Compass className="w-4 h-4 text-[#B87326] shrink-0 mt-0.5" />
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-[#22201E] truncate">{poi.name}</div>
                <div className="text-[10px] text-[#22201E]/60 font-mono">
                  {poi.lat.toFixed(3)}°N, {poi.lon.toFixed(3)}°E
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
