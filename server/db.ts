import fs from 'fs';
import path from 'path';
import type {
  ProfileConfig,
  StatItem,
  Project,
  ContentItem,
  Skill,
  ExperienceItem,
  ContactMessage,
  ServiceItem,
  CertificationItem,
  SocialLinkItem,
  HeroEditorConfig,
  AboutEditorConfig,
  ContactEditorConfig,
  AppearanceConfig,
  HomeBackgroundConfig,
  MediaAssetItem,
} from '../src/types.ts';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

export interface DatabaseSchema {
  users: StoredUser[];
  profile: ProfileConfig;
  stats: StatItem[];
  projects: Project[];
  content: ContentItem[];
  skills: Skill[];
  experience: ExperienceItem[];
  messages: ContactMessage[];
  services?: ServiceItem[];
  certifications?: CertificationItem[];
  socialLinks?: SocialLinkItem[];
  heroConfig?: HeroEditorConfig;
  aboutConfig?: AboutEditorConfig;
  contactConfig?: ContactEditorConfig;
  appearance?: AppearanceConfig;
  homeBackground?: HomeBackgroundConfig;
  mediaAssets?: MediaAssetItem[];
}

const DEFAULT_DB_PATH = path.join(process.cwd(), 'server', 'db.json');
const TMP_DB_PATH = path.join('/tmp', 'db.json');

export class Database {
  private static cachedData: DatabaseSchema | null = null;

