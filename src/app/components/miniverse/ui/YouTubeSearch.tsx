import React, { useState, useEffect, useMemo } from 'react';
import { Track } from '../hooks/useMusicPlayer';
import { 
  getUserTracks, 
  addUserTrack, 
  removeUserTrack, 
  updateUserTrack,
  convertToEmbedUrl,
  isValidYouTubeUrl,
  UserTrack 
} from '../utils/musicStorage';

interface MusicBrowserProps {
  onTrackSelect: (track: Track) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const MusicBrowser: React.FC<MusicBrowserProps> = ({
  onTrackSelect,
  onClose,
  isOpen
}) => {
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackIcon, setNewTrackIcon] = useState('🎵');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load user tracks on component mount
  useEffect(() => {
    if (isOpen) {
      setUserTracks(getUserTracks());
    }
  }, [isOpen]);

  // Filter tracks based on search query
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return userTracks;
    
    const query = searchQuery.toLowerCase();
    return userTracks.filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.genre?.toLowerCase().includes(query)
    );
  }, [userTracks, searchQuery]);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAdding(true);

    try {
      // Validate URL or file path
      const isYouTubeUrl = isValidYouTubeUrl(newTrackUrl);
      const isLocalFile = newTrackUrl.startsWith('/music/') && newTrackUrl.endsWith('.mp3');
      
      if (!isYouTubeUrl && !isLocalFile) {
        throw new Error('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID) or local file path (e.g., /music/file.mp3)');
      }

      // Validate required fields
      if (!newTrackTitle.trim()) {
        throw new Error('Please enter a title for the track');
      }

      if (!newTrackArtist.trim()) {
        throw new Error('Please enter an artist name');
      }

      // Handle URL conversion based on type
      let embedUrl: string;
      let watchUrl: string;
      
      if (isYouTubeUrl) {
        embedUrl = convertToEmbedUrl(newTrackUrl);
        
        // Convert to watch URL for ReactPlayer compatibility
        if (newTrackUrl.includes('youtube.com/embed/')) {
          // Extract video ID from embed URL and create watch URL
          const videoIdMatch = newTrackUrl.match(/youtube\.com\/embed\/([^&\n?#]+)/);
          if (videoIdMatch && videoIdMatch[1]) {
            watchUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
            console.log('Converted embed URL to watch URL:', newTrackUrl, '->', watchUrl);
          } else {
            watchUrl = newTrackUrl;
          }
        } else {
          watchUrl = newTrackUrl;
        }
      } else {
        // Local file
        embedUrl = newTrackUrl;
        watchUrl = newTrackUrl;
      }

      // Create new track
      const newTrack = addUserTrack({
        title: newTrackTitle.trim(),
        artist: newTrackArtist.trim(),
        url: embedUrl,
        embedUrl,
        watchUrl,
        icon: newTrackIcon
      });

      // Update local state
      setUserTracks(prev => [...prev, newTrack]);

      // Reset form
      setNewTrackUrl('');
      setNewTrackTitle('');
      setNewTrackArtist('');
      setNewTrackIcon('🎵');
      setShowAddForm(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add track');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (confirm('Are you sure you want to remove this track?')) {
      removeUserTrack(trackId);
      setUserTracks(prev => prev.filter(track => track.id !== trackId));
    }
  };

  const handleTrackSelect = (userTrack: UserTrack) => {
    const track: Track = {
      url: userTrack.embedUrl,
      title: userTrack.title,
      icon: userTrack.icon,
      embedUrl: userTrack.embedUrl,
      watchUrl: userTrack.watchUrl
    };
    onTrackSelect(track);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setShowAddForm(false);
    setError(null);
    setNewTrackUrl('');
    setNewTrackTitle('');
    setNewTrackArtist('');
    setNewTrackIcon('🎵');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-400/40 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600/40">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎵</span>
            <h3 className="text-lg font-semibold text-white">My Music Library</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
            >
              + Add Music
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/30 hover:bg-slate-600/40 transition-all duration-300"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Add Music Form */}
        {showAddForm && (
          <div className="p-4 border-b border-slate-600/40 bg-slate-800/20">
            <form onSubmit={handleAddTrack} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-300 mb-2">YouTube URL or File Path *</label>
                  <input
                    type="text"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or /music/file.mp3"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/40 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    💡 Tip: Use watch URLs (youtube.com/watch?v=) instead of embed URLs for better compatibility
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-2">Icon</label>
                  <select
                    value={newTrackIcon}
                    onChange={(e) => setNewTrackIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="🎵">🎵 Music</option>
                    <option value="🎧">🎧 Headphones</option>
                    <option value="🎸">🎸 Guitar</option>
                    <option value="🎹">🎹 Piano</option>
                    <option value="🎷">🎷 Saxophone</option>
                    <option value="🎺">🎺 Trumpet</option>
                    <option value="🎻">🎻 Violin</option>
                    <option value="🥁">🥁 Drums</option>
                    <option value="🎤">🎤 Microphone</option>
                    <option value="🎼">🎼 Sheet Music</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    placeholder="Enter track title"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/40 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-2">Artist *</label>
                  <input
                    type="text"
                    value={newTrackArtist}
                    onChange={(e) => setNewTrackArtist(e.target.value)}
                    placeholder="Enter artist name"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/40 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  {isAdding ? 'Adding...' : 'Add Track'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-slate-600/40">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your music by title, artist, or genre..."
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {filteredTracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-slate-700/30 border border-slate-600/30 rounded-lg overflow-hidden hover:bg-slate-700/50 transition-all duration-300 group"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-2xl">{track.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {track.title}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTrack(track.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove track"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Added:</span>
                        <span className="text-gray-300">
                          {new Date(track.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleTrackSelect(track)}
                      className="w-full px-3 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 hover:text-white text-xs rounded-lg transition-colors"
                    >
                      Play Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h4 className="text-lg font-medium text-white mb-2">No Music Added Yet</h4>
              <p className="text-gray-400 mb-4">Add YouTube URLs or local MP3 files to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Your First Track
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-600/40 bg-slate-800/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>🎵 Add YouTube URLs or local MP3 files to your Miniverse library</span>
            <span>{filteredTracks.length} tracks in your library</span>
          </div>
        </div>
      </div>
    </div>
  );
};
