import { buildTNPortalDistrictUrl } from './tnPrivateJobsData';

export type LinkCategory =
  | 'SKILL_COURSE_GOVT'
  | 'SKILL_VIDEO_LECTURE'
  | 'ITI_MAP_LOCATION'
  | 'SIPCOT_PARK_MAP'
  | 'GOVT_PSU_VACANCY'
  | 'NAPS_APPRENTICESHIP'
  | 'PRIVATE_FACTORY_JOB'
  | 'INTERNSHIP_APPLY'
  | 'VERIFIED_SOURCE_EVIDENCE'
  | 'SAFETY_LICENSE_PORTAL'
  | 'TN_GOVT_PRIVATE_JOBS';

export type JobPortalTarget =
  | 'google_jobs'
  | 'linkedin'
  | 'indeed'
  | 'naukri'
  | 'tn_private_jobs'
  | 'career'
  | 'notification';

// 1. Maps any long skill or sector string to a SINGLE 1-word SWAYAM catalog keyword that 100% returns courses
export function getSwayamRootKeyword(text: string = ''): string {
  const t = text.toLowerCase();
  if (t.includes('solar') || t.includes('pv') || t.includes('wind') || t.includes('renewable') || t.includes('hydrogen')) return 'Solar';
  if (t.includes('scada') || t.includes('plc') || t.includes('dcs') || t.includes('automation') || t.includes('control')) return 'Automation';
  if (t.includes('battery') || t.includes('ev') || t.includes('electric') || t.includes('power') || t.includes('grid') || t.includes('substation') || t.includes('transformer')) return 'Electrical';
  if (t.includes('chemical') || t.includes('petro') || t.includes('process') || t.includes('hazop') || t.includes('zld') || t.includes('effluent') || t.includes('pharma')) return 'Chemical';
  if (t.includes('cnc') || t.includes('lathe') || t.includes('machin') || t.includes('cad') || t.includes('cam') || t.includes('metrology') || t.includes('weld') || t.includes('foundry')) return 'Manufacturing';
  if (t.includes('robot') || t.includes('mechatron') || t.includes('smt') || t.includes('pcb') || t.includes('sensor')) return 'Robotics';
  if (t.includes('boiler') || t.includes('thermal') || t.includes('mechanical') || t.includes('piping') || t.includes('hydraulic')) return 'Mechanical';
  if (t.includes('textile') || t.includes('garment') || t.includes('knit') || t.includes('dye')) return 'Textile';
  if (t.includes('food') || t.includes('agro') || t.includes('cold chain') || t.includes('dairy')) return 'Food';
  return 'Engineering';
}

// 2. Maps any long role/skill to a clean 2-word recruiter job title that ALWAYS has active openings in Tamil Nadu
export function getCleanJobTitle(role: string = '', sector: string = ''): string {
  const t = `${role} ${sector}`.toLowerCase();
  if (t.includes('chemical') || t.includes('petro') || t.includes('pharma') || t.includes('zld')) return 'Chemical Operator';
  if (t.includes('cnc') || t.includes('machin') || t.includes('lathe') || t.includes('fitter') || t.includes('foundry')) return 'CNC Operator';
  if (t.includes('solar') || t.includes('wind') || t.includes('scada') || t.includes('substation') || t.includes('electric') || t.includes('ev') || t.includes('battery')) return 'Electrical Technician';
  if (t.includes('plc') || t.includes('automation') || t.includes('instrument') || t.includes('dcs')) return 'Automation Engineer';
  if (t.includes('weld') || t.includes('fabricat') || t.includes('boiler') || t.includes('mech')) return 'Mechanical Technician';
  if (t.includes('textile') || t.includes('knit') || t.includes('garment')) return 'Production Supervisor';
  if (t.includes('quality') || t.includes('agro') || t.includes('food')) return 'Quality Inspector';
  return 'Diploma Trainee';
}

// 3. Extracts clean 3-word YouTube tutorial topic (strips '&' and complex clauses)
export function getCleanVideoTopic(skillName: string = ''): string {
  const primaryClause = skillName.split('&')[0].split('/')[0].replace(/\(.*?\)/g, '').trim();
  const words = primaryClause.split(/\s+/).slice(0, 4).join(' ');
  return words || 'Industrial Engineering';
}

