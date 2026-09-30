import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, RefreshCw, Globe, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { Language } from '../types';
import { GlassCard } from '../components/GlassCard';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Suggested prompt phrases by language
  const suggestions: Record<Language, string[]> = {
    en: [
      'What medicines are at risk this week?',
      'Which PHCs have low stock?',
      'Where can we source ORS and Paracetamol?',
      'What action should the district officer review?'
    ],
    hi: [
      'मेरे PHC में कौन सी दवाइयां कम हैं?',
      'इस सप्ताह कौन सी दवाइयों की कमी का जोखिम है?',
      'कटक क्लस्टर के लिए सरप्लस स्टॉक कहाँ है?',
      'बाढ़ सिमुलेशन से कौन से केंद्र प्रभावित होंगे?'
    ],
    or: [
      'ମୋ PHC ରେ କେଉଁ ଔଷଧ କମ୍ ଅଛି?',
      'କଟକ ଜିଲ୍ଲାରେ ପାରାସିଟାମଲ୍ କେଉଁଠାରୁ ମିଳିବ?',
      'ଚଳିତ ସପ୍ତାହରେ କେଉଁ କେନ୍ଦ୍ରରେ ସଙ୍କଟାପନ୍ନ ସ୍ଥିତି ଅଛି?',
      'ଜିଲ୍ଲା ଚିକିତ୍ସା ଅଧିକାରୀ କ’ଣ ପଦକ୍ଷେପ ନେବେ?'
    ]
  };

  useEffect(() => {
    // Setup Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap: Record<Language, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        or: 'or-IN'
      };
      recognition.lang = langMap[language];

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        // Fallback simulated voice prompt if mic permissions are blocked or browser lacks API
        setIsListening(true);
        setTimeout(() => {
          const sample = suggestions[language][0];
          setTranscript(sample);
          setIsListening(false);
          handleProcessQuery(sample);
        }, 2000);
      }
    }
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.chatAssistant(queryText, language);
      setResponse(res.reply);
      speakText(res.reply);
    } catch (err) {
      setResponse('Failed to query assistant. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<Language, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      or: 'hi-IN' // Odia fallback to Indic voice
    };
    utterance.lang = langMap[language];
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-background-panel border border-cyan-500/40 rounded-2xl shadow-glow-cyan overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-background-card/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Multilingual Voice Interface
              </h3>
              <p className="text-xs text-slate-400">
                Speech-to-Speech Healthcare Supply Command (English • Hindi • Odia)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5 text-xs font-mono">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded ${language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded ${language === 'hi' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                HI
              </button>
              <button
                onClick={() => setLanguage('or')}
                className={`px-2 py-1 rounded ${language === 'or' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                OR
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Voice Interaction Body */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-6">
          {/* Microphone Pulse Circle */}
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                <span className="absolute -inset-4 rounded-full bg-cyan-500/10 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleListen}
              className={`relative z-10 p-7 rounded-full border-2 transition-all shadow-xl ${
                isListening
                  ? 'bg-rose-600 border-rose-400 text-white shadow-glow-red scale-105'
                  : 'bg-gradient-to-tr from-cyan-600 to-teal-500 border-cyan-400 text-white shadow-glow-cyan hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="h-9 w-9 animate-pulse" />
              ) : (
                <Mic className="h-9 w-9" />
              )}
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 tracking-wider">
            {isListening
              ? 'LISTENING... SPEAK YOUR QUERY NOW'
              : 'CLICK MICROPHONE TO SPEAK OR TAP A PROMPT BELOW'}
          </div>

          {/* Real-time Waveform Bars when active */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center gap-1.5 h-8">
              {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-bounce"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="w-full text-left p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-1">
                TRANSCRIPT ({language.toUpperCase()}):
              </span>
              <p className="text-sm text-slate-200 italic font-sans">
                "{transcript}"
              </p>
              {!response && !isLoading && (
                <button
                  onClick={() => handleProcessQuery(transcript)}
                  className="mt-2.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Submit Query to Gemini
                </button>
              )}
            </div>
          )}

          {/* AI Response Display */}
          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono animate-pulse">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Processing operational response...
            </div>
          )}

          {response && (
            <div className="w-full text-left p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  HEALTHRESILIENCE AI RESPONSE:
                </span>
                <button
                  onClick={() => speakText(response)}
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  {isSpeaking ? 'Speaking...' : 'Replay Voice'}
                </button>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {response}
              </p>
            </div>
          )}

          {/* Quick Suggestions list */}
          <div className="w-full text-left">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
              SUGGESTED VOICE PROMPTS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions[language].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(s);
                    handleProcessQuery(s);
                  }}
                  className="text-left text-xs p-2.5 rounded-lg border border-slate-800 bg-background-card hover:border-cyan-500/40 hover:text-cyan-300 transition-colors truncate"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
