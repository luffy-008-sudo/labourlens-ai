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

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({ ...prev, ...parsed }));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      }
    } catch (e) {
      console.warn("Could not access localStorage for user profile:", e);
    }
  }, []);

  const saveToStorage = (updated: UserProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

