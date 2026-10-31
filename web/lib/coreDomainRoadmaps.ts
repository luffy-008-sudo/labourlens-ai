/**
 * Core Engineering Sector Roadmap Engine for Tamil Nadu Districts.
 * Provides deep, concrete, employee-POV intelligence contrasting Core vs IT,
 * pinpointing skill gaps, specifying official NPTEL/Bharat Skills/Skill India links,
 * local Government ITIs, and career progression ladders.
 */

import { getDistrictRegistry, DistrictRegistryEntry } from "./tnDistrictsRegistry";

export const DISTRICT_TO_PRIMARY_DOMAIN: Record<string, string> = {
  Krishnagiri: "ev_automotive",
  Cuddalore: "chemical",
  Coimbatore: "automation_cnc",
  Thoothukudi: "renewable_energy",
  Tiruchirappalli: "heavy_engineering",
  Salem: "heavy_engineering",
  Tirunelveli: "renewable_energy",
  Kancheepuram: "ev_automotive",
  Chengalpattu: "ev_automotive",
  Chennai: "ev_automotive",
  Tiruvallur: "ev_automotive",
  Ranipet: "chemical",
  Vellore: "chemical",
  Tirupathur: "chemical",
  Tiruppur: "textiles_dyeing",
  Erode: "textiles_dyeing",
  Karur: "textiles_dyeing",
  Madurai: "automation_cnc",
  Dindigul: "agro_processing",
  Theni: "agro_processing",
  Dharmapuri: "agro_processing",
  Namakkal: "ev_automotive",
  Nilgiris: "agro_processing",
  Thanjavur: "agro_processing",
  Tiruvarur: "agro_processing",
  Nagapattinam: "chemical",
  Mayiladuthurai: "agro_processing",
  Pudukkottai: "heavy_engineering",
  Ariyalur: "heavy_engineering",
  Perambalur: "heavy_engineering",
  Ramanathapuram: "renewable_energy",
  Sivaganga: "heavy_engineering",
  Virudhunagar: "heavy_engineering",
  Tenkasi: "textiles_dyeing",
  Kanniyakumari: "renewable_energy",
  Kallakurichi: "agro_processing",
  Viluppuram: "agro_processing",
  Tiruvannamalai: "agro_processing",
};

export function getPrimaryDomainForDistrict(districtName: string): string {
  if (!districtName) return "ev_automotive";
  if (DISTRICT_TO_PRIMARY_DOMAIN[districtName]) {
    return DISTRICT_TO_PRIMARY_DOMAIN[districtName];
  }
  const lower = districtName.toLowerCase().trim();
  for (const [dist, dom] of Object.entries(DISTRICT_TO_PRIMARY_DOMAIN)) {
    if (dist.toLowerCase() === lower) return dom;
  }
  return "ev_automotive";
}

export interface DomainProfile {
  id: string;
  name: string;
  tamilName: string;
  category: string;
  yoyGrowth: string;
  aiImmunityScore: string;
  dayToDayReality: string;
  whyCoreVsItVerdict: string;
  academicTheoryGap: string;
  factoryEquipmentDemanded: string[];
  foundationCourses: Array<{
    title: string;
    platform: "NPTEL" | "DGT Bharat Skills" | "Skill India Digital";
    url: string;
    duration: string;
    cost: string;
    topics: string;
  }>;
  safetyTickets: Array<{
    name: string;
    issuingAuthority: string;
    validity: string;
    whyRequired: string;
  }>;
}