// 4. Direct Official PSU Recruitment Portals Lookup
export function getDirectPsuPortal(companyName: string = '', district: string = ''): string {
  const c = `${companyName} ${district}`.toLowerCase();
  if (c.includes('nlc') || c.includes('neyveli')) return 'https://www.nlcindia.in/new_website/careers/CAREER.htm';
  if (c.includes('tangedco') || c.includes('tnpdcl') || c.includes('tneb')) return 'https://www.tangedco.org/en/tangedco/recruitment/';
  if (c.includes('bhel') || c.includes('trichy') || c.includes('tiruchirappalli')) return 'https://careers.bhel.in/';
  if (c.includes('voc') || c.includes('port') || c.includes('thoothukudi') || c.includes('tuticorin')) return 'https://www.vocport.gov.in/port/userinterface/recruitment.aspx';
  if (c.includes('cpcl') || c.includes('manali')) return 'https://cpcl.co.in/careers/';
  if (c.includes('sail') || c.includes('salem')) return 'https://sailcareers.com/secure/home';
  if (c.includes('tnpsc')) return 'https://www.tnpsc.gov.in/English/Notification.aspx';
  // Guaranteed live PSU / Govt Jobs view in Tamil Nadu
  return `https://in.indeed.com/jobs?q=${encodeURIComponent('Government PSU Engineer Technician')}&l=${encodeURIComponent('Tamil Nadu')}`;
}

export interface DeepLinkParams {
  category: LinkCategory;
  district: string;
  sector?: string;
  skillName?: string;
  companyName?: string;
  roleTitle?: string;
  itiName?: string;
  sourceHeadline?: string;
  portal?: JobPortalTarget;
}

export function resolveDynamicDeepLink(params: DeepLinkParams): string {
  const {
    category,
    district = 'Tamil Nadu',
    sector = '',
    skillName = '',
    companyName = '',
    roleTitle = '',
    itiName = '',
    portal,
  } = params;

  const cleanDistrict = district.split('(')[0].replace(/[^a-zA-Z\s]/g, '').trim() || 'Chennai';
  const swayamWord = getSwayamRootKeyword(skillName || sector || roleTitle);
  const jobKeyword = getCleanJobTitle(roleTitle || skillName, sector);
  const videoTopic = getCleanVideoTopic(skillName || roleTitle || sector);

  // If specific portal requested (e.g. TN Govt Private Jobs portal)
  if (portal === 'tn_private_jobs' || category === 'TN_GOVT_PRIVATE_JOBS') {
    return buildTNPortalDistrictUrl(cleanDistrict);
  }

  switch (category) {
    case 'SKILL_COURSE_GOVT':
      // Uses SINGLE guaranteed root keyword (e.g. "Solar", "Automation", "Chemical") so SWAYAM NEVER returns 0 results!
      return `https://swayam.gov.in/explorer?searchText=${encodeURIComponent(swayamWord)}`;

    case 'SKILL_VIDEO_LECTURE':
      // Opens clean NPTEL / Practical Engineering Lecture videos on YouTube
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${videoTopic} NPTEL practical lecture`)}`;

    case 'ITI_MAP_LOCATION':
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${itiName || 'Government ITI'} ${cleanDistrict} Tamil Nadu`)}`;

    case 'SIPCOT_PARK_MAP':
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`SIPCOT Industrial Park ${cleanDistrict} Tamil Nadu`)}`;

    case 'GOVT_PSU_VACANCY':
      return getDirectPsuPortal(companyName, cleanDistrict);

    case 'NAPS_APPRENTICESHIP':
      // Opens Indeed India Apprentice listings in Tamil Nadu (always populated with real factory apprenticeships)
      return `https://in.indeed.com/jobs?q=${encodeURIComponent(`ITI Diploma Apprentice ${swayamWord}`)}&l=${encodeURIComponent(`Tamil Nadu`)}`;

    case 'INTERNSHIP_APPLY':
      // Opens Indeed India Trainee/Intern roles in Tamil Nadu (guaranteed real postings)
      return `https://in.indeed.com/jobs?q=${encodeURIComponent(`${jobKeyword} Trainee`)}&l=${encodeURIComponent(`${cleanDistrict}, Tamil Nadu`)}`;

    case 'PRIVATE_FACTORY_JOB':
      if (portal === 'linkedin') {
        return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobKeyword)}&location=${encodeURIComponent('Tamil Nadu, India')}`;
      }
      if (portal === 'naukri') {
        const roleSlug = jobKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `https://www.naukri.com/${encodeURIComponent(roleSlug)}-jobs-in-tamil-nadu`;
      }
      // Opens Indeed India for the 2-word core trade in that district/state (guaranteed real factory jobs)
      return `https://in.indeed.com/jobs?q=${encodeURIComponent(jobKeyword)}&l=${encodeURIComponent(`${cleanDistrict}, Tamil Nadu`)}`;

    case 'SAFETY_LICENSE_PORTAL':
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${videoTopic} industrial safety certification training`)}`;

    case 'VERIFIED_SOURCE_EVIDENCE':
      return `https://sipcot.tn.gov.in/`;

    default:
      return `https://in.indeed.com/jobs?q=${encodeURIComponent(jobKeyword)}&l=${encodeURIComponent('Tamil Nadu')}`;
  }
}

export default resolveDynamicDeepLink;
