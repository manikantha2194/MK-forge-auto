import React from 'react';
import { Brain, Code, Palette, Video, PenTool, Cpu, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Brain,
  Code,
  Palette,
  Video,
  PenTool,
  Cpu,
};

const SERVICES = [
  {
    id: 'ai-ml',
    title: 'AI / ML Solutions',
    category: 'INTELLIGENCE & VISION',
    description: 'Custom machine learning models, computer vision detection pipelines, predictive algorithms, and LLM-assisted workflow integrations.',
    icon: Brain,
    tags: ['Python', 'PyTorch', 'OpenCV', 'FastAPI', 'Neural Vision'],
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    category: 'FULL-STACK ARCHITECTURE',
    description: 'High-performance, reactive full-stack web applications engineered with clean component architectures, robust APIs, and zero bloat.',
    icon: Code,
    tags: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Vite'],
  },
  {
    id: 'web-design',
    title: 'Web Design & UI/UX',
    category: 'AESTHETICS & MOTION',
    description: 'Futuristic, high-contrast digital interfaces paired with mathematical typographic scales, silky transitions, and responsive fluidity.',
    icon: Palette,
    tags: ['Figma', 'UI/UX', 'Design Systems', 'Motion', 'Dark Theme'],
  },
  {
    id: 'video-editing',
    title: 'Video Editing & Motion',
    category: 'CINEMATIC STORYTELLING',
    description: 'Commercial-tier video editing featuring kinetic typography, 3D title design, seamless pacing, dynamic audio synchronization, and color grading.',
    icon: Video,
    tags: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Sound Design'],
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    category: 'TECHNICAL MEDIA',
    description: 'Technical breakdowns, educational developer tutorials, and high-impact digital content engineered to explain complex concepts with clarity.',
    icon: PenTool,
    tags: ['YouTube', 'Dev Tutorials', 'Documentation', 'Tech Reels'],
  },
  {
    id: 'automation',
    title: 'Automation & Pipelines',
    category: 'PRODUCTIVITY BOT SUITES',
    description: 'Automated data collectors, webhook bridges, scheduled scrapers, and unattended background bots that save dozens of human hours each week.',
    icon: Cpu,
    tags: ['Python Bots', 'CRON Pipelines', 'Webhooks', 'Cloud Tasks'],
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const { services } = usePortfolio();

  const activeServices = services && services.length > 0
    ? services.map(s => ({
        id: s.id,
        title: s.title,
        category: s.category || 'SPECIALIZED OFFERING',
        description: s.description,
        icon: ICON_MAP[s.iconName] || Cpu,
        tags: s.tags || [],
      }))
    : SERVICES;

  return (
    <section id="services" className="relative z-10 py-20 lg:py-28 bg-[#070707]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <Cpu className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              EXPERTISE &amp; OFFERINGS
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Specialized <span className="text-[#FF7A00]">Services</span>
          </h2>
          <p className="mt-3 text-[#B8B8B8] max-w-xl text-base sm:text-lg font-light">
            Comprehensive digital capabilities tailored to bring ambitious concepts to life.
          </p>
        </div>

        {/* 6-Card Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {activeServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="group relative p-7 sm:p-8 rounded-2xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.2)] hover:border-[#FF7A00] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_-8px_rgba(255,122,0,0.3)] flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top-right ambient glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF7A00]/10 rounded-full blur-2xl group-hover:bg-[#FF7A00]/25 transition-all pointer-events-none" />

                <div>
                  {/* Top Bar: Icon + Index */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF8A00] group-hover:scale-110 group-hover:bg-[#FF7A00] group-hover:text-black transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#777777] group-hover:text-[#FF7A00] transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#FF8A00] uppercase font-bold">
                    {service.category}
                  </span>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1 group-hover:text-[#FF8A00] transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#B8B8B8] leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-white/[0.06]">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-white/[0.03] text-[11px] font-mono text-[#B8B8B8] border border-white/[0.06] group-hover:border-[#FF7A00]/30 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectService(service.title)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF8A00] group-hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Discuss Project</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
