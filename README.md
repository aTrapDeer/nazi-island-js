# Nazi Island

A 3D first-person shooter game built with Three.js where you defend an island against waves of Nazi soldiers.

![Nazi Island Game](screenshot.png)

## Overview

Nazi Island is a browser-based 3D shooter where players must survive increasingly difficult waves of enemies. The game features:

- First-person shooter mechanics
- Wave-based enemy spawning system
- Ammo management with pickup system
- Detailed 3D models for characters and environment
- Score tracking and wave progression

## How to Play

1. Simply open the `index.html` file in a web browser to start the game.
2. Move around the island using WASD or arrow keys.
3. Aim with your mouse cursor.
4. Click to shoot or press Space bar.
5. Collect ammo boxes dropped by defeated enemies.
6. Survive as many waves as possible!

## Controls

- **W/A/S/D or Arrow Keys**: Move character
- **Mouse**: Aim
- **Left Click or Space**: Shoot
- **Escape**: Pause game (if implemented)

## Game Mechanics

- **Waves**: Enemies spawn in waves. Each wave increases in difficulty with more enemies and higher health/speed.
- **Ammo**: You start with limited ammo. Enemies have a 30% chance to drop ammo boxes when defeated.
- **Health**: Your health decreases when enemies get close. Game ends when health reaches zero.
- **Score**: Earn points for each enemy defeated. Higher waves give more points per kill.

## Project Structure

The project now uses a modular structure for better code organization:

```
nazi-island/
├── index.html            # Main HTML file
├── game.js               # Main game controller
├── README.md             # This documentation
├── modules/              # Game modules
│   ├── gameState.js      # Game state management
│   ├── island.js         # Island and environment creation
│   ├── player.js         # Player character and controls
│   ├── enemies.js        # Enemy generation and AI
│   └── projectiles.js    # Bullet and ammo pickup systems
```

## Technical Details

### Technologies Used

- **Three.js**: 3D rendering library for creating and displaying the game world
- **JavaScript ES6**: Modern JavaScript with module support
- **HTML5/CSS3**: For page structure and styling

### Development

The game uses ES6 modules to separate concerns and organize code. Each module handles a specific aspect of the game:

- `gameState.js`: Manages game variables like score, health, ammo, and wave number
- `island.js`: Creates the island terrain, water, and environmental details
- `player.js`: Handles player model, movement, and camera controls
- `enemies.js`: Creates enemy models, spawning logic, and AI movement
- `projectiles.js`: Manages bullets, muzzle effects, and ammo pickups

To modify the game:

1. Edit individual module files to change specific behaviors
2. Update constants in `game.js` to adjust game balance
3. Modify `index.html` to change the UI or add new features

## Credits

This game was created as a demonstration of Three.js capabilities. All assets are programmatically generated.

## Recent Updates

### Project Modularization (Feb 27, 2023)

The codebase has been reorganized into a modular structure for better maintainability:

- Created a `modules` directory containing specialized components:
  - `gameState.js` - Manages game variables like score, health, ammo
  - `player.js` - Handles player model, movement, and aiming
  - `enemies.js` - Controls enemy creation, AI, and wave spawning
  - `projectiles.js` - Manages bullets, weapons, and ammo pickups 
  - `island.js` - Creates the island environment and terrain

### Orientation Fixes

- Fixed character orientation issues 
- Weapons now correctly appear in front of characters
- Models properly face the direction of movement/aim
- Improved third-person camera positioning

### Visual Improvements

- Enhanced player and enemy models with more details
- Added backpacks, better helmets, and improved weapon models
- Enhanced projectile visuals with brass casings and bullet tips
- Added muzzle flash effects when shooting
