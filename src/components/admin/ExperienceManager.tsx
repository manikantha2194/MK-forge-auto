import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { ExperienceItem } from '../../types';
import { ConfirmDialog } from './ConfirmDialog';

export const ExperienceManager: React.FC = () => {
  const { experience, refreshExperience } = usePortfolio();
  const { token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmExp, setDeleteConfirmExp] = useState<ExperienceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<{
    organization: string;
    role: string;
    duration: string;
    description: string;
    certificateUrl: string;
    linkUrl: string;
    order: number;
  }>({
    organization: '',
    role: '',
    duration: '',
    description: '',
    certificateUrl: '',
    linkUrl: '',
    order: 1,
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({
      organization: '',
      role: '',
      duration: '2024 - Present',
      description: '',
      certificateUrl: '',
      linkUrl: '',
      order: experience.length + 1,
    });
    setIsEditing(true);
    setMessage(null);
  };

  const openEdit = (item: ExperienceItem) => {
    setEditingId(item.id);
    setForm({
      organization: item.organization,
      role: item.role,
      duration: item.duration,
      description: item.description,
      certificateUrl: item.certificateUrl || '',
      linkUrl: item.linkUrl || '',
      order: item.order || 1,
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/experience/${editingId}` : '/api/experience';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await refreshExperience();
        setIsEditing(false);
        setMessage({ type: 'success', text: editingId ? 'Experience updated.' : 'Experience added.' });
      } else {
        setMessage({ type: 'error', text: 'Operation failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network failure.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteExperience = async () => {
    if (!deleteConfirmExp || !token) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/experience/${deleteConfirmExp.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshExperience();
        setMessage({ type: 'success', text: `Experience "${deleteConfirmExp.role}" deleted.` });
        setDeleteConfirmExp(null);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete experience.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">
            Career Timeline &amp; Experience
          </h3>
          <p className="text-sm text-[#777777] mt-1">
            Maintain milestones, freelancing track record, and educational credentials.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="orange-glow-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Timeline Item</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-[#25D366]/15 border border-[#25D366]/50 text-white'
              : 'bg-red-500/15 border border-red-500/50 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#25D366] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {experience.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-display text-base font-bold text-white">{item.role}</h4>
                <span className="text-xs font-mono text-[#FF7A00]">{item.duration}</span>
              </div>
              <div className="text-sm text-[#B8B8B8] font-medium mt-0.5">{item.organization}</div>
              <p className="text-xs text-[#777777] mt-1 line-clamp-2">{item.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEdit(item)}
                className="p-2 rounded-lg bg-white/[0.04] text-[#B8B8B8] hover:text-[#FF7A00]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirmExp(item)}
                className="p-2 rounded-lg bg-white/[0.04] text-[#B8B8B8] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete Experience Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmExp)}
        onClose={() => setDeleteConfirmExp(null)}
        onConfirm={confirmDeleteExperience}
        title="Delete Timeline Experience"
        itemTitle={deleteConfirmExp?.role}
        itemCategory={deleteConfirmExp?.organization}
        description="Are you sure you want to permanently delete this career and timeline entry from your portfolio?"
        confirmText="Delete Entry"
        cancelText="Cancel"
        isLoading={loading}
        variant="danger"
      />

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-2xl">
            <h4 className="font-display text-xl font-bold text-white mb-5">
              {editingId ? 'Edit Timeline Entry' : 'New Timeline Entry'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Full-Stack Web & AI Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Organization / Client
                </label>
                <input
                  type="text"
                  required
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="e.g. MK forge_auto"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  required
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 2023 - Present"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#B8B8B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="orange-glow-btn px-5 py-2 rounded-xl text-black font-bold text-xs uppercase"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
