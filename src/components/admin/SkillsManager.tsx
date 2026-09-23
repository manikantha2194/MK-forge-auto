import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { Skill } from '../../types';
import { ConfirmDialog } from './ConfirmDialog';

const CATEGORIES = [
  'Core Programming',
  'Web & Frameworks',
  'AI / ML & Data',
  'Creative & Automation',
] as const;

export const SkillsManager: React.FC = () => {
  const { skills, refreshSkills } = usePortfolio();
  const { token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<{
    name: string;
    category: 'Core Programming' | 'Web & Frameworks' | 'AI / ML & Data' | 'Creative & Automation';
    level: string;
    iconName: string;
  }>({
    name: '',
    category: 'Core Programming',
    level: 'Expert',
    iconName: 'Code2',
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      category: 'Core Programming',
      level: 'Expert',
      iconName: 'Code2',
    });
    setIsEditing(true);
    setMessage(null);
  };

  const openEdit = (s: Skill) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      category: s.category,
      level: s.level || 'Advanced',
      iconName: s.iconName || 'Code2',
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/skills/${editingId}` : '/api/skills';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await refreshSkills();
        setIsEditing(false);
        setMessage({ type: 'success', text: editingId ? 'Skill updated.' : 'Skill added.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update skill.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteSkill = async () => {
    if (!deleteConfirmSkill || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/${deleteConfirmSkill.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshSkills();
        setMessage({ type: 'success', text: `Skill "${deleteConfirmSkill.name}" deleted.` });
        setDeleteConfirmSkill(null);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete skill.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error deleting skill.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">
            Skills &amp; Technology Stack
          </h3>
          <p className="text-sm text-[#777777] mt-1">
            Maintain programming languages, frameworks, AI libraries, and video toolkits.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="orange-glow-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Skill</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-4 rounded-xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] flex items-center justify-between"
          >
            <div>
              <div className="font-display text-sm font-bold text-white">{skill.name}</div>
              <div className="text-[11px] text-[#FF7A00] font-mono mt-0.5">{skill.category}</div>
              <div className="text-[10px] text-[#777777]">{skill.level}</div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openEdit(skill)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-[#B8B8B8] hover:text-[#FF7A00]"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirmSkill(skill)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-[#B8B8B8] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete Skill"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmSkill)}
        onClose={() => setDeleteConfirmSkill(null)}
        onConfirm={confirmDeleteSkill}
        title="Delete Technical Skill"
        itemTitle={deleteConfirmSkill?.name}
        itemCategory={deleteConfirmSkill?.category}
        description="Are you sure you want to delete this technical skill from your profile matrix? This action will remove it from the public skill showcase."
        confirmText="Delete Skill"
        cancelText="Cancel"
        isLoading={loading}
        variant="danger"
      />

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-2xl">
            <h4 className="font-display text-xl font-bold text-white mb-5">
              {editingId ? 'Edit Skill' : 'New Skill'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Python"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0D0D0D]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Proficiency Label
                </label>
                <input
                  type="text"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="Expert, Advanced, Proficient"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
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
