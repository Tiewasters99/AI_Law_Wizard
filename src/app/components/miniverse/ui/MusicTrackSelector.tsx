import React from 'react';
import { Track } from '../hooks/useMusicPlayer';

interface MusicTrackSelectorProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  onClose: () => void;
  onOpenLibrary?: () => void;
}

export const MusicTrackSelector: React.FC<MusicTrackSelectorProps> = ({ 
  tracks, 
  onTrackSelect, 
  onClose,
  onOpenLibrary
}) => {
  return (
    <div className="fixed top-20 right-4 w-48 z-50">
      {/* Compact Music Panel - Track Selection */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 border border-slate-400/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-blue-900/20 to-slate-800/20"></div>
        
        {/* Content */}
        <div className="relative p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Music</h4>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300 group"
            >
              <span className="text-white text-sm font-light group-hover:rotate-90 transition-transform duration-300">×</span>
            </button>
          </div>
          
          {/* Music Tracks - Clickable */}
          <div className="space-y-2">
            {tracks.map((track) => (
              <button
                key={track.title}
                onClick={() => onTrackSelect(track)}
                className="w-full backdrop-blur-md bg-gradient-to-r from-purple-900/40 to-purple-800/40 border border-purple-400/30 text-white py-2 px-3 rounded-xl text-xs font-medium hover:from-purple-800/50 hover:to-purple-700/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="text-sm">{track.icon}</span>
                  <span className="truncate">{track.title}</span>
                </div>
              </button>
            ))}
            
            {/* Library Access Button */}
            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                className="w-full backdrop-blur-md bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-400/30 text-white py-2 px-3 rounded-xl text-xs font-medium hover:from-blue-800/50 hover:to-blue-700/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="text-sm">🎵</span>
                  <span>Manage Library</span>
                </div>
              </button>
            )}
          </div>

          {/* Footer hint */}
          <p className="text-[10px] text-gray-300 text-center mt-2">
            Click to play • Manage to add more
          </p>
        </div>
      </div>
    </div>
  );
};
