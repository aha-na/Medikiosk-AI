import React from 'react';
import {
  Volume2,
  VolumeX,
  Languages,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Tv,
  Bell,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  currentView: 'kiosk' | 'doctor' | 'triage';
  onSelectView: (view: 'kiosk' | 'doctor' | 'triage') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  redFlagCount: number;
  onTriggerEmergencyHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  language,
  onLanguageChange,
  audioEnabled,
  onToggleAudio,
  highContrast,
  onToggleHighContrast,
  redFlagCount,
  onTriggerEmergencyHelp,
}) => {
  const languagesList: Language[] = [
    'Hindi',
    'English',
    'Tamil',
    'Telugu',
    'Bengali',
    'Marathi',
    'Gujarati',
    'Kannada',
  ];

  const languageLabels: Record<Language, string> = {
    Hindi: 'हिंदी (Hindi)',
    English: 'English',
    Tamil: 'தமிழ் (Tamil)',
    Telugu: 'తెలుగు (Telugu)',
    Bengali: 'বাংলা (Bengali)',
    Marathi: 'मराठी (Marathi)',
    Gujarati: 'ગુજરાતી (Gujarati)',
    Kannada: 'ಕನ್ನಡ (Kannada)',
  };

  return (
    <header
      id="main-app-header"
      className={`border-b transition-colors ${
        highContrast
          ? 'bg-slate-950 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-800'
      } sticky top-0 z-50 shadow-2xs`}
    >
      {/* Top ABDM and Govt Health Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1.5 text-xs font-medium flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border border-sky-500/30">
            ABDM & DPDP ACT 2023
          </span>
          <span className="hidden md:inline text-slate-400">
            National Health Authority • Ayushman Bharat Digital Mission (FHIR R4)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            Kiosk #04 • Central OPD
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <button
            id="emergency-staff-alert-btn"
            onClick={onTriggerEmergencyHelp}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight cursor-pointer transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Emergency Alert</span>
            </span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-xs">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                MediKiosk<span className="text-sky-500">AI</span>
              </h1>
              <span className="hidden sm:inline text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                Clinical Intake
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multimodal Clinical History & Document Intelligence • Allopathy & AYUSH
            </p>
          </div>
        </div>

        {/* View Switcher: Patient Kiosk vs Doctor OPD vs Nurse Triage */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <button
            id="view-tab-kiosk"
            onClick={() => onSelectView('kiosk')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'kiosk'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span>Patient Kiosk</span>
          </button>

          <button
            id="view-tab-doctor"
            onClick={() => onSelectView('doctor')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'doctor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
            <span>Doctor OPD Desk</span>
          </button>

          <button
            id="view-tab-triage"
            onClick={() => onSelectView('triage')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer relative ${
              currentView === 'triage'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-red-500" />
            <span>Triage Board</span>
            {redFlagCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {redFlagCount}
              </span>
            )}
          </button>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-2.5">
          {/* Audio Prompt Reader Toggle */}
          <button
            id="toggle-audio-prompt-btn"
            onClick={onToggleAudio}
            title={audioEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              audioEnabled
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Voice Muted</span>
              </>
            )}
          </button>

          {/* High Contrast / Text Size */}
          <button
            id="toggle-contrast-btn"
            onClick={onToggleHighContrast}
            title="Toggle High Contrast"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
              highContrast
                ? 'bg-slate-800 text-sky-400 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            A+
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Language:</span>
            <select
              id="language-select-dropdown"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {languagesList.map((lang) => (
                <option key={lang} value={lang}>
                  {languageLabels[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
