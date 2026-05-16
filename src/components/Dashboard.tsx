/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Video, Clock, LayoutGrid, List as ListIcon, Search, Wand2, RefreshCw } from 'lucide-react';
import { getUserProjects, seedSampleProject } from '../services/projects';
import { VideoProject } from '../types';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const fetchProjects = async () => {
    try {
      const data = await getUserProjects();
      setProjects(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedSampleProject();
      await fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">My Projects</h1>
          <p className="text-[10px] tracking-[0.3em] font-bold opacity-40 mt-1 uppercase">Manage your video edits</p>
        </div>
        
        <Link 
          to="/new" 
          className="btn-primary flex items-center justify-center gap-2 self-start md:self-auto px-10"
        >
          <Plus size={14} strokeWidth={3} />
          <span>New Project</span>
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-12 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input 
            type="text" 
            placeholder="Search projects..."
            className="w-full bg-transparent p-2 pl-10 text-[10px] font-bold tracking-widest outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-white/10 text-brand-cyan' : 'text-white/40 hover:text-white'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-white/10 text-brand-cyan' : 'text-white/40 hover:text-white'}`}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
            <Video size={24} />
          </div>
          <h2 className="text-[11px] tracking-[0.2em] font-bold mb-2">No projects yet</h2>
          <p className="text-[10px] text-white/40 mb-8 tracking-widest uppercase">Start your first AI video project or explore a sample.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/new" className="btn-primary flex items-center gap-2">
              <Plus size={14} />
              New Project
            </Link>
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSeeding ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Load Sample Project
            </button>
          </div>
        </div>
      ) : (
        <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
          {projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/edit/${project.id}`}
              className={`group transition-all ${view === 'grid' ? 'hardware-card overflow-hidden hover:border-brand-cyan/40 shadow-none' : 'bg-white/5 border border-white/10 p-4 flex items-center gap-4 hover:bg-white/10'}`}
            >
              <div className={`${view === 'grid' ? 'aspect-video w-full' : 'w-32 aspect-video'} bg-black relative overflow-hidden`}>
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5">
                    <Video size={40} />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[9px] font-bold uppercase tracking-widest text-[#e0e0e0]">
                  {project.aspectRatio}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm tracking-wider group-hover:text-brand-cyan transition-colors">{project.title}</h3>
                  <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'completed' ? 'bg-brand-cyan shadow-[0_0_8px_#22d3ee]' : 'bg-brand-fuchsia animate-pulse'}`} />
                </div>
                <div className="flex items-center gap-4 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Clock size={10} />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <span>{project.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
