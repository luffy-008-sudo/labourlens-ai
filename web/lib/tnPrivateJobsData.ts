/**
 * Tamil Nadu Government Private Job Portal (DET) Integration
 * Official Portal: https://www.tnprivatejobs.tn.gov.in/Home/jobs
 * Department of Employment and Training, Government of Tamil Nadu
 */

export interface TNPrivateJobsDistrict {
  id: number;
  name: string;
  tamilName: string;
  liveVacancies: number;
}

export interface TNPrivateJobsSector {
  id: number;
  name: string;
  liveVacancies: number;
}

// Exact live mapping parsed directly from https://www.tnprivatejobs.tn.gov.in/Home/jobs
export const TN_PRIVATE_JOBS_DISTRICTS: Record<string, TNPrivateJobsDistrict> = {
  Ariyalur: { id: 4, name: "Ariyalur", tamilName: "அரியலூர்", liveVacancies: 25 },
  Chengalpattu: { id: 45, name: "Chengalpattu", tamilName: "செங்கல்பட்டு", liveVacancies: 180 },
  Chennai: { id: 22, name: "Chennai", tamilName: "சென்னை", liveVacancies: 1185 },
  Coimbatore: { id: 10, name: "Coimbatore", tamilName: "கோயம்புத்தூர்", liveVacancies: 542 },
  Cuddalore: { id: 30, name: "Cuddalore", tamilName: "கடலூர்", liveVacancies: 25 },
  Dharmapuri: { id: 9, name: "Dharmapuri", tamilName: "தருமபுரி", liveVacancies: 160 },
  Dindigul: { id: 29, name: "Dindigul", tamilName: "திண்டுக்கல்", liveVacancies: 30 },
  Erode: { id: 17, name: "Erode", tamilName: "ஈரோடு", liveVacancies: 483 },
  Kallakurichi: { id: 33, name: "Kallakurichi", tamilName: "கள்ளக்குறிச்சி", liveVacancies: 100 },
  Kancheepuram: { id: 23, name: "Kancheepuram", tamilName: "காஞ்சிபுரம்", liveVacancies: 5028 },
  Kanniyakumari: { id: 5, name: "Kanniyakumari", tamilName: "கன்னியாகுமரி", liveVacancies: 143 },
  Karur: { id: 21, name: "Karur", tamilName: "கரூர்", liveVacancies: 129 },
  Krishnagiri: { id: 2, name: "Krishnagiri", tamilName: "கிருஷ்ணகிரி", liveVacancies: 265 },
  Madurai: { id: 28, name: "Madurai", tamilName: "மதுரை", liveVacancies: 75 },
  Mayiladuthurai: { id: 46, name: "Mayiladuthurai", tamilName: "மயிலாடுதுறை", liveVacancies: 5 },
  Nagapattinam: { id: 27, name: "Nagapattinam", tamilName: "நாகப்பட்டினம்", liveVacancies: 20 },
  Namakkal: { id: 15, name: "Namakkal", tamilName: "நாமக்கல்", liveVacancies: 466 },
  Nilgiris: { id: 11, name: "Nilgiris", tamilName: "நீலகிரி", liveVacancies: 46 },
  Perambalur: { id: 3, name: "Perambalur", tamilName: "பெரம்பலூர்", liveVacancies: 34 },
  Pudukkottai: { id: 26, name: "Pudukkottai", tamilName: "புதுக்கோட்டை", liveVacancies: 181 },
  Ramanathapuram: { id: 20, name: "Ramanathapuram", tamilName: "ராமநாதபுரம்", liveVacancies: 75 },
  Ranipet: { id: 43, name: "Ranipet", tamilName: "ராணிப்பேட்டை", liveVacancies: 790 },
  Salem: { id: 18, name: "Salem", tamilName: "சேலம்", liveVacancies: 116 },
  Sivagangai: { id: 19, name: "Sivagangai", tamilName: "சிவகங்கை", liveVacancies: 92 },
  Thanjavur: { id: 24, name: "Thanjavur", tamilName: "தஞ்சாவூர்", liveVacancies: 78 },
  Theni: { id: 32, name: "Theni", tamilName: "தேனி", liveVacancies: 259 },
  Thenkasi: { id: 44, name: "Thenkasi", tamilName: "தென்காசி", liveVacancies: 206 },
  Tiruchirappalli: { id: 13, name: "Tiruchirappalli", tamilName: "திருச்சிராப்பள்ளி", liveVacancies: 193 },
  Thiruchirappalli: { id: 13, name: "Tiruchirappalli", tamilName: "திருச்சிராப்பள்ளி", liveVacancies: 193 },
  Thiruppathur: { id: 42, name: "Thiruppathur", tamilName: "திருப்பத்தூர்", liveVacancies: 147 },
  Tirupattur: { id: 42, name: "Tirupattur", tamilName: "திருப்பத்தூர்", liveVacancies: 147 },
  Thoothukudi: { id: 7, name: "Thoothukudi", tamilName: "தூத்துக்குடி", liveVacancies: 133 },
  Tuticorin: { id: 7, name: "Thoothukudi", tamilName: "தூத்துக்குடி", liveVacancies: 133 },
  Tirunelveli: { id: 6, name: "Tirunelveli", tamilName: "திருநெல்வேலி", liveVacancies: 70 },
  Tiruppur: { id: 25, name: "Tiruppur", tamilName: "திருப்பூர்", liveVacancies: 177 },
  Tiruvallur: { id: 14, name: "Tiruvallur", tamilName: "திருவள்ளூர்", liveVacancies: 30 },
  Tiruvannamalai: { id: 1, name: "Tiruvannamalai", tamilName: "திருவண்ணாமலை", liveVacancies: 125 },
  Vellore: { id: 8, name: "Vellore", tamilName: "வேலூர்", liveVacancies: 2280 },
  Villupuram: { id: 16, name: "Villupuram", tamilName: "விழுப்புரம்", liveVacancies: 567 },
  Virudhunagar: { id: 31, name: "Virudhunagar", tamilName: "விருதுநகர்", liveVacancies: 1182 },
};

