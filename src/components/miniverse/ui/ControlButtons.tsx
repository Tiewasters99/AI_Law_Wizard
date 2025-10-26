import React from "react";

interface ControlButtonsProps {
  viewMode: "3d" | "2d";
  onEditModeToggle: () => void;
  onMusicClick: () => void;
  onHelpClick: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  viewMode,
  onEditModeToggle,
  onMusicClick,
  onHelpClick,
}) => {
  return (
    <>
      {/* Edit Mode Toggle Button */}
      <button
        className="fixed top-4 right-16 backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 p-3 rounded-full hover:bg-slate-700/70 shadow-xl transition-all duration-300 group"
        onClick={onEditModeToggle}
        title={viewMode === "3d" ? "Switch to Edit Mode" : "Switch to 3D View"}
      >
        <span className="text-lg group-hover:scale-110 transition-transform inline-block">
          {viewMode === "3d" ? "✏️" : "👁️"}
        </span>
      </button>

      {/* Music Button */}
      <button
        className="fixed top-4 right-4 backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 p-3 rounded-full hover:bg-slate-700/70 shadow-xl transition-all duration-300 group"
        onClick={onMusicClick}
      >
        <span className="text-lg group-hover:scale-110 transition-transform inline-block">
          🎵
        </span>
      </button>

      {/* Help Button */}
      <button
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-slate-700/70 shadow-xl transition-all duration-300 group"
        onClick={onHelpClick}
      >
        <span className="flex items-center space-x-2">
          <span className="text-sm group-hover:scale-110 transition-transform">
            🎮
          </span>
          <span className="hidden sm:inline">Help & Controls</span>
          <span className="sm:hidden">Help</span>
        </span>
      </button>
    </>
  );
};
