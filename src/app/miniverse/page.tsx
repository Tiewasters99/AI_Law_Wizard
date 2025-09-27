"use client";

import React, { useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { useMiniverseStore } from './data/store';
import { 
  EnhancedControls, 
  KeyboardMovement, 
  LawyerOfficeScene, 
  SpawnAtDoor,
  IframeModal,
  BlogModal,
  BookModal,
  MusicPlayer
} from './components';

export default function MiniversePage() {
  const router = useRouter();
  const { 
    dpr, 
    isMemoModalOpen, 
    isBlogModalOpen, 
    controlsType, 
    isNearPaper, 
    isNearDesk,
    isMusicEnabled,
    musicVolume,
    setDpr,
    setControlsType,
    setIsNearPaper,
    setIsNearDesk,
    setMusicEnabled,
    setMusicVolume,
    toggleMusic,
    openMemoModal,
    closeMemoModal,
    openBlogModal,
    closeBlogModal
  } = useMiniverseStore();

  const handleExit = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Handle keyboard shortcuts (excluding movement keys which are handled by KeyboardMovement)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip movement keys as they're handled by KeyboardMovement component
      const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'];
      if (movementKeys.includes(event.code)) {
        return;
      }
      
      switch (event.key) {
        case 'Escape':
          // If pointer is locked, just unlock (browser handles it) and do nothing else
          if (document.pointerLockElement) {
            return;
          }
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            handleExit();
          }
          break;
        case 'F11':
          event.preventDefault();
          handleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit, handleFullscreen]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Canvas
        /* Remove all renderer shadows */
        camera={{
          position: [6, 1.7, 7.4], // Spawn at door
          fov: 75, // Wider FOV for immersive feel
          near: 0.1,
          far: 100,
        }}
        dpr={dpr}
        style={{ pointerEvents: isMemoModalOpen ? 'none' : 'auto' }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = false;
          // Ensure consistent color management and non-black clear color
          // Use outputColorSpace when available (Three r152+), otherwise fallback
          if ('outputColorSpace' in (gl as any)) {
            (gl as any).outputColorSpace = THREE.SRGBColorSpace;
          }
          gl.setClearColor(new THREE.Color('#f6fbff'), 1);
          gl.toneMapping = THREE.NoToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        {/* Bright background to keep page fully lighted */}
        <color attach="background" args={["#f6fbff"]} />
        {/* Postprocessing removed for performance */}
        <LawyerOfficeScene />
        <SpawnAtDoor />
        <KeyboardMovement disabled={isMemoModalOpen} />
        
        {/* Enhanced controls with fallback */}
        <EnhancedControls disabled={isMemoModalOpen} />
      </Canvas>
      
      {/* Enhanced UI overlay for first-person exploration */}
      <div className="absolute top-4 left-4 text-slate-800 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-300">
        <div className="text-lg font-bold mb-1">🚶 Law Office Walkthrough</div>
        
        {/* Proximity indicators */}
        {isMemoModalOpen && (
          <div className="text-xs text-purple-600 mb-2 animate-pulse">
            📝 <strong>Memo Form Open</strong> - 3D movement disabled
          </div>
        )}
        {isNearPaper && !isMemoModalOpen && (
          <div className="text-xs text-emerald-600 mb-2 animate-pulse">
            ✨ <strong>Near Interactive Paper</strong> - Memo will auto-open
          </div>
        )}
        {isNearDesk && !isNearPaper && !isMemoModalOpen && (
          <div className="text-xs text-blue-600 mb-2 animate-pulse">
            🏢 <strong>Near Desk Area</strong> - Legal memo available
          </div>
        )}
        
        {/* Control mode indicator */}
        {controlsType === 'loading' && (
          <div className="text-xs text-blue-600 mb-2">⏳ Loading controls...</div>
        )}
        {controlsType === 'orbit' && (
          <div className="text-xs text-orange-600 mb-2">🔄 Orbit Controls Mode (Drag to look, scroll to zoom)</div>
        )}
        {controlsType === 'pointer-lock' && (
          <div className="text-xs text-green-600 mb-2">🎯 FPS Controls Mode (Mouse locked)</div>
        )}
        
        <div className="text-xs opacity-70 mt-1 space-y-1">
          {controlsType === 'orbit' ? (
            <>
              <div>🖱️ <strong>Drag:</strong> Look around • <strong>Right-click + drag:</strong> Pan</div>
              <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
              <div>🔄 <strong>Scroll:</strong> Zoom in/out</div>
            </>
          ) : controlsType === 'pointer-lock' ? (
            <>
              <div>🖱️ <strong>Mouse:</strong> Look around (locked)</div>
              <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
              <div>⎋ <strong>Escape:</strong> Unlock mouse</div>
            </>
          ) : (
            <>
              <div>🖱️ <strong>Click:</strong> Lock mouse for FPS controls (or drag to orbit)</div>
              <div>⌨️ <strong>Arrow Keys / WASD:</strong> Walk around office</div>
              <div>⎋ <strong>Escape:</strong> Unlock mouse / 🔄 <strong>Scroll:</strong> Zoom</div>
            </>
          )}
        </div>
        <div className="text-xs opacity-60 mt-2 space-y-1">
          <div>📍 <strong>Starting Position:</strong> Near the door entrance</div>
          <div>🏢 <strong>Room Layout:</strong> Fully enclosed office</div>
          <div>🎯 <strong>Explore:</strong> Desk area, bookshelf, window, door</div>
          <div>⚡ <strong>Interactive:</strong> Walk near desk or paper for legal memo</div>
          <div>📚 <strong>Books:</strong> Walk near books for automatic popup</div>
          <div>📖 <strong>Blogshelf:</strong> Click bookshelf to manage blogs</div>
          <div>🎵 <strong>Music:</strong> Soft instrumental background music with controls</div>
          <div>🖱️ <strong>Modal:</strong> Mouse unlocks, 3D movement stops when form opens</div>
              </div>
            </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Exit button */}
        <button
          onClick={handleExit}
          className="text-white bg-red-600 hover:bg-red-700 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-500/40 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          title="Exit 3D World"
        >
          <span>✕</span>
          Exit
        </button>
        
        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          className="text-white bg-blue-600 hover:bg-blue-700 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/40 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          title="Toggle Fullscreen"
        >
          <span>⛶</span>
          Fullscreen
        </button>
            </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 text-slate-800 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-300">
        <div className="text-xs opacity-80 space-y-1">
          <div>ESC to exit • F11 for fullscreen</div>
          {controlsType === 'orbit' ? (
            <div>↑↓←→ Arrow keys or WASD to walk • Drag to orbit • Scroll to zoom</div>
          ) : controlsType === 'pointer-lock' ? (
            <div>↑↓←→ Arrow keys or WASD to walk • Mouse to look (locked)</div>
          ) : (
            <div>↑↓←→ Arrow keys or WASD to walk • Mouse to look/orbit</div>
          )}
          {isMemoModalOpen && (
            <div className="text-purple-600 font-medium animate-pulse">📝 Form active - Complete to resume exploration</div>
          )}
          {isNearPaper && !isMemoModalOpen && (
            <div className="text-emerald-600 font-medium animate-pulse">📄 Legal memo ready - Auto-triggered!</div>
          )}
          {isNearDesk && !isNearPaper && !isMemoModalOpen && (
            <div className="text-blue-600 font-medium animate-pulse">🏢 Desk area detected - Walk closer for memo!</div>
          )}
          <div className="text-gray-600 font-medium">🎵 Soft instrumental music • 📚 Walk near books or click bookshelf for blog management</div>
        </div>
      </div>

      {/* Room layout reference map */}
      <div className="absolute bottom-4 right-4 w-36 h-28 bg-white/90 border border-slate-300 rounded-lg p-2">
        <div className="text-slate-800 text-xs mb-1 text-center font-medium">Office Layout</div>
        <div className="relative w-full h-full bg-gray-100 rounded border border-gray-300">
          {/* Room outline */}
          <div className="absolute inset-1 border border-gray-400 rounded"></div>
          
          {/* Room features with better positioning */}
          <div className="absolute" style={{ top: '4px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-1.5 h-1 bg-blue-400 rounded" title="Window"></div>
          </div>
          <div className="absolute" style={{ bottom: '4px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-1.5 h-1 bg-green-400 rounded" title="Door"></div>
        </div>
          <div className="absolute" style={{ top: '40%', right: '20%' }}>
            <div className="w-1.5 h-1 bg-yellow-400 rounded" title="Desk"></div>
            </div>
          <div className="absolute" style={{ bottom: '8%', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-1 h-1 bg-purple-400 rounded-full" title="Door (Start)"></div>
            </div>
          <div className="absolute" style={{ top: '25%', right: '25%' }}>
            <div className="w-1 h-1 bg-gray-400 rounded" title="Filing"></div>
        </div>

          {/* Starting position indicator */}
          <div className="absolute" style={{ top: '60%', right: '15%' }}>
            <div className="w-2 h-2 border border-red-400 rounded-full animate-pulse" title="Your starting position"></div>
          </div>
        </div>
        
        {/* Mini legend */}
        <div className="text-xs text-white opacity-70 mt-1 text-center">
          🔴 Start Position
        </div>
      </div>

      {/* Iframe Modal - Completely isolated from 3D environment */}
      <IframeModal />
      
      {/* Blog Management Modal */}
      <BlogModal />
      
      {/* Book Modal */}
      <BookModal />
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}
