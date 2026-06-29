# Arcade Chase - Arcade Collector Game

A modern, full-stack arcade-style game built with TypeScript, React, and Express. Play, collect, compete, and unlock power-ups in this fast-paced arcade experience that works on web, mobile, and as a Progressive Web App (PWA).

## Project Statistics

### Language Composition
- TypeScript: 75.9% (Primary language)
- JavaScript: 11.8%
- HTML: 8.9%
- CSS: 3.4%

### Repository Information
- Total Size: ~15.9 MB
- Repository ID: 1003114359
- Created: June 16, 2025
- Last Updated: June 29, 2025
- Owner: noahkhetani
- Default Branch: main

## Overview

Arcade Collector is a browser-based arcade-style collectible game where players control a character to collect items while avoiding obstacles. The game features retro aesthetic, progressive difficulty, power-up systems, and cross-platform support. Built with React, TypeScript, and Express, it runs on web, mobile (Expo), as a PWA, and Chrome extension.

## System Architecture

### Frontend Architecture
- Framework: React 18 with TypeScript
- Styling: Tailwind CSS with custom game-specific styles
- State Management: Zustand for game state, audio, and high scores
- 3D Graphics: React Three Fiber and Drei
- UI Components: Radix UI components with custom styling
- Build Tool: Vite with custom configuration for game assets

### Backend Architecture
- Server: Express.js with TypeScript
- Development: Hot reload with Vite integration
- Storage: In-memory storage with interface for future database integration
- API: RESTful endpoints for leaderboard and user data
- Database: PostgreSQL via Neon with Drizzle ORM

### Game Engine
- Rendering: HTML5 Canvas with 2D context
- Physics: Custom collision detection and movement systems
- Entity System: Modular game objects (Player, Collectibles, Obstacles, PowerUps)
- Particle Effects: Custom particle system for visual feedback
- Audio: Web Audio API integration with procedural sound synthesis

## Key Features

### Core Gameplay
- Fast-paced arcade action with smooth 60fps gameplay
- Collectible-based scoring system with rarity distribution
  - Common items: 40%, 15 points
  - Rare items: 40%, 50 points
  - Epic items: 20%, 125 points
- Progressive difficulty levels with dynamic scaling
- Combo system for chaining collectibles with multiplier rewards
- Level progression based on player score
- Persistent high score tracking across sessions

### Power-Up System
- Shield (Green): 5 seconds of invincibility
- Magnet (Purple): Attracts collectibles automatically
- Double Score (Orange): 2x points for 8 seconds

### Multi-Platform Support
- Web Application: Full-featured browser experience
- Mobile App: Native Android/iOS with Expo
- PWA: Progressive Web App with offline functionality
- Chrome Extension: Fully standalone browser extension version

### Enhanced Features
- Real-time high score tracking and persistent leaderboard
- Offline gameplay support with local storage fallback
- User authentication system with account management
- Combo multiplier system with visual feedback
- Enhanced visual effects (particle explosions, screen shake, animations)
- Haptic feedback on mobile devices
- Cheat code system with GUI menu (Passcode: 7456660641)
- Advanced difficulty progression with entity scaling
- Settings modal with 20 configurable options
- Import/export functionality for game settings
- FPS counter with performance monitoring
- Background ambient music and dynamic soundscapes
- Procedural sound synthesis for all game effects

### Cheat Categories
- Movement: Speed variations, enhanced mobility
- Size: Player and collectible size modifications
- Scoring: Multiplier effects, auto-collect functionality
- Survival: God mode, infinite lives, shields
- Gameplay: Rainbow mode, altered obstacle behavior

## Technology Stack

### Frontend
- React 18.3.1
- TypeScript 5.6.3
- Vite 5.4.15
- Tailwind CSS 3.4.14
- Zustand for state management
- Radix UI component library
- Framer Motion for animations
- GSAP for advanced animations

### 3D/Graphics
- Three.js for 3D capabilities
- React Three Fiber and Drei
- Pixi.js for 2D graphics
- Matter.js for physics
- OGL for WebGL rendering

### Backend
- Express 4.21.2
- Node.js with ESM modules
- PostgreSQL via Neon
- Drizzle ORM for database management
- Passport.js for authentication
- bcryptjs for password hashing
- express-session for session management

### Mobile
- Expo 49.0.0
- React Native 0.72.6
- AsyncStorage for local persistence
- EAS Build for APK generation

### PWA
- Service workers for offline functionality
- Web Manifest for installability
- Wake Lock API for screen control
- Push Notifications API
- Background Sync API

