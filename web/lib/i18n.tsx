"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStaticTranslation } from "./translateService";
import { translateText, getOfflineTranslation, translateDistrict, translateSector } from "../src/utils/translator";

export type Language = "en" | "ta";

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string) => Promise<string>;
  translateDistrict: (districtName: string) => string;
  translateSector: (sectorName: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  translateDynamic: async (text: string) => text,
  translateDistrict: (d: string) => d,
  translateSector: (s: string) => s,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem("labourlens_lang") as Language;
      if (savedLang === "en" || savedLang === "ta") {
        setLangState(savedLang);
        document.documentElement.lang = savedLang;
      }
    } catch {
      // localStorage safety
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("labourlens_lang", newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (lang === "en") return fallback || key;

    // 1. Check dot-notation key in locales/ta.json
    const translation = getStaticTranslation(key, "ta");
    if (translation) return translation;

    // 2. Check offline dictionary for fallback or key
    const offlineLookup = getOfflineTranslation(fallback || key) || getOfflineTranslation(key);
    if (offlineLookup) return offlineLookup;

    return fallback || key;
  };

  const translateDynamic = async (text: string): Promise<string> => {
    return translateText(text, lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        translateDynamic,
        translateDistrict: (d) => (lang === "ta" ? translateDistrict(d) : d),
        translateSector: (s) => (lang === "ta" ? translateSector(s) : s),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
