/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  Upload, 
  Settings2, 
  Mic2, 
  Sparkles, 
  Play, 
  Pause, 
  Scissors, 
  Layers,
  ChevronLeft,
  CheckCircle2,
  FileVideo,
  FileText,
  Video,
  Volume2,
  Trash2,
  Monitor,
  Smartphone,
  Cpu,
  Tv,
  Zap,
  Type,
  Layout,
  MousePointer2,
  Sticker,
  Plus
} from 'lucide-react';
import { createProject, updateProject, createAsset, getProjectAssets } from '../services/projects';
import { analyzeEditingPrompt } from '../services/gemini';
import { AIEditInstruction, ProjectStatus, ProjectAsset } from '../types';

export function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [instructions, setInstructions] = useState<AIEditInstruction[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('Ready');
  const [projectId, setProjectId] = useState<string | null>(id || null);
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'ai' | 'audio' | 'visuals' | 'templates' | 'text' | 'elements'>('ai');
  const [leftNavTab, setLeftNavTab] = useState<'templates' | 'elements' | 'text' | 'upload' | 'tools'>('templates');
  const [volumes, setVolumes] = useState({
    master: 80,
    voiceover: 100,
    background: 60,
    effects: 70
  });

  useEffect(() => {
    if (projectId) {
      const fetchAssets = async () => {
        const data = await getProjectAssets(projectId);
        setAssets(data || []);
        const firstVideo = data?.find(a => a.type === 'video');
        if (firstVideo) setActiveVideoUrl(firstVideo.url);
      };
      fetchAssets();
    }
  }, [projectId]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let targetProjectId = projectId;
    
    if (!targetProjectId) {
      setCurrentStatus('Creating project...');
      const proj = await createProject({
        title: files[0].name.split('.')[0],
        originalPrompt: 'Media Upload',
        status: ProjectStatus.DRAFT
      });
      if (proj) {
        targetProjectId = proj.id;
        setProjectId(proj.id);
      }
    }

    if (!targetProjectId) return;

    setCurrentStatus('Uploading files...');
    for (const file of Array.from(files) as File[]) {
      const type = file.type.startsWith('video/') ? 'video' : 
                   file.type.startsWith('audio/') ? 'audio' : 'image';
      
      const mockUrl = URL.createObjectURL(file);
      
      const newAsset = await createAsset(targetProjectId, {
        name: file.name,
        type: type as any,
        url: mockUrl,
        role: type === 'video' ? 'source' : 'effect'
      });

      if (newAsset) {
        setAssets(prev => [newAsset, ...prev]);
        if (type === 'video' && !activeVideoUrl) setActiveVideoUrl(mockUrl);
      }
    }
    setCurrentStatus('Ready');
  };

  const handleAutomate = async () => {
    if (!prompt || !projectId) return;
    setIsProcessing(true);
    setCurrentStatus('Generating design...');
    
    try {
      const results = await analyzeEditingPrompt(prompt);
      setInstructions(results);

      setCurrentStatus('Mixing audio...');
      await new Promise(r => setTimeout(r, 1000));
      setCurrentStatus('Adding animation...');
      await new Promise(r => setTimeout(r, 1500));
      setCurrentStatus('Finishing up...');
      await new Promise(r => setTimeout(r, 800));

      await updateProject(projectId, { status: ProjectStatus.COMPLETED });
      setCurrentStatus('Ready');
    } catch (err) {
      console.error(err);
      setCurrentStatus('Error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="py-2 flex flex-col h-[calc(100vh-100px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 px-4 h-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft size={18} className="text-white/60" />
            </div>
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-sm font-black uppercase tracking-tighter text-white/90 mr-4">
               {projectId ? `Project: ${assets[0]?.name?.split('.')[0] || 'My Video'}` : 'New Project'}
             </h1>
             <div className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 cursor-pointer rounded-md border border-transparent hover:border-white/10 transition-all">
                <span className="text-[10px] font-bold text-white/60 uppercase">File</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 cursor-pointer rounded-md border border-transparent hover:border-white/10 transition-all">
                <span className="text-[10px] font-bold text-white/60 uppercase">Resize</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 rounded-md border border-brand-cyan/20">
                <span className="text-[10px] font-bold text-brand-cyan uppercase">Editing</span>
             </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-8 relative group">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to edit, trim, or style your video..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
          />
          <Wand2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
          <button 
            onClick={handleAutomate}
            disabled={!prompt || isProcessing}
            className="absolute right-1 top-1 bottom-1 px-4 bg-brand-cyan text-black text-[9px] font-black uppercase tracking-widest rounded-md hover:scale-105 transition-all disabled:opacity-0"
          >
            {isProcessing ? 'Thinking...' : 'Generate'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-[10px] font-bold text-white/60 hover:text-white uppercase transition-colors">Preview</button>
          <button className="bg-white text-black px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">Share</button>
        </div>
      </div>

      <div className="flex-1 flex gap-1 overflow-hidden p-1">
        {/* Far Left: Icon Rail */}
        <div className="w-[72px] flex flex-col bg-brand-bg rounded-xl border border-white/5 overflow-hidden">
          {[
            { id: 'templates', icon: Layout, label: 'Templates' },
            { id: 'elements', icon: Sticker, label: 'Elements' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'upload', icon: Upload, label: 'Uploads' },
            { id: 'tools', icon: Settings2, label: 'Tools' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLeftNavTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-4 px-2 gap-1 border-l-2 transition-all ${
                leftNavTab === item.id 
                  ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan' 
                  : 'border-transparent text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <div className="mt-auto p-4 flex flex-col items-center gap-6 text-white/20">
             <Cpu size={20} />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-1 h-full overflow-hidden">
          {/* Sub-Sidebar: Contextual Panel */}
          <div className="col-span-2 flex flex-col bg-brand-bg rounded-xl overflow-hidden border border-white/5">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{leftNavTab}</span>
              {leftNavTab === 'upload' && (
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-brand-cyan/20 rounded-lg text-brand-cyan border border-brand-cyan/20">
                  <Plus size={14} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {leftNavTab === 'upload' && (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <motion.div 
                      key={asset.id}
                      layoutId={asset.id}
                      onClick={() => asset.type === 'video' && setActiveVideoUrl(asset.url)}
                      className={`group relative p-2 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                        activeVideoUrl === asset.url ? 'bg-brand-cyan/10 border-brand-cyan/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center text-white/10">
                        {asset.type === 'video' ? <FileVideo size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="px-1">
                        <p className="text-[9px] font-bold uppercase truncate text-white/70">{asset.name}</p>
                      </div>
                    </motion.div>
                  ))}
                  {assets.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-12 px-6 opacity-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                      <Upload size={24} className="mb-4" />
                      <p className="text-[8px] uppercase font-black tracking-widest leading-loose">Drop files here</p>
                    </div>
                  )}
                </div>
              )}

              {leftNavTab === 'templates' && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Gaming Reel', color: 'bg-brand-cyan/5' },
                    { label: 'Modern Vlog', color: 'bg-brand-fuchsia/5' },
                    { label: 'Anime Intro', color: 'bg-white/5' },
                    { label: 'Cyberpunk Edt', color: 'bg-brand-cyan/5' },
                    { label: 'Minimalist', color: 'bg-white/5' },
                    { label: 'Cinematic', color: 'bg-brand-fuchsia/5' }
                  ].map((t, i) => (
                    <div key={i} className={`aspect-[9/16] ${t.color} rounded-xl border border-white/10 hover:border-brand-cyan/40 cursor-pointer overflow-hidden relative group transition-all`}>
                       <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                          <Layout size={32} />
                       </div>
                       <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {leftNavTab === 'elements' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[Sparkles, Zap, Mic2, Cpu, Video, Settings2].map((Icon, i) => (
                      <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-brand-cyan/40 cursor-pointer transition-all">
                        <Icon size={20} className="text-white/40" />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-brand-cyan mb-2">Graphics</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="h-12 bg-white/5 rounded-lg border border-white/5" />
                       <div className="h-12 bg-white/5 rounded-lg border border-white/5" />
                    </div>
                  </div>
                </div>
              )}

              {leftNavTab === 'text' && (
                 <div className="space-y-4">
                    <button className="w-full py-4 bg-white/10 border border-white/20 rounded-xl hover:scale-[1.02] transition-all flex flex-col items-center gap-2">
                       <span className="text-xl font-black">Add Heading</span>
                    </button>
                    <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:scale-[1.02] transition-all flex flex-col items-center gap-1 opacity-60">
                       <span className="text-sm font-bold">Add Subheading</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2 mt-6">
                       {[
                         { name: 'Neon', style: 'text-brand-cyan' },
                         { name: 'Glow', style: 'text-brand-fuchsia' },
                         { name: 'Bold', style: 'font-black' },
                         { name: 'Retro', style: 'italic opacity-60' }
                       ].map(preset => (
                         <div key={preset.name} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:border-brand-cyan/40 cursor-pointer group">
                            <span className={`text-[12px] font-black uppercase tracking-tight group-hover:scale-110 block transition-transform ${preset.style}`}>
                              {preset.name}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
              )}

              {leftNavTab === 'tools' && (
                <div className="space-y-4">
                   <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl flex items-center gap-3">
                      <Wand2 size={16} className="text-brand-cyan" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-brand-cyan">AI Enhancer</p>
                         <p className="text-[8px] text-white/40 uppercase font-bold">Auto-correct lighting</p>
                      </div>
                   </div>
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-all">
                      <Scissors size={16} className="text-white/40" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-white/60">Trim Tool</p>
                         <p className="text-[8px] text-white/40 uppercase font-bold">Quick cuts</p>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Preview & Timeline */}
          <div className="col-span-7 flex flex-col gap-1 overflow-hidden">
            {/* Main Stage */}
            <div className="flex-1 bg-[#0a0a0a] rounded-xl overflow-hidden relative group border border-white/5 shadow-inner">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-[8px] font-mono tracking-widest text-brand-cyan flex items-center gap-2 shadow-2xl">
                  <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
                  EDITING MODE
                </div>
              </div>

              <div className="w-full h-full flex items-center justify-center">
                {activeVideoUrl ? (
                  <video 
                    ref={videoRef}
                    src={activeVideoUrl} 
                    className="w-full h-full object-contain"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-6 opacity-20 group-hover:opacity-30 transition-opacity">
                     <div className="w-20 h-20 rounded-[2.5rem] border-2 border-dashed border-white/40 flex items-center justify-center">
                        <Monitor size={40} />
                     </div>
                     <p className="text-[10px] uppercase font-black tracking-[0.4em]">Ready to design</p>
                  </div>
                )}
              </div>

              {/* Playback HUD */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 px-10 py-3 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button className="text-white/40 hover:text-white transition-colors scale-90"><Scissors size={18} /></button>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-white/30">00:00:24</span>
                  <button 
                    onClick={togglePlayback}
                    className="w-12 h-12 bg-brand-cyan text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>
                  <span className="text-[10px] font-mono text-white/30">00:01:04</span>
                </div>
                <button className="text-white/40 hover:text-white transition-colors scale-90"><Volume2 size={18} /></button>
              </div>
            </div>

            {/* Timeline: THE CHART */}
            <div className="h-48 bg-brand-bg rounded-xl border border-white/5 p-4 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-6">
                  <div className="text-[10px] font-black tracking-tight flex items-center gap-2">
                    <span className="text-brand-cyan">00:00:12:04</span>
                    <span className="text-white/20">/</span>
                    <span className="text-white/40">00:00:05:00</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex gap-4">
                    <button className="p-1 text-white/30 hover:text-white"><Scissors size={14} /></button>
                    <button className="p-1 text-white/30 hover:text-white"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex bg-white/5 rounded-lg border border-white/10 p-0.5">
                      <button className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan rounded text-[8px] font-black uppercase">Standard</button>
                      <button className="px-2 py-1 text-white/30 rounded text-[8px] font-black uppercase">Vertical</button>
                   </div>
                </div>
              </div>

              <div className="flex-1 bg-black/40 rounded-xl overflow-x-auto custom-scrollbar relative border border-white/5">
                {/* Ruler */}
                <div className="h-6 border-b border-white/5 flex items-end bg-black/20">
                  {Array.from({length: 60}).map((_, i) => (
                    <div key={i} className={`flex-shrink-0 w-10 h-${i % 5 === 0 ? '3' : '1'} border-l border-white/10 text-[6px] font-mono text-white/20 pl-0.5`}>
                      {i % 5 === 0 && `0:${i}`}
                    </div>
                  ))}
                </div>
                
                {/* Playhead */}
                <div className="absolute left-[120px] top-0 bottom-0 w-0.5 bg-brand-fuchsia z-20 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                   <div className="w-3 h-3 bg-brand-fuchsia rounded-full -ml-[5.5px] mt-0 shadow-lg" />
                </div>

                {/* Tracks */}
                <div className="p-3 space-y-1.5 h-full overflow-y-auto">
                  {/* Video Track */}
                  <div className="h-12 bg-brand-cyan/5 border border-brand-cyan/10 rounded-lg flex items-center gap-0.5 overflow-hidden">
                     <span className="sticky left-0 bg-brand-cyan/20 text-brand-cyan text-[7px] font-black p-2 rounded-r-lg z-10 mr-2 uppercase border-r border-brand-cyan/20">Source</span>
                     {assets.filter(a => a.type === 'video').map((a, i) => (
                       <div key={i} className="h-full w-64 bg-brand-cyan/20 border-r border-brand-white/10 flex flex-col gap-1 px-3 py-1.5 overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase truncate">{a.name}</span>
                            <span className="text-[7px] opacity-20 font-mono">03s</span>
                          </div>
                          <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-cyan/40 w-full" />
                          </div>
                       </div>
                     ))}
                  </div>
                  {/* Audio Track */}
                  <div className="h-10 bg-brand-fuchsia/5 border border-brand-fuchsia/10 rounded-lg flex items-center gap-0.5 overflow-hidden">
                     <span className="sticky left-0 bg-brand-fuchsia/20 text-brand-fuchsia text-[7px] font-black p-2 rounded-r-lg z-10 mr-2 uppercase border-r border-brand-fuchsia/20">Sound</span>
                     {instructions.filter(inst => inst.action.includes('voice') || inst.action.includes('audio')).map((inst, i) => (
                       <div key={i} className="h-full w-40 bg-brand-fuchsia/10 border-r border-brand-white/10 flex items-center gap-3 px-3">
                          <Volume2 size={10} className="text-brand-fuchsia" />
                          <div className="flex-1 h-3 bg-brand-fuchsia/20 rounded relative">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wave-cut.png')] opacity-20" />
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Property Panel */}
          <div className="col-span-3 flex flex-col bg-brand-bg rounded-xl overflow-hidden border border-white/5">
            <div className="flex border-b border-white/10">
              {[
                { id: 'ai', label: 'History' },
                { id: 'audio', label: 'Sound' },
                { id: 'visuals', label: 'Style' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab.id ? 'text-brand-cyan bg-brand-cyan/5 border-b-2 border-brand-cyan' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Design Assistant</h4>
                       <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-[9px] font-bold uppercase text-white/40">Task</span>
                          <span className="text-[9px] font-mono text-brand-cyan uppercase">{currentStatus}</span>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-[9px] font-bold uppercase text-white/40">Current Folder</span>
                          <span className="text-[9px] font-mono text-white/60 truncate max-w-[80px]">{projectId || 'Personal'}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 px-2">Action Log</h5>
                    <AnimatePresence>
                      {instructions.map((inst, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-white/5 border border-white/5 rounded-2xl group overflow-hidden"
                        >
                          <div className="flex justify-between items-center mb-3">
                             <div className="px-2 py-0.5 bg-brand-cyan text-black text-[7px] font-black uppercase rounded">{inst.action}</div>
                             <span className="text-[8px] font-mono text-white/20">Step {i + 1}</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider font-medium">{inst.reasoning}</p>
                        </motion.div>
                      ))}
                      {instructions.length === 0 && (
                        <div className="py-8 text-center opacity-10 border border-dashed border-white/5 rounded-2xl">
                           <p className="text-[8px] font-black uppercase">Start generating to see logs</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-6 text-left">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Volume2 size={14} className="text-brand-cyan" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Volume Levels</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {Object.entries(volumes).map(([key, value]) => (
                        <div key={key} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{key}</span>
                            <span className="text-[9px] font-mono text-brand-cyan">{value}%</span>
                          </div>
                          <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden group cursor-pointer">
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={value}
                              onChange={(e) => setVolumes(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <motion.div 
                              className="h-full bg-gradient-to-r from-brand-cyan to-brand-fuchsia shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                              animate={{ width: `${value}%` }}
                              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 border border-white/10 rounded-2xl">
                    <p className="text-[9px] font-black uppercase mb-4 opacity-40">Voice Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Professional', 'Friendly', 'Exciting', 'Soft'].map(v => (
                        <button key={v} className="py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-brand-cyan/20 hover:border-brand-cyan/40 transition-all">{v}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visuals' && (
                <div className="space-y-6 text-left">
                   <div className="p-5 border border-white/10 rounded-2xl bg-gradient-to-br from-brand-fuchsia/5 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-fuchsia">Design Styles</p>
                       <Sparkles size={14} className="text-brand-fuchsia" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       {['Classic', 'Modern', 'Neon', 'Soft'].map(s => (
                         <button key={s} className="py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:border-brand-fuchsia/40 hover:text-brand-fuchsia transition-all">{s}</button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-6 px-2">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase opacity-40">Brightness</span>
                           <span className="text-[9px] font-mono text-brand-cyan">Default</span>
                        </div>
                        <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                           <div className="w-[50%] h-full bg-brand-cyan" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase opacity-40">Contrast</span>
                           <span className="text-[9px] font-mono text-brand-cyan">Default</span>
                        </div>
                        <div className="h-0.5 w-full bg-white/10 rounded-full" />
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ingestion Dropzone */}
            <div className="p-6 border-t border-white/10 bg-black/40">
               <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/5 rounded-2xl hover:bg-white/5 hover:border-brand-cyan/20 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30 group-hover:text-brand-cyan group-hover:scale-110 transition-all">
                     <Plus size={20} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Add files</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
