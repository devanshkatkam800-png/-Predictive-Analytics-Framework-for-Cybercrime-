import React, { useState } from 'react';
import {
  Shield,
  X,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { victimApi } from '../../services/api';

interface VictimAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (victim: any) => void;
}

export const VictimAuthModal: React.FC<VictimAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('ananya.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState('victim@123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regState, setRegState] = useState('Maharashtra');

  // OTP form state
  const [otpIdentifier, setOtpIdentifier] = useState('9876543210');
  const [otpCode, setOtpCode] = useState('193001');
  const [otpSent, setOtpSent] = useState(true);

  // Forgot password form state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await victimApi.login(loginIdentifier.trim(), loginPassword);
      onSuccess(res.victim);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await victimApi.register({
        name: regName.trim(),
        mobile: regMobile.trim(),
        email: regEmail.trim(),
        password: regPassword,
        aadhaar: regAadhaar.trim() || undefined,
        address: regAddress.trim() || 'Not Provided',
        city: regCity.trim() || 'Mumbai',
        state: regState.trim() || 'Maharashtra'
      });
      onSuccess(res.victim);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (targetIdentifier: string, isForgot = false) => {
    setError(null);
    setLoading(true);
    try {
      const res = await victimApi.sendOtp(targetIdentifier.trim());
      if (isForgot) {
        setForgotOtpSent(true);
      } else {
        setOtpSent(true);
        if (res.demoOtp) setOtpCode(res.demoOtp);
      }
      setInfoMessage(res.message + (res.demoOtp ? ` (Demo Code: ${res.demoOtp})` : ''));
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await victimApi.verifyOtpLogin(otpIdentifier.trim(), otpCode.trim());
      onSuccess(res.victim);
      onClose();
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await victimApi.forgotPassword(forgotIdentifier.trim(), forgotOtp.trim(), forgotNewPassword);
      setInfoMessage(res.message);
      setTimeout(() => {
        setActiveTab('login');
        setLoginIdentifier(forgotIdentifier);
        setInfoMessage('Please login with your updated password.');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoVictim = (email: string, pass: string, mob: string) => {
    setLoginIdentifier(email);
    setLoginPassword(pass);
    setOtpIdentifier(mob);
    setOtpCode('193001');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* National Portal Top Bar */}
        <div className="bg-emerald-800 text-white px-5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NATIONAL CYBER CRIME REPORTING PORTAL (NCRP)</span>
          </div>
          <span className="text-[11px] text-emerald-200 font-mono">1930 HELPLINE</span>
        </div>

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Citizen Cyber Crime Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Victim Access & Complaint Management System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setActiveTab('otp');
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors ${
              activeTab === 'otp'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            OTP Login
          </button>
          <button
            onClick={() => {
              setActiveTab('forgot');
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors ${
              activeTab === 'forgot'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Reset PIN
          </button>
        </div>

        {/* Demo Fast Fill Pill */}
        <div className="px-5 pt-4">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2">
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
              Demo Victim: <span className="font-bold text-slate-900 dark:text-white">Ananya Sharma</span> (₹85,000 lost)
            </span>
            <button
              type="button"
              onClick={() => loadDemoVictim('ananya.sharma@example.com', 'victim@123', '9876543210')}
              className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition-colors"
            >
              Fill Credentials
            </button>
          </div>
        </div>

        {/* Notifications & Error messages */}
        <div className="px-5 pt-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Standard Password Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. ananya.sharma@example.com or 9876543210"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password / Account PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(loginIdentifier);
                    setActiveTab('forgot');
                  }}
                  className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Victim / Citizen</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setOtpIdentifier(loginIdentifier);
                  setActiveTab('otp');
                }}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 font-medium"
              >
                Prefer mobile OTP login? <span className="text-emerald-700 dark:text-emerald-400 font-semibold underline">Login with OTP</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Victim Registration */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-5 space-y-3 max-h-[460px] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="10-Digit Mobile"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="victim@email.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 chars"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aadhaar Card (Optional)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regAadhaar}
                    onChange={(e) => setRegAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Flat/House, Street, Area"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Citizen Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: OTP Login */}
        {activeTab === 'otp' && (
          <form onSubmit={handleVerifyOtpLogin} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile or Email
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    placeholder="9876543210 or email"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtp(otpIdentifier, false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enter 6-Digit OTP Code
                </label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Hint: Use code 193001
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="193001"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify OTP & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 4: Forgot Password */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile or Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. ananya.sharma@example.com"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtp(forgotIdentifier, true)}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Send OTP
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verification OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                placeholder="193001"
                className="w-full px-3 py-2 text-xs font-mono tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Secure Password
              </label>
              <input
                type="password"
                required
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                placeholder="New password (minimum 6 chars)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Reset & Update Password</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit encrypted session strictly compliant with IT Act 2000 and RBI guidelines.</span>
        </div>
      </div>
    </div>
  );
};
