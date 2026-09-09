import React, { useState } from 'react';
import {
  Tv,
  Stethoscope,
  Bell,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  User,
  MessageSquare,
  FileText,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Header } from './components/Header';
import { Step1Identify } from './components/Step1Identify';
import { Step2Converse } from './components/Step2Converse';
import { Step3ScanDocs } from './components/Step3ScanDocs';
import { Step4Summary } from './components/Step4Summary';
import { DoctorDesk } from './components/DoctorDesk';
import { NurseTriage } from './components/NurseTriage';
import { ConsentModal } from './components/ConsentModal';
import {
  AbhaProfile,
  OpdType,
  Language,
  MedicalDocument,
} from './types';
import { PRESET_SCENARIOS } from './data/samplePatients';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';

export default function App() {
  const [currentView, setCurrentView] = useState<'kiosk' | 'doctor' | 'triage'>('kiosk');
  const [kioskStep, setKioskStep] = useState<1 | 2 | 3 | 4>(1);
  const [language, setLanguage] = useState<Language>('Hindi');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Active Patient Profile state
  const defaultScenario = PRESET_SCENARIOS[0];
  const [profile, setProfile] = useState<AbhaProfile>(defaultScenario.profile);
  const [opdType, setOpdType] = useState<OpdType>(defaultScenario.opdType);
  const [department, setDepartment] = useState('General Medicine / Cardiology');
  const [documents, setDocuments] = useState<MedicalDocument[]>([SAMPLE_DOCUMENTS[0]]);

  // Emergency Red Flag triage state
  const [isRedFlag, setIsRedFlag] = useState(true); // Default to True from initial preset Rameshwar Prasad to demonstrate critical triage
  const [redFlagReason, setRedFlagReason] = useState<string | undefined>(
    'Acute retrosternal crushing chest pain with left arm radiation and cold sweating'
  );

  const handleTriggerEmergencyHelp = () => {
    setIsRedFlag(true);
    setRedFlagReason('Patient or caregiver activated Emergency Staff Assistance button on terminal.');
    setCurrentView('triage');
  };

  const handleStartNewIntake = () => {
    const randomScenario = PRESET_SCENARIOS[1]; // Sunita Devi
    setProfile(randomScenario.profile);
    setOpdType(randomScenario.opdType);
    setDepartment('General Medicine & Diabetology');
    setDocuments([SAMPLE_DOCUMENTS[1]]);
    setIsRedFlag(false);
    setRedFlagReason(undefined);
    setKioskStep(1);
    setCurrentView('kiosk');
  };

  const stepsList = [
    { num: 1, stepKey: '01', label: 'Identification', desc: 'ABHA & Demographics' },
    { num: 2, stepKey: '02', label: 'History Taking', desc: 'Voice & Touch Clinical' },
    { num: 3, stepKey: '03', label: 'Document Scan', desc: 'Prescription & Lab OCR' },
    { num: 4, stepKey: '04', label: 'Summary & Token', desc: 'Physician Handoff' },
  ];

  return (
    <div
      id="medikiosk-app-root"
      className={`min-h-screen flex flex-col font-sans ${
        highContrast ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Universal Navigation Header */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        language={language}
        onLanguageChange={setLanguage}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        redFlagCount={isRedFlag ? 1 : 0}
        onTriggerEmergencyHelp={handleTriggerEmergencyHelp}
      />

      {/* Main Body */}
      {currentView === 'kiosk' ? (
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto overflow-hidden">
          {/* Geometric Balance Sidebar for Kiosk */}
          <aside className="w-full lg:w-72 bg-slate-900 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 text-white shrink-0">
            {/* Sidebar Branding (Desktop) */}
            <div className="p-6 hidden lg:block border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-xs">
                  MK
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl tracking-tight">
                    MediKiosk<span className="text-sky-500">AI</span>
                  </h1>
                  <p className="text-[11px] text-slate-400">OPD Clinical Intake</p>
                </div>
              </div>
            </div>

            {/* Geometric Stepper Navigation */}
            <nav className="p-4 lg:p-6 space-y-2.5 flex-1 overflow-x-auto lg:overflow-x-visible flex lg:flex-col gap-2 lg:gap-0">
              {stepsList.map((st) => {
                const isActive = kioskStep === st.num;
                const isCompleted = kioskStep > st.num;
                return (
                  <button
                    key={st.num}
                    id={`kiosk-nav-step-${st.num}`}
                    onClick={() => setKioskStep(st.num as any)}
                    className={`flex items-center p-3 rounded-xl space-x-3 text-left w-full cursor-pointer transition-all shrink-0 sm:shrink ${
                      isActive
                        ? 'bg-sky-600/15 text-sky-400 border border-sky-500/40 shadow-xs'
                        : isCompleted
                        ? 'bg-slate-800 text-white hover:bg-slate-800/80 border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent opacity-70'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                          : isCompleted
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                          : 'border-slate-700 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : st.stepKey}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs sm:text-sm block truncate">
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden lg:block">
                        {st.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Active ABHA Session Geometric Card */}
            <div className="p-4 lg:p-6 border-t border-slate-800">
              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/60 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Active ABHA Session
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-white font-mono text-xs sm:text-sm mb-1 font-bold truncate">
                  {profile.abhaId || '91-8823-1102-4456'}
                </p>
                <p className="text-sky-400 text-xs font-medium truncate">
                  {profile.fullName || 'Registered Patient'} ({profile.gender?.[0] || 'M'}, {profile.age || 45})
                </p>
              </div>
            </div>
          </aside>

          {/* Main Kiosk Content Area */}
          <section className="flex-1 flex flex-col bg-white overflow-hidden p-4 sm:p-6 lg:p-8">
            {/* Step 1: Identify */}
            {kioskStep === 1 && (
              <Step1Identify
                profile={profile}
                onUpdateProfile={setProfile}
                opdType={opdType}
                onChangeOpdType={setOpdType}
                department={department}
                onChangeDepartment={setDepartment}
                language={language}
                onProceed={() => setKioskStep(2)}
                onRequestConsent={() => setIsConsentModalOpen(true)}
              />
            )}

            {/* Step 2: Conversational Engine */}
            {kioskStep === 2 && (
              <Step2Converse
                profile={profile}
                opdType={opdType}
                department={department}
                language={language}
                audioEnabled={audioEnabled}
                onProceedToScan={() => setKioskStep(3)}
                onSetRedFlag={(flag, reason) => {
                  setIsRedFlag(flag);
                  setRedFlagReason(reason);
                }}
                isRedFlag={isRedFlag}
                redFlagReason={redFlagReason}
              />
            )}

            {/* Step 3: Scan Documents */}
            {kioskStep === 3 && (
              <Step3ScanDocs
                documents={documents}
                onUpdateDocuments={setDocuments}
                onProceedToSummary={() => setKioskStep(4)}
                onBackToConverse={() => setKioskStep(2)}
              />
            )}

            {/* Step 4: Summary & Token */}
            {kioskStep === 4 && (
              <Step4Summary
                profile={profile}
                opdType={opdType}
                department={department}
                language={language}
                audioEnabled={audioEnabled}
                documents={documents}
                isRedFlag={isRedFlag}
                redFlagReason={redFlagReason}
                onOpenDoctorDesk={() => setCurrentView('doctor')}
                onStartNewIntake={handleStartNewIntake}
              />
            )}
          </section>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* VIEW 2: Doctor's Consultation OPD Desk */}
          {currentView === 'doctor' && <DoctorDesk />}

          {/* VIEW 3: Emergency Nurse Triage Board */}
          {currentView === 'triage' && <NurseTriage />}
        </main>
      )}

      {/* Informed DPDP Act 2023 Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onAccept={() => {
          setIsConsentModalOpen(false);
          setProfile((prev) => ({
            ...prev,
            consentGranted: true,
            consentTimestamp: new Date().toISOString(),
          }));
        }}
        patientName={profile.fullName}
        language={language}
      />
    </div>
  );
}