export const CORE_DOMAINS: Record<string, DomainProfile> = {
  chemical: {
    id: "chemical",
    name: "Chemical, Petrochemical & Specialty Process Engineering",
    tamilName: "வேதியியல் மற்றும் பெட்ரோ கெமிக்கல் ஆலை இயக்கம்",
    category: "Continuous Process Manufacturing",
    yoyGrowth: "+18.6% YoY (Driven by PCPIR & SIPCOT Specialty Expansions)",
    aiImmunityScore: "98.2% AI-Immune (Physical Plant Safety & Reactive Chemistry)",
    dayToDayReality:
      "Monitoring high-pressure catalytic reactors, managing continuous distillation columns via DCS touchscreens, executing HAZOP safety procedures, and verifying Zero Liquid Discharge effluent compliance in real-time.",
    whyCoreVsItVerdict:
      "Unlike IT coding where entry-level junior positions face massive saturation and automated LLM code generators, chemical and petrochemical plant operations require physically present, licensed technical operators. Capital-intensive factories in Cuddalore, Tuticorin, Manali, and Mettur operate 24/7/365 and cannot shut down. Technicians who understand DCS controls and process safety enjoy lifetime job security, company housing colonies, and zero fear of algorithm-driven layoffs.",
    academicTheoryGap:
      "Colleges teach dry textbook thermodynamics and manual beaker titrations, while real factories exclusively use computerized Distributed Control Systems (DCS), automated emergency shutdown (ESD) valves, and multi-stage evaporators.",
    factoryEquipmentDemanded: [
      "Distributed Control Systems (DCS - Yokogawa CENTUM VP / Siemens PCS 7)",
      "Process Safety Management (PSM) & HAZOP (Hazard & Operability Study)",
      "Zero Liquid Discharge (ZLD) Multi-Effect Evaporators (MEE) & ATFD",
      "Centrifugal Canned Motor Pumps, Mechanical Seals & Glass-Lined Reactors",
      "Gas Chromatography (GC) & Karl Fischer Titration Quality Lab Testing",
    ],
    foundationCourses: [
      {
        title: "Chemical Process Control & Instrumentation",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "8 Weeks",
        cost: "100% Free (Govt IIT/IISc)",
        topics: "Feedback loops, P&ID diagrams, PLC/SCADA logic & plant dynamics",
      },
      {
        title: "Attendant Operator & Instrument Mechanic (Chemical Plant - AOCP/IMCP)",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (Ministry of Skill Development)",
        topics: "Industrial chemistry, heat exchangers, fluid flow & safety regulations",
      },
      {
        title: "Industrial Process Safety & Hazard Management",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "4 Weeks",
        cost: "100% Free (NSDC Certified)",
        topics: "HAZOP, OSHA 1910.119, chemical spill mitigation & PPE Level-A/B/C",
      },
    ],
    safetyTickets: [
      {
        name: "DISH Factory Safety & Chemical Emergency Response Ticket",
        issuingAuthority: "Directorate of Industrial Safety and Health (DISH Tamil Nadu)",
        validity: "Permanent / Annual Refresh",
        whyRequired: "Mandatory statutory compliance to enter classified chemical processing zones.",
      },
      {
        name: "HAZOP Process Safety & Confined Space Entry Permit",
        issuingAuthority: "National Safety Council (NSC) / TNSDC",
        validity: "3 Years",
        whyRequired: "Required to authorize reactor batch charging and vessel maintenance.",
      },
    ],
  },

  ev_automotive: {
    id: "ev_automotive",
    name: "Advanced Electric Vehicles (EV), Battery Assembly & Precision Mechatronics",
    tamilName: "மின்சார வாகனம் (EV) & பேட்டரி உற்பத்தி பொறியியல்",
    category: "Advanced Clean Mobility & Giga-Manufacturing",
    yoyGrowth: "+28.4% YoY (Driven by Hosur, Oragadam & Sillanatham EV Hubs)",
    aiImmunityScore: "95.6% AI-Immune (High-Voltage Cell Assembly & Shopfloor Mechatronics)",
    dayToDayReality:
      "Assembling high-density lithium-ion cell packs, programming robotic spot-welders, running automated end-of-line battery cyclers (BMS diagnostics), and executing motor dyno tests on automated conveyor lines.",
    whyCoreVsItVerdict:
      "Tamil Nadu produces over 70% of electric two-wheelers in India and houses the country's largest EV clusters (Ola, TVS, Ather, Tata Electronics, VinFast). While software engineers face fluctuating hiring freezes, EV shopfloors face severe manpower deficits for battery cell pack technicians and harness testers. Candidates gain hands-on expertise in high-voltage DC safety that cannot be outsourced remotely.",
    academicTheoryGap:
      "Colleges still focus on internal combustion carburetors and manual wiring diagrams, while EV giga-factories demand CAN-bus vehicle communication, BMS thermal management, and automated laser tab welding.",
    factoryEquipmentDemanded: [
      "Lithium-ion Battery Pack Assembly & Cell Matching (Internal Resistance Testing)",
      "Battery Management System (BMS) Flashing & CAN-Bus Telemetry Diagnostics",
      "Automated Laser Tab Welding & Ultrasonic Wire Bonding",
      "High-Voltage Safety (500V+ DC Protection Protocols & NFPA 70E)",
      "Robotic Workcell Maintenance (KUKA / Fanuc Automotive Conveyors)",
    ],
    foundationCourses: [
      {
        title: "Electric Vehicles and Battery Management Systems",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "12 Weeks",
        cost: "100% Free (IIT Madras)",
        topics: "Cell chemistry, thermal runaway, BMS algorithms & motor controllers",
      },
      {
        title: "Mechanic Electric Vehicle (MEV) Curriculum",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (DGT Govt of India)",
        topics: "BLDC motors, regen braking, high-voltage interlocks & wiring harnesses",
      },
      {
        title: "Automotive Robotics & Electric Vehicle Technician",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "6 Weeks",
        cost: "100% Free (ASDC Certified)",
        topics: "Battery pack casing assembly, torque tool calibration & 5S shopfloor",
      },
    ],
    safetyTickets: [
      {
        name: "High-Voltage Electrician & EV Propulsion Safety Ticket (NFPA 70E / AIS-038)",
        issuingAuthority: "Automotive Skills Development Council (ASDC) / TNSDC",
        validity: "3 Years",
        whyRequired: "Mandatory qualification to handle live DC battery modules above 60V.",
      },
      {
        name: "Lithium Fire Suppression & Hazardous Waste Handling Certification",
        issuingAuthority: "TN Fire & Rescue Services / Petroleum and Explosives Safety Organization (PESO)",
        validity: "2 Years",
        whyRequired: "Required for battery charging and climatic test chamber supervision.",
      },
    ],
  },

  renewable_energy: {
    id: "renewable_energy",
    name: "Renewable Energy Grids, Solar PV Giga-Plants & Wind Turbine O&M",
    tamilName: "சூரிய ஒளி மற்றும் காற்றாலை புதுப்பிக்கத்தக்க ஆற்றல்",
    category: "Green Infrastructure & Grid Integration",
    yoyGrowth: "+24.2% YoY (Southern Clean Energy Corridor & Offshore Wind)",
    aiImmunityScore: "99.1% AI-Immune (High-Altitude Wind Climbing & Grid Substation Control)",
    dayToDayReality:
      "Climbing 120-meter wind turbine nacelles for gearbox lubrication, aligning solar PV string inverters, maintaining 230kV power transformers, and synchronizing green hydrogen electrolyzers with grid dispatch centres.",
    whyCoreVsItVerdict:
      "Tirunelveli, Thoothukudi, Tenkasi, and Coimbatore constitute India's green energy corridor. With India's 500GW non-fossil target and offshore wind installations in the Gulf of Mannar, wind turbine technicians and high-voltage substation switchgear technicians are under profound shortage. You build physical energy assets that power entire state industries.",
    academicTheoryGap:
      "Institutes teach basic domestic single-phase lighting circuits, whereas commercial renewable plants operate 33kV/230kV grid substations, blade pitch hydraulic actuators, and SCADA remote telemetry.",
    factoryEquipmentDemanded: [
      "Global Wind Organisation (GWO) High-Altitude Climbing & Evacuation Gear",
      "Solar PV String Inverter Diagnostics & Thermal Imaging Drone Audits",
      "High-Voltage (HV/EHV) SF6 Gas Insulated Switchgear (GIS) Operation",
      "Electrolyzer System Management for Green Hydrogen Generation",
      "SCADA Power Grid Synchronization & Remote Terminal Units (RTU)",
    ],
    foundationCourses: [
      {
        title: "Renewable Energy Engineering and Technology",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "12 Weeks",
        cost: "100% Free (IIT Kharagpur)",
        topics: "Wind aerodynamics, solar irradiance modeling, inverter topologies & microgrids",
      },
      {
        title: "Solar Technician (Electrical) & Wind Plant Mechanic",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (Ministry of Skill Development)",
        topics: "PV array installation, DC combiner boxes, earthing & lightning protection",
      },
      {
        title: "Surya Mitra & Pawan Mitra Clean Energy Technician",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "12 Weeks (Subsidized)",
        cost: "100% Free (NISE / MNRE)",
        topics: "Grid connection standards, net-metering & power purchase compliance",
      },
    ],
    safetyTickets: [
      {
        name: "Global Wind Organisation (GWO) Basic Safety Training (BST) Ticket",
        issuingAuthority: "GWO Certified Training Providers (Vestas/Suzlon Accredited)",
        validity: "2 Years",
        whyRequired: "Legally required globally to step foot on any commercial wind turbine tower.",
      },
      {
        name: "Chief Electrical Inspector to Government (CEIG) 'C' / 'B' License",
        issuingAuthority: "Electrical Inspectorate Department, Tamil Nadu Government",
        validity: "5 Years",
        whyRequired: "Statutory license to execute high-voltage transformer switching.",
      },
    ],
  },

  automation_cnc: {
    id: "automation_cnc",
    name: "Industrial Automation, 5-Axis CNC Machining & Mechatronics",
    tamilName: "தொழில்துறை ஆட்டோமேஷன் & CNC துல்லிய உற்பத்தி",
    category: "Precision Engineering & Defense Aerospace",
    yoyGrowth: "+17.5% YoY (Defense Industrial Corridor & Precision Tooling)",
    aiImmunityScore: "96.8% AI-Immune (Precision Machine Setup & GD&T Quality Inspection)",
    dayToDayReality:
      "Setting up multi-axis CNC turn-mill centres, writing Fanuc/Siemens G-code routines, programming Allen-Bradley/Siemens PLCs for automated assembly arms, and verifying micron tolerances using Coordinate Measuring Machines (CMM).",
    whyCoreVsItVerdict:
      "Coimbatore, Hosur, Trichy, and Chennai produce precision pump components, defense missile casings, and aerospace brackets. While code-writing is increasingly commoditized, precision subtractive CNC machining and robotic PLC orchestration require physical material understanding, metallurgy knowledge, and tactile tool-setting expertise.",
    academicTheoryGap:
      "Colleges rely on manual hand lathes and basic 2D CAD drafting, while modern manufacturing uses multi-tasking mill-turn centers, CAM toolpath optimization, and automated robotic pallet changers.",
    factoryEquipmentDemanded: [
      "5-Axis CNC Vertical Machining Centers (VMC - Fanuc, Siemens Sinumerik, Haas)",
      "CAM Software (Mastercam, Siemens NX CAM, Delcam PowerMill)",
      "PLC Programming (Siemens S7-1200/1500 TIA Portal, Allen-Bradley Studio 5000)",
      "Coordinate Measuring Machine (CMM - Zeiss, Mitutoyo) with GD&T Standards",
      "Hydraulic & Pneumatic Industrial Automation Circuits",
    ],
    foundationCourses: [
      {
        title: "Advanced CNC Machining and Metrology",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "8 Weeks",
        cost: "100% Free (IIT Kanpur)",
        topics: "Tool-life optimization, surface finish, multi-axis interpolation & GD&T",
      },
      {
        title: "Machinist & Tool and Die Maker (Press Tools, Jigs & Fixtures)",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (DGT Govt of India)",
        topics: "Blueprint interpretation, carbide inserts, feed-speed math & tolerance limits",
      },
      {
        title: "Smart Factory Automation & PLC Programmer",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "6 Weeks",
        cost: "100% Free (Capital Goods Skill Council)",
        topics: "Ladder logic, HMI interface design, sensor interfacing & motor drives",
      },
    ],
    safetyTickets: [
      {
        name: "National Institute for Metalworking Skills (NIMS) / DGT Level-4 CNC Ticket",
        issuingAuthority: "National Council for Vocational Training (NCVT)",
        validity: "Permanent",
        whyRequired: "Accredited proof of autonomous CNC machine setup without crashing spindles.",
      },
      {
        name: "Industrial Robot Cell Operator Safety (ISO 10218-1/2)",
        issuingAuthority: "TNSDC / Automation Skill Council",
        validity: "3 Years",
        whyRequired: "Required to program robotics near active automated light curtains.",
      },
    ],
  },

  heavy_engineering: {
    id: "heavy_engineering",
    name: "High-Pressure Boilers, Heavy Fabrication & Defense Ordnance",
    tamilName: "உயர் அழுத்த கொதிகலன் & கனரக உருக்காலை வெல்டிங்",
    category: "Heavy Thermal & Defense Infrastructure",
    yoyGrowth: "+16.8% YoY (BHEL Ancillaries & Defense Corridor)",
    aiImmunityScore: "99.4% AI-Immune (X-Ray Grade Pipe Welding & Heavy Metallurgy)",
    dayToDayReality:
      "Performing Indian Boiler Regulations (IBR) certified TIG/MIG welding on superheater tubes, executing Non-Destructive Testing (NDT ultrasonic/radiographic tests), and operating heavy horizontal boring machines on massive pressure vessels.",
    whyCoreVsItVerdict:
      "Tiruchirappalli (Trichy), Ranipet, and Salem represent the thermal power boiler and defense ordnance heartland of Southern India. Certified IBR welders and NDT Level-II inspectors command higher hourly rates than mid-level IT engineers because pressure vessel welds must withstand 250 atmospheres of supercritical steam without failing. It is a true master craft with global Gulf, Singapore, and European mobility.",
    academicTheoryGap:
      "Colleges teach basic arc welding on thin mild steel scrap, whereas boiler manufacturing demands pre-heated alloy steels, GTAW root passes, thermal stress-relieving cycles, and zero-defect radiographic inspection.",
    factoryEquipmentDemanded: [
      "IBR Certified Gas Tungsten Arc Welding (GTAW / TIG) & Submerged Arc (SAW)",
      "Non-Destructive Testing (Ultrasonic Testing UT, Magnetic Particle MT, Radiography RT)",
      "Heavy CNC Horizontal Boring, Milling & Plate Rolling Machines (Up to 100mm Plate)",
      "Thermal Post-Weld Heat Treatment (PWHT) Electric Resistance Elements",
      "Hydraulic Pressure Testing Equipment (Up to 400 Bar Proof Pressure)",
    ],
    foundationCourses: [
      {
        title: "Welding Engineering and Non-Destructive Evaluation",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "12 Weeks",
        cost: "100% Free (IIT Roorkee)",
        topics: "Phase diagrams, cracking mechanisms, weld pool physics & ultrasound NDT",
      },
      {
        title: "Welder (Structural, Pipe & Pressure Vessel)",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (DGT Govt of India)",
        topics: "ASME Section IX codes, AWS D1.1, bevel preparation & purge gas control",
      },
      {
        title: "Pressure Vessel Fabrication & Metallurgy Inspector",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "8 Weeks",
        cost: "100% Free (IIW-India Certified)",
        topics: "Boiler codes, weld joint design, visual inspection & defect identification",
      },
    ],
    safetyTickets: [
      {
        name: "Indian Boiler Regulations (IBR) High-Pressure Pipe Welder Certificate",
        issuingAuthority: "Directorate of Boilers, Government of Tamil Nadu",
        validity: "2 Years (Renewable via test piece bend test)",
        whyRequired: "Statutory mandatory ticket to weld any pressure boundary in power plants.",
      },
      {
        name: "ASNT / ISNT Level II Non-Destructive Testing (UT, RT, MPT, DPT)",
        issuingAuthority: "Indian Society for Non-Destructive Testing (ISNT)",
        validity: "5 Years",
        whyRequired: "Authorizes the technician to sign off radiographic weld inspection reports.",
      },
    ],
  },

  textiles_dyeing: {
    id: "textiles_dyeing",
    name: "Automated Knitwear, Technical Textiles & Zero-Discharge Dyeing",
    tamilName: "தானியங்கி பின்னலாடை & சுற்றுச்சூழல் சாயக்கழிவு சுத்திகரிப்பு",
    category: "Export Merchandise & Eco-Processing",
    yoyGrowth: "+17.2% YoY (Tiruppur Export Clusters & Perundurai SIPCOT)",
    aiImmunityScore: "95.2% AI-Immune (Industrial Textile Mechatronics & ZLD Effluent Control)",
    dayToDayReality:
      "Programming computerized seamless jacquard circular knitting machines, operating spectrophotometer digital color matching labs, and managing multi-stage membrane reverse-osmosis ZLD plants.",
    whyCoreVsItVerdict:
      "Tiruppur, Erode, and Karur generate over $4 Billion in merchandise exports annually. Modern export factories have transitioned from manual sewing to fully computerized knitting robots and automated recipe dosing. Technicians who bridge mechanical knitting dynamics with electronics and wastewater chemistry run critical factory infrastructure with high retention bonuses.",
    academicTheoryGap:
      "Schools teach manual handloom weaving or simple garment sewing, while export mills exclusively use computerized circular knitting CAM programs, Datacolor spectrophotometers, and RO brine recovery plants.",
    factoryEquipmentDemanded: [
      "Computerized Jacquard & Seamless Circular Knitting Machines (Mayer & Cie, Terrot, Santoni)",
      "Datacolor Spectrophotometer Automated Dye Recipe Matching Systems",
      "Low-Liquor Soft Flow Dyeing Vessels & Automated Chemical Dispensing",
      "Zero Liquid Discharge (ZLD) RO Membranes, Nano-Filtration & Crystallizers",
      "Textile Mechatronics & Electronic Direct-Drive Sewing Automation",
    ],
    foundationCourses: [
      {
        title: "Principles of Textile Engineering and Fabric Formation",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "12 Weeks",
        cost: "100% Free (IIT Delhi)",
        topics: "Loop formation, yarn tension dynamics, technical textiles & color physics",
      },
      {
        title: "Textile Mechatronics & Knitting Machine Operator",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (DGT Govt of India)",
        topics: "Needle selection, cam tracks, electronic feeder timing & fabric defect fixes",
      },
      {
        title: "Sustainable Textile Processing & ZLD Operations",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "6 Weeks",
        cost: "100% Free (Textile Sector Skill Council)",
        topics: "Effluent treatment chemistry, RO recovery optimization & OEKO-TEX standards",
      },
    ],
    safetyTickets: [
      {
        name: "ZLD Industrial Wastewater Treatment Plant Operator Certificate",
        issuingAuthority: "Tamil Nadu Pollution Control Board (TNPCB) / TNSDC",
        validity: "3 Years",
        whyRequired: "Mandatory qualification to manage chemical effluent discharge lines.",
      },
      {
        name: "Export Quality & OEKO-TEX Standard 100 Compliance Supervisor",
        issuingAuthority: "Apparel Training & Design Centre (ATDC) / NIFT-TEA",
        validity: "Permanent",
        whyRequired: "Required to approve garment lots for EU and US retail shipping.",
      },
    ],
  },

  agro_processing: {
    id: "agro_processing",
    name: "Modern Agro-Processing, Aseptic Packaging & Cold Chain",
    tamilName: "நவீன உணவு பதப்படுத்துதல் & குளிர்சாதன விநியோக சங்கிலி",
    category: "Agro-Industrial Food Science & Logistics",
    yoyGrowth: "+14.6% YoY (Cauvery Delta & Southern Agro-Parks)",
    aiImmunityScore: "97.5% AI-Immune (Aseptic Processing & Refrigeration Compressor Operation)",
    dayToDayReality:
      "Operating high-capacity ammonia screw compressors for sub-zero cold storage, running automated aseptic Tetra Pak filling lines, managing optical color-sorting grain lines, and enforcing HACCP microbiology standards.",
    whyCoreVsItVerdict:
      "Food and agro-processing in Thanjavur, Dindigul, Theni, and Erode is essential and non-cyclical. Regardless of economic downturns or tech layoffs, food supply chains, milk packaging (Aavin/Milky Mist), and grain export mills operate at full capacity. Refrigeration and cold-chain mechanics are among the most respected and consistently employed technical cadres.",
    academicTheoryGap:
      "Colleges teach generic biology or traditional farming methods, ignoring industrial ammonia refrigeration plants, vacuum packaging lines, and microbiological food safety hazard audits.",
    factoryEquipmentDemanded: [
      "Industrial Ammonia (NH3) & Freon Multi-Stage Screw Refrigeration Compressors",
      "Automated Aseptic Tetra Pak Filling & Modified Atmosphere Packaging (MAP)",
      "Optical Bichromatic Color Sorter Machines for Grains and Spices",
      "HACCP / ISO 22000 Food Safety Microbiological Testing Equipment",
      "Automated Retort Sterilizers & Continuous Flash Pasteurizers",
    ],
    foundationCourses: [
      {
        title: "Food Process Engineering and Cold Chain Management",
        platform: "NPTEL",
        url: "https://nptel.ac.in/courses",
        duration: "12 Weeks",
        cost: "100% Free (IIT Kharagpur)",
        topics: "Psychrometrics, freezing kinetics, pasteurization math & packaging barrier properties",
      },
      {
        title: "Refrigeration and Air Conditioning (RAC) Technician",
        platform: "DGT Bharat Skills",
        url: "https://bharatskills.gov.in",
        duration: "Self-Paced e-Learning",
        cost: "100% Free (DGT Govt of India)",
        topics: "Compressor overhaul, refrigerant leak detection, cold room insulation & thermals",
      },
      {
        title: "FSSAI FoSTaC Food Safety Supervisor & Line In-Charge",
        platform: "Skill India Digital",
        url: "https://www.skillindiadigital.gov.in",
        duration: "4 Weeks",
        cost: "100% Free (Food Industry Capacity & Skill Initiative)",
        topics: "Good Manufacturing Practices (GMP), allergen control & HACCP validation",
      },
    ],
    safetyTickets: [
      {
        name: "FSSAI Food Safety Training & Certification (FoSTaC) Manufacturing Lead",
        issuingAuthority: "Food Safety and Standards Authority of India (FSSAI)",
        validity: "2 Years",
        whyRequired: "Legally mandatory to release packaged consumable products to market.",
      },
      {
        name: "Industrial Ammonia Refrigeration Safety & Pressure Vessel Ticket",
        issuingAuthority: "DISH Tamil Nadu / National Institute of Secondary Steel Tech",
        validity: "3 Years",
        whyRequired: "Required to handle toxic ammonia refrigerant charging and valve maintenance.",
      },
    ],
  },
};

