import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  Shield,
  FileCode,
  Trash2,
  Sliders,
  Layers,
  MoveUp,
  MoveDown,
  Eye,
  Plus,
  Play,
  Pause,
  Compass,
  Maximize2,
  X,
  CheckSquare,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { MediaFallback } from '../MediaFallback';
import { InteractiveHeroBackground } from '../InteractiveHeroBackground';
import {
  MediaAssetItem,
  MediaUsage,
  HomeBackgroundConfig,
  BackgroundPanelItem,
} from '../../types';

interface MediaSlotDef {
  key: 'heroCharacter' | 'aboutPhoto' | 'brandIcon' | 'brandBanner';
  title: string;
  slotLabel: string;
  description: string;
  recommendations: string;
  currentUrl: string;
  defaultUrl: string;
}

const USAGE_OPTIONS: { value: MediaUsage; label: string; desc: string; color: string }[] = [
  {
    value: 'general',
    label: 'General Media',
    desc: 'Unassigned or used anywhere via direct URL',
    color: 'border-white/20 text-white/70 bg-white/[0.04]',
  },
  {
    value: 'home-background',
    label: 'Home Background',
    desc: 'Assigned to animated 3D Home page background',
    color: 'border-[#FF7A00]/50 text-[#FF7A00] bg-[#FF7A00]/10',
  },
  {
    value: 'home-character',
    label: 'Home Character',
    desc: 'Futuristic avatar for the hero orbit visual',
    color: 'border-[#00E5FF]/50 text-[#00E5FF] bg-[#00E5FF]/10',
  },
  {
    value: 'about',
    label: 'About Image',
    desc: 'Portrait photograph in the holographic card',
    color: 'border-[#A855F7]/50 text-[#A855F7] bg-[#A855F7]/10',
  },
  {
    value: 'project',
    label: 'Project Image',
    desc: 'Showcase cover for work & case studies',
    color: 'border-[#22C55E]/50 text-[#22C55E] bg-[#22C55E]/10',
  },
  {
    value: 'service',
    label: 'Service Image',
    desc: 'Illustration for solutions & service offerings',
    color: 'border-[#F59E0B]/50 text-[#F59E0B] bg-[#F59E0B]/10',
  },
  {
    value: 'other',
    label: 'Other',
    desc: 'Special graphic, banner, or document asset',
    color: 'border-white/20 text-white/60 bg-white/[0.02]',
  },
];