// Official sector IDs on tnprivatejobs.tn.gov.in
export const TN_PRIVATE_JOBS_SECTORS: Record<string, TNPrivateJobsSector> = {
  manufacturing: { id: 34, name: "Manufacturing", liveVacancies: 5180 },
  automotive: { id: 4, name: "Automotive", liveVacancies: 2106 },
  logistics: { id: 24, name: "Logistics", liveVacancies: 670 },
  power: { id: 30, name: "Power", liveVacancies: 106 },
  agriculture: { id: 2, name: "Agriculture", liveVacancies: 209 },
  food_processing: { id: 11, name: "Food Processing", liveVacancies: 182 },
  leather: { id: 22, name: "Leather", liveVacancies: 158 },
  telecom: { id: 35, name: "Telecom", liveVacancies: 360 },
  construction: { id: 8, name: "Construction", liveVacancies: 430 },
};

export function getTNPortalDistrictInfo(districtName: string): TNPrivateJobsDistrict {
  const clean = (districtName || "Krishnagiri").split("(")[0].trim();
  return (
    TN_PRIVATE_JOBS_DISTRICTS[clean] ||
    TN_PRIVATE_JOBS_DISTRICTS["Krishnagiri"] || {
      id: 2,
      name: clean,
      tamilName: clean,
      liveVacancies: 150,
    }
  );
}

export function buildTNPortalDistrictUrl(districtName: string): string {
  const d = getTNPortalDistrictInfo(districtName);
  return `https://www.tnprivatejobs.tn.gov.in/Home/set_session_filter/city/${d.id}`;
}

export function buildTNPortalSectorUrl(sectorId: number = 34): string {
  return `https://www.tnprivatejobs.tn.gov.in/Home/jobsdetails_page/sector/${sectorId}`;
}

