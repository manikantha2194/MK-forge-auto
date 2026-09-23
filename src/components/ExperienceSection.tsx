import React from 'react';
import { Briefcase, Calendar, ExternalLink, Award, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ExperienceItem } from '../types';

export const ExperienceSection: React.FC = () => {
  const { experience } = usePortfolio();

  return (
    <section id="experience" className="relative z-10 py-20 lg:py-28 bg-[#070707]/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <Briefcase className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              JOURNEY &amp; TRACK RECORD
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Experience &amp; <span className="text-[#FF7A00]">Timeline</span>
          </h2>
          <p className="mt-3 text-[#B8B8B8] max-w-xl text-base sm:text-lg font-light">
            Milestones across freelance engineering, technical community building, and digital media.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-[rgba(255,122,0,0.25)] ml-4 sm:ml-8 space-y-12 pb-4">
          {experience.map((item: ExperienceItem, idx: number) => (
            <div key={item.id} className="relative pl-8 sm:pl-10 group">
              
              {/* Glowing Timeline Node */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#050505] border-2 border-[#FF7A00] group-hover:scale-125 group-hover:bg-[#FF7A00] transition-all duration-300 shadow-[0_0_12px_rgba(255,122,0,0.6)]" />

              {/* Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.2)] group-hover:border-[#FF7A00]/70 transition-all duration-300 group-hover:-translate-y-1 shadow-lg group-hover:shadow-[0_12px_30px_-8px_rgba(255,122,0,0.2)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white group-hover:text-[#FF8A00] transition-colors">
                      {item.role}
                    </h3>
                    <div className="text-sm font-semibold text-[#FF8A00] mt-0.5">
                      {item.organization}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#B8B8B8] w-fit">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>{item.duration}</span>
                  </div>
                </div>

                <p className="text-sm text-[#B8B8B8] leading-relaxed font-light">
                  {item.description}
                </p>

                {(item.linkUrl || item.certificateUrl) && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-4">
                    {item.linkUrl && (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7A00] hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit Resource</span>
                      </a>
                    )}
                    {item.certificateUrl && (
                      <a
                        href={item.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8B8B8] hover:text-white transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-[#FF7A00]" />
                        <span>View Credential</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
