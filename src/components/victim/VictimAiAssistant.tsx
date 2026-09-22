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
  BookOpen,
  FilePlus,
  Coins,
  ShieldAlert,
  ArrowRight,
  Zap
} from 'lucide-react';
import { VictimComplaint } from '../../types';
import { victimApi } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  keySteps?: string[];
}

interface VictimAiAssistantProps {
  complaints: VictimComplaint[];
  selectedComplaintId?: string;
  onSelectComplaint?: (id: string) => void;
  onFileNewComplaint?: () => void;
}

export const VictimAiAssistant: React.FC<VictimAiAssistantProps> = ({
  complaints,
  selectedComplaintId,
  onFileNewComplaint
}) => {
  const [activeComplaintId, setActiveComplaintId] = useState<string>(
    selectedComplaintId || (complaints.length > 0 ? complaints[0].complaintId : '')
  );

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Namaste. I am your Official MHA Citizen Cyber Defense Advisor.

I provide instantaneous, verified statutory guidance on:
- **Golden Hour Emergency Actions** (first 2 hours for automated bank lien freeze)
- **Securing compromised Bank Accounts, UPI VPAs & Netbanking**
- **Fund Recovery Procedures** under Section 91 & Section 457 CrPC
- **Scam Verification** (Fake "Digital Arrest", APK malware, investment traps)

How can I protect your finances today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keySteps: [
        'Call 1930 immediately for financial fraud within the 2-hour Golden Hour.',
        'Freeze your debit cards and revoke netbanking from your official banking app.',
        'File an official complaint with UTR and evidence screenshots.'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // 4 Core Verified Queries explicitly required
  const recommendedQueries = [
    {
      id: 'golden_hour',
      title: 'What should I do right now?',
      category: 'Emergency Action',
      badge: 'Golden Hour',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      desc: 'Immediate emergency actions in the first 2 hours after a scam',
      query: 'What should I do right now?'
    },
    {
      id: 'bank_security',
      title: 'How to secure bank and UPI?',
      category: 'Account Lockdown',
      badge: 'Security',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Lock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      desc: 'Block UPI VPAs, de-link payment apps and prevent unauthorized debits',
      query: 'How to secure bank and UPI?'
    },
    {
      id: 'money_recovery',
      title: 'How does money recovery work?',
      category: 'Legal Restitution',
      badge: 'Sec. 91 & 457 CrPC',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Coins,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      desc: 'Understand bank lien freezes, FIR acknowledgment and magistrate release orders',
      query: 'How does money recovery work?'
    },
    {
      id: 'digital_arrest',
      title: 'Is Digital Arrest real?',
      category: 'Scam Alert',
      badge: 'High Alert',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldAlert,
      iconColor: 'text-[#1e3a8a]',
      iconBg: 'bg-blue-50',
      desc: 'Verify fake CBI, Police Skype and video call parcel extortion threats',
      query: 'Is Digital Arrest real?'
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
    setIsStreaming(true);

    const botMessageId = 'bot-' + Date.now();
    let streamedText = '';

    // Initialize bot placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        sender: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      await victimApi.askAiAssistantStream(
        q.trim(),
        activeComplaintId || undefined,
        (chunk: string) => {
          streamedText += chunk;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === botMessageId ? { ...msg, text: streamedText } : msg))
          );
        },
        (completedData) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: completedData.advice || streamedText,
                    keySteps: completedData.keySteps
                  }
                : msg
            )
          );
          setLoading(false);
          setIsStreaming(false);
        },
        (error) => {
          console.warn('Streaming error, rendering fallback:', error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text:
                      streamedText ||
                      'Dial 1930 immediately for financial fraud reporting. Our cyber crime advisory portal is operating under high volume.'
                  }
                : msg
            )
          );
          setLoading(false);
          setIsStreaming(false);
        }
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: 'Please dial Toll-Free 1930 immediately if this is an active financial emergency.'
              }
            : msg
        )
      );
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const activeCase = complaints.find((c) => c.complaintId === activeComplaintId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e3a8a]">
                Ministry of Home Affairs • I4C
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563eb] text-[10px] font-bold">
                <Zap className="w-3 h-3 text-[#2563eb]" />
                Fast AI & Instant Cache (&lt;1s)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              AI Citizen Cyber Advisor
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Authoritative, concise guidance for cyber fraud prevention, bank account protection, and statutory fund recovery.
            </p>
          </div>
        </div>

        {/* Action Controls: Context Case + Prominent File Complaint Button */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {complaints.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Context Case:
              </label>
              <select
                value={activeComplaintId}
                onChange={(e) => setActiveComplaintId(e.target.value)}
                className="text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900 py-1.5 px-2.5 shadow-xs focus:ring-2 focus:ring-[#2563eb] focus:outline-hidden"
              >
                <option value="">General Inquiries</option>
                {complaints.map((c) => (
                  <option key={c.complaintId} value={c.complaintId}>
                    Case {c.complaintId} ({c.fraudType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Prominent File Complaint Button */}
          {onFileNewComplaint && (
            <button
              onClick={onFileNewComplaint}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-[#172554] hover:to-[#1d4ed8] text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-98"
            >
              <FilePlus className="w-4 h-4" />
              <span>File Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: 2 Cols Chat + 1 Col Recommendations & Emergency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[620px] overflow-hidden">
          {/* Chat Sub-Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-bold text-slate-900">
                Active Cyber Incident AI Assistant
              </span>
              {activeCase && (
                <span className="font-mono text-[#2563eb] font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Case #{activeCase.complaintId} • ₹{activeCase.amountLost.toLocaleString('en-IN')}
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
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
              title="Restart Conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[92%] ${
                    !isAssistant ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                      !isAssistant
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-[#1e3a8a] shadow-xs'
                    }`}
                  >
                    {!isAssistant ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl ${
                      !isAssistant
                        ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                        <Shield className="w-3 h-3 text-[#10b981]" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          MHA Cyber Defense Advisory
                        </span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap leading-relaxed space-y-1 font-normal">
                      {m.text || (
                        <span className="inline-flex items-center gap-2 text-slate-400 italic">
                          <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping" />
                          Formulating verified advisory...
                        </span>
                      )}
                    </div>

                    {/* Actionable Key Steps pill if available */}
                    {isAssistant && m.keySteps && m.keySteps.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                          <span>Recommended Immediate Steps:</span>
                        </div>
                        <ul className="space-y-1">
                          {m.keySteps.map((step, sIdx) => (
                            <li key={sIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                              <span className="text-[#2563eb] font-bold shrink-0">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-2 font-mono text-right ${
                        !isAssistant ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#1e3a8a] flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5 shadow-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="font-medium text-slate-700">
                    Evaluating statutory cyber procedures & formulating response...
                  </span>
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
            className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'What should I do right now?', 'How to secure bank and UPI?')..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2563eb] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-[#172554] hover:to-[#1d4ed8] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Advisor</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Recommended Citizen Queries & Compact 1930 Helpline */}
        <div className="space-y-4">
          {/* Recommended Citizen Queries Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#1e3a8a]" />
                <span>Recommended Citizen Queries</span>
              </h3>
              <span className="text-[10px] font-bold text-[#10b981] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Instant &lt;1s
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              One-click access to verified statutory procedures & emergency actions.
            </p>

            <div className="space-y-2.5">
              {recommendedQueries.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSend(item.query)}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200/90 hover:border-[#2563eb]/50 transition-all text-xs group cursor-pointer shadow-xs hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5 border border-slate-100`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900 group-hover:text-[#1e3a8a] transition-colors truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact, Professional 1930 Helpline Card */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-5 shadow-sm border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">
                <Phone className="w-4 h-4 text-[#ef4444] animate-bounce" />
                <span>Emergency 24x7 Helpline</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#10b981] border border-emerald-200">
                Toll-Free
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1e3a8a] tracking-tight">1930</span>
              <span className="text-xs text-slate-600 font-medium">National Cyber Crime Reporting</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Report financial fraud within the <strong>2-hour Golden Hour</strong> to initiate an immediate automated bank freeze before scammer cash-out.
            </p>

            <div className="pt-3 border-t border-slate-200/70 flex flex-col gap-2">
              {onFileNewComplaint && (
                <button
                  onClick={onFileNewComplaint}
                  className="w-full py-2 px-3 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>File Official Complaint</span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Official Portal:</span>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2563eb] hover:underline font-bold flex items-center gap-1"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
