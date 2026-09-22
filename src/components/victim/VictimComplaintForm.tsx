import React, { useState } from 'react';
import {
  Shield,
  FilePlus,
  Building2,
  Upload,
  FileText,
  Image as ImageIcon,
  FileAudio,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  Calendar,
  Lock
} from 'lucide-react';
import { victimApi } from '../../services/api';
import { VictimComplaint } from '../../types';

interface VictimComplaintFormProps {
  onSuccess: (complaint: VictimComplaint) => void;
  onCancel: () => void;
}

interface UploadedFileItem {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'audio' | 'document';
  fileSize: string;
  dataUrl?: string;
  description: string;
}

export const VictimComplaintForm: React.FC<VictimComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const [fraudType, setFraudType] = useState('UPI Fraud');
  const [amountLost, setAmountLost] = useState('45000');
  const [bankName, setBankName] = useState('State Bank of India (SBI)');
  const [accountNumber, setAccountNumber] = useState('XXXX-XXXX-7812');
  const [upiId, setUpiId] = useState('claim-refund@paytm');
  const [transactionId, setTransactionId] = useState('UTR-' + Date.now().toString().slice(-8));
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState(new Date().toTimeString().slice(0, 5));
  const [complaintDescription, setComplaintDescription] = useState(
    'Received an urgent call claiming to be from customer support asking to verify electricity bill refund. Clicked an SMS link that triggered an unauthorized UPI debit.'
  );

  // File Uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([
    {
      id: 'file-1',
      fileName: 'debit_sms_screenshot.png',
      fileType: 'image',
      fileSize: '840 KB',
      description: 'Screenshot of fraudulent debit SMS with UTR reference'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fraudTypes = [
    'UPI Fraud',
    'Investment Scam',
    'Fake Loan App',
    'Part-Time Job Fraud',
    'Identity Theft & Impersonation',
    'Phishing / Vishing',
    'Credit Card / Debit Card Cloning',
    'Sextortion & Cyber Blackmail',
    'Crypto / Forex Scam',
    'Digital Arrest & Fake Police Notice'
  ];

  const banks = [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Punjab National Bank (PNB)',
    'Bank of Baroda',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Canara Bank',
    'Union Bank of India',
    'Paytm Payments Bank',
    'Other Commercial Bank'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      let fileType: 'image' | 'pdf' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type === 'application/pdf') fileType = 'pdf';
      else if (file.type.startsWith('audio/')) fileType = 'audio';

      const sizeStr =
        file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : Math.round(file.size / 1024) + ' KB';

      const reader = new FileReader();
      reader.onload = () => {
        const newItem: UploadedFileItem = {
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          fileName: file.name,
          fileType,
          fileSize: sizeStr,
          dataUrl: reader.result as string,
          description: `Uploaded artifact: ${file.name}`
        };
        setUploadedFiles((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amountLost);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount lost.');
      return;
    }

    if (!bankName) {
      setError('Please select or specify your bank.');
      return;
    }

    if (!complaintDescription || complaintDescription.trim().length < 15) {
      setError('Please provide a detailed incident description (at least 15 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await victimApi.fileComplaint({
        fraudType,
        amountLost: parsedAmount,
        bankName,
        accountNumber,
        upiId,
        transactionId,
        transactionDate,
        transactionTime,
        complaintDescription,
        evidenceFiles: uploadedFiles.map((f) => ({
          fileName: f.fileName,
          fileType: f.fileType,
          fileSize: f.fileSize,
          dataUrl: f.dataUrl,
          description: f.description
        }))
      });

      onSuccess(res.complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to lodge complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Official Form Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Form NCRP-01 &bull; Citizen Cyber Incident Intake
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                1930 Linked
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Lodge Cybercrime & Financial Fraud Complaint
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitting this form immediately generates a high-priority 1930 bank freeze alert and triggers the AI predictive cash withdrawal engine.
            </p>
          </div>
        </div>
      </div>

      {/* Complaint Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Section 1: Incident & Fraud Classification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black flex items-center justify-center">
              1
            </span>
            <span>Fraud Incident Classification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category of Cyber Fraud <span className="text-rose-500">*</span>
              </label>
              <select
                value={fraudType}
                onChange={(e) => setFraudType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {fraudTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Amount Siphoned (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amountLost}
                  onChange={(e) => setAmountLost(e.target.value)}
                  placeholder="e.g. 85000"
                  className="w-full pl-8 pr-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Fraudulent Transaction <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approximate Time of Incident <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  required
                  value={transactionTime}
                  onChange={(e) => setTransactionTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Suspect Routing Trail */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black flex items-center justify-center">
              2
            </span>
            <span>Bank & Transaction Routing Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Debited Bank <span className="text-rose-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Debited Account / Card (Last 4 digits or Full)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. XXXX-XXXX-7812"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suspect / Beneficiary UPI ID (VPA)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. fraudulent-user@icici"
                className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction ID / 12-Digit UTR Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UTR428198271891"
                className="w-full px-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Incident Narrative Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black flex items-center justify-center">
              3
            </span>
            <span>Chronological Description of the Scam</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Narrative <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              placeholder="State what happened chronologically: How the scammer contacted you (SMS, WhatsApp, phone call, Telegram), what links or APKs were downloaded, what OTPs were requested..."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 4: Evidence Center & Document Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black flex items-center justify-center">
                4
              </span>
              <span>Evidence Upload (Screenshots, PDFs, Audio)</span>
            </h2>
            <span className="text-xs text-slate-400">
              {uploadedFiles.length} files attached
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              Drag and drop evidence files or click to browse
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports: Bank SMS screenshots (.png/.jpg), Bank Passbook/Statements (.pdf), Scammer Call Recordings (.mp3/.wav)
            </p>
            <label className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer transition-colors">
              <span>Choose Files from Device</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Attached Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-700">
                Attached Digital Evidence:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {file.fileType === 'image' && <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />}
                      {file.fileType === 'pdf' && <FileText className="w-4 h-4 text-rose-500 shrink-0" />}
                      {file.fileType === 'audio' && <FileAudio className="w-4 h-4 text-amber-500 shrink-0" />}
                      {file.fileType === 'document' && <FileText className="w-4 h-4 text-slate-500 shrink-0" />}
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 truncate">
                          {file.fileName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {file.fileSize} &bull; {file.fileType.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legal Declaration */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Statutory Declaration under IT Act 2000 & Section 91 CrPC</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            I hereby certify that the information furnished above regarding the unauthorized transaction is true and correct to the best of my knowledge. I understand that false statements are punishable under law.
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Complaint & Trigger 1930 Bank Freeze</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
