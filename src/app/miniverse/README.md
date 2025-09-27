# Miniverse - 3D Law Office Experience

A fully interactive 3D law office built with React Three Fiber, featuring realistic textures, furniture, and interactive elements. This project provides an immersive first-person experience with proximity-based interactions and modal forms.

## 🏗️ Project Structure

```
src/app/miniverse/
├── README.md                    # This documentation
├── page.tsx                     # Main application entry point (272 lines)
├── data/
│   └── store.ts                 # Zustand state management
├── utils/
│   └── textures.ts              # Procedural texture generators
└── components/
    ├── controls/                # 3D interaction controls
    ├── room/                    # Room structure components
    ├── furniture/               # Interactive furniture
    ├── decorations/             # Wall decorations and effects
    ├── modals/                  # Modal dialogs
    ├── scene/                   # Main scene components
    └── index.ts                 # Component exports
```

## 🎮 Features

### Core Functionality
- **First-Person Navigation**: WASD/Arrow keys + mouse look
- **Dual Control Modes**: FPS (Pointer Lock) + Orbit fallback
- **Proximity Interactions**: Automatic modal triggers when near interactive elements
- **Realistic 3D Environment**: PBR materials, procedural textures, lighting
- **Performance Optimized**: Adaptive quality, shadow-free rendering

### Interactive Elements
- **Legal Memo System**: Interactive paper on desk triggers memo form
- **Attorney Review Forms**: Client/attorney role selection
- **Blog Exploration**: Navigation to blog section
- **Fullscreen Support**: Immersive experience toggle

### 3D Environment
- **Room Layout**: 48x36 foot office space
- **Furniture**: Desk, chair, bookshelf, filing cabinet
- **Decorations**: Window with animated sky, wall clock, diploma
- **Lighting**: Professional office lighting with chandelier and downlights
- **Atmosphere**: Floating dust particles, procedural textures

## 🔧 Technical Architecture

### State Management (Zustand)
```typescript
interface MiniverseState {
  // Modal states
  isMemoModalOpen: boolean;
  isBlogModalOpen: boolean;
  
  // Control states
  controlsType: 'loading' | 'pointer-lock' | 'orbit';
  
  // Proximity states
  isNearPaper: boolean;
  isNearDesk: boolean;
  
  // Performance state
  dpr: number;
  
  // Actions
  openMemoModal: () => void;
  closeMemoModal: () => void;
  // ... more actions
}
```

### Component Hierarchy
```
MiniversePage (Main)
├── Canvas (Three.js)
│   ├── LawyerOfficeScene
│   │   ├── Floor
│   │   ├── Ceiling
│   │   ├── Wall (4 walls with door/window)
│   │   ├── Desk (with interactive paper)
│   │   ├── Chair
│   │   ├── Bookshelf
│   │   ├── FilingCabinet
│   │   ├── Window (animated sky)
│   │   ├── WallClock
│   │   ├── Diploma
│   │   └── DustParticles
│   ├── SpawnAtDoor
│   ├── KeyboardMovement
│   └── EnhancedControls
├── UI Overlay
│   ├── Control Instructions
│   ├── Proximity Indicators
│   └── Room Layout Map
├── IframeModal (Memo Form)
└── BlogExplorationModal
```

## 🎨 Procedural Textures

The `utils/textures.ts` file contains sophisticated procedural texture generators:

### Wall Textures
- **Plaster-like appearance** with subtle noise patterns
- **Vertical panel seams** for realistic wall construction
- **Multi-frequency noise** for natural variation
- **PBR maps**: Albedo, bump, and roughness

### Ceiling Textures
- **Softer variation** than walls
- **No seams** for continuous ceiling appearance
- **Subtle brightness variation** for realism

### Wood Textures
- **Linear grain patterns** with vertical wobble
- **Grain frequency variation** (primary/secondary)
- **Darker streaks** for natural wood appearance
- **High-resolution** (1024x512) for detailed furniture

### Fabric Textures
- **Woven pattern** simulation
- **Thread profile** with rounded cross-sections
- **Over/under weave** pattern
- **Repeating texture** with proper UV mapping

## 🎮 Controls & Interaction

### Navigation Controls
- **WASD / Arrow Keys**: Walk around office
- **Mouse**: Look around (FPS mode) or orbit (fallback mode)
- **Scroll**: Zoom in/out (orbit mode only)
- **Escape**: Unlock mouse / exit fullscreen
- **F11**: Toggle fullscreen

### Interaction System
- **Proximity Detection**: Automatic triggers when near interactive elements
- **Cooldown System**: Prevents spam triggering
- **Modal Isolation**: 3D movement disabled when modals are open
- **Pointer Lock Fallback**: Graceful degradation to orbit controls