export const MediaManager: React.FC = () => {
  const {
    profile,
    refreshProfile,
    refreshHeroConfig,
    refreshAboutConfig,
    refreshAll,
    homeBackground,
    updateHomeBackground,
    resetHomeBackground,
  } = usePortfolio();
  const { token, isAdmin } = useAuth();

  // All uploaded media assets fetched from server
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Status & Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter for assets list
  const [assetFilter, setAssetFilter] = useState<'all' | MediaUsage>('all');

  // Currently focused asset for background configuration
  const [selectedBgAsset, setSelectedBgAsset] = useState<MediaAssetItem | null>(null);

  // Background Settings Local Draft (live reactive preview)
  const [bgDraft, setBgDraft] = useState<HomeBackgroundConfig | null>(null);
  const [isSavingBg, setIsSavingBg] = useState(false);

  // Core brand identity slots direct editing & reset
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [urlInputMode, setUrlInputMode] = useState<Record<string, boolean>>({});
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [confirmResetSlot, setConfirmResetSlot] = useState<MediaSlotDef | null>(null);
  const [pickingSlotFor, setPickingSlotFor] = useState<MediaSlotDef | null>(null);

  // Drag and drop for library
  const [isDraggingLibrary, setIsDraggingLibrary] = useState(false);

  // Load all media assets from server
  const loadMediaAssets = async () => {
    if (!token) return;
    setLoadingMedia(true);
    try {
      const res = await apiFetch('/api/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    loadMediaAssets();
  }, [token]);

  // Sync local bgDraft whenever homeBackground from context changes
  useEffect(() => {
    if (homeBackground) {
      setBgDraft(JSON.parse(JSON.stringify(homeBackground)));
    }
  }, [homeBackground]);

  // If there's an active background image, find the corresponding asset if exists
  useEffect(() => {
    if (homeBackground?.backgroundImage && mediaAssets.length > 0) {
      const matched = mediaAssets.find((a) => a.url === homeBackground.backgroundImage);
      if (matched && !selectedBgAsset) {
        setSelectedBgAsset(matched);
      }
    }
  }, [homeBackground?.backgroundImage, mediaAssets]);

  // The 4 Core Brand Slots
  const mediaSlots: MediaSlotDef[] = [
    {
      key: 'heroCharacter',
      title: 'Hero Character Visual',
      slotLabel: 'HERO_CHARACTER_ORBIT',
      description: 'The dominant futuristic 3D visual centered within the hero section orbit rings.',
      recommendations: 'Recommended: Transparent PNG or SVG, min. 800×1000px, dark/cyber aesthetic',
      currentUrl: profile?.media?.heroCharacter || '/assets/hero-character.svg',
      defaultUrl: '/assets/hero-character.svg',
    },
    {
      key: 'aboutPhoto',
      title: 'About Section Portrait',
      slotLabel: 'ABOUT_PORTRAIT_FRAME',
      description: 'Personal portrait photograph showcased inside the cyber holographic card frame.',
      recommendations: 'Recommended: 1:1 or 4:5 aspect ratio, high-res portrait (min. 600×750px)',
      currentUrl: profile?.media?.aboutPhoto || '/assets/about-manikantha.svg',
      defaultUrl: '/assets/about-manikantha.svg',
    },
    {
      key: 'brandIcon',
      title: 'Brand Monogram / Favicon',
      slotLabel: 'BRAND_ICON_MK',
      description: 'The official MK geometric icon used in navigation headers, footer branding, and tab favicon.',
      recommendations: 'Recommended: Square SVG or transparent PNG (min. 128×128px)',
      currentUrl: profile?.media?.brandIcon || '/assets/mk-logo.svg',
      defaultUrl: '/assets/mk-logo.svg',
    },
    {
      key: 'brandBanner',
      title: 'Brand Banner / MK forge_auto',
      slotLabel: 'BANNER_FORGE_AUTO',
      description: 'Wide panoramic banner graphic for forge_auto branding and social cards.',
      recommendations: 'Recommended: 16:9 or 21:9 wide aspect ratio (min. 1200×600px)',
      currentUrl: profile?.media?.brandBanner || '/assets/mk-forge-auto.svg',
      defaultUrl: '/assets/mk-forge-auto.svg',
    },
  ];

  // Upload a media file to the general media assets library
  const handleUploadNewMedia = async (file: File, preferredUsage: MediaUsage = 'general') => {
    if (!isAdmin || !token) {
      setErrorMessage('Admin privileges required to upload media.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selected file must be a valid image (PNG, JPG, WebP, SVG, GIF).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit.');
      return;
    }

    setUploadingMedia(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('usage', preferredUsage);

    try {
      const res = await apiFetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      await loadMediaAssets();
      setSuccessMessage(`Asset "${file.name}" uploaded successfully and added to Media Assets!`);

      // If preferredUsage is home-background, auto-select it for background preview
      if (preferredUsage === 'home-background' && data.asset) {
        setSelectedBgAsset(data.asset);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(message);
    } finally {
      setUploadingMedia(false);
    }
  };

  // Update an asset's usage/purpose
  const handleUpdateUsage = async (asset: MediaAssetItem, newUsage: MediaUsage) => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    try {
      const res = await apiFetch(`/api/media/${encodeURIComponent(asset.filename)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({ usage: newUsage }),
      });

      if (res.ok) {
        const updated = await res.json();
        setMediaAssets((prev) => prev.map((a) => (a.filename === asset.filename ? updated : a)));

        if (newUsage === 'home-character') {
          await handleAssignToBrandSlot('heroCharacter', asset.url, 'Hero Character Visual');
        } else if (newUsage === 'about') {
          await handleAssignToBrandSlot('aboutPhoto', asset.url, 'About Section Portrait');
        } else if (newUsage === 'home-background') {
          setSelectedBgAsset(updated);
          await handleSetAsHomeBackground(updated);
        } else {
          setSuccessMessage(`Updated usage of "${asset.name || asset.filename}" to ${newUsage}.`);
        }
      }
    } catch {
      setErrorMessage('Failed to update media asset usage.');
    }
  };

  // Set asset as Primary Home Background
  const handleSetAsHomeBackground = async (asset: MediaAssetItem) => {
    if (!bgDraft) return;
    setIsSavingBg(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updatedConfig: Partial<HomeBackgroundConfig> = {
        ...bgDraft,
        enabled: true,
        backgroundImage: asset.url,
        backgroundMediaId: asset.id,
      };

      const success = await updateHomeBackground(updatedConfig);
      if (success) {
        setBgDraft((prev) => (prev ? { ...prev, backgroundImage: asset.url, backgroundMediaId: asset.id } : prev));
        // Ensure usage is marked as home-background
        if (asset.usage !== 'home-background') {
          await handleUpdateUsage(asset, 'home-background');
        }
        setSelectedBgAsset(asset);
        setSuccessMessage(`Set "${asset.name || asset.filename}" as the live Home Page animated background!`);
      } else {
        setErrorMessage('Failed to set Home Background.');
      }
    } catch {
      setErrorMessage('Failed to update Home Background.');
    } finally {
      setIsSavingBg(false);
    }
  };

  // Remove asset from Primary Home Background
  const handleRemoveFromHomeBackground = async () => {
    if (!bgDraft) return;
    setIsSavingBg(true);
    try {
      const success = await updateHomeBackground({
        ...bgDraft,
        backgroundImage: undefined,
        backgroundMediaId: undefined,
      });
      if (success) {
        setBgDraft((prev) => (prev ? { ...prev, backgroundImage: undefined, backgroundMediaId: undefined } : prev));
        setSuccessMessage('Removed background image. Home page reverted to default cyber gallery panels.');
      }
    } catch {
      setErrorMessage('Failed to remove Home Background.');
    } finally {
      setIsSavingBg(false);
    }
  };

  // Add asset as an animated background panel item
  const handleAddAsBackgroundPanel = async (asset: MediaAssetItem, row: 1 | 2 | 3 = 1) => {
    if (!bgDraft) return;
    setIsSavingBg(true);

    const newPanel: BackgroundPanelItem = {
      id: `custom-panel-${Date.now()}`,
      row,
      tag: 'VISUAL ASSET',
      tagColor: row === 1 ? 'orange' : row === 2 ? 'cyan' : 'purple',
      title: asset.name || 'Moving Visual Panel',
      category: 'Cyber Motion',
      tech: 'Media Asset • 3D',
      iconName: 'Sparkles',
      previewType: 'grid',
      stats: 'ACTIVE: 100%',
      imageUrl: asset.url,
      enabled: true,
      order: (bgDraft.panels?.length || 0) + 1,
      size: 'medium',
      opacity: 1.0,
      speedMultiplier: 1.0,
    };

    const currentPanels = bgDraft.panels || [];
    const updatedPanels = [newPanel, ...currentPanels];

    try {
      const success = await updateHomeBackground({
        ...bgDraft,
        panels: updatedPanels,
      });

      if (success) {
        setBgDraft((prev) => (prev ? { ...prev, panels: updatedPanels } : prev));
        if (asset.usage !== 'home-background') {
          await handleUpdateUsage(asset, 'home-background');
        }
        setSuccessMessage(
          `Added "${asset.name || asset.filename}" as an animated 3D moving panel in Row ${row}!`
        );
      }
    } catch {
      setErrorMessage('Failed to add background panel.');
    } finally {
      setIsSavingBg(false);
    }
  };

  // Save all background settings to database & context
  const handleSaveBackgroundSettings = async () => {
    if (!bgDraft) return;
    setIsSavingBg(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const success = await updateHomeBackground(bgDraft);
      if (success) {
        setSuccessMessage('Background settings saved successfully! Live Home Page refreshed.');
      } else {
        setErrorMessage('Failed to save background settings.');
      }
    } catch {
      setErrorMessage('Failed to save background settings.');
    } finally {
      setIsSavingBg(false);
    }
  };

  // Delete an uploaded media asset
  const handleDeleteAsset = async (asset: MediaAssetItem) => {
    if (!token) return;
    if (!window.confirm(`Permanently delete "${asset.name || asset.filename}" from server?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/media/${encodeURIComponent(asset.filename)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMediaAssets((prev) => prev.filter((a) => a.filename !== asset.filename));
        if (selectedBgAsset?.filename === asset.filename) {
          setSelectedBgAsset(null);
        }
        if (bgDraft?.backgroundImage === asset.url) {
          await handleRemoveFromHomeBackground();
        }
        setSuccessMessage(`Deleted asset "${asset.filename}" successfully.`);
      }
    } catch {
      setErrorMessage('Failed to delete media asset.');
    }
  };

  // Move a panel up/down in ordering
  const handleMovePanel = async (panelId: string, direction: 'up' | 'down') => {
    if (!bgDraft || !bgDraft.panels) return;
    const panels = [...bgDraft.panels];
    const index = panels.findIndex((p) => p.id === panelId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= panels.length) return;

    // Swap
    const temp = panels[index];
    panels[index] = panels[targetIndex];
    panels[targetIndex] = temp;

    // Update orders
    panels.forEach((p, idx) => {
      p.order = idx + 1;
    });

    setBgDraft({ ...bgDraft, panels });
  };

  // Toggle panel enabled state
  const handleTogglePanel = (panelId: string) => {
    if (!bgDraft || !bgDraft.panels) return;
    const panels = bgDraft.panels.map((p) =>
      p.id === panelId ? { ...p, enabled: p.enabled === false ? true : false } : p
    );
    setBgDraft({ ...bgDraft, panels });
  };

  // Remove a panel item
  const handleRemovePanel = (panelId: string) => {
    if (!bgDraft || !bgDraft.panels) return;
    const panels = bgDraft.panels.filter((p) => p.id !== panelId);
    setBgDraft({ ...bgDraft, panels });
  };

  // Quick action to set asset to core brand slot
  const handleAssignToBrandSlot = async (slotKey: string, url: string, slotTitle: string) => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    try {
      const updateRes = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          media: {
            ...profile?.media,
            [slotKey]: url,
          },
        }),
      });

      if (!updateRes.ok) {
        throw new Error(`Failed to assign asset to ${slotTitle}`);
      }

      const updatedProfile = await updateRes.json();

      // Also ensure slot-specific configs are updated if relevant
      if (slotKey === 'heroCharacter') {
        await apiFetch('/api/hero-config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({ profileImage: url }),
        });
      } else if (slotKey === 'aboutPhoto') {
        await apiFetch('/api/about-config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({ profileImage: url }),
        });
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mk_persisted_profile', JSON.stringify(updatedProfile));
        } catch { /* ignore */ }
        if (slotKey === 'heroCharacter') {
          const storedHero = localStorage.getItem('mk_persisted_hero_config');
          if (storedHero) {
            try {
              const h = JSON.parse(storedHero);
              h.profileImage = url;
              localStorage.setItem('mk_persisted_hero_config', JSON.stringify(h));
            } catch { /* ignore */ }
          }
        } else if (slotKey === 'aboutPhoto') {
          const storedAbout = localStorage.getItem('mk_persisted_about_config');
          if (storedAbout) {
            try {
              const a = JSON.parse(storedAbout);
              a.profileImage = url;
              localStorage.setItem('mk_persisted_about_config', JSON.stringify(a));
            } catch { /* ignore */ }
          }
        }
      }

      await Promise.all([
        refreshProfile(),
        refreshHeroConfig(),
        refreshAboutConfig(),
        refreshAll?.(),
      ]);
      setSuccessMessage(`Assigned asset to "${slotTitle}" successfully!`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : `Failed to assign asset to ${slotTitle}.`);
    }
  };

  // Core brand slot upload handler
  const handleCoreSlotUpload = async (slotKey: string, file: File) => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    setUploadingTarget(slotKey);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usage', slotKey === 'heroCharacter' ? 'home-character' : slotKey === 'aboutPhoto' ? 'about' : 'general');

    try {
      const uploadRes = await apiFetch('/api/media/upload', {
        method: 'POST',
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.fileUrl) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const newUrl = uploadData.fileUrl;

      const updateRes = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          media: {
            ...profile?.media,
            [slotKey]: newUrl,
          },
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update brand media in profile.');
      }

      const updatedProfile = await updateRes.json();

      // Also ensure slot-specific configs are updated if relevant
      if (slotKey === 'heroCharacter') {
        await apiFetch('/api/hero-config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({ profileImage: newUrl }),
        });
      } else if (slotKey === 'aboutPhoto') {
        await apiFetch('/api/about-config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({ profileImage: newUrl }),
        });
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mk_persisted_profile', JSON.stringify(updatedProfile));
        } catch { /* ignore */ }
        if (slotKey === 'heroCharacter') {
          const storedHero = localStorage.getItem('mk_persisted_hero_config');
          if (storedHero) {
            try {
              const h = JSON.parse(storedHero);
              h.profileImage = newUrl;
              localStorage.setItem('mk_persisted_hero_config', JSON.stringify(h));
            } catch { /* ignore */ }
          }
        } else if (slotKey === 'aboutPhoto') {
          const storedAbout = localStorage.getItem('mk_persisted_about_config');
          if (storedAbout) {
            try {
              const a = JSON.parse(storedAbout);
              a.profileImage = newUrl;
              localStorage.setItem('mk_persisted_about_config', JSON.stringify(a));
            } catch { /* ignore */ }
          }
        }
      }

      await Promise.all([
        refreshProfile(),
        refreshHeroConfig(),
        refreshAboutConfig(),
        refreshAll?.(),
        loadMediaAssets(),
      ]);
      setSuccessMessage(`Updated "${slotKey}" media asset successfully!`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingTarget(null);
    }
  };

  // Reset core slot to default
  const handleResetToDefault = async (slot: MediaSlotDef) => {
    const activeToken = token || localStorage.getItem('mk_auth_token');
    setIsResetting(true);
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          media: {
            ...profile?.media,
            [slot.key]: slot.defaultUrl,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error resetting slot.');
      }

      const updatedProfile = await res.json();

      // Also ensure slot-specific configs are updated if relevant
      if (slot.key === 'heroCharacter') {
        await apiFetch('/api/hero-config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({ profileImage: slot.defaultUrl }),
        });
      } else if (slot.key === 'aboutPhoto') {
        await apiFetch('/api/about-config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({ profileImage: slot.defaultUrl }),
        });
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mk_persisted_profile', JSON.stringify(updatedProfile));
        } catch { /* ignore */ }
        if (slot.key === 'heroCharacter') {
          const storedHero = localStorage.getItem('mk_persisted_hero_config');
          if (storedHero) {
            try {
              const h = JSON.parse(storedHero);
              h.profileImage = slot.defaultUrl;
              localStorage.setItem('mk_persisted_hero_config', JSON.stringify(h));
            } catch { /* ignore */ }
          }
        } else if (slot.key === 'aboutPhoto') {
          const storedAbout = localStorage.getItem('mk_persisted_about_config');
          if (storedAbout) {
            try {
              const a = JSON.parse(storedAbout);
              a.profileImage = slot.defaultUrl;
              localStorage.setItem('mk_persisted_about_config', JSON.stringify(a));
            } catch { /* ignore */ }
          }
        }
      }

      await Promise.all([
        refreshProfile(),
        refreshHeroConfig(),
        refreshAboutConfig(),
        refreshAll?.(),
      ]);
      setConfirmResetSlot(null);
      setSuccessMessage(`Reverted "${slot.title}" to default artwork.`);
    } catch (err: unknown) {
      console.error('[MediaManager] Reset error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reset media slot.');
    } finally {
      setIsResetting(false);
    }
  };

  // Filtered media assets
  const filteredAssets = mediaAssets.filter((asset) => {
    if (assetFilter === 'all') return true;
    return asset.usage === assetFilter;
  });

  // Check if any asset is currently the active background
  const activeBgUrl = bgDraft?.backgroundImage || homeBackground?.backgroundImage;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#090909] border border-[rgba(255,122,0,0.2)] shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-[#FF7A00]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] font-mono text-[10px] font-bold uppercase tracking-wider">
                MEDIA PIPELINE • ACTIVE
              </span>
              <span className="text-xs font-mono text-[#777777]">
                {mediaAssets.length} Uploaded Assets
              </span>
            </div>
            <h3 className="font-display text-2xl font-black text-white tracking-tight">
              Media Assets & Visual Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-[#AAAAAA] mt-1 max-w-2xl leading-relaxed">
              Upload and manage your imagery. Assign any uploaded media asset directly to the{' '}
              <strong className="text-white font-semibold">Home Page animated 3D background</strong>,
              character visual, or portfolio sections with real-time motion and depth controls.
            </p>
          </div>

          {/* Top Quick Upload Action */}
          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A00] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_20px_rgba(255,122,0,0.3)]">
              {uploadingMedia ? (
                <>
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-black" />
                  <span>Upload Media</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingMedia}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadNewMedia(file, 'general');
                }}
              />
            </label>

            <button
              onClick={() => {
                loadMediaAssets();
                refreshProfile();
              }}
              title="Refresh Media Assets"
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMedia ? 'animate-spin text-[#FF7A00]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-between gap-3 text-xs text-[#25D366]">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-[#25D366]/70 hover:text-[#25D366] text-xs font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-xs text-red-400">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400/70 hover:text-red-400 text-xs font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: UPLOADED MEDIA ASSETS & USAGE ASSIGNMENT
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF7A00]" />
            <h4 className="font-display text-base font-bold text-white tracking-wide">
              Uploaded Media Assets Library
            </h4>
            <span className="text-xs font-mono text-[#777777]">
              ({filteredAssets.length} displayed)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[11px] font-mono">
            <button
              onClick={() => setAssetFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                assetFilter === 'all'
                  ? 'bg-[#FF7A00] text-black font-bold'
                  : 'bg-white/[0.04] text-[#888888] hover:text-white'
              }`}
            >
              All Assets ({mediaAssets.length})
            </button>
            <button
              onClick={() => setAssetFilter('home-background')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                assetFilter === 'home-background'
                  ? 'bg-[#FF7A00] text-black font-bold'
                  : 'bg-white/[0.04] text-[#888888] hover:text-white'
              }`}
            >
              Home Background (
              {mediaAssets.filter((a) => a.usage === 'home-background').length})
            </button>
            <button
              onClick={() => setAssetFilter('home-character')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                assetFilter === 'home-character'
                  ? 'bg-[#00E5FF] text-black font-bold'
                  : 'bg-white/[0.04] text-[#888888] hover:text-white'
              }`}
            >
              Characters
            </button>
            <button
              onClick={() => setAssetFilter('project')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                assetFilter === 'project'
                  ? 'bg-[#22C55E] text-black font-bold'
                  : 'bg-white/[0.04] text-[#888888] hover:text-white'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setAssetFilter('general')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                assetFilter === 'general'
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-white/[0.04] text-[#888888] hover:text-white'
              }`}
            >
              General
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingLibrary(true);
          }}
          onDragLeave={() => setIsDraggingLibrary(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingLibrary(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUploadNewMedia(file, 'general');
          }}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
            isDraggingLibrary
              ? 'border-[#FF7A00] bg-[#FF7A00]/10 scale-[1.01]'
              : 'border-white/[0.12] bg-[#0A0C10]/60 hover:border-white/[0.25]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/25 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-[#FF7A00]" />
          </div>
          <h5 className="font-display text-sm font-bold text-white mb-1">
            Drop Images Here to Add to Media Assets
          </h5>
          <p className="text-xs text-[#777777] max-w-md mb-3">
            Supports PNG, JPG, WebP, SVG, and GIF up to 15MB. Uploaded media is immediately
            accessible and can be assigned to the animated Home Background or any slot.
          </p>

          <div className="flex items-center gap-3">
            <label className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-bold text-white uppercase tracking-wider cursor-pointer transition-colors">
              Browse Files
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingMedia}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadNewMedia(file, 'general');
                }}
              />
            </label>

            <label className="px-4 py-2 rounded-xl bg-[#FF7A00]/15 hover:bg-[#FF7A00]/25 border border-[#FF7A00]/40 text-xs font-bold text-[#FF7A00] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upload As Home Background</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingMedia}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadNewMedia(file, 'home-background');
                }}
              />
            </label>
          </div>
        </div>

        {/* Media Asset Cards Grid */}
        {loadingMedia ? (
          <div className="p-12 text-center text-[#777777]">
            <Loader2 className="w-6 h-6 text-[#FF7A00] animate-spin mx-auto mb-2" />
            <span className="text-xs font-mono">Loading media assets from storage...</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#090909] border border-white/[0.06] text-[#777777]">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-[#555555]" />
            <p className="text-xs font-mono">No media assets found matching the filter.</p>
            <p className="text-[11px] text-[#555555] mt-1">
              Upload an image above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const isCurrentHomeBg = activeBgUrl === asset.url;
              const isSelectedForBg = selectedBgAsset?.filename === asset.filename;
              const isHeroChar = profile?.media?.heroCharacter === asset.url;
              const isAboutPhoto = profile?.media?.aboutPhoto === asset.url;
              const isBrandIcon = profile?.media?.brandIcon === asset.url;
              const isBrandBanner = profile?.media?.brandBanner === asset.url;

              return (
                <div
                  key={asset.filename}
                  className={`p-4 rounded-2xl bg-[#090A0D] border transition-all flex flex-col justify-between group relative overflow-hidden ${
                    isCurrentHomeBg
                      ? 'border-[#FF7A00] shadow-[0_0_25px_rgba(255,122,0,0.25)] ring-1 ring-[#FF7A00]'
                      : isSelectedForBg
                      ? 'border-[#FF7A00]/50'
                      : 'border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {/* Status Indicator on Top Right */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                      {isHeroChar && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00E5FF] text-black font-mono font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                          ACTIVE HERO
                        </span>
                      )}
                      {isAboutPhoto && (
                        <span className="px-2 py-0.5 rounded-full bg-[#A855F7] text-white font-mono font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          ACTIVE ABOUT
                        </span>
                      )}
                      {isBrandIcon && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-black font-mono font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm">
                          ACTIVE LOGO
                        </span>
                      )}
                      {isBrandBanner && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black font-mono font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm">
                          ACTIVE BANNER
                        </span>
                      )}
                      {isCurrentHomeBg && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-black font-mono font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                          ACTIVE HOME BG
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#777777] truncate">
                        {(asset.size / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => handleDeleteAsset(asset)}
                      className="text-[#666666] hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Delete asset from disk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Preview */}
                  <div
                    onClick={() => {
                      if (asset.usage === 'home-background') {
                        setSelectedBgAsset(asset);
                      }
                    }}
                    className="w-full h-36 rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden relative cursor-pointer group-hover:border-white/[0.15] transition-all flex items-center justify-center mb-3"
                  >
                    <MediaFallback
                      src={asset.url}
                      alt={asset.name || asset.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-[10px] font-mono text-white/90 truncate">
                        {asset.url}
                      </span>
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-3">
                    <div>
                      <h5
                        className="font-mono text-xs font-bold text-white truncate"
                        title={asset.name || asset.filename}
                      >
                        {asset.name || asset.filename}
                      </h5>
                      <span className="text-[10px] font-mono text-[#666666] block truncate">
                        {asset.filename}
                      </span>
                    </div>

                    {/* USAGE / ASSIGN TO DROPDOWN */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block font-semibold">
                        Usage / Assign To:
                      </label>
                      <select
                        id={`usage-select-${asset.filename}`}
                        value={asset.usage || 'general'}
                        onChange={(e) =>
                          handleUpdateUsage(asset, e.target.value as MediaUsage)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-white/[0.12] text-xs font-mono text-white focus:outline-none focus:border-[#FF7A00] transition-colors cursor-pointer"
                      >
                        {USAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DYNAMIC ACTIONS BASED ON USAGE */}
                    {asset.usage === 'home-background' && (
                      <div className="p-2.5 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/20 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#FF7A00] font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Home Background Actions
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {isCurrentHomeBg ? (
                            <button
                              onClick={handleRemoveFromHomeBackground}
                              className="w-full col-span-2 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                            >
                              ✕ Remove from Home BG
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetAsHomeBackground(asset)}
                              disabled={isSavingBg}
                              className="w-full col-span-2 px-2.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#FF8A00] text-black text-[10px] font-mono font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Set as Home Background</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleAddAsBackgroundPanel(asset, 1)}
                            className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[10px] font-mono transition-colors cursor-pointer truncate"
                            title="Add as moving 3D panel in row 1"
                          >
                            + Panel Row 1
                          </button>
                          <button
                            onClick={() => handleAddAsBackgroundPanel(asset, 2)}
                            className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[10px] font-mono transition-colors cursor-pointer truncate"
                            title="Add as moving 3D panel in row 2"
                          >
                            + Panel Row 2
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedBgAsset(asset);
                            const el = document.getElementById('home-background-settings-panel');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full py-1 text-center text-[10px] font-mono text-[#FF7A00] hover:underline cursor-pointer block"
                        >
                          Configure Motion & Live Preview ↓
                        </button>
                      </div>
                    )}

                    {/* Quick Assign to Core Portfolio Slots */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <div className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                        <span>Quick Assign:</span>
                        {isHeroChar && <span className="text-[#00E5FF] font-bold text-[9px]">Active Hero</span>}
                        {isAboutPhoto && <span className="text-[#A855F7] font-bold text-[9px]">Active About</span>}
                        {isBrandIcon && <span className="text-[#FF7A00] font-bold text-[9px]">Active Logo</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleAssignToBrandSlot(
                              'heroCharacter',
                              asset.url,
                              'Hero Character Visual'
                            )
                          }
                          className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                            isHeroChar
                              ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40 hover:text-[#00E5FF]'
                          }`}
                          title="Set as Hero Character visual in Home section"
                        >
                          {isHeroChar ? '✓ Hero Avatar' : '→ Hero Avatar'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAssignToBrandSlot(
                              'aboutPhoto',
                              asset.url,
                              'About Section Portrait'
                            )
                          }
                          className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                            isAboutPhoto
                              ? 'bg-[#A855F7]/20 border-[#A855F7] text-[#A855F7]'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-[#A855F7]/10 hover:border-[#A855F7]/40 hover:text-[#A855F7]'
                          }`}
                          title="Set as About Section portrait image"
                        >
                          {isAboutPhoto ? '✓ About Photo' : '→ About Photo'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAssignToBrandSlot(
                              'brandIcon',
                              asset.url,
                              'Brand Monogram / Favicon'
                            )
                          }
                          className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                            isBrandIcon
                              ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00]'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-[#FF7A00]/10 hover:border-[#FF7A00]/40 hover:text-[#FF7A00]'
                          }`}
                          title="Set as Brand Monogram / Favicon"
                        >
                          {isBrandIcon ? '✓ Logo Icon' : '→ Logo Icon'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAssignToBrandSlot(
                              'brandBanner',
                              asset.url,
                              'Brand Banner / MK forge_auto'
                            )
                          }
                          className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                            isBrandBanner
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-400'
                          }`}
                          title="Set as Brand Banner"
                        >
                          {isBrandBanner ? '✓ Brand Banner' : '→ Banner'}
                        </button>
                      </div>
                    </div>

                    {/* Copy URL button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          setCopiedKey(asset.filename);
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="text-[10px] font-mono text-[#888888] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedKey === asset.filename ? (
                          <>
                            <Check className="w-3 h-3 text-[#25D366]" />
                            <span className="text-[#25D366]">Copied URL!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-[#666666] hover:text-white flex items-center gap-0.5"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: HOME BACKGROUND STUDIO & LIVE INTERACTIVE PREVIEW
          ========================================================================= */}
      {bgDraft && (
        <div
          id="home-background-settings-panel"
          className="p-6 sm:p-8 rounded-2xl bg-[#090A0E] border border-[rgba(255,122,0,0.3)] shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-lg font-bold text-white tracking-wide">
                    Home Page Animated Background Studio
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-[9px] font-mono font-bold uppercase">
                    CONTROLS ONLY HOME PAGE
                  </span>
                </div>
                <p className="text-xs text-[#AAAAAA] mt-0.5">
                  Full control over continuous movement, cursor interaction, 3D depth, blur, and
                  opacity for the Home page background.
                </p>
              </div>
            </div>

            {/* Quick Master Save Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={resetHomeBackground}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                onClick={handleSaveBackgroundSettings}
                disabled={isSavingBg}
                className="px-5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A00] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_18px_rgba(255,122,0,0.35)] cursor-pointer flex items-center gap-1.5"
              >
                {isSavingBg ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Save Background Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ACTIVE BACKGROUND ASSET SUMMARY BAR */}
          <div className="p-4 rounded-xl bg-[#050507] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-xl bg-black border border-[#FF7A00]/40 overflow-hidden shrink-0 relative">
                {bgDraft.backgroundImage ? (
                  <MediaFallback
                    src={bgDraft.backgroundImage}
                    alt="Active Background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555555]">
                    <Layers className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#777777] font-semibold">
                    Current Home Background Visual:
                  </span>
                  {bgDraft.backgroundImage ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#25D366]/15 text-[#25D366] text-[9px] font-mono font-bold">
                      CUSTOM ASSET ACTIVE
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white/70 text-[9px] font-mono">
                      DEFAULT 3D CYBER PANELS
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-white block truncate max-w-sm sm:max-w-md">
                  {bgDraft.backgroundImage || 'Procedural Cyber Gallery (No static image)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {bgDraft.backgroundImage && (
                <button
                  onClick={handleRemoveFromHomeBackground}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono cursor-pointer transition-colors"
                >
                  Clear Background Image
                </button>
              )}

              {selectedBgAsset && selectedBgAsset.url !== bgDraft.backgroundImage && (
                <button
                  onClick={() => handleSetAsHomeBackground(selectedBgAsset)}
                  className="px-4 py-1.5 rounded-lg bg-[#FF7A00] text-black font-mono font-bold text-xs cursor-pointer hover:bg-[#FF8A00] transition-colors"
                >
                  Apply "{selectedBgAsset.name || selectedBgAsset.filename}" as Background
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              LIVE REAL-TIME PREVIEW STAGE
              ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FF7A00]" />
                Interactive Live Preview (Move cursor over box to test 3D tilt & parallax)
              </span>
              <span className="text-[#FF7A00] text-[11px] font-semibold">
                FPS: 60+ Hardware Accelerated
              </span>
            </div>

            <div className="w-full h-80 rounded-2xl bg-[#050505] border border-white/[0.12] overflow-hidden relative shadow-2xl">
              {/* Render real Interactive Hero Background inside preview frame */}
              <InteractiveHeroBackground customConfig={bgDraft} isPreview={true} />

              {/* Sample simulated Home Hero typography overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4 z-20">
                <div className="px-3 py-1 rounded-full bg-black/60 border border-[rgba(255,122,0,0.3)] text-[#FF7A00] font-mono text-[9px] uppercase tracking-widest mb-2 backdrop-blur-sm">
                  LIVE BACKGROUND PREVIEW
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">
                  MANIKANTHA
                </h2>
                <p className="text-[11px] font-mono text-white/70 max-w-sm mt-1">
                  Continuously moving background visual behind home hero
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              DETAILED CONTROLS GRID
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* COLUMN 1: MOTION & SPEED */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#FF7A00]" />
                  Animation & Speed
                </h5>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bgDraft.autoMotion.enabled}
                    onChange={(e) =>
                      setBgDraft({
                        ...bgDraft,
                        autoMotion: { ...bgDraft.autoMotion, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF7A00]" />
                </label>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Animation Speed</span>
                  <span className="text-[#FF7A00] font-bold">
                    {bgDraft.autoMotion.speed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.5"
                  step="0.1"
                  value={bgDraft.autoMotion.speed}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      autoMotion: { ...bgDraft.autoMotion, speed: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-[#FF7A00] cursor-pointer"
                />
              </div>

              {/* Motion Intensity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Motion Intensity</span>
                  <span className="text-white font-bold">
                    {bgDraft.autoMotion.intensity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={bgDraft.autoMotion.intensity}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      autoMotion: {
                        ...bgDraft.autoMotion,
                        intensity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-[#FF7A00] cursor-pointer"
                />
              </div>

              {/* Movement Direction Toggle */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-[#AAAAAA] block">
                  Movement Direction
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBgDraft({
                        ...bgDraft,
                        autoMotion: { ...bgDraft.autoMotion, direction: 'normal' },
                      })
                    }
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      bgDraft.autoMotion.direction === 'normal'
                        ? 'bg-[#FF7A00] text-black'
                        : 'bg-white/[0.05] text-[#888888] hover:text-white'
                    }`}
                  >
                    Normal →
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBgDraft({
                        ...bgDraft,
                        autoMotion: { ...bgDraft.autoMotion, direction: 'reverse' },
                      })
                    }
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      bgDraft.autoMotion.direction === 'reverse'
                        ? 'bg-[#FF7A00] text-black'
                        : 'bg-white/[0.05] text-[#888888] hover:text-white'
                    }`}
                  >
                    ← Reverse
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: VISUAL & ATMOSPHERE */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-4">
              <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                Visual & Atmosphere
              </h5>

              {/* Background Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Background Opacity</span>
                  <span className="text-[#00E5FF] font-bold">
                    {(bgDraft.visual.opacity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={bgDraft.visual.opacity}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      visual: { ...bgDraft.visual, opacity: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Blur Level */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Background Blur</span>
                  <span className="text-white font-bold">{bgDraft.visual.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={bgDraft.visual.blur}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      visual: { ...bgDraft.visual, blur: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Glow Intensity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Glow Intensity</span>
                  <span className="text-white font-bold">
                    {(bgDraft.visual.glowIntensity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.1"
                  value={bgDraft.visual.glowIntensity}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      visual: { ...bgDraft.visual, glowIntensity: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Overlay Darkness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Overlay Darkness</span>
                  <span className="text-white font-bold">
                    {(bgDraft.visual.overlayDarkness * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.95"
                  step="0.05"
                  value={bgDraft.visual.overlayDarkness}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      visual: { ...bgDraft.visual, overlayDarkness: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>
            </div>

            {/* COLUMN 3: CURSOR & 3D DEPTH */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#A855F7]" />
                  Cursor & 3D Depth
                </h5>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bgDraft.cursorInteraction.enabled}
                    onChange={(e) =>
                      setBgDraft({
                        ...bgDraft,
                        cursorInteraction: {
                          ...bgDraft.cursorInteraction,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#A855F7]" />
                </label>
              </div>

              {/* Cursor Sensitivity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Cursor Sensitivity</span>
                  <span className="text-[#A855F7] font-bold">
                    {bgDraft.cursorInteraction.sensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={bgDraft.cursorInteraction.sensitivity}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      cursorInteraction: {
                        ...bgDraft.cursorInteraction,
                        sensitivity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-[#A855F7] cursor-pointer"
                />
              </div>

              {/* 3D Depth Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">3D Depth</span>
                  <span className="text-white font-bold">
                    {bgDraft.motion3D.depth.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={bgDraft.motion3D.depth}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      motion3D: { ...bgDraft.motion3D, depth: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-[#A855F7] cursor-pointer"
                />
              </div>

              {/* Parallax Strength */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#AAAAAA]">Parallax Strength</span>
                  <span className="text-white font-bold">
                    {bgDraft.motion3D.parallaxStrength.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={bgDraft.motion3D.parallaxStrength}
                  onChange={(e) =>
                    setBgDraft({
                      ...bgDraft,
                      motion3D: {
                        ...bgDraft.motion3D,
                        parallaxStrength: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-[#A855F7] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              MULTIPLE BACKGROUND PANELS MANAGER
              ========================================================================= */}
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-display text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF7A00]" />
                  Continuous Moving 3D Background Panels ({bgDraft.panels?.length || 0})
                </h5>
                <p className="text-xs text-[#777777]">
                  These panels drift across the screen continuously in 3 depth layers. You can
                  reorder, enable/disable, or assign custom media images to each.
                </p>
              </div>

              <button
                onClick={() => {
                  // Add a new empty panel
                  if (!bgDraft) return;
                  const newP: BackgroundPanelItem = {
                    id: `panel-${Date.now()}`,
                    row: 1,
                    tag: 'NEW ASSET',
                    tagColor: 'orange',
                    title: 'Interactive Visual',
                    category: 'Creative Visual',
                    tech: 'Vector • 3D',
                    iconName: 'Sparkles',
                    previewType: 'grid',
                    stats: 'CUSTOM',
                    enabled: true,
                    order: (bgDraft.panels?.length || 0) + 1,
                  };
                  setBgDraft({ ...bgDraft, panels: [newP, ...(bgDraft.panels || [])] });
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Add Panel</span>
              </button>
            </div>

            {/* Panels Table / List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {bgDraft.panels && bgDraft.panels.length > 0 ? (
                bgDraft.panels.map((panel, idx) => (
                  <div
                    key={panel.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      panel.enabled !== false
                        ? 'bg-black/50 border-white/[0.08]'
                        : 'bg-black/20 border-white/[0.03] opacity-50'
                    }`}
                  >
                    {/* Thumbnail or Icon */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-black/80 border border-white/[0.1] overflow-hidden shrink-0 flex items-center justify-center">
                        {panel.imageUrl ? (
                          <img
                            src={panel.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-[#FF7A00]">
                            R{panel.row}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white truncate">
                            {panel.title}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08] text-white/70">
                            Row {panel.row}
                          </span>
                          {panel.imageUrl && (
                            <span className="text-[9px] font-mono text-[#25D366]">
                              Has Custom Image
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#666666] block truncate">
                          {panel.category} • Tag: {panel.tag}
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Row Selector */}
                      <select
                        value={panel.row || 1}
                        onChange={(e) => {
                          const newRow = parseInt(e.target.value) as 1 | 2 | 3;
                          const updated = (bgDraft.panels || []).map((p) =>
                            p.id === panel.id ? { ...p, row: newRow } : p
                          );
                          setBgDraft({ ...bgDraft, panels: updated });
                        }}
                        className="px-2 py-1 rounded bg-black border border-white/[0.1] text-[10px] font-mono text-white cursor-pointer"
                      >
                        <option value={1}>Row 1 (Top)</option>
                        <option value={2}>Row 2 (Center)</option>
                        <option value={3}>Row 3 (Bottom)</option>
                      </select>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePanel(panel.id)}
                        className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                          panel.enabled !== false
                            ? 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30'
                            : 'bg-white/[0.05] text-[#777777]'
                        }`}
                      >
                        {panel.enabled !== false ? 'Active' : 'Disabled'}
                      </button>

                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        onClick={() => handleMovePanel(panel.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 disabled:opacity-30 cursor-pointer"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePanel(panel.id, 'down')}
                        disabled={idx === bgDraft.panels.length - 1}
                        className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 disabled:opacity-30 cursor-pointer"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePanel(panel.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-[#666666] hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs font-mono text-[#666666]">
                  No panels configured.
                </div>
              )}
            </div>
          </div>

          {/* Action Bar Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#777777]">
              <Info className="w-4 h-4 text-[#FF7A00]" />
              <span>
                Saving updates database and automatically refreshes the public live Home Page.
              </span>
            </div>

            <div className="flex items-center gap-3">
              {selectedBgAsset && (
                <button
                  onClick={() => handleSetAsHomeBackground(selectedBgAsset)}
                  disabled={isSavingBg}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Set Selected as Home BG
                </button>
              )}

              <button
                onClick={handleSaveBackgroundSettings}
                disabled={isSavingBg}
                className="px-6 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A00] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,122,0,0.35)] cursor-pointer flex items-center gap-2"
              >
                {isSavingBg ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Background Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: CORE BRAND IDENTITY SLOTS (HERO CHARACTER, PORTRAIT, ICONS)
          Kept intact to preserve all existing admin functionality
          ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#FF7A00]" />
          <h4 className="font-display text-base font-bold text-white tracking-wide">
            Core Brand Identity Slots
          </h4>
          <span className="text-xs font-mono text-[#777777]">
            (Fixed System Anchors)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mediaSlots.map((slot) => {
            const isCustom = slot.currentUrl !== slot.defaultUrl;
            const isUploading = uploadingTarget === slot.key;
            const isDragOver = dragOverSlot === slot.key;
            const isUrlEditing = urlInputMode[slot.key];

            return (
              <div
                key={slot.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlot(slot.key);
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverSlot(null);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCoreSlotUpload(slot.key, file);
                }}
                className={`p-5 rounded-2xl bg-[#090909] border transition-all flex flex-col justify-between ${
                  isDragOver
                    ? 'border-[#FF7A00] bg-[#FF7A00]/5 scale-[1.01]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] font-mono text-[10px] text-[#FF7A00] font-semibold">
                      {slot.slotLabel}
                    </span>

                    {isCustom ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] text-[10px] font-mono font-bold">
                        Custom Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.03] text-[#666666] text-[10px] font-mono">
                        Default System
                      </span>
                    )}
                  </div>

                  <h5 className="font-display text-sm font-bold text-white">{slot.title}</h5>
                  <p className="text-xs text-[#888888] mt-1 line-clamp-2">{slot.description}</p>
                </div>

                {/* Preview Thumbnail */}
                <div className="my-4 w-full h-40 rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden flex items-center justify-center relative group">
                  <MediaFallback
                    src={slot.currentUrl}
                    alt={slot.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={slot.currentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Direct URL input if toggled */}
                {urlInputMode[slot.key] && (
                  <div className="pt-2 pb-1 space-y-1.5 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={urlDrafts[slot.key] ?? slot.currentUrl}
                        onChange={(e) => setUrlDrafts({ ...urlDrafts, [slot.key]: e.target.value })}
                        placeholder="https://... or /uploads/..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/[0.12] text-xs font-mono text-white focus:outline-none focus:border-[#FF7A00]"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const val = urlDrafts[slot.key] || slot.currentUrl;
                          if (val) {
                            await handleAssignToBrandSlot(slot.key, val.trim(), slot.title);
                            setUrlInputMode({ ...urlInputMode, [slot.key]: false });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FF7A00] text-black font-mono font-bold text-xs hover:bg-[#FF8A00] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrlInputMode({ ...urlInputMode, [slot.key]: false })}
                        className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Slot Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <label className="px-3 py-1.5 rounded-xl bg-[#FF7A00]/15 hover:bg-[#FF7A00]/25 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold cursor-pointer transition-colors flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoreSlotUpload(slot.key, file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setPickingSlotFor(slot)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Pick Asset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUrlDrafts({ ...urlDrafts, [slot.key]: slot.currentUrl });
                        setUrlInputMode({ ...urlInputMode, [slot.key]: !urlInputMode[slot.key] });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs font-mono cursor-pointer transition-colors"
                      title="Edit Image URL directly"
                    >
                      URL
                    </button>
                  </div>

                  {isCustom && (
                    <button
                      onClick={() => setConfirmResetSlot(slot)}
                      className="text-xs font-mono text-[#888888] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Resetting a Core Brand Slot */}
      {confirmResetSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D0D0D] border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-white">
                  Reset to Original Default?
                </h4>
                <span className="text-xs font-mono text-[#777777]">
                  Reverts slot to: {confirmResetSlot.defaultUrl}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#AAAAAA] leading-relaxed">
              Are you sure you want to revert{' '}
              <strong className="text-white font-semibold">"{confirmResetSlot.title}"</strong> back
              to its default artwork?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setConfirmResetSlot(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-[#B8B8B8] hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => handleResetToDefault(confirmResetSlot)}
                className="px-5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A00] text-black font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isResetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Picking an Asset from Library for a Core Slot */}
      {pickingSlotFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[85vh] p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.12] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-display text-base font-bold text-white">
                    Select Asset for {pickingSlotFor.title}
                  </h4>
                  <p className="text-xs font-mono text-[#888888]">
                    Click any uploaded media asset below to assign it immediately
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPickingSlotFor(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
              {mediaAssets.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs">
                  No uploaded media assets found. Upload an image first.
                </div>
              ) : (
                mediaAssets.map((asset) => {
                  const isCurrent = pickingSlotFor.currentUrl === asset.url;
                  return (
                    <div
                      key={asset.filename}
                      onClick={async () => {
                        await handleAssignToBrandSlot(pickingSlotFor.key, asset.url, pickingSlotFor.title);
                        setPickingSlotFor(null);
                      }}
                      className={`group p-2.5 rounded-xl bg-white/[0.03] border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#FF7A00] ring-1 ring-[#FF7A00]/50 bg-[#FF7A00]/5'
                          : 'border-white/[0.08] hover:border-white/[0.25]'
                      }`}
                    >
                      <div className="w-full h-28 rounded-lg bg-black/60 overflow-hidden flex items-center justify-center relative mb-2">
                        <MediaFallback
                          src={asset.url}
                          alt={asset.name || asset.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isCurrent && (
                          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-[#FF7A00] text-black font-mono font-bold text-[8px]">
                            CURRENT
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
                onClick={() => setPickingSlotFor(null)}
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
