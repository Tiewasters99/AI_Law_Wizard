import React from 'react';

interface HelpPanelProps {
  showHelp: boolean;
  onClose: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ showHelp, onClose }) => {
  if (!showHelp) return null;

  return (
    <div className="fixed top-4 left-4 max-w-xs z-50">
      {/* Compact Glassmorphic Container */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 border border-slate-400/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-blue-900/20 to-slate-800/20"></div>
        
        {/* Content */}
        <div className="relative p-5">
          {/* Close button */}
          <button 
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300 group"
            onClick={onClose}
          >
            <span className="text-white text-lg font-light group-hover:rotate-90 transition-transform duration-300">×</span>
          </button>
          
          {/* Header */}
          <div className="mb-4 pr-8">
            <h3 className="text-base font-bold text-white mb-1">
              Quainton Law
            </h3>
            <p className="text-xs text-gray-300">Miniverse™ Controls</p>
          </div>
          
          {/* Controls - Compact */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-white py-1">
              <span className="flex items-center space-x-1.5">
                <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">WASD</kbd>
                <span className="text-gray-400">/</span>
                <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">↑←↓→</kbd>
              </span>
              <span className="text-gray-200">Move</span>
            </div>
            <div className="flex items-center justify-between text-white py-1">
              <span className="flex items-center space-x-1.5">
                <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">Q</kbd>
                <span className="text-gray-400">/</span>
                <kbd className="px-2 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">E</kbd>
              </span>
              <span className="text-gray-200">Rotate</span>
            </div>
            <div className="flex items-center justify-between text-white py-1">
              <kbd className="px-2.5 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">Click</kbd>
              <span className="text-gray-200">Interact</span>
            </div>
            <div className="flex items-center justify-between text-white py-1">
              <kbd className="px-2.5 py-1 bg-slate-700/60 rounded border border-slate-400/40 text-[10px] text-white">H</kbd>
              <span className="text-gray-200">Show/Hide help</span>
            </div>
          </div>
          
          {/* Footer hint */}
          <div className="mt-4 pt-3 border-t border-slate-500/40">
            <p className="text-[10px] text-gray-300 text-center leading-relaxed">
              Click panels to explore
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