export interface QualificationPathway {
  id: string;
  label: string;
  tamilLabel: string;
  startingCadre: string;
  recommendedDuration: string;
  entrySalaryRange: string;
  stipendRange: string;
  fiveYearProgression: string;
  customActionMonths1_2: string;
  customActionMonths3_4: string;
  customActionMonths5_6: string;
  customCareerTimeline: Array<{
    phase: string;
    role: string;
    timeframe: string;
    salary: string;
    focus: string;
  }>;
}

export const QUALIFICATION_PATHWAYS: Record<string, QualificationPathway> = {
  "10th_12th": {
    id: "10th_12th",
    label: "10th / 12th Pass (School Leaver)",
    tamilLabel: "10-ஆம் / 12-ஆம் வகுப்பு தேர்ச்சி",
    startingCadre: "Craftsman Trainee / Shopfloor Machine Operator",
    recommendedDuration: "12 - 24 Months Structured Pathway",
    entrySalaryRange: "₹2.2 LPA – ₹3.0 LPA (₹18,000 – ₹25,000 / month)",
    stipendRange: "₹10,500 – ₹13,500 / month (NAPS Paid Apprenticeship)",
    fiveYearProgression: "Senior Plant Technician / Line Maintenance Foreman (₹5.5 – ₹8.5 LPA)",
    customActionMonths1_2:
      "Complete foundational industrial math, safety PPE guidelines, and digital blueprint reading on DGT Bharat Skills and Skill India Digital portals.",
    customActionMonths3_4:
      "Enroll in the local Government ITI for Craftsmen Training Scheme (CTS) hands-on trade training in machine tool operation and workshop diagnostics.",
    customActionMonths5_6:
      "Obtain basic factory safety accreditation (DISH/OSHA compliance) and register on apprenticeshipindia.gov.in for a paid NAPS apprenticeship with local SIPCOT/SIDCO units.",
    customCareerTimeline: [
      {
        phase: "Phase 1: Apprenticeship",
        role: "NAPS Factory Apprentice",
        timeframe: "Months 1–12",
        salary: "₹10,500 – ₹13,500 / month",
        focus: "Hands-on machine operation, shift discipline, tool setting & basic log recording.",
      },
      {
        phase: "Phase 2: Full-Time Placement",
        role: "Junior Machine Operator",
        timeframe: "Months 13–36",
        salary: "₹2.2 – ₹3.0 LPA (₹18,000 – ₹25,000/mo)",
        focus: "Autonomous machine running, scrap reduction, first-piece inspection & PM checks.",
      },
      {
        phase: "Phase 3: Senior Specialist",
        role: "Senior Line Foreman / Shift Technician",
        timeframe: "Year 4+",
        salary: "₹5.5 – ₹8.5 LPA",
        focus: "Shopfloor shift management, tooling changes, breakdown resolution & apprentice training.",
      },
    ],
  },

  iti_polytechnic: {
    id: "iti_polytechnic",
    label: "ITI / Polytechnic Diploma Holder",
    tamilLabel: "ஐடிஐ / பாலிடெக்னிக் டிப்ளமோ முடித்தவர்",
    startingCadre: "Junior Technician / Maintenance & Automation Associate",
    recommendedDuration: "6 - 12 Months Fast-Track Pathway",
    entrySalaryRange: "₹2.6 LPA – ₹3.8 LPA (₹22,000 – ₹32,000 / month)",
    stipendRange: "₹12,500 – ₹16,000 / month (NAPS In-Plant Trainee)",
    fiveYearProgression: "Shift In-Charge / DCS Senior Controller / Reliability Engineer (₹8.0 – ₹13.0 LPA)",
    customActionMonths1_2:
      "Bridge college theory gaps by completing advanced PLC/SCADA simulation and NPTEL process dynamics modules.",
    customActionMonths3_4:
      "Undergo advanced machine certification (5-axis CNC setup, chemical reactor charging, or high-voltage sub-station controls) at district Government Polytechnic or TNSDC center.",
    customActionMonths5_6:
      "Acquire sector-specific statutory license (e.g. CEIG High-Voltage, IBR Welder, or HAZOP Process Safety ticket) and interview directly with SIPCOT anchor employers.",
    customCareerTimeline: [
      {
        phase: "Phase 1: In-Plant Training",
        role: "Industrial Technical Trainee",
        timeframe: "Months 1–6",
        salary: "₹12,500 – ₹16,000 / month",
        focus: "PLC ladder troubleshooting, SCADA interface operations & preventive maintenance routines.",
      },
      {
        phase: "Phase 2: Confirmed Specialist",
        role: "Plant Maintenance Technician",
        timeframe: "Months 7–24",
        salary: "₹2.8 – ₹3.8 LPA (₹23,000 – ₹32,000/mo)",
        focus: "Hydraulic overhaul, electrical fault clearing, calibration & sensor loop tuning.",
      },
      {
        phase: "Phase 3: Plant Leadership",
        role: "Shift In-Charge / Plant Maintenance Lead",
        timeframe: "Year 3+",
        salary: "₹8.0 – ₹13.0 LPA",
        focus: "Overall equipment effectiveness (OEE) management, vendor management & safety audits.",
      },
    ],
  },

  btech_graduate: {
    id: "btech_graduate",
    label: "B.E. / B.Tech Engineering Graduate",
    tamilLabel: "பி.இ / பி.டெக் பொறியியல் பட்டதாரி",
    startingCadre: "Graduate Engineer Trainee (GET) / Process Optimization Engineer",
    recommendedDuration: "3 - 6 Months Rapid Induction",
    entrySalaryRange: "₹4.2 LPA – ₹6.8 LPA (₹35,000 – ₹55,000 / month)",
    stipendRange: "₹15,000 – ₹20,000 / month (NATS 2.0 Graduate Apprentice)",
    fiveYearProgression: "Lead Process Architect / Plant Operations Manager (₹12.0 – ₹20.0 LPA)",
    customActionMonths1_2:
      "Master industry standard engineering simulation tools (Aspen Plus, Siemens NX, MATLAB/Simulink) and complete NPTEL advanced controls.",
    customActionMonths3_4:
      "Complete industry-standard ISO/TS automotive quality, HAZOP leader methodology, or Six Sigma Green Belt at a local MSME Technology Center.",
    customActionMonths5_6:
      "Apply via NATS 2.0 portal for Graduate Apprentice Trainee openings at anchor OEM factories, transitioning to permanent GET within 6 to 12 months.",
    customCareerTimeline: [
      {
        phase: "Phase 1: Graduate Apprenticeship",
        role: "Graduate Apprentice Trainee (GAT)",
        timeframe: "Months 1–12",
        salary: "₹15,000 – ₹20,000 / month",
        focus: "Cross-functional production engineering, quality data analytics & standard operating procedures.",
      },
      {
        phase: "Phase 2: Confirmed Engineer",
        role: "Plant Operations / Process Engineer",
        timeframe: "Years 2–3",
        salary: "₹4.5 – ₹6.8 LPA",
        focus: "Line balancing, Six Sigma DMAIC projects, cycle-time reduction & regulatory compliance.",
      },
      {
        phase: "Phase 3: Department Head",
        role: "Production Manager / Plant Operations Lead",
        timeframe: "Year 5+",
        salary: "₹12.0 – ₹20.0 LPA",
        focus: "Capex planning, departmental P&L, environmental clearance & multi-unit governance.",
      },
    ],
  },

  career_switcher: {
    id: "career_switcher",
    label: "Career Switcher (From IT / BPO / Non-Core to Core)",
    tamilLabel: "வேலை மாற்றம் (ஐடி / பிபிஓ இலிருந்து தொழிற்சாலைக்கு)",
    startingCadre: "Technical Operations Specialist / Industrial Systems Analyst",
    recommendedDuration: "3 - 6 Months Intensive Bridge",
    entrySalaryRange: "₹3.2 LPA – ₹4.8 LPA (₹27,000 – ₹40,000 / month)",
    stipendRange: "₹14,000 – ₹18,000 / month (Lateral Technical Apprentice)",
    fiveYearProgression: "Smart Factory Automation Manager / Industrial IoT Architect (₹10.0 – ₹16.0 LPA)",
    customActionMonths1_2:
      "Leverage existing computational thinking to learn industrial PLC, SCADA, and Python for industrial edge gateways via Skill India Digital.",
    customActionMonths3_4:
      "Complete accelerated hands-on technical workshop training in electrical safety, motor drives, and industrial networking at TNSDC or SIPCOT center.",
    customActionMonths5_6:
      "Acquire OSHA / DISH General Industry Safety Ticket and target modern smart-manufacturing and EV plants seeking digital-savvy operators.",
    customCareerTimeline: [
      {
        phase: "Phase 1: Bridge Internship",
        role: "Industrial Automation Trainee",
        timeframe: "Months 1–6",
        salary: "₹14,000 – ₹18,000 / month",
        focus: "Bridging software knowledge with physical actuators, sensors, pneumatics & safety interlocks.",
      },
      {
        phase: "Phase 2: Industry Deployment",
        role: "Smart Factory Automation Specialist",
        timeframe: "Months 7–24",
        salary: "₹3.5 – ₹4.8 LPA",
        focus: "SCADA telemetry data logging, predictive maintenance algorithms & line digitization.",
      },
      {
        phase: "Phase 3: Senior Technical Lead",
        role: "Industrial IoT & Automation Lead",
        timeframe: "Year 3+",
        salary: "₹10.0 – ₹16.0 LPA",
        focus: "Connecting OT (Operational Technology) shopfloor PLCs with IT enterprise ERP systems.",
      },
    ],
  },
};

