"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  resumeSummary: "Fitter & CNC Operator with hands-on machine maintenance, lathe turning, and industrial safety compliance experience.",
  extractedSkills: ["CNC Lathe Operation", "Precision Metrology", "Industrial Safety", "Technical Blueprint Reading"],
  registeredDate: "2026-10-31",
};

interface UserProfileContextType {
  profile: UserProfile;
  login: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  parseResume: (text: string) => string[];
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
    qualification: typeof raw.qualification === "string" && raw.qualification.trim() ? raw.qualification.trim() : DEFAULT_PROFILE.qualification,
    branch: typeof raw.branch === "string" && raw.branch.trim() ? raw.branch.trim() : DEFAULT_PROFILE.branch,
    careerTrack: raw.careerTrack === "govt" || raw.careerTrack === "private" || raw.careerTrack === "both" ? raw.careerTrack : DEFAULT_PROFILE.careerTrack,
    resumeSummary: typeof raw.resumeSummary === "string" ? raw.resumeSummary : DEFAULT_PROFILE.resumeSummary,
    extractedSkills: Array.isArray(raw.extractedSkills) && raw.extractedSkills.length > 0
      ? raw.extractedSkills.filter((s: any) => typeof s === "string" && s.trim())
      : DEFAULT_PROFILE.extractedSkills,
    registeredDate: typeof raw.registeredDate === "string" ? raw.registeredDate : DEFAULT_PROFILE.registeredDate,
  };
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Hydrate from localStorage on client mount with full schema sanitization
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(sanitizeProfile(parsed));
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
    saveToStorage(guest);
  };

  const parseResume = (text: string): string[] => {
    const sampleKeywords = [
      "CNC", "Lathe", "PLC", "SCADA", "DCS", "HAZOP", "Welding", "Machining",
      "AutoCAD", "SolidWorks", "Electrical Wiring", "Solar PV", "Battery Cell",
      "Chemical Reactor", "ETP", "ZLD", "Metrology", "HVAC", "Pneumatics",
      "Hydraulics", "Quality Control", "ISO 9001", "Python", "Data Analysis",
      "Fitter", "Turner", "Boiler Operation", "Instrumentation", "Lean Six Sigma"
    ];
    const found: string[] = [];
    const lower = text.toLowerCase();
    for (const kw of sampleKeywords) {
      if (lower.includes(kw.toLowerCase()) && !found.includes(kw)) {
        found.push(kw);
      }
    }
    return found.length > 0 ? found : ["General Technical Aptitude", "Industrial Safety Basics"];
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    const updated = { ...profile, ...data };
    if (data.resumeSummary && (!data.extractedSkills || data.extractedSkills.length === 0)) {
      updated.extractedSkills = parseResume(data.resumeSummary);
    }
    saveToStorage(updated);
  };

  return (
    <UserProfileContext.Provider value={{ profile, login, logout, updateProfile, parseResume }}>
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

