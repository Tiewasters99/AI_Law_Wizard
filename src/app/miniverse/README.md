# Quainton Law Miniverse

A 3D interactive virtual office environment built with React Three Fiber, showcasing the Quainton Law firm's digital presence. Now featuring a modular, maintainable architecture with separated components and custom hooks.

## Features

### 🏢 Interactive 3D Office
- **Immersive Environment**: Full 3D office space with realistic lighting and shadows
- **Interactive Objects**: Click on various office elements to explore content
- **Smooth Navigation**: WASD/Arrow key movement with mouse/touch rotation
- **Dual View Modes**: 3D immersive view and 2D floor plan editor

### 🎮 Controls
- **Movement**: WASD keys or Arrow keys
- **Camera Rotation**: Q/E keys for rotation
- **Interaction**: Click on objects to explore content
- **Help Toggle**: Press 'H' to show/hide controls
- **Audio Controls**: Built-in music player with volume control

### 🎯 Interactive Elements

#### Front Wall Features
- **Firm Videos**: Access to featured video content
- **Our Wall**: Client testimonials and featured cases
- **Firm Artwork**: Gallery of firm artwork and displays

#### Conference Table
- **Interactive Items**: Leave Review, Our Website, Other Sites, Pro Bono
- **Professional Setup**: 10-person conference table with chairs

#### Library & Resources
- **Bookshelf**: 25+ interactive books with legal resources
- **Legal Materials**: Access to legal documents and resources
- **Idea Vault**: Coming soon - capture and save thoughts

#### Reception Area
- **Desk Items**: Engagement Letters, Firm Brochure, NDAs
- **Branding**: Quainton Law Miniverse branding

#### Right Wall Features
- **Artwork Display**: Professional artwork showcase
- **Personal Images**: Personal gallery section
- **Certificates**: Professional certificates and achievements

#### Profiles Wall
- **Team Profiles**: 6 interactive profile panels
- **Professional Showcase**: Team member information and credentials

### 🎵 Audio Features
- **Music Player**: Built-in audio player with multiple tracks
- **Volume Control**: Adjustable volume slider
- **Track Selection**: Multiple background music options
- **Play/Pause/Stop**: Full audio controls
- **YouTube Integration**: Direct video streaming

### 🎨 Visual Enhancements
- **Realistic Lighting**: Multiple light sources with shadows
- **Atmospheric Effects**: Fog and ambient lighting
- **Enhanced Materials**: Metallic and textured surfaces
- **Professional Aesthetics**: Law firm-appropriate color scheme
- **Glassmorphic UI**: Modern glassmorphic design elements

## Technical Implementation

### 🏗️ Modular Architecture
- **Component Separation**: 3D scene, UI, and business logic separated
- **Custom Hooks**: State management through specialized hooks
- **Type Safety**: Full TypeScript implementation with shared types
- **Performance**: Optimized rendering with React.memo and useCallback

### 📁 File Structure
```
src/app/components/miniverse/
├── 3d/                    # 3D Scene Components
│   ├── OfficeScene.tsx   # Main scene orchestrator
│   ├── Lighting.tsx      # Lighting system
│   ├── RoomStructure.tsx # Room geometry
│   ├── WallPanels.tsx    # Interactive panels
│   ├── Furniture.tsx     # Furniture objects
│   ├── Decorations.tsx   # Decorative elements
│   ├── Chair.tsx         # Chair component
│   ├── CameraRig.tsx    # Camera controls
│   ├── LampManager.tsx  # Lamp state management
│   ├── SceneContent.tsx # Scene content wrapper
│   ├── types.ts         # Shared type definitions
│   └── index.ts         # Clean exports
├── ui/                   # UI Components
│   ├── HelpPanel.tsx     # Help interface
│   ├── MusicPlayer.tsx   # Music player
│   ├── MusicTrackSelector.tsx # Track selection
│   ├── ContentModal.tsx # Content display
│   ├── ControlButtons.tsx # Control buttons
│   └── ConfirmDialog.tsx # Confirmation dialogs
├── hooks/                # Custom Hooks
│   ├── useMusicPlayer.ts # Music player state
│   ├── useContentModal.ts # Modal state
│   ├── useKeyboardControls.ts # Keyboard handling
│   └── useObjectInteraction.ts # Object interactions
├── utils/                # Utilities
│   ├── textureHelpers.ts # Text texture generation
│   └── constants.ts      # Application constants
├── FloorPlanView.tsx     # 2D floor plan editor
└── MiniverseEditor.tsx   # Scene editor
```

