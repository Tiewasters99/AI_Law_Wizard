

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { History } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <style>{`
        :root {
          --primary-navy: #1a1f36;
          --accent-gold: #d4af37;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
        }
      `}</style>
      
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative">
                <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform duration-300">
                  {/* Background circle */}
                  <circle cx="32" cy="32" r="30" fill="url(#gradient)" stroke="none"/>
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{"stopColor":"#4f46e5","stopOpacity":"1"}} />
                      <stop offset="100%" style={{"stopColor":"#7c3aed","stopOpacity":"1"}} />
                    </linearGradient>
                    
                    <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{"stopColor":"#1e1b4b","stopOpacity":"1"}} />
                      <stop offset="100%" style={{"stopColor":"#4c1d95","stopOpacity":"1"}} />
                    </linearGradient>
                    
                    <linearGradient id="scaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{"stopColor":"#fbbf24","stopOpacity":"1"}} />
                      <stop offset="100%" style={{"stopColor":"#f59e0b","stopOpacity":"1"}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Wizard hat (more prominent for thumbnail) */}
                  <path d="M 32 8 L 20 35 L 44 35 Z" fill="url(#hatGrad)" stroke="none"/>
                  
                  {/* Hat brim */}
                  <ellipse cx="32" cy="35" rx="14" ry="3" fill="url(#hatGrad)" stroke="none"/>
                  
                  {/* Central pillar/staff (thicker for visibility) */}
                  <rect x="30.5" y="35" width="3" height="12" fill="url(#scaleGrad)" rx="1.5"/>
                  
                  {/* Scale arms (more prominent) */}
                  <rect x="20" y="40" width="24" height="2" fill="url(#scaleGrad)" rx="1"/>
                  
                  {/* Scale pans (larger for thumbnail visibility) */}
                  <circle cx="26" cy="46" r="4" fill="none" stroke="url(#scaleGrad)" strokeWidth="1.5"/>
                  <circle cx="38" cy="46" r="4" fill="none" stroke="url(#scaleGrad)" strokeWidth="1.5"/>
                  
                  {/* Magical sparkles (simplified for small size) */}
                  <g fill="#fbbf24" opacity="0.9">
                    {/* Simplified stars */}
                    <polygon points="15,18 16,20 18,19 16,20 15,22 14,20 12,19 14,20" />
                    <polygon points="48,22 49,24 51,23 49,24 48,26 47,24 45,23 47,24" />
                    <polygon points="50,12 51,14 53,13 51,14 50,16 49,14 47,13 49,14" />
                  </g>
                  
                  {/* Subtle glow dots */}
                  <g fill="#ffffff" opacity="0.6">
                    <circle cx="18" cy="28" r="0.8"/>
                    <circle cx="46" cy="30" r="0.6"/>
                    <circle cx="16" cy="40" r="0.5"/>
                    <circle cx="48" cy="38" r="0.7"/>
                  </g>
                  
                  {/* Inner hat glow */}
                  <ellipse cx="32" cy="22" rx="8" ry="4" fill="#ffffff" opacity="0.15"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Law Wizard</h1>
                <p className="text-xs text-slate-500 font-medium">Legal Intelligence Platform</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <button 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Wizardry
              </button>
              <Link 
                to={createPageUrl("Home")} 
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === createPageUrl("Home")
                    ? 'text-slate-900 border-b-2 border-amber-400' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Consultations
              </Link>
              <Link 
                to={createPageUrl("History")} 
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === createPageUrl("History")
                    ? 'text-slate-900 border-b-2 border-amber-400' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="url(#footerGradient)" stroke="none"/>
                <defs>
                  <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{"stopColor":"#fbbf24","stopOpacity":"1"}} />
                    <stop offset="100%" style={{"stopColor":"#f59e0b","stopOpacity":"1"}} />
                  </linearGradient>
                </defs>
                <path d="M 32 8 L 20 35 L 44 35 Z" fill="#1e1b4b" stroke="none"/>
                <ellipse cx="32" cy="35" rx="14" ry="3" fill="#1e1b4b" stroke="none"/>
                <rect x="30.5" y="35" width="3" height="12" fill="#fbbf24" rx="1.5"/>
                <rect x="20" y="40" width="24" height="2" fill="#fbbf24" rx="1"/>
                <circle cx="26" cy="46" r="4" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
                <circle cx="38" cy="46" r="4" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
              </svg>
              <h3 className="text-lg font-bold">AI Law Wizard</h3>
            </div>
            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
              Empowering individuals with AI-driven legal guidance. 
              Professional insights at your fingertips.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                © 2024 AI Law Wizard. This platform provides general legal information only and does not constitute legal advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

