import React, { useState } from 'react';
import {
  QrCode,
  CreditCard,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Leaf,
  Info,
  Layers,
} from 'lucide-react';
import { AbhaProfile, OpdType, Language } from '../types';
import { PRESET_SCENARIOS, PresetScenario } from '../data/samplePatients';

interface Step1IdentifyProps {
  profile: AbhaProfile;
  onUpdateProfile: (profile: AbhaProfile) => void;
  opdType: OpdType;
  onChangeOpdType: (type: OpdType) => void;
  department: string;
  onChangeDepartment: (dept: string) => void;
  language: Language;
  onProceed: () => void;
  onRequestConsent: () => void;
}

export const Step1Identify: React.FC<Step1IdentifyProps> = ({
  profile,
  onUpdateProfile,
  opdType,
  onChangeOpdType,
  department,
  onChangeDepartment,
  language,
  onProceed,
  onRequestConsent,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'presets'>('presets');
  const [rawAbhaInput, setRawAbhaInput] = useState(profile.abhaId || '');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleApplyPreset = (scenario: PresetScenario) => {
    onUpdateProfile(scenario.profile);
    onChangeOpdType(scenario.opdType);
    if (scenario.opdType === 'ayush') {
      onChangeDepartment('Ayurvedic Kayachikitsa');
    } else {
      onChangeDepartment(
        scenario.id === 'preset-emergency'
          ? 'Cardiology / Emergency Triage'
          : 'General Medicine & Diabetology'
      );
    }
  };

  const handleVerifyAbha = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        abhaId: rawAbhaInput || '91-8291-3320-1920',
        abhaAddress: `${(profile.fullName || 'patient').toLowerCase().replace(/\s+/g, '')}@abdm`,
        isVerified: true,
        consentGranted: true,
        consentTimestamp: new Date().toISOString(),
      });
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div id="step-1-identify-container" className="max-w-4xl mx-auto space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 text-xs font-bold mb-3 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPD Clinical Intake Kiosk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Patient Case-Taking & ABHA Check-In
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Record clinical history in your spoken language, digitize paper prescriptions, and link your
            consultation summary with your ABHA ID.
          </p>
        </div>
      </div>

      {/* OPD Mode Switch: Allopathy vs AYUSH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Select Clinical OPD Framework</span>
            </h3>
            <p className="text-xs text-slate-500">
              Choose standard Allopathic intake or Ayurvedic Dashavidha Pariksha
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Current: {opdType === 'allopathic' ? 'Allopathy' : 'AYUSH Ayurveda'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="opd-type-allopathic"
            onClick={() => {
              onChangeOpdType('allopathic');
              onChangeDepartment('General Medicine & Diabetology');
            }}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
              opdType === 'allopathic'
                ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  opdType === 'allopathic' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Modern Medicine (Allopathy)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  SOCRATES chief complaint, HPI, ROS, drug allergies & prior reports
                </p>
              </div>
            </div>
          </button>

          <button
            id="opd-type-ayush"
            onClick={() => {
              onChangeOpdType('ayush');
              onChangeDepartment('Ayurvedic Kayachikitsa');
            }}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
              opdType === 'ayush'
                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  opdType === 'ayush' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">AYUSH / Ayurveda OPD</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dashavidha & Trividha Pariksha (Prakriti, Agni, Koshtha, Ahara-Vihara)
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Patient Identification Methods */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              <span>Patient Identification & ABHA Authentication</span>
            </h3>
            <p className="text-xs text-slate-500">
              Authenticate with Ayushman Bharat Health Account or select a sample patient case
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-Click Demo Profiles
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'scan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scan ABHA QR
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enter ABHA / Mobile
            </button>
          </div>
        </div>

        {/* Tab 1: 1-Click Demo Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Select a Clinical OPD Case Scenario:</span>
              <span className="text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-medium">
                Click profile to test drive
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = profile.abhaId === scenario.profile.abhaId;
                return (
                  <div
                    key={scenario.id}
                    id={`select-scenario-${scenario.id}`}
                    onClick={() => handleApplyPreset(scenario)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-slate-900">{scenario.name}</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scenario.badgeColor}`}
                      >
                        {scenario.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {scenario.description}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="font-mono">ABHA: {scenario.profile.abhaId}</span>
                      <span className="font-semibold text-sky-600">
                        {isSelected ? '✓ Selected' : 'Use this Case →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Scan ABHA QR */}
        {activeTab === 'scan' && (
          <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center text-sky-500">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Scan ABHA Card / Ayushman QR Code</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Hold your physical ABHA card or mobile screen in front of the kiosk barcode scanner.
              </p>
            </div>
            <button
              onClick={() => {
                handleApplyPreset(PRESET_SCENARIOS[0]);
                setActiveTab('presets');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              Simulate Instant QR Scan
            </button>
          </div>
        )}

        {/* Tab 3: Manual ABHA Entry */}
        {activeTab === 'manual' && (
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                14-Digit ABHA ID or Mobile Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 91-4829-1049-3821"
                  value={rawAbhaInput}
                  onChange={(e) => setRawAbhaInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-mono"
                />
                <button
                  onClick={handleVerifyAbha}
                  disabled={isVerifying}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer disabled:bg-slate-300 shadow-xs transition-colors"
                >
                  {isVerifying ? 'Verifying...' : 'Fetch ABHA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Verification Card */}
        {profile.isVerified && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                {profile.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{profile.fullName}</h4>
                  <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ABHA Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  ABHA ID: <span className="font-mono">{profile.abhaId}</span> • Age: {profile.age} •{' '}
                  {profile.gender} • Dept: {department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRequestConsent}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
              >
                View Consent Terms
              </button>
            </div>
          </div>
        )}

        {/* Action Button: Proceed to Conversational Engine */}
        <div className="pt-2 flex items-center justify-end">
          <button
            id="proceed-to-converse-btn"
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:gap-3"
          >
            <span>Start Voice & Touch Clinical Case-Taking</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
