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
  Plus,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const suggestions = [
    { text: 'Add professional captions', icon: Type },
    { text: 'Apply cinematic color grading', icon: Sparkles },
    { text: 'Trim silences automatically', icon: Scissors },
    { text: 'Sync cuts to music beat', icon: Zap },
    { text: 'Enhance voice clarity', icon: Mic2 },
    { text: 'Add motion blur to motion', icon: Layout }
  ];

  const filteredSuggestions = prompt 
    ? suggestions.filter(s => s.text.toLowerCase().includes(prompt.toLowerCase()))
    : suggestions;
  const [instructions, setInstructions] = useState<AIEditInstruction[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('Ready');
  const [projectId, setProjectId] = useState<string | null>(id || null);
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);

  const changeActiveVideo = (url: string | null) => {
    setVideoError(false);
    setActiveVideoUrl(url);
    setMediaUrl(url);
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('Tools');
  const [propertyTab, setPropertyTab] = useState<'ai' | 'audio' | 'visuals' | 'analysis'>('ai');

  useEffect(() => {
    if (mediaUrl !== activeVideoUrl) {
      setActiveVideoUrl(mediaUrl);
    }
  }, [mediaUrl]);

  useEffect(() => {
    if (activeVideoUrl !== mediaUrl) {
      setMediaUrl(activeVideoUrl);
    }
  }, [activeVideoUrl]);

  const [volumes, setVolumes] = useState({
    master: 80,
    voiceover: 100,
    background: 60,
    effects: 70
  });

  const isTemplatesTab = activeTab?.toLowerCase() === 'templates';
  const isElementsTab = activeTab?.toLowerCase() === 'elements';
  const isTextTab = activeTab?.toLowerCase() === 'text';
  const isUploadTab = activeTab?.toLowerCase() === 'uploads' || activeTab?.toLowerCase() === 'upload';
  const isToolsTab = activeTab?.toLowerCase() === 'tools';

  // Templates Panel state and mockup data
  const mockTemplates = [
    {
      id: 't-gaming',
      title: 'Gaming Reel',
      duration: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
      category: 'Gaming',
      style: 'Neon',
      prompt: 'Make a high-octane neon cyber-gaming highlight edit.',
      color: 'from-brand-cyan/25 to-black/90'
    },
    {
      id: 't-vlog',
      title: 'Modern Vlog',
      duration: '00:30',
      thumbnail: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=400',
      category: 'Vlog',
      style: 'Modern',
      prompt: 'Apply slow cinematic vlog grading, soft transitions and clear voice enhancement.',
      color: 'from-brand-fuchsia/25 to-black/90'
    },
    {
      id: 't-anime',
      title: 'Anime Intro',
      duration: '00:12',
      thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=400',
      category: 'Intro',
      style: 'Classic',
      prompt: 'Fast flashing speed ramps, intense manga-style framing, and saturated colors.',
      color: 'from-purple-500/25 to-black/90'
    },
    {
      id: 't-cyberpunk',
      title: 'Cyberpunk Edt',
      duration: '00:24',
      thumbnail: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=400',
      category: 'Cinematic',
      style: 'Neon',
      prompt: 'Drench in deep indigo and neon pink color temperature, with added signal glitch aesthetics.',
      color: 'from-blue-500/25 to-black/90'
    },
    {
      id: 't-minimalist',
      title: 'Minimalist Shot',
      duration: '00:10',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
      category: 'Vlog',
      style: 'Soft',
      prompt: 'Add elegant text cards, monochrome filter, and subtle scale-in animations.',
      color: 'from-gray-500/25 to-black/90'
    },
    {
      id: 't-cinematic',
      title: 'Cinematic Dawn',
      duration: '00:45',
      thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400',
      category: 'Cinematic',
      style: 'Classic',
      prompt: 'Add anamorphic black bars, deep warm sunset grade, and immersive spatial audio curves.',
      color: 'from-orange-500/25 to-black/90'
    }
  ];

  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [isTemplatesError, setIsTemplatesError] = useState(false);

  const simulateLoading = () => {
    setIsTemplatesLoading(true);
    setIsTemplatesError(false);
    setTimeout(() => {
      setIsTemplatesLoading(false);
    }, 1200);
  };

  const simulateError = () => {
    setIsTemplatesLoading(true);
    setIsTemplatesError(false);
    setTimeout(() => {
      setIsTemplatesLoading(false);
      setIsTemplatesError(true);
    }, 1000);
  };

  const handleUseTemplate = async (template: typeof mockTemplates[0]) => {
    setPrompt(template.prompt);
    setPropertyTab('visuals');
    if (!mediaUrl) {
      setCurrentStatus(`Applying sample: ${template.title}...`);
      const mockSampleVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      changeActiveVideo(mockSampleVideo);
      
      let targetProjectId = projectId;
      if (!targetProjectId) {
        const proj = await createProject({
          title: template.title,
          originalPrompt: template.prompt,
          status: ProjectStatus.DRAFT
        });
        if (proj) {
          targetProjectId = proj.id;
          setProjectId(proj.id);
        }
      }
      
      if (targetProjectId) {
        const newAsset = await createAsset(targetProjectId, {
          name: `${template.title.toLowerCase().replace(' ', '_')}_sample.mp4`,
          type: 'video',
          url: mockSampleVideo,
          role: 'source'
        });
        if (newAsset) {
          setAssets(prev => [newAsset, ...prev]);
        }
      }
    }
    setCurrentStatus('Ready');
  };

  useEffect(() => {
    if (projectId) {
      const fetchAssets = async () => {
        const data = await getProjectAssets(projectId);
        setAssets(data || []);
        const firstVideo = data?.find(a => a.type === 'video');
        if (firstVideo) changeActiveVideo(firstVideo.url);
      };
      fetchAssets();
    }
  }, [projectId]);

  const processFiles = async (filesToProcess: FileList | File[]) => {
    if (!filesToProcess || filesToProcess.length === 0) return;

    let targetProjectId = projectId;
    
    if (!targetProjectId) {
      setCurrentStatus('Creating project...');
      const proj = await createProject({
        title: filesToProcess[0].name.split('.')[0],
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
    for (const file of Array.from(filesToProcess) as File[]) {
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
        if (type === 'video' && !activeVideoUrl) {
          changeActiveVideo(mockUrl);
        }
      }
    }
    setCurrentStatus('Ready');
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
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
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback error", err);
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const videoDuration = videoRef?.current?.duration || 64;
  const progressRatio = videoDuration > 0 ? (currentTime / videoDuration) : 0;

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
                <FileVideo size={12} className="text-white/40" />
                <span className="text-[10px] font-bold text-white/60">File</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 cursor-pointer rounded-md border border-transparent hover:border-white/10 transition-all">
                <Layout size={12} className="text-white/40" />
                <span className="text-[10px] font-bold text-white/60">Resize</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 rounded-md border border-brand-cyan/20">
                <span className="text-[10px] font-bold text-brand-cyan">Editing</span>
             </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-8 relative group">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ask AI to edit, trim, or style your video..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
          />
          <Wand2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
          
          <AnimatePresence>
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden z-[100] shadow-2xl"
              >
                <div className="p-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                   <span className="text-[8px] font-black uppercase text-white/40 tracking-widest px-2">Suggestions</span>
                   <Sparkles size={10} className="text-brand-cyan animate-pulse mr-2" />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(suggestion.text);
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-cyan/10 text-left transition-colors group/item border-b border-white/5 last:border-0"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover/item:text-brand-cyan group-hover/item:bg-brand-cyan/20 transition-all">
                        <suggestion.icon size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 group-hover/item:text-white transition-colors">{suggestion.text}</span>
                      <Plus size={12} className="ml-auto opacity-0 group-hover/item:opacity-40" />
                    </button>
                  ))}
                  {filteredSuggestions.length === 0 && (
                    <div className="p-8 text-center opacity-20">
                      <p className="text-[10px] font-bold uppercase">No exact matches</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-brand-cyan/5 border-t border-white/10">
                   <p className="text-[8px] font-medium text-brand-cyan/60 uppercase text-center italic">Try descriptive commands like "Make it look like a 90s camcorder"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleAutomate}
            disabled={!prompt || isProcessing}
            className="absolute right-1 top-1 bottom-1 px-4 bg-brand-cyan text-black text-[9px] font-black uppercase tracking-widest rounded-md hover:scale-105 transition-all disabled:opacity-0"
          >
            {isProcessing ? 'Thinking...' : 'Generate'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-[10px] font-bold text-white/60 hover:text-white uppercase transition-colors">
            <Play size={12} />
            Preview
          </button>
          <button className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <CheckCircle2 size={12} />
            Share
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-1 overflow-hidden p-1">
        {/* Far Left: Icon Rail */}
        <div className="w-[72px] flex flex-col bg-brand-bg rounded-xl border border-white/5 overflow-hidden">
          {[
            { id: 'Templates', icon: Layout, label: 'Templates' },
            { id: 'Elements', icon: Sticker, label: 'Elements' },
            { id: 'Text', icon: Type, label: 'Text' },
            { id: 'Uploads', icon: Upload, label: 'Uploads' },
            { id: 'Tools', icon: Settings2, label: 'Tools' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-4 px-2 gap-1 border-l-2 transition-all ${
                activeTab === item.id 
                  ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan' 
                  : 'border-transparent text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[8px] font-bold tracking-widest">{item.label}</span>
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
              <span className="text-[10px] font-black tracking-widest text-white/60">{activeTab}</span>
              {isUploadTab && (
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-brand-cyan/20 rounded-lg text-brand-cyan border border-brand-cyan/20">
                  <Plus size={14} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {isUploadTab && (
                <div className="space-y-3">
                  {assets?.map((asset) => (
                    <motion.div 
                      key={asset.id}
                      layoutId={asset.id}
                      onClick={() => asset.type === 'video' && changeActiveVideo(asset.url)}
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
                  {(!assets || assets.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                      <Upload size={24} className="mb-4 text-white/20" />
                      <p className="text-[8px] uppercase font-black tracking-widest leading-loose text-white/30">Your media library is empty</p>
                    </div>
                  )}
                </div>
              )}

              {isTemplatesTab && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Search and Filters */}
                  <div className="space-y-2 mb-3">
                    <div className="relative">
                      <input 
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[9px] font-medium text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 transition-all animate-fade-in"
                      />
                      <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                    </div>
                    
                    {/* Category Carousel */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                      {['All', 'Gaming', 'Vlog', 'Intro', 'Cinematic'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setTemplateCategory(cat)}
                          className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                            templateCategory === cat 
                              ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                              : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80 hover:bg-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resilience Tester Subtle Controls */}
                  <div className="flex items-center gap-1.5 justify-between py-1 px-1.5 border-y border-white/5 bg-white/[0.02] mb-3 rounded">
                    <span className="text-[7px] uppercase font-black tracking-widest text-white/30">Test states:</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={simulateLoading}
                        className="text-[7px] uppercase font-black tracking-wider text-brand-cyan hover:underline bg-brand-cyan/5 px-1.5 py-0.5 rounded border border-brand-cyan/25"
                      >
                        Loading
                      </button>
                      <button 
                        onClick={simulateError}
                        className="text-[7px] uppercase font-black tracking-wider text-brand-fuchsia hover:underline bg-brand-fuchsia/5 px-1.5 py-0.5 rounded border border-brand-fuchsia/25"
                      >
                        Error
                      </button>
                    </div>
                  </div>

                  {/* Core Templates List with robust error/loading fallbacks */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                    {isTemplatesLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
                        <Loader2 className="animate-spin text-brand-cyan" size={18} />
                        <p className="text-[8px] uppercase tracking-widest font-black text-white/40">Syncing database...</p>
                      </div>
                    ) : isTemplatesError ? (
                      <div className="p-4 rounded-xl border border-brand-fuchsia/20 bg-brand-fuchsia/5 flex flex-col items-center text-center gap-2 shadow-2xl">
                        <AlertCircle className="text-brand-fuchsia animate-pulse" size={18} />
                        <p className="text-[9px] font-bold text-white/80 uppercase">Template Offline</p>
                        <p className="text-[8px] text-white/40 uppercase max-w-[125px] leading-relaxed">Failed to fetch template catalog.</p>
                        <button
                          onClick={() => {
                            setIsTemplatesError(false);
                            simulateLoading();
                          }}
                          className="mt-1 px-3 py-1 bg-brand-fuchsia/20 hover:bg-brand-fuchsia/30 border border-brand-fuchsia/30 text-[8px] font-black uppercase text-white tracking-widest rounded-md transition-all"
                        >
                          Retry Cloud Stream
                        </button>
                      </div>
                    ) : (
                      (() => {
                        const safeTemplates = mockTemplates || [];
                        const filtered = safeTemplates?.filter((temp) => {
                          const matchesSearch = temp?.title?.toLowerCase()?.includes(templateSearch?.toLowerCase() || '') || false;
                          const matchesCat = templateCategory === 'All' || temp?.category === templateCategory;
                          return matchesSearch && matchesCat;
                        }) || [];

                        if (filtered.length === 0) {
                          return (
                            <div className="py-12 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                              <p className="text-[8px] uppercase font-black tracking-widest text-white/30 mb-2">No templates found</p>
                              <button 
                                onClick={() => {
                                  setTemplateSearch('');
                                  setTemplateCategory('All');
                                }}
                                className="text-[7px] uppercase font-black tracking-wider text-brand-cyan underline"
                              >
                                Clear Filters
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 gap-2">
                            {filtered?.map((temp) => (
                              <motion.div 
                                key={temp.id}
                                layoutId={temp.id}
                                onClick={() => handleUseTemplate(temp)}
                                whileHover={{ scale: 1.02 }}
                                className="aspect-[9/16] rounded-xl border border-white/10 hover:border-brand-cyan/40 bg-[#1a1a1a] cursor-pointer overflow-hidden relative group transition-all"
                              >
                                {/* Thumbnail Background */}
                                <img 
                                  src={temp.thumbnail} 
                                  alt={temp.title}
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300" 
                                />

                                {/* Elegant Overlay Color Gradient matching the category */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${temp.color} opacity-80 group-hover:opacity-90 transition-opacity`} />

                                {/* Play icon overlay on hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-300 pointer-events-none">
                                  <div className="w-8 h-8 rounded-full bg-brand-cyan text-black flex items-center justify-center shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Play size={10} fill="currentColor" className="ml-0.5" />
                                  </div>
                                </div>

                                {/* Duration Tag top-right */}
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-md rounded text-[7px] font-mono font-bold text-white/90">
                                  {temp.duration}
                                </div>

                                {/* Style Tag top-left */}
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-brand-cyan/20 border border-brand-cyan/20 rounded text-[6px] font-bold tracking-wider text-brand-cyan uppercase">
                                  {temp.style}
                                </div>

                                {/* Title & Info bottom */}
                                <div className="absolute inset-x-0 bottom-0 p-2 text-left flex flex-col gap-0.5 pointer-events-none">
                                  <p className="text-[8px] font-black uppercase text-white tracking-wider truncate leading-none">
                                    {temp.title}
                                  </p>
                                  <p className="text-[6px] font-extrabold uppercase text-brand-cyan/80 tracking-widest leading-none">
                                    {temp.category}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              )}

              {isElementsTab && (
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
                       <div className="h-12 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
                          <Sticker size={16} className="text-white/20" />
                       </div>
                       <div className="h-12 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
                          <Sparkles size={16} className="text-white/20" />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {isTextTab && (
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

              {isToolsTab && (
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
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  await processFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => {
                if (!mediaUrl) {
                  fileInputRef.current?.click();
                }
              }}
              className={`flex-1 overflow-hidden relative group rounded-xl border transition-all duration-300 shadow-inner flex flex-col items-center justify-center cursor-default ${
                isDragging 
                  ? 'bg-[#18181b] border-brand-cyan/80 shadow-[0_0_40px_rgba(34,211,238,0.2)] scale-[0.99]' 
                  : 'bg-[#121212] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
                <div className="px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-[8px] font-mono tracking-widest text-brand-cyan flex items-center gap-2 shadow-2xl">
                  <div className={`w-1.5 h-1.5 bg-brand-cyan rounded-full ${mediaUrl ? 'animate-pulse' : ''}`} />
                  {mediaUrl ? 'PREVIEW MODE' : 'UPLOAD STAGE'}
                </div>
              </div>

              <div className="w-full h-full flex items-center justify-center">
                {mediaUrl && !videoError ? (
                  <video 
                    ref={videoRef}
                    src={mediaUrl} 
                    controls
                    className="w-full h-full object-contain pointer-events-auto"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={() => {
                      setVideoError(true);
                    }}
                  />
                ) : mediaUrl && videoError ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm pointer-events-auto select-none bg-[#0a0a0a]/90 border border-brand-fuchsia/20 shadow-2xl rounded-2xl mx-4">
                     <div className="w-16 h-16 rounded-full bg-brand-fuchsia/10 text-brand-fuchsia flex items-center justify-center mb-4 border border-brand-fuchsia/20">
                        <AlertCircle size={28} className="animate-pulse" />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-wider mb-2 text-brand-fuchsia">
                       Media Core Offline
                     </h3>
                     <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest max-w-[280px] leading-relaxed mb-6">
                       Persistence reference expired. The local browser file object stream is no longer valid.
                     </p>
                     
                     <div className="flex flex-col gap-2 w-full">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           fileInputRef.current?.click();
                         }}
                         className="px-5 py-2.5 bg-brand-cyan/25 border border-brand-cyan/40 hover:border-brand-cyan text-brand-cyan hover:bg-brand-cyan/35 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
                       >
                         <Upload size={12} />
                         Relink File
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           changeActiveVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                         }}
                         className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
                       >
                         <RefreshCw size={12} />
                         Load Demo Stream
                       </button>
                     </div>
                     
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         changeActiveVideo(null);
                       }}
                       className="mt-4 text-[8px] text-white/30 hover:text-white/60 uppercase font-black tracking-widest hover:underline transition-colors cursor-pointer pointer-events-auto"
                     >
                       Return to Upload Stage
                     </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm pointer-events-none select-none">
                     <motion.div 
                       animate={{ 
                         scale: isDragging ? 1.1 : 1,
                         rotate: isDragging ? 5 : 0 
                       }}
                       className={`w-20 h-20 rounded-[2rem] border-2 border-dashed flex items-center justify-center mb-6 transition-all duration-300 pointer-events-none ${
                         isDragging 
                           ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                           : 'border-[#444444] text-white/40 group-hover:border-white/40 group-hover:text-white'
                       }`}
                     >
                       <Upload size={32} className={`${isDragging ? 'animate-bounce' : 'opacity-60'}`} />
                     </motion.div>
                     
                     <h3 className={`text-xs font-black uppercase tracking-wider mb-2 transition-colors duration-300 ${
                       isDragging ? 'text-brand-cyan' : 'text-white/80'
                     }`}>
                       Drag and drop or click to upload
                     </h3>
                     
                     <p className="text-[9px] text-white/30 font-medium uppercase tracking-widest max-w-[280px] leading-relaxed">
                       Supports MP4, MOV, WEBM up to 500MB
                     </p>
                  </div>
                )}
              </div>

              {/* Playback HUD */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 px-10 py-3 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button className="text-white/40 hover:text-white transition-colors scale-90"><Scissors size={18} /></button>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-white/30">{formatTime(currentTime)}</span>
                  <button 
                    onClick={togglePlayback}
                    className="w-12 h-12 bg-brand-cyan text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>
                  <span className="text-[10px] font-mono text-white/30">{formatTime(videoDuration)}</span>
                </div>
                <button className="text-white/40 hover:text-white transition-colors scale-90"><Volume2 size={18} /></button>
              </div>
            </div>

            {/* Timeline: THE CHART */}
            <div className="h-48 bg-brand-bg rounded-xl border border-white/5 p-4 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-6">
                  <div className="text-[10px] font-black tracking-tight flex items-center gap-2">
                    <span className="text-brand-cyan">{formatTime(currentTime)}</span>
                    <span className="text-white/20">/</span>
                    <span className="text-white/40">{formatTime(videoDuration)}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex gap-4">
                    <button className="p-1 text-white/30 hover:text-white"><Scissors size={14} /></button>
                    <button className="p-1 text-white/30 hover:text-white"><Trash2 size={14} /></button>
                  </div>
                </div>
                  <div className="flex items-center gap-3">
                   <div className="flex bg-black/40 rounded-lg border border-white/10 p-0.5">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/20 text-brand-cyan rounded text-[8px] font-black uppercase border border-brand-cyan/20">
                        <Monitor size={10} />
                        Standard
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-white/30 hover:text-white/60 rounded text-[8px] font-black uppercase transition-colors">
                        <Smartphone size={10} />
                        Vertical
                      </button>
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
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-brand-fuchsia z-20 shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all duration-100 ease-linear"
                  style={{ left: `calc(10px + ${progressRatio * 90}%)` }}
                >
                   <div className="w-3 h-3 bg-brand-fuchsia rounded-full -ml-[5.5px] mt-0 shadow-lg" />
                </div>

                {/* Tracks */}
                <div className="p-3 space-y-1.5 h-full overflow-y-auto">
                  {/* Video Track */}
                  <div className="h-12 bg-brand-cyan/5 border border-brand-cyan/10 rounded-lg flex items-center gap-0.5 overflow-hidden">
                     <span className="sticky left-0 bg-brand-cyan/20 text-brand-cyan text-[7px] font-black p-2 rounded-r-lg z-10 mr-2 uppercase border-r border-brand-cyan/20">Source</span>
                     {assets?.filter(a => a.type === 'video')?.map((a, i) => (
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
                     {instructions?.filter(inst => inst.action.includes('voice') || inst.action.includes('audio'))?.map((inst, i) => (
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
                { id: 'visuals', label: 'Style' },
                { id: 'analysis', label: 'Analysis' }
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
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                   <div className="p-5 bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 flex items-center justify-center">
                            <Cpu size={16} className="text-brand-cyan" />
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">Media Metadata</h4>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[9px] font-bold text-white/40 uppercase">Resolution</span>
                            <span className="text-[9px] font-mono text-white/80">4K (3840x2160)</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[9px] font-bold text-white/40 uppercase">Frame Rate</span>
                            <span className="text-[9px] font-mono text-white/80">60 FPS</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[9px] font-bold text-white/40 uppercase">Bitrate</span>
                            <span className="text-[9px] font-mono text-white/80">45 Mbps</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-5 border border-white/10 rounded-2xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-6">AI Scene Detection</h4>
                      <div className="space-y-4">
                         {[
                           { label: 'Action sequences', value: 34, color: 'bg-brand-cyan' },
                           { label: 'Dialog scenes', value: 42, color: 'bg-brand-fuchsia' },
                           { label: 'B-Roll/Transitions', value: 24, color: 'bg-white/40' }
                         ].map(item => (
                           <div key={item.label} className="space-y-2">
                              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                                 <span className="text-white/40">{item.label}</span>
                                 <span className="text-white/60">{item.value}%</span>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${item.value}%` }}
                                   className={`h-full ${item.color}`}
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-5 border border-white/10 rounded-2xl bg-black/20">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Sentiment Map</p>
                      <div className="h-24 flex items-end gap-1 px-2">
                         {Array.from({length: 20}).map((_, i) => {
                           const h = Math.random() * 80 + 20;
                           return (
                             <div 
                               key={i} 
                               className="flex-1 bg-brand-cyan/20 rounded-t-sm hover:bg-brand-cyan/40 transition-colors"
                               style={{ height: `${h}%` }}
                             />
                           );
                         })}
                      </div>
                   </div>
                </div>
              )}
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
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-brand-cyan group-hover:scale-110 transition-all border border-white/10">
                     <Plus size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black tracking-widest text-white/70 mb-1">Add Media</p>
                    <p className="text-[8px] font-bold text-white/30 tracking-wider">Drag and drop or click to upload</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
