import React, { useState } from 'react';
import {
  FolderArchive,
  Upload,
  Image as ImageIcon,
  FileText,
  FileAudio,
  Trash2,
  Download,
  Eye,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';
import { VictimComplaint, VictimEvidence } from '../../types';
import { victimApi } from '../../services/api';

interface VictimEvidenceCenterProps {
  complaints: VictimComplaint[];
  evidenceList: VictimEvidence[];
  onEvidenceUpdated: () => void;
}

export const VictimEvidenceCenter: React.FC<VictimEvidenceCenterProps> = ({
  complaints,
  evidenceList,
  onEvidenceUpdated
}) => {
  const [selectedComplaintFilter, setSelectedComplaintFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // New Evidence Upload Form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetComplaintId, setUploadTargetComplaintId] = useState(
    complaints.length > 0 ? complaints[0].complaintId : ''
  );
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'image' | 'pdf' | 'audio' | 'document'>('image');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDataUrl, setUploadDataUrl] = useState<string | undefined>();
  const [uploadFileSize, setUploadFileSize] = useState('1.2 MB');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // File preview modal
  const [previewEvidence, setPreviewEvidence] = useState<VictimEvidence | null>(null);

  const filteredEvidence = evidenceList.filter((ev) => {
    if (selectedComplaintFilter !== 'all' && ev.complaintId !== selectedComplaintFilter) return false;
    if (selectedTypeFilter !== 'all' && ev.fileType !== selectedTypeFilter) return false;
    return true;
  });

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: 'image' | 'pdf' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type === 'application/pdf') type = 'pdf';
    else if (file.type.startsWith('audio/')) type = 'audio';

    const sizeStr =
      file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.round(file.size / 1024) + ' KB';

    setUploadFileName(file.name);
    setUploadFileType(type);
    setUploadFileSize(sizeStr);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTargetComplaintId || !uploadFileName) return;

    setUploading(true);
    try {
      await victimApi.uploadEvidence({
        complaintId: uploadTargetComplaintId,
        fileName: uploadFileName,
        fileType: uploadFileType,
        fileSize: uploadFileSize,
        description: uploadDescription || 'Attached supplementary proof',
        dataUrl: uploadDataUrl
      });

      setShowUploadModal(false);
      setUploadFileName('');
      setUploadDescription('');
      setUploadDataUrl(undefined);
      setNotification('Evidence file uploaded and hashed for forensic chain of custody.');
      setTimeout(() => setNotification(null), 4000);
      onEvidenceUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence record?')) return;
    try {
      await victimApi.deleteEvidence(evidenceId);
      setNotification('Evidence item removed successfully.');
      setTimeout(() => setNotification(null), 4000);
      onEvidenceUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete evidence');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'audio':
        return <FileAudio className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Digital Forensics & Document Repository
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Section 65B IT Act Ready
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Evidence Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure repository of fraudulent transaction screenshots, bank statements, and scammer call recordings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          disabled={complaints.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Evidence</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-4 h-4" />
            <span>Filter By:</span>
          </div>

          <select
            value={selectedComplaintFilter}
            onChange={(e) => setSelectedComplaintFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
          >
            <option value="all">All Complaints ({evidenceList.length})</option>
            {complaints.map((c) => (
              <option key={c.complaintId} value={c.complaintId}>
                Case {c.complaintId} ({c.fraudType})
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
          >
            <option value="all">All File Types</option>
            <option value="image">Screenshots / Images</option>
            <option value="pdf">Bank Statements / PDFs</option>
            <option value="audio">Call Audio Recordings</option>
            <option value="document">Documents</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filteredEvidence.length}</strong> items
        </div>
      </div>

      {/* Evidence Grid */}
      {filteredEvidence.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between group hover:border-blue-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getTypeIcon(ev.fileType)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {ev.fileType}
                      </span>
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1">
                        {ev.fileName}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Evidence"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {ev.description || 'No specific annotation provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
                  <span className="font-mono text-blue-600 font-semibold">
                    {ev.complaintId}
                  </span>
                  <span>{ev.fileSize} &bull; {new Date(ev.uploadedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewEvidence(ev)}
                    className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <a
                    href={ev.fileUrl || '#'}
                    download={ev.fileName}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
          <FolderArchive className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">
            No Evidence Files Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload debit SMS screenshots, account statements, or scammer WhatsApp logs to bolster the investigation.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Supporting Evidence</span>
          </button>
        </div>
      )}

      {/* Modal 1: Upload New Evidence */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  Add Digital Evidence
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associate with Complaint:
                </label>
                <select
                  value={uploadTargetComplaintId}
                  onChange={(e) => setUploadTargetComplaintId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                >
                  {complaints.map((c) => (
                    <option key={c.complaintId} value={c.complaintId}>
                      {c.complaintId} - {c.fraudType} (₹{c.amountLost.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select File from Computer / Phone:
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf,audio/*"
                  onChange={handleFilePicked}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              {uploadFileName && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-900 truncate">
                    {uploadFileName}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {uploadFileType.toUpperCase()} &bull; {uploadFileSize}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evidence Description / Note:
                </label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="e.g. Screenshot of WhatsApp chat where scammer sent malicious APK link..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFileName}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {uploading ? 'Hashing & Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Inspect Preview Modal */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Evidence File Inspector
                </h3>
              </div>
              <button
                onClick={() => setPreviewEvidence(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-sm text-slate-900">
                  {previewEvidence.fileName}
                </div>
                <div className="text-slate-500 flex items-center gap-2">
                  <span>Complaint: <strong>{previewEvidence.complaintId}</strong></span>
                  <span>&bull;</span>
                  <span>Type: <strong>{previewEvidence.fileType.toUpperCase()}</strong></span>
                  <span>&bull;</span>
                  <span>Size: <strong>{previewEvidence.fileSize}</strong></span>
                </div>
              </div>

              {previewEvidence.dataUrl && previewEvidence.fileType === 'image' ? (
                <div className="max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 flex items-center justify-center p-2">
                  <img
                    src={previewEvidence.dataUrl}
                    alt={previewEvidence.fileName}
                    className="max-h-64 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-700">
                    Forensic digital file archived securely
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    SHA-256 hashed and timestamped for court presentation under Section 65B of Indian Evidence Act.
                  </p>
                </div>
              )}

              <div className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                <span className="font-bold block mb-0.5">Description Note:</span>
                {previewEvidence.description || 'No additional notes provided.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewEvidence(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
