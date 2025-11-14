import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Track } from "../hooks/useMusicPlayer";
import { AudioPlayer } from "./AudioPlayer";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-800/40 animate-pulse rounded-lg" />
  ),
}) as any;

interface MusicPlayerProps {
  isPlayerOpen: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMinimized: boolean;
  playerReady: boolean;
  playerError: string | null;
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  onClose: () => void;
  onMinimizeToggle: () => void;
  onPlayerReady: () => void;
  onPlayerPlay: () => void;
  onPlayerPause: () => void;
  onPlayerEnded: () => void;
  onPlayerError: (e: any) => void;
  onSearchClick?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlayerOpen,
  currentTrack,
  isPlaying,
  volume,
  isMinimized,
  playerReady,
  playerError,
  tracks,
  onTrackSelect,
  onClose,
  onMinimizeToggle,
  onPlayerReady,
  onPlayerPlay,
  onPlayerPause,
  onPlayerEnded,
  onPlayerError,
  onSearchClick,
}) => {
  const [isClient, setIsClient] = useState(false);

  const handleClientReady = useCallback(() => {
    setIsClient(true);
  }, []);

  const handlePlayerReady = useCallback(() => {
    console.log("Player ready - YouTube controls active");
    onPlayerReady();
  }, [onPlayerReady]);

  const handlePlayerPlay = useCallback(() => {
    console.log("Video playing");
    onPlayerPlay();
  }, [onPlayerPlay]);

  const handlePlayerPause = useCallback(() => {
    console.log("Video paused");
    onPlayerPause();
  }, [onPlayerPause]);

  const handlePlayerEnded = useCallback(() => {
    console.log("Video ended");
    onPlayerEnded();
  }, [onPlayerEnded]);

  const handlePlayerError = useCallback(
    (e: any) => {
      console.error("Player error:", e);
      // Check if it's a YouTube embed error
      const isEmbedError = currentTrack?.url.includes("youtube.com/embed/");
      const errorMessage = isEmbedError
        ? "YouTube embed failed. The video may not allow embedding or may be restricted. Try using the watch URL instead."
        : "Failed to load audio/video. Try a different track or check the file.";
      onPlayerError(errorMessage);
    },
    [currentTrack?.url, onPlayerError]
  );

  const handlePlayerLoad = useCallback(() => {
    console.log("Video loaded successfully");
  }, []);

  const handleAudioReady = useCallback(() => {
    console.log("Audio player ready");
    onPlayerReady();
  }, [onPlayerReady]);

  const handleAudioPlay = useCallback(() => {
    console.log("Audio playing");
    onPlayerPlay();
  }, [onPlayerPlay]);

  const handleAudioPause = useCallback(() => {
    console.log("Audio paused");
    onPlayerPause();
  }, [onPlayerPause]);

  const handleAudioEnded = useCallback(() => {
    console.log("Audio ended");
    onPlayerEnded();
  }, [onPlayerEnded]);

  const handleAudioError = useCallback(
    (error: string) => {
      console.error("Audio player error:", error);
      onPlayerError(error);
    },
    [onPlayerError]
  );

  const handleAudioLoad = useCallback(() => {
    console.log("Audio loaded successfully");
  }, []);

  const handleTrackSelect = useCallback(
    (track: Track) => {
      onTrackSelect(track);
    },
    [onTrackSelect]
  );

  const handleRetryError = useCallback(() => {
    onPlayerError(null);
  }, [onPlayerError]);

  useEffect(() => {
    handleClientReady();
  }, [handleClientReady]);

  if (!isPlayerOpen || !currentTrack) return null;

  // Check if the track is a local audio file
  const isLocalAudio =
    currentTrack.url.startsWith("/music/") && currentTrack.url.endsWith(".mp3");

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${isMinimized ? "w-64" : "w-80"}`}
    >
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 border border-slate-400/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-blue-900/20 to-slate-800/20"></div>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-600/40">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{currentTrack.icon}</span>
              <h4 className="text-sm font-semibold text-white">
                {currentTrack.title}
              </h4>
            </div>
            <div className="flex items-center space-x-1">
              {onSearchClick && (
                <button
                  onClick={onSearchClick}
                  className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-blue-600/30 border border-blue-400/30 hover:bg-blue-600/40 transition-all duration-300"
                  title="Manage Music Library"
                >
                  <span className="text-white text-xs">🎵</span>
                </button>
              )}
              <button
                onClick={onMinimizeToggle}
                className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                <span className="text-white text-xs">
                  {isMinimized ? "▢" : "▬"}
                </span>
              </button>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-md bg-slate-700/30 border border-slate-400/30 hover:bg-slate-600/40 transition-all duration-300 group"
              >
                <span className="text-white text-sm font-light group-hover:rotate-90 transition-transform duration-300">
                  ×
                </span>
              </button>
            </div>
          </div>

          {/* Video Player Container */}
          <div className={`relative ${isMinimized ? "hidden" : "block"}`}>
            <div
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ paddingTop: "56.25%" }}
            >
              {/* Loading indicator */}
              {!playerReady && !playerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                  <div className="text-white text-sm flex items-center space-x-2 mb-2">
                    <div className="animate-spin">⏳</div>
                    <span>Loading player...</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {currentTrack.title} - {currentTrack.icon}
                  </div>
                </div>
              )}

              {/* Error indicator */}
              {playerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10 p-4">
                  <div className="text-red-400 text-sm mb-3 text-center">
                    {playerError}
                  </div>
                  <div className="space-y-2">
                    {!isLocalAudio &&
                      currentTrack.watchUrl &&
                      currentTrack.watchUrl.includes("youtube.com") && (
                        <a
                          href={currentTrack.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 text-center"
                        >
                          Open in YouTube
                        </a>
                      )}
                    {isLocalAudio && (
                      <div className="text-xs text-gray-400 text-center mb-2">
                        Make sure the MP3 file exists in /public/music/
                      </div>
                    )}
                    <button
                      onClick={handleRetryError}
                      className="block bg-gray-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              <div className="absolute top-0 left-0 w-full h-full">
                {!isClient && (
                  <div className="w-full h-full bg-slate-800/40 animate-pulse rounded-lg flex items-center justify-center">
                    <div className="text-white text-sm">Loading player...</div>
                  </div>
                )}
                {isClient &&
                  currentTrack &&
                  (isLocalAudio ? (
                    <AudioPlayer
                      src={currentTrack.url}
                      title={currentTrack.title}
                      onReady={handleAudioReady}
                      onPlay={handleAudioPlay}
                      onPause={handleAudioPause}
                      onEnded={handleAudioEnded}
                      onError={handleAudioError}
                      onLoad={handleAudioLoad}
                    />
                  ) : (
                    <ReactPlayer
                      key={currentTrack.embedUrl || currentTrack.url}
                      url={currentTrack.embedUrl || currentTrack.url}
                      width="100%"
                      height="100%"
                      controls={true}
                      light={false}
                      pip={false}
                      playing={false}
                      config={{
                        youtube: {
                          playerVars: {
                            autoplay: 0,
                            controls: 1,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            fs: 1,
                            enablejsapi: 1,
                            iv_load_policy: 3,
                            cc_load_policy: 0,
                            playsinline: 1,
                            start: 0,
                            origin:
                              typeof window !== "undefined"
                                ? window.location.origin
                                : undefined,
                            widget_referrer:
                              typeof window !== "undefined"
                                ? window.location.href
                                : undefined,
                          },
                        },
                        file: {
                          attributes: {
                            controlsList: "nodownload",
                          },
                        },
                      }}
                      onReady={handlePlayerReady}
                      onStart={handlePlayerPlay}
                      onPlay={handlePlayerPlay}
                      onPause={handlePlayerPause}
                      onEnded={handlePlayerEnded}
                      onError={handlePlayerError}
                      onLoad={handlePlayerLoad}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 space-y-3">
            {/* Info */}
            <div className="text-xs text-gray-400 text-center bg-slate-800/30 rounded-lg p-2">
              {isLocalAudio
                ? "Use audio controls to play/pause"
                : "Use player controls to play/pause"}
            </div>

            {/* Track List */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-300">My Music</p>
              </div>
              <div className="space-y-1">
                {tracks.length > 0 ? (
                  tracks.map(track => (
                    <button
                      key={track.title}
                      onClick={() => handleTrackSelect(track)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                        currentTrack.title === track.title
                          ? "bg-blue-500/40 border border-blue-400/40 text-white"
                          : "bg-slate-700/30 border border-slate-600/30 text-gray-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{track.icon}</span>
                        <span>{track.title}</span>
                        {currentTrack.title === track.title && isPlaying && (
                          <span className="ml-auto">♪</span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <div className="text-2xl mb-2">🎵</div>
                    <p className="text-xs text-gray-400 mb-2">
                      No music added yet
                    </p>
                    <p className="text-xs text-gray-500">
                      Use library button in header to add music
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
