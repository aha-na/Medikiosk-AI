import { Language } from '../types';

// Map languages to standard BCP-47 speech recognition and synthesis locale tags
export const LANGUAGE_LOCALE_MAP: Record<Language, string> = {
  Hindi: 'hi-IN',
  English: 'en-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Kannada: 'kn-IN',
};

// Text-to-Speech audio reader using standard Web Speech API with fallback
export function speakText(text: string, language: Language = 'Hindi', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech to avoid overlapping audio
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const locale = LANGUAGE_LOCALE_MAP[language] || 'hi-IN';
  utterance.lang = locale;
  utterance.rate = 0.95; // Slightly slower for elderly/rural patients
  utterance.pitch = 1.0;

  // Find preferred voice matching language if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(locale.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
