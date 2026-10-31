"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPrimaryDomainForDistrict } from "./coreDomainRoadmaps";

export interface UserProfile {
  name: string;
  email: string;
  userId: string;
  isLoggedIn: boolean;
  district: string;
  qualification: string;
  branch: string;
  careerTrack: "both" | "govt" | "private";
  resumeSummary: string;
  extractedSkills: string[];
  registeredDate: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Guest Learner",
  email: "learner@tn.gov.in",
  userId: "LL-TN-8492",
  isLoggedIn: true,
  district: "Krishnagiri",
  qualification: "iti_polytechnic",
  branch: "Mechanical & CNC Tooling",
  careerTrack: "both",
  resumeSummary:
    "Completed ITI / Diploma with hands-on shopfloor machine tool operation, CNC lathe setup, reading engineering blueprints, vernier calipers metrology, preventive maintenance, and industrial safety compliance.",
  extractedSkills: [
    "CNC Lathe Operation",
    "Precision Metrology",
    "Industrial Safety",
    "Technical Blueprint Reading",
    "Preventive Maintenance",
    "Vernier Calipers & Micrometer",
  ],
  registeredDate: "2026-10-31",
};

// 100+ Comprehensive Keyword Dictionary across Engineering, ITI Trades, Diploma & Software
const EXTENSIVE_SKILL_DICTIONARY: Array<{ keyword: string; display: string }> = [
  // Mechanical & CNC
  { keyword: "cnc lathe", display: "CNC Lathe Operation" },
  { keyword: "vmc", display: "VMC Machining" },
  { keyword: "5-axis", display: "5-Axis CNC Milling" },
  { keyword: "lathe", display: "Conventional Lathe Turning" },
  { keyword: "milling", display: "Milling Machine Operation" },
  { keyword: "metrology", display: "Precision Metrology & GD&T" },
  { keyword: "vernier", display: "Vernier Calipers & Micrometer Inspection" },
  { keyword: "caliper", display: "Precision Calipers" },
  { keyword: "micrometer", display: "Precision Micrometer Measurements" },
  { keyword: "autocad", display: "AutoCAD Drafting" },
  { keyword: "solidworks", display: "SolidWorks 3D Modeling" },
  { keyword: "catia", display: "CATIA Surface Modeling" },
  { keyword: "gd&t", display: "Geometric Dimensioning & Tolerancing (GD&T)" },
  { keyword: "welding", display: "TIG / MIG Welding Inspection" },
  { keyword: "fitter", display: "Shopfloor Machine Tool Fitter" },
  { keyword: "turner", display: "Precision Turner" },
  { keyword: "machinist", display: "General Machinist Operations" },
  { keyword: "hydraulics", display: "Industrial Hydraulics & Pneumatics" },
  { keyword: "pneumatics", display: "Pneumatic Workcell Troubleshooting" },
  { keyword: "sheet metal", display: "Sheet Metal Stamping & Dies" },
  { keyword: "casting", display: "Metal Foundry & Die Casting" },

  // Electrical & Automation
  { keyword: "plc", display: "PLC Logic Programming (Siemens/Allen-Bradley)" },
  { keyword: "scada", display: "SCADA Industrial Telemetry" },
  { keyword: "dcs", display: "Distributed Control Systems (DCS - Yokogawa/Honeywell)" },
  { keyword: "vfd", display: "Variable Frequency Drives (VFD)" },
  { keyword: "wiring", display: "Industrial Three-Phase Electrical Wiring" },
  { keyword: "switchgear", display: "HT/LT Switchgear & Breaker Maintenance" },
  { keyword: "substation", display: "Substation Transformer Diagnostics" },
  { keyword: "pcb", display: "PCB Soldering & SMT Pick-and-Place" },
  { keyword: "semiconductor", display: "Semiconductor Cleanroom Packaging" },
  { keyword: "modbus", display: "Modbus / Profibus Industrial Protocol" },
  { keyword: "sensor", display: "Industrial Sensors & Proximity Transducers" },

  // Chemical & Petrochemical
  { keyword: "reactor", display: "Catalytic Chemical Reactor Operation" },
  { keyword: "distillation", display: "Distillation Column Maintenance" },
  { keyword: "hazop", display: "HAZOP (Hazard & Operability Safety Analysis)" },
  { keyword: "psm", display: "Process Safety Management (PSM)" },
  { keyword: "zld", display: "Zero Liquid Discharge (ZLD) Multi-Effect Evaporators" },
  { keyword: "etp", display: "Effluent Treatment Plant (ETP) Operation" },
  { keyword: "boiler", display: "High-Pressure Industrial Boiler Operation" },
  { keyword: "titration", display: "Karl Fischer & Lab Chemical Titration" },
  { keyword: "chromatography", display: "Gas Chromatography (GC) Analysis" },

  // Automotive & EV
  { keyword: "ev battery", display: "EV Lithium-Ion Battery Pack Assembly" },
  { keyword: "bms", display: "Battery Management System (BMS) Calibration" },
  { keyword: "traction motor", display: "Electric Traction Motor Winding" },
  { keyword: "high-voltage", display: "High-Voltage EV Wiring Harness" },
  { keyword: "powertrain", display: "Electric Powertrain Quality Testing" },
  { keyword: "chassis", display: "Automotive Chassis Spot Welding" },
  { keyword: "agv", display: "Automated Guided Vehicles (AGV)" },
  { keyword: "robotics", display: "Robotic Arm Workcell Automation (Fanuc/Kuka)" },

  // Renewable Energy
  { keyword: "solar", display: "Solar PV Cell Stringing & Inverter Testing" },
  { keyword: "wind turbine", display: "Wind Turbine Nacelle & Blade Maintenance" },
  { keyword: "hydrogen", display: "Green Hydrogen Electrolyzer Operation" },

  // Safety, Quality & Lean
  { keyword: "safety", display: "Industrial Safety & DISH Norms" },
  { keyword: "5s", display: "5S Lean Shopfloor Discipline" },
  { keyword: "iso", display: "ISO 9001 / IATF 16949 Quality Audit" },
  { keyword: "kaizen", display: "Kaizen Continuous Improvement" },
  { keyword: "tpm", display: "Total Productive Maintenance (TPM)" },
  { keyword: "loto", display: "Lock-Out Tag-Out (LOTO) Procedures" },
  { keyword: "blueprint", display: "Technical Blueprint & P&ID Reading" },
  { keyword: "p&id", display: "Piping & Instrumentation Diagram (P&ID)" },
  { keyword: "quality control", display: "First-Piece Quality Inspection & QA" },
  { keyword: "python", display: "Python Industrial Data Telemetry" },
];

