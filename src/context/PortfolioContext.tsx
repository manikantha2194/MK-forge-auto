import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import {
  ProfileConfig,
  StatItem,
  Project,
  ContentItem,
  Skill,
  ExperienceItem,
  ServiceItem,
  CertificationItem,
  SocialLinkItem,
  HeroEditorConfig,
  AboutEditorConfig,
  ContactEditorConfig,
  AppearanceConfig,
  HomeBackgroundConfig,
} from '../types';

interface PortfolioContextType {
  profile: ProfileConfig | null;
  stats: StatItem[];
  projects: Project[];
  content: ContentItem[];
  skills: Skill[];
  experience: ExperienceItem[];
  services: ServiceItem[];
  certifications: CertificationItem[];
  socialLinks: SocialLinkItem[];
  heroConfig: HeroEditorConfig | null;
  aboutConfig: AboutEditorConfig | null;
  contactConfig: ContactEditorConfig | null;
  appearance: AppearanceConfig | null;
  homeBackground: HomeBackgroundConfig | null;
  isLoading: boolean;
  error: string | null;

  refreshAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshContent: () => Promise<void>;
  refreshSkills: () => Promise<void>;
  refreshExperience: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshCertifications: () => Promise<void>;
  refreshSocialLinks: () => Promise<void>;
  refreshHeroConfig: () => Promise<void>;
  refreshAboutConfig: () => Promise<void>;
  refreshContactConfig: () => Promise<void>;
  refreshAppearance: () => Promise<void>;
  refreshHomeBackground: () => Promise<void>;

