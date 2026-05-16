/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Navbar } from './components/Navbar';
import { AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-bg relative overflow-hidden flex flex-col">
        {/* Ambient background blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-cyan/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-fuchsia/5 blur-[150px] rounded-full pointer-events-none" />

        <Navbar />
        
        <main className="flex-1 pt-12 md:pt-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/edit/:id" element={<Editor />} />
              <Route path="/new" element={<Editor />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="h-12 border-t border-white/5 bg-black/60 flex items-center justify-between px-8 text-[9px] uppercase tracking-[0.3em] font-mono text-white/20 mt-auto backdrop-blur-md">
          <div className="flex gap-8">
            <span>Session: ACTIVE</span>
            <span>Region: Global-Alpha</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-brand-cyan">System Synchronized</span>
            <div className="w-2.5 h-2.5 bg-brand-cyan animate-pulse rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          </div>
        </footer>
      </div>
    </Router>
  );
}
