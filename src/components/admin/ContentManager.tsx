import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { ContentItem, PlatformType } from '../../types';
import { MediaFallback } from '../MediaFallback';
import { ConfirmDialog } from './ConfirmDialog';

const PLATFORMS: PlatformType[] = ['YouTube', 'Instagram', 'LinkedIn', 'GitHub', 'Twitter', 'Other'];

export const ContentManager: React.FC = () => {
  const { content, refreshContent } = usePortfolio();
  const { token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<{
    title: string;
    caption: string;
    platform: PlatformType;
    url: string;
    imageUrl: string;
    category: string;
    date: string;
  }>({
    title: '',
    caption: '',
    platform: 'YouTube',
    url: '',
    imageUrl: '/assets/project-video.svg',
    category: 'Tutorial',
    date: '2026',
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      caption: '',
      platform: 'YouTube',
      url: '',
      imageUrl: '/assets/project-video.svg',
      category: 'Tutorial',
      date: 'May 2026',
    });
    setIsEditing(true);
    setMessage(null);
  };

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      caption: item.caption,
      platform: item.platform,
      url: item.url,
      imageUrl: item.imageUrl,
      category: item.category,
      date: item.date,
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/content/${editingId}` : '/api/content';
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
        await refreshContent();
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: editingId ? 'Content item updated.' : 'Content item created.',
        });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Operation failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteContent = async () => {
    if (!deleteConfirmItem || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshContent();
        setMessage({
          type: 'success',
          text: `Deleted content item "${deleteConfirmItem.title}".`,
        });
        setDeleteConfirmItem(null);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete content.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error deleting content.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">
            Content &amp; Media Manager
          </h3>
          <p className="text-sm text-[#777777] mt-1">
            Manage YouTube videos, tutorials, articles, and social media showcases.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="orange-glow-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Content</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#050505] mb-3">
                <MediaFallback
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-[#FF7A00] font-bold">
                  {item.platform}
                </span>
              </div>
              <h4 className="font-display text-sm font-bold text-white line-clamp-2">{item.title}</h4>
              <p className="text-xs text-[#777777] mt-1 line-clamp-2">{item.caption}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#555555]">{item.date}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-[#B8B8B8] hover:text-[#FF7A00] transition-colors cursor-pointer"
                  title="Edit Content"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmItem(item)}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-[#B8B8B8] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Content Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmItem)}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={confirmDeleteContent}
        title="Delete Content Item"
        itemTitle={deleteConfirmItem?.title}
        itemCategory={deleteConfirmItem?.platform}
        description="Are you sure you want to permanently delete this content item? It will be immediately removed from the portfolio database and videos showcase."
        confirmText="Delete Content"
        cancelText="Cancel"
        isLoading={loading}
        variant="danger"
      />

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-2xl">
            <h4 className="font-display text-xl font-bold text-white mb-5">
              {editingId ? 'Edit Content Item' : 'New Content Item'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as PlatformType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p} className="bg-[#0D0D0D]">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">URL</label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">Caption / Summary</label>
                <textarea
                  rows={2}
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
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
