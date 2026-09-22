import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Shield,
  Clock,
  Lock,
  Coins,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building,
  Phone,
  Send,
  Sparkles
} from 'lucide-react';
import { Complaint, PriorityLevel } from '../types';
import { api } from '../services/api';

interface OfficerCaseActionModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onCaseUpdated: (updatedComplaint: Complaint) => void;
}

export const OfficerCaseActionModal: React.FC<OfficerCaseActionModalProps> = ({
  complaint,
  onClose,
  onCaseUpdated
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'assign' | 'recovery'>('status');

  // Status & Priority form state
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('High');
  const [caseNote, setCaseNote] = useState<string>('');

  // Assignment form state
  const [officersList, setOfficersList] = useState<any[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [assignmentInstructions, setAssignmentInstructions] = useState<string>('');

  // Financial Recovery form state
  const [amountFrozen, setAmountFrozen] = useState<string>('');
  const [amountRecovered, setAmountRecovered] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (complaint) {
      setSelectedStatus(complaint.status || 'Under Investigation');
      setSelectedPriority(complaint.priority || 'High');
      setAmountFrozen(complaint.amountFrozen ? complaint.amountFrozen.toString() : '');
      setAmountRecovered(complaint.amountRecovered ? complaint.amountRecovered.toString() : '0');
      setSelectedOfficerId(complaint.assignedOfficer?.id || 'usr-off-001');
      setAssignmentInstructions('Priority surveillance and ATM corridor interception protocol.');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [complaint]);

  useEffect(() => {
    api.getOfficers().then(setOfficersList).catch(() => []);
  }, []);

  if (!complaint) return null;

  const handleUpdateStatusAndPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await api.updateComplaintStatus(complaint.complaintId, {
        status: selectedStatus,
        priority: selectedPriority,
        noteText: caseNote.trim() || undefined
      });
      setSuccessMsg('Case status, priority, and timeline successfully updated.');
      onCaseUpdated(updated);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update case.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const officer = officersList.find((o) => o.id === selectedOfficerId) || {
        name: 'Insp. Vikram Rathore',
        designation: 'Inspector of Police',
        organization: 'Special Cyber Crime Cell, MHA / I4C Unit',
        contact: '+91-11-2343-8000',
        badgeNumber: 'I4C-9421'
      };

      const updated = await api.assignOfficer(complaint.complaintId, {
        officerId: officer.id,
        officerName: officer.name,
        designation: officer.designation,
        organization: officer.organization,
        contact: officer.contact,
        badgeNumber: officer.badgeNumber,
        instructions: assignmentInstructions.trim()
      });

      setSuccessMsg(`Case assigned to ${officer.name}. Citizen notified.`);
      onCaseUpdated(updated);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign officer.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const frozenNum = parseFloat(amountFrozen) || 0;
      const recoveredNum = parseFloat(amountRecovered) || 0;

      const updated = await api.updateComplaintStatus(complaint.complaintId, {
        amountFrozen: frozenNum,
        amountRecovered: recoveredNum,
        noteText: `Financial restitution update: Lien Frozen ₹${frozenNum.toLocaleString('en-IN')}, Restituted ₹${recoveredNum.toLocaleString('en-IN')}.`
      });

      setSuccessMsg('Financial recovery details recorded and synchronized to victim portal.');
      onCaseUpdated(updated);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update recovery amounts.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Officer Action: {complaint.complaintId}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {complaint.fraudType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Loss: ₹{complaint.amountLost.toLocaleString('en-IN')} &bull; Victim: {complaint.victimName || 'Citizen'} &bull; Bank: {complaint.bankName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 text-xs font-bold px-5 pt-2">
          <button
            onClick={() => setActiveSubTab('status')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lifecycle & Priority</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assign')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'assign'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign Investigator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recovery')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'recovery'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Recovery & Freeze</span>
          </button>
        </div>

        {/* Notifications / Alerts */}
        {errorMsg && (
          <div className="m-5 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="m-5 mb-0 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeSubTab === 'status' && (
            <form onSubmit={handleUpdateStatusAndPriority} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Complaint Lifecycle Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Prediction Generated">Prediction Generated</option>
                    <option value="Officer Assigned">Officer Assigned</option>
                    <option value="Investigation Started">Investigation Started</option>
                    <option value="Bank Freeze Requested">Bank Freeze Requested</option>
                    <option value="Account Under Surveillance">Account Under Surveillance</option>
                    <option value="Recovery In Progress">Recovery In Progress</option>
                    <option value="Partially Recovered">Partially Recovered</option>
                    <option value="Fully Recovered">Fully Recovered</option>
                    <option value="Case Closed">Case Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Case Priority Level
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  >
                    <option value="Critical">Critical (Risk Score 90+)</option>
                    <option value="High">High (Risk Score 75-89)</option>
                    <option value="Medium">Medium (Risk Score 60-74)</option>
                    <option value="Low">Low (Risk Score &lt;60)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Officer Case Progression Note (Visible in Citizen Timeline)
                </label>
                <textarea
                  rows={3}
                  value={caseNote}
                  onChange={(e) => setCaseNote(e.target.value)}
                  placeholder="e.g. Beneficiary account freeze verified. Physical ATM surveillance dispatched to suspected corridor..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Unified Lifecycle Sync:</strong> Changing this status advances the citizen's 7-stage visual tracker, triggers an automated notification to their portal, and updates the I4C central registry.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating...' : 'Update Lifecycle'}</span>
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'assign' && (
            <form onSubmit={handleAssignOfficer} className="space-y-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const self = officersList.find((o) => o.id === 'usr-off-001') || { id: 'usr-off-001' };
                    setSelectedOfficerId(self.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    selectedOfficerId === 'usr-off-001'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  ✓ Assign to Self (Insp. Vikram Rathore)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const other = officersList.find((o) => o.id !== 'usr-off-001');
                    if (other) setSelectedOfficerId(other.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    selectedOfficerId !== 'usr-off-001'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Assign to Another Officer
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Investigating Officer
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                >
                  {officersList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} &bull; {o.designation} ({o.badgeNumber || o.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Directives & Investigation Instructions
                </label>
                <textarea
                  rows={3}
                  value={assignmentInstructions}
                  onChange={(e) => setAssignmentInstructions(e.target.value)}
                  placeholder="Provide tactical instructions for ATM corridor sweep, bank liaison, or forensic evidence collection..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Direct Officer Assignment:</strong> The selected officer will receive this docket in their Assigned Cases queue. The victim will see the investigator's name, badge number, and division in their dashboard.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{saving ? 'Assigning...' : 'Confirm Assignment'}</span>
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'recovery' && (
            <form onSubmit={handleUpdateRecovery} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount Frozen under Lien (₹)
                  </label>
                  <input
                    type="number"
                    value={amountFrozen}
                    onChange={(e) => setAmountFrozen(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Funds currently locked in beneficiary/mule bank accounts.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount Restituted to Victim (₹)
                  </label>
                  <input
                    type="number"
                    value={amountRecovered}
                    onChange={(e) => setAmountRecovered(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Judicially reversed and credited back to victim's account.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Restitution Progress:</strong> Total Siphoned: ₹{complaint.amountLost.toLocaleString('en-IN')}. Restitution updates immediately update the victim's recovery status progress bar and restitution rate.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Update Financials'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