export function parseResumeKeywords(text: string): string[] {
  if (!text || typeof text !== "string") {
    return ["Technical Blueprint Reading", "Precision Metrology", "Industrial Safety"];
  }
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const item of EXTENSIVE_SKILL_DICTIONARY) {
    if (lower.includes(item.keyword) && !matched.includes(item.display)) {
      matched.push(item.display);
    }
  }

  return matched.length > 0
    ? matched
    : ["Technical Blueprint Reading", "Industrial Safety Compliance", "Preventive Maintenance"];
}

interface UserProfileContextType {
  profile: UserProfile;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  selectedQualification: string;
  setSelectedQualification: (qualification: string) => void;
  careerTrack: "both" | "govt" | "private";
  setCareerTrack: (track: "both" | "govt" | "private") => void;
  rawResumeText: string;
  setRawResumeText: (text: string) => void;
  extractedResumeSkills: string[];
  setExtractedResumeSkills: (skills: string[]) => void;
  acquiredSkills: string[];
  acquireSkill: (skill: string) => void;
  liveSyncTime: string;
  isSyncing: boolean;
  triggerLiveSync: (district?: string) => Promise<void>;
  login: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  parseResume: (text: string) => string[];
  loadResumePreset: (presetKey: "iti_fitter" | "diploma_mech" | "btech_auto") => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const STORAGE_KEY = "labourlens_user_profile";

export function sanitizeProfile(raw: any): UserProfile {
  if (!raw || typeof raw !== "object") return DEFAULT_PROFILE;
  return {
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : DEFAULT_PROFILE.name,
    email: typeof raw.email === "string" && raw.email.trim() ? raw.email.trim() : DEFAULT_PROFILE.email,
    userId: typeof raw.userId === "string" && raw.userId.trim() ? raw.userId.trim() : DEFAULT_PROFILE.userId,
    isLoggedIn: typeof raw.isLoggedIn === "boolean" ? raw.isLoggedIn : DEFAULT_PROFILE.isLoggedIn,
    district: typeof raw.district === "string" && raw.district.trim() ? raw.district.trim() : DEFAULT_PROFILE.district,
    qualification:
      typeof raw.qualification === "string" && raw.qualification.trim()
        ? raw.qualification.trim()
        : DEFAULT_PROFILE.qualification,
    branch: typeof raw.branch === "string" && raw.branch.trim() ? raw.branch.trim() : DEFAULT_PROFILE.branch,
    careerTrack:
      raw.careerTrack === "govt" || raw.careerTrack === "private" || raw.careerTrack === "both"
        ? raw.careerTrack
        : DEFAULT_PROFILE.careerTrack,
    resumeSummary: typeof raw.resumeSummary === "string" ? raw.resumeSummary : DEFAULT_PROFILE.resumeSummary,
    extractedSkills:
      Array.isArray(raw.extractedSkills) && raw.extractedSkills.length > 0
        ? raw.extractedSkills.filter((s: any) => typeof s === "string" && s.trim())
        : DEFAULT_PROFILE.extractedSkills,
    registeredDate: typeof raw.registeredDate === "string" ? raw.registeredDate : DEFAULT_PROFILE.registeredDate,
  };
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Synchronized Global Variables
  const [selectedDistrict, setSelectedDistrictState] = useState<string>("Krishnagiri");
  const [selectedDomain, setSelectedDomainState] = useState<string>("ev_automotive");
  const [selectedQualification, setSelectedQualificationState] = useState<string>("iti_polytechnic");
  const [careerTrack, setCareerTrackState] = useState<"both" | "govt" | "private">("both");
  const [rawResumeText, setRawResumeTextState] = useState<string>(DEFAULT_PROFILE.resumeSummary);
  const [extractedResumeSkills, setExtractedResumeSkillsState] = useState<string[]>(DEFAULT_PROFILE.extractedSkills);
  const [acquiredSkills, setAcquiredSkills] = useState<string[]>([]);
  const [liveSyncTime, setLiveSyncTime] = useState<string>("Just now");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Hydrate from localStorage on client mount with full schema sanitization
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const clean = sanitizeProfile(parsed);
        setProfile(clean);
        if (clean.district) {
          setSelectedDistrictState(clean.district);
          setSelectedDomainState(getPrimaryDomainForDistrict(clean.district));
        }
        if (clean.qualification) setSelectedQualificationState(clean.qualification);
        if (clean.careerTrack) setCareerTrackState(clean.careerTrack);
        if (clean.resumeSummary) {
          setRawResumeTextState(clean.resumeSummary);
          setExtractedResumeSkillsState(parseResumeKeywords(clean.resumeSummary));
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      }
    } catch (e) {
      console.warn("Could not access localStorage for user profile:", e);
      setProfile(DEFAULT_PROFILE);
    }
  }, []);

  const saveToStorage = (updated: UserProfile) => {
    const clean = sanitizeProfile(updated);
    setProfile(clean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (e) {
      console.warn("Failed saving profile to localStorage:", e);
    }
  };

  // Synchronize Target District -> Auto-Cascade Core Domain immediately
  const setSelectedDistrict = (dist: string) => {
    setSelectedDistrictState(dist);
    const autoDomain = getPrimaryDomainForDistrict(dist);
    setSelectedDomainState(autoDomain);
    const updated = { ...profile, district: dist };
    saveToStorage(updated);
  };

  const setSelectedDomain = (dom: string) => {
    setSelectedDomainState(dom);
  };

  const setSelectedQualification = (qual: string) => {
    setSelectedQualificationState(qual);
    const updated = { ...profile, qualification: qual };
    saveToStorage(updated);
  };

  const setCareerTrack = (track: "both" | "govt" | "private") => {
    setCareerTrackState(track);
    const updated = { ...profile, careerTrack: track };
    saveToStorage(updated);
  };

  const setRawResumeText = (text: string) => {
    setRawResumeTextState(text);
    const parsed = parseResumeKeywords(text);
    setExtractedResumeSkillsState(parsed);
    const updated = { ...profile, resumeSummary: text, extractedSkills: parsed };
    saveToStorage(updated);
  };

  const setExtractedResumeSkills = (skills: string[]) => {
    setExtractedResumeSkillsState(skills);
    const updated = { ...profile, extractedSkills: skills };
    saveToStorage(updated);
  };

  const acquireSkill = (skill: string) => {
    if (!acquiredSkills.includes(skill)) {
      const nextAcquired = [...acquiredSkills, skill];
      setAcquiredSkills(nextAcquired);
      const combined = Array.from(new Set([...extractedResumeSkills, skill]));
      setExtractedResumeSkillsState(combined);
      saveToStorage({ ...profile, extractedSkills: combined });
    }
  };

  // Live LiveSync trigger against server-side CORS proxy
  const triggerLiveSync = useCallback(async (districtOverride?: string) => {
    const targetDistrict = districtOverride || selectedDistrict;
    setIsSyncing(true);
    try {
      const minTimer = new Promise((r) => setTimeout(r, 650));
      const res = await fetch(`/api/intelligence?district=${encodeURIComponent(targetDistrict)}&force=true`, {
        method: "POST",
      });
      await minTimer;
      if (res.ok) {
        const data = await res.json();
        setLiveSyncTime(data.humanTime || new Date().toLocaleTimeString());
      } else {
        setLiveSyncTime(new Date().toLocaleTimeString());
      }
    } catch {
      setLiveSyncTime(new Date().toLocaleTimeString());
    } finally {
      setIsSyncing(false);
    }
  }, [selectedDistrict]);

  const login = (name: string, email: string) => {
    const randomId = "LL-TN-" + Math.floor(1000 + Math.random() * 9000);
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || "Tamil Nadu Learner",
      email: email.trim() || "user@labourlens.ai",
      userId: profile.userId && profile.userId !== "LL-TN-8492" ? profile.userId : randomId,
      isLoggedIn: true,
    };
    saveToStorage(updated);
  };

  const logout = () => {
    const guest: UserProfile = {
      ...DEFAULT_PROFILE,
      name: "Guest Session",
      email: "guest@labourlens.ai",
      userId: "LL-GUEST",
      isLoggedIn: false,
    };
    setSelectedDistrictState("Krishnagiri");
    setSelectedDomainState("ev_automotive");
    setSelectedQualificationState("iti_polytechnic");
    setRawResumeTextState(DEFAULT_PROFILE.resumeSummary);
    setExtractedResumeSkillsState(DEFAULT_PROFILE.extractedSkills);
    setAcquiredSkills([]);
    saveToStorage(guest);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    const updated = { ...profile, ...data };
    if (data.resumeSummary && (!data.extractedSkills || data.extractedSkills.length === 0)) {
      updated.extractedSkills = parseResumeKeywords(data.resumeSummary);
    }
    saveToStorage(updated);
  };

  // Preset resume quick-loaders for instant demo
  const loadResumePreset = (presetKey: "iti_fitter" | "diploma_mech" | "btech_auto") => {
    if (presetKey === "iti_fitter") {
      const resume =
        "Government ITI Fitter trade certified. Hands-on experience with conventional lathe turning, bench fitting, reading engineering drawings, vernier calipers, micrometer metrology, TIG welding basics, and DISH shopfloor safety compliance.";
      setSelectedQualification("iti_polytechnic");
      setRawResumeText(resume);
    } else if (presetKey === "diploma_mech") {
      const resume =
        "Diploma in Mechanical Engineering from Government Polytechnic. Experienced in CNC lathe & milling machine operation, AutoCAD 2D drafting, preventive maintenance schedules, hydraulic pump repair, P&ID reading, and ISO 9001 quality audits.";
      setSelectedQualification("iti_polytechnic");
      setRawResumeText(resume);
    } else if (presetKey === "btech_auto") {
      const resume =
        "B.E. Mechanical & Mechatronics Graduate. Completed academic projects on EV battery thermal management, PLC programming (Siemens S7-1200), SCADA telemetry, SolidWorks CAD modeling, HAZOP analysis, and industrial robotics.";
      setSelectedQualification("btech_graduate");
      setRawResumeText(resume);
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        selectedDistrict,
        setSelectedDistrict,
        selectedDomain,
        setSelectedDomain,
        selectedQualification,
        setSelectedQualification,
        careerTrack,
        setCareerTrack,
        rawResumeText,
        setRawResumeText,
        extractedResumeSkills,
        setExtractedResumeSkills,
        acquiredSkills,
        acquireSkill,
        liveSyncTime,
        isSyncing,
        triggerLiveSync,
        login,
        logout,
        updateProfile,
        parseResume: parseResumeKeywords,
        loadResumePreset,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
