import React from 'react';
import {
  Code2,
  FileCode,
  Cpu,
  Database,
  Globe,
  Palette,
  Layers,
  BrainCircuit,
  Video,
  PenTool,
  Cog,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Skill } from '../types';

const getSkillIcon = (name: string, iconName?: string) => {
  const check = (iconName || name).toLowerCase();
  if (check.includes('python') || check.includes('filecode')) return <FileCode className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('c++') || check.includes('cpu')) return <Cpu className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('sql') || check.includes('database')) return <Database className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('html') || check.includes('globe')) return <Globe className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('css') || check.includes('palette')) return <Palette className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('ai') || check.includes('brain')) return <BrainCircuit className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('video') || check.includes('editing')) return <Video className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('content') || check.includes('pentool')) return <PenTool className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('auto') || check.includes('cog')) return <Cog className="w-5 h-5 text-[#FF7A00]" />;
  if (check.includes('web') || check.includes('layers')) return <Layers className="w-5 h-5 text-[#FF7A00]" />;
  return <Code2 className="w-5 h-5 text-[#FF7A00]" />;
};

export const SkillsSection: React.FC = () => {
  const { skills } = usePortfolio();

  // Group skills by category
  const categories: { [key: string]: Skill[] } = {
    'Core Programming': [],
    'Web & Frameworks': [],
    'AI / ML & Data': [],
    'Creative & Automation': [],
  };

  skills.forEach((skill) => {
    if (categories[skill.category]) {
      categories[skill.category].push(skill);
    } else {
      if (!categories['Core Programming']) categories['Core Programming'] = [];
      categories['Core Programming'].push(skill);
    }
  });

  return (
    <section id="skills" className="relative z-10 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <Terminal className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              TECHNICAL MATRIX
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Skills &amp; <span className="text-[#FF7A00]">Proficiencies</span>
          </h2>
          <p className="mt-3 text-[#B8B8B8] max-w-xl text-base sm:text-lg font-light">
            Core toolkits and production technologies used to build resilient digital systems.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(categories).map(([categoryName, catSkills]) => (
            <div
              key={categoryName}
              className="p-6 rounded-2xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.2)] flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-white/[0.08] flex items-center justify-between">
                  <span>{categoryName}</span>
                  <span className="font-mono text-xs text-[#FF7A00] font-normal">
                    {catSkills.length}
                  </span>
                </h3>

                <div className="mt-4 space-y-2.5">
                  {catSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#FF7A00]/50 hover:bg-[#FF7A00]/[0.06] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#050505] border border-white/[0.06] group-hover:scale-110 transition-transform">
                          {getSkillIcon(skill.name, skill.iconName)}
                        </div>
                        <span className="text-sm font-medium text-white group-hover:text-[#FF8A00] transition-colors">
                          {skill.name}
                        </span>
                      </div>
                      {skill.level && (
                        <span className="text-[10px] font-mono text-[#777777] uppercase group-hover:text-white transition-colors">
                          {skill.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.04] text-[11px] font-mono text-[#777777] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FF7A00]" />
                <span>Production Verified</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
