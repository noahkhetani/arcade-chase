# Arcade Collector Chrome Extension

A complete offline version of the Arcade Collector game that runs as a Chrome/Brave browser extension.

## Features

- **Fully Offline**: Works without internet connection after installation
- **Enhanced Collectible System**: 40% rare, 20% epic spawn rates with improved rewards
- **Local High Score Storage**: Persistent scores using Chrome storage API
- **Optimized Performance**: 800x600 game window with 60fps gameplay
- **Complete Game Experience**: All features from the web version

## Installation

1. Download and extract the extension package
2. Open Chrome/Brave and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the "chrome-extension" folder
5. The game icon will appear in your extensions toolbar

## Collectible System

### Rarity Distribution
- **Common (40%)**: Cyan items, 15 points
- **Rare (40%)**: Purple items, 50 points, sparkle effects
- **Epic (20%)**: Gold items, 125 points, maximum visual effects

### Combo System
- Chain collections within 1 second for multipliers
- Up to 4x combo multiplier
- Dramatically increases scoring potential

## Controls

- **WASD** or **Arrow Keys**: Move
- **P**: Pause/unpause
- **ESC**: Return to main menu (when paused)

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Storage**: Chrome storage API with localStorage fallback
- **Performance**: Canvas-based rendering with optimized game loop
- **Compatibility**: Chrome 88+ and Brave browser

## Offline Functionality

The extension is designed to work completely offline:

1. **No Network Requests**: All game assets are bundled
2. **Local Storage**: High scores saved locally
3. **Self-Contained**: No external dependencies
4. **Instant Loading**: Fast startup from extension popup

## Version History

- **v1.0.0**: Initial release with enhanced collectible system
  - Improved spawn rates for rare and epic items
  - Enhanced visual effects and particle systems
  - Optimized for offline play
  - Chrome storage integration

Enjoy playing Arcade Collector offline in your browser!