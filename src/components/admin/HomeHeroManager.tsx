import React, { useState, useEffect } from 'react';
import {
  Home,
  Save,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { MediaFallback } from '../MediaFallback';
import { HeroEditorConfig, MediaAssetItem } from '../../types';

export const HomeHeroManager: React.FC = () => {
  const { heroConfig, updateHeroConfig, updateProfile, profile } = usePortfolio();
  const { token } = useAuth();

  const [form, setForm] = useState<HeroEditorConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingChar, setIsUploadingChar] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);

  const handleCharUpload = async (file: File) => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    setIsUploadingChar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usage', 'home-character');

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
      setIsUploadingChar(false);
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
    if (heroConfig) {
      setForm(JSON.parse(JSON.stringify(heroConfig)));
    } else if (profile) {
      setForm({
        heading: profile.mainHeadline || "FREELANCER",
        subtitle: profile.subHeadline || "AI/ML • WEB DESIGNER • CONTENT CREATOR",
        description: profile.tagline || "Turning Ideas into Digital Reality",
        profileImage: profile.media?.heroCharacter || "/assets/hero-character.svg",
        primaryBtnText: "Explore Portfolio",
        primaryBtnUrl: "#work",
        secondaryBtnText: "Initiate Collab",
        secondaryBtnUrl: "#contact",
        badgeText: profile.shortGreeting || "HI, I'M MANI",
        visibility: {
          showHero: true,
          showBadge: true,
          showGreeting: true,
          showHeadline: true,
          showDescription: true,
          showButtons: true,
          showCharacter: true,
          showTechBadges: true,
        },
      });
    }
  }, [heroConfig, profile]);

  if (!form) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A00]" />
        Loading Hero Section Configuration...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const success = await updateHeroConfig(form);
    if (form.profileImage) {
      const currentMedia = profile?.media || {
        heroCharacter: '/assets/hero-character.svg',
        aboutPhoto: '/assets/about-manikantha.svg',
        brandIcon: '/assets/mk-logo.svg',
        brandBanner: '/assets/mk-forge-auto.svg',
      };
      await updateProfile?.({
        media: {
          heroCharacter: form.profileImage,
          aboutPhoto: currentMedia.aboutPhoto || '/assets/about-manikantha.svg',
          brandIcon: currentMedia.brandIcon || '/assets/mk-logo.svg',
          brandBanner: currentMedia.brandBanner || '/assets/mk-forge-auto.svg',
        },
      });
    }
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save Hero section configuration.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <Home className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Home &amp; Hero Section Editor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage main titles, eyebrow greetings, mission statements, CTA buttons, and character artwork.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Hero Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Hero configuration saved successfully.
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
        {/* Headlines & Text */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            Hero Headlines &amp; Tagline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Eyebrow Badge Greeting</label>
              <input
                type="text"
                value={form.badgeText}
                onChange={e => setForm({ ...form, badgeText: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="e.g. HI, I'M MANI"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Main Headline</label>
              <input
                type="text"
                value={form.heading}
                onChange={e => setForm({ ...form, heading: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                placeholder="e.g. FREELANCER"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Sub-Headline (Specialties)</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={e => setForm({ ...form, subtitle: e.target.value })}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
              placeholder="e.g. AI/ML • WEB DESIGNER • CONTENT CREATOR"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Description / Tagline</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white resize-none"
              placeholder="Architecting intelligent algorithms, cinematic motion, and high-performance digital platforms with futuristic precision."
            />
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-[#FF7A00]" />
            Call-to-Action (CTA) Buttons
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary CTA */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF7A00]">PRIMARY BUTTON</span>
                <span className="text-[10px] text-zinc-500 font-mono">Accent Solid</span>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Button Label</label>
                <input
                  type="text"
                  value={form.primaryBtnText}
                  onChange={e => setForm({ ...form, primaryBtnText: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] focus:outline-none"
                  placeholder="Hire Me"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Hire Me', 'Explore Portfolio', 'View My Work', 'Get in Touch'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        primaryBtnText: preset,
                        primaryBtnUrl: preset.toLowerCase().includes('hire') || preset.toLowerCase().includes('touch') ? '#contact' : '#work'
                      })}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                        form.primaryBtnText === preset
                          ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00]'
                          : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Target Link / Action</label>
                <input
                  type="text"
                  value={form.primaryBtnUrl}
                  onChange={e => setForm({ ...form, primaryBtnUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white font-mono focus:border-[#FF7A00] focus:outline-none"
                  placeholder="#work or #contact"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {['#work', '#contact', '#about'].map(hash => (
                    <button
                      key={hash}
                      type="button"
                      onClick={() => setForm({ ...form, primaryBtnUrl: hash })}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    >
                      {hash}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00E5FF]">SECONDARY BUTTON</span>
                <span className="text-[10px] text-zinc-500 font-mono">Outline Ghost</span>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Button Label</label>
                <input
                  type="text"
                  value={form.secondaryBtnText}
                  onChange={e => setForm({ ...form, secondaryBtnText: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                  placeholder="Initiate Collab"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Initiate Collab', 'Explore Portfolio', 'Hire Me', 'View Resume'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        secondaryBtnText: preset,
                        secondaryBtnUrl: preset.toLowerCase().includes('work') || preset.toLowerCase().includes('portfolio') ? '#work' : '#contact'
                      })}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                        form.secondaryBtnText === preset
                          ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                          : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300">Target Link / Action</label>
                <input
                  type="text"
                  value={form.secondaryBtnUrl}
                  onChange={e => setForm({ ...form, secondaryBtnUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                  placeholder="#contact or #work"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {['#contact', '#work', '#services'].map(hash => (
                    <button
                      key={hash}
                      type="button"
                      onClick={() => setForm({ ...form, secondaryBtnUrl: hash })}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    >
                      {hash}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Character / Visual Display */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#FF7A00]" />
              Hero Character / Visual Display
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              Primary 3D circular avatar shown on Home hero
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            {/* Visual Thumbnail Preview */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-black/80 border border-white/[0.1] overflow-hidden flex items-center justify-center shrink-0 relative group">
              <MediaFallback
                src={form.profileImage || '/assets/hero-character.svg'}
                alt="Hero Character Preview"
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Quick Actions & URL Input */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-[#FF7A00]/15 hover:bg-[#FF7A00]/25 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingChar ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingChar}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCharUpload(file);
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
                  onClick={() => setForm({ ...form, profileImage: '/assets/hero-character.svg' })}
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
                  placeholder="/uploads/hero-character.png"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FF7A00]" />
            Hero Element Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'showHero', label: 'Show Hero Section' },
              { key: 'showBadge', label: 'Show Eyebrow Badge' },
              { key: 'showHeadline', label: 'Show Main Headline' },
              { key: 'showButtons', label: 'Show CTA Buttons' },
              { key: 'showCharacter', label: 'Show Character Asset' },
              { key: 'showTechBadges', label: 'Show Highlight Pills' },
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
                <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-display text-base font-bold text-white">
                    Select Hero Character Visual
                  </h4>
                  <p className="text-xs font-mono text-[#888888]">
                    Click any uploaded media asset to set as the active hero character
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
                          ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/50 bg-[#00E5FF]/5'
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
                          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-[#00E5FF] text-black font-mono font-bold text-[8px]">
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
