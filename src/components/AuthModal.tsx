import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('Ministry of Home Affairs - I4C');
  const [role, setRole] = useState<'officer' | 'admin'>('officer');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        if (!name || !email || !password || !organization) {
          throw new Error('Please fill in all required fields.');
        }
        const res = await api.register({
          name,
          email,
          password,
          organization,
          role
        });
        onSuccess(res.user);
        onClose();
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your registered official email.');
        }
        const res = await api.forgotPassword(email, newPassword || undefined);
        setSuccessMsg(res.message);
        if (newPassword) {
          setTimeout(() => {
            setMode('login');
            setPassword(newPassword);
            setSuccessMsg(null);
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg p-1"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Header with National Emblem styling */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-700 text-white mb-3 shadow-md shadow-blue-700/20">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
            MINISTRY OF HOME AFFAIRS (MHA)
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {mode === 'login' && 'Officer Intelligence Portal'}
            {mode === 'register' && 'Officer Registration'}
            {mode === 'forgot' && 'Reset Officer Credentials'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Secure access for authorized investigating personnel only.'}
            {mode === 'register' && 'Register your law enforcement agency profile to generate predictive forecasts.'}
            {mode === 'forgot' && 'Reset your secure agency credentials.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Officer Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Register Officer
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setError(null);
            }}
            className={`py-2 px-2 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'forgot'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Rank <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Insp. Rajesh Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agency / Organization <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Maharashtra Cyber Cell / CBI / Special Cell"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('officer')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
                      role === 'officer'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Investigating Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
                      role === 'admin'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@mha.gov.in"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (minimum 6 characters)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Intelligence Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'register' ? (
              <>
                <span>Complete Officer Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Confirm Password Reset</span>
            )}
          </button>
        </form>

        {/* Quick Testing Credentials helper (Real DB credentials seeded for officer and admin) */}
        {mode === 'login' && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Verification Accounts (Click to Fill):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('officer@mha.gov.in', 'Officer@MHA2025')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-left hover:border-blue-500 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-900">Investigating Officer</div>
                <div className="text-[10px] text-slate-500 truncate">officer@mha.gov.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@mha.gov.in', 'Admin@MHA2025')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-left hover:border-blue-500 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-900">Administrator</div>
                <div className="text-[10px] text-slate-500 truncate">admin@mha.gov.in</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
