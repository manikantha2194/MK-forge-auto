import React, { useState } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  Calendar,
  Image as ImageIcon,
  ShieldCheck,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CertificationItem } from '../../types';

export const CertificationsManager: React.FC = () => {
  const {
    certifications,
    addCertification,
    updateCertification,
    deleteCertification,
    reorderCertifications,
  } = usePortfolio();

  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingCert({
      id: `cert-${Date.now()}`,
      name: '',
      organization: '',
      date: '',
      certificateId: '',
      certificateUrl: '',
      imageUrl: '',
      enabled: true,
      order: certifications.length + 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    if (!editingCert.name.trim() || !editingCert.organization.trim()) {
      setFeedback('Please provide both Certificate Name and Issuing Organization.');
      return;
    }

    if (isAdding) {
      await addCertification(editingCert);
      setFeedback('Certification added successfully.');
    } else {
      await updateCertification(editingCert.id, editingCert);
      setFeedback('Certification updated successfully.');
    }

    setEditingCert(null);
    setIsAdding(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this certification?')) {
      await deleteCertification(id);
    }
  };

  const moveCert = async (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= certifications.length) return;

    const list = [...certifications];
    const [moved] = list.splice(idx, 1);
    list.splice(targetIdx, 0, moved);

    await reorderCertifications(list.map(c => c.id));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Certifications &amp; Accreditations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Display professional credentials, technical licenses, and accredited honors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {feedback}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((cert, idx) => (
          <div
            key={cert.id}
            className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-[#FF7A00]/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#FF7A00]">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveCert(idx, 'up')}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === certifications.length - 1}
                    onClick={() => moveCert(idx, 'down')}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingCert(cert);
                    }}
                    className="p-1 text-zinc-400 hover:text-[#FF7A00] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id)}
                    className="p-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white font-display mt-3">
                {cert.name}
              </h3>
              <p className="text-xs text-[#FF7A00] font-medium mt-0.5">
                {cert.organization}
              </p>

              {cert.date && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>{cert.date}</span>
                </div>
              )}

              {cert.certificateId && (
                <div className="text-[10px] font-mono text-zinc-500 mt-1">
                  ID: <span className="text-zinc-400">{cert.certificateId}</span>
                </div>
              )}
            </div>

            {cert.certificateUrl && (
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <a
                  href={cert.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#00E5FF] hover:underline flex items-center gap-1"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal / Editor */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF7A00]" />
                {isAdding ? 'Add New Certification' : 'Edit Certification'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Certification Name *</label>
                <input
                  type="text"
                  required
                  value={editingCert.name}
                  onChange={e => setEditingCert({ ...editingCert, name: e.target.value })}
                  placeholder="e.g. AWS Certified Machine Learning Specialist"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  value={editingCert.organization}
                  onChange={e => setEditingCert({ ...editingCert, organization: e.target.value })}
                  placeholder="e.g. Amazon Web Services / Coursera"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Issue Date</label>
                <input
                  type="text"
                  value={editingCert.date}
                  onChange={e => setEditingCert({ ...editingCert, date: e.target.value })}
                  placeholder="e.g. Nov 2024"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Credential ID</label>
                <input
                  type="text"
                  value={editingCert.certificateId || ''}
                  onChange={e => setEditingCert({ ...editingCert, certificateId: e.target.value })}
                  placeholder="e.g. CERT-849204"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Verification URL</label>
                <input
                  type="text"
                  value={editingCert.certificateUrl || ''}
                  onChange={e => setEditingCert({ ...editingCert, certificateUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Badge / Logo Image URL</label>
                <input
                  type="text"
                  value={editingCert.imageUrl || ''}
                  onChange={e => setEditingCert({ ...editingCert, imageUrl: e.target.value })}
                  placeholder="/assets/aws-badge.svg"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAdding ? 'Create Certification' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
