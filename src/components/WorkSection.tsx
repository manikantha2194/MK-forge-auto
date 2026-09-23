import React, { useState, useMemo } from 'react';
import { ExternalLink, Github, Sparkles, FolderGit2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProjectCategory, Project } from '../types';
import { MediaFallback } from './MediaFallback';

const CATEGORIES = ['All', 'Web', 'AI/ML', 'Automation', 'Video Editing', 'Content', 'Other'];

export const WorkSection: React.FC = () => {
  const { projects, isLoading } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [projects, selectedCategory]);

  return (
    <section id="work" className="relative z-10 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <FolderGit2 className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              FEATURED PORTFOLIO
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Selected <span className="text-[#FF7A00]">Works</span>
          </h2>
          <p className="mt-3 text-[#B8B8B8] max-w-xl text-base sm:text-lg font-light">
            Production web platforms, neural computer vision pipelines, and automated bots.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`filter-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FF7A00] text-black shadow-[0_0_20px_rgba(255,122,0,0.45)] scale-105'
                    : 'bg-[#0D0D0D] text-[#B8B8B8] border border-[rgba(255,122,0,0.2)] hover:text-white hover:border-[#FF7A00]/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl bg-[#0D0D0D] border border-white/[0.05] animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-[#0D0D0D]/60 rounded-2xl border border-[rgba(255,122,0,0.2)]">
            <p className="text-[#B8B8B8] text-base">
              No projects found in category <span className="text-[#FF7A00]">"{selectedCategory}"</span>.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#FF7A00] hover:underline"
            >
              View all projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project: Project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className="group relative rounded-2xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.2)] hover:border-[#FF7A00] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(255,122,0,0.25)]"
              >
                <div>
                  {/* Project Image Box with MediaFallback */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#070707] border-b border-white/[0.06]">
                    <MediaFallback
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      fallbackText={project.title}
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#050505]/85 border border-[#FF7A00]/40 text-[#FF8A00] text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md">
                      {project.category}
                    </div>

                    {project.featured && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FF7A00] text-black text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-white group-hover:text-[#FF8A00] transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="mt-2.5 text-sm text-[#B8B8B8] leading-relaxed font-light line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] font-mono text-[#B8B8B8] border border-white/[0.08]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-white/[0.04] mt-4">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#FF7A00] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[#FF7A00]" />
                      <span>Live Preview</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#555555]">Internal Build</span>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-[#B8B8B8] hover:text-white transition-colors"
                      aria-label="View Source Code on GitHub"
                    >
                      <Github className="w-4 h-4" />
                      <span>Source</span>
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
