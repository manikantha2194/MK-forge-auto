export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type ProjectCategory = 'Web' | 'AI/ML' | 'Automation' | 'Content' | 'Video Editing' | 'Other';

export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  technologies: string[];
  category: ProjectCategory;
  imageUrl: string;
  images?: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  enabled?: boolean;
  order?: number;
  createdAt: string;
}

export type PlatformType = 'YouTube' | 'Instagram' | 'LinkedIn' | 'GitHub' | 'Twitter' | 'Other';

export interface ContentItem {
  id: string;
  title: string;
  caption: string;
  platform: PlatformType;
  url: string;
  imageUrl: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Core Programming' | 'Web & Frameworks' | 'AI / ML & Data' | 'Creative & Automation';
  level?: string;
  percentage?: number;
  iconName?: string;
  enabled?: boolean;
  order?: number;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  duration: string;
  description: string;
  location?: string;
  technologies?: string[];
  imageUrl?: string;
  certificateUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  order: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  organization: string;
  date: string;
  certificateId?: string;
  certificateUrl?: string;
  imageUrl?: string;
  enabled: boolean;
  order: number;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  highlight?: string;
  iconName: string;
}

export interface ProfileMedia {
  heroCharacter: string;
  aboutPhoto: string;
  brandIcon: string;
  brandBanner: string;
}

export interface ProfileSocials {
  github: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  twitter?: string;
  whatsappUrl: string;
  email: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface HeroEditorConfig {
  heading: string;
  subtitle: string;
  description: string;
  profileImage: string;
  primaryBtnText: string;
  primaryBtnUrl: string;
  secondaryBtnText: string;
  secondaryBtnUrl: string;
  badgeText: string;
  visibility: {
    showHero: boolean;
    showBadge: boolean;
    showGreeting: boolean;
    showHeadline: boolean;
    showDescription: boolean;
    showButtons: boolean;
    showCharacter: boolean;
    showTechBadges: boolean;
  };
}

export interface AboutEditorConfig {
  heading: string;
  subheading: string;
  profileImage: string;
  shortIntro: string;
  longDescription: string[];
  yearsExperience: string;
  projectsCompleted: string;
  certificationsCount: string;
  visibility: {
    showPhoto: boolean;
    showBadges: boolean;
    showStats: boolean;
    showCta: boolean;
  };
}

export interface ContactEditorConfig {
  heading: string;
  subheading: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  buttonText: string;
  methodsEnabled: {
    email: boolean;
    phone: boolean;
    whatsapp: boolean;
    location: boolean;
    form: boolean;
  };
}

export interface SectionVisibilityConfig {
  home: boolean;
  about: boolean;
  services: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  certifications: boolean;
  contact: boolean;
}

export interface AppearanceConfig {
  accentColor: string;
  secondaryAccentColor: string;
  borderRadius: string;
  buttonStyle: string;
  globalAnimations: boolean;
  sectionVisibility: SectionVisibilityConfig;
}

export type MediaUsage =
  | 'general'
  | 'home-background'
  | 'home-character'
  | 'project'
  | 'about'
  | 'service'
  | 'other';

export interface BackgroundPanelItem {
  id: string;
  row: 1 | 2 | 3;
  tag: string;
  tagColor: 'orange' | 'cyan' | 'purple' | 'green';
  title: string;
  category: string;
  tech: string;
  iconName: string;
  previewType: 'code' | 'nodes' | 'chart' | 'radar' | 'timeline' | 'grid';
  stats?: string;
  imageUrl?: string;
  mediaAssetId?: string;
  enabled?: boolean;
  order?: number;
  speedMultiplier?: number;
  opacity?: number;
  size?: 'small' | 'medium' | 'large' | 'banner';
  parallax?: boolean;
  blur?: number;
  glow?: boolean;
}

export interface MediaAssetItem {
  id: string;
  filename: string;
  url: string;
  dataUrl?: string;
  mimeType?: string;
  originalName?: string;
  name?: string;
  size: number;
  createdAt: string;
  usage: MediaUsage;
  panelConfig?: {
    enabled?: boolean;
    row?: 1 | 2 | 3;
    order?: number;
    speed?: number;
    opacity?: number;
    size?: 'small' | 'medium' | 'large' | 'banner';
    depth?: number;
    title?: string;
    tag?: string;
  };
}

export interface BackgroundLayerItem {
  id: string;
  mediaAssetId?: string;
  imageUrl: string;
  name?: string;
  order: number;
  opacity: number;
  blendMode?: 'normal' | 'screen' | 'overlay' | 'multiply' | 'color-dodge' | 'soft-light' | 'luminosity';
  blur?: number;
  parallaxSpeed?: number;
  animation?: 'none' | 'drift' | 'float' | 'zoom' | 'pulse';
  enabled: boolean;
  scale?: number;
}

export interface HomeBackgroundConfig {
  enabled: boolean;
  backgroundImage?: string;
  backgroundMediaId?: string;
  backdropLayers?: BackgroundLayerItem[];
  autoMotion: {
    enabled: boolean;
    speed: number;
    direction: 'normal' | 'reverse';
    intensity: number;
    horizontal: boolean;
    vertical: boolean;
    loopSpeed: number;
  };
  cursorInteraction: {
    enabled: boolean;
    sensitivity: number;
    movementStrength: number;
    horizontalInfluence: number;
    verticalInfluence: number;
  };
  motion3D: {
    enabled: boolean;
    perspective: number;
    depth: number;
    tiltIntensity: number;
    parallaxStrength: number;
    layerSeparation: number;
  };
  visual: {
    opacity: number;
    brightness: number;
    blur: number;
    glowIntensity: number;
    overlayDarkness: number;
    particleIntensity: number;
    lightIntensity: number;
  };
  colors: {
    primaryGlow: string;
    secondaryGlow: string;
    accentColor: string;
  };
  mobile: {
    enabled: boolean;
    reduceMotion: boolean;
    speed: number;
    opacity: number;
  };
  panels: BackgroundPanelItem[];
}

export interface ProfileConfig {
  name: string;
  brandName: string;
  shortGreeting: string;
  mainHeadline: string;
  subHeadline: string;
  tagline: string;
  badges: string[];
  aboutBio: string[];
  socials: ProfileSocials;
  media: ProfileMedia;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  tags: string[];
  link?: string;
  imageUrl?: string;
  enabled?: boolean;
  order?: number;
}
