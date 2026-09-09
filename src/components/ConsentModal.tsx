import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Lock,
  Volume2,
  FileText,
  Trash2,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { Language } from '../types';
import { speakText } from '../utils/speech';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  patientName: string;
  language: Language;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  patientName,
  language,
}) => {
  const [consentVoice, setConsentVoice] = useState(true);
  const [consentDocuments, setConsentDocuments] = useState(true);
  const [consentAbhaSync, setConsentAbhaSync] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const audioConsentScript: Record<Language, string> = {
    Hindi: `डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट 2023 और आयुष्मान भारत डिजिटल मिशन के तहत, यह कियोस्क आपकी मेडिकल हिस्ट्री और पुरानी पर्चियों को केवल आज के डॉक्टर परामर्श के लिए सुरक्षित रूप से डिजिटाइज करता है। परामर्श समाप्त होने पर कियोस्क का स्थानीय डेटा मिटा दिया जाएगा। क्या आप सहमति देते हैं?`,
    English: `Under the Digital Personal Data Protection Act 2023 and ABDM Framework, this kiosk processes your medical history and paper prescriptions solely for today's OPD consultation. Temporary session data will be cleared immediately upon completion. Do you consent?`,
    Tamil: `டிஜிட்டல் தனிநபர் தரவுப் பாதுகாப்புச் சட்டம் 2023 இன் கீழ், உங்கள் மருத்துவ வரலாறு இன்றைய மருத்துவ ஆலோசனைகளுக்காக மட்டுமே பாதுகாப்பாகப் பதிவு செய்யப்படுகிறது.`,
    Telugu: `డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ చట్టం 2023 ప్రకారం, మీ వైద్య చరిత్ర నేటి డాక్టర్ సంప్రదింపుల కోసం మాత్రమే సురక్షితంగా నమోదు చేయబడుతుంది.`,
    Bengali: `ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন ২০২৩ অনুসারে, আপনার চিকিৎসার ইতিহাস শুধুমাত্র আজকের ডাক্তারের পরামর্শের জন্য সুরক্ষিতভাবে নথিভুক্ত করা হবে।`,
    Marathi: `डिजिटल वैयक्तिक डेटा संरक्षण कायदा २०२३ अंतर्गत, तुमची वैद्यकीय माहिती फक्त आजच्या डॉक्टर सल्ल्यासाठी सुरक्षितपणे नोंदवली जात आहे.`,
    Gujarati: `ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન એક્ટ ૨૦૨૩ હેઠળ, તમારો તબીબી ઇતિહાસ ફક્ત આજના ડોક્ટર પરામર્શ માટે સુરક્ષિત રીતે રેકોર્ડ કરવામાં આવી રહ્યો છે.`,
    Kannada: `ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ 2023 ರ ಅಡಿಯಲ್ಲಿ, ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವಿವರಗಳನ್ನು ಇಂದಿನ ವೈದ್ಯರ ಸಮಾಲೋಚನೆಗಾಗಿ ಮಾತ್ರ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.`,
  };

  const handlePlayConsentAudio = () => {
    setIsPlayingAudio(true);
    speakText(audioConsentScript[language] || audioConsentScript.Hindi, language, () => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div
      id="dpdp-consent-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="dpdp-consent-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Informed Patient Consent</h2>
              <p className="text-xs text-slate-400 font-medium">
                DPDP Act 2023 & ABDM Health Information Exchange Standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-slate-700">
          {/* Audio Explanation Button for Low-Literacy Patients */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Audio Explanation (आवाज में सहमति सुनें)
                </p>
                <p className="text-[11px] text-amber-800">
                  Click to listen to consent terms in your selected language ({language})
                </p>
              </div>
            </div>
            <button
              id="play-consent-audio-btn"
              onClick={handlePlayConsentAudio}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs ${
                isPlayingAudio
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              {isPlayingAudio ? 'Playing...' : 'Play Audio 🔊'}
            </button>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed">
            Patient:{' '}
            <strong className="text-slate-900">{patientName || 'Registered Patient'}</strong>.
            Before commencing clinical intake, please confirm your authorization for the following
            care purposes:
          </div>

          {/* Granular Toggles */}
          <div className="space-y-3">
            <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consentVoice}
                onChange={(e) => setConsentVoice(e.target.checked)}
                className="mt-1 w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  Conversational History Elicitation
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allow speech recognition and clinical dialogue engine to elicit presenting complaints
                  and symptoms.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consentDocuments}
                onChange={(e) => setConsentDocuments(e.target.checked)}
                className="mt-1 w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  Medical Document Digitization & OCR
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Authorize camera scanning of paper prescriptions and lab reports to structure
                  past medical history.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consentAbhaSync}
                onChange={(e) => setConsentAbhaSync(e.target.checked)}
                className="mt-1 w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  ABDM & Hospital EMR Integration (FHIR R4)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Link structured case summary with your Ayushman Bharat Health Account (ABHA) and
                  hospital consultation desk.
                </p>
              </div>
            </label>
          </div>

          {/* Privacy Guarantee callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-[11px] text-emerald-900">
            <Trash2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero Persistent Kiosk Storage:</span> All transient voice
              recordings and local cache are purged immediately upon session completion or cancellation.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            id="cancel-consent-btn"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 cursor-pointer transition-colors"
          >
            Cancel & Exit
          </button>
          <button
            id="accept-consent-btn"
            onClick={onAccept}
            disabled={!consentVoice || !consentDocuments}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>I Consent & Proceed (स्वीकार करें)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
