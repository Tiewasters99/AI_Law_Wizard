import { useState, useCallback, useEffect, useMemo } from "react";
import { getUserTracks } from "../utils/musicStorage";

export interface Track {
  url: string;
  title: string;
  icon: string;
  embedUrl?: string;
  watchUrl?: string;
}

export interface MusicPlayerState {
  isPlayerOpen: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMinimized: boolean;
  playerReady: boolean;
  playerError: string | null;
  showMusicPanel: boolean;
  showSearchPanel: boolean;
}

export interface MusicPlayerActions {
  handleTrackSelect: (track: Track) => void;
  handlePlayPause: () => void;
  handleVolumeChange: (newVolume: number) => void;
  handleClosePlayer: () => void;
  handleMinimizeToggle: () => void;
  handlePlayerReady: () => void;
  handlePlayerPlay: () => void;
  handlePlayerPause: () => void;
  handlePlayerEnded: () => void;
  handlePlayerError: (e: any) => void;
  setShowMusicPanel: (show: boolean) => void;
  setShowSearchPanel: (show: boolean) => void;
  handleSearchClick: () => void;
}

export function useMusicPlayer() {
  // State
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Memoized tracks from user's collection
  const tracks = useMemo<Track[]>(() => {
    const userTracks = getUserTracks();
    return userTracks.map(track => ({
      // Use watchUrl for ReactPlayer, fallback to embedUrl
      url: track.watchUrl || track.embedUrl,
      title: track.title,
      icon: track.icon,
      embedUrl: track.embedUrl,
      watchUrl: track.watchUrl,
    }));
  }, []);

  // Debug effect for tracking player state
  useEffect(() => {
    if (currentTrack) {
      console.log(
        "Current track changed:",
        currentTrack.title,
        currentTrack.url
      );
      console.log(
        "Player state - Open:",
        isPlayerOpen,
        "Ready:",
        playerReady,
        "Playing:",
        isPlaying
      );
    }
  }, [currentTrack, isPlayerOpen, playerReady, isPlaying]);

  // Handlers
  const handleTrackSelect = useCallback(
    (track: Track) => {
      // Reset error state
      setPlayerError(null);

      // If switching tracks, pause first then switch
      if (currentTrack && currentTrack.url !== track.url) {
        setIsPlaying(false);
        setPlayerReady(false);
        setTimeout(() => {
          setCurrentTrack(track);
          setIsPlayerOpen(true);
          setShowMusicPanel(false);
          setIsMinimized(false);
        }, 100);
      } else {
        // New track
        setCurrentTrack(track);
        setIsPlayerOpen(true);
        setShowMusicPanel(false);
        setIsMinimized(false);
        setPlayerReady(false);
      }
    },
    [currentTrack]
  );

  const handlePlayPause = useCallback(() => {
    if (playerReady) {
      setIsPlaying(prev => !prev);
    }
  }, [playerReady]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setIsPlaying(false);
    setPlayerReady(false);
    setTimeout(() => {
      setIsPlayerOpen(false);
      setCurrentTrack(null);
      setShowMusicPanel(false);
    }, 100);
  }, []);

  const handleMinimizeToggle = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const handlePlayerReady = useCallback(() => {
    console.log("Player ready - callback fired!");
    setPlayerReady(true);
    // Don't auto-play - let user click play button
    // YouTube may block autoplay without user interaction
  }, []);

  const handlePlayerPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePlayerPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePlayerEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePlayerError = useCallback((e: any) => {
    console.error("Player error:", e);
    setPlayerError(
      "Failed to load video. Video may have embedding restrictions."
    );
    // Set ready anyway so user can try to interact
    setPlayerReady(true);
  }, []);

  const handleSearchClick = useCallback(() => {
    setShowSearchPanel(true);
  }, []);

  const refreshTracks = useCallback(() => {
    // Force re-render of tracks by updating a dependency
    setShowSearchPanel(prev => prev);
  }, []);

  // Fallback: Set player ready after timeout if callback doesn't fire
  useEffect(() => {
    if (currentTrack && isPlayerOpen && !playerReady) {
      const timeout = setTimeout(() => {
        console.log("Fallback: Setting player ready after 2 seconds");
        setPlayerReady(true);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [currentTrack, isPlayerOpen, playerReady]);

  return {
    // State
    isPlayerOpen,
    currentTrack,
    isPlaying,
    volume,
    isMinimized,
    playerReady,
    playerError,
    showMusicPanel,
    showSearchPanel,
    tracks,

    // Actions
    handleTrackSelect,
    handlePlayPause,
    handleVolumeChange,
    handleClosePlayer,
    handleMinimizeToggle,
    handlePlayerReady,
    handlePlayerPlay,
    handlePlayerPause,
    handlePlayerEnded,
    handlePlayerError,
    setShowMusicPanel,
    setShowSearchPanel,
    handleSearchClick,
  };
}
