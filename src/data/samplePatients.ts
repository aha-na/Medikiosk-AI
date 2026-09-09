import { AbhaProfile, OpdType, Language } from '../types';

export interface PresetScenario {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  opdType: OpdType;
  language: Language;
  profile: AbhaProfile;
  initialComplaint: string;
  initialMessage: string;
  isRedFlagTrigger?: boolean;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'preset-emergency',
    name: 'Rameshwar Prasad (58y, M)',
    badge: 'Red-Flag Emergency',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Acute crushing chest pain, diaphoresis & dyspnea. Tests immediate triage prioritization.',
    opdType: 'allopathic',
    language: 'Hindi',
    isRedFlagTrigger: true,
    profile: {
      abhaId: '91-4829-1049-3821',
      abhaAddress: 'rameshwar.p@abdm',
      fullName: 'Rameshwar Prasad',
      gender: 'Male',
      age: 58,
      dob: '1968-04-12',
      phone: '+91 98310 44219',
      address: 'Mohalla Shivpuri, Bareilly, Uttar Pradesh 243001',
      isVerified: true,
      kycMethod: 'ABHA QR',
      consentGranted: true,
      consentTimestamp: new Date().toISOString(),
    },
    initialComplaint: 'छाती में बहुत भारी दबाव और पसीना (Crushing chest heaviness & sweating)',
    initialMessage: 'नमस्ते डॉक्टर साहब। आज सुबह से मेरी छाती के बीच में बहुत भारी पत्थर जैसा दर्द हो रहा है और बाएँ हाथ तक जा रहा है। सांस फूल रही है और ठंडा पसीना आ रहा है।',
  },
  {
    id: 'preset-diabetes',
    name: 'Sunita Devi (49y, F)',
    badge: 'Chronic Metabolic / Document Scanning',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Uncontrolled T2D, foot burning, hypertension with prior physical paper prescription to scan.',
    opdType: 'allopathic',
    language: 'Hindi',
    profile: {
      abhaId: '44-8192-3021-9940',
      abhaAddress: 'sunitadevi75@abdm',
      fullName: 'Sunita Devi',
      gender: 'Female',
      age: 49,
      dob: '1977-11-03',
      phone: '+91 94331 82910',
      address: 'Village Rampur, Dist Patna, Bihar 800004',
      isVerified: true,
      kycMethod: 'Aadhaar OTP',
      consentGranted: true,
      consentTimestamp: new Date().toISOString(),
    },
    initialComplaint: 'पैरों में जलन, बार-बार पेशाब और कमजोरी (Burning feet, polyuria, fatigue)',
    initialMessage: 'मुझे 8 साल से शुगर है। पिछले एक महीने से पैरों के तलवों में बहुत ज्यादा जलन और झनझनाहट हो रही है, रात को नींद नहीं आती। मेरे पास पुरानी पर्ची और खून की जांच भी है।',
  },
  {
    id: 'preset-ayush',
    name: 'Balwant Singh (52y, M)',
    badge: 'AYUSH Dashavidha Pariksha',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Chronic joint stiffness (Amavata), Mandagni, requiring Trividha & Dashavidha assessment.',
    opdType: 'ayush',
    language: 'English',
    profile: {
      abhaId: '77-1940-5591-6623',
      abhaAddress: 'balwant.singh@abdm',
      fullName: 'Balwant Singh',
      gender: 'Male',
      age: 52,
      dob: '1974-06-25',
      phone: '+91 98112 37490',
      address: 'Sector 14, Urban Estate, Karnal, Haryana 132001',
      isVerified: true,
      kycMethod: 'Biometric',
      consentGranted: true,
      consentTimestamp: new Date().toISOString(),
    },
    initialComplaint: 'Morning small-joint stiffness, heaviness after food & constipation (Amavata & Mandagni)',
    initialMessage: 'I have severe stiffness in fingers and knees every morning for over an hour. My digestion is very slow, food feels heavy for hours, and I suffer from hard bowel movements.',
  },
  {
    id: 'preset-fever',
    name: 'Priya Sharma (28y, F)',
    badge: 'Acute Infectious / Dengue Suspect',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'High grade fever for 4 days with retro-orbital pain and body aches in post-monsoon season.',
    opdType: 'allopathic',
    language: 'Hindi',
    profile: {
      abhaId: '12-9014-4411-7890',
      abhaAddress: 'priya.sharma@abdm',
      fullName: 'Priya Sharma',
      gender: 'Female',
      age: 28,
      dob: '1998-02-14',
      phone: '+91 97184 02194',
      address: 'Kalyan Nagar, Bengaluru, Karnataka 560043',
      isVerified: true,
      kycMethod: 'ABHA QR',
      consentGranted: true,
      consentTimestamp: new Date().toISOString(),
    },
    initialComplaint: 'तेज बुखार, आंखों के पीछे दर्द और बदन टूटना (High fever, retro-orbital ache, myalgia)',
    initialMessage: 'मुझे 4 दिन से लगातार 102 डिग्री बुखार आ रहा है, आंखों को घुमाने पर पीछे दर्द होता है और बहुत कमजोरी लग रही है।',
  },
];
