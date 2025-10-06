# Quainton Law Miniverse

A 3D interactive virtual office environment built with React Three Fiber, showcasing the Quainton Law firm's digital presence.

## Features

### 🏢 Interactive 3D Office
- **Immersive Environment**: Full 3D office space with realistic lighting and shadows
- **Interactive Objects**: Click on various office elements to explore content
- **Smooth Navigation**: WASD/Arrow key movement with mouse/touch rotation

### 🎮 Controls
- **Movement**: WASD keys or Arrow keys
- **Camera Rotation**: Mouse drag or touch gestures
- **Interaction**: Click on objects to explore content
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

### 🎨 Visual Enhancements
- **Realistic Lighting**: Multiple light sources with shadows
- **Atmospheric Effects**: Fog and ambient lighting
- **Enhanced Materials**: Metallic and textured surfaces
- **Professional Aesthetics**: Law firm-appropriate color scheme

## Technical Implementation

### Architecture
- **React Three Fiber**: 3D rendering and scene management
- **TypeScript**: Type-safe development
- **Canvas Textures**: Dynamic text generation for labels
- **Event Handling**: Click interactions and keyboard controls

### Performance Optimizations
- **Suspense Loading**: Lazy loading of 3D components
- **Efficient Rendering**: Optimized geometry and materials
- **Memory Management**: Proper cleanup of audio and event listeners

### Interactive System
- **Object Detection**: Click-based interaction system
- **Modal System**: Content display in overlay modals
- **State Management**: React hooks for UI state
- **Audio Management**: HTML5 Audio API integration

## Content Integration

### External Links
- **YouTube Integration**: Direct video access
- **Google Drive**: Document and resource sharing
- **ArXiv**: Research paper access
- **Imgur**: Image gallery integration

### Customizable Elements
- **Text Labels**: All signage is dynamically generated
- **Content URLs**: Easily configurable external links
- **Audio Tracks**: Replaceable background music
- **Color Schemes**: Customizable material colors

## Development

### Setup
```bash
npm install
npm run dev
```

### File Structure
```
src/app/miniverse/
├── page.tsx          # Main component with all 3D scene
└── README.md         # This documentation
```

### Key Components
- **OfficeScene**: Main 3D scene with all interactive elements
- **CameraRig**: Camera controls and movement system
- **Interactive Objects**: Clickable 3D elements
- **Audio System**: Background music and sound effects

### Customization
- **Branding**: Update text textures for firm branding
- **Content**: Modify external links and resources
- **Audio**: Replace audio files in public/images/
- **Colors**: Adjust material colors and lighting

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: Touch controls for mobile devices
- **WebGL Required**: 3D rendering capability needed

## Performance Notes
- **Recommended**: Modern GPU for optimal performance
- **Fallback**: Graceful degradation for older devices
- **Loading**: Progressive loading of 3D assets

---

*Built with ❤️ for Quainton Law - Transforming legal practice through immersive digital experiences.*