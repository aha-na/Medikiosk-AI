import { MedicalDocument } from '../types';

export const SAMPLE_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc-rx-01',
    title: 'District Civil Hospital OPD Slip - Dr. S. K. Verma',
    date: '2024-02-18',
    provider: 'District Civil Hospital, Bareilly, UP',
    type: 'Prescription',
    diagnoses: ['Essential Hypertension Stage 2', 'Type 2 Diabetes Mellitus', 'Dyslipidemia'],
    medications: [
      { name: 'Tab Metformin', dosage: '500 mg', frequency: 'Twice daily after food (1-0-1)', duration: '30 days' },
      { name: 'Tab Telmisartan', dosage: '40 mg', frequency: 'Once daily morning (1-0-0)', duration: '30 days' },
      { name: 'Tab Atorvastatin', dosage: '10 mg', frequency: 'Bedtime (0-0-1)', duration: '30 days' },
    ],
    labResults: [],
    clinicalAlerts: [
      'Caution: Long-term Metformin therapy; periodic renal function monitoring recommended.',
      'Unchecked compliance: Patient admitted to skipping evening doses.',
    ],
    ocrTranscription: `GOVT DISTRICT CIVIL HOSPITAL - OPD DEPT
Dr. S. K. Verma, MD (Gen Med) | Reg: UP-48192
Date: 18/02/2024
Pt: Rameshwar Prasad, 58/M
BP: 154/96 mmHg | PR: 84 bpm | RBS: 210 mg/dL
Dx: T2DM / HTN / Dyslipidemia
Rx:
1. Tab Metformin 500mg - 1 BD pc x 1 month
2. Tab Telmisartan 40mg - 1 OD am x 1 month
3. Tab Atorvastatin 10mg - 1 HS x 1 month
Adv: Lipid profile, Serum Creatinine, HbA1c, ECG. Review after 4 weeks.`,
  },
  {
    id: 'doc-lab-02',
    title: 'Dr. Lal PathLabs - Comprehensive Metabolic & Renal Panel',
    date: '2024-02-22',
    provider: 'Dr. Lal PathLabs Ltd, Central Reference Lab',
    type: 'Lab Report',
    diagnoses: ['Impaired Renal Function', 'Uncontrolled Glycemia'],
    medications: [],
    labResults: [
      { testName: 'HbA1c (Glycated Hemoglobin)', value: '8.8', unit: '%', referenceRange: '4.0 - 5.6 %', isAbnormal: true, flag: 'HIGH' },
      { testName: 'Estimated Average Glucose (eAG)', value: '206', unit: 'mg/dL', referenceRange: '70 - 115 mg/dL', isAbnormal: true, flag: 'HIGH' },
      { testName: 'Serum Creatinine', value: '1.85', unit: 'mg/dL', referenceRange: '0.70 - 1.20 mg/dL', isAbnormal: true, flag: 'HIGH' },
      { testName: 'Blood Urea Nitrogen (BUN)', value: '38', unit: 'mg/dL', referenceRange: '7 - 20 mg/dL', isAbnormal: true, flag: 'HIGH' },
      { testName: 'Serum Uric Acid', value: '7.9', unit: 'mg/dL', referenceRange: '3.4 - 7.0 mg/dL', isAbnormal: true, flag: 'HIGH' },
      { testName: 'Serum Potassium', value: '4.6', unit: 'mEq/L', referenceRange: '3.5 - 5.1 mEq/L', isAbnormal: false, flag: 'NORMAL' },
    ],
    clinicalAlerts: [
      'CRITICAL: Serum Creatinine is 1.85 mg/dL (Baseline was 1.1). Nephrology clearance required before radiocontrast or NSAID administration.',
      'HIGH HbA1c (8.8%): Poor glycaemic control, risk of microvascular complications.',
    ],
    ocrTranscription: `DR. LAL PATHLABS - PATIENT REPORT
Patient: Rameshwar Prasad | Ref by: Dr. S. K. Verma
Sample Date: 22/02/2024
INVESTIGATION               RESULT    UNIT     BIOLOGICAL REF INTERVAL
HbA1c                       8.8       %        Normal: <5.7%, Poor: >8.0% [HIGH]
Estimated Avg Glucose       206       mg/dL    70 - 115
Serum Creatinine            1.85      mg/dL    0.70 - 1.20 [HIGH]
Blood Urea                  48        mg/dL    15 - 40 [HIGH]
Serum Uric Acid             7.9       mg/dL    3.4 - 7.0 [HIGH]
Potassium, Serum            4.6       mEq/L    3.5 - 5.1 [NORMAL]`,
  },
  {
    id: 'doc-ayush-03',
    title: 'National Institute of Ayurveda - Panchakarma Case Card',
    date: '2024-01-15',
    provider: 'NIA Ayurvedic Hospital, OPD Kayachikitsa, Jaipur',
    type: 'Discharge Summary',
    diagnoses: ['Amavata (Rheumatoid arthritis equivalent)', 'Agni Mandya with Sama Dosha'],
    medications: [
      { name: 'Simhanada Guggulu', dosage: '2 tablets', frequency: 'Twice daily with warm water (Ushnodaka)', duration: '45 days' },
      { name: 'Rasnadi Kashayam', dosage: '15 ml with 45 ml boiled water', frequency: 'Before meals twice daily', duration: '30 days' },
      { name: 'Vaishwanara Churna', dosage: '3 grams', frequency: 'Before food with Takra (buttermilk)', duration: '15 days' },
    ],
    labResults: [
      { testName: 'Rheumatoid Factor (RA)', value: '64.0', unit: 'IU/mL', referenceRange: '< 14.0 IU/mL', isAbnormal: true, flag: 'HIGH' },
      { testName: 'ESR (Westergren)', value: '52', unit: 'mm/hr', referenceRange: '< 20 mm/hr', isAbnormal: true, flag: 'HIGH' },
    ],
    clinicalAlerts: [
      'Sama Dosha Lakshana observed: Thick white tongue coating, heavy limbs, constipation.',
      'Advised Langhana (light fasting) and Baluka Sweda (sand poultice fomentation). Avoid cold curd and dairy at night.',
    ],
    ocrTranscription: `NATIONAL INSTITUTE OF AYURVEDA - OPD CASE RECORD
Pt: Balwant Singh, 52/M | Rogi Sankhya: NIA-2024-8190
Nidana (Diagnosis): Amavata (Vata-Kapha Pradhana)
Dosha: Vata-Kapha Prakopa | Dushya: Rasa, Asthi, Sandhi
Agni: Mandagni | Koshtha: Krura | Mala: Vibandha (constipation)
Chikitsa:
1. Simhanada Guggulu 2 Vati BD with Ushnodaka
2. Rasnadi Kashayam 15ml + 45ml Ushna Jala BD
3. Vaishwanara Churna 3g BD with Takra
Pathya: Kulattha soup, Yava, Purana Shali.
Apathya: Dadhi, Matsya, Sheeta Jala, Divaswapna (daytime sleep).`,
  },
];
