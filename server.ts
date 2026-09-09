import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY is not set in environment. Gemini features will use graceful fallbacks.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Store for Kiosk OPD Queue & Consultations
interface PatientQueueItem {
  id: string;
  tokenNumber: string;
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  department: string;
  opdType: 'allopathic' | 'ayush';
  language: string;
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Triage Priority';
  isRedFlag: boolean;
  redFlagDetails?: string;
  timestamp: string;
  chiefComplaint: string;
  historySummary?: any;
  extractedDocuments?: any[];
  fhirBundle?: any;
  doctorNotes?: string;
  provisionalDiagnosis?: string;
}

const mockPatientsQueue: PatientQueueItem[] = [
  {
    id: 'pt-101',
    tokenNumber: 'OPD-042',
    abhaId: '91-4829-1049-3821',
    name: 'Rameshwar Prasad',
    age: 58,
    gender: 'Male',
    phone: '+91 98310 44219',
    department: 'General Medicine / Cardiology',
    opdType: 'allopathic',
    language: 'Hindi',
    status: 'Triage Priority',
    isRedFlag: true,
    redFlagDetails: 'CRITICAL: Severe retrosternal chest pain radiating to left arm with diaphoresis (cold sweats) for 90 mins.',
    timestamp: '08:15 AM',
    chiefComplaint: 'Chest heaviness and shortness of breath',
    historySummary: {
      chiefComplaint: 'Substernal pressure/crushing chest pain with cold sweating for 1.5 hours',
      hpi: 'Patient reports sudden onset of retrosternal heavy squeezing chest pain while walking this morning, rated 8/10, radiating to left shoulder and arm. Accompanied by breathlessness and nausea. Known hypertensive on irregular medication.',
      pastHistory: 'Hypertension diagnosed 6 years ago. Dyslipidemia. Ex-smoker (20 pack-years).',
      medications: ['Amlodipine 5mg OD (irregular)', 'Atorvastatin 10mg OD'],
      allergies: ['Penicillin (develops urticarial rash)'],
      familyHistory: 'Father had myocardial infarction at age 52',
      personalHistory: 'Diet: Mixed. Tobacco chewer for 15 years. Sedentary lifestyle.',
      ros: 'Cardiovascular: Chest pain, palpitations. Respiratory: Exertional dyspnea. Gastrointestinal: Mild epigastric burning.'
    }
  },
  {
    id: 'pt-102',
    tokenNumber: 'OPD-043',
    abhaId: '44-8192-3021-9940',
    name: 'Sunita Devi',
    age: 49,
    gender: 'Female',
    phone: '+91 94331 82910',
    department: 'Internal Medicine / Endocrinology',
    opdType: 'allopathic',
    language: 'Hindi',
    status: 'Waiting',
    isRedFlag: false,
    timestamp: '08:25 AM',
    chiefComplaint: 'Uncontrolled blood sugar, burning feet (peripheral neuropathy)',
    historySummary: {
      chiefComplaint: 'Burning pain in bilateral soles and fatigue for 3 months',
      hpi: 'Known Type 2 Diabetes for 8 years presenting with progressive bilateral tingling and burning sensation in feet, worse at night. Polyuria and polydipsia noted over past month. Missed recent clinic follow-ups.',
      pastHistory: 'Type 2 Diabetes Mellitus (8 yrs). Hypothyroidism (4 yrs).',
      medications: ['Metformin 500mg BD', 'Glimepiride 1mg OD', 'Thyronorm 50mcg OD'],
      allergies: ['No known drug allergies (NKDA)'],
      familyHistory: 'Mother had diabetes and chronic kidney disease',
      personalHistory: 'Vegetarian diet, tea with sugar twice daily, sleep disturbed by leg pain.',
      ros: 'Neuro: Tingling, numbness in glove and stocking distribution. General: Unexplained weight loss 3kg in 2 months.'
    }
  },
  {
    id: 'pt-103',
    tokenNumber: 'AYU-014',
    abhaId: '77-1940-5591-6623',
    name: 'Balwant Singh',
    age: 52,
    gender: 'Male',
    phone: '+91 98112 37490',
    department: 'Ayurveda / Kayachikitsa',
    opdType: 'ayush',
    language: 'English',
    status: 'Waiting',
    isRedFlag: false,
    timestamp: '08:40 AM',
    chiefComplaint: 'Chronic joint stiffness (Amavata) and sluggish digestion (Mandagni)',
    historySummary: {
      chiefComplaint: 'Severe early morning stiffness in small joints of both hands and knee pain (Amavata)',
      hpi: 'Patient suffering from progressive symmetric polyarthritis since 14 months. Morning stiffness lasts >60 mins. Associated with heaviness in abdomen, tastelessness (Aruchi), and sluggish digestion.',
      dashavidhaPariksha: {
        prakriti: 'Vata-Kapha Pradhana',
        vikriti: 'Kapha-Vataja Amavata with Sama Pitta',
        agni: 'Mandagni (sluggish digestive fire with persistent Ama formation)',
        koshtha: 'Krura Koshtha (tendency to hard stools and constipation)',
        sara: 'Madhyama Asthi & Medo Sara',
        samhanana: 'Madhyama (medium body compactness)',
        pramana: 'Normal height-weight proportion (Prakrita)',
        satmya: 'Katu-Tikta Rasa Satmya',
        sattva: 'Madhyama Sattva',
        aharaShakti: 'Avara Abhyavaharana & Avara Jarana Shakti',
        vyayamaShakti: 'Avara (poor physical stamina due to joint pain)',
        vaya: 'Madhyama Vaya (52 years)'
      },
      pastHistory: 'Recurrent indigestion, hyperuricemia (uric acid 7.8 mg/dL).',
      medications: ['Simhanada Guggulu 2 tabs BD', 'Shallaki tabs', 'Allopathic Painkiller SOS'],
      allergies: ['Sulfa drugs (itching)'],
      personalHistory: 'Ahara: Heavy curd intake at night (Abhishyandi), sedentary sitting work, cold water drinking.'
    }
  }
];

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MediKiosk Clinical Intake System',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 2. Queue & Patients
app.get('/api/patients', (req: Request, res: Response) => {
  res.json({ patients: mockPatientsQueue });
});

