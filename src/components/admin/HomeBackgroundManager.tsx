import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  MousePointer,
  Box,
  Eye,
  EyeOff,
  Palette,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Save,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  Smartphone,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sun,
  ShieldCheck,
  ChevronRight,
  Upload,
  SlidersHorizontal,
  MoveUp,
  MoveDown,
  X,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import {
  HomeBackgroundConfig,
  BackgroundPanelItem,
  BackgroundLayerItem,
  MediaAssetItem,
  MediaUsage,
} from '../../types';
import { InteractiveHeroBackground } from '../InteractiveHeroBackground';
import { ConfirmDialog } from './ConfirmDialog';

export const HomeBackgroundManager: React.FC = () => {
  const { homeBackground, updateHomeBackground, resetHomeBackground } = usePortfolio();
  const { token } = useAuth();

  const [config, setConfig] = useState<HomeBackgroundConfig | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'layers' | 'media-assign' | 'panels' | 'motion' | 'visual' | '3d' | 'cursor'
  >('layers');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Uploaded media assets from server
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'assigned' | MediaUsage>('assigned');
  const [mediaSearch, setMediaSearch] = useState('');

  // Panel filter & search state
  const [panelFilter, setPanelFilter] = useState<'all' | '1' | '2' | '3' | 'visible' | 'hidden'>('all');
  const [panelSearch, setPanelSearch] = useState('');

  // Layer picker modal state
  const [isPickingLayerMedia, setIsPickingLayerMedia] = useState(false);

  // Panel edit modal state
  const [editingPanel, setEditingPanel] = useState<BackgroundPanelItem | null>(null);
  const [isAddingPanel, setIsAddingPanel] = useState(false);

  // Load config from context
  useEffect(() => {
    if (homeBackground) {
      setConfig(JSON.parse(JSON.stringify(homeBackground)));
    }
  }, [homeBackground]);

  // Load all media assets from server
  const loadMediaAssets = async () => {
    if (!token) return;
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data);
      }
    } catch (err) {
      console.error('Failed to load media assets for HomeBackgroundManager:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    loadMediaAssets();
  }, [token]);

  if (!config) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A00]" />
        Loading Home Background Configuration...
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const success = await updateHomeBackground(config);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save background configuration to server.');
    }
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    setIsSaving(true);
    const success = await resetHomeBackground();
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Panel mutations
  const handleSavePanel = (panel: BackgroundPanelItem) => {
    if (isAddingPanel) {
      const updatedPanels = [panel, ...config.panels];
      setConfig({ ...config, panels: updatedPanels });
    } else {
      const updatedPanels = config.panels.map(p => (p.id === panel.id ? panel : p));
      setConfig({ ...config, panels: updatedPanels });
    }
    setEditingPanel(null);
    setIsAddingPanel(false);
  };

  const handleDeletePanel = (id: string) => {
    setConfig({
      ...config,
      panels: config.panels.filter(p => p.id !== id),
    });
  };

  // Set assigned media as a background panel
  const handleAssignMediaAsPanel = (media: MediaAssetItem, row: 1 | 2 | 3) => {
    const cleanTitle = (media.originalName || media.name || media.filename)
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .toUpperCase();

    const newPanel: BackgroundPanelItem = {
      id: `p-media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      row,
      tag: media.usage === 'home-background' ? 'HERO BG' : 'MEDIA',
      tagColor: row === 1 ? 'orange' : row === 2 ? 'cyan' : 'purple',
      title: cleanTitle.length > 25 ? cleanTitle.substring(0, 22) + '...' : cleanTitle,
      category: 'Brand Media',
      tech: `Row ${row} • 3D Parallax Active`,
      iconName: 'ImageIcon',
      previewType: 'grid',
      stats: `${(media.size / 1024).toFixed(0)} KB`,
      imageUrl: media.url,
      mediaAssetId: media.id,
      enabled: true,
      parallax: true,
      glow: true,
      blur: 0,
      opacity: 1,
    };

    setConfig({
      ...config,
      panels: [newPanel, ...config.panels],
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Set assigned media as full-bleed backdrop image
  const handleSetAsMainBackdrop = (media: MediaAssetItem) => {
    setConfig({
      ...config,
      backgroundImage: media.url,
      backgroundMediaId: media.id,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Remove main backdrop image
  const handleRemoveMainBackdrop = () => {
    setConfig({
      ...config,
      backgroundImage: '',
      backgroundMediaId: undefined,
    });
  };

  // Toggle individual panel 3D Parallax
  const handleTogglePanelParallax = (panelId: string) => {
    const updated = config.panels.map(p => {
      if (p.id === panelId) {
        const currentParallax = p.parallax !== false;
        return { ...p, parallax: !currentParallax };
      }
      return p;
    });
    setConfig({ ...config, panels: updated });
  };

  // Toggle individual panel Glow
  const handleTogglePanelGlow = (panelId: string) => {
    const updated = config.panels.map(p => {
      if (p.id === panelId) {
        return { ...p, glow: !p.glow };
      }
      return p;
    });
    setConfig({ ...config, panels: updated });
  };

  // Quick cycle panel row
  const handleCyclePanelRow = (panelId: string) => {
    const updated = config.panels.map(p => {
      if (p.id === panelId) {
        const nextRow = ((p.row % 3) + 1) as 1 | 2 | 3;
        return { ...p, row: nextRow };
      }
      return p;
    });
    setConfig({ ...config, panels: updated });
  };

  // Add media as a Backdrop Layer in the multi-layer stack
  const handleAddBackdropLayer = (mediaOrUrl?: MediaAssetItem | string, customUrl?: string) => {
    const isString = typeof mediaOrUrl === 'string';
    const media = isString ? undefined : mediaOrUrl;
    const directUrl = isString ? mediaOrUrl : customUrl;
    const currentLayers = config.backdropLayers || [];
    const layerName = media
      ? (media.originalName || media.name || media.filename).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      : `Layer ${currentLayers.length + 1}`;

    const newLayer: BackgroundLayerItem = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mediaAssetId: media?.id,
      imageUrl: media ? media.url : (directUrl || ''),
      name: layerName,
      order: currentLayers.length + 1,
      opacity: 1,
      blendMode: 'normal',
      blur: 0,
      parallaxSpeed: 1,
      animation: 'drift',
      enabled: true,
      scale: 1.02,
    };

    setConfig({
      ...config,
      backdropLayers: [...currentLayers, newLayer],
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Batch add all uploaded 'home-background' assets to backdrop layers stack
  const handleBatchAddHomeBackgroundAssetsToLayers = () => {
    const bgAssets = mediaAssets.filter(m => m.usage === 'home-background');
    if (bgAssets.length === 0) return;

    const currentLayers = [...(config.backdropLayers || [])];
    bgAssets.forEach((asset, idx) => {
      const exists = currentLayers.some(l => l.imageUrl === asset.url || l.mediaAssetId === asset.id);
      if (!exists) {
        currentLayers.push({
          id: `layer-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          mediaAssetId: asset.id,
          imageUrl: asset.url,
          name: (asset.originalName || asset.name || asset.filename).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          order: currentLayers.length + 1,
          opacity: 1,
          blendMode: idx === 0 ? 'normal' : 'screen',
          blur: 0,
          parallaxSpeed: 0.8 + (idx % 3) * 0.2,
          animation: idx % 2 === 0 ? 'drift' : 'float',
          enabled: true,
          scale: 1.02,
        });
      }
    });

    setConfig({
      ...config,
      backdropLayers: currentLayers,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Batch add all uploaded 'home-background' assets as 3D parallax panels
  const handleBatchAddHomeBackgroundAssetsToPanels = () => {
    const bgAssets = mediaAssets.filter(m => m.usage === 'home-background');
    if (bgAssets.length === 0) return;

    const currentPanels = [...(config.panels || [])];
    bgAssets.forEach((asset, idx) => {
      const cleanTitle = (asset.originalName || asset.name || asset.filename)
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .toUpperCase();
      const targetRow = ((idx % 3) + 1) as 1 | 2 | 3;

      currentPanels.unshift({
        id: `p-media-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        row: targetRow,
        tag: 'HERO BG',
        tagColor: targetRow === 1 ? 'orange' : targetRow === 2 ? 'cyan' : 'purple',
        title: cleanTitle.length > 25 ? cleanTitle.substring(0, 22) + '...' : cleanTitle,
        category: 'Layer Asset',
        tech: `Row ${targetRow} • 3D Parallax`,
        iconName: 'ImageIcon',
        previewType: 'grid',
        stats: `${(asset.size / 1024).toFixed(0)} KB`,
        imageUrl: asset.url,
        mediaAssetId: asset.id,
        enabled: true,
        order: currentPanels.length + 1,
        parallax: true,
        glow: true,
        blur: 0,
        opacity: 1,
      });
    });

    setConfig({
      ...config,
      panels: currentPanels,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Reorder backdrop layer up or down in stack
  const handleMoveBackdropLayer = (id: string, direction: 'up' | 'down') => {
    const layers = [...(config.backdropLayers || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < layers.length - 1) {
      const tempOrder = layers[index].order;
      layers[index].order = layers[index + 1].order;
      layers[index + 1].order = tempOrder;
    } else if (direction === 'down' && index > 0) {
      const tempOrder = layers[index].order;
      layers[index].order = layers[index - 1].order;
      layers[index - 1].order = tempOrder;
    }

    layers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const reindexed = layers.map((l, idx) => ({ ...l, order: idx + 1 }));
    setConfig({ ...config, backdropLayers: reindexed });
  };

  // Update backdrop layer fields
  const handleUpdateBackdropLayer = (id: string, updates: Partial<BackgroundLayerItem>) => {
    const updated = (config.backdropLayers || []).map(l => (l.id === id ? { ...l, ...updates } : l));
    setConfig({ ...config, backdropLayers: updated });
  };

  // Remove backdrop layer
  const handleRemoveBackdropLayer = (id: string) => {
    const updated = (config.backdropLayers || []).filter(l => l.id !== id);
    setConfig({ ...config, backdropLayers: updated });
  };

  // Toggle backdrop layer visibility
  const handleToggleBackdropLayerVisibility = (id: string) => {
    const updated = (config.backdropLayers || []).map(l => {
      if (l.id === id) {
        return { ...l, enabled: l.enabled === false ? true : false };
      }
      return l;
    });
    setConfig({ ...config, backdropLayers: updated });
  };

  // Toggle individual panel visibility
  const handleTogglePanelVisibility = (panelId: string) => {
    const updated = config.panels.map(p => {
      if (p.id === panelId) {
        return { ...p, enabled: p.enabled === false ? true : false };
      }
      return p;
    });
    setConfig({ ...config, panels: updated });
  };

  // Update individual panel opacity
  const handleUpdatePanelOpacity = (panelId: string, opacity: number) => {
    const updated = config.panels.map(p => {
      if (p.id === panelId) {
        return { ...p, opacity };
      }
      return p;
    });
    setConfig({ ...config, panels: updated });
  };

  // Reorder panel order up/down
  const handleMovePanelOrder = (panelId: string, direction: 'up' | 'down') => {
    const panels = [...config.panels];
    const index = panels.findIndex(p => p.id === panelId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = panels[index];
      panels[index] = panels[index - 1];
      panels[index - 1] = temp;
    } else if (direction === 'down' && index < panels.length - 1) {
      const temp = panels[index];
      panels[index] = panels[index + 1];
      panels[index + 1] = temp;
    }

    const reindexed = panels.map((p, idx) => ({ ...p, order: idx + 1 }));
    setConfig({ ...config, panels: reindexed });
  };

  // Set specific panel order
  const handleSetPanelOrder = (panelId: string, order: number) => {
    const updated = config.panels.map(p => (p.id === panelId ? { ...p, order } : p));
    setConfig({ ...config, panels: updated });
  };

  // Toggle all panels visibility
  const handleToggleAllPanelsVisibility = (visible: boolean) => {
    const updated = config.panels.map(p => ({ ...p, enabled: visible }));
    setConfig({ ...config, panels: updated });
  };

  // Reset all panel opacities to 1.0
  const handleResetAllPanelsOpacity = () => {
    const updated = config.panels.map(p => ({ ...p, opacity: 1 }));
    setConfig({ ...config, panels: updated });
  };

  // Filtered media assets
  const filteredMedia = mediaAssets.filter(media => {
    const matchesFilter =
      mediaFilter === 'all'
        ? true
        : mediaFilter === 'assigned'
        ? media.usage === 'home-background'
        : media.usage === mediaFilter;

    const query = mediaSearch.toLowerCase();
    const matchesSearch =
      !query ||
      (media.originalName && media.originalName.toLowerCase().includes(query)) ||
      (media.filename && media.filename.toLowerCase().includes(query)) ||
      (media.name && media.name.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const assignedCount = mediaAssets.filter(m => m.usage === 'home-background').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Home 3D Background Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Assign uploaded media to 3D background panels, control animation velocity, blur, glow halo, and toggle individual panel 3D parallax effects.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Enable/Disable Toggle */}
          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              config.enabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            {config.enabled ? 'Background Active' : 'Background Disabled'}
          </button>

          {/* Reset to Default */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Banners */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Home background configuration updated and persisted. Live on Home page.
        </div>
      )}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {saveError}
        </div>
      )}

      {/* Live Interactive Preview Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              REAL-TIME INTERACTIVE VIEWPORT (Hover to test cursor &amp; tilt)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
            <span>Speed: {config.autoMotion.speed.toFixed(1)}x</span>
            <span>•</span>
            <span>Blur: {config.visual.blur || 0}px</span>
            <span>•</span>
            <span>Glow: {(config.visual.glowIntensity ?? 1.0).toFixed(1)}x</span>
            <span>•</span>
            <span>Panels: {config.panels.length}</span>
          </div>
        </div>

        <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden bg-[#050505] border border-white/[0.1] shadow-2xl">
          <InteractiveHeroBackground config={config} isPreview={true} />

          {/* Overlay Tag Indicator */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/[0.1] backdrop-blur-md">
            <MousePointer className="w-3 h-3 text-[#FF7A00]" />
            <span className="text-[10px] font-mono text-zinc-300">
              Move cursor over viewport to preview 3D Parallax physics
            </span>
          </div>

          {config.backgroundImage && (
            <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Custom Backdrop Active</span>
            </div>
          )}

          <div className="absolute bottom-4 right-4 z-20 pointer-events-none px-2.5 py-1 rounded-md bg-black/70 border border-white/[0.1] text-[10px] font-mono text-zinc-400 backdrop-blur-md">
            Direction: {config.autoMotion.direction} • 3D Tilt: {config.motion3D.tiltIntensity}x
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto">
        {[
          {
            id: 'layers',
            label: 'Backdrop Layers Stack',
            icon: SlidersHorizontal,
            count: config.backdropLayers?.length || 0,
          },
          {
            id: 'media-assign',
            label: 'Media Assets & Assign',
            icon: ImageIcon,
            count: assignedCount > 0 ? `${assignedCount} Assigned` : mediaAssets.length,
          },
          {
            id: 'panels',
            label: 'Panel Cards & Sorting',
            icon: Layers,
            count: config.panels?.length || 0,
          },
          { id: 'motion', label: 'Continuous Motion', icon: Play },
          { id: 'visual', label: 'Visual, Blur & Glows', icon: Palette },
          { id: '3d', label: '3D Perspective & Depth', icon: Box },
          { id: 'cursor', label: 'Cursor Interaction', icon: MousePointer },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF7A00] text-black shadow-[0_0_12px_rgba(255,122,0,0.3)]'
                  : 'text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 0: BACKDROP LAYERS STACK (COMPOSITE MULTIPLE BACKGROUND ASSETS)  */}
      {/* ========================================================================= */}
      {activeSubTab === 'layers' && (
        <div className="space-y-6">
          {/* Subheader info card */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF7A00]" />
                Multi-Layer Animated Backdrop Stack ({(config.backdropLayers || []).length} Layers)
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Layer multiple <strong className="text-[#FF7A00]">Home Background</strong> assets together to create rich multi-plane atmospheres. Adjust individual layer order (stacking z-depth), opacity, blend modes, blur, and motion animation.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Batch add all assigned assets */}
              {assignedCount > 0 && (
                <button
                  type="button"
                  onClick={handleBatchAddHomeBackgroundAssetsToLayers}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 border border-[#FF7A00]/30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Automatically import all uploaded assets tagged with 'Home Background' into this layer stack"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>⚡ Batch Add 'Home Background' Assets ({assignedCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPickingLayerMedia(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors cursor-pointer shadow-[0_0_12px_rgba(255,122,0,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Layer From Media</span>
              </button>
            </div>
          </div>

          {/* Stacking Order Indicator Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-white/[0.02] border border-white/[0.06] px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-[#FF7A00] font-bold">Stacking Order:</span>
              <span>Layer 1 = Base/Deep Canvas (Back) ➔ Highest Layer = Overlay (Front)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const updated = (config.backdropLayers || []).map(l => ({ ...l, enabled: true }));
                  setConfig({ ...config, backdropLayers: updated });
                }}
                className="hover:text-white cursor-pointer"
              >
                Show All
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = (config.backdropLayers || []).map(l => ({ ...l, enabled: false }));
                  setConfig({ ...config, backdropLayers: updated });
                }}
                className="hover:text-white cursor-pointer"
              >
                Hide All
              </button>
            </div>
          </div>

          {/* Layer Cards */}
          {(!config.backdropLayers || config.backdropLayers.length === 0) ? (
            <div className="p-12 text-center bg-[#0D0D0D] rounded-2xl border border-white/[0.06] space-y-4">
              <SlidersHorizontal className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-zinc-300 font-semibold text-sm">No Backdrop Layers In Stack Yet</div>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Combine multiple images or textures into a layered animated background. You can import all media assets tagged as 'Home Background' or select uploaded images.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {assignedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchAddHomeBackgroundAssetsToLayers}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load All {assignedCount} 'Home Background' Assets
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPickingLayerMedia(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
                >
                  Choose From Media Library
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[...(config.backdropLayers || [])]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((layer, idx, allSorted) => {
                  const isVisible = layer.enabled !== false;
                  const isTop = idx === allSorted.length - 1;
                  const isBottom = idx === 0;

                  return (
                    <div
                      key={layer.id}
                      className={`p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border transition-all ${
                        isVisible
                          ? 'border-white/[0.1] hover:border-white/[0.2]'
                          : 'border-white/[0.04] opacity-60 bg-[#070707]'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Left: Thumbnail & Layer Info */}
                        <div className="flex items-center gap-3.5 w-full lg:w-auto">
                          {/* Layer order badge */}
                          <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Layer</span>
                            <span className="text-base font-mono font-bold text-[#FF7A00]">{layer.order || idx + 1}</span>
                          </div>

                          {/* Thumbnail */}
                          <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/[0.1] shrink-0">
                            <img
                              src={layer.imageUrl}
                              alt={layer.name || 'Layer'}
                              className="w-full h-full object-cover"
                            />
                            {!isVisible && (
                              <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                                <EyeOff className="w-4 h-4 text-zinc-500" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs sm:text-sm truncate">
                                {layer.name || `Backdrop Layer ${layer.order || idx + 1}`}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                  isVisible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-zinc-400'
                                }`}
                              >
                                {isVisible ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-1">
                              <span>Blend: {layer.blendMode || 'normal'}</span>
                              <span>•</span>
                              <span>Motion: {layer.animation || 'drift'}</span>
                              <span>•</span>
                              <span>Opacity: {Math.round((layer.opacity !== undefined ? layer.opacity : 1) * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Controls (Opacity, Blend, Animation, Blur) */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full lg:w-auto lg:flex-1 lg:max-w-2xl px-1">
                          {/* Opacity slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-zinc-400">Opacity</span>
                              <span className="text-[#FF7A00] font-bold">
                                {Math.round((layer.opacity !== undefined ? layer.opacity : 1) * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.0"
                              max="1.0"
                              step="0.05"
                              value={layer.opacity !== undefined ? layer.opacity : 1}
                              onChange={e =>
                                handleUpdateBackdropLayer(layer.id, { opacity: parseFloat(e.target.value) })
                              }
                              className="w-full accent-[#FF7A00] cursor-pointer"
                            />
                          </div>

                          {/* Blend Mode */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono text-zinc-400 block">Blend Mode</span>
                            <select
                              value={layer.blendMode || 'normal'}
                              onChange={e =>
                                handleUpdateBackdropLayer(layer.id, { blendMode: e.target.value as any })
                              }
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white focus:border-[#FF7A00] outline-none font-mono"
                            >
                              <option value="normal">Normal</option>
                              <option value="screen">Screen (Lightening)</option>
                              <option value="overlay">Overlay (Punchy)</option>
                              <option value="soft-light">Soft Light</option>
                              <option value="color-dodge">Color Dodge (Glow)</option>
                              <option value="multiply">Multiply (Darken)</option>
                              <option value="luminosity">Luminosity</option>
                            </select>
                          </div>

                          {/* Motion Animation */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono text-zinc-400 block">Motion Flow</span>
                            <select
                              value={layer.animation || 'drift'}
                              onChange={e =>
                                handleUpdateBackdropLayer(layer.id, { animation: e.target.value as any })
                              }
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white focus:border-[#FF7A00] outline-none font-mono"
                            >
                              <option value="drift">Subtle Drift (Pan)</option>
                              <option value="float">Vertical Float (Wave)</option>
                              <option value="zoom">Breathing Zoom</option>
                              <option value="pulse">Opacity Pulse</option>
                              <option value="none">Static (No Motion)</option>
                            </select>
                          </div>

                          {/* Blur */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-zinc-400">Layer Blur</span>
                              <span className="text-zinc-300">{layer.blur || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              step="1"
                              value={layer.blur || 0}
                              onChange={e =>
                                handleUpdateBackdropLayer(layer.id, { blur: parseInt(e.target.value) })
                              }
                              className="w-full accent-[#FF7A00] cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Right: Layer Ordering & Actions */}
                        <div className="flex items-center gap-1.5 self-end lg:self-center shrink-0">
                          {/* Visibility toggle button */}
                          <button
                            type="button"
                            onClick={() => handleToggleBackdropLayerVisibility(layer.id)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/[0.08]'
                            }`}
                            title={isVisible ? 'Hide this layer' : 'Show this layer'}
                          >
                            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          {/* Reorder Up / Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveBackdropLayer(layer.id, 'down')}
                            disabled={isBottom}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isBottom
                                ? 'opacity-30 cursor-not-allowed border-transparent text-zinc-600'
                                : 'bg-white/[0.03] text-zinc-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
                            }`}
                            title="Send layer downward (Towards deep base background)"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveBackdropLayer(layer.id, 'up')}
                            disabled={isTop}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isTop
                                ? 'opacity-30 cursor-not-allowed border-transparent text-zinc-600'
                                : 'bg-white/[0.03] text-zinc-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
                            }`}
                            title="Bring layer upward (Towards foreground overlay)"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          {/* Delete Layer */}
                          <button
                            type="button"
                            onClick={() => handleRemoveBackdropLayer(layer.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer ml-1"
                            title="Remove this layer from background"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SET ASSIGNED MEDIA AS BACKGROUND PANELS                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'media-assign' && (
        <div className="space-y-6">
          {/* Subheader info card */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF7A00]" />
                Media Assets to Background Panels
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Take any uploaded asset from your Media Library (especially those assigned to{' '}
                <strong className="text-[#FF7A00]">Home Background</strong>) and bind them directly as
                moving 3D parallax cards across Row 1, Row 2, or Row 3, or set as the full-bleed backdrop.
              </p>
            </div>

            {config.backgroundImage && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <img
                  src={config.backgroundImage}
                  alt="Backdrop"
                  className="w-12 h-10 object-cover rounded-lg border border-white/[0.1]"
                />
                <div className="text-left">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    Active Full Backdrop
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMainBackdrop}
                    className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer mt-0.5 block"
                  >
                    Clear Backdrop
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setMediaFilter('assigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  mediaFilter === 'assigned'
                    ? 'bg-[#FF7A00] text-black font-bold'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                Assigned to Home Background ({assignedCount})
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  mediaFilter === 'all'
                    ? 'bg-[#FF7A00] text-black font-bold'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                All Media Assets ({mediaAssets.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={mediaSearch}
                onChange={e => setMediaSearch(e.target.value)}
                placeholder="Search media by name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:border-[#FF7A00] outline-none"
              />
            </div>
          </div>

          {/* Quick Batch Actions for Home Background Media */}
          {assignedCount > 0 && (
            <div className="p-4 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF7A00] shrink-0" />
                <span className="text-xs font-semibold text-white">
                  Batch Operations for <strong className="text-[#FF7A00]">{assignedCount}</strong> 'Home Background' Assets
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleBatchAddHomeBackgroundAssetsToLayers}
                  className="px-3 py-1.5 rounded-lg bg-[#FF7A00]/15 hover:bg-[#FF7A00]/25 text-[#FF7A00] border border-[#FF7A00]/30 text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Import all Home Background assets into the multi-layer backdrop stack"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>+ Add All to Backdrop Stack</span>
                </button>
                <button
                  type="button"
                  onClick={handleBatchAddHomeBackgroundAssetsToPanels}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Generate 3D parallax panels for all Home Background assets distributed across Rows 1, 2, and 3"
                >
                  <Layers className="w-3 h-3" />
                  <span>+ Add All as 3D Panels</span>
                </button>
              </div>
            </div>
          )}

          {/* Media Grid */}
          {loadingMedia ? (
            <div className="p-12 text-center text-zinc-400 font-mono text-xs flex items-center justify-center gap-2 bg-[#0D0D0D] rounded-2xl border border-white/[0.06]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A00]" />
              Loading Media Assets...
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="p-12 text-center bg-[#0D0D0D] rounded-2xl border border-white/[0.06] space-y-3">
              <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-zinc-300 font-semibold text-sm">No media matches this filter</div>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                {mediaFilter === 'assigned'
                  ? 'No media assets are tagged with "Home Background" yet. Switch to "All Media Assets" or visit the Media & Brand Visuals tab to assign tags.'
                  : 'No uploaded media assets found. Upload images in the Media Assets section.'}
              </p>
              {mediaFilter === 'assigned' && (
                <button
                  type="button"
                  onClick={() => setMediaFilter('all')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors cursor-pointer"
                >
                  Show All {mediaAssets.length} Uploaded Assets
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMedia.map(media => {
                // Check if this media is already assigned as a panel
                const activePanelsForMedia = config.panels.filter(
                  p => p.imageUrl === media.url || p.mediaAssetId === media.id
                );
                const isBackdrop = config.backgroundImage === media.url;

                return (
                  <div
                    key={media.id}
                    className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.2] transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/[0.06] mb-3">
                        <img
                          src={media.url}
                          alt={media.originalName || media.filename}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              media.usage === 'home-background'
                                ? 'bg-[#FF7A00] text-black shadow-[0_0_8px_rgba(255,122,0,0.5)]'
                                : 'bg-black/70 text-zinc-300 border border-white/[0.1]'
                            }`}
                          >
                            {media.usage}
                          </span>
                          {isBackdrop && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500 text-black">
                              Backdrop
                            </span>
                          )}
                        </div>

                        {activePanelsForMedia.length > 0 && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            {activePanelsForMedia.map((p, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-black/80 border border-white/[0.1] text-[9px] font-mono font-bold text-[#00E5FF]"
                              >
                                In Row {p.row}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* File Details */}
                      <div className="font-semibold text-white text-xs truncate" title={media.originalName || media.filename}>
                        {media.originalName || media.name || media.filename}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1">
                        <span>{(media.size / 1024).toFixed(0)} KB</span>
                        <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action buttons: Set as Row 1, Row 2, Row 3, Backdrop, or Backdrop Layer */}
                    <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                      {/* Add as Backdrop Layer */}
                      <button
                        type="button"
                        onClick={() => handleAddBackdropLayer(media)}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 hover:border-[#FF7A00]/50 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Add this image to the multi-layer backdrop composite stack"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add to Backdrop Layers Stack</span>
                      </button>

                      <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                        Add As 3D Background Card:
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAssignMediaAsPanel(media, 1)}
                          className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-[#FF7A00]/20 hover:text-[#FF7A00] border border-white/[0.06] hover:border-[#FF7A00]/40 text-[10px] font-mono font-bold text-zinc-300 transition-all cursor-pointer text-center"
                          title="Row 1: Distant Layer, Speed: -24px/s"
                        >
                          + Row 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignMediaAsPanel(media, 2)}
                          className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] border border-white/[0.06] hover:border-[#00E5FF]/40 text-[10px] font-mono font-bold text-zinc-300 transition-all cursor-pointer text-center"
                          title="Row 2: Mid Depth, Speed: +18px/s"
                        >
                          + Row 2
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignMediaAsPanel(media, 3)}
                          className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-[#C084FC]/20 hover:text-[#C084FC] border border-white/[0.06] hover:border-[#C084FC]/40 text-[10px] font-mono font-bold text-zinc-300 transition-all cursor-pointer text-center"
                          title="Row 3: Foreground Depth, Speed: -30px/s"
                        >
                          + Row 3
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSetAsMainBackdrop(media)}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isBackdrop
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isBackdrop ? 'Current Main Backdrop' : 'Set as Full-Bleed Backdrop'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PANEL CARDS & SORTING (ORDER, OPACITY, VISIBILITY, PARALLAX)    */}
      {/* ========================================================================= */}
      {activeSubTab === 'panels' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF7A00]" />
                Background Card Library ({config.panels?.length || 0} Panels)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Reorder layer stacking sequence, adjust individual card opacity, toggle visibility on/off, and tune 3D parallax effects for each panel.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingPanel(true);
                  setEditingPanel({
                    id: `p-${Date.now()}`,
                    row: 1,
                    tag: 'MK STUDIO',
                    tagColor: 'orange',
                    title: 'New Dynamic Panel',
                    category: 'Full-Stack',
                    tech: 'React • 3D Parallax • Motion',
                    iconName: 'Code',
                    previewType: 'code',
                    stats: 'ACTIVE: 100%',
                    parallax: true,
                    glow: true,
                    blur: 0,
                    opacity: 1,
                    enabled: true,
                    order: (config.panels?.length || 0) + 1,
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors cursor-pointer shadow-[0_0_12px_rgba(255,122,0,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Card</span>
              </button>
            </div>
          </div>

          {/* Filtering & Sorting Controls Bar */}
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[
                  { id: 'all', label: 'All Panels', count: config.panels.length },
                  { id: '1', label: 'Row 1', count: config.panels.filter(p => p.row === 1).length },
                  { id: '2', label: 'Row 2', count: config.panels.filter(p => p.row === 2).length },
                  { id: '3', label: 'Row 3', count: config.panels.filter(p => p.row === 3).length },
                  { id: 'visible', label: 'Visible', count: config.panels.filter(p => p.enabled !== false).length },
                  { id: 'hidden', label: 'Hidden', count: config.panels.filter(p => p.enabled === false).length },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPanelFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      panelFilter === f.id
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={panelSearch}
                  onChange={e => setPanelSearch(e.target.value)}
                  placeholder="Filter cards by title or tech..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:border-[#FF7A00] outline-none"
                />
              </div>
            </div>

            {/* Quick Bulk Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
              <span className="text-zinc-500">
                Showing {
                  config.panels.filter(p => {
                    if (panelFilter === '1') return p.row === 1;
                    if (panelFilter === '2') return p.row === 2;
                    if (panelFilter === '3') return p.row === 3;
                    if (panelFilter === 'visible') return p.enabled !== false;
                    if (panelFilter === 'hidden') return p.enabled === false;
                    return true;
                  }).filter(p => {
                    if (!panelSearch) return true;
                    const q = panelSearch.toLowerCase();
                    return (
                      p.title.toLowerCase().includes(q) ||
                      p.tech.toLowerCase().includes(q) ||
                      p.tag.toLowerCase().includes(q)
                    );
                  }).length
                } of {config.panels.length} cards
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllPanelsVisibility(true)}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Show All</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllPanelsVisibility(false)}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <EyeOff className="w-3 h-3 text-zinc-500" />
                  <span>Hide All</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAllPanelsOpacity}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3 text-[#FF7A00]" />
                  <span>Reset Opacities (100%)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Panel Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.panels
              .filter(panel => {
                if (panelFilter === '1') return panel.row === 1;
                if (panelFilter === '2') return panel.row === 2;
                if (panelFilter === '3') return panel.row === 3;
                if (panelFilter === 'visible') return panel.enabled !== false;
                if (panelFilter === 'hidden') return panel.enabled === false;
                return true;
              })
              .filter(panel => {
                if (!panelSearch) return true;
                const q = panelSearch.toLowerCase();
                return (
                  panel.title.toLowerCase().includes(q) ||
                  panel.tech.toLowerCase().includes(q) ||
                  panel.tag.toLowerCase().includes(q)
                );
              })
              .map((panel, idx, allList) => {
                const isParallax = panel.parallax !== false;
                const isGlow = !!panel.glow;
                const isVisible = panel.enabled !== false;
                const currentOpacity = panel.opacity !== undefined ? panel.opacity : 1;
                const isFirst = idx === 0;
                const isLast = idx === allList.length - 1;

                return (
                  <div
                    key={panel.id}
                    className={`p-4 rounded-xl bg-[#0D0D0D] border transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${
                      !isVisible
                        ? 'border-white/[0.04] opacity-60 bg-[#070707]'
                        : isGlow
                        ? 'border-[#FF7A00]/40 shadow-[0_0_15px_rgba(255,122,0,0.1)]'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div>
                      {/* Header Row: Row badge + Layer Order Controls + Visibility Toggle */}
                      <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCyclePanelRow(panel.id)}
                            className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 transition-colors cursor-pointer"
                            title="Click to cycle row (Row 1 -> Row 2 -> Row 3)"
                          >
                            Row {panel.row}
                          </button>

                          {/* Layer Order Reorder buttons */}
                          <div className="flex items-center rounded bg-white/[0.04] border border-white/[0.06] px-1 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleMovePanelOrder(panel.id, 'up')}
                              disabled={isFirst}
                              className={`p-0.5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer ${
                                isFirst ? 'opacity-20 cursor-not-allowed' : ''
                              }`}
                              title="Move card order up (Higher layer priority)"
                            >
                              <ArrowUp className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-[9px] font-mono text-zinc-400 px-1 font-bold">
                              #{panel.order || idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMovePanelOrder(panel.id, 'down')}
                              disabled={isLast}
                              className={`p-0.5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer ${
                                isLast ? 'opacity-20 cursor-not-allowed' : ''
                              }`}
                              title="Move card order down (Lower layer priority)"
                            >
                              <ArrowDown className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visibility Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePanelVisibility(panel.id)}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isVisible
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                          }`}
                          title={isVisible ? 'Hide card from canvas' : 'Show card on canvas'}
                        >
                          {isVisible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                        </button>
                      </div>

                      {/* Image thumbnail if attached */}
                      {panel.imageUrl ? (
                        <div className="h-18 w-full rounded-lg overflow-hidden bg-black/40 mb-2 relative border border-white/[0.06]">
                          <img
                            src={panel.imageUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-75"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className="absolute bottom-1 right-2 text-[9px] font-mono text-zinc-300">
                            Custom Media
                          </span>
                          {!isVisible && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                                Hidden
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-12 w-full rounded-lg bg-white/[0.02] border border-white/[0.04] mb-2 flex items-center justify-between px-3 text-[10px] font-mono text-zinc-500">
                          <span>Preview: {panel.previewType}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              panel.tagColor === 'orange'
                                ? 'text-[#FF7A00] bg-[#FF7A00]/10'
                                : panel.tagColor === 'cyan'
                                ? 'text-[#00E5FF] bg-[#00E5FF]/10'
                                : panel.tagColor === 'purple'
                                ? 'text-[#C084FC] bg-[#C084FC]/10'
                                : 'text-[#34D399] bg-[#34D399]/10'
                            }`}
                          >
                            {panel.tag}
                          </span>
                        </div>
                      )}

                      <div className="font-semibold text-white text-xs tracking-wide truncate">
                        {panel.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                        {panel.tech}
                      </div>
                    </div>

                    {/* Dedicated Opacity Slider Directly on Card */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <SlidersHorizontal className="w-2.5 h-2.5 text-[#FF7A00]" />
                          <span>Opacity</span>
                        </span>
                        <span className="font-bold text-[#FF7A00]">
                          {Math.round(currentOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={currentOpacity}
                        onChange={e => handleUpdatePanelOpacity(panel.id, parseFloat(e.target.value))}
                        className="w-full accent-[#FF7A00] cursor-pointer"
                      />
                    </div>

                    {/* Feature Toggles: 3D Parallax + Glow */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* 3D Parallax Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePanelParallax(panel.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isParallax
                              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                              : 'bg-white/[0.03] text-zinc-500 border border-white/[0.06]'
                          }`}
                          title="Toggle 3D parallax physics for this individual card"
                        >
                          <Box className="w-3 h-3" />
                          <span>3D Parallax: {isParallax ? 'ON' : 'OFF'}</span>
                        </button>

                        {/* Glow Halo Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePanelGlow(panel.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isGlow
                              ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/40 shadow-[0_0_10px_rgba(255,122,0,0.15)]'
                              : 'bg-white/[0.03] text-zinc-500 border border-white/[0.06]'
                          }`}
                          title="Toggle neon halo illumination for this individual card"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Glow: {isGlow ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                        <span>
                          Type: {panel.previewType}
                          {panel.blur ? ` • Blur: ${panel.blur}px` : ''}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingPanel(false);
                              setEditingPanel(panel);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer"
                            title="Edit Card Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePanel(panel.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CONTINUOUS MOTION (SPEED, INTENSITY, DIRECTION)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'motion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08]">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Play className="w-4 h-4 text-[#FF7A00]" />
              Automated Movement Physics
            </h3>

            {/* Toggle Continuous Auto Motion */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="text-xs font-semibold text-white">Enable Continuous Auto Motion</div>
                <div className="text-[11px] text-zinc-400">
                  Background panels continuously translate across the viewport
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.autoMotion.enabled}
                onChange={e =>
                  setConfig({
                    ...config,
                    autoMotion: { ...config.autoMotion, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Speed Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Scroll Speed Multiplier</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.autoMotion.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={config.autoMotion.speed}
                onChange={e =>
                  setConfig({
                    ...config,
                    autoMotion: { ...config.autoMotion, speed: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0.1x (Subtle drift)</span>
                <span>1.0x (Cinematic optimal)</span>
                <span>3.0x (High velocity)</span>
              </div>
            </div>

            {/* Movement Direction */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Movement Direction</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      autoMotion: { ...config.autoMotion, direction: 'normal' },
                    })
                  }
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    config.autoMotion.direction === 'normal'
                      ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400'
                  }`}
                >
                  Alternating Rows (Normal)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      autoMotion: { ...config.autoMotion, direction: 'reverse' },
                    })
                  }
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    config.autoMotion.direction === 'reverse'
                      ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400'
                  }`}
                >
                  Reverse Directions
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FF7A00]" />
              Motion Dynamics
            </h3>

            {/* Motion Intensity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Motion Intensity</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.autoMotion.intensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={config.autoMotion.intensity}
                onChange={e =>
                  setConfig({
                    ...config,
                    autoMotion: { ...config.autoMotion, intensity: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0.2x (Minimal)</span>
                <span>1.0x (Standard)</span>
                <span>2.5x (Dynamic)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 leading-relaxed space-y-2">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                Cinematic Optical Depth
              </div>
              <p>
                Each row translates at distinct optical velocities (Row 1 at -24px/s, Row 2 at +18px/s, Row 3 at -30px/s)
                to produce multi-plane parallax depth.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: VISUAL, BLUR & GLOWS (GLOBAL BLUR, GLOW INTENSITY)              */}
      {/* ========================================================================= */}
      {activeSubTab === 'visual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08]">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FF7A00]" />
              Opacity, Lighting &amp; Blur
            </h3>

            {/* Master Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Master Background Opacity</span>
                <span className="font-mono text-[#FF7A00] font-bold">{Math.round(config.visual.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={config.visual.opacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    visual: { ...config.visual, opacity: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Global Scene Blur */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Global Scene Blur</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.visual.blur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={config.visual.blur || 0}
                onChange={e =>
                  setConfig({
                    ...config,
                    visual: { ...config.visual, blur: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0px (Crisp focus)</span>
                <span>4px (Soft lens)</span>
                <span>20px (Dreamy atmospheric)</span>
              </div>
            </div>

            {/* Center Vignette Darkness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Center Vignette Darkness</span>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {Math.round(config.visual.overlayDarkness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={config.visual.overlayDarkness}
                onChange={e =>
                  setConfig({
                    ...config,
                    visual: { ...config.visual, overlayDarkness: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">
                Higher darkness ensures hero text and call-to-action buttons stay 100% legible.
              </span>
            </div>

            {/* Cards Brightness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Cards Brightness</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.visual.brightness.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={config.visual.brightness}
                onChange={e =>
                  setConfig({
                    ...config,
                    visual: { ...config.visual, brightness: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#FF7A00]" />
              Atmospheric Glows &amp; Radiance
            </h3>

            {/* Glow Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Atmospheric Glow Intensity</span>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {(config.visual.glowIntensity ?? 1.0).toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={config.visual.glowIntensity ?? 1.0}
                onChange={e =>
                  setConfig({
                    ...config,
                    visual: { ...config.visual, glowIntensity: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0.1x (Subtle)</span>
                <span>1.0x (Balanced)</span>
                <span>3.0x (Intense neon aura)</span>
              </div>
            </div>

            {/* Primary Glow */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Primary Ambient Glow Color</span>
                <span className="font-mono text-xs text-zinc-400">{config.colors.primaryGlow}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.colors.primaryGlow}
                  onChange={e =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, primaryGlow: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.colors.primaryGlow}
                  onChange={e =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, primaryGlow: e.target.value },
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Secondary Glow */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Secondary Ambient Glow Color</span>
                <span className="font-mono text-xs text-zinc-400">{config.colors.secondaryGlow}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.colors.secondaryGlow}
                  onChange={e =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, secondaryGlow: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.colors.secondaryGlow}
                  onChange={e =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, secondaryGlow: e.target.value },
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: 3D PERSPECTIVE & DEPTH                                         */}
      {/* ========================================================================= */}
      {activeSubTab === '3d' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08]">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Box className="w-4 h-4 text-[#FF7A00]" />
              Perspective Camera
            </h3>

            {/* 3D Enabled */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="text-xs font-semibold text-white">Enable 3D Perspective Transform</div>
                <div className="text-[11px] text-zinc-400">
                  Renders panels on an angled 3D plane with z-index separation
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.motion3D.enabled}
                onChange={e =>
                  setConfig({
                    ...config,
                    motion3D: { ...config.motion3D, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Perspective */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Camera Perspective Distance</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.motion3D.perspective}px</span>
              </div>
              <input
                type="range"
                min="700"
                max="2200"
                step="50"
                value={config.motion3D.perspective}
                onChange={e =>
                  setConfig({
                    ...config,
                    motion3D: { ...config.motion3D, perspective: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>700px (Extreme angle)</span>
                <span>1300px (Default cinema)</span>
                <span>2200px (Flat orthographic)</span>
              </div>
            </div>

            {/* Tilt Intensity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">3D Tilt Intensity</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.motion3D.tiltIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={config.motion3D.tiltIntensity}
                onChange={e =>
                  setConfig({
                    ...config,
                    motion3D: { ...config.motion3D, tiltIntensity: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF7A00]" />
              Z-Axis Layering
            </h3>

            {/* Layer Separation */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Z-Layer Separation Multiplier</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.motion3D.layerSeparation.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={config.motion3D.layerSeparation}
                onChange={e =>
                  setConfig({
                    ...config,
                    motion3D: { ...config.motion3D, layerSeparation: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Parallax Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Parallax Depth Differential</span>
                <span className="font-mono text-[#FF7A00] font-bold">{config.motion3D.parallaxStrength.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={config.motion3D.parallaxStrength}
                onChange={e =>
                  setConfig({
                    ...config,
                    motion3D: { ...config.motion3D, parallaxStrength: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: CURSOR INTERACTION                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'cursor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08]">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-[#FF7A00]" />
              Cursor Tracking
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="text-xs font-semibold text-white">Enable Mouse Influence</div>
                <div className="text-[11px] text-zinc-400">
                  Background pans and tilts dynamically following cursor trajectory
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.cursorInteraction.enabled}
                onChange={e =>
                  setConfig({
                    ...config,
                    cursorInteraction: { ...config.cursorInteraction, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Sensitivity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Cursor Sensitivity</span>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {config.cursorInteraction.sensitivity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={config.cursorInteraction.sensitivity}
                onChange={e =>
                  setConfig({
                    ...config,
                    cursorInteraction: {
                      ...config.cursorInteraction,
                      sensitivity: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Movement Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Movement Strength (Displacement)</span>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {config.cursorInteraction.movementStrength.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={config.cursorInteraction.movementStrength}
                onChange={e =>
                  setConfig({
                    ...config,
                    cursorInteraction: {
                      ...config.cursorInteraction,
                      movementStrength: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FF7A00]" />
              Axis Influence
            </h3>

            {/* Horizontal Influence */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Horizontal Yaw &amp; Pan Influence</span>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {config.cursorInteraction.horizontalInfluence.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={config.cursorInteraction.horizontalInfluence}
                onChange={e =>
                  setConfig({
                    ...config,
                    cursorInteraction: {
                      ...config.cursorInteraction,
                      horizontalInfluence: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Vertical Influence */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Vertical Pitch &amp; Parallax Influence</span>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {config.cursorInteraction.verticalInfluence.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={config.cursorInteraction.verticalInfluence}
                onChange={e =>
                  setConfig({
                    ...config,
                    cursorInteraction: {
                      ...config.cursorInteraction,
                      verticalInfluence: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Mobile Behavior Notice */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 space-y-1">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />
                Touch Device Optimization
              </div>
              <p>
                Mobile devices automatically fallback to smooth auto-motion without erratic touch jumps, ensuring
                stable 60fps performance on all phones and tablets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / ADD PANEL MODAL WITH MEDIA PICKER, 3D PARALLAX & GLOW CONTROLS      */}
      {/* ========================================================================= */}
      {editingPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-2xl bg-[#0D0D0D] border border-white/[0.1] space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Box className="w-4 h-4 text-[#FF7A00]" />
                {isAddingPanel ? 'Add Background Card' : 'Configure Background Card'}
              </h3>
              <span className="text-xs font-mono text-zinc-500">ID: {editingPanel.id}</span>
            </div>

            {/* 1. VISUAL MEDIA PICKER FROM MEDIA ASSETS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>Attach Media Asset (Select from Uploads)</span>
                </label>
                {editingPanel.imageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPanel({ ...editingPanel, imageUrl: '', mediaAssetId: undefined })
                    }
                    className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {mediaAssets.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  {mediaAssets.map(media => {
                    const isSelected = editingPanel.imageUrl === media.url;
                    return (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => {
                          const cleanTitle = (media.originalName || media.name || media.filename)
                            .replace(/\.[^/.]+$/, '')
                            .replace(/[-_]/g, ' ')
                            .toUpperCase();

                          setEditingPanel({
                            ...editingPanel,
                            imageUrl: media.url,
                            mediaAssetId: media.id,
                            title:
                              editingPanel.title && !editingPanel.title.includes('New')
                                ? editingPanel.title
                                : cleanTitle.length > 25
                                ? cleanTitle.substring(0, 22) + '...'
                                : cleanTitle,
                          });
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[#FF7A00] ring-2 ring-[#FF7A00]/50'
                            : 'border-white/[0.08] hover:border-white/[0.25]'
                        }`}
                        title={media.originalName || media.filename}
                      >
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#FF7A00]/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-[#FF7A00] drop-shadow" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-zinc-300 truncate px-1 py-0.5 text-center">
                          {media.usage}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 font-mono">
                  No media uploaded yet. You can paste an image URL below.
                </p>
              )}

              {/* Direct Image URL input */}
              <input
                type="text"
                value={editingPanel.imageUrl || ''}
                onChange={e => setEditingPanel({ ...editingPanel, imageUrl: e.target.value })}
                placeholder="Or paste direct image URL (https://... or /uploads/...)"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:border-[#FF7A00] outline-none"
              />
            </div>

            {/* 2. CARD SETTINGS */}
            <div className="space-y-4 pt-3 border-t border-white/[0.08]">
              {/* Row Selection */}
              <div>
                <label className="text-xs font-semibold text-zinc-300">Target Row Layer</label>
                <select
                  value={editingPanel.row}
                  onChange={e =>
                    setEditingPanel({ ...editingPanel, row: parseInt(e.target.value) as any })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                >
                  <option value={1}>Row 1 (Distant Background Layer, Speed: -24px/s)</option>
                  <option value={2}>Row 2 (Mid-Depth Layer, Speed: +18px/s)</option>
                  <option value={3}>Row 3 (Foreground Depth Layer, Speed: -30px/s)</option>
                </select>
              </div>

              {/* Tag & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Card Tag</label>
                  <input
                    type="text"
                    value={editingPanel.tag}
                    onChange={e => setEditingPanel({ ...editingPanel, tag: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Tag Accent Color</label>
                  <select
                    value={editingPanel.tagColor}
                    onChange={e =>
                      setEditingPanel({ ...editingPanel, tagColor: e.target.value as any })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                  >
                    <option value="orange">Orange (#FF7A00)</option>
                    <option value="cyan">Cyan (#00E5FF)</option>
                    <option value="purple">Purple (#C084FC)</option>
                    <option value="green">Green (#34D399)</option>
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="text-xs font-semibold text-zinc-300">Card Title</label>
                <input
                  type="text"
                  value={editingPanel.title}
                  onChange={e => setEditingPanel({ ...editingPanel, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Tech Stack / Description</label>
                <input
                  type="text"
                  value={editingPanel.tech}
                  onChange={e => setEditingPanel({ ...editingPanel, tech: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                />
              </div>

              {/* Graphic Type & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Preview Graphic Type</label>
                  <select
                    value={editingPanel.previewType}
                    onChange={e =>
                      setEditingPanel({ ...editingPanel, previewType: e.target.value as any })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                  >
                    <option value="code">Code Editor Mockup</option>
                    <option value="nodes">Neural Nodes / Graph</option>
                    <option value="chart">Audio / Bar Chart</option>
                    <option value="radar">Radar Scanner</option>
                    <option value="timeline">Video Timeline</option>
                    <option value="grid">Agent Matrix Grid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Status Snippet</label>
                  <input
                    type="text"
                    value={editingPanel.stats || ''}
                    onChange={e => setEditingPanel({ ...editingPanel, stats: e.target.value })}
                    placeholder="e.g. FPS: 120"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-[#FF7A00] outline-none"
                  />
                </div>
              </div>

              {/* 3. DEDICATED INDIVIDUAL PANEL TOGGLES: 3D PARALLAX, GLOW, BLUR */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>Card FX &amp; Parallax Controls</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* 3D Parallax Toggle */}
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPanel.parallax !== false}
                      onChange={e =>
                        setEditingPanel({ ...editingPanel, parallax: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">3D Parallax</div>
                      <div className="text-[10px] text-zinc-400">Card tilts with cursor</div>
                    </div>
                  </label>

                  {/* Glow Toggle */}
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingPanel.glow}
                      onChange={e =>
                        setEditingPanel({ ...editingPanel, glow: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Neon Glow Halo</div>
                      <div className="text-[10px] text-zinc-400">Radial accent aura</div>
                    </div>
                  </label>
                </div>

                {/* Individual Blur Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Individual Card Blur</span>
                    <span className="font-mono text-[#FF7A00] font-bold">{editingPanel.blur || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={editingPanel.blur || 0}
                    onChange={e =>
                      setEditingPanel({ ...editingPanel, blur: parseInt(e.target.value) })
                    }
                    className="w-full accent-[#FF7A00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>0px (Crisp)</span>
                    <span>16px (Blurred)</span>
                  </div>
                </div>

                {/* Card Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Card Opacity</span>
                    <span className="font-mono text-[#FF7A00] font-bold">
                      {Math.round((editingPanel.opacity !== undefined ? editingPanel.opacity : 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={editingPanel.opacity !== undefined ? editingPanel.opacity : 1}
                    onChange={e =>
                      setEditingPanel({ ...editingPanel, opacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#FF7A00] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingPanel(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSavePanel(editingPanel)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] cursor-pointer shadow-[0_0_12px_rgba(255,122,0,0.3)]"
              >
                Apply to List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Media Asset Modal for Backdrop Layers */}
      {isPickingLayerMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF7A00]" />
                  Add Image to Backdrop Layers Stack
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select an asset from your Media Library or provide a direct image URL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickingLayerMedia(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom URL Input option */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <label className="text-xs font-mono text-zinc-300 font-semibold">Or enter custom image URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/layer.png or /uploads/..."
                  id="custom-layer-url-input"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:border-[#FF7A00] outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = (e.currentTarget as HTMLInputElement).value.trim();
                      if (val) {
                        handleAddBackdropLayer(val);
                        setIsPickingLayerMedia(false);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('custom-layer-url-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      handleAddBackdropLayer(input.value.trim());
                      setIsPickingLayerMedia(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FF8A00] transition-colors cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Uploaded Media Assets Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                Uploaded Media Assets ({mediaAssets.length}):
              </div>

              {mediaAssets.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No uploaded assets found. Upload images in the Media Assets tab first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaAssets.map(asset => {
                    const isHomeBg = asset.usage === 'home-background';
                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          handleAddBackdropLayer(asset);
                          setIsPickingLayerMedia(false);
                        }}
                        className={`group relative rounded-xl overflow-hidden border p-2 bg-[#0D0D0D] cursor-pointer transition-all hover:scale-[1.02] ${
                          isHomeBg
                            ? 'border-[#FF7A00]/40 hover:border-[#FF7A00]'
                            : 'border-white/[0.08] hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="aspect-video rounded-lg overflow-hidden bg-black/60 relative mb-1.5">
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isHomeBg && (
                            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#FF7A00] text-black">
                              Home BG
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-zinc-200 truncate">{asset.name}</div>
                        <div className="text-[9px] font-mono text-zinc-500 truncate">{asset.usage || 'General Media'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsPickingLayerMedia(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Home Background Settings?"
        description="This will revert speed, 3D angles, glow colors, and panel definitions to their original cinematic agency defaults. Your unsaved modifications will be replaced."
        confirmText="Yes, Reset Defaults"
        variant="danger"
        onConfirm={handleReset}
        onClose={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
