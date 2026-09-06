import React, { useState } from 'react';
import {
  Database,
  UploadCloud,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  Layers,
  Download
} from 'lucide-react';
import { HistoricalCase } from '../types';
import { api } from '../services/api';

interface HistoricalDatasetSectionProps {
  historicalCases: HistoricalCase[];
  onRefresh: () => Promise<void>;
}

export const HistoricalDatasetSection: React.FC<HistoricalDatasetSectionProps> = ({
  historicalCases,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBank, setFilterBank] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Case Form States
  const [fraudType, setFraudType] = useState('UPI Fraud');
  const [amount, setAmount] = useState('150000');
  const [victimCity, setVictimCity] = useState('Mumbai');
  const [victimState, setVictimState] = useState('Maharashtra');
  const [withdrawalName, setWithdrawalName] = useState('Andheri Kurla Road ATM Hub');
  const [withdrawalCity, setWithdrawalCity] = useState('Mumbai');
  const [withdrawalState, setWithdrawalState] = useState('Maharashtra');
  const [cluster, setCluster] = useState('Andheri East Cluster');
  const [bank, setBank] = useState('State Bank of India');
  const [notes, setNotes] = useState('Layered withdrawal pattern via 3 ATMs within 45 minutes.');
  const [addingCase, setAddingCase] = useState(false);

  // Filtered cases
  const filteredCases = historicalCases.filter((c) => {
    if (filterBank !== 'All' && c.bank !== filterBank) return false;
    if (filterType !== 'All' && c.fraudType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.caseId.toLowerCase().includes(q) ||
        c.fraudType.toLowerCase().includes(q) ||
        c.victimLocation.city.toLowerCase().includes(q) ||
        c.withdrawalLocation.name.toLowerCase().includes(q) ||
        c.withdrawalLocation.cluster.toLowerCase().includes(q) ||
        c.bank.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Handle Manual Case Addition
  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCase(true);
    setError(null);
    try {
      await api.createHistoricalCase({
        caseId: `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        fraudType,
        amount: Number(amount) || 0,
        victimLocation: {
          city: victimCity,
          state: victimState,
          lat: 19.076,
          lng: 72.8777
        },
        withdrawalLocation: {
          name: withdrawalName,
          city: withdrawalCity,
          state: withdrawalState,
          lat: 19.1197,
          lng: 72.8464,
          cluster
        },
        bank,
        timestamp: new Date().toISOString(),
        notes
      });
      await onRefresh();
      setShowAddModal(false);
      setUploadSuccess('Historical case recorded successfully into training dataset.');
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to add historical record.');
    } finally {
      setAddingCase(false);
    }
  };

  // Handle File Upload (CSV/JSON)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const text = await file.text();
      let records: Partial<HistoricalCase>[] = [];

      if (file.name.endsWith('.json')) {
        records = JSON.parse(text);
      } else {
        // Simple CSV parser
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

        records = lines.slice(1).map((line, idx) => {
          const cols = line.split(',').map((c) => c.trim());
          return {
            caseId: cols[0] || `HC-IMP-${idx + 1}`,
            fraudType: cols[1] || 'UPI Fraud',
            amount: Number(cols[2]) || 120000,
            victimLocation: {
              city: cols[3] || 'Mumbai',
              state: cols[4] || 'Maharashtra',
              lat: 19.076,
              lng: 72.8777
            },
            withdrawalLocation: {
              name: cols[5] || 'Station Road ATM',
              city: cols[6] || 'Mumbai',
              state: cols[7] || 'Maharashtra',
              lat: 19.1197,
              lng: 72.8464,
              cluster: cols[8] || 'Urban Hub'
            },
            bank: cols[9] || 'State Bank of India',
            timestamp: new Date().toISOString(),
            notes: cols[10] || 'Imported historical record'
          };
        });
      }

      if (records.length === 0) {
        throw new Error('No valid records found in the uploaded file.');
      }

      const res = await api.importHistoricalCases(records);
      await onRefresh();
      setUploadSuccess(`Successfully imported ${res.count} historical cases into the prediction matrix.`);
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error processing historical dataset file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Download Sample CSV template
  const handleDownloadSample = () => {
    const csvContent =
      'caseId,fraudType,amount,victimCity,victimState,withdrawalLocationName,withdrawalCity,withdrawalState,cluster,bank,notes\n' +
      'HC-2025-001,UPI Fraud,180000,Mumbai,Maharashtra,Andheri East SBI ATM,Mumbai,Maharashtra,Andheri East Cluster,State Bank of India,Rapid mule withdrawal\n' +
      'HC-2025-002,ATM Cloning,95000,Delhi,Delhi,Karol Bagh PNB ATM,Delhi,Delhi,Karol Bagh Cluster,Punjab National Bank,Skimmer withdrawal in evening\n' +
      'HC-2025-003,Phishing / OTP Bypass,250000,Pune,Maharashtra,Kurla West HDFC ATM,Mumbai,Maharashtra,Kurla Cluster,HDFC Bank,Inter-city fund layering';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mha_historical_fraud_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                MHA INTELLIGENCE REPOSITORY
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ground Truth for Withdrawal Forecasting
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Historical Cybercrime Dataset
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Store and maintain verified past cybercrime complaints, victim geolocations, and actual cash-out points. The predictive engine queries this dataset to compute withdrawal zone probabilities and corridor linkages.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV Template</span>
            </button>

            {/* CSV / JSON Upload */}
            <label className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{uploading ? 'Processing File...' : 'Upload Dataset (CSV/JSON)'}</span>
              <input
                type="file"
                accept=".csv,.json"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Historical Case</span>
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID, cluster, city, or bank..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Cases in Repository:{' '}
            <span className="font-bold text-slate-900 dark:text-white">{historicalCases.length} records</span>
          </div>
        </div>
      </div>

      {/* Historical Cases Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Fraud Type</th>
                <th className="px-4 py-3">Amount Lost</th>
                <th className="px-4 py-3">Victim Location</th>
                <th className="px-4 py-3">Actual Cash-Out Zone & Cluster</th>
                <th className="px-4 py-3">Bank Channel</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No historical records found. Add or import records to train the prediction engine.
                  </td>
                </tr>
              ) : (
                filteredCases.map((hc) => (
                  <tr key={hc.caseId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {hc.caseId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {hc.fraudType}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      ₹{hc.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {hc.victimLocation.city}, {hc.victimLocation.state}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {hc.withdrawalLocation.name}
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        {hc.withdrawalLocation.cluster}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {hc.bank}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {new Date(hc.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Single Historical Case */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
            >
              &times;
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Record Historical Cybercrime Case
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ground truth training record for the withdrawal prediction engine.
              </p>
            </div>

            <form onSubmit={handleAddCase} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fraud Type
                  </label>
                  <select
                    value={fraudType}
                    onChange={(e) => setFraudType(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="UPI Fraud">UPI Fraud</option>
                    <option value="ATM Cloning">ATM Cloning</option>
                    <option value="Phishing / OTP Bypass">Phishing / OTP Bypass</option>
                    <option value="Digital Arrest / Impersonation">Digital Arrest / Impersonation</option>
                    <option value="Investment Fraud">Investment Fraud</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Withdrawn (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Victim City
                  </label>
                  <input
                    type="text"
                    required
                    value={victimCity}
                    onChange={(e) => setVictimCity(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Victim State
                  </label>
                  <input
                    type="text"
                    required
                    value={victimState}
                    onChange={(e) => setVictimState(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Withdrawal Location
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawalName}
                    onChange={(e) => setWithdrawalName(e.target.value)}
                    placeholder="e.g. Andheri Kurla Road ATM Hub"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Withdrawal Cluster Zone
                  </label>
                  <input
                    type="text"
                    required
                    value={cluster}
                    onChange={(e) => setCluster(e.target.value)}
                    placeholder="e.g. Andheri East Cluster"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    required
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Withdrawal City
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawalCity}
                    onChange={(e) => setWithdrawalCity(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investigation Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCase}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  {addingCase ? 'Recording...' : 'Save Historical Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
