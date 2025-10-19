// Music storage utilities for user's custom music collection
export interface UserTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  embedUrl: string;
  watchUrl: string;
  icon: string;
  addedAt: string;
  genre?: string;
  isDefault?: boolean;
}

const STORAGE_KEY = 'miniverse-user-music';

// Default music tracks from the /music folder
const DEFAULT_TRACKS: Omit<UserTrack, 'id' | 'addedAt'>[] = [
  {
    title: 'Piano Classical Music',
    artist: 'Classical Collection',
    url: '/music/piano-classical-music-347514.mp3',
    embedUrl: '/music/piano-classical-music-347514.mp3',
    watchUrl: '/music/piano-classical-music-347514.mp3',
    icon: '🎹',
    genre: 'classical',
    isDefault: true
  }
];

// Get all user tracks from localStorage, including defaults if no user tracks exist
export function getUserTracks(): UserTrack[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const userTracks = stored ? JSON.parse(stored) : [];
    
    // If no user tracks exist, return default tracks
    if (userTracks.length === 0) {
      return DEFAULT_TRACKS.map(track => ({
        ...track,
        id: `default-${track.title.toLowerCase().replace(/\s+/g, '-')}`,
        addedAt: new Date().toISOString()
      }));
    }
    
    return userTracks;
  } catch (error) {
    console.error('Error loading user tracks:', error);
    // Return default tracks on error
    return DEFAULT_TRACKS.map(track => ({
      ...track,
      id: `default-${track.title.toLowerCase().replace(/\s+/g, '-')}`,
      addedAt: new Date().toISOString()
    }));
  }
}

// Save tracks to localStorage
export function saveUserTracks(tracks: UserTrack[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch (error) {
    console.error('Error saving user tracks:', error);
  }
}

// Add a new track
export function addUserTrack(track: Omit<UserTrack, 'id' | 'addedAt'>): UserTrack {
  const newTrack: UserTrack = {
    ...track,
    id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    addedAt: new Date().toISOString()
  };
  
  const existingTracks = getUserTracks();
  const updatedTracks = [...existingTracks, newTrack];
  saveUserTracks(updatedTracks);
  
  return newTrack;
}

// Remove a track
export function removeUserTrack(trackId: string): void {
  const existingTracks = getUserTracks();
  const updatedTracks = existingTracks.filter(track => track.id !== trackId);
  saveUserTracks(updatedTracks);
}

// Update a track
export function updateUserTrack(trackId: string, updates: Partial<UserTrack>): void {
  const existingTracks = getUserTracks();
  const updatedTracks = existingTracks.map(track => 
    track.id === trackId ? { ...track, ...updates } : track
  );
  saveUserTracks(updatedTracks);
}

// Convert YouTube URL to embed format
export function convertToEmbedUrl(url: string): string {
  try {
    // Clean the URL first
    const cleanUrl = url.trim();
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        const videoId = match[1];
        // Ensure we have a valid video ID (11 characters)
        if (videoId && videoId.length === 11) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    }
    
    // Check if it's already a properly formatted embed URL
    if (cleanUrl.includes('youtube.com/embed/') && cleanUrl.match(/youtube\.com\/embed\/[A-Za-z0-9_-]{11}/)) {
      return cleanUrl;
    }
    
    throw new Error('Invalid YouTube URL format');
  } catch (error) {
    throw new Error('Please enter a valid YouTube URL');
  }
}

// Validate YouTube URL
export function isValidYouTubeUrl(url: string): boolean {
  try {
    convertToEmbedUrl(url);
    return true;
  } catch {
    return false;
  }
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Convert embed URL to watch URL
export function convertEmbedToWatchUrl(embedUrl: string): string {
  try {
    if (embedUrl.includes('youtube.com/embed/')) {
      const videoIdMatch = embedUrl.match(/youtube\.com\/embed\/([^&\n?#]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
      }
    }
    return embedUrl;
  } catch {
    return embedUrl;
  }
}
