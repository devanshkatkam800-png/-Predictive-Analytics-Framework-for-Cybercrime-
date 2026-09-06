import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Shield,
  AlertTriangle,
  Bot,
  User as UserIcon,
  HelpCircle,
  Lock,
  Phone,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { VictimComplaint } from '../../types';
import { victimApi } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface VictimAiAssistantProps {
  complaints: VictimComplaint[];
  selectedComplaintId?: string;
  onSelectComplaint?: (id: string) => void;
}

export const VictimAiAssistant: React.FC<VictimAiAssistantProps> = ({
  complaints,
  selectedComplaintId
}) => {
  const [activeComplaintId, setActiveComplaintId] = useState<string>(
    selectedComplaintId || (complaints.length > 0 ? complaints[0].complaintId : '')
  );

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Namaste. I am your MHA Citizen Cyber Defense Advisor powered by Gemini.

I can guide you through:
1. **Immediate Golden Hour Steps** (within 2-24 hours of unauthorized debits)
2. **Securing your bank accounts, SIM cards & UPI apps**
3. **Tracking Section 91 CrPC Bank Liens and recovering money under Section 457 CrPC**
4. **Verifying scams** (Digital arrest, Part-time task fraud, Fake electricity bill SMS, APK fraud)

How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    {
      title: '🚨 What should I do right now?',
      desc: 'Immediate steps in the Golden Hour',
      query: 'I just got scammed of money from my bank account a few minutes ago. What are the immediate emergency actions I must take right now in the golden hour?'
    },
    {
      title: '🏦 How to secure bank & UPI?',
      desc: 'Preventing further unauthorized debits',
      query: 'How do I immediately block my UPI, disable internet banking, and protect my bank account from any further unauthorized deductions?'
    },
    {
      title: '💰 How does money recovery work?',
      desc: 'Section 91 & Section 457 CrPC process',
      query: 'How does the money recovery process work after dialing 1930? When and how will the frozen funds in the scammer account be sent back to my bank account?'
    },
    {
      title: '⚖️ Is "Digital Arrest" real?',
      desc: 'CBI / Police Skype call verification',
      query: 'Someone called claiming to be from Mumbai Police / CBI saying a parcel with illegal contraband in my name has been seized, and they are putting me under "Digital Arrest" on video call. Is this real?'
    }
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await victimApi.askAiAssistant(
        q.trim(),
        activeComplaintId || undefined
      );

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: res.advice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: 'Apologies, I encountered a temporary network glitch communicating with the advisory model. Dial 1930 immediately if this is an active financial emergency.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const activeCase = complaints.find((c) => c.complaintId === activeComplaintId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Citizen Guidance & Victim Support Engine
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Gemini 2.5 Flash
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              AI Citizen Cyber Advisor
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authoritative guidance on cyber fraud prevention, bank account security, and Indian statutory fund recovery procedures.
            </p>
          </div>
        </div>

        {/* Complaint Context Selector */}
        {complaints.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Context Case:
            </label>
            <select
              value={activeComplaintId}
              onChange={(e) => setActiveComplaintId(e.target.value)}
              className="text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1 px-2"
            >
              <option value="">General Citizen Inquiries</option>
              {complaints.map((c) => (
                <option key={c.complaintId} value={c.complaintId}>
                  Case {c.complaintId} ({c.fraudType})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Advisory Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chat Window */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[600px] overflow-hidden">
          {/* Chat Sub-Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Live Cyber Incident AI Assistance
              </span>
              {activeCase && (
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  (Context: {activeCase.complaintId} - ₹{activeCase.amountLost.toLocaleString('en-IN')})
                </span>
              )}
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'assistant',
                    text: 'Session refreshed. How can I assist you with cyber fraud recovery or bank protection today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])
              }
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
              title="Restart Conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[90%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    m.sender === 'user'
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.text}
                  </div>
                  <div
                    className={`text-[10px] mt-2 font-mono text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating statutory cyber procedures & formulating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'How do I stop fraudulent UPI auto-debits?', 'What is Section 457 CrPC?')..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Quick Action Prompts & Emergency Toolkit */}
        <div className="space-y-4">
          {/* Quick Prompts List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Recommended Citizen Queries</span>
            </h3>

            <div className="space-y-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency 1930 Contact Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3 border border-blue-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wide">
              <Phone className="w-4 h-4 animate-bounce" />
              <span>Immediate Helpline</span>
            </div>

            <div className="text-2xl font-black text-white">
              1930 (Toll-Free)
            </div>

            <p className="text-xs text-blue-200 leading-relaxed">
              National Cyber Financial Fraud Reporting Line. Always register financial frauds within 2 hours for maximum bank freeze success.
            </p>

            <div className="pt-2 border-t border-blue-800/60 flex items-center justify-between text-[11px] text-blue-300">
              <span>Official NCRP Portal:</span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white font-bold flex items-center gap-1"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
