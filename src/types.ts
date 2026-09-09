export type Language =
  | 'Hindi'
  | 'English'
  | 'Tamil'
  | 'Telugu'
  | 'Bengali'
  | 'Marathi'
  | 'Gujarati'
  | 'Kannada';

export type OpdType = 'allopathic' | 'ayush';

export type TriagePriority = 'EMERGENCY' | 'URGENT' | 'ROUTINE';

export interface AbhaProfile {
  abhaId: string;
  abhaAddress: string;
  fullName: string;
  gender: string;
  age: number;
  dob: string;
  phone: string;
  address: string;
  photoUrl?: string;
  isVerified: boolean;
  kycMethod: 'Aadhaar OTP' | 'Biometric' | 'ABHA QR';
  consentGranted: boolean;
  consentTimestamp?: string;
}

export interface SocratesHistory {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associatedSymptoms?: string[];
  timingDuration?: string;
  exacerbatingRelieving?: string;
  severity?: number; // 1 - 10
}

export interface DashavidhaPariksha {
  prakriti: string; // Vata, Pitta, Kapha or Dwandwaja
  vikriti: string; // Current Dosha-Dushya imbalance
  agni: string; // Mandagni, Vishamagni, Tikshnagni, Samagni
  koshtha: string; // Krura, Mridu, Madhyama
  sara: string; // Dhatu excellence (Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra, Sattva)
  samhanana: string; // Body compactness
  pramana: string; // Body dimensions / proportions
  satmya: string; // Habituation / dietary suitability
  sattva: string; // Mental strength / psychological resilience (Pravara, Madhyama, Avara)
  aharaShakti: string; // Digestive power (Abhyavaharana & Jarana Shakti)
  vyayamaShakti: string; // Physical capacity / endurance
  vaya: string; // Age group (Bala, Madhyama, Vriddha)
  aharaViharaNotes?: string;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface LabResultItem {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  flag: 'HIGH' | 'LOW' | 'NORMAL' | 'CRITICAL';
}

export interface MedicalDocument {
  id: string;
  title: string;
  date: string;
  provider: string;
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Imaging';
  imageDataUrl?: string;
  diagnoses: string[];
  medications: MedicationItem[];
  labResults: LabResultItem[];
  clinicalAlerts: string[];
  ocrTranscription: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  translation?: string;
  timestamp: string;
  suggestedOptions?: string[];
  isRedFlag?: boolean;
}

export interface PatientIntakeSession {
  id: string;
  tokenNumber: string;
  profile: AbhaProfile;
  opdType: OpdType;
  department: string;
  language: Language;
  chiefComplaint: string;
  socrates: SocratesHistory;
  dashavidha?: DashavidhaPariksha;
  pastHistory: string;
  medications: MedicationItem[];
  allergies: string[];
  familyHistory: string;
  personalHistory: {
    diet: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian';
    tobacco: boolean;
    smoking: boolean;
    alcohol: boolean;
    sleepHours: number;
    bowelHabits: string;
  };
  reviewOfSystems: {
    cardiovascular?: string;
    respiratory?: string;
    gastrointestinal?: string;
    neurological?: string;
    musculoskeletal?: string;
    general?: string;
  };
  conversation: ChatMessage[];
  documents: MedicalDocument[];
  isRedFlag: boolean;
  redFlagReason?: string;
  priorityLevel: TriagePriority;
  status: 'Draft' | 'Submitted' | 'In Consultation' | 'Completed';
  createdAt: string;
}

export interface PhysicianSummary {
  chiefComplaint: string;
  hpi: string;
  pastMedicalHistory: string;
  medications: string[];
  allergies: string[];
  familyHistory: string;
  personalHistory: string;
  reviewOfSystems: string;
  dashavidhaPariksha?: Record<string, string>;
  abnormalFindings: string[];
  patientAudioConfirmationText?: string;
}

export interface DoctorConsultationNote {
  provisionalDiagnosis: string;
  clinicalImpression: string;
  treatmentPlan: string;
  prescribedDrugs: MedicationItem[];
  adviceAndFollowUp: string;
  hisPushed: boolean;
}