/**
 * Generates an end-to-end personalized 5-Stage Employee Roadmap combining
 * district geographical grounding with core sector technical specifications
 * and candidate qualification profile.
 */
export function getPersonalizedRoadmap(
  districtName: string,
  domainId: string,
  qualificationId: string
) {
  const districtReg = getDistrictRegistry(districtName);
  const domain = CORE_DOMAINS[domainId] || CORE_DOMAINS.chemical;
  const qual = QUALIFICATION_PATHWAYS[qualificationId] || QUALIFICATION_PATHWAYS["iti_polytechnic"];

  return {
    district: districtReg.district,
    tamilDistrict: districtReg.tamilName,
    domain,
    qualification: qual,
    districtRegistry: districtReg,

    // Section 1: Conclusive Verdict
    verdict: {
      coreSectorName: domain.name,
      growthRate: districtReg.growthRateYoY,
      aiImmunityScore: domain.aiImmunityScore,
      whyCoreVsIt: domain.whyCoreVsItVerdict,
      dayToDayWorkReality: domain.dayToDayReality,
      localRetentionBenefit: `Living and working in ${districtReg.district} eliminates metro living expenses (saving ₹15,000 - ₹22,000/month in room rent and food inflation compared to Chennai or Bengaluru), leading to higher net savings in the candidate's home region.`,
    },

    // Section 2: Exact Skill Gap
    skillGap: {
      whatSchoolsTeach: qual.id === "10th_12th"
        ? "Basic theoretical physics and geometry without machine shop exposure, mechanical measuring instruments, or industrial safety protocols."
        : districtReg.collegeTheoryGap,
      whatFactoriesDemandNow: domain.factoryEquipmentDemanded,
      estimatedShortageSeats: districtReg.estimatedShortageSeats,
    },

    // Section 3: 3-Phase Step-by-Step Qualification Path
    stepByStepPath: [
      {
        stage: "Stage 1 (Months 1–2): Foundation & Core Theory",
        objective: qual.customActionMonths1_2,
        recommendedCourses: domain.foundationCourses,
        milestone: "100% Free Government Verified Online Certification",
      },
      {
        stage: `Stage 2 (Months 3–4): Hands-on Lab at Nearby ${districtReg.district} Training Centers`,
        objective: qual.customActionMonths3_4,
        trainingCenters: districtReg.nearbyItisAndTraining,
        milestone: "Hands-on Equipment Qualification (State Directorate of Employment & Training)",
      },
      {
        stage: "Stage 3 (Months 5–6): Mandatory Safety Tickets & NAPS / NATS Apprenticeship",
        objective: qual.customActionMonths5_6,
        safetyTickets: domain.safetyTickets,
        apprenticeshipPortals: [
          {
            name: "NAPS (National Apprenticeship Promotion Scheme)",
            url: "https://www.apprenticeshipindia.gov.in",
            purpose: "For 10th/12th and ITI/Diploma candidates for paid factory training.",
          },
          {
            name: "NATS 2.0 (National Apprenticeship Training Scheme)",
            url: "https://nats.education.gov.in",
            purpose: "For Diploma and B.E./B.Tech graduates for Graduate Apprentice Trainee roles.",
          },
        ],
        milestone: "Government Factory Safety Ticket + Registered Apprenticeship Contract",
      },
    ],

    // Section 4: Local Companies Hiring in That District
    localHiring: {
      govtPsuEmployers: districtReg.govtPsuEmployers,
      privateSipcotEmployers: districtReg.privateEmployers,
      hiringHubNote: `Recruiting directly for ${districtReg.district} industrial manufacturing complexes and SIPCOT/SIDCO growth centers.`,
    },

    // Section 5: Salary & Career Ladder
    careerLadder: qual.customCareerTimeline,
  };
}

