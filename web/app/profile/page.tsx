"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Shield,
  Save,
  Compass,
} from "lucide-react";
import { useUserProfile } from "@/lib/UserProfileContext";
import { TN_38_DISTRICTS } from "@/lib/districtsData";
import { QUALIFICATION_PATHWAYS } from "@/lib/coreDomainRoadmaps";

export default function UserProfilePage() {
  const { profile, login, logout, updateProfile, parseResume } = useUserProfile();

  // Local form state
  const [name, setName] = useState(profile?.name || "Guest Learner");
  const [email, setEmail] = useState(profile?.email || "learner@tn.gov.in");
  const [district, setDistrict] = useState(profile?.district || "Krishnagiri");
  const [qualification, setQualification] = useState(profile?.qualification || "iti_polytechnic");
  const [branch, setBranch] = useState(profile?.branch || "Mechanical & CNC Tooling");
  const [careerTrack, setCareerTrack] = useState<"both" | "govt" | "private">(profile?.careerTrack || "both");
  const [resumeText, setResumeText] = useState(profile?.resumeSummary || "");
  const [skills, setSkills] = useState<string[]>(Array.isArray(profile?.extractedSkills) ? profile.extractedSkills : []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Synchronize state when profile hydrates from localStorage
  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.email) setEmail(profile.email);
      if (profile.district) setDistrict(profile.district);
      if (profile.qualification) setQualification(profile.qualification);
      if (profile.branch) setBranch(profile.branch);
      if (profile.careerTrack) setCareerTrack(profile.careerTrack);
      if (profile.resumeSummary !== undefined) setResumeText(profile.resumeSummary);
      if (Array.isArray(profile.extractedSkills)) setSkills(profile.extractedSkills);
    }
  }, [profile]);

  const academicBranches = [
    "Chemical, Petrochemical & Process",
    "Mechanical & CNC Tooling",
    "Electric Vehicles & Battery Tech",
    "EEE, Power Electronics & Renewable Energy",
    "Electronics & Advanced Semiconductor Assembly",
    "Textile Chemistry & Technical Apparel",
    "Civil, Infrastructure & Port Engineering",
    "Food Processing & Cold Chain Technology",
    "Industrial Safety & Plant Maintenance",
  ];

  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResumeText(text);
    const parsed = parseResume(text);
    setSkills(parsed);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login(name, email);
    updateProfile({
      name,
      email,
      district,
      qualification,
      branch,
      careerTrack,
      resumeSummary: resumeText,
      extractedSkills: skills,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F4F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Page Header & Session Status ── */}
        <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_#000000]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FAF9F5] border-2 border-black rounded-full text-black text-sm font-mono font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
              <User className="w-4 h-4 text-black" />
              <span>User Profile &amp; Resume Intake</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black font-sans uppercase">
              Personalized Workforce Routing Profile
            </h1>
            <p className="text-base text-zinc-800 max-w-2xl leading-relaxed font-medium">
              Configure your academic degree, home district, and industrial track to dynamically personalize all 38-district roadmaps.
            </p>
          </div>

          {/* Active Session Pill */}
          <div className="bg-[#FAF9F5] border-2 border-black rounded-2xl p-5 shrink-0 font-mono text-sm shadow-[4px_4px_0px_0px_#000000] space-y-2">
            <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-black">
              <span className="text-zinc-600 font-extrabold uppercase text-xs">SESSION ID</span>
              <span className="px-3 py-0.5 bg-[#F5C518] text-black font-extrabold border border-black rounded-full text-xs">
                {profile?.userId || "LL-TN-8492"}
              </span>
            </div>
            <div className="font-extrabold text-black text-base truncate max-w-[220px] font-sans">{profile?.name || "Guest Learner"}</div>
            <div className="text-zinc-700 text-xs font-bold truncate max-w-[220px]">{profile?.email || "learner@tn.gov.in"}</div>
            {profile?.isLoggedIn && (
              <button
                type="button"
                onClick={logout}
                className="mt-3 w-full py-2 bg-white border-2 border-black hover:bg-red-100 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000]"
              >
                <LogOut className="w-4 h-4" />
                <span>End Active Session</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Intake Form ── */}
        <form onSubmit={handleSaveProfile} className="space-y-8">

          {/* Section 1: Identity & Credentials */}
          <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-10 shadow-[5px_5px_0px_0px_#000000] space-y-6">
            <div className="pb-4 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-[#F5C518] font-extrabold font-mono text-sm flex items-center justify-center border border-black">
                  1
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-black uppercase font-sans">
                  Identity &amp; Session Credentials
                </h2>
              </div>
              <span className="text-sm font-mono font-bold text-zinc-600">LocalStorage Persisted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-mono font-extrabold text-black uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-black absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. S. Dharshan / Rahul Velraj"
                    className="w-full pl-12 pr-4 py-3.5 text-base font-sans bg-[#FAF9F5] border-2 border-black rounded-xl focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono font-extrabold text-black uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-black absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learner@tn.gov.in"
                    className="w-full pl-12 pr-4 py-3.5 text-base font-sans bg-[#FAF9F5] border-2 border-black rounded-xl focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Home District & Academic Stream */}
          <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-10 shadow-[5px_5px_0px_0px_#000000] space-y-6">
            <div className="pb-4 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-[#F5C518] font-extrabold font-mono text-sm flex items-center justify-center border border-black">
                  2
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-black uppercase font-sans">
                  District &amp; Academic Background
                </h2>
              </div>
              <span className="text-sm font-mono text-emerald-800 font-extrabold">38 Districts Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Home District */}
              <div>
                <label className="block text-sm font-mono font-extrabold text-black uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-black" />
                  <span>Target Home District</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-3.5 text-base font-bold bg-[#FAF9F5] border-2 border-black rounded-xl focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                >
                  {Object.values(TN_38_DISTRICTS).map((d) => (
                    <option key={d.lgd} value={d.name}>
                      {d.name} ({d.tamil})
                    </option>
                  ))}
                </select>
                <span className="text-xs font-mono text-zinc-600 mt-2 block font-bold">
                  Grounds local retention metrics
                </span>
              </div>

              {/* Qualification Level */}
              <div>
                <label className="block text-sm font-mono font-extrabold text-black uppercase tracking-wider mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-black" />
                  <span>Qualification Level</span>
                </label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full p-3.5 text-base font-bold bg-[#FAF9F5] border-2 border-black rounded-xl focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                >
                  {Object.values(QUALIFICATION_PATHWAYS).map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-mono text-zinc-600 mt-2 block font-bold">
                  Maps statutory entry cadres
                </span>
              </div>

              {/* Academic Branch */}
              <div>
                <label className="block text-sm font-mono font-extrabold text-black uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-black" />
                  <span>Academic Branch</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-3.5 text-base font-bold bg-[#FAF9F5] border-2 border-black rounded-xl focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                >
                  {academicBranches.map((br) => (
                    <option key={br} value={br}>
                      {br}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-mono text-zinc-600 mt-2 block font-bold">
                  Filters machine tools required
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Career Track Preference */}
          <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-10 shadow-[5px_5px_0px_0px_#000000] space-y-4">
            <div className="pb-4 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-[#F5C518] font-extrabold font-mono text-sm flex items-center justify-center border border-black">
                  3
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-black uppercase font-sans">
                  Career Track Preference
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  id: "both",
                  title: "Both Govt/PSU & Private Core",
                  desc: "Recommended: Evaluates both permanent statutory PSU apprenticeships and high-scale private SIPCOT factory plants.",
                },
                {
                  id: "govt",
                  title: "Government / PSU Only",
                  desc: "Focus strictly on NLC, BHEL, TANGEDCO, port authorities, and TRB/TNPSC technical roles.",
                },
                {
                  id: "private",
                  title: "Private Core Industry Only",
                  desc: "Focus on rapid-hiring SIPCOT/SIDCO private anchors, Ola Gigafactories, Tata Electronics, Asian Paints, etc.",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-5 border-2 border-black rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                    careerTrack === opt.id
                      ? "bg-[#F5C518] shadow-[3px_3px_0px_0px_#000000]"
                      : "bg-[#FAF9F5] hover:bg-white shadow-[1px_1px_0px_0px_#000000]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-black font-sans">{opt.title}</span>
                      <input
                        type="radio"
                        name="careerTrack"
                        value={opt.id}
                        checked={careerTrack === opt.id}
                        onChange={() => setCareerTrack(opt.id as "both" | "govt" | "private")}
                        className="text-black focus:ring-black h-5 w-5"
                      />
                    </div>
                    <p className="text-sm text-zinc-800 leading-relaxed font-sans font-medium">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Resume / Skill Parser */}
          <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-10 shadow-[5px_5px_0px_0px_#000000] space-y-5">
            <div className="pb-4 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-[#F5C518] font-extrabold font-mono text-sm flex items-center justify-center border border-black">
                  4
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-black uppercase font-sans">
                  Resume / Skill Parser Box
                </h2>
              </div>
              <span className="text-sm font-mono text-black font-extrabold flex items-center gap-2 px-3.5 py-1.5 bg-[#F5C518] border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000000]">
                <Sparkles className="w-4 h-4 text-black" />
                Live Skill Extractor
              </span>
            </div>

            <div>
              <label className="block text-sm font-mono font-extrabold text-black uppercase tracking-wider mb-2.5">
                Paste Resume Summary, Project Notes, or Past Internship Experience:
              </label>
              <textarea
                rows={5}
                value={resumeText}
                onChange={handleResumeChange}
                placeholder="e.g. Completed Diploma in Mechanical Engineering from Government Polytechnic College. Experienced with CNC lathe setup, reading engineering drawings, vernier calipers, welding inspection, and factory shopfloor safety compliance under NAPS..."
                className="w-full p-4 text-base font-sans bg-[#FAF9F5] border-2 border-black rounded-2xl focus:outline-none focus:bg-white leading-relaxed shadow-[3px_3px_0px_0px_#000000]"
              />
            </div>

            {/* Extracted Skills Chips */}
            <div>
              <span className="text-sm font-mono font-extrabold text-black uppercase tracking-wider block mb-2.5">
                Extracted Industrial Competencies ({(skills || []).length}):
              </span>
              <div className="flex flex-wrap gap-2.5">
                {(skills || []).map((sk, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF9F5] text-black border-2 border-black rounded-full text-sm font-mono font-extrabold shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Submit & Quick Navigation Bar ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
            <button
              type="submit"
              className="btn-swiss-yellow inline-flex items-center justify-center gap-2 text-base py-3.5 px-8"
            >
              <Save className="w-5 h-5" />
              <span>Save &amp; Personalize Recommendations</span>
            </button>

            {savedSuccess && (
              <span className="inline-flex items-center gap-2 text-base font-extrabold text-emerald-800 bg-emerald-100 border-2 border-black px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                Profile synchronized to Labourlens AI!
              </span>
            )}

            <div className="flex items-center gap-3">
              <Link
                href={`/routes?district=${encodeURIComponent(district)}`}
                className="btn-swiss-white inline-flex items-center justify-center gap-2 text-base py-3.5 px-8"
              >
                <Compass className="w-5 h-5 text-black" />
                <span>Open Personalized Roadmap →</span>
              </Link>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
