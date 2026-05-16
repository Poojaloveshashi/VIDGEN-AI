/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Database, Mic2, Wand2, Upload, MessageSquare, Terminal, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  const examplePrompts = [
    { title: "Dynamic Reel", prompt: "Edit this into a high-energy 9:16 reel with kinetic typography and hard cuts on every beat." },
    { title: "Cinematic Voice", prompt: "Match the background voiceover to a deep, cinematic narrating tone. Sync with color grade." },
    { title: "Anime Pulse", prompt: "Apply a hand-drawn anime filter and sync the speed to the high-tempo background music tracks." },
    { title: "Neural Sync", prompt: "Identify the main subject and crop for 1:1 Instagram post using smooth tracking shots." }
  ];

  return (
    <div className="flex flex-col items-center pt-8 md:pt-16 text-center relative">
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-cyan/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-brand-fuchsia/20 blur-[120px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full mb-10 backdrop-blur-xl"
      >
        <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-cyan">Engine V3.0 Online</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-10 max-w-6xl"
      >
        CRAFT.<br />
        <span className="bg-gradient-to-r from-brand-cyan via-white to-brand-fuchsia bg-clip-text text-transparent italic">NEURAL</span> SYNC.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs md:text-sm text-white/40 max-w-xl mb-16 uppercase tracking-[0.4em] font-bold leading-loose"
      >
        Architect cinematic reality with OmniSync Neural Engine. 
        Automate perfect visual rhythm and harmonic alignment.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24 w-full max-w-5xl"
      >
        <Link 
          to="/new"
          className="group relative flex flex-col items-center gap-6 p-14 border border-white/10 rounded-[2.5rem] bg-white/5 hover:bg-white/[0.08] transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
            <Zap size={40} className="text-brand-cyan" />
          </div>
          <div className="w-20 h-20 bg-brand-cyan text-black rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <Upload size={36} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-lg font-black uppercase tracking-[0.2em] text-white">INITIALIZE PROTOCOL</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Upload source assets to begin neural editing</span>
          </div>
        </Link>

        <div className="flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex items-center gap-6 group hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:text-brand-fuchsia transition-colors">
              <Mic2 size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest mb-1">Acoustic Sync</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">98% Harmonic Alignment</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex items-center gap-6 group hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:text-brand-cyan transition-colors">
              <Sparkles size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest mb-1">Anime Filter</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Neural Style Transfer</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prompt Matrix / Chart */}
      <div className="w-full max-w-6xl mb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40">Prompt Matrix</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {examplePrompts.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <Terminal size={14} className="text-brand-cyan opacity-40 group-hover:opacity-100 transition-opacity" />
                <Zap size={10} className="text-brand-fuchsia" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan mb-2">{item.title}</p>
              <p className="text-[11px] text-gray-400 font-mono leading-relaxed group-hover:text-white transition-colors">
                "{item.prompt}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full max-w-6xl border border-white/10 bg-white/5 p-1 rounded-2xl">
        {[
          {
            icon: Database,
            title: "The Vault",
            desc: "Persistent metadata storage across every project session."
          },
          {
            icon: Mic2,
            title: "Acoustics",
            desc: "Neural voice matching with 98% harmonic alignment."
          },
          {
            icon: Wand2,
            title: "Prompt Lab",
            desc: "Natural language directives translated into cinematic reality."
          }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + idx * 0.1 }}
            className="bg-brand-bg p-10 text-left hover:bg-white/5 transition-colors group border border-white/5"
          >
            <feature.icon size={20} className="text-brand-cyan mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4 opacity-100">{feature.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-wider font-medium">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
