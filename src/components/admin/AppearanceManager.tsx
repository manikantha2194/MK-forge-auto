import React, { useState, useEffect } from 'react';
import {
  Palette,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AppearanceConfig } from '../../types';

const PRESET_PALETTES = [
  { name: 'Forge Orange & Cyan', primary: '#FF7A00', secondary: '#00E5FF' },
  { name: 'Cyber Neon Purple', primary: '#A855F7', secondary: '#EC4899' },
  { name: 'Emerald Matrix', primary: '#10B981', secondary: '#06B6D4' },
  { name: 'Electric Gold', primary: '#F59E0B', secondary: '#EF4444' },
  { name: 'Pure Minimalist Monochrome', primary: '#FFFFFF', secondary: '#A1A1AA' },
];

export const AppearanceManager: React.FC = () => {
  const { appearance, updateAppearance } = usePortfolio();

  const [form, setForm] = useState<AppearanceConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (appearance) {
      setForm(JSON.parse(JSON.stringify(appearance)));
    }
  }, [appearance]);

  if (!form) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A00]" />
        Loading Appearance Settings...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const success = await updateAppearance(form);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save appearance settings.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <Palette className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Appearance &amp; Theme Customization
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Fine-tune primary accent colors, ambient lighting, border styles, and dark aesthetics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Apply Theme'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Appearance theme settings applied successfully.
        </div>
      )}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {saveError}
        </div>
      )}

      {/* Preset Palettes */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF7A00]" />
          Quick Theme Preset Palettes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_PALETTES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  accentColor: preset.primary,
                  secondaryAccentColor: preset.secondary,
                })
              }
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="text-xs font-medium text-white">{preset.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full border border-black/50" style={{ backgroundColor: preset.primary }} />
                <span className="w-4 h-4 rounded-full border border-black/50" style={{ backgroundColor: preset.secondary }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Pickers & Sliders */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-5">
          <h3 className="text-sm font-bold text-white font-display">
            Accent Brand Colors
          </h3>

          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Primary Accent (MK Forge Core)</span>
              <span className="font-mono text-xs text-zinc-400">{form.accentColor}</span>
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="color"
                value={form.accentColor}
                onChange={e => setForm({ ...form, accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={form.accentColor}
                onChange={e => setForm({ ...form, accentColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Secondary Accent (Glows &amp; Highlights)</span>
              <span className="font-mono text-xs text-zinc-400">{form.secondaryAccentColor}</span>
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="color"
                value={form.secondaryAccentColor}
                onChange={e => setForm({ ...form, secondaryAccentColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={form.secondaryAccentColor}
                onChange={e => setForm({ ...form, secondaryAccentColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Card Preview */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FF7A00]" />
            Live Component Preview
          </h3>

          <div className="p-5 rounded-xl bg-[#050505] border border-white/[0.1] relative overflow-hidden space-y-3">
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: form.accentColor }}
            />

            <div className="flex items-center justify-between">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                style={{ backgroundColor: `${form.accentColor}20`, color: form.accentColor }}
              >
                THEME SAMPLE
              </span>
              <span className="text-[10px] font-mono text-zinc-500">60 FPS CYBER</span>
            </div>

            <h4 className="text-sm font-bold text-white font-display">
              Autonomous Machine Learning Interface
            </h4>
            <p className="text-xs text-zinc-400">
              This card reflects your selected colors and styling tokens.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-black cursor-default"
                style={{ backgroundColor: form.accentColor }}
              >
                Active Button
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-default"
                style={{ borderColor: `${form.secondaryAccentColor}60`, color: form.secondaryAccentColor }}
              >
                Outline Button
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
