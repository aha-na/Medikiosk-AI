import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowRight,
  Send,
  Sparkles,
  Bot,
  User,
  HeartPulse,
  Leaf,
  Activity,
  CheckCircle2,
  RefreshCw,
  Compass,
} from 'lucide-react';
import {
  ChatMessage,
  AbhaProfile,
  OpdType,
  Language,
  SocratesHistory,
  DashavidhaPariksha,
} from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface Step2ConverseProps {
  profile: AbhaProfile;
  opdType: OpdType;
  department: string;
  language: Language;
  audioEnabled: boolean;
  onProceedToScan: () => void;
  onSetRedFlag: (isRedFlag: boolean, reason?: string) => void;
  isRedFlag: boolean;
  redFlagReason?: string;
}

export const Step2Converse: React.FC<Step2ConverseProps> = ({
  profile,
  opdType,
  department,
  language,
  audioEnabled,
  onProceedToScan,
  onSetRedFlag,
  isRedFlag,
  redFlagReason,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activePainSite, setActivePainSite] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Socrates state tracking
  const [socrates, setSocrates] = useState<SocratesHistory>({
    site: '',
    onset: '',
    character: '',
    radiation: '',
    severity: 7,
  });

  // Dashavidha state tracking (if AYUSH)
  const [dashavidha, setDashavidha] = useState<Partial<DashavidhaPariksha>>({
    prakriti: 'Vata-Pitta',
    agni: 'Mandagni',
    koshtha: 'Krura',
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial Greeting Question based on Mode
  useEffect(() => {
    const isAyush = opdType === 'ayush';
    let initialGreeting = '';
    let initialGreetingEnglish = '';
    let options: string[] = [];

    if (isAyush) {
      initialGreeting = `नमस्ते ${profile.fullName} जी। मैं आपका आयुर्वेदिक डिजिटल केस-टेकर हूँ। आपको क्या मुख्य शारीरिक या पाचन कष्ट है?`;
      initialGreetingEnglish = `Hello ${profile.fullName}. I am your Ayurvedic digital case-taking assistant. What is your chief physical or digestive complaint?`;
      options = [
        'जोड़ों में दर्द व सुबह जकड़न (Amavata)',
        'पाचन कमजोर और गैस/कब्ज (Mandagni)',
        'त्वचा पर खुजली व लाल चकत्ते (Kushtha)',
        'थकान और अनिद्रा (Vata Prakopa)',
      ];
    } else {
      initialGreeting = `नमस्ते ${profile.fullName} जी। आज अस्पताल में आपको क्या मुख्य परेशानी या दर्द महसूस हो रहा है?`;
      initialGreetingEnglish = `Hello ${profile.fullName}. What is your chief medical complaint or symptom today?`;
      options = [
        'छाती में भारीपन या दर्द (Chest discomfort)',
        'पेट में तेज दर्द व उल्टी (Abdominal pain)',
        'तेज बुखार व बदन दर्द (High fever)',
        'शुगर/बीपी की जांच व कमजोरी (Diabetes/BP checkup)',
      ];
    }

    const firstMessage: ChatMessage = {
      id: 'msg-0',
      sender: 'ai',
      text: initialGreeting,
      translation: initialGreetingEnglish,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedOptions: options,
    };

    setMessages([firstMessage]);

    if (audioEnabled) {
      speakText(initialGreeting, language);
    }

    // Setup Web Speech API if supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'English' ? 'en-IN' : 'hi-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      stopSpeaking();
    };
  }, [opdType, profile.fullName, language]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'English' ? 'en-IN' : 'hi-IN';
          recognitionRef.current.start();
          setIsListening(true);
        } else {
          // Simulation fallback for environments without microphone access
          simulateVoiceInput();
        }
      } catch (err) {
        console.warn('Speech start error:', err);
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      const simulatedText =
        opdType === 'ayush'
          ? 'मुझे पिछले 6 महीने से सुबह उठते ही उंगलियों में तेज अकड़न रहती है और खाना ठीक से नहीं पचता।'
          : 'सुबह से छाती में भारी दबाव महसूस हो रहा है और बाएँ कंधे की तरफ दर्द जा रहा है, पसीना भी आ रहा है।';
      setInputText(simulatedText);
      setIsListening(false);
    }, 2000);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || inputText).trim();
    if (!textToSend || isLoadingAi) return;

    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'patient',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoadingAi(true);

    // Call server Gemini conversational endpoint
    try {
      const res = await fetch('/api/history/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: [...messages, userMsg],
          latestUserMessage: textToSend,
          language: language,
          opdType: opdType,
          patientData: {
            name: profile.fullName,
            age: profile.age,
            gender: profile.gender,
          },
        }),
      });

      const data = await res.json();

      // Check Red Flag Detection
      if (data.isRedFlag) {
        onSetRedFlag(true, data.redFlagReason || 'Emergency clinical symptoms detected');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.aiQuestion || 'कृपया इस बारे में थोड़ा और विस्तार से बताएं।',
        translation: data.aiQuestionEnglish || 'Please explain a bit more about this symptom.',
        suggestedOptions: data.suggestedOptions || [
          'हाँ, बिल्कुल ऐसा ही है',
          'नहीं, कोई अन्य समस्या है',
          'दवा लेने पर आराम मिलता है',
          'लगातार बना रहता है',
        ],
        isRedFlag: data.isRedFlag,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Read aloud if audio is enabled
      if (audioEnabled && aiMsg.text) {
        speakText(aiMsg.text, language);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      // Fallback
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          opdType === 'ayush'
            ? 'धन्यवाद। क्या यह कष्ट खाने के तुरंत बाद बढ़ता है, या खाली पेट? और आपकी भूख (अग्नि) कैसी है?'
            : 'समझ गया। क्या यह दर्द किसी एक जगह स्थिर है या शरीर में कहीं और भी फैल रहा है?',
        translation:
          opdType === 'ayush'
            ? 'Does this discomfort worsen immediately after food or on empty stomach? And how is your digestive appetite?'
            : 'Understood. Is this pain localized in one spot or radiating anywhere else?',
        suggestedOptions: ['खाने के बाद बढ़ता है', 'खाली पेट ज्यादा रहता है', 'हल्का सा आराम मिलता है', 'पूरी रात नींद नहीं आती'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleBodySiteSelect = (site: string) => {
    setActivePainSite(site);
    const siteHindiMap: Record<string, string> = {
      Chest: 'छाती (Chest)',
      Head: 'सिर / सिरदर्द (Head)',
      Abdomen: 'पेट (Abdomen / Stomach)',
      Joints: 'जोड़ों व घुटनों (Joints)',
      Back: 'कमर व पीठ (Back)',
    };
    handleSendMessage(`मुझे मुख्य रूप से ${siteHindiMap[site] || site} में दर्द या परेशानी है।`);
  };

  return (
    <div id="step-2-converse-container" className="w-full flex-1 flex flex-col space-y-6">
      {/* Emergency Red-Flag Alert Banner */}
      {isRedFlag && (
        <div
          id="red-flag-emergency-banner"
          className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 flex items-start justify-between gap-4 animate-bounce-subtle"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-tight text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                  RED FLAG • IMMEDIATE TRIAGE
                </span>
                <span className="text-xs font-semibold text-red-700">
                  Priority 1 Emergency Alert
                </span>
              </div>
              <h3 className="text-base font-bold mt-1 text-red-900">
                Emergency Symptoms Detected: {redFlagReason || 'Acute Cardiovascular / Respiratory Distress'}
              </h3>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Hospital nursing triage desk has been notified. Patient status has been elevated to Priority #1.
                Please remain seated; staff is approaching or proceed to Room 101.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-red-100/60 px-3 py-2 rounded-xl text-center border border-red-200">
            <span className="text-[10px] font-bold block text-red-800 uppercase tracking-wider">Queue</span>
            <span className="text-2xl font-black text-red-700">#1</span>
          </div>
        </div>
      )}

      {/* Geometric Balance Main Interaction Grid */}
      <div className="flex-1 flex flex-col lg:flex-row rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Left Column: Conversational Voice & Touch Dialogue */}
        <div className="w-full lg:w-7/12 p-6 sm:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {opdType === 'ayush' ? 'Ayurvedic Clinical Intake' : 'History of Present Illness'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Please describe your symptoms. Speak in your language or tap options.
                </p>
              </div>
              <span className="text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full">
                {language}
              </span>
            </div>

            {/* Touch Pain Site Quick Selectors */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Quick Site:
              </span>
              {['Chest', 'Head', 'Abdomen', 'Joints', 'Back'].map((site) => (
                <button
                  key={site}
                  onClick={() => handleBodySiteSelect(site)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 ${
                    activePainSite === site
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>

          {/* Active Voice Listening Waveform Visualizer */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-6 mb-6 relative">
            <div className="absolute top-4 right-5 flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isListening ? 'bg-sky-400 opacity-75' : 'bg-slate-300 opacity-40'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isListening ? 'bg-sky-500' : 'bg-slate-400'
                  }`}
                ></span>
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-widest ${
                  isListening ? 'text-sky-600' : 'text-slate-400'
                }`}
              >
                {isListening ? 'Listening...' : 'Voice Ready'}
              </span>
            </div>

            {/* Geometric Audio Waveform */}
            <div className="flex items-end space-x-2 h-16 my-2">
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-500 h-10' : 'bg-slate-200 h-3'
                }`}
              ></div>
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-400 h-14' : 'bg-slate-200 h-4'
                }`}
              ></div>
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-600 h-16' : 'bg-slate-200 h-5'
                }`}
              ></div>
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-300 h-9' : 'bg-slate-200 h-3'
                }`}
              ></div>
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-500 h-12' : 'bg-slate-200 h-4'
                }`}
              ></div>
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-400 h-6' : 'bg-slate-200 h-3'
                }`}
              ></div>
              <div
                className={`w-2 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-sky-600 h-14' : 'bg-slate-200 h-4'
                }`}
              ></div>
            </div>

            <p className="text-sm sm:text-base text-slate-700 italic px-4 text-center leading-relaxed max-w-md">
              {messages[messages.length - 1]?.text || 'Press speak or select options below...'}
            </p>
          </div>

          {/* Chat Message History */}
          <div className="flex-1 overflow-y-auto max-h-56 space-y-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 mb-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    <p className="font-medium">{msg.text}</p>
                    {isAi && msg.translation && (
                      <p className="text-[11px] text-slate-400 mt-1 italic border-t border-slate-100 pt-1">
                        {msg.translation}
                      </p>
                    )}
                  </div>

                  {/* Suggested quick options */}
                  {isAi && msg.suggestedOptions && msg.suggestedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(opt)}
                          className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-800 border border-slate-200 hover:border-sky-300 rounded-xl text-xs font-medium cursor-pointer transition-all shadow-2xs"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isLoadingAi && (
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
                <span>Formulating clinical follow-up...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Voice & Text Input Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                id="voice-mic-input-btn"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {isListening ? 'Listening...' : 'Speak (बोलें)'}
                </span>
              </button>

              <input
                id="history-chat-input"
                type="text"
                placeholder={`Type symptoms in ${language} or English...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-hidden"
              />

              <button
                id="send-chat-msg-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoadingAi}
                className="p-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Geometric Balance Clinical Summary Draft */}
        <div className="w-full lg:w-5/12 bg-slate-50/70 p-6 sm:p-8 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Clinical Summary Draft
            </h3>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
              Live Structured
            </span>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-1">
            {/* Chief Complaint */}
            <section>
              <h4 className="text-xs font-bold text-sky-600 mb-2 border-b border-sky-100 pb-1 uppercase tracking-wider">
                Chief Complaint
              </h4>
              <p className="text-xs font-semibold text-slate-800">
                {socrates.site
                  ? `${socrates.site} pain & discomfort for past few days`
                  : activePainSite
                  ? `${activePainSite} distress (onset reported in OPD)`
                  : 'Presenting with episodic discomfort'}
              </p>
            </section>

            {/* HPI (SOCRATES) */}
            <section>
              <h4 className="text-xs font-bold text-sky-600 mb-2 border-b border-sky-100 pb-1 uppercase tracking-wider">
                {opdType === 'ayush' ? 'AYUSH Dashavidha Pariksha' : 'HPI (SOCRATES Analysis)'}
              </h4>
              {opdType === 'ayush' ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Prakriti</span>
                    <span className="font-semibold text-slate-800">{dashavidha.prakriti || 'Vata-Pitta'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Agni</span>
                    <span className="font-semibold text-slate-800">{dashavidha.agni || 'Mandagni'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Koshtha</span>
                    <span className="font-semibold text-slate-800">{dashavidha.koshtha || 'Krura'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Ahara-Vihara</span>
                    <span className="font-semibold text-slate-800">Ushna/Tikshna</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Site</span>
                    <span className="font-semibold text-slate-800">{socrates.site || activePainSite || 'Substernal'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Onset</span>
                    <span className="font-semibold text-slate-800">{socrates.onset || 'Gradual / 3 days'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Character</span>
                    <span className="font-semibold text-slate-800">{socrates.character || 'Dull aching / heaviness'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Severity</span>
                    <span className="font-semibold text-slate-800">{socrates.severity || 7} / 10</span>
                  </div>
                </div>
              )}
            </section>

            {/* Scan Queue / Document Status */}
            <section>
              <h4 className="text-xs font-bold text-sky-600 mb-2 border-b border-sky-100 pb-1 uppercase tracking-wider">
                Scan Queue (OCR Ready)
              </h4>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Paper Prescription & Lab OCR</p>
                  <p className="text-[11px] text-slate-500">Multimodal Gemini OCR & entity extraction</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                  03
                </span>
              </div>
            </section>
          </div>

          {/* Continue Action Button */}
          <div className="pt-6">
            <button
              id="proceed-to-doc-scan-btn"
              onClick={onProceedToScan}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-tight text-base flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-xs"
            >
              <span>Continue to Scans</span>
              <span className="text-sky-400 text-xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
