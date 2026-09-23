import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Github,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Star,
  Eye,
  X,
  Filter,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Copy,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { Project, ProjectCategory } from '../../types';
import { MediaFallback } from '../MediaFallback';
import { ConfirmDialog } from './ConfirmDialog';

const CATEGORIES: ('All' | ProjectCategory)[] = [
  'All',
  'Web',
  'AI/ML',
  'Automation',
  'Video Editing',
  'Content',
  'Other',
];

export const ProjectsManager: React.FC = () => {
  const { projects, refreshProjects } = usePortfolio();
  const { token, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    category: ProjectCategory;
    technologies: string;
    imageUrl: string;
    githubUrl: string;
    liveUrl: string;
    featured: boolean;
  }>({
    title: '',
    description: '',
    category: 'Web',
    technologies: 'React, TypeScript, Tailwind',
    imageUrl: '/assets/project-web.svg',
    githubUrl: '',
    liveUrl: '',
    featured: false,
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesFeatured = !filterFeaturedOnly || Boolean(p.featured);
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.technologies.some((t) => t.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query);

      return matchesCategory && matchesFeatured && matchesQuery;
    });
  }, [projects, selectedCategory, filterFeaturedOnly, searchQuery]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      category: 'Web',
      technologies: 'React, TypeScript, Tailwind CSS',
      imageUrl: '/assets/project-web.svg',
      githubUrl: '',
      liveUrl: '',
      featured: false,
    });
    setIsEditing(true);
    setMessage(null);
  };

  const openEditModal = (proj: Project) => {
    setEditingId(proj.id);
    setForm({
      title: proj.title,
      description: proj.description,
      category: proj.category,
      technologies: proj.technologies.join(', '),
      imageUrl: proj.imageUrl,
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      featured: Boolean(proj.featured),
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleImageUpload = async (file: File) => {
    if (!isAdmin || !token) {
      setMessage({ type: 'error', text: 'Admin authentication required to upload files.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Selected file must be a valid image (PNG, JPG, WebP, SVG).' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file size exceeds the 10MB limit.' });
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setForm((prev) => ({ ...prev, imageUrl: data.fileUrl }));
        setMessage({ type: 'success', text: 'Cover image uploaded and linked successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload image.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error uploading cover image.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !token) {
      setMessage({ type: 'error', text: 'Admin authorization required.' });
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      setMessage({ type: 'error', text: 'Title and description cannot be empty.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      technologies: form.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl.trim() || '/assets/project-web.svg',
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      featured: form.featured,
    };

    try {
      const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await refreshProjects();
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: editingId ? `Updated project "${form.title}".` : `Created project "${form.title}".`,
        });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Server rejected project update.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to communicate with project database.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    if (!isAdmin || !token) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !project.featured }),
      });
      if (res.ok) {
        await refreshProjects();
        setMessage({
          type: 'success',
          text: `Project "${project.title}" ${!project.featured ? 'is now featured' : 'unfeatured'}.`,
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to toggle featured status.' });
    }
  };

  const handleDuplicate = async (proj: Project) => {
    if (!isAdmin || !token) return;
    setLoading(true);
    try {
      const duplicatedData = {
        title: `${proj.title} (Copy)`,
        description: proj.description,
        category: proj.category,
        technologies: proj.technologies,
        imageUrl: proj.imageUrl,
        githubUrl: proj.githubUrl || '',
        liveUrl: proj.liveUrl || '',
        featured: false,
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(duplicatedData),
      });

      if (res.ok) {
        await refreshProjects();
        setMessage({ type: 'success', text: `Duplicated "${proj.title}" successfully.` });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to duplicate project.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error duplicating project.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirmProject || !isAdmin || !token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${deleteConfirmProject.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshProjects();
        setMessage({
          type: 'success',
          text: `Deleted project "${deleteConfirmProject.title}".`,
        });
        setDeleteConfirmProject(null);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete project.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error deleting project.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl font-bold text-white">
              Projects Portfolio Management
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold">
              {projects.length} Total
            </span>
          </div>
          <p className="text-sm text-[#777777] mt-1">
            Manage public portfolio works, upload custom cover graphics, toggle featured highlights, and test live demo URLs.
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="btn-add-new-project"
          className="orange-glow-btn flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-[#25D366]/15 border border-[#25D366]/50 text-white'
              : 'bg-red-500/15 border border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#25D366] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs text-[#888888] hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#050505] border border-white/[0.08] text-white text-xs font-mono focus:border-[#FF7A00] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Featured Toggle Filter */}
          <button
            onClick={() => setFilterFeaturedOnly(!filterFeaturedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              filterFeaturedOnly
                ? 'bg-[#FF7A00] text-black shadow-[0_0_12px_rgba(255,122,0,0.3)]'
                : 'bg-white/[0.04] border border-white/[0.08] text-[#B8B8B8] hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFeaturedOnly ? 'fill-black' : ''}`} />
            <span>Featured Only</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
          <span className="text-[11px] font-mono text-[#555555] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? projects.length
                : projects.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF7A00]/20 border border-[#FF7A00] text-[#FF7A00] font-bold'
                    : 'bg-white/[0.02] border border-white/[0.05] text-[#888888] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {cat} <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.06] text-center space-y-3">
          <Layers className="w-10 h-10 text-[#555555] mx-auto" />
          <h4 className="font-display text-lg font-bold text-white">No projects found</h4>
          <p className="text-xs text-[#777777] max-w-sm mx-auto">
            No projects matched your active search or category filters. Try clearing filters or create a new project.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setFilterFeaturedOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white hover:border-[#FF7A00]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-[rgba(255,122,0,0.3)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image and badges */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#050505] mb-4 border border-white/[0.06]">
                  <MediaFallback
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackText={proj.title}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-[#FF7A00] font-bold uppercase border border-[#FF7A00]/30">
                      {proj.category}
                    </span>
                  </div>

                  {/* Top Right: Featured Button Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(proj)}
                    className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-md transition-all cursor-pointer ${
                      proj.featured
                        ? 'bg-[#FF7A00] text-black shadow-md'
                        : 'bg-black/60 text-[#777777] hover:text-[#FF7A00]'
                    }`}
                    title={proj.featured ? 'Featured on Home (Click to remove)' : 'Click to Feature on Home'}
                  >
                    <Star className={`w-3.5 h-3.5 ${proj.featured ? 'fill-black' : ''}`} />
                  </button>
                </div>

                {/* Title & Description */}
                <h4 className="font-display text-lg font-bold text-white line-clamp-1 group-hover:text-[#FF7A00] transition-colors">
                  {proj.title}
                </h4>
                <p className="text-xs text-[#888888] mt-1.5 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {proj.technologies.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#B8B8B8] border border-white/[0.04]"
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.technologies.length > 4 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.02] text-[#666666]">
                      +{proj.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-[#FF7A00]/20 text-[#888888] hover:text-[#FF7A00] transition-colors"
                      title="Open Live Preview"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.1] text-[#888888] hover:text-white transition-colors"
                      title="Open GitHub Repository"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewProject(proj)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.1] text-[#888888] hover:text-white transition-colors"
                    title="Quick Details View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicate(proj)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#00E5FF]/20 text-[#888888] hover:text-[#00E5FF] transition-colors cursor-pointer"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditModal(proj)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#FF7A00]/20 text-[#B8B8B8] hover:text-[#FF7A00] text-xs font-mono transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmProject(proj)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-[#888888] hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Details Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono uppercase font-bold">
                  {previewProject.category}
                </span>
                {previewProject.featured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> Featured
                  </span>
                )}
              </div>
              <button
                onClick={() => setPreviewProject(null)}
                className="p-1.5 rounded-lg text-[#777777] hover:text-white bg-white/[0.03]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/[0.08] mb-4">
              <MediaFallback
                src={previewProject.imageUrl}
                alt={previewProject.title}
                className="w-full h-full object-cover"
                fallbackText={previewProject.title}
              />
            </div>

            <h3 className="font-display text-xl font-bold text-white">{previewProject.title}</h3>
            <p className="text-sm text-[#AAAAAA] mt-2 leading-relaxed whitespace-pre-wrap">
              {previewProject.description}
            </p>

            <div className="mt-4">
              <span className="text-xs font-mono uppercase text-[#777777] block mb-2 font-semibold">
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-2">
                {previewProject.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#FF7A00]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                {previewProject.liveUrl && (
                  <a
                    href={previewProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="orange-glow-btn flex items-center gap-2 px-4 py-2 rounded-xl text-black font-bold text-xs uppercase"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Demo</span>
                  </a>
                )}
                {previewProject.githubUrl && (
                  <a
                    href={previewProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white font-bold text-xs hover:border-[#FF7A00]"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => {
                  const proj = previewProject;
                  setPreviewProject(null);
                  openEditModal(proj);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-[#B8B8B8] hover:text-[#FF7A00] font-mono"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Component */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmProject)}
        onClose={() => setDeleteConfirmProject(null)}
        onConfirm={confirmDeleteProject}
        title="Delete Portfolio Project"
        itemTitle={deleteConfirmProject?.title}
        itemCategory={deleteConfirmProject?.category}
        description="Are you sure you want to permanently delete this project? It will be immediately removed from the portfolio database and live showcase."
        confirmText="Delete Project"
        cancelText="Cancel"
        isLoading={loading}
        variant="danger"
      />

      {/* Edit / Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center text-[#FF7A00]">
                  {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h4 className="font-display text-xl font-bold text-white">
                  {editingId ? 'Edit Project Details' : 'Create New Portfolio Project'}
                </h4>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#777777] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Autonomous AI Vision Pipeline"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm focus:border-[#FF7A00] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm focus:border-[#FF7A00] outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c} className="bg-[#0D0D0D] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                    Showcase Status
                  </label>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#050505] border border-white/[0.1] cursor-pointer hover:border-white/[0.2]">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700 text-[#FF7A00] focus:ring-[#FF7A00]"
                    />
                    <span className="text-xs text-white font-medium">
                      Feature on Home Showcase
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide a compelling overview of the project, architecture, and impact..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm focus:border-[#FF7A00] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Technologies (Comma Separated)
                </label>
                <input
                  type="text"
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  placeholder="Python, PyTorch, React, OpenCV, Docker"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm focus:border-[#FF7A00] outline-none"
                />
                {/* Tech chips preview */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.technologies
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#FF7A00] border border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                </div>
              </div>

              {/* Cover Image with Drag & Drop */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                  Project Cover Graphic / Image
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all mb-2 ${
                    isDragOver
                      ? 'border-[#FF7A00] bg-[#FF7A00]/10'
                      : 'border-white/[0.1] bg-[#050505]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-black border border-white/[0.1] shrink-0">
                      <MediaFallback
                        src={form.imageUrl}
                        alt="Project preview"
                        className="w-full h-full object-cover"
                        fallbackText="Cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="text-xs font-medium text-white">
                        {uploadingImage ? (
                          <span className="flex items-center gap-2 text-[#FF7A00]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image to server...
                          </span>
                        ) : (
                          'Drag and drop an image here, or browse from computer'
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#666666]">
                        Supports PNG, JPG, WebP, SVG (Max 10MB)
                      </p>
                    </div>

                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:border-[#FF7A00] text-xs text-white font-medium cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Direct URL input */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#666666]">Or URL:</span>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="/assets/project-web.svg or https://..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#050505] border border-white/[0.08] text-white text-xs font-mono focus:border-[#FF7A00] outline-none"
                  />
                </div>
              </div>

              {/* URLs: Live Demo & GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    value={form.liveUrl}
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-xs font-mono focus:border-[#FF7A00] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1">
                    GitHub Repo Link
                  </label>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/manikantha/..."
                    className="w-full px-4 py-2 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-xs font-mono focus:border-[#FF7A00] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-xs font-semibold text-[#B8B8B8] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="orange-glow-btn px-6 py-2.5 rounded-xl text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving Project...' : editingId ? 'Update Project' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