### 🎯 Key Components

#### 3D Scene Components
- **OfficeScene**: Main orchestrator (25 lines vs 107 lines)
- **Lighting**: Comprehensive lighting system
- **RoomStructure**: Floor, walls, ceiling geometry
- **WallPanels**: Interactive wall elements
- **Furniture**: Conference table, chairs, bookshelf
- **Decorations**: Books, lamps, plants, receptionist

#### UI Components
- **HelpPanel**: Glassmorphic help interface
- **MusicPlayer**: Full-featured audio player
- **ContentModal**: Dynamic content display
- **ControlButtons**: Floating control interface

#### Custom Hooks
- **useMusicPlayer**: Music player state and controls
- **useContentModal**: Modal state management
- **useKeyboardControls**: Keyboard event handling
- **useObjectInteraction**: Object click handling

### 🔧 State Management
- **Zustand Store**: Global state for view mode and configuration
- **Custom Hooks**: Local state management for specific features
- **Type Safety**: Shared types across all components
- **Performance**: Optimized re-renders and memory usage

### 🚀 Performance Optimizations
- **Component Separation**: Reduced bundle size and improved tree-shaking
- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Optimized event handlers
- **Lazy Loading**: Dynamic imports for heavy components
- **Memory Management**: Proper cleanup of audio and event listeners

## Content Integration

### External Links
- **YouTube Integration**: Direct video access with ReactPlayer
- **Google Drive**: Document and resource sharing
- **ArXiv**: Research paper access
- **Imgur**: Image gallery integration

### Customizable Elements
- **Text Labels**: All signage is dynamically generated
- **Content URLs**: Easily configurable external links
- **Audio Tracks**: Replaceable background music
- **Color Schemes**: Customizable material colors
- **Scene Configuration**: Editable through Zustand store

## Development

### Setup
```bash
npm install
npm run dev
```

### Key Benefits of New Architecture
- **Maintainability**: Each component has single responsibility
- **Testability**: Individual components can be unit tested
- **Scalability**: Easy to add new features and components
- **Type Safety**: Comprehensive TypeScript coverage
- **Performance**: Optimized rendering and state management

### Customization
- **Branding**: Update text textures in `textureHelpers.ts`
- **Content**: Modify external links in `constants.ts`
- **Audio**: Replace audio files and update track list
- **Colors**: Adjust material colors in component files
- **Scene**: Edit configuration through Zustand store

### Adding New Features
1. **3D Objects**: Add to appropriate component in `3d/` folder
2. **UI Elements**: Create new component in `ui/` folder
3. **State Logic**: Create custom hook in `hooks/` folder
4. **Utilities**: Add helper functions in `utils/` folder

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: Touch controls for mobile devices
- **WebGL Required**: 3D rendering capability needed

## Performance Notes
- **Recommended**: Modern GPU for optimal performance
- **Fallback**: Graceful degradation for older devices
- **Loading**: Progressive loading of 3D assets
- **Memory**: Efficient component separation reduces memory usage

## Architecture Benefits

### Before Refactoring
- **Single File**: 1472 lines in one component
- **Hard to Maintain**: All logic mixed together
- **Performance Issues**: Unnecessary re-renders
- **Testing Difficult**: Monolithic structure

### After Refactoring
- **Modular**: 142 lines main component + separated modules
- **Maintainable**: Clear separation of concerns
- **Performant**: Optimized rendering and state management
- **Testable**: Individual components can be tested
- **Scalable**: Easy to add new features

---

*Built with ❤️ for Quainton Law - Transforming legal practice through immersive digital experiences with modern, maintainable architecture.*