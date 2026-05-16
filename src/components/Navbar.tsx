/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Video } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-cyan to-brand-fuchsia rounded-full transition-transform group-hover:scale-110" />
          <span className="font-black text-xl tracking-tighter uppercase">VidiGen.ai</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="nav-link text-brand-cyan">The Vault</Link>
          <Link to="/new" className="nav-link">Prompt Lab</Link>
        </div>
      </div>
    </nav>
  );
}
