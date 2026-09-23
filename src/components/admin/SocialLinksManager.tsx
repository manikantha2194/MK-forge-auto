import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Mail,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialLinkItem } from '../../types';

const PLATFORM_ICONS: Record<string, any> = {
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Mail,
  Globe,
  MessageCircle,
};

export const SocialLinksManager: React.FC = () => {
  const { socialLinks, addSocialLink, updateSocialLink, deleteSocialLink, reorderSocialLinks } = usePortfolio();

  const [editingSocial, setEditingSocial] = useState<SocialLinkItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingSocial({
      id: `social-${Date.now()}`,
      platform: '',
      url: '',
      icon: 'Globe',
      order: socialLinks.length + 1,
      enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocial) return;

    if (!editingSocial.platform.trim() || !editingSocial.url.trim()) {
      setFeedback('Please provide both Platform Name and URL.');
      return;
    }

    if (isAdding) {
      await addSocialLink(editingSocial);
      setFeedback('Social link added.');
    } else {
      await updateSocialLink(editingSocial.id, editingSocial);
      setFeedback('Social link updated.');
    }

    setEditingSocial(null);
    setIsAdding(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this social link?')) {
      await deleteSocialLink(id);
      setFeedback('Social link removed.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;

    const newLinks = [...socialLinks];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    await reorderSocialLinks(newLinks.map(l => l.id));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <Share2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Social Links &amp; Profiles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage links appearing in header, hero, contact section, and footer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {feedback}
        </div>
      )}

      {/* Social Links List */}
      <div className="space-y-3">
        {socialLinks.map((social, idx) => {
          const IconComp = PLATFORM_ICONS[social.icon] || Globe;

          return (
            <div
              key={social.id}
              className={`p-4 rounded-xl bg-[#0D0D0D] border transition-all flex items-center justify-between gap-4 ${
                social.enabled ? 'border-white/[0.08]' : 'border-white/[0.04] opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00]">
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm font-display">
                      {social.platform}
                    </span>
                    {!social.enabled && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-[#00E5FF] font-mono flex items-center gap-1 truncate max-w-xs sm:max-w-md"
                  >
                    <span>{social.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === socialLinks.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingSocial(social);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] cursor-pointer"
                  title="Edit Link"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(social.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 cursor-pointer"
                  title="Delete Link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {editingSocial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.1] space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              {isAdding ? 'Add Social Profile' : 'Edit Social Profile'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="text-xs font-semibold text-white">Display on Site</div>
                  <div className="text-[11px] text-zinc-400">Publicly visible on header &amp; footer</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingSocial.enabled}
                  onChange={e => setEditingSocial({ ...editingSocial, enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Platform Name</label>
                <input
                  type="text"
                  value={editingSocial.platform}
                  onChange={e => setEditingSocial({ ...editingSocial, platform: e.target.value })}
                  placeholder="e.g. GitHub, LinkedIn, YouTube"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Profile URL</label>
                <input
                  type="text"
                  value={editingSocial.url}
                  onChange={e => setEditingSocial({ ...editingSocial, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Brand Icon</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {Object.keys(PLATFORM_ICONS).map(iconKey => {
                    const IconC = PLATFORM_ICONS[iconKey];
                    const isSelected = editingSocial.icon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setEditingSocial({ ...editingSocial, icon: iconKey })}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FF7A00] bg-[#FF7A00]/20 text-[#FF7A00]'
                            : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <IconC className="w-4 h-4" />
                        <span className="text-[9px] font-mono">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingSocial(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] cursor-pointer"
                >
                  {isAdding ? 'Add Profile' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
