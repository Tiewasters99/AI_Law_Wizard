"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useMiniverseStore } from "@/stores/miniverseStore";
import { MiniverseEditor } from "@/components/miniverse/MiniverseEditor";
import { FloorPlanView } from "@/components/miniverse/FloorPlanView";
import { OfficeScene } from "@/components/miniverse/3d/OfficeScene";
import { CameraRig } from "@/components/miniverse/3d/CameraRig";
import { HelpPanel } from "@/components/miniverse/ui/HelpPanel";
import { MusicTrackSelector } from "@/components/miniverse/ui/MusicTrackSelector";
import { MusicPlayer } from "@/components/miniverse/ui/MusicPlayer";
import { MusicBrowser } from "@/components/miniverse/ui/YouTubeSearch";
import { ContentModal } from "@/components/miniverse/ui/ContentModal";
import { ControlButtons } from "@/components/miniverse/ui/ControlButtons";
import { ConfirmDialog } from "@/components/miniverse/ui/ConfirmDialog";
import { useMusicPlayer } from "@/components/miniverse/hooks/useMusicPlayer";
import { useContentModal } from "@/components/miniverse/hooks/useContentModal";
import { useKeyboardControls } from "@/components/miniverse/hooks/useKeyboardControls";
import { useObjectInteraction } from "@/components/miniverse/hooks/useObjectInteraction";
import { CAMERA_SETTINGS } from "@/components/miniverse/utils/constants";

// Main component
export default function MiniversePage() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Miniverse store
  const { viewMode, setViewMode, config } = useMiniverseStore();

  // Custom hooks for state management
  const musicPlayer = useMusicPlayer();
  const contentModal = useContentModal();
  const keyboardControls = useKeyboardControls();
  const objectInteraction = useObjectInteraction(contentModal.openModal);

  // Event handlers
  const handleEditModeToggle = () => {
    if (viewMode === "3d") {
      setViewMode("2d");
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSwitchTo3D = () => {
    setViewMode("3d");
    setShowConfirmDialog(false);
  };

  const handleCancelSwitch = () => {
    setShowConfirmDialog(false);
  };

  const handleMusicClick = () => {
    musicPlayer.setShowMusicPanel(!musicPlayer.showMusicPanel);
  };

  const handleHelpClick = () => {
    keyboardControls.toggleHelp();
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {viewMode === "3d" ? (
        <Canvas
          camera={{
            position: CAMERA_SETTINGS.position,
            fov: CAMERA_SETTINGS.fov,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#2a2a40"]} />
          <CameraRig />
          <OfficeScene
            onObjectClick={objectInteraction.handleObjectClick}
            lampsOn={objectInteraction.lampsOn}
            config={config}
          />
        </Canvas>
      ) : (
        <FloorPlanView />
      )}

      {/* Edit Mode Side Panel */}
      {viewMode === "2d" && <MiniverseEditor />}

      {/* UI Components */}
      <ControlButtons
        viewMode={viewMode}
        onEditModeToggle={handleEditModeToggle}
        onMusicClick={handleMusicClick}
        onHelpClick={handleHelpClick}
      />

      <HelpPanel
        showHelp={keyboardControls.showHelp}
        onClose={keyboardControls.setShowHelp.bind(null, false)}
      />

      {musicPlayer.showMusicPanel && !musicPlayer.isPlayerOpen && (
        <MusicTrackSelector
          tracks={musicPlayer.tracks}
          onTrackSelect={musicPlayer.handleTrackSelect}
          onClose={() => musicPlayer.setShowMusicPanel(false)}
          onOpenLibrary={() => {
            musicPlayer.setShowMusicPanel(false);
            musicPlayer.setShowSearchPanel(true);
          }}
        />
      )}

      <MusicPlayer
        isPlayerOpen={musicPlayer.isPlayerOpen}
        currentTrack={musicPlayer.currentTrack}
        isPlaying={musicPlayer.isPlaying}
        volume={musicPlayer.volume}
        isMinimized={musicPlayer.isMinimized}
        playerReady={musicPlayer.playerReady}
        playerError={musicPlayer.playerError}
        tracks={musicPlayer.tracks}
        onTrackSelect={musicPlayer.handleTrackSelect}
        onClose={musicPlayer.handleClosePlayer}
        onMinimizeToggle={musicPlayer.handleMinimizeToggle}
        onPlayerReady={musicPlayer.handlePlayerReady}
        onPlayerPlay={musicPlayer.handlePlayerPlay}
        onPlayerPause={musicPlayer.handlePlayerPause}
        onPlayerEnded={musicPlayer.handlePlayerEnded}
        onPlayerError={musicPlayer.handlePlayerError}
        onSearchClick={musicPlayer.handleSearchClick}
      />

      <MusicBrowser
        isOpen={musicPlayer.showSearchPanel}
        onTrackSelect={musicPlayer.handleTrackSelect}
        onClose={() => {
          musicPlayer.setShowSearchPanel(false);
          // Refresh tracks after closing browser to show new additions
          window.location.reload();
        }}
      />

      <ContentModal
        selectedContent={contentModal.selectedContent}
        onClose={contentModal.closeModal}
      />

      <ConfirmDialog
        show={showConfirmDialog}
        title="Switch to 3D View?"
        message="Your changes will be applied and you'll switch to 3D viewing mode."
        onConfirm={handleConfirmSwitchTo3D}
        onCancel={handleCancelSwitch}
      />
    </div>
  );
}
