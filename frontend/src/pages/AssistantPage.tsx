import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { GlassCard } from '../components/GlassCard';
import { Language } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Mic,
  Cpu,
  RefreshCw,
  Terminal,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolExecuted?: string;
  timestamp: string;
}

export const AssistantPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content:
        'HealthResilience AI operational engine active. Monitored network encompasses 35 PHCs across Odisha, West Bengal, Jharkhand, and Andhra Pradesh. I can track real-time stock levels, forecast 30-day medicine depletion, recommend inter-facility transfers, and model disaster surges. How can I assist your operational decisions today?',
      toolExecuted: 'system_initialize()',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedPrompts = [
    'What medicines are at risk this week?',
    'Which PHCs have low stock?',
    'Where can we source ORS and Paracetamol?',
    'Which PHCs may be affected by the simulated flood?',
    'What action should the district officer review?'
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAssistant(textToSend, language);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        toolExecuted: res.tool_executed ? `${res.tool_executed}()` : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach backend reasoning agent. Please check network connectivity.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              HealthResilience AI
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                GEMINI POWERED
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Ask about PHC resources, supply risks and operational signals.
            </p>
          </div>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Language:</span>
          {(['en', 'hi', 'or'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                language === l
                  ? 'bg-cyan-600 text-white shadow-glow-cyan'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'ଓଡ଼ିଆ'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat History Panel */}
        <GlassCard className="lg:col-span-8 p-0 flex flex-col h-[650px] overflow-hidden">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-2xl ${
                    isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAssistant
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                        isAssistant
                          ? 'bg-slate-800/80 text-slate-200 border border-slate-700/80'
                          : 'bg-cyan-600 text-white font-medium'
                      }`}
                    >
                      {m.content}
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-500">
                      <span>{m.timestamp}</span>
                      {m.toolExecuted && (
                        <span className="text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                          ⚡ Tool: {m.toolExecuted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 mr-auto max-w-2xl animate-pulse">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-mono">
                  Synthesizing real-time facility telemetry and computing risk...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div className="p-4 border-t border-slate-800 bg-background-card/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about medicine buffers, surplus hubs, or disaster surges..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors shadow-glow-cyan"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </GlassCard>

        {/* Right Tool Architecture and Suggested Prompts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Suggested Prompts */}
          <GlassCard className="p-4 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Suggested Inquiries
            </span>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-slate-800 bg-background-deep hover:border-cyan-500/40 hover:text-cyan-300 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Active AI Tool Registry */}
          <GlassCard className="p-4 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block flex items-center gap-1.5">
              <Terminal className="h-4 w-4" />
              Connected Tool Architecture
            </span>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>get_phc_status()</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>get_inventory()</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>get_forecast()</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>get_alerts()</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>find_surplus_stock()</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>generate_action_brief()</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
            </div>
          </GlassCard>

          {/* Safety Notice */}
          <GlassCard className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Safety & Governance
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              HealthResilience AI accesses backend tools rather than hallucinating records.
              It does not diagnose medical patients or alter patient clinical records.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