app.post('/api/patients/submit', (req: Request, res: Response) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      abhaId,
      department,
      opdType,
      language,
      chiefComplaint,
      historySummary,
      extractedDocuments,
      fhirBundle,
      isRedFlag,
      redFlagDetails,
    } = req.body;

    const tokenPrefix = opdType === 'ayush' ? 'AYU' : 'OPD';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newToken = `${tokenPrefix}-${randomNum}`;

    const newPatient: PatientQueueItem = {
      id: `pt-${Date.now()}`,
      tokenNumber: newToken,
      abhaId: abhaId || `91-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`,
      name: name || 'Anonymous Patient',
      age: Number(age) || 45,
      gender: gender || 'Other',
      phone: phone || '+91 98000 00000',
      department: department || (opdType === 'ayush' ? 'Ayurvedic Kayachikitsa' : 'General Medicine'),
      opdType: opdType || 'allopathic',
      language: language || 'Hindi',
      status: isRedFlag ? 'Triage Priority' : 'Waiting',
      isRedFlag: Boolean(isRedFlag),
      redFlagDetails: redFlagDetails || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chiefComplaint: chiefComplaint || 'Routine medical intake',
      historySummary: historySummary || {},
      extractedDocuments: extractedDocuments || [],
      fhirBundle: fhirBundle || null,
    };

    if (newPatient.isRedFlag) {
      mockPatientsQueue.unshift(newPatient);
    } else {
      mockPatientsQueue.push(newPatient);
    }

    res.json({
      success: true,
      message: 'Intake submitted successfully to Hospital Information System (HIS)',
      patient: newPatient,
      tokenNumber: newPatient.tokenNumber,
      queuePosition: newPatient.isRedFlag ? 1 : mockPatientsQueue.length,
      estimatedWaitTimeMinutes: newPatient.isRedFlag ? 2 : (mockPatientsQueue.length * 5),
    });
  } catch (error: any) {
    console.error('Error submitting patient:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update consultation notes by physician
app.patch('/api/patients/:id/consultation', (req: Request, res: Response) => {
  const { id } = req.params;
  const { doctorNotes, provisionalDiagnosis, status } = req.body;
  const index = mockPatientsQueue.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  mockPatientsQueue[index] = {
    ...mockPatientsQueue[index],
    doctorNotes: doctorNotes !== undefined ? doctorNotes : mockPatientsQueue[index].doctorNotes,
    provisionalDiagnosis: provisionalDiagnosis !== undefined ? provisionalDiagnosis : mockPatientsQueue[index].provisionalDiagnosis,
    status: status || mockPatientsQueue[index].status,
  };
  res.json({ success: true, patient: mockPatientsQueue[index] });
});

// 3. Conversational Clinical History Engine (Module A)
app.post('/api/history/converse', async (req: Request, res: Response) => {
  try {
    const {
      conversation,
      latestUserMessage,
      language = 'Hindi',
      opdType = 'allopathic',
      patientData = {},
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key
    if (!apiKey) {
      const isAyush = opdType === 'ayush';
      const defaultOptions = isAyush
        ? ['भूख कम लगती है (Mandagni)', 'पेट में भारीपन रहता है', 'सुबह जोड़ों में जकड़न होती है', 'कब्ज रहती है (Krura Koshtha)']
        : ['पिछले 2-3 दिनों से है', 'दर्द बहुत तेज है (7-8/10)', 'दवा लेने पर थोड़ा आराम मिलता है', 'साथ में उल्टी/चक्कर भी है'];

      return res.json({
        aiQuestion: isAyush
          ? `नमस्ते ${patientData.name || ''} जी। आपके पाचन (अग्नि) और खान-पान के बारे में बताएं। क्या भोजन समय पर पचता है?`
          : `नमस्ते ${patientData.name || ''} जी। यह समस्या कब से शुरू हुई और क्या दर्द किसी दूसरी जगह भी फैल रहा है?`,
        aiQuestionEnglish: isAyush
          ? `Hello ${patientData.name || 'Patient'}. Please describe your digestive capacity (Agni) and dietary habits. Does your food digest smoothly?`
          : `Hello ${patientData.name || 'Patient'}. When did this symptom begin, and does the pain radiate anywhere else?`,
        suggestedOptions: defaultOptions,
        isRedFlag: Boolean(
          latestUserMessage &&
            /chest pain|severe breathless|heart attack|behosh|stroke|blood vomit|छाती में दर्द|दौरा|खून/i.test(latestUserMessage)
        ),
        redFlagReason: 'Reported severe chest distress or acute emergency symptom',
        detectedParameters: {
          onset: 'Reported recently',
          duration: 'A few days',
          severity: 'Moderate to High',
        },
      });
    }

    const ai = getAI();

    const systemPrompt = `You are "MediKiosk Clinical History AI", an intelligent, empathetic medical case-taking assistant deployed in an Indian hospital outpatient kiosk.
Target Patient Audience: Indian OPD patients of varying literacy and languages (Hindi, English, regional).
Current Session Context:
- Consultation OPD Mode: ${opdType === 'ayush' ? 'AYUSH / Ayurvedic Kayachikitsa' : 'Allopathic General Medicine'}
- Preferred Patient Language: ${language}
- Patient Profile: Age: ${patientData.age || 'Unknown'}, Gender: ${patientData.gender || 'Unknown'}, Name: ${patientData.name || 'Patient'}

Clinical Protocol:
1. Conduct a structured medical history elicitation using clinical reasoning (SOCRATES framework: Site, Onset, Character, Radiation, Associated symptoms, Timing/Duration, Exacerbating/Relieving, Severity).
${opdType === 'ayush' ? '2. For AYUSH mode: Inquire into Dashavidha Pariksha (Prakriti, Vikriti dosha imbalance, Agni - digestion fire, Koshtha - bowel habits, Ahara-Vihara - diet/lifestyle, sleep, stress).' : ''}
3. Emergency RED-FLAG Detection:
Check if the user's message indicates life-threatening emergencies (e.g. acute chest pain radiating to jaw/arm with sweating, acute dyspnea/gasping, FAST stroke signs - facial droop, arm weakness, speech slurring, massive hemoptysis, active severe bleeding, loss of consciousness).
If a red-flag is detected, flag "isRedFlag": true and provide a reassuring yet urgent triage alert to immediately notify nursing staff.
4. Keep the questions simple, clear, respectful, and compassionate. Do NOT use overly complex medical jargon in the patient prompt.
5. Provide 3 to 4 quick-tap touch options in the patient's language so elderly or low-literacy patients can either speak or tap.
6. Provide an English translation of the question for the doctor's record.

Respond ONLY with a valid JSON object matching this schema:
{
  "aiQuestion": "Question in ${language}",
  "aiQuestionEnglish": "Question in English",
  "suggestedOptions": ["Short option 1 in ${language}", "Short option 2 in ${language}", "Short option 3 in ${language}", "Short option 4 in ${language}"],
  "isRedFlag": boolean,
  "redFlagReason": "string explanation if red flag, or null",
  "priorityLevel": "EMERGENCY" | "URGENT" | "ROUTINE",
  "extractedEntities": {
    "chiefComplaint": "string or null",
    "duration": "string or null",
    "severity": "string or null",
    "associatedSymptoms": ["string"]
  }
}`;

    const promptText = `Conversation History:
${JSON.stringify(conversation || [])}

Latest Patient Spoken/Tapped Input:
"${latestUserMessage}"

Formulate the next follow-up clinical question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in history converse endpoint:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate history conversation response',
    });
  }
});

// 4. Medical Document Digitization & OCR Intelligence (Module B)
app.post('/api/documents/extract', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', documentType = 'Prescription' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return realistic mock extraction
      return res.json({
        documentTitle: 'District Govt Hospital OPD Prescription & Lab Slip',
        documentDate: '2024-03-12',
        providerName: 'Dr. S. K. Verma, MD (Med)',
        documentType: documentType,
        diagnoses: ['Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Early Diabetic Nephropathy'],
        medications: [
          { name: 'Tab Metformin', dosage: '500 mg', frequency: 'Twice daily after meals (1-0-1)', duration: '30 days' },
          { name: 'Tab Telmisartan', dosage: '40 mg', frequency: 'Once daily morning (1-0-0)', duration: '30 days' },
          { name: 'Tab Atorvastatin', dosage: '10 mg', frequency: 'At bedtime (0-0-1)', duration: '30 days' }
        ],
        labResults: [
          { testName: 'HbA1c (Glycosylated Hemoglobin)', value: '8.9', unit: '%', referenceRange: '4.0 - 5.6 %', isAbnormal: true, flag: 'HIGH' },
          { testName: 'Fasting Plasma Glucose', value: '186', unit: 'mg/dL', referenceRange: '70 - 100 mg/dL', isAbnormal: true, flag: 'HIGH' },
          { testName: 'Serum Creatinine', value: '1.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2 mg/dL', isAbnormal: true, flag: 'HIGH' },
          { testName: 'Serum Potassium', value: '4.4', unit: 'mEq/L', referenceRange: '3.5 - 5.0 mEq/L', isAbnormal: false, flag: 'NORMAL' }
        ],
        clinicalAlerts: [
          'High HbA1c (8.9%) indicates uncontrolled glycemia over past 3 months.',
          'Elevated Serum Creatinine (1.9 mg/dL) with Metformin: monitor eGFR closely for lactic acidosis risk.'
        ],
        ocrTranscription: 'Rx: Tab Metformin 500mg 1-0-1, Tab Telmisartan 40mg 1-0-0. Advise renal function test, lipid profile and urine routine.'
      });
    }

    const ai = getAI();

    // Clean base64 data if it includes data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this medical document (which may be a handwritten prescription, printed laboratory report, discharge card, or imaging report from an Indian healthcare provider).
Perform high-accuracy OCR, extract clinical entities, detect dates, recognize doctor's handwriting or printed lab values, and structure all information.
Flag any abnormal lab values outside biological reference intervals, and flag potential drug-drug interaction cautions.

Respond ONLY with a valid JSON object matching this schema:
{
  "documentTitle": "string (e.g. 'Prescription - AIIMS New Delhi' or 'Lab Report - Lal PathLabs')",
  "documentDate": "YYYY-MM-DD or estimated string",
  "providerName": "Doctor or Hospital name or 'Unknown'",
  "documentType": "Prescription" | "Lab Report" | "Discharge Summary" | "Imaging",
  "diagnoses": ["string list of identified diagnoses or provisional impressions"],
  "medications": [
    {
      "name": "Drug name",
      "dosage": "e.g. 500 mg",
      "frequency": "e.g. 1-0-1 BD or Once Daily",
      "duration": "e.g. 14 days"
    }
  ],
  "labResults": [
    {
      "testName": "e.g. Serum Creatinine",
      "value": "1.8",
      "unit": "mg/dL",
      "referenceRange": "0.7 - 1.2 mg/dL",
      "isAbnormal": true,
      "flag": "HIGH" | "LOW" | "NORMAL" | "CRITICAL"
    }
  ],
  "clinicalAlerts": ["Important alerts for the doctor, e.g. severe abnormal value or drug contraindication"],
  "ocrTranscription": "Exact or best-effort transcription of the document text"
}`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error extracting medical document:', error);
    res.status(500).json({ error: error.message || 'Failed to extract medical document' });
  }
});

// 5. Structured History Summary & FHIR Generator (Module C & D)
app.post('/api/summary/generate', async (req: Request, res: Response) => {
  try {
    const {
      patient,
      conversation,
      documents = [],
      opdType = 'allopathic',
      language = 'Hindi',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const summaryDraft = {
        chiefComplaint: patient?.chiefComplaint || 'Persistent symptoms under clinical review',
        hpi: `Patient ${patient?.name || 'Unknown'}, a ${patient?.age || '50'}-year-old ${patient?.gender || 'patient'}, presented to the OPD complaining of ${patient?.chiefComplaint || 'generalized weakness and acute discomfort'}. Chronological narration indicates progressive onset with functional interference.`,
        pastMedicalHistory: 'Hypertension, Dyslipidemia. No prior major surgical interventions reported.',
        medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD'],
        allergies: ['No known allergies documented (NKDA)'],
        familyHistory: 'Non-contributory for early cardiovascular or genetic conditions.',
        personalHistory: 'Non-smoker, non-alcoholic. Moderate physical activity.',
        reviewOfSystems: 'Negative for acute fever, syncope, focal neurological deficit.',
        dashavidhaPariksha: opdType === 'ayush' ? {
          prakriti: 'Vata-Pitta',
          vikriti: 'Pitta-Vata imbalance',
          agni: 'Tikshnagni / Vishamagni',
          koshtha: 'Madhyama',
          sara: 'Madhyama',
          samhanana: 'Madhyama',
          pramana: 'Prakrita',
          satmya: 'Sarva Rasa',
          sattva: 'Pravara',
          aharaShakti: 'Madhyama',
          vyayamaShakti: 'Madhyama',
          vaya: 'Madhyama'
        } : undefined,
        abnormalFindings: ['Creatinine 1.8 mg/dL [Elevated]', 'HbA1c 8.4% [Uncontrolled]'],
        patientAudioConfirmationText: `श्रीमान ${patient?.name || ''}, आपकी पूरी मेडिकल हिस्ट्री और रिपोर्ट दर्ज कर ली गई हैं। डॉक्टर साहब के स्क्रीन पर यह तैयार है। कृपया परामर्श कक्ष में पधारें।`
      };

      const fhirBundle = generateFHIRBundle(patient, summaryDraft);
      return res.json({ summary: summaryDraft, fhirBundle });
    }

    const ai = getAI();

    const systemPrompt = `You are an expert Chief Medical Officer and Clinical AI Informatician.
Your job is to synthesize free-form conversational history and OCR-extracted medical documents from an Indian hospital intake kiosk into an impeccably structured, physician-ready consultation summary and an ABDM-compliant FHIR clinical summary.

Inputs:
- Patient Demographics: ${JSON.stringify(patient)}
- OPD Framework: ${opdType === 'ayush' ? 'AYUSH (Ayurvedic Intake with Dashavidha Pariksha)' : 'Allopathic Clinical Intake'}
- Conversation Transcript: ${JSON.stringify(conversation)}
- Digitized Prior Documents: ${JSON.stringify(documents)}
- Output Language for Patient Confirmation: ${language}

Strict Rules:
- The physician summary MUST be in concise, professional medical English.
- Separate Chief Complaint, HPI (History of Present Illness), Past Medical/Surgical History, Drug & Allergy History, Family History, Personal History, Review of Systems (ROS), and Prior Investigation Findings.
- If AYUSH mode, include Dashavidha Pariksha (Prakriti, Vikriti, Agni, Koshtha, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya) and Ahara-Vihara assessment.
- Highlight out-of-range lab findings or critical drug alerts in "abnormalFindings".
- Generate "patientAudioConfirmationText" in ${language} so the kiosk can read back a brief 2-sentence confirmation to the patient.

Respond ONLY with valid JSON matching:
{
  "summary": {
    "chiefComplaint": "string",
    "hpi": "string (structured clinical paragraph)",
    "pastMedicalHistory": "string",
    "medications": ["string"],
    "allergies": ["string"],
    "familyHistory": "string",
    "personalHistory": "string",
    "reviewOfSystems": "string",
    "dashavidhaPariksha": {
      "prakriti": "string",
      "vikriti": "string",
      "agni": "string",
      "koshtha": "string",
      "sara": "string",
      "samhanana": "string",
      "pramana": "string",
      "satmya": "string",
      "sattva": "string",
      "aharaShakti": "string",
      "vyayamaShakti": "string",
      "vaya": "string"
    },
    "abnormalFindings": ["string"],
    "patientAudioConfirmationText": "string in ${language}"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Generate clinical summary from provided session data.',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const fhirBundle = generateFHIRBundle(patient, parsed.summary);

    res.json({
      summary: parsed.summary,
      fhirBundle: fhirBundle,
    });
  } catch (error: any) {
    console.error('Error generating structured summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

// Helper to generate FHIR standard JSON bundle for ABDM compliance
function generateFHIRBundle(patient: any, summary: any) {
  const patientId = patient?.id || `pat-${Date.now()}`;
  const abhaId = patient?.abhaId || '91-0000-0000-0000';
  const bundleId = `bundle-${Date.now()}`;
  const nowIso = new Date().toISOString();

  return {
    resourceType: 'Bundle',
    id: bundleId,
    meta: {
      versionId: '1',
      lastUpdated: nowIso,
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifact'],
    },
    identifier: {
      system: 'https://abdm.gov.in/bundle',
      value: bundleId,
    },
    type: 'document',
    timestamp: nowIso,
    entry: [
      {
        fullUrl: `urn:uuid:${patientId}`,
        resource: {
          resourceType: 'Patient',
          id: patientId,
          identifier: [
            {
              type: {
                coding: [
                  {
                    system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code',
                    code: 'ABHA',
                    display: 'Ayushman Bharat Health Account',
                  },
                ],
              },
              system: 'https://healthid.abdm.gov.in',
              value: abhaId,
            },
          ],
          name: [{ text: patient?.name || 'Patient Name' }],
          telecom: [{ system: 'phone', value: patient?.phone || '+91 0000000000' }],
          gender: (patient?.gender || 'unknown').toLowerCase(),
          birthDate: patient?.age ? `${new Date().getFullYear() - Number(patient.age)}-01-01` : undefined,
        },
      },
      {
        fullUrl: `urn:uuid:condition-${Date.now()}`,
        resource: {
          resourceType: 'Condition',
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }],
          },
          code: {
            text: summary?.chiefComplaint || patient?.chiefComplaint || 'Unspecified complaint',
          },
          subject: { reference: `urn:uuid:${patientId}` },
        },
      },
      {
        fullUrl: `urn:uuid:encounter-${Date.now()}`,
        resource: {
          resourceType: 'Encounter',
          status: 'in-progress',
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: 'ambulatory',
          },
          subject: { reference: `urn:uuid:${patientId}` },
          reasonCode: [{ text: summary?.chiefComplaint || 'OPD Consultation' }],
        },
      },
    ],
  };
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediKiosk Server running on port ${PORT}`);
  });
}

startServer();
