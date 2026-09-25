import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Award,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { MediaFallback } from '../MediaFallback';
import { AboutEditorConfig, MediaAssetItem } from '../../types';

export const AboutManager: React.FC = () => {
  const { aboutConfig, updateAboutConfig, updateProfile, profile } = usePortfolio();
  const { token } = useAuth();

  const [form, setForm] = useState<AboutEditorConfig | null>(null);
  const [newParagraph, setNewParagraph] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);

  const handlePhotoUpload = async (file: File) => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usage', 'about');

    try {
      const res = await apiFetch('/api/media/upload', {
        method: 'POST',
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setForm(prev => prev ? { ...prev, profileImage: data.fileUrl } : prev);
      }
    } catch {
      // Ignored
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const openMediaPicker = async () => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    try {
      const res = await apiFetch('/api/media', {
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
      });
      if (res.ok) {
        const list = await res.json();
        setMediaAssets(list);
      }
    } catch {
      // Ignored
    }
    setPickerOpen(true);
  };

  useEffect(() => {
    if (aboutConfig) {
      setForm(JSON.parse(JSON.stringify(aboutConfig)));
    } else if (profile) {
      setForm({
        heading: "Engineering Code & Visual Craft",
        subheading: "BRIDGING INTELLIGENCE, SYSTEMS & MEDIA",
        profileImage: profile.media?.aboutPhoto || "/assets/about-manikantha.svg",
        shortIntro: "Bridging Artificial Intelligence, Modern Web Systems & Cinematic Media",
        longDescription: profile.aboutBio || [
          "I am an enthusiastic AI/ML learner & developer, creative web designer, and digital content creator driven by the pursuit of futuristic technology and aesthetic precision.",
          "My work bridges intelligent algorithms, high-performance web systems, and cinematic video storytelling to turn bold ideas into impactful reality.",
          "Whether developing scalable web platforms, training predictive neural models, or automating repetitive business workflows, I focus on delivering seamless, human-centered experiences.",
        ],
        yearsExperience: "3+",
        projectsCompleted: "50+",
        certificationsCount: "12+",
        visibility: {
          showPhoto: true,
          showBadges: true,
          showStats: true,
          showCta: true,
        },
      });
    }
  }, [aboutConfig, profile]);

  if (!form) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A00]" />
        Loading About Section Configuration...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const success = await updateAboutConfig(form);
    if (form.profileImage) {
      await updateProfile?.({
        media: {
          aboutPhoto: form.profileImage,
        } as any,
      });
    }
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save About section configuration.');
    }
  };

  const addParagraph = () => {
    if (!newParagraph.trim()) return;
    setForm({
      ...form,
      longDescription: [...form.longDescription, newParagraph.trim()],
    });
    setNewParagraph('');
  };

  const removeParagraph = (index: number) => {
    setForm({
      ...form,
      longDescription: form.longDescription.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <User className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              About Section Editor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Customize personal biography, headline narratives, quick metrics, and portrait image.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save About Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          About configuration saved successfully.
        </div>
      )}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {saveError}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Headings */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            Section Titles &amp; Intro
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Eyebrow Subheading</label>
              <input
                type="text"
                value={form.subheading}
                onChange={e => setForm({ ...form, subheading: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="ABOUT MANIKANTHA"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Main Section Heading</label>
              <input
                type="text"
                value={form.heading}
                onChange={e => setForm({ ...form, heading: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="Engineering Code & Visual Craft"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Bio Hook / High-Impact Headline</label>
            <input
              type="text"
              value={form.shortIntro}
              onChange={e => setForm({ ...form, shortIntro: e.target.value })}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
              placeholder="Bridging Artificial Intelligence, Modern Web Systems & Cinematic Media"
            />
          </div>
        </div>

        {/* Bio Paragraphs */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <User className="w-4 h-4 text-[#FF7A00]" />
            Biography Paragraphs
          </h3>

          <div className="space-y-3">
            {form.longDescription.map((p, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="font-mono text-xs text-[#FF7A00] font-bold mt-1">0{idx + 1}</span>
                <textarea
                  rows={2}
                  value={p}
                  onChange={e => {
                    const updated = [...form.longDescription];
                    updated[idx] = e.target.value;
                    setForm({ ...form, longDescription: updated });
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeParagraph(idx)}
                  className="text-zinc-500 hover:text-red-400 p-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <textarea
              rows={2}
              value={newParagraph}
              onChange={e => setNewParagraph(e.target.value)}
              placeholder="Write a new paragraph..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white resize-none"
            />
            <button
              type="button"
              onClick={addParagraph}
              className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Paragraph</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights / Metrics */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF7A00]" />
            Quick Experience Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Years Experience</label>
              <input
                type="text"
                value={form.yearsExperience}
                onChange={e => setForm({ ...form, yearsExperience: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="3+"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Projects Completed</label>
              <input
                type="text"
                value={form.projectsCompleted}
                onChange={e => setForm({ ...form, projectsCompleted: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="50+"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Certifications Count</label>
              <input
                type="text"
                value={form.certificationsCount}
                onChange={e => setForm({ ...form, certificationsCount: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="12+"
              />
            </div>
          </div>
        </div>

        {/* Portrait Image */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#FF7A00]" />
              About Section Portrait
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              Personal portrait visual shown in the About section card
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            {/* Visual Thumbnail Preview */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-black/80 border border-white/[0.1] overflow-hidden flex items-center justify-center shrink-0 relative group">
              <MediaFallback
                src={form.profileImage || '/assets/about-manikantha.svg'}
                alt="About Portrait Preview"
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Quick Actions & URL Input */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-[#A855F7]/15 hover:bg-[#A855F7]/25 border border-[#A855F7]/30 text-[#A855F7] text-xs font-mono font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingPhoto}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={openMediaPicker}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose from Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, profileImage: '/assets/about-manikantha.svg' })}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs font-mono cursor-pointer transition-colors"
                >
                  Reset Default
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Image Asset URL</label>
                <input
                  type="text"
                  value={form.profileImage}
                  onChange={e => setForm({ ...form, profileImage: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-[#FF7A00]"
                  placeholder="/uploads/about-portrait.png"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FF7A00]" />
            About Element Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'showPhoto', label: 'Show Photo Asset' },
              { key: 'showBadges', label: 'Show Orbit Badges' },
              { key: 'showStats', label: 'Show Quick Metrics' },
              { key: 'showCta', label: 'Show Contact CTA' },
            ].map(item => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:border-[#FF7A00]/30 transition-colors"
              >
                <span className="text-xs text-zinc-300 font-medium">{item.label}</span>
                <input
                  type="checkbox"
                  checked={form.visibility?.[item.key as keyof typeof form.visibility] ?? true}
                  onChange={e =>
                    setForm({
                      ...form,
                      visibility: {
                        ...form.visibility,
                        [item.key]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[85vh] p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.12] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#A855F7]/15 text-[#A855F7]">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-display text-base font-bold text-white">
                    Select About Section Portrait
                  </h4>
                  <p className="text-xs font-mono text-[#888888]">
                    Click any uploaded media asset to set as the active about section portrait
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
              {mediaAssets.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs">
                  No uploaded media assets found. Upload an image above first.
                </div>
              ) : (
                mediaAssets.map((asset) => {
                  const isCurrent = form.profileImage === asset.url;
                  return (
                    <div
                      key={asset.filename}
                      onClick={() => {
                        setForm({ ...form, profileImage: asset.url });
                        setPickerOpen(false);
                      }}
                      className={`group p-2.5 rounded-xl bg-white/[0.03] border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#A855F7] ring-1 ring-[#A855F7]/50 bg-[#A855F7]/5'
                          : 'border-white/[0.08] hover:border-white/[0.25]'
                      }`}
                    >
                      <div className="w-full h-28 rounded-lg bg-black/60 overflow-hidden flex items-center justify-center relative mb-2">
                        <MediaFallback
                          src={asset.url}
                          alt={asset.name || asset.filename}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        {isCurrent && (
                          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-[#A855F7] text-white font-mono font-bold text-[8px]">
                            ACTIVE
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-white block truncate font-medium">
                          {asset.name || asset.filename}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 block truncate">
                          {(asset.size / 1024).toFixed(0)} KB • {asset.usage || 'general'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
              <span className="text-xs font-mono text-zinc-500">
                {mediaAssets.length} assets available
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-mono cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