### Room Boundaries
```typescript
const roomBounds = {
  minX: -21, maxX: 21,  // 48-foot width (walls at ±24)
  minZ: -15, maxZ: 15,  // 36-foot depth (walls at ±18)
  minY: 1.5, maxY: 3.5  // Head height for adult user
};
```

## 🎭 Interactive Elements

### Desk & Paper
- **Desk Proximity**: 2.5-unit trigger radius
- **Paper Proximity**: 1.5-unit trigger radius
- **Visual Indicators**: Glowing highlights and floating effects
- **Click Interaction**: Direct paper click also triggers modal

### Modal System
- **Iframe Isolation**: Complete separation from 3D environment
- **Dynamic Content**: JavaScript-generated form content
- **Role Selection**: Client vs Attorney workflows
- **Form Validation**: Required fields and proper submission

### Proximity Indicators
- **Real-time Feedback**: UI shows current proximity state
- **Visual Cues**: Color-coded status indicators
- **Control Instructions**: Context-aware help text

## 🎨 Visual Design

### Lighting System
- **Ambient Light**: 0.9 intensity for overall illumination
- **Hemisphere Light**: Balanced sky/ground lighting
- **Directional Light**: Window sunlight simulation
- **Point Lights**: Warm accent lighting
- **Spot Lights**: Bookshelf accent lighting
- **No Shadows**: Performance optimization

### Material System
- **PBR Materials**: Physically-based rendering
- **Procedural Textures**: Runtime-generated surfaces
- **Metalness/Roughness**: Realistic material properties
- **Color Management**: SRGB color space for accurate colors

### Performance Features
- **Adaptive Quality**: Dynamic DPR adjustment
- **Shadow-Free**: Disabled for better performance
- **Optimized Geometry**: Efficient mesh construction
- **Texture Caching**: Reused procedural textures

## 🚀 Development Guidelines

### Adding New Components

1. **Create Component File**: Place in appropriate category folder
2. **Export from Index**: Add to category's index.ts
3. **Update Main Export**: Add to components/index.ts
4. **Use in Scene**: Import and use in LawyerOfficeScene.tsx

### State Management

```typescript
// Access state
const { isMemoModalOpen, openMemoModal } = useMiniverseStore();

// Update state
setIsMemoModalOpen(true);
// or use action methods
openMemoModal();
```

### Texture Development

```typescript
// Create new texture generator
export function generateNewTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  // Implementation...
}
```

### Proximity Detection

```typescript
<ProximityDetector 
  position={[x, y, z]}
  triggerDistance={2.0}
  onTrigger={() => openModal()}
  onProximityChange={setIsNear}
  cooldownMs={3000}
/>
```

## 🔍 Troubleshooting

### Common Issues

1. **Pointer Lock Not Working**
   - Check HTTPS/localhost requirement
   - Verify user interaction before enabling
   - Fallback to orbit controls is automatic

2. **Performance Issues**
   - Reduce DPR in PerformanceMonitor
   - Check for excessive geometry
   - Monitor texture memory usage

3. **Modal Not Opening**
   - Check proximity detection settings
   - Verify state management
   - Ensure proper event handling

### Debug Tools

- **Console Logs**: Control state changes logged
- **UI Indicators**: Real-time proximity feedback
- **Performance Monitor**: Automatic quality adjustment

## 📝 Future Enhancements

### Planned Features
- **Audio System**: Ambient sounds and interaction feedback
- **More Interactions**: Additional clickable objects
- **Animation System**: Smooth transitions and movements
- **Multiplayer Support**: Shared office experience
- **VR Support**: Virtual reality compatibility

### Optimization Opportunities
- **LOD System**: Level-of-detail for distant objects
- **Instanced Rendering**: Multiple similar objects
- **Texture Atlasing**: Combine multiple textures
- **Geometry Optimization**: Reduce polygon count

## 🎯 Key Files for Context

### Essential Files
- `page.tsx`: Main application entry point
- `data/store.ts`: State management configuration
- `components/scene/LawyerOfficeScene.tsx`: Main 3D scene
- `components/controls/EnhancedControls.tsx`: Control system
- `utils/textures.ts`: Procedural texture system

### Component Categories
- **Controls**: User input and camera management
- **Room**: Structural elements (walls, floor, ceiling)
- **Furniture**: Interactive objects and decorations
- **Modals**: UI overlays and forms
- **Scene**: High-level scene composition

## 🤝 Contributing

When working with this codebase:

1. **Follow Component Structure**: Use existing patterns for new components
2. **Maintain State Management**: Use Zustand store for all state
3. **Optimize Performance**: Consider rendering impact of changes
4. **Test Interactions**: Verify proximity detection and modal behavior
5. **Document Changes**: Update this README for significant modifications

This documentation provides comprehensive context for understanding and extending the Miniverse 3D law office experience.