  private static getWorkingDbPath(): string {
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      if (!fs.existsSync(TMP_DB_PATH)) {
        try {
          if (fs.existsSync(DEFAULT_DB_PATH)) {
            fs.copyFileSync(DEFAULT_DB_PATH, TMP_DB_PATH);
          }
        } catch (e) {
          console.warn('[DB] Could not copy db.json to /tmp:', e);
        }
      }
      return TMP_DB_PATH;
    }
    return DEFAULT_DB_PATH;
  }

  private static load(): DatabaseSchema {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const activePath = this.getWorkingDbPath();
      if (fs.existsSync(activePath)) {
        const raw = fs.readFileSync(activePath, 'utf-8');
        this.cachedData = JSON.parse(raw) as DatabaseSchema;
        return this.cachedData;
      }

      if (fs.existsSync(DEFAULT_DB_PATH)) {
        const raw = fs.readFileSync(DEFAULT_DB_PATH, 'utf-8');
        this.cachedData = JSON.parse(raw) as DatabaseSchema;
        return this.cachedData;
      }

      throw new Error(`Database file not found at ${activePath} or ${DEFAULT_DB_PATH}`);
    } catch (err) {
      console.error('[DB] Error loading database:', err);
      if (this.cachedData) {
        return this.cachedData;
      }
      throw err;
    }
  }

  private static save(data: DatabaseSchema): void {
    this.cachedData = data;
    let targetPath = DEFAULT_DB_PATH;
    try {
      targetPath = this.getWorkingDbPath();
      const tempPath = `${targetPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, targetPath);
    } catch (err) {
      console.warn('[DB] Warning saving database to disk (keeping in-memory state):', err);
      // Try writing to /tmp/db.json if default path was read-only
      try {
        if (!fs.existsSync(TMP_DB_PATH) || targetPath !== TMP_DB_PATH) {
          fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        }
      } catch {
        // In-memory cache is maintained
      }
    }
  }

  // Users & Auth
  public static getUsers(): StoredUser[] {
    return this.load().users;
  }

  public static getUserByEmail(email: string): StoredUser | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public static getUserById(id: string): StoredUser | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public static updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const data = this.load();
    const user = data.users.find(u => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.save(data);
    return true;
  }

  // Profile
  public static getProfile(): ProfileConfig {
    const data = this.load();
    const media = data.profile?.media || {
      heroCharacter: '/assets/hero-character.svg',
      aboutPhoto: '/assets/about-manikantha.svg',
      brandIcon: '/assets/mk-logo.svg',
      brandBanner: '/assets/mk-forge-auto.svg',
    };

    return {
      ...data.profile,
      media: {
        heroCharacter: media.heroCharacter || '/assets/hero-character.svg',
        aboutPhoto: media.aboutPhoto || '/assets/about-manikantha.svg',
        brandIcon: media.brandIcon || '/assets/mk-logo.svg',
        brandBanner: media.brandBanner || '/assets/mk-forge-auto.svg',
      }
    };
  }

  public static updateProfile(newProfile: Partial<ProfileConfig>): ProfileConfig {
    const data = this.load();
    data.profile = {
      ...data.profile,
      ...newProfile,
      socials: {
        ...data.profile.socials,
        ...(newProfile.socials || {})
      },
      media: {
        ...data.profile.media,
        ...(newProfile.media || {})
      }
    };

    // Synchronize heroConfig and aboutConfig when media changes!
    if (newProfile.media?.heroCharacter) {
      if (!data.heroConfig) data.heroConfig = this.getHeroConfig();
      data.heroConfig.profileImage = newProfile.media.heroCharacter;
    }
    if (newProfile.media?.aboutPhoto) {
      if (!data.aboutConfig) data.aboutConfig = this.getAboutConfig();
      data.aboutConfig.profileImage = newProfile.media.aboutPhoto;
    }

    this.save(data);
    return this.getProfile();
  }

  // Stats
  public static getStats(): StatItem[] {
    return this.load().stats;
  }

  public static updateStats(newStats: StatItem[]): StatItem[] {
    const data = this.load();
    data.stats = newStats;
    this.save(data);
    return data.stats;
  }

  // Projects
  public static getProjects(): Project[] {
    return this.load().projects;
  }

  public static getProjectById(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  public static addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const data = this.load();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    data.projects.unshift(newProject);
    this.save(data);
    return newProject;
  }

  public static updateProject(id: string, updates: Partial<Project>): Project | null {
    const data = this.load();
    const index = data.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.projects[index] = {
      ...data.projects[index],
      ...updates
    };
    this.save(data);
    return data.projects[index];
  }

  public static deleteProject(id: string): boolean {
    const data = this.load();
    const initLen = data.projects.length;
    data.projects = data.projects.filter(p => p.id !== id);
    if (data.projects.length === initLen) return false;
    this.save(data);
    return true;
  }

  // Content
  public static getContent(): ContentItem[] {
    return this.load().content;
  }

  public static addContent(item: Omit<ContentItem, 'id' | 'createdAt'>): ContentItem {
    const data = this.load();
    const newItem: ContentItem = {
      ...item,
      id: `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    data.content.unshift(newItem);
    this.save(data);
    return newItem;
  }

  public static updateContent(id: string, updates: Partial<ContentItem>): ContentItem | null {
    const data = this.load();
    const index = data.content.findIndex(c => c.id === id);
    if (index === -1) return null;
    data.content[index] = { ...data.content[index], ...updates };
    this.save(data);
    return data.content[index];
  }

  public static deleteContent(id: string): boolean {
    const data = this.load();
    const initLen = data.content.length;
    data.content = data.content.filter(c => c.id !== id);
    if (data.content.length === initLen) return false;
    this.save(data);
    return true;
  }

  // Skills
  public static getSkills(): Skill[] {
    return this.load().skills;
  }

  public static addSkill(skill: Omit<Skill, 'id'>): Skill {
    const data = this.load();
    const newSkill: Skill = {
      ...skill,
      id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    data.skills.push(newSkill);
    this.save(data);
    return newSkill;
  }

  public static updateSkill(id: string, updates: Partial<Skill>): Skill | null {
    const data = this.load();
    const index = data.skills.findIndex(s => s.id === id);
    if (index === -1) return null;
    data.skills[index] = { ...data.skills[index], ...updates };
    this.save(data);
    return data.skills[index];
  }

  public static deleteSkill(id: string): boolean {
    const data = this.load();
    const initLen = data.skills.length;
    data.skills = data.skills.filter(s => s.id !== id);
    if (data.skills.length === initLen) return false;
    this.save(data);
    return true;
  }

  // Experience
  public static getExperience(): ExperienceItem[] {
    return this.load().experience.sort((a, b) => a.order - b.order);
  }

  public static addExperience(exp: Omit<ExperienceItem, 'id'>): ExperienceItem {
    const data = this.load();
    const newExp: ExperienceItem = {
      ...exp,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    data.experience.push(newExp);
    this.save(data);
    return newExp;
  }

  public static updateExperience(id: string, updates: Partial<ExperienceItem>): ExperienceItem | null {
    const data = this.load();
    const index = data.experience.findIndex(e => e.id === id);
    if (index === -1) return null;
    data.experience[index] = { ...data.experience[index], ...updates };
    this.save(data);
    return data.experience[index];
  }

  public static deleteExperience(id: string): boolean {
    const data = this.load();
    const initLen = data.experience.length;
    data.experience = data.experience.filter(e => e.id !== id);
    if (data.experience.length === initLen) return false;
    this.save(data);
    return true;
  }

  // Contact Messages
  public static getMessages(): ContactMessage[] {
    return this.load().messages || [];
  }

  public static addMessage(msg: { name: string; email: string; message: string }): ContactMessage {
    const data = this.load();
    if (!data.messages) data.messages = [];
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      createdAt: new Date().toISOString(),
      read: false
    };
    data.messages.unshift(newMsg);
    this.save(data);
    return newMsg;
  }

  public static markMessageRead(id: string): boolean {
    const data = this.load();
    const msg = (data.messages || []).find(m => m.id === id);
    if (!msg) return false;
    msg.read = true;
    this.save(data);
    return true;
  }

  public static deleteMessage(id: string): boolean {
    const data = this.load();
    const initLen = (data.messages || []).length;
    data.messages = (data.messages || []).filter(m => m.id !== id);
    if (data.messages.length === initLen) return false;
    this.save(data);
    return true;
  }

  // Project Duplication & Reordering
  public static duplicateProject(id: string): Project | null {
    const data = this.load();
    const source = data.projects.find(p => p.id === id);
    if (!source) return null;
    const duplicated: Project = {
      ...source,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    data.projects.unshift(duplicated);
    this.save(data);
    return duplicated;
  }

  public static reorderProjects(ids: string[]): Project[] {
    const data = this.load();
    const projectMap = new Map(data.projects.map(p => [p.id, p]));
    const reordered: Project[] = [];
    ids.forEach((id, index) => {
      const p = projectMap.get(id);
      if (p) {
        reordered.push({ ...p, order: index + 1 });
        projectMap.delete(id);
      }
    });
    // Append any leftover
    projectMap.forEach(p => reordered.push(p));
    data.projects = reordered;
    this.save(data);
    return data.projects;
  }

  public static reorderSkills(ids: string[]): Skill[] {
    const data = this.load();
    const skillMap = new Map(data.skills.map(s => [s.id, s]));
    const reordered: Skill[] = [];
    ids.forEach((id, index) => {
      const s = skillMap.get(id);
      if (s) {
        reordered.push({ ...s, order: index + 1 });
        skillMap.delete(id);
      }
    });
    skillMap.forEach(s => reordered.push(s));
    data.skills = reordered;
    this.save(data);
    return data.skills;
  }

  public static reorderExperience(ids: string[]): ExperienceItem[] {
    const data = this.load();
    const expMap = new Map(data.experience.map(e => [e.id, e]));
    const reordered: ExperienceItem[] = [];
    ids.forEach((id, index) => {
      const e = expMap.get(id);
      if (e) {
        reordered.push({ ...e, order: index + 1 });
        expMap.delete(id);
      }
    });
    expMap.forEach(e => reordered.push(e));
    data.experience = reordered;
    this.save(data);
    return data.experience;
  }

  // ==========================================
  // SERVICES
  // ==========================================
  public static getServices(): ServiceItem[] {
    const data = this.load();
    return (data.services || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public static addService(service: Omit<ServiceItem, 'id'>): ServiceItem {
    const data = this.load();
    if (!data.services) data.services = [];
    const newService: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: service.order || data.services.length + 1,
      enabled: service.enabled !== false,
    };
    data.services.push(newService);
    this.save(data);
    return newService;
  }

  public static updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const data = this.load();
    if (!data.services) return null;
    const index = data.services.findIndex(s => s.id === id);
    if (index === -1) return null;
    data.services[index] = { ...data.services[index], ...updates };
    this.save(data);
    return data.services[index];
  }

  public static deleteService(id: string): boolean {
    const data = this.load();
    if (!data.services) return false;
    const initialLen = data.services.length;
    data.services = data.services.filter(s => s.id !== id);
    if (data.services.length === initialLen) return false;
    this.save(data);
    return true;
  }

  public static reorderServices(ids: string[]): ServiceItem[] {
    const data = this.load();
    if (!data.services) data.services = [];
    const map = new Map(data.services.map(s => [s.id, s]));
    const reordered: ServiceItem[] = [];
    ids.forEach((id, index) => {
      const s = map.get(id);
      if (s) {
        reordered.push({ ...s, order: index + 1 });
        map.delete(id);
      }
    });
    map.forEach(s => reordered.push(s));
    data.services = reordered;
    this.save(data);
    return data.services;
  }

  // ==========================================
  // CERTIFICATIONS
  // ==========================================
  public static getCertifications(): CertificationItem[] {
    const data = this.load();
    return (data.certifications || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public static addCertification(cert: Omit<CertificationItem, 'id'>): CertificationItem {
    const data = this.load();
    if (!data.certifications) data.certifications = [];
    const newCert: CertificationItem = {
      ...cert,
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: cert.order || data.certifications.length + 1,
      enabled: cert.enabled !== false,
    };
    data.certifications.push(newCert);
    this.save(data);
    return newCert;
  }

  public static updateCertification(id: string, updates: Partial<CertificationItem>): CertificationItem | null {
    const data = this.load();
    if (!data.certifications) return null;
    const index = data.certifications.findIndex(c => c.id === id);
    if (index === -1) return null;
    data.certifications[index] = { ...data.certifications[index], ...updates };
    this.save(data);
    return data.certifications[index];
  }

  public static deleteCertification(id: string): boolean {
    const data = this.load();
    if (!data.certifications) return false;
    const initialLen = data.certifications.length;
    data.certifications = data.certifications.filter(c => c.id !== id);
    if (data.certifications.length === initialLen) return false;
    this.save(data);
    return true;
  }

  public static reorderCertifications(ids: string[]): CertificationItem[] {
    const data = this.load();
    if (!data.certifications) data.certifications = [];
    const map = new Map(data.certifications.map(c => [c.id, c]));
    const reordered: CertificationItem[] = [];
    ids.forEach((id, index) => {
      const c = map.get(id);
      if (c) {
        reordered.push({ ...c, order: index + 1 });
        map.delete(id);
      }
    });
    map.forEach(c => reordered.push(c));
    data.certifications = reordered;
    this.save(data);
    return data.certifications;
  }

  // ==========================================
  // SOCIAL LINKS
  // ==========================================
  public static getSocialLinks(): SocialLinkItem[] {
    const data = this.load();
    return (data.socialLinks || []).sort((a, b) => a.order - b.order);
  }

  public static updateSocialLinks(links: SocialLinkItem[]): SocialLinkItem[] {
    const data = this.load();
    data.socialLinks = links;
    this.save(data);
    return data.socialLinks;
  }

  public static addSocialLink(link: Omit<SocialLinkItem, 'id'>): SocialLinkItem {
    const data = this.load();
    if (!data.socialLinks) data.socialLinks = [];
    const newLink: SocialLinkItem = {
      ...link,
      id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: link.order || data.socialLinks.length + 1,
    };
    data.socialLinks.push(newLink);
    this.save(data);
    return newLink;
  }

  public static deleteSocialLink(id: string): boolean {
    const data = this.load();
    if (!data.socialLinks) return false;
    const initialLen = data.socialLinks.length;
    data.socialLinks = data.socialLinks.filter(s => s.id !== id);
    if (data.socialLinks.length === initialLen) return false;
    this.save(data);
    return true;
  }

  // ==========================================
  // ==========================================
  // HERO CONFIG
  // ==========================================
  public static getHeroConfig(): HeroEditorConfig {
    const data = this.load();
    const heroDefaultImg = data.profile?.media?.heroCharacter || '/assets/hero-character.svg';
    const profileImg = data.heroConfig?.profileImage || heroDefaultImg;

    if (data.heroConfig) {
      return {
        ...data.heroConfig,
        profileImage: profileImg,
      };
    }

    return {
      heading: data.profile.mainHeadline || 'FREELANCER',
      subtitle: data.profile.subHeadline || 'AI/ML • WEB DESIGNER • CONTENT CREATOR',
      description: data.profile.tagline || 'Turning Ideas into Digital Reality',
      profileImage: profileImg,
      primaryBtnText: 'Explore Portfolio',
      primaryBtnUrl: '#work',
      secondaryBtnText: 'Initiate Collab',
      secondaryBtnUrl: '#contact',
      badgeText: data.profile.shortGreeting || "HI, I'M MANI",
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
    };
  }

  public static updateHeroConfig(updates: Partial<HeroEditorConfig>): HeroEditorConfig {
    const data = this.load();
    const current = this.getHeroConfig();
    data.heroConfig = {
      ...current,
      ...updates,
      visibility: {
        ...current.visibility,
        ...(updates.visibility || {}),
      },
    };
    // Sync into profile fields so existing components stay 100% in sync
    if (updates.heading) data.profile.mainHeadline = updates.heading;
    if (updates.subtitle) data.profile.subHeadline = updates.subtitle;
    if (updates.badgeText) data.profile.shortGreeting = updates.badgeText;
    if (updates.description) data.profile.tagline = updates.description;
    if (updates.profileImage) {
      if (!data.profile.media) data.profile.media = {} as any;
      data.profile.media.heroCharacter = updates.profileImage;
    }
    this.save(data);
    return this.getHeroConfig();
  }

  // ==========================================
  // ABOUT CONFIG
  // ==========================================
  public static getAboutConfig(): AboutEditorConfig {
    const data = this.load();
    const aboutDefaultImg = data.profile?.media?.aboutPhoto || '/assets/about-manikantha.svg';
    const profileImg = data.aboutConfig?.profileImage || aboutDefaultImg;

    if (data.aboutConfig) {
      return {
        ...data.aboutConfig,
        profileImage: profileImg,
      };
    }

    return {
      heading: 'Engineering Code & Visual Craft',
      subheading: 'BRIDGING INTELLIGENCE, SYSTEMS & MEDIA',
      profileImage: profileImg,
      shortIntro: 'Bridging Artificial Intelligence, Modern Web Systems & Cinematic Media',
      longDescription: data.profile.aboutBio || [],
      yearsExperience: '3+',
      projectsCompleted: '50+',
      certificationsCount: '12+',
      visibility: {
        showPhoto: true,
        showBadges: true,
        showStats: true,
        showCta: true,
      },
    };
  }

  public static updateAboutConfig(updates: Partial<AboutEditorConfig>): AboutEditorConfig {
    const data = this.load();
    const current = this.getAboutConfig();
    data.aboutConfig = {
      ...current,
      ...updates,
      visibility: {
        ...current.visibility,
        ...(updates.visibility || {}),
      },
    };
    if (updates.profileImage) {
      if (!data.profile.media) data.profile.media = {} as any;
      data.profile.media.aboutPhoto = updates.profileImage;
    }
    if (updates.longDescription) data.profile.aboutBio = updates.longDescription;
    this.save(data);
    return this.getAboutConfig();
  }

  // ==========================================
  // CONTACT CONFIG
  // ==========================================
  public static getContactConfig(): ContactEditorConfig {
    const data = this.load();
    if (data.contactConfig) return data.contactConfig;
    return {
      heading: 'Initiate a Conversation',
      subheading: 'HAVE A PROJECT OR AI PIPELINE IN MIND? REACH OUT ANYTIME.',
      email: data.profile.socials.email,
      phone: '+91 99999 99999',
      whatsapp: '+91 99999 99999',
      location: 'Hyderabad / Remote Worldwide',
      buttonText: 'Transmit Inquiries',
      methodsEnabled: {
        email: true,
        phone: true,
        whatsapp: true,
        location: true,
        form: true,
      },
    };
  }

  public static updateContactConfig(updates: Partial<ContactEditorConfig>): ContactEditorConfig {
    const data = this.load();
    const current = this.getContactConfig();
    data.contactConfig = {
      ...current,
      ...updates,
      methodsEnabled: {
        ...current.methodsEnabled,
        ...(updates.methodsEnabled || {}),
      },
    };
    if (updates.email) data.profile.socials.email = updates.email;
    this.save(data);
    return data.contactConfig;
  }

  // ==========================================
  // APPEARANCE
  // ==========================================
  public static getAppearance(): AppearanceConfig {
    const data = this.load();
    if (data.appearance) return data.appearance;
    return {
      accentColor: '#FF7A00',
      secondaryAccentColor: '#00E5FF',
      borderRadius: 'rounded-2xl',
      buttonStyle: 'glow',
      globalAnimations: true,
      sectionVisibility: {
        home: true,
        about: true,
        services: true,
        skills: true,
        projects: true,
        experience: true,
        certifications: true,
        contact: true,
      },
    };
  }

  public static updateAppearance(updates: Partial<AppearanceConfig>): AppearanceConfig {
    const data = this.load();
    const current = this.getAppearance();
    data.appearance = {
      ...current,
      ...updates,
      sectionVisibility: {
        ...current.sectionVisibility,
        ...(updates.sectionVisibility || {}),
      },
    };
    this.save(data);
    return data.appearance;
  }

  // ==========================================
  // HOME BACKGROUND CONFIG
  // ==========================================
  public static getHomeBackground(): HomeBackgroundConfig {
    const data = this.load();
    if (data.homeBackground) return data.homeBackground;
    return {
      enabled: true,
      autoMotion: {
        enabled: true,
        speed: 1.0,
        direction: 'normal',
        intensity: 1.0,
        horizontal: true,
        vertical: true,
        loopSpeed: 1.0,
      },
      cursorInteraction: {
        enabled: true,
        sensitivity: 1.0,
        movementStrength: 1.0,
        horizontalInfluence: 1.0,
        verticalInfluence: 1.0,
      },
      motion3D: {
        enabled: true,
        perspective: 1300,
        depth: 1.0,
        tiltIntensity: 1.0,
        parallaxStrength: 1.0,
        layerSeparation: 1.0,
      },
      visual: {
        opacity: 0.40,
        brightness: 1.0,
        blur: 0,
        glowIntensity: 1.0,
        overlayDarkness: 0.70,
        particleIntensity: 1.0,
        lightIntensity: 1.0,
      },
      colors: {
        primaryGlow: '#FF7A00',
        secondaryGlow: '#00E5FF',
        accentColor: '#FF7A00',
      },
      mobile: {
        enabled: true,
        reduceMotion: true,
        speed: 0.6,
        opacity: 0.35,
      },
      panels: [],
    };
  }

  public static updateHomeBackground(updates: Partial<HomeBackgroundConfig>): HomeBackgroundConfig {
    const data = this.load();
    const current = this.getHomeBackground();
    data.homeBackground = {
      ...current,
      ...updates,
      backgroundImage: updates.backgroundImage !== undefined ? updates.backgroundImage : current.backgroundImage,
      backgroundMediaId: updates.backgroundMediaId !== undefined ? updates.backgroundMediaId : current.backgroundMediaId,
      autoMotion: { ...current.autoMotion, ...(updates.autoMotion || {}) },
      cursorInteraction: { ...current.cursorInteraction, ...(updates.cursorInteraction || {}) },
      motion3D: { ...current.motion3D, ...(updates.motion3D || {}) },
      visual: { ...current.visual, ...(updates.visual || {}) },
      colors: { ...current.colors, ...(updates.colors || {}) },
      mobile: { ...current.mobile, ...(updates.mobile || {}) },
      panels: updates.panels !== undefined ? updates.panels : current.panels,
      backdropLayers: updates.backdropLayers !== undefined ? updates.backdropLayers : current.backdropLayers,
    };
    this.save(data);
    return data.homeBackground;
  }

  public static resetHomeBackground(): HomeBackgroundConfig {
    const data = this.load();
    data.homeBackground = {
      enabled: true,
      autoMotion: {
        enabled: true,
        speed: 1.0,
        direction: 'normal',
        intensity: 1.0,
        horizontal: true,
        vertical: true,
        loopSpeed: 1.0,
      },
      cursorInteraction: {
        enabled: true,
        sensitivity: 1.0,
        movementStrength: 1.0,
        horizontalInfluence: 1.0,
        verticalInfluence: 1.0,
      },
      motion3D: {
        enabled: true,
        perspective: 1300,
        depth: 1.0,
        tiltIntensity: 1.0,
        parallaxStrength: 1.0,
        layerSeparation: 1.0,
      },
      visual: {
        opacity: 0.40,
        brightness: 1.0,
        blur: 0,
        glowIntensity: 1.0,
        overlayDarkness: 0.70,
        particleIntensity: 1.0,
        lightIntensity: 1.0,
      },
      colors: {
        primaryGlow: '#FF7A00',
        secondaryGlow: '#00E5FF',
        accentColor: '#FF7A00',
      },
      mobile: {
        enabled: true,
        reduceMotion: true,
        speed: 0.6,
        opacity: 0.35,
      },
      panels: [
        {
          id: 'p1',
          row: 1,
          tag: 'MK FORGE',
          tagColor: 'orange',
          title: 'Autonomous Workflow Mesh',
          category: 'Automation & Cloud',
          tech: 'Python • Orchestration • FastQueue',
          iconName: 'Settings',
          previewType: 'nodes',
          stats: 'LATENCY: 12ms',
        },
        {
          id: 'p2',
          row: 1,
          tag: 'WEB LABS',
          tagColor: 'cyan',
          title: 'Kinetic Web3 Dashboard',
          category: 'Full-Stack Architecture',
          tech: 'React 19 • TypeScript • Tailwind',
          iconName: 'Code',
          previewType: 'code',
          stats: 'FPS: 120.0',
        },
        {
          id: 'p3',
          row: 1,
          tag: 'NEURAL AI',
          tagColor: 'orange',
          title: 'Tensor Vision Core',
          category: 'Deep Learning / Vision',
          tech: 'PyTorch • OpenCV • TensorRT',
          iconName: 'Brain',
          previewType: 'radar',
          stats: 'CONFIDENCE: 99.4%',
        },
        {
          id: 'p4',
          row: 1,
          tag: 'STUDIO',
          tagColor: 'purple',
          title: 'Cinematic 4K Motion Grading',
          category: 'Post-Production & Cuts',
          tech: 'DaVinci • AfterEffects • GLSL',
          iconName: 'Video',
          previewType: 'timeline',
          stats: 'RENDER: 4K 60fps',
        },
        {
          id: 'p5',
          row: 2,
          tag: 'SYSTEM',
          tagColor: 'cyan',
          title: 'MK Cluster Telemetry',
          category: 'Distributed Systems',
          tech: 'Docker • Edge Nodes • Microservices',
          iconName: 'Cpu',
          previewType: 'chart',
          stats: 'THROUGHPUT: 18.4 GB/s',
        },
        {
          id: 'p6',
          row: 2,
          tag: 'AGENTIC',
          tagColor: 'orange',
          title: 'Autonomous Agent Dispatcher',
          category: 'Generative AI Workflows',
          tech: 'Gemini 2.5 • Multi-Agent • RAG',
          iconName: 'Sparkles',
          previewType: 'grid',
          stats: 'AGENTS: 8 ACTIVE',
        },
        {
          id: 'p7',
          row: 2,
          tag: 'CREATIVE',
          tagColor: 'cyan',
          title: 'Holographic 3D Viewport',
          category: 'WebGL Interactive',
          tech: 'Three.js • Shader Code • GLTF',
          iconName: 'Layers',
          previewType: 'grid',
          stats: 'DRAWCALLS: 24',
        },
        {
          id: 'p8',
          row: 3,
          tag: 'DATABASE',
          tagColor: 'green',
          title: 'Real-Time Event Stream Broker',
          category: 'High-Concurrency Data',
          tech: 'Kafka • WebSockets • Redis',
          iconName: 'Database',
          previewType: 'chart',
          stats: 'EVENTS: 1.4M / sec',
        },
        {
          id: 'p9',
          row: 3,
          tag: 'MK FORGE',
          tagColor: 'orange',
          title: 'Cyber Security Perimeter',
          category: 'Zero-Trust Protocol',
          tech: 'JWT • AES-256 • Role RBAC',
          iconName: 'Zap',
          previewType: 'code',
          stats: 'ENCRYPTION: HARDENED',
        },
        {
          id: 'p10',
          row: 3,
          tag: 'VISION AI',
          tagColor: 'cyan',
          title: 'Multi-Object Tracking Vector',
          category: 'Computer Vision',
          tech: 'YOLOv8 • CUDA • Stream Engine',
          iconName: 'Eye',
          previewType: 'radar',
          stats: 'TRACKING: 98.7%',
        },
      ],
    };
    this.save(data);
    return data.homeBackground;
  }

  // ==========================================
  // MEDIA ASSETS MANAGEMENT
  // ==========================================
  public static getMediaAssets(): MediaAssetItem[] {
    const data = this.load();
    const storedAssets = data.mediaAssets || [];
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      return storedAssets;
    }

    const files = fs.readdirSync(uploadsDir);
    const existingFilenames = new Set(files);
    let changed = false;

    // Filter out records whose files were deleted from disk
    let activeAssets = storedAssets.filter(asset => existingFilenames.has(asset.filename));
    if (activeAssets.length !== storedAssets.length) {
      changed = true;
    }

    // For any file in uploadsDir that doesn't have an asset record yet, create one
    for (const filename of files) {
      const found = activeAssets.find(a => a.filename === filename);
      if (!found) {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        
        // Infer default usage based on current profile references
        let inferredUsage: MediaAssetItem['usage'] = 'general';
        const url = `/uploads/${filename}`;

        if (data.profile?.media?.heroCharacter === url) {
          inferredUsage = 'home-character';
        } else if (data.profile?.media?.aboutPhoto === url) {
          inferredUsage = 'about';
        } else if (
          data.homeBackground?.backgroundImage === url ||
          data.homeBackground?.panels?.some(p => p.imageUrl === url)
        ) {
          inferredUsage = 'home-background';
        }

        const friendlyName = filename.replace(/-\d+-\d+\.[^.]+$/, '').replace(/[-_]/g, ' ');

        activeAssets.push({
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          filename,
          url,
          name: friendlyName,
          originalName: filename,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          usage: inferredUsage,
        });
        changed = true;
      }
    }

    if (changed) {
      data.mediaAssets = activeAssets;
      this.save(data);
    }

    return activeAssets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static addMediaAsset(asset: Partial<MediaAssetItem> & { filename: string; url: string; size: number }): MediaAssetItem {
    const data = this.load();
    const assets = data.mediaAssets || [];
    const newAsset: MediaAssetItem = {
      id: asset.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      filename: asset.filename,
      url: asset.url,
      originalName: asset.originalName || asset.filename,
      name: asset.name || asset.filename.replace(/-\d+-\d+\.[^.]+$/, '').replace(/[-_]/g, ' '),
      size: asset.size,
      createdAt: asset.createdAt || new Date().toISOString(),
      usage: asset.usage || 'general',
      panelConfig: asset.panelConfig,
    };

    const existingIdx = assets.findIndex(a => a.filename === asset.filename);
    if (existingIdx >= 0) {
      assets[existingIdx] = { ...assets[existingIdx], ...newAsset };
    } else {
      assets.unshift(newAsset);
    }

    data.mediaAssets = assets;
    this.save(data);
    return newAsset;
  }

  public static updateMediaAsset(filename: string, updates: Partial<MediaAssetItem>): MediaAssetItem | null {
    const data = this.load();
    const assets = data.mediaAssets || [];
    const idx = assets.findIndex(a => a.filename === filename);
    if (idx === -1) return null;

    assets[idx] = {
      ...assets[idx],
      ...updates,
      usage: updates.usage !== undefined ? updates.usage : assets[idx].usage,
      panelConfig: updates.panelConfig !== undefined ? updates.panelConfig : assets[idx].panelConfig,
    };

    // If usage was set to home-character or about, synchronize profile and hero/about configs!
    if (updates.usage === 'home-character') {
      if (!data.profile.media) data.profile.media = {} as any;
      data.profile.media.heroCharacter = assets[idx].url;
      if (!data.heroConfig) data.heroConfig = this.getHeroConfig();
      data.heroConfig.profileImage = assets[idx].url;
    } else if (updates.usage === 'about') {
      if (!data.profile.media) data.profile.media = {} as any;
      data.profile.media.aboutPhoto = assets[idx].url;
      if (!data.aboutConfig) data.aboutConfig = this.getAboutConfig();
      data.aboutConfig.profileImage = assets[idx].url;
    }

    data.mediaAssets = assets;
    this.save(data);
    return assets[idx];
  }

  public static deleteMediaAsset(filename: string): boolean {
    const data = this.load();
    if (!data.mediaAssets) return false;
    const initialLen = data.mediaAssets.length;
    data.mediaAssets = data.mediaAssets.filter(a => a.filename !== filename);
    if (data.mediaAssets.length !== initialLen) {
      this.save(data);
      return true;
    }
    return false;
  }
}