### Development Tools
- esbuild for bundling
- tsx for TypeScript execution
- Drizzle Kit for database migrations
- PostCSS with Autoprefixer

### UI/UX Libraries
- Shadcn/ui for styled components
- Lucide React for icons
- React Query for data fetching
- React Hook Form for form handling
- Sonner for toast notifications
- React Confetti for celebration effects

### Audio
- Howler.js for audio management
- Web Audio API for procedural synthesis
- Dynamic soundscape generator

## Project Structure

```
arcade-chase/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── lib/                    # Utility functions
│   │   ├── hooks/                  # Custom React hooks
│   │   └── App.tsx                 # Main app component
│   └── index.html                  # HTML entry point
├── server/                          # Backend Express server
│   ├── index.ts                    # Server entry point
│   ├── routes/                     # API routes
│   ├── db/                         # Database setup
│   └── services/                   # Business logic
├── shared/                          # Shared types and utilities
├── mobile-app/                      # React Native mobile app
├── chrome-extension/                # Browser extension version
├── migrations/                      # Database migrations
├── public/                          # Static assets
├── dist/                            # Production build output
├── BUILD_APK_GUIDE.md              # Mobile build instructions
├── DEPLOYMENT_STATUS.md            # Deployment information
├── MOBILE_SETUP_GUIDE.md           # Mobile setup guide
├── COLLECTIBLE_RARITY_GUIDE.md     # Rarity system documentation
├── GAME_DIFFICULTY_AND_PWA_REPORT.md # Difficulty and PWA features
├── PWA_TEST_STATUS.md              # PWA testing results
├── package.json                    # Root dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── drizzle.config.ts               # Drizzle ORM configuration
└── replit.md                        # Replit deployment guide
```

## Game Engine Components

### Core Classes
- GameEngine: Core game loop and entity management
- Player: Player character with movement and collision detection
- Collectible: Collectible items with parity-based rarity
- Obstacle: Moving obstacles with bounce physics and procedural design
- PowerUp: Special items providing temporary abilities
- ParticleSystem: Visual effects for game events
- ScreenShake: Camera shake effects for impact feedback

### State Management
- useGame: Core game state (score, level, lives, power-ups)
- useAudio: Audio control and sound effect management
- useHighScore: Persistent high score storage using localStorage

### UI Components
- GameCanvas: Main game rendering component
- StartScreen: Game introduction with authentication
- GameOverScreen: End game statistics and restart
- TouchControls: Mobile-friendly touch input system
- GameUI: HUD elements (score, lives, power-ups)
- LoadingScreen: Animated loading transitions
- SettingsModal: 20-setting configuration system
- LeaderboardScreen: Top scores display with hall of fame

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager
- Git for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/noahkhetani/arcade-chase.git
cd arcade-chase

# Install root dependencies
npm install

