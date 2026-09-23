import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Brain,
  Code,
  Palette,
  Video,
  PenTool,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ServiceItem } from '../../types';

const AVAILABLE_ICONS = [
  { name: 'Brain', icon: Brain },
  { name: 'Code', icon: Code },
  { name: 'Palette', icon: Palette },
  { name: 'Video', icon: Video },
  { name: 'PenTool', icon: PenTool },
  { name: 'Cpu', icon: Cpu },
  { name: 'Layers', icon: Layers },
];

export const ServicesManager: React.FC = () => {
  const { services, addService, updateService, deleteService, reorderServices } = usePortfolio();

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingService({
      id: `service-${Date.now()}`,
      title: '',
      category: 'GENERAL SERVICES',
      description: '',
      iconName: 'Code',
      tags: [],
      order: services.length + 1,
      enabled: true,
    });
    setTagInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!editingService.title.trim() || !editingService.description.trim()) {
      setFeedback('Please provide both a Title and Description.');
      return;
    }

    if (isAdding) {
      await addService(editingService);
      setFeedback('Service created successfully.');
    } else {
      await updateService(editingService.id, editingService);
      setFeedback('Service updated successfully.');
    }

    setEditingService(null);
    setIsAdding(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await deleteService(id);
      setFeedback('Service removed.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const [moved] = newServices.splice(index, 1);
    newServices.splice(targetIndex, 0, moved);

    await reorderServices(newServices.map(s => s.id));
  };

  const addTag = () => {
    if (!tagInput.trim() || !editingService) return;
    if (!editingService.tags.includes(tagInput.trim())) {
      setEditingService({
        ...editingService,
        tags: [...editingService.tags, tagInput.trim()],
      });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!editingService) return;
    setEditingService({
      ...editingService,
      tags: editingService.tags.filter(t => t !== tagToRemove),
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00]">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Services &amp; Offerings Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage, categorize, reorder, and toggle public services offered to clients.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] transition-colors shadow-[0_0_15px_rgba(255,122,0,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {feedback}
        </div>
      )}

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service, idx) => {
          const matchedIcon = AVAILABLE_ICONS.find(i => i.name === service.iconName);
          const IconComp = matchedIcon ? matchedIcon.icon : Cpu;

          return (
            <div
              key={service.id}
              className={`p-4 sm:p-5 rounded-xl bg-[#0D0D0D] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                service.enabled ? 'border-white/[0.08]' : 'border-white/[0.04] opacity-60'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] shrink-0 mt-0.5 sm:mt-0">
                  <IconComp className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
                      {service.category}
                    </span>
                    {!service.enabled && (
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400 uppercase">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white font-display">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-2xl line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {service.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Reorder */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === services.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingService(service);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer"
                  title="Edit Service"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(service.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.1] space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white font-display">
              {isAdding ? 'Add New Service' : 'Edit Service'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="text-xs font-semibold text-white">Public Visibility</div>
                  <div className="text-[11px] text-zinc-400">Display this service on the website</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingService.enabled}
                  onChange={e => setEditingService({ ...editingService, enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Service Title</label>
                  <input
                    type="text"
                    value={editingService.title}
                    onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                    placeholder="e.g. AI / ML Solutions"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Category Tag</label>
                  <input
                    type="text"
                    value={editingService.category}
                    onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                    placeholder="e.g. INTELLIGENCE & VISION"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Service Icon</label>
                <div className="grid grid-cols-7 gap-2 mt-1.5">
                  {AVAILABLE_ICONS.map(i => {
                    const IconComp = i.icon;
                    const isSelected = editingService.iconName === i.name;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setEditingService({ ...editingService, iconName: i.name })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FF7A00] bg-[#FF7A00]/20 text-[#FF7A00]'
                            : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[9px] font-mono">{i.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Describe your capabilities, deliverables, and architecture..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white leading-relaxed"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-zinc-300">Technology &amp; Skill Tags</label>
                <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                  {editingService.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-zinc-200"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type tag and press Enter..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">External Project Link / Case Study (Optional)</label>
                <input
                  type="text"
                  value={editingService.link || ''}
                  onChange={e => setEditingService({ ...editingService, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF7A00] hover:bg-[#FF8A00] cursor-pointer"
                >
                  {isAdding ? 'Create Service' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
