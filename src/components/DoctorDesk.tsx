import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  AlertTriangle,
  User,
  Activity,
  CheckCircle2,
  FileText,
  Pill,
  Printer,
  Sparkles,
  RefreshCw,
  Edit3,
  Send,
  Leaf,
  Layers,
  Code,
  Check,
} from 'lucide-react';
import { MedicationItem } from '../types';

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
  status: string;
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

export const DoctorDesk: React.FC = () => {
  const [patients, setPatients] = useState<PatientQueueItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'documents' | 'ayush' | 'fhir' | 'notes'>('summary');
  const [isLoading, setIsLoading] = useState(false);

  // Doctor's editable fields
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<MedicationItem[]>([
    { name: 'Tab Amlodipine', dosage: '5 mg', frequency: '1-0-0 (Morning)', duration: '30 days' },
    { name: 'Tab Metformin SR', dosage: '500 mg', frequency: '1-0-1 (After meals)', duration: '30 days' },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');
  const [isHisPushed, setIsHisPushed] = useState(false);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (data.patients && data.patients.length > 0) {
        setPatients(data.patients);
        if (!selectedPatientId) {
          // Select highest priority or first patient
          const emergencyPatient = data.patients.find((p: PatientQueueItem) => p.isRedFlag);
          setSelectedPatientId(emergencyPatient ? emergencyPatient.id : data.patients[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching patient queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Update default diagnoses when current patient changes
  useEffect(() => {
    if (currentPatient) {
      setProvisionalDiagnosis(
        currentPatient.provisionalDiagnosis ||
          (currentPatient.isRedFlag
            ? 'Acute Coronary Syndrome (Suspected STEMI / NSTEMI) - Urgent ECG & Troponin'
            : currentPatient.opdType === 'ayush'
            ? 'Amavata (Vata-Kapha Prakopa) with Agnimandya'
            : 'Uncontrolled Type 2 Diabetes Mellitus with Peripheral Neuropathy')
      );
      setClinicalNotes(
        currentPatient.doctorNotes ||
          'Patient intake validated. History elicited via MediKiosk self-service terminal. Vital signs taken: BP 150/94 mmHg, Pulse 86 bpm, SpO2 97%.'
      );
      setIsHisPushed(false);
    }
  }, [currentPatient?.id]);

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    setPrescriptions((prev) => [
      ...prev,
      {
        name: newMedName.trim(),
        dosage: newMedDose.trim() || 'Standard dose',
        frequency: newMedFreq.trim() || '1-0-1',
        duration: '14 days',
      },
    ]);
    setNewMedName('');
    setNewMedDose('');
    setNewMedFreq('');
  };

  const handlePushToHIS = async () => {
    if (!currentPatient) return;
    try {
      await fetch(`/api/patients/${currentPatient.id}/consultation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorNotes: clinicalNotes,
          provisionalDiagnosis: provisionalDiagnosis,
          status: 'Completed',
        }),
      });
      setIsHisPushed(true);
      fetchQueue();
    } catch (err) {
      console.error('Error updating patient notes:', err);
    }
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  return (
    <div id="doctor-opd-desk-container" className="max-w-7xl mx-auto space-y-5">
      {/* Top Bar for Doctor Desk */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Physician OPD Consultation Desk</h2>
              <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                Room 108 • Dr. S. K. Verma, MD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live synchronized intake from MediKiosk terminals • 10-second history review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQueue}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left = Queue, Right = Clinical Intake Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              OPD Patient Queue ({patients.length})
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Auto-refreshes every 15s
            </span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {patients.map((pat) => {
              const isSelected = pat.id === currentPatient?.id;
              return (
                <div
                  key={pat.id}
                  id={`queue-patient-${pat.id}`}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-400/20 shadow-xs'
                      : pat.isRedFlag
                      ? 'bg-red-50/60 border-red-300 hover:border-red-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {pat.tokenNumber}
                      </span>
                      <span className="font-bold text-sm text-slate-900 line-clamp-1">
                        {pat.name}
                      </span>
                    </div>

                    {pat.isRedFlag ? (
                      <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        RED FLAG
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {pat.timestamp}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 mt-1.5 line-clamp-1 font-medium">
                    {pat.chiefComplaint}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 border-t border-slate-100 pt-2">
                    <span>
                      {pat.age}y / {pat.gender} • {pat.opdType.toUpperCase()}
                    </span>
                    <span
                      className={`font-semibold ${
                        pat.status === 'Completed' ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {pat.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Complete Structured Intake Summary (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {currentPatient ? (
            <>
              {/* Patient Banner */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-lg">
                      {currentPatient.tokenNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{currentPatient.name}</h3>
                    <span className="text-xs text-slate-600">
                      ({currentPatient.age} yrs, {currentPatient.gender})
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                      ABHA: {currentPatient.abhaId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Dept: {currentPatient.department} • Language: {currentPatient.language} • Contact:{' '}
                    {currentPatient.phone}
                  </p>
                </div>

                {currentPatient.isRedFlag && (
                  <div className="bg-red-100 border border-red-300 text-red-900 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>PRIORITY EMERGENCY: Immediate evaluation indicated</span>
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 bg-white px-6 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeTab === 'summary'
                      ? 'border-sky-500 text-sky-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Structured History
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeTab === 'documents'
                      ? 'border-sky-500 text-sky-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Prior Records & Labs ({currentPatient.extractedDocuments?.length || 0})
                </button>

                {currentPatient.opdType === 'ayush' && (
                  <button
                    onClick={() => setActiveTab('ayush')}
                    className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'ayush'
                        ? 'border-emerald-600 text-emerald-800 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Dashavidha Pariksha
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-sky-500 text-sky-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Doctor Prescription & Plan
                </button>

                <button
                  onClick={() => setActiveTab('fhir')}
                  className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeTab === 'fhir'
                      ? 'border-sky-500 text-sky-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ABDM FHIR R4 Bundle
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="p-6 overflow-y-auto max-h-[500px] space-y-4">
                {/* Tab 1: Structured Clinical History */}
                {activeTab === 'summary' && (
                  <div className="space-y-4 text-xs text-slate-700">
                    {/* Chief Complaint */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        1. Presenting Complaint (Chief Complaint)
                      </span>
                      <p className="font-bold text-sm text-slate-900">
                        {currentPatient.historySummary?.chiefComplaint || currentPatient.chiefComplaint}
                      </p>
                    </div>

                    {/* HPI */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        2. History of Present Illness (HPI - SOCRATES Format)
                      </span>
                      <p className="leading-relaxed text-slate-800">
                        {currentPatient.historySummary?.hpi ||
                          'Patient presented with progressive symptoms over recent weeks. Elicited through voice intake with temporal markers and severity assessment.'}
                      </p>
                    </div>

                    {/* Past Medical / Surgical */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          3. Past Medical & Surgical History
                        </span>
                        <p className="text-slate-800">
                          {currentPatient.historySummary?.pastHistory ||
                            currentPatient.historySummary?.pastMedicalHistory ||
                            'Hypertension, Type 2 Diabetes Mellitus.'}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          4. Drug & Known Allergies
                        </span>
                        <div className="text-slate-800 space-y-1">
                          <p>
                            <span className="font-semibold">Allergies:</span>{' '}
                            <span className="text-rose-700 font-bold">
                              {currentPatient.historySummary?.allergies?.join(', ') || 'NKDA'}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">Current Medications:</span>{' '}
                            {currentPatient.historySummary?.medications?.join(', ') ||
                              'Metformin 500mg, Telmisartan 40mg'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Family & Personal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          5. Family History
                        </span>
                        <p className="text-slate-800">
                          {currentPatient.historySummary?.familyHistory ||
                            'Father had early cardiovascular event; non-contributory for renal disorders.'}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          6. Personal & Habit History
                        </span>
                        <p className="text-slate-800">
                          {currentPatient.historySummary?.personalHistory ||
                            'Mixed diet, tobacco chewer 15 yrs, sedentary occupation.'}
                        </p>
                      </div>
                    </div>

                    {/* Review of Systems */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        7. Review of Systems (ROS)
                      </span>
                      <p className="text-slate-800">
                        {currentPatient.historySummary?.ros ||
                          currentPatient.historySummary?.reviewOfSystems ||
                          'Cardiovascular: Exertional chest tightness. Neuro: Distal lower-limb paresthesia. Negative for focal deficit or syncope.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Digitized Prior Records & Labs */}
                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">
                      Timeline of Digitized Documents ({currentPatient.extractedDocuments?.length || 0})
                    </h4>
                    {currentPatient.extractedDocuments &&
                    currentPatient.extractedDocuments.length > 0 ? (
                      currentPatient.extractedDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="font-bold text-slate-900">{doc.title}</span>
                            <span className="text-slate-500">{doc.date}</span>
                          </div>
                          {doc.clinicalAlerts && doc.clinicalAlerts.length > 0 && (
                            <div className="bg-amber-100/70 text-amber-900 p-2 rounded-lg text-[11px] font-semibold">
                              ⚠️ {doc.clinicalAlerts.join('; ')}
                            </div>
                          )}
                          {doc.labResults && doc.labResults.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {doc.labResults.map((l: any, i: number) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded-lg border ${
                                    l.isAbnormal
                                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div>{l.testName}</div>
                                  <div className="text-sm">
                                    {l.value} {l.unit} {l.isAbnormal && `[${l.flag}]`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No prior paper documents scanned in this kiosk session.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab 3: AYUSH Dashavidha Pariksha */}
                {activeTab === 'ayush' && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-700" />
                        <span className="text-xs font-bold text-emerald-900">
                          Dashavidha & Trividha Ayurvedic Pariksha Assessment
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        Charaka Samhita Protocol
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          1. Prakriti (Constitution)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {currentPatient.historySummary?.dashavidhaPariksha?.prakriti ||
                            'Vata-Kapha Pradhana'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          2. Vikriti (Imbalance)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {currentPatient.historySummary?.dashavidhaPariksha?.vikriti ||
                            'Kapha-Vataja Amavata with Sama Pitta'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          3. Agni (Digestive Fire)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {currentPatient.historySummary?.dashavidhaPariksha?.agni ||
                            'Mandagni (sluggish digestive fire with Ama formation)'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          4. Koshtha (Bowel Habits)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {currentPatient.historySummary?.dashavidhaPariksha?.koshtha ||
                            'Krura Koshtha (constipation / hard stools)'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          5. Sara (Tissue Excellence)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {currentPatient.historySummary?.dashavidhaPariksha?.sara ||
                            'Madhyama Asthi & Medo Sara'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          6. Ahara & Vyayama Shakti
                        </span>
                        <span className="font-semibold text-slate-800">
                          {currentPatient.historySummary?.dashavidhaPariksha?.aharaShakti ||
                            'Avara (low digestive endurance)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Doctor Prescription & Plan */}
                {activeTab === 'notes' && (
                  <div className="space-y-4 text-xs text-slate-800">
                    <div>
                      <label className="block font-bold text-xs text-slate-700 mb-1">
                        Provisional Diagnosis (Doctor Confirmed)
                      </label>
                      <input
                        type="text"
                        value={provisionalDiagnosis}
                        onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-xs text-slate-700 mb-1">
                        Clinical Examination & Case Notes (Editable)
                      </label>
                      <textarea
                        rows={4}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Prescriptions Table */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-700">
                          Prescription / Rx Orders ({prescriptions.length})
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden mb-3">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Drug</th>
                              <th className="p-2.5">Dose</th>
                              <th className="p-2.5">Timing</th>
                              <th className="p-2.5">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {prescriptions.map((p, i) => (
                              <tr key={i}>
                                <td className="p-2.5 font-bold">{p.name}</td>
                                <td className="p-2.5">{p.dosage}</td>
                                <td className="p-2.5 text-sky-800 font-semibold">{p.frequency}</td>
                                <td className="p-2.5 text-slate-600">{p.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Add new drug */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={newMedName}
                          onChange={(e) => setNewMedName(e.target.value)}
                          className="px-3.5 py-2 rounded-2xl border border-slate-300 text-xs flex-1 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 500mg)"
                          value={newMedDose}
                          onChange={(e) => setNewMedDose(e.target.value)}
                          className="px-3.5 py-2 rounded-2xl border border-slate-300 text-xs w-32 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          placeholder="Freq (e.g. 1-0-1)"
                          value={newMedFreq}
                          onChange={(e) => setNewMedFreq(e.target.value)}
                          className="px-3.5 py-2 rounded-2xl border border-slate-300 text-xs w-28 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                        />
                        <button
                          onClick={handleAddMedication}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          + Add Drug
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: ABDM FHIR JSON Bundle */}
                {activeTab === 'fhir' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-sky-600" />
                        ABDM FHIR R4 Clinical Artifact (NRCES Standard)
                      </span>
                      <span className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                        Ready for ABDM Health Information Exchange (HIE-CM)
                      </span>
                    </div>
                    <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto overflow-x-auto">
                      {JSON.stringify(
                        currentPatient.fhirBundle || {
                          resourceType: 'Bundle',
                          id: `bundle-${currentPatient.id}`,
                          type: 'document',
                          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifact'],
                          entry: [{ resourceType: 'Patient', id: currentPatient.id, name: currentPatient.name }],
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              {/* Doctor Consultation Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintPrescription}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print Consultation Slip</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isHisPushed ? (
                    <span className="px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                      <Check className="w-4 h-4" />
                      Pushed to HIS & ABDM EMR
                    </span>
                  ) : (
                    <button
                      id="save-consultation-his-btn"
                      onClick={handlePushToHIS}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                      <span>Confirm, Sign & Push to Hospital HIS</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select a patient from the queue to review their clinical history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
