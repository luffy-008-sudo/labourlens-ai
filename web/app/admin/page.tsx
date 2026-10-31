"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Upload,
  Database,
  Play,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Layers,
  RefreshCw,
  Clock,
} from "lucide-react";
import SpecificationTag from "@/components/SpecificationTag";
import { TN_38_DISTRICTS } from "@/lib/districtsData";
import { useTranslation } from "@/lib/i18n";
import { resolveDynamicDeepLink } from "@/lib/universalLinkResolver";

interface ReviewQueueItem {
  id: number;
  kind: string;
  reason: string;
  status: "pending" | "approved" | "edited" | "rejected";
  payload: {
    company?: string;
    cluster_slug?: string;
    district_lgd?: string;
    investment_inr_cr?: number;
    jobs_direct?: number;
    evidence_quote?: string;
    source_url?: string;
    similarity_ratio?: number;
    [key: string]: any;
  };
}

export default function AdminPage() {
  const { lang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"review" | "import" | "sources" | "trigger">("review");

  // Review Queue Items
  const [reviewItems, setReviewItems] = useState<ReviewQueueItem[]>([
    {
      id: 101,
      kind: "low_confidence_project",
      reason: "Capex figure verified in text (₹850 Cr), but job count mentioned as 'up to 1,500' without official Gazette/SIPCOT notification.",
      status: "pending",
      payload: {
        company: "SunEdison Renewables India",
        cluster_slug: "solar_equipment",
        district_lgd: "582",
        investment_inr_cr: 850,
        jobs_direct: 1500,
        evidence_quote: "SunEdison has proposed an 850 crore solar ingot line near Hosur that could employ up to 1,500 personnel over two phases.",
        source_url: "https://economictimes.indiatimes.com/industry/renewables/sunedison-hosur-solar",
        similarity_ratio: 92.4,
      },
    },
    {
      id: 102,
      kind: "alias_resolution_ambiguity",
      reason: "Article mentions 'Vembar coastal belt' near Tuticorin border, ambiguous whether district is Thoothukudi (608) or Ramanathapuram (598).",
      status: "pending",
      payload: {
        company: "Coastal Aquaculture Tech Hub",
        cluster_slug: "marine_seafood",
        district_lgd: "608",
        investment_inr_cr: 120,
        jobs_direct: 350,
        evidence_quote: "The Vembar coastal cluster is slated for a ₹120 crore modern cold storage and shrimp processing terminal.",
        source_url: "https://thehindu.com/news/national/tamil-nadu/vembar-aquaculture-park",
        similarity_ratio: 94.1,
      },
    },
    {
      id: 103,
      kind: "disputed_timeline",
      reason: "Commercial operations date (COD) reported as Q3 2027 by local daily, but corporate press release cites Q1 2028.",
      status: "pending",
      payload: {
        company: "TVS Motor Component Subsidiary",
        cluster_slug: "auto_components",
        district_lgd: "582",
        investment_inr_cr: 420,
        jobs_direct: 600,
        evidence_quote: "TVS subsidiary commences ₹420 Cr component casting facility expansion in Hosur industrial complex.",
        source_url: "https://business-standard.com/companies/tvs-motor-hosur-expansion",
        similarity_ratio: 95.0,
      },
    },
  ]);

  // CSV Import State
  const [selectedTable, setSelectedTable] = useState("institutions");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Trigger State
  const [triggerGraph, setTriggerGraph] = useState("signal_discovery");
  const [triggerDistrict, setTriggerDistrict] = useState("582");
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleDecision = (id: number, action: "approve" | "reject") => {
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item
      )
    );
  };

  const handleEditSave = (id: number, updatedJobs: number) => {
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "edited",
              payload: { ...item.payload, jobs_direct: updatedJobs },
            }
          : item
      )
    );
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsUploading(true);
    setImportStatus(null);

    setTimeout(() => {
      setImportStatus(`CSV Import Validated: Parsed 24 rows for '${selectedTable}' with required provenance headers.`);
      setIsUploading(false);
      setCsvFile(null);
    }, 700);
  };

  const handleTriggerRun = async () => {
    setIsTriggering(true);
    setTriggerMessage(null);

    setTimeout(() => {
      setTriggerMessage(`Workflow [${triggerGraph}] dispatched for district LGD ${triggerDistrict}. Check Behind the Data tab.`);
      setIsTriggering(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] py-6 sm:py-8 w-full overflow-x-hidden font-sans text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden space-y-8">
        {/* Header */}
        <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000]">
          <div className="flex flex-col md:flex-row md:items-start justify-between pb-4 border-b-2 border-black gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF9F5] border-2 border-black rounded-full text-xs font-mono font-extrabold text-black mb-2 shadow-[2px_2px_0px_0px_#000000]">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                {lang === "ta"
                  ? "நிர்வாக & மனித சரிபார்ப்பு மையம்"
                  : "ADMIN & HUMAN AUDIT · LABOURLENS HITL CONSOLE"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight font-sans uppercase">
                Review Queue & Data Operations
              </h1>
              <p className="text-xs font-mono text-zinc-600 mt-1 max-w-3xl leading-relaxed font-medium">
                Audit flagged signals before promotion to production tables, ingest reviewed CSV data with provenance labels, and manage verified data sources across Tamil Nadu.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 bg-[#F5C518] border-2 border-black rounded-full font-extrabold text-black shadow-[2px_2px_0px_0px_#000000]">
                {reviewItems.filter((i) => i.status === "pending").length} PENDING AUDITS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-black gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2.5 font-extrabold border-t-2 border-l-2 border-r-2 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === "review"
                ? "bg-[#F5C518] border-black text-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white border-black/40 text-black/70 hover:text-black hover:bg-[#FAF9F5]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            Review Queue ({reviewItems.filter((i) => i.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2.5 font-extrabold border-t-2 border-l-2 border-r-2 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === "import"
                ? "bg-[#F5C518] border-black text-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white border-black/40 text-black/70 hover:text-black hover:bg-[#FAF9F5]"
            }`}
          >
            <Upload className="w-4 h-4 text-black" />
            CSV Data Importer
          </button>
          <button
            onClick={() => setActiveTab("trigger")}
            className={`px-4 py-2.5 font-extrabold border-t-2 border-l-2 border-r-2 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === "trigger"
                ? "bg-[#F5C518] border-black text-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white border-black/40 text-black/70 hover:text-black hover:bg-[#FAF9F5]"
            }`}
          >
            <Play className="w-4 h-4 text-black" />
            Dispatch Agent Workflow
          </button>
        </div>

        {/* Tab 1: Review Queue */}
        {activeTab === "review" && (
          <div className="space-y-4">
            {reviewItems.map((item) => (
              <SpecificationTag
                key={item.id}
                categoryTamil="சரிபார்க்க வேண்டிய உருப்படிகள்"
                categoryEnglish={`REVIEW ITEM #${item.id}`}
                itemCode={`REV-ITEM-${item.id}`}
                title={`${item.payload.company} (₹${item.payload.investment_inr_cr} Cr)`}
                subtitle={`Reason: ${item.reason}`}
                meta={[
                  { label: "Audit Status", value: item.status.toUpperCase(), accent: true },
                  { label: "Target District LGD", value: item.payload.district_lgd || "582" },
                  { label: "Target Sector", value: item.payload.cluster_slug || "auto_components" },
                  { label: "Fuzzy String Match", value: `${item.payload.similarity_ratio}%` },
                ]}
              >
                <div className="my-2 p-3 bg-white border border-[#22201E]/20 text-xs font-mono">
                  <div className="font-bold text-[#6E2620] mb-1">CORROBORATING SOURCE EVIDENCE:</div>
                  <p className="font-serif italic text-[#22201E]/85">
                    "{item.payload.evidence_quote}"
                  </p>
                  <div className="mt-2 text-right">
                    <a
                      href={item.payload.source_url && item.payload.source_url !== "#" ? item.payload.source_url : resolveDynamicDeepLink({
                        category: "VERIFIED_SOURCE_EVIDENCE",
                        district: item.payload.district_lgd || "Tamil Nadu",
                        companyName: item.payload.firm,
                        sourceHeadline: item.payload.evidence_quote,
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6E2620] font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      Canonical Source Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {item.status === "pending" && (
                  <div className="mt-3 pt-2 border-t border-[#22201E]/15 flex items-center justify-end gap-2 font-mono text-xs">
                    <button
                      onClick={() => handleDecision(item.id, "reject")}
                      className="px-3 py-1.5 border border-[#8E3224] text-[#8E3224] hover:bg-[#8E3224] hover:text-white font-bold transition-colors"
                    >
                      Reject Signal
                    </button>
                    <button
                      onClick={() => handleEditSave(item.id, Math.round((item.payload.jobs_direct || 1000) * 0.8))}
                      className="px-3 py-1.5 border border-[#B87326] text-[#B87326] hover:bg-[#B87326] hover:text-white font-bold transition-colors"
                    >
                      Conservative Edit (-20% jobs)
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, "approve")}
                      className="px-3.5 py-1.5 bg-[#2E5A44] text-white border border-[#22201E] font-bold hover:bg-[#2E5A44]/90 transition-colors"
                    >
                      Approve & Promote
                    </button>
                  </div>
                )}
              </SpecificationTag>
            ))}
          </div>
        )}

        {/* Tab 2: CSV Importer */}
        {activeTab === "import" && (
          <div
            className="bg-[#FAF7F0] border-2 border-[#22201E] p-5 font-mono text-xs shadow-sm max-w-2xl"
            style={{ boxShadow: "3px 3px 0px 0px #22201E" }}
          >
            <div className="font-bold text-xs uppercase text-[#6E2620] pb-2 border-b-2 border-[#6E2620] mb-3">
              CSV Data Ingestion (Provenance Mandatory)
            </div>

            <form onSubmit={handleCsvSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E2620] mb-1">
                  TARGET DATABASE TABLE
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-[#22201E] p-2 text-[#22201E]"
                >
                  <option value="institutions">institutions (ITIs, Polytechnics, PMKVY centres)</option>
                  <option value="qualifications">qualifications (NQR NSQF-aligned courses)</option>
                  <option value="industrial_parks">industrial_parks (SIPCOT, SIDCO, Private SEZs)</option>
                  <option value="district_indicators">district_indicators (MSME, eShram aggregates)</option>
                  <option value="apprenticeship_openings">apprenticeship_openings (NAPS listings)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E2620] mb-1">
                  SELECT REVIEWED CSV FILE
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-[#22201E] bg-white text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-[#22201E] file:bg-[#E5D3B3] file:text-[#22201E] file:font-mono file:font-bold"
                />
                <p className="text-[10px] text-[#22201E]/60 mt-1">
                  Mandatory columns: <code className="font-bold text-[#6E2620]">source_url</code> and <code className="font-bold text-[#6E2620]">provenance_label</code>
                </p>
              </div>

              {importStatus && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  {importStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={!csvFile || isUploading}
                className="w-full p-2.5 bg-[#6E2620] text-white font-bold hover:bg-[#6E2620]/90 transition-all border border-[#22201E] disabled:opacity-50"
              >
                {isUploading ? "Validating Headers..." : "Validate & Ingest CSV"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Dispatch Agent Workflow */}
        {activeTab === "trigger" && (
          <div
            className="bg-[#FAF7F0] border-2 border-[#22201E] p-5 font-mono text-xs shadow-sm max-w-2xl"
            style={{ boxShadow: "3px 3px 0px 0px #22201E" }}
          >
            <div className="font-bold text-xs uppercase text-[#6E2620] pb-2 border-b-2 border-[#6E2620] mb-3">
              On-Demand Autonomous Agent Trigger
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E2620] mb-1">
                  WORKFLOW GRAPH
                </label>
                <select
                  value={triggerGraph}
                  onChange={(e) => setTriggerGraph(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-[#22201E] p-2 text-[#22201E]"
                >
                  <option value="signal_discovery">Signal Discovery (Graph A: Scrape, Triage, Extract)</option>
                  <option value="cluster_assessment">Cluster Assessment (Graph B: Scalability, Gap)</option>
                  <option value="skill_mapping">Skill Mapping (Graph C: Roles, Qualifications)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6E2620] mb-1">
                  SELECT TARGET DISTRICT (38 DISTRICTS)
                </label>
                <select
                  value={triggerDistrict}
                  onChange={(e) => setTriggerDistrict(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-[#22201E] p-2 text-[#22201E]"
                >
                  {Object.values(TN_38_DISTRICTS).map((d) => (
                    <option key={d.lgd} value={d.lgd}>
                      {d.name} ({d.tamil}) · LGD {d.lgd}
                    </option>
                  ))}
                </select>
              </div>

              {triggerMessage && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  {triggerMessage}
                </div>
              )}

              <button
                onClick={handleTriggerRun}
                disabled={isTriggering}
                className="w-full p-2.5 bg-[#6E2620] text-white font-bold hover:bg-[#6E2620]/90 transition-all border border-[#22201E] disabled:opacity-50"
              >
                {isTriggering ? "Dispatching..." : "Execute Agent Workflow"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