# Create environment file
touch .env
# Add your DATABASE_URL and other config variables
```

### Development

#### Web Development
```bash
npm run dev
# Server runs on http://localhost:5000
```

#### Mobile Development
```bash
cd mobile-app
npm install
npm start
# Follow Expo CLI prompts for iOS/Android/web
```

#### Type Checking
```bash
npm run check
```

### Building

#### Web Build
```bash
npm run build
# Creates optimized production build in dist/
```

#### Production Start
```bash
npm start
# Runs production build on port 5000
```

#### Database Migrations
```bash
npm run db:push
# Applies pending database schema changes
```

#### Mobile APK Build
```bash
cd mobile-app
npm install -g eas-cli
eas login
eas build -p android --profile preview
# Creates standalone APK file
```

## Documentation

- BUILD_APK_GUIDE.md: Step-by-step APK building instructions
- MOBILE_SETUP_GUIDE.md: Mobile app setup and configuration
- DEPLOYMENT_STEPS.md: Production deployment procedures
- DEPLOYMENT_STATUS.md: Current deployment status
- COLLECTIBLE_RARITY_GUIDE.md: Collectible rarity system details
- GAME_DIFFICULTY_AND_PWA_REPORT.md: Game difficulty and PWA features
- PWA_TEST_STATUS.md: Progressive Web App testing results
- replit.md: Replit deployment and architecture guide

## Data Flow

1. Game Initialization: Canvas setup, game engine creation, input binding
2. Game Loop: Update entities, check collisions, render frame, request next frame
3. State Updates: Game events trigger Zustand state changes
4. Audio Feedback: State changes trigger appropriate sound effects
5. Persistence: High scores and settings saved to localStorage/database
6. Leaderboard: Top scores synced with PostgreSQL database

## User Authentication

The game includes a comprehensive authentication system:
- Registration with password hashing (bcryptjs)
- Login with session management (Passport.js)
- Account management interface
- Persistent user accounts across sessions
- User-specific high score tracking

## Difficulty System

Dynamic difficulty scaling based on score:
- Entity size scaling: Smaller collectibles and player, larger obstacles
- Spawn rate increases: More entities spawn as score increases
- Entity limits: Progressively more obstacles on screen
- Power-up scarcity: Fewer power-ups available at higher scores
- Reduced player advantages: Diminishing benefit from power-ups

## Cheat System

Access cheat menu with passcode: 7456660641 (press '8' during gameplay)

Available cheats across 5 categories:
- Movement: Speed boost, flight mode
- Size: Player sizing, collectible sizing
- Scoring: 2x/4x multipliers, auto-collect with enhanced range
- Survival: God mode, infinite lives, permanent shield
- Gameplay: Rainbow mode (all elements affected), inverted controls

## Mobile Optimizations

- 60fps gameplay with RequestAnimationFrame
- Haptic feedback for collisions and power-ups
- Enhanced touch controls with momentum and friction
- Auto-pause when app goes to background
- Portrait orientation lock for consistent experience
- Offline-first architecture with AsyncStorage
- Local high score storage with sync capability

## PWA Features

- Complete offline gameplay without internet
- Installable on home screen (iOS/Android)
- Service worker for caching and offline support
- Web Manifest for installability
- App update prompts and background sync
- Push notifications with permission management
- Splash screen with launch animation
- Wake Lock API to prevent screen sleep

## Deployment

### Development Environment
- Local Server: npm run dev starts both frontend and backend
- Hot Reload: Vite middleware for instant updates
- Port: Server runs on port 5000

### Production Deployment
- Build Process: Vite builds frontend, esbuild bundles backend
- Deployment Target: Replit autoscale deployment
- Asset Handling: Static files served from dist/public
- Environment: NODE_ENV=production for optimization

### Replit Configuration
- Runtime: Node.js 20 with Nix package management
- Auto-deployment: Configured for seamless deployment
- Port Mapping: Internal port 5000 mapped to external port 80

## Performance

### Optimizations
- RequestAnimationFrame for smooth rendering
- Efficient collision detection with optimized distance calculations
- Smart spawning system that scales with device performance
- Memory management for collectibles and obstacles
- Hardware acceleration with proper transform properties
- Particle system batching for efficient rendering
- Canvas-based rendering for optimal performance

### Performance Metrics
- Target: 60 FPS gameplay
- Particle limit: 500 active particles
- Entity limit: Scales with device capability
- Canvas resolution: Adaptive based on screen size

## Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npm run check
```

### APK Build Failures
```bash
# Clear Expo cache
expo r -c

# Reinstall dependencies in mobile-app
cd mobile-app
rm -rf node_modules
npm install
```

### Mobile Installation Issues
1. Enable "Install Unknown Apps" in Android settings
2. Check Android version compatibility (5.0+)
3. Ensure sufficient storage space (50+ MB)

### PWA Issues
1. Check browser DevTools Application tab for service worker
2. Clear browser cache and site data
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Development Workflow

### Recommended Commands
```bash
# Development
npm run dev              # Start dev server with hot reload
npm run check            # Check TypeScript errors

# Building
npm run build            # Production build
npm start                # Start production server

# Database
npm run db:push          # Apply migrations
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14+)
- Mobile browsers: Full PWA support

## Recent Enhancements

- Completely rebuilt Chrome extension with full feature parity
- Comprehensive cheat system matching web version
- Advanced difficulty progression system
- Modern glass-morphism homepage design
- Dynamic soundscape generator with procedural synthesis
- Import/export settings functionality
- FPS counter improvements with 1% lows tracking
- Touch manipulation CSS for improved mobile compatibility
- 20-setting configuration system across 5 categories
- Comprehensive PWA implementation with offline support

## License

MIT License - See package.json for details

## Support

For detailed setup instructions, refer to the documentation:
- Mobile issues: See MOBILE_SETUP_GUIDE.md
- Building APKs: See BUILD_APK_GUIDE.md
- Deployment: See DEPLOYMENT_STEPS.md
- PWA features: See GAME_DIFFICULTY_AND_PWA_REPORT.md

---

Play, Collect, Compete!