  updateHeroConfig: (updates: Partial<HeroEditorConfig>) => Promise<boolean>;
  updateAboutConfig: (updates: Partial<AboutEditorConfig>) => Promise<boolean>;
  updateProfile: (updates: Partial<ProfileConfig>) => Promise<boolean>;
  updateContactConfig: (updates: Partial<ContactEditorConfig>) => Promise<boolean>;
  updateAppearance: (updates: Partial<AppearanceConfig>) => Promise<boolean>;
  updateHomeBackground: (updates: Partial<HomeBackgroundConfig>) => Promise<boolean>;
  resetHomeBackground: () => Promise<boolean>;
  duplicateProject: (id: string) => Promise<Project | null>;
  reorderProjects: (ids: string[]) => Promise<boolean>;
  reorderSkills: (ids: string[]) => Promise<boolean>;
  reorderExperience: (ids: string[]) => Promise<boolean>;
  reorderServices: (ids: string[]) => Promise<boolean>;
  reorderCertifications: (ids: string[]) => Promise<boolean>;
  addService: (service: ServiceItem) => Promise<boolean>;
  updateService: (id: string, updates: Partial<ServiceItem>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  addCertification: (cert: CertificationItem) => Promise<boolean>;
  updateCertification: (id: string, updates: Partial<CertificationItem>) => Promise<boolean>;
  deleteCertification: (id: string) => Promise<boolean>;
  addSocialLink: (link: SocialLinkItem) => Promise<boolean>;
  updateSocialLink: (id: string, updates: Partial<SocialLinkItem>) => Promise<boolean>;
  deleteSocialLink: (id: string) => Promise<boolean>;
  reorderSocialLinks: (ids: string[]) => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileConfig | null>(() => {
    try {
      const stored = localStorage.getItem('mk_persisted_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [stats, setStats] = useState<StatItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroEditorConfig | null>(() => {
    try {
      const stored = localStorage.getItem('mk_persisted_hero_config');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [aboutConfig, setAboutConfig] = useState<AboutEditorConfig | null>(() => {
    try {
      const stored = localStorage.getItem('mk_persisted_about_config');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [contactConfig, setContactConfig] = useState<ContactEditorConfig | null>(null);
  const [appearance, setAppearance] = useState<AppearanceConfig | null>(null);
  const [homeBackground, setHomeBackground] = useState<HomeBackgroundConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiFetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const stored = localStorage.getItem('mk_persisted_profile');
        let merged = data;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.media) {
              merged = {
                ...data,
                media: {
                  ...data.media,
                  ...parsed.media,
                },
              };
            }
          } catch {
            // ignore parse error
          }
        }
        setProfile(merged);
        localStorage.setItem('mk_persisted_profile', JSON.stringify(merged));
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch('/api/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await apiFetch('/api/projects');
      if (res.ok) setProjects(await res.json());
    } catch (e) {
      console.error('Failed to fetch projects', e);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      const res = await apiFetch('/api/content');
      if (res.ok) setContent(await res.json());
    } catch (e) {
      console.error('Failed to fetch content', e);
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await apiFetch('/api/skills');
      if (res.ok) setSkills(await res.json());
    } catch (e) {
      console.error('Failed to fetch skills', e);
    }
  }, []);

  const fetchExperience = useCallback(async () => {
    try {
      const res = await apiFetch('/api/experience');
      if (res.ok) setExperience(await res.json());
    } catch (e) {
      console.error('Failed to fetch experience', e);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await apiFetch('/api/services');
      if (res.ok) setServices(await res.json());
    } catch (e) {
      console.error('Failed to fetch services', e);
    }
  }, []);

  const fetchCertifications = useCallback(async () => {
    try {
      const res = await apiFetch('/api/certifications');
      if (res.ok) setCertifications(await res.json());
    } catch (e) {
      console.error('Failed to fetch certifications', e);
    }
  }, []);

  const fetchSocialLinks = useCallback(async () => {
    try {
      const res = await apiFetch('/api/social-links');
      if (res.ok) setSocialLinks(await res.json());
    } catch (e) {
      console.error('Failed to fetch social links', e);
    }
  }, []);

  const fetchHeroConfig = useCallback(async () => {
    try {
      const res = await apiFetch('/api/hero-config');
      if (res.ok) {
        const data = await res.json();
        const stored = localStorage.getItem('mk_persisted_hero_config');
        let merged = data;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.profileImage) {
              merged = { ...data, profileImage: parsed.profileImage };
            }
          } catch {
            // ignore
          }
        }
        setHeroConfig(merged);
        localStorage.setItem('mk_persisted_hero_config', JSON.stringify(merged));
      }
    } catch (e) {
      console.error('Failed to fetch hero config', e);
    }
  }, []);

  const fetchAboutConfig = useCallback(async () => {
    try {
      const res = await apiFetch('/api/about-config');
      if (res.ok) {
        const data = await res.json();
        const stored = localStorage.getItem('mk_persisted_about_config');
        let merged = data;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.profileImage) {
              merged = { ...data, profileImage: parsed.profileImage };
            }
          } catch {
            // ignore
          }
        }
        setAboutConfig(merged);
        localStorage.setItem('mk_persisted_about_config', JSON.stringify(merged));
      }
    } catch (e) {
      console.error('Failed to fetch about config', e);
    }
  }, []);

  const fetchContactConfig = useCallback(async () => {
    try {
      const res = await apiFetch('/api/contact-config');
      if (res.ok) setContactConfig(await res.json());
    } catch (e) {
      console.error('Failed to fetch contact config', e);
    }
  }, []);

  const fetchAppearance = useCallback(async () => {
    try {
      const res = await apiFetch('/api/appearance');
      if (res.ok) setAppearance(await res.json());
    } catch (e) {
      console.error('Failed to fetch appearance', e);
    }
  }, []);

  const fetchHomeBackground = useCallback(async () => {
    try {
      const res = await apiFetch('/api/home-background');
      if (res.ok) setHomeBackground(await res.json());
    } catch (e) {
      console.error('Failed to fetch home background', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchProfile(),
        fetchStats(),
        fetchProjects(),
        fetchContent(),
        fetchSkills(),
        fetchExperience(),
        fetchServices(),
        fetchCertifications(),
        fetchSocialLinks(),
        fetchHeroConfig(),
        fetchAboutConfig(),
        fetchContactConfig(),
        fetchAppearance(),
        fetchHomeBackground(),
      ]);
    } catch (err) {
      console.error('[PortfolioContext] Failed to load data:', err);
      setError('Unable to load some portfolio resources.');
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchProfile,
    fetchStats,
    fetchProjects,
    fetchContent,
    fetchSkills,
    fetchExperience,
    fetchServices,
    fetchCertifications,
    fetchSocialLinks,
    fetchHeroConfig,
    fetchAboutConfig,
    fetchContactConfig,
    fetchAppearance,
    fetchHomeBackground,
  ]);

  const getAuthHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
    const token = localStorage.getItem('mk_auth_token');
    const headers: Record<string, string> = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const updateHeroConfig = async (updates: Partial<HeroEditorConfig>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/hero-config', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setHeroConfig(data);
        localStorage.setItem('mk_persisted_hero_config', JSON.stringify(data));
        fetchProfile();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateAboutConfig = async (updates: Partial<AboutEditorConfig>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/about-config', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setAboutConfig(data);
        localStorage.setItem('mk_persisted_about_config', JSON.stringify(data));
        fetchProfile();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateProfile = async (updates: Partial<ProfileConfig>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        localStorage.setItem('mk_persisted_profile', JSON.stringify(data));
        fetchHeroConfig();
        fetchAboutConfig();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateContactConfig = async (updates: Partial<ContactEditorConfig>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/contact-config', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setContactConfig(data);
        fetchProfile();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateAppearance = async (updates: Partial<AppearanceConfig>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/appearance', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setAppearance(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateHomeBackground = async (updates: Partial<HomeBackgroundConfig>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/home-background', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setHomeBackground(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetHomeBackground = async (): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/home-background/reset', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setHomeBackground(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const duplicateProject = async (id: string): Promise<Project | null> => {
    try {
      const res = await apiFetch(`/api/projects/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const created = await res.json();
        fetchProjects();
        return created;
      }
      return null;
    } catch {
      return null;
    }
  };

  const reorderProjects = async (ids: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/projects/reorder', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const reordered = await res.json();
        setProjects(reordered);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reorderSkills = async (ids: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/skills/reorder', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const reordered = await res.json();
        setSkills(reordered);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reorderExperience = async (ids: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/experience/reorder', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const reordered = await res.json();
        setExperience(reordered);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reorderServices = async (ids: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/services-reorder', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const reordered = await res.json();
        setServices(reordered);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reorderCertifications = async (ids: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/certifications-reorder', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const reordered = await res.json();
        setCertifications(reordered);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addService = async (service: ServiceItem): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/services', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(service),
      });
      if (res.ok) {
        fetchServices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchServices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchServices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addCertification = async (cert: CertificationItem): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/certifications', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(cert),
      });
      if (res.ok) {
        fetchCertifications();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateCertification = async (id: string, updates: Partial<CertificationItem>): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/certifications/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchCertifications();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteCertification = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/certifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchCertifications();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addSocialLink = async (link: SocialLinkItem): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/social-links', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(link),
      });
      if (res.ok) {
        fetchSocialLinks();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateSocialLink = async (id: string, updates: Partial<SocialLinkItem>): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/social-links/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchSocialLinks();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteSocialLink = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/social-links/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchSocialLinks();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const reorderSocialLinks = async (ids: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/social-links-reorder', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const reordered = await res.json();
        setSocialLinks(reordered);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        stats,
        projects,
        content,
        skills,
        experience,
        services,
        certifications,
        socialLinks,
        heroConfig,
        aboutConfig,
        contactConfig,
        appearance,
        homeBackground,
        isLoading,
        error,
        refreshAll,
        refreshProfile: fetchProfile,
        refreshProjects: fetchProjects,
        refreshContent: fetchContent,
        refreshSkills: fetchSkills,
        refreshExperience: fetchExperience,
        refreshStats: fetchStats,
        refreshServices: fetchServices,
        refreshCertifications: fetchCertifications,
        refreshSocialLinks: fetchSocialLinks,
        refreshHeroConfig: fetchHeroConfig,
        refreshAboutConfig: fetchAboutConfig,
        refreshContactConfig: fetchContactConfig,
        refreshAppearance: fetchAppearance,
        refreshHomeBackground: fetchHomeBackground,
        updateHeroConfig,
        updateAboutConfig,
        updateProfile,
        updateContactConfig,
        updateAppearance,
        updateHomeBackground,
        resetHomeBackground,
        duplicateProject,
        reorderProjects,
        reorderSkills,
        reorderExperience,
        reorderServices,
        reorderCertifications,
        addService,
        updateService,
        deleteService,
        addCertification,
        updateCertification,
        deleteCertification,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink,
        reorderSocialLinks,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

