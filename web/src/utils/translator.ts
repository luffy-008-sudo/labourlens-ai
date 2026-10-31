/**
 * Labourlens AI — Google Translate REST API & Offline Dictionary Engine
 * 
 * Supports:
 * 1. Google Translate REST API (https://translation.googleapis.com/language/translate/v2)
 *    using VITE_GOOGLE_TRANSLATE_API_KEY or NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY.
 * 2. Instant offline fallback via ta_dictionary.json (100% reliable without network or API key).
 * 3. In-memory caching for instant 0ms repeat translations.
 */

import taDict from "./ta_dictionary.json";

// In-memory cache for dynamic translations
const memoryCache = new Map<string, string>();

/**
 * Get Google Translate API Key from environment (Vite or Next.js)
 */
function getApiKey(): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY) {
      return process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    }
    if (process.env.NEXT_PUBLIC_TRANSLATE_API_KEY) {
      return process.env.NEXT_PUBLIC_TRANSLATE_API_KEY;
    }
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore
      return import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || import.meta.env.VITE_TRANSLATE_API_KEY;
    }
  } catch {
    // Vite import.meta not present in Next.js runtime
  }
  return undefined;
}

/**
 * Offline dictionary lookup
 */
export function getOfflineTranslation(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Direct district match
  const districts = taDict.districts as Record<string, string>;
  if (districts[trimmed]) return districts[trimmed];

  // 2. Direct sector match
  const sectors = taDict.sectors as Record<string, string>;
  if (sectors[trimmed]) return sectors[trimmed];

  // 3. Direct button match
  const buttons = taDict.buttons as Record<string, string>;
  if (buttons[trimmed]) return buttons[trimmed];

  // 4. Direct UI match
  const ui = taDict.ui as Record<string, string>;
  if (ui[trimmed]) return ui[trimmed];

  // 5. System terms match
  const system = taDict.system as Record<string, string>;
  if (system[trimmed]) return system[trimmed];

  // 6. Case-insensitive lookup across all categories
  const lower = trimmed.toLowerCase();
  for (const cat of [districts, sectors, buttons, ui, system]) {
    for (const [key, val] of Object.entries(cat)) {
      if (key.toLowerCase() === lower) {
        return val;
      }
    }
  }

  return null;
}

/**
 * Translate District name (e.g. Coimbatore -> கோயம்புத்தூர், Tuticorin -> தூத்துக்குடி)
 */
export function translateDistrict(districtName: string): string {
  const match = getOfflineTranslation(districtName);
  return match || districtName;
}

/**
 * Translate Sector name (e.g. Electric Vehicles -> மின்சார வாகனங்கள்)
 */
export function translateSector(sectorName: string): string {
  const match = getOfflineTranslation(sectorName);
  return match || sectorName;
}

/**
 * Core Translation function with Google Translate REST API and offline fallback
 */
export async function translateText(
  text: string,
  targetLang: "en" | "ta" = "ta"
): Promise<string> {
  if (!text || text.trim() === "") return "";
  if (targetLang === "en") return text;

  // 1. Check in-memory cache
  const cacheKey = `${targetLang}:${text}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check offline dictionary first (instant 0ms response)
  const offlineMatch = getOfflineTranslation(text);
  if (offlineMatch) {
    memoryCache.set(cacheKey, offlineMatch);
    return offlineMatch;
  }

  // 3. Attempt Google Translate REST API if key is configured
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            target: targetLang,
            format: "text",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translated = data?.data?.translations?.[0]?.translatedText;
        if (translated) {
          memoryCache.set(cacheKey, translated);
          return translated;
        }
      }
    } catch (apiErr) {
      console.warn("Google Translate API request failed, utilizing offline dictionary:", apiErr);
    }
  }

  // 4. Return original text if not found
  return text;
}

