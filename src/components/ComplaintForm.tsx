import React, { useState } from 'react';
import {
  FilePlus,
  Shield,
  Send,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Hash,
  FileText,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Complaint, Prediction, IntelligenceReport } from '../types';

interface ComplaintFormProps {
  onSubmitSuccess: (result: {
    complaint: Complaint;
    prediction: Prediction;
    report: IntelligenceReport;
  }) => void;
  onCancel?: () => void;
}

const FRAUD_TYPES = [
  'UPI Fraud',
  'ATM Cloning',
  'Phishing / OTP Bypass',
  'Digital Arrest / Impersonation',
  'Investment Fraud',
  'Fake Loan Extortion',
  'Job / Task Scam',
  'Card Skimming',
  'Crypto Mule Siphoning',
  'Other'
];

const MAJOR_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Other'
];

const INDIAN_STATES = [
  'Maharashtra',
  'Delhi',
  'Haryana',
  'Karnataka',
  'Telangana',
  'Gujarat',
  'Tamil Nadu',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Jharkhand',
  'Punjab',
  'Madhya Pradesh',
  'Kerala',
  'Bihar',
  'Odisha',
  'Assam'
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmitSuccess, onCancel }) => {
  const [complaintId, setComplaintId] = useState(
    `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [fraudType, setFraudType] = useState('UPI Fraud');
  const [amountLost, setAmountLost] = useState('185000');
  const [victimCity, setVictimCity] = useState('Mumbai');
  const [victimState, setVictimState] = useState('Maharashtra');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState(new Date().toTimeString().slice(0, 5));
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('482910294819');
  const [upiId, setUpiId] = useState('victim.trans@oksbi');
  const [transactionId, setTransactionId] = useState(
    `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  );
  const [complaintDescription, setComplaintDescription] = useState(
    'Victim received an automated call regarding electricity power cut. Tricked into installing remote assistance APK and funds were drained via 3 quick UPI transactions.'
  );
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fraudType || !amountLost || !victimCity || !bankName || !complaintDescription) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Dynamic import to avoid circular dependency
      const { api } = await import('../services/api');
      const result = await api.createComplaint({
        complaintId,
        fraudType,
        amountLost: Number(amountLost) || 0,
        victimCity,
        victimState,
        transactionDate,
        transactionTime,
        bankName,
        accountNumber,
        upiId,
        transactionId,
        complaintDescription,
        priority
      });

      onSubmitSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint and trigger predictive model.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreFillScenario = (type: 'upi_mumbai' | 'digital_arrest' | 'mewat_sim') => {
    if (type === 'upi_mumbai') {
      setFraudType('UPI Fraud');
      setAmountLost('220000');
      setVictimCity('Mumbai');
      setVictimState('Maharashtra');
      setBankName('State Bank of India');
      setUpiId('pay.mule88@okaxis');
      setComplaintDescription(
        'Victim clicked on a fraudulent electricity bill link sent via SMS. Screen-sharing APK allowed siphon of ₹2,20,000 to two mule accounts.'
      );
      setPriority('High');
    } else if (type === 'digital_arrest') {
      setFraudType('Digital Arrest / Impersonation');
      setAmountLost('650000');
      setVictimCity('New Delhi');
      setVictimState('Delhi');
      setBankName('HDFC Bank');
      setUpiId('cbi.compliance.sec@hdfc');
      setComplaintDescription(
        'Victim coerced during 6-hour video call with impersonators posing as Mumbai Cyber Cell and Enforcement Directorate. Coerced into RTGS transfer.'
      );
      setPriority('Critical');
    } else if (type === 'mewat_sim') {
      setFraudType('Phishing / OTP Bypass');
      setAmountLost('95000');
      setVictimCity('Gurugram');
      setVictimState('Haryana');
      setBankName('Punjab National Bank');
      setUpiId('instant.cashout@pnb');
      setComplaintDescription(
        'SIM swap and fake KYC update call. Multi-factor authentication intercepted to trigger immediate ATM cash extraction.'
      );
      setPriority('High');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                MHA CYBERCRIME INTAKE
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500">
                Automatic Geospatial Predictive Engine Active
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Register Cybercrime Complaint
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitting this official record will immediately execute the predictive analytics framework to forecast likely cash withdrawal zones in advance.
            </p>
          </div>

          {/* Quick Pre-fill scenarios for testing */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Case Scenarios:</span>
            <button
              type="button"
              onClick={() => handlePreFillScenario('upi_mumbai')}
              className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 transition-colors"
            >
              Mumbai UPI
            </button>
            <button
              type="button"
              onClick={() => handlePreFillScenario('digital_arrest')}
              className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 transition-colors"
            >
              Digital Arrest
            </button>
            <button
              type="button"
              onClick={() => handlePreFillScenario('mewat_sim')}
              className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 transition-colors"
            >
              Mewat ATM
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Complaint & Financial Loss Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <span>1. Complaint & Modus Operandi Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Complaint ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fraud Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={fraudType}
                onChange={(e) => setFraudType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {FRAUD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Amount Lost (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amountLost}
                onChange={(e) => setAmountLost(e.target.value)}
                placeholder="e.g. 185000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Victim City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={victimCity}
                onChange={(e) => setVictimCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Victim State <span className="text-rose-500">*</span>
              </label>
              <select
                value={victimState}
                onChange={(e) => setVictimState(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Triage Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Critical">Critical (Immediate Intercept)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Banking & Transaction Identifiers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>2. Banking & Transaction Trail</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Victim Bank Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {MAJOR_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Victim Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="XXXX-XXXX-4819"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Suspect / Mule UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="mule.pay@oksbi"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Time (24h)
              </label>
              <input
                type="time"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Ref / UTR
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-50192841"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Modus Operandi & Complaint Description */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>3. Incident Narrative & Modus Operandi Description</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              placeholder="Provide complete details: How did contact initiate? What links, apps, or VPAs were involved? How were funds layered?"
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Intelligence Trigger:</span> Upon clicking submission below, the system will match this complaint with historical withdrawal cases, bank clearing timelines, and corridor clustering to predict high-risk cash withdrawal zones (e.g. Andheri East, Kurla, Thane) and calculate confidence scores.
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-blue-700/20 disabled:opacity-50"
          >
            {submitting ? (
              <span>Executing Predictive Analytics Engine...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint & Generate Forecast</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
