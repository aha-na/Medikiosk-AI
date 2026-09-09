import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Printer,
  Sparkles,
  Volume2,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Clock,
  User,
  Activity,
  AlertTriangle,
  RefreshCw,
  Share2,
} from 'lucide-react';
import {
  AbhaProfile,
  OpdType,
  Language,
  MedicalDocument,
  PhysicianSummary,
  TriagePriority,
} from '../types';
import { speakText } from '../utils/speech';

interface Step4SummaryProps {
  profile: AbhaProfile;
  opdType: OpdType;
  department: string;
  language: Language;
  audioEnabled: boolean;
  documents: MedicalDocument[];
  isRedFlag: boolean;
  redFlagReason?: string;
  onOpenDoctorDesk: () => void;
  onStartNewIntake: () => void;
}

export const Step4Summary: React.FC<Step4SummaryProps> = ({
  profile,
  opdType,
  department,
  language,
  audioEnabled,
  documents,
  isRedFlag,
  redFlagReason,
  onOpenDoctorDesk,
  onStartNewIntake,
}) => {
  const [tokenNumber, setTokenNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [summaryData, setSummaryData] = useState<PhysicianSummary | null>(null);
  const [fhirBundle, setFhirBundle] = useState<any>(null);

  useEffect(() => {
    // Generate token and room details
    const prefix = opdType === 'ayush' ? 'AYU' : 'OPD';
    const num = isRedFlag ? '001-EMG' : String(Math.floor(100 + Math.random() * 900));
    const token = `${prefix}-${num}`;
    setTokenNumber(token);

    if (opdType === 'ayush') {
      setRoomNumber('Room 204 (Kayachikitsa)');
      setAssignedDoctor('Dr. Vaidya K. N. Sharma, BAMS, MD (Ayu)');
    } else if (isRedFlag) {
      setRoomNumber('Room 101 (Emergency Triage / Resus Bay)');
      setAssignedDoctor('Dr. Ananya Ray, MD (Emergency Medicine)');
    } else {
      setRoomNumber('Room 108 (Internal Medicine)');
      setAssignedDoctor('Dr. S. K. Verma, MD (Gen Med)');
    }

    // Call server to synthesize final summary and FHIR bundle
    async function fetchSummary() {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/summary/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient: {
              ...profile,
              tokenNumber: token,
              department,
              opdType,
            },
            documents,
            opdType,
            language,
          }),
        });
        const data = await res.json();
        setSummaryData(data.summary);
        setFhirBundle(data.fhirBundle);

        // Also push into Hospital queue endpoint
        await fetch('/api/patients/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile.fullName,
            age: profile.age,
            gender: profile.gender,
            phone: profile.phone,
            abhaId: profile.abhaId,
            department,
            opdType,
            language,
            chiefComplaint: data.summary?.chiefComplaint || 'Intake via MediKiosk',
            historySummary: data.summary,
            extractedDocuments: documents,
            fhirBundle: data.fhirBundle,
            isRedFlag,
            redFlagDetails: redFlagReason,
          }),
        });

        // Speak confirmation
        if (audioEnabled && data.summary?.patientAudioConfirmationText) {
          speakText(data.summary.patientAudioConfirmationText, language);
        }
      } catch (err) {
        console.error('Error generating summary:', err);
      } finally {
        setIsSubmitting(false);
      }
    }

    fetchSummary();
  }, [opdType, isRedFlag, profile]);

  const handlePrintToken = () => {
    window.print();
  };

  return (
    <div id="step-4-summary-container" className="max-w-4xl mx-auto space-y-6">
      {/* Top Completion Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Case-Taking Complete & Synchronized with HIS
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-xl mx-auto leading-relaxed">
            Your clinical history, symptom interview, and scanned prescriptions have been compiled
            into a physician-ready summary and pushed directly to the consultation room screen.
          </p>
        </div>
      </div>

      {/* The Printable Kiosk Token Slip */}
      <div
        id="kiosk-token-slip"
        className="bg-white rounded-3xl border-2 border-dashed border-sky-500/60 p-8 shadow-xs max-w-lg mx-auto relative overflow-hidden"
      >
        <div className="border-b border-slate-200 pb-4 text-center">
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Central District Govt Hospital • OPD INTAKE
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {opdType === 'ayush' ? 'AYUSH Ayurvedic OPD' : 'General Outpatient Department'}
          </h3>
          <span className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2.5 py-0.5 rounded-full inline-block mt-1.5 border border-sky-100">
            Linked to ABHA: {profile.abhaId}
          </span>
        </div>

        <div className="py-6 text-center space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
            Your Token Number (टोकन नंबर)
          </span>
          <div
            className={`text-5xl font-black tracking-tight ${
              isRedFlag ? 'text-red-600 animate-pulse' : 'text-slate-900'
            }`}
          >
            {tokenNumber || 'OPD-042'}
          </div>
          {isRedFlag ? (
            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full border border-red-300 mt-2">
              🚨 PRIORITY EMERGENCY TRIAGE • IMMEDIATE CARE
            </span>
          ) : (
            <span className="text-xs text-slate-600 font-medium block mt-1">
              Estimated Wait Time: ~5 to 8 minutes
            </span>
          )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 space-y-2.5 text-xs text-slate-700 border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient:</span>
            <span className="font-bold text-slate-900">{profile.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Age / Gender:</span>
            <span className="font-medium text-slate-800">
              {profile.age} yrs / {profile.gender}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultation Room:</span>
            <span className="font-bold text-sky-800">{roomNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Physician:</span>
            <span className="font-medium text-slate-800">{assignedDoctor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Scanned Documents:</span>
            <span className="font-medium text-slate-800">{documents.length} verified records attached</span>
          </div>
        </div>

        {/* DPDP Act Purge confirmation */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
          DPDP Act 2023 Compliant: All temporary kiosk terminal recordings purged upon submission.
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={handlePrintToken}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Token Slip</span>
          </button>
        </div>
      </div>

      {/* Action to Switch into Doctor's View */}
      <div className="bg-slate-900 rounded-3xl p-7 text-white flex flex-wrap items-center justify-between gap-5 shadow-xs border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full font-bold">
              PHYSICIAN OPD DESK SIMULATION
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Experience the Doctor's 10-Second Intake View</h3>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            Switch to the Doctor's screen to see how the physician reviews this complete structured
            history, abnormal lab timeline, and AYUSH Dashavidha chart.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartNewIntake}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors border border-slate-700"
          >
            New Patient Kiosk Intake
          </button>
          <button
            id="switch-to-doctor-desk-btn"
            onClick={onOpenDoctorDesk}
            className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Open Doctor's Screen →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
