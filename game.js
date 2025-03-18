// Import Three.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Import our modules
import { createIsland } from './modules/island.js';
import { createPlayer, updatePlayerPosition, triggerShootAnimation, updatePlayerWeapon } from './modules/player.js';
import { createEnemy, spawnWave, updateEnemies, triggerEnemyHitAnimation, dismemberEnemyPart, triggerEnemyDeathAnimation, updateBoats, createEnemyDrops } from './modules/enemies.js';
import { createProjectile, createAmmoPickup, updateProjectiles, updateAmmoPickups, createMuzzleFlash, createEnemyProjectile } from './modules/projectiles.js';
import { GameState } from './modules/gameState.js';
import { WEAPONS, AMMO_TYPES, WEAPON_CONFIG, createWeaponPickup, createMP41AmmoPickup, updateWeaponPickups, updateMP41AmmoPickups } from './modules/weapons.js';

// Game constants
const ISLAND_RADIUS = 50;
const ENEMY_SPAWN_RADIUS = 40;
const MAX_ENEMIES = 20;
const BASE_ENEMY_HEALTH = 2;
const BASE_ENEMY_SPEED = 0.15;
const PLAYER_DAMAGE = 1;
const MOVEMENT_SPEED = 0.15;
const AMMO_DROP_CHANCE = 0.4; // 40% chance of ammo drop on enemy kill
const AMMO_DROP_AMOUNT = 10;
const AUTO_FIRE_RATE = 200; // Time between shots in milliseconds
const HEADSHOT_SCORE_BONUS = 50; // Bonus score for headshots
const DISMEMBERMENT_CHANCE = 0.7; // Chance of dismemberment on hit (70%)

// FPS capping constants
const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastFrameTime = 0;

// Main game setup
let scene, camera, renderer, controls;
let gameState;
let player, island;
let enemies = [];
let projectiles = [];
let enemyProjectiles = [];
let ammoPickups = [];
let weaponPickups = [];
let mp41AmmoPickups = [];
let keyState = {};
let raycaster = new THREE.Raycaster();
let groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let clock = new THREE.Clock();
let prevTime = 0;
let isMouseDown = false;
let lastFireTime = 0;
// Add recoil tracking variables
let currentRecoil = 0;
let maxRecoil = 0.1;
let recoilRecoveryRate = 0.01;
let recoilIncreasePerShot = 0.02;

// Debug options
let showBulletTracers = true; // Debug toggle for showing bullet tracers
let showDebugInfo = false; // Toggle for debug overlay

// Make keyState and gameState available globally
window.keyState = keyState;

// Performance tracking variables
let lastTime = performance.now() / 1000;
let frameCount = 0;
let lastFpsUpdate = performance.now() / 1000;
let fpsLogged = false;
let reducedEffects = false;
let fpsHistory = []; // Track recent FPS values for better decision making
let fpsHistoryMaxLength = 5; // Number of FPS samples to keep

// Shooting variables
let lastShotTime = 0;
const shootingCooldown = 100; // ms between shots

// Array to store particle effects
let particles = [];

// Initialize the game
init();
animate();

function init() {
  console.log('Initializing game...');
  
  // Initialize audio if available
  if (typeof window.gameAudio !== 'undefined') {
    window.gameAudio.initialize();
  }
  
  // Setup Three.js renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 0);
  
  // Responsive canvas
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // Initialize game state
  gameState = new GameState();
  window.gameState = gameState; // Make gameState available globally
  
  // Add debug properties to game state
  gameState.showBulletTracers = true;
  gameState.showDebugInfo = false;
  
  // Make critical functions available globally
  window.handleEnemyHit = handleEnemyHit;
  window.updateUI = updateUI;
  window.updateHealthDisplay = updateHealthDisplay;
  window.createEnemyProjectile = createEnemyProjectile;
  window.createMuzzleFlash = createMuzzleFlash;
  if (typeof playSound === 'function') {
    window.playSound = playSound;
  }
  
  // Create lighting
  setupLighting();
  
  // Create the island environment
  island = createIsland(scene);
  
  // Create player
  player = createPlayer(scene);
  
  // Setup game UI
  setupGameUI();
  
  // Setup input listeners
  setupInputListeners();
  
  // Start the first wave
  spawnNewWave();
  
  // Create debug overlay (hidden by default)
  createDebugOverlay();
}

function setupLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Directional light (sun)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 50, 0);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 150;
  dirLight.shadow.camera.left = -75;
  dirLight.shadow.camera.right = 75;
  dirLight.shadow.camera.top = 75;
  dirLight.shadow.camera.bottom = -75;
  scene.add(dirLight);
}

function setupGameUI() {
  // Create HUD elements
  const hud = document.createElement('div');
  hud.style.position = 'absolute';
  hud.style.top = '20px';
  hud.style.left = '20px';
  hud.style.color = 'white';
  hud.style.fontFamily = 'Arial, sans-serif';
  hud.style.fontSize = '18px';
  hud.style.textShadow = '2px 2px 3px rgba(0, 0, 0, 0.8)';
  hud.style.pointerEvents = 'none'; // Allows clicking through the HUD
  hud.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  hud.style.padding = '15px';
  hud.style.borderRadius = '8px';
  hud.style.minWidth = '200px';
  hud.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  hud.innerHTML = `
    <div style="margin-bottom: 8px"><span style="font-weight: bold">Score:</span> <span id="score" style="color: #ffcc00">0</span></div>
    <div style="margin-bottom: 8px"><span style="font-weight: bold">Wave:</span> <span id="wave" style="color: #ff9900">1</span></div>
    <div style="margin-bottom: 8px"><span style="font-weight: bold">Enemies:</span> <span id="enemiesRemaining" style="color: #ff5555">0</span></div>
    <div style="margin-bottom: 8px"><span style="font-weight: bold">Health:</span> <span id="health" style="color: #66ff66">100</span></div>
    <div style="margin-bottom: 8px"><span style="font-weight: bold">Ammo:</span> <span id="ammo" style="color: #99ccff">50</span></div>
    <div><span style="font-weight: bold">Weapon:</span> <span id="currentWeapon" style="color: #ffffff">M1 Garand</span> <span style="font-size: 14px; color: #aaaaaa">(Press 1-2 to switch)</span></div>
  `;
  document.body.appendChild(hud);
  
  // Add crosshair cursor
  const crosshair = document.createElement('div');
  crosshair.id = 'crosshair';
  crosshair.style.position = 'absolute';
  crosshair.style.top = '50%';
  crosshair.style.left = '50%';
  crosshair.style.transform = 'translate(-50%, -50%)';
  crosshair.style.width = '20px';
  crosshair.style.height = '20px';
  crosshair.style.pointerEvents = 'none'; // Allows clicking through the crosshair
  crosshair.style.zIndex = '100';
  
  // Create an X mark using CSS
  crosshair.innerHTML = `
    <div style="position: absolute; width: 100%; height: 2px; background-color: red; top: 50%; transform: translateY(-50%);"></div>
    <div style="position: absolute; width: 2px; height: 100%; background-color: red; left: 50%; transform: translateX(-50%);"></div>
    <div style="position: absolute; width: 6px; height: 6px; background-color: rgba(255,0,0,0.5); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
  `;
  
  document.body.appendChild(crosshair);
  
  // Game over screen
  const gameOverScreen = document.createElement('div');
  gameOverScreen.id = 'gameOverScreen';
  gameOverScreen.style.position = 'absolute';
  gameOverScreen.style.width = '100%';
  gameOverScreen.style.height = '100%';
  gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Make background even darker
  gameOverScreen.style.color = 'white';
  gameOverScreen.style.display = 'flex';
  gameOverScreen.style.flexDirection = 'column';
  gameOverScreen.style.justifyContent = 'center';
  gameOverScreen.style.alignItems = 'center';
  gameOverScreen.style.fontFamily = 'Arial, sans-serif';
  gameOverScreen.style.fontSize = '24px';
  gameOverScreen.style.zIndex = '9000'; // Higher z-index than anything else
  gameOverScreen.style.display = 'none';
  gameOverScreen.style.pointerEvents = 'auto'; // Make sure it catches clicks
  gameOverScreen.innerHTML = `
    <h1 style="font-size: 48px; margin-bottom: 20px; color: #ff0000; text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);">GAME OVER</h1>
    <div style="font-size: 28px; margin-bottom: 10px;">Final Score: <span id="finalScore" style="color: #ffcc00;">0</span></div>
    <div style="font-size: 28px; margin-bottom: 30px;">Waves Survived: <span id="finalWave" style="color: #ffcc00;">0</span></div>
    <button id="restartButton" style="padding: 15px 30px; margin-top: 20px; font-size: 24px; cursor: pointer; background-color: #ff3333; color: white; border: none; border-radius: 5px; box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);">Restart Game</button>
  `;
  document.body.appendChild(gameOverScreen);
  
  // Restart button event listener
  document.getElementById('restartButton').addEventListener('click', restartGame);
}

/**
 * Sets up input event listeners for keyboard and mouse
 */
function setupInputListeners() {
  // Keyboard input
  document.addEventListener('keydown', (event) => {
    // Don't process key presses if game is over
    if (gameState.isGameOver) return;
    
    keyState[event.code] = true;
    
    // Handle debug toggle
    if (event.code === 'Backquote') {
      showDebugInfo = !showDebugInfo;
      gameState.showDebugInfo = showDebugInfo;
      toggleDebugOverlay(showDebugInfo);
    }
    
    // Handle weapon switching
    if (event.code === 'Digit1') {
      if (gameState.switchWeapon(WEAPONS.M1_GARAND)) {
        updatePlayerWeapon(player, WEAPONS.M1_GARAND);
        showNotification('Switched to M1 Garand');
      }
    } else if (event.code === 'Digit2') {
      if (gameState.hasMP41 && gameState.switchWeapon(WEAPONS.MP41)) {
        updatePlayerWeapon(player, WEAPONS.MP41);
        showNotification('Switched to MP41');
      } else if (!gameState.hasMP41) {
        showNotification('You don\'t have an MP41 yet');
      }
    }
  });
  
  document.addEventListener('keyup', (event) => {
    keyState[event.code] = false;
  });
  
  // Mouse input for shooting
  document.addEventListener('mousedown', (event) => {
    if (gameState.isGameOver) return;
    
    if (event.button === 0) { // Left mouse button
      gameState.mouseDown = true;
      
      // Fire immediately
      const currentWeaponConfig = WEAPON_CONFIG[gameState.currentWeapon];
      const isAutomatic = currentWeaponConfig ? currentWeaponConfig.automatic : false;
      shoot(isAutomatic);
    }
  });
  
  document.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Left mouse button
      gameState.mouseDown = false;
    }
  });
  
  // Mouse movement for aiming
  document.addEventListener('mousemove', (event) => {
    // Calculate normalized device coordinates
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update mouse position in game state
    gameState.mousePosition = new THREE.Vector2(x, y);
  });
  
}

/**
 * Handle player's shooting based on weapon type
 * @param {boolean} isAutomatic - Whether the current weapon is automatic
 */
function shoot(isAutomatic = false) {
  // Don't shoot if game is over
  if (gameState.isGameOver) return;
  
  // Check if player has ammo
  if (gameState.getCurrentAmmo() <= 0) {
    console.log("Out of ammo!");
    return;
  }
  
  // Don't shoot too rapidly unless weapon is automatic
  const now = Date.now();
  const currentWeaponConfig = WEAPON_CONFIG[gameState.currentWeapon];
  const weaponFireRate = currentWeaponConfig ? currentWeaponConfig.fireRate : 200;
  
  if (now - lastFireTime < weaponFireRate) {
    return;
  }
  
  // Update last fire time
  lastFireTime = now;
  
  // Use ammo
  gameState.useAmmo(1);
  
  // Update UI
  updateUI();
  
  // Create raycaster for bullet path from the camera through the mouse position
  raycaster.setFromCamera(gameState.mousePosition, camera);
  
  // Get the exact position of the weapon
  const weaponGroup = player.userData.weaponGroup;
  const weaponPosition = new THREE.Vector3();
  weaponGroup.getWorldPosition(weaponPosition);
  
  // Get exact muzzle position
  const gunPosition = weaponPosition.clone();
  gunPosition.y += 0.1; // Adjust to barrel position
  
  // Get shoot direction from raycaster pointing through the mouse cursor
  const direction = raycaster.ray.direction.clone().normalize();
  
  // Add recoil to the next shot
  addRecoilEffect();
  
  // Trigger animation
  triggerShootAnimation(player);
  
  // Direct hit check for improved hit detection
  const hit = checkDirectHit(gunPosition, direction);
  if (hit && hit.object && hit.object.parent && hit.object.parent.userData && hit.object.parent.userData.isEnemy) {
    // We hit an enemy directly
    const enemy = hit.object.parent.userData.enemyObject || hit.object.userData.parentEnemy;
    const hitPoint = hit.point.clone();
    
    // Get the body part that was hit
    const hitBodyPart = hit.object.userData.bodyPart || 'body';
    
    // Call hit function with appropriate parameters
    handleEnemyHit(enemy, hitPoint, direction, hitBodyPart);
  } else {
    // No direct hit, create a projectile
    const projectile = createProjectile(scene, gunPosition, direction, !gameState.showBulletTracers);
    projectiles.push(projectile);
  }
  
  // Always create muzzle flash for visual feedback
  createMuzzleFlash(scene, gunPosition, direction);
}

// New function to check for direct hits based on cursor position
function checkDirectHit(origin, direction) {
  // Cast a ray directly from the gun in the shooting direction
  // Use separate raycaster instance to avoid interference with the main raycaster
  const shootRaycaster = new THREE.Raycaster();
  shootRaycaster.set(origin, direction);
  
  // Debug log for shooting
  console.log(`Shooting from ${origin.x.toFixed(2)}, ${origin.y.toFixed(2)}, ${origin.z.toFixed(2)} in direction ${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)}`);
  
  // Prepare a list of all meshes to check for hit detection
  const hitTargets = [];
  
  // Add all enemey meshes and their children for more accurate hit detection
  for (const enemy of enemies) {
    // Skip dead enemies
    if (enemy.isDead || enemy.health <= 0 || !enemy.object) continue;
    
    // Add the entire enemy hierarchy for hit detection
    enemy.object.traverse(function(child) {
      if (child.isMesh) {
        // Store reference back to the enemy object for hit handling
        child.userData.parentEnemy = enemy;
        hitTargets.push(child);
      }
    });
  }
  
  // If no valid targets, return early
  if (hitTargets.length === 0) {
    console.log("No valid enemies to check for hits");
    return;
  }
  
  console.log(`Checking for hits against ${hitTargets.length} meshes`);
  
  // Get intersections with all potential targets
  const intersects = shootRaycaster.intersectObjects(hitTargets, false);
  
  if (intersects.length > 0) {
    // We hit something!
    const hit = intersects[0];
    const hitObject = hit.object;
    
    console.log(`Hit detected at distance ${hit.distance.toFixed(2)}`);
    
    // Get the parent enemy from the hit object's userData
    const enemy = hitObject.userData.parentEnemy;
    
    if (enemy) {
      // Determine which body part was hit based on the mesh name or position
      let bodyPart = 'body'; // Default to body
      
      // Try to determine the body part from the mesh name
      const meshName = hitObject.name.toLowerCase();
      if (meshName.includes('head')) {
        bodyPart = 'head';
      } else if (meshName.includes('arm') && meshName.includes('left')) {
        bodyPart = 'leftArm';
      } else if (meshName.includes('arm') && meshName.includes('right')) {
        bodyPart = 'rightArm';
      } else if (meshName.includes('leg') && meshName.includes('left')) {
        bodyPart = 'leftLeg';
      } else if (meshName.includes('leg') && meshName.includes('right')) {
        bodyPart = 'rightLeg';
      } else {
        // If we can't determine from name, try to use the hit height
        const hitHeight = hit.point.y - enemy.object.position.y;
        if (hitHeight > 1.5) {
          bodyPart = 'head';
        } else if (hitHeight < 0) {
          bodyPart = Math.random() < 0.5 ? 'leftLeg' : 'rightLeg';
        } else if (Math.abs(hit.point.x - enemy.object.position.x) > 0.4) {
          bodyPart = hit.point.x > enemy.object.position.x ? 'rightArm' : 'leftArm';
        }
      }
      
      console.log(`Hit enemy at part: ${bodyPart}`);
      
      // Return the hit information
      return hit;
    } else {
      console.log("Hit object has no parent enemy reference");
    }
  } else {
    console.log("No direct hits detected");
  }
  
  // Return undefined if no hit was found
  return undefined;
}

/**
 * Checks if an object is a child of another object
 * @param {THREE.Object3D} child - The potential child object
 * @param {THREE.Object3D} parent - The potential parent object
 * @returns {boolean} True if child is a descendant of parent
 */
function isChildOf(child, parent) {
  // Check if the object is a direct child
  if (parent.children.includes(child)) {
    return true;
  }
  
  // Recursively check all children
  for (const childObject of parent.children) {
    if (isChildOf(child, childObject)) {
      return true;
    }
  }
  
  return false;
}

// Add recoil effect to camera
function addRecoilEffect() {
  // Enhanced camera shake with more realistic recoil
  const recoilAmount = 0.05 + (currentRecoil * 0.5); // Base recoil + additional based on accumulated recoil
  const originalPosition = camera.position.clone();
  
  // Apply immediate recoil - more vertical than horizontal
  camera.position.y -= recoilAmount * 0.7;
  camera.position.z += recoilAmount * 0.3; // Slight backward push
  
  // Add slight random horizontal shake
  camera.position.x += (Math.random() - 0.5) * recoilAmount * 0.4;
  
  // Recover from recoil after a short delay
  setTimeout(() => {
    camera.position.copy(originalPosition);
  }, 100);
}

function spawnNewWave() {
  // Clear any remaining enemies
  for (const enemy of enemies) {
    if (enemy.object) {
      scene.remove(enemy.object);
    }
  }
  enemies = [];
  
  // Increment wave and update difficulty
  gameState.nextWave();
  
  // Show wave announcement before spawning enemies
  showWaveAnnouncement(gameState.wave, () => {
    // After animation completes, spawn the enemies
    const newEnemies = spawnWave(
      scene, 
      gameState.wave, 
      MAX_ENEMIES, 
      ENEMY_SPAWN_RADIUS, 
      BASE_ENEMY_HEALTH, 
      BASE_ENEMY_SPEED
    );
    
    // Add all new enemies to the array
    enemies.push(...newEnemies);
    
    // Set the initial enemy count for this wave
    gameState.enemiesRemainingInWave = enemies.length;
    console.log(`Wave ${gameState.wave} started with ${gameState.enemiesRemainingInWave} enemies`);
    
    // Mark wave as active
    gameState.isWaveActive = true;
  });
  
  // Update UI
  updateUI();
}

/**
 * Shows a wave announcement
 * @param {number} waveNumber - The wave number
 * @param {Function} callback - Function to call when animation completes
 */
function showWaveAnnouncement(waveNumber, callback) {
  console.log(`Showing wave ${waveNumber} announcement`);
  
  // Create announcement container
  const container = document.createElement('div');
  container.id = 'waveAnnouncement';
  container.style.position = 'absolute';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.color = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '48px';
  container.style.fontWeight = 'bold';
  container.style.textAlign = 'center';
  container.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.5s ease-in-out';
  container.style.zIndex = '1000';
  container.style.pointerEvents = 'none';
  
  // Create wave text
  const waveText = document.createElement('div');
  waveText.textContent = `WAVE ${waveNumber}`;
  waveText.style.marginBottom = '10px';
  container.appendChild(waveText);
  
  // Create subtitle text
  const subtitleText = document.createElement('div');
  subtitleText.style.fontSize = '24px';
  subtitleText.style.fontWeight = 'normal';
  subtitleText.style.opacity = '0.9';
  
  // Customize subtitle based on wave number
  if (waveNumber === 1) {
    subtitleText.textContent = 'ENEMY BOATS APPROACHING THE ISLAND';
  } else if (waveNumber < 5) {
    subtitleText.textContent = `${waveNumber} NAZI BOATS SPOTTED ON THE HORIZON`;
  } else if (waveNumber < 10) {
    subtitleText.textContent = 'HEAVY REINFORCEMENTS ARRIVING BY SEA';
  } else {
    subtitleText.textContent = 'MASSIVE NAVAL INVASION FORCE INCOMING';
  }
  
  container.appendChild(subtitleText);
  
  // Add to DOM
  document.body.appendChild(container);
  
  // Animate in
  setTimeout(() => {
    container.style.opacity = '1';
    
    // Animate out after delay
    setTimeout(() => {
      container.style.opacity = '0';
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        
        // Call callback
        if (typeof callback === 'function') {
          callback();
        }
      }, 500);
    }, 2000);
  }, 100);
}

function handleEnemyHit(enemy, hitPoint, hitDirection, bodyPart) {
  // Ensure hitDirection is a Vector3
  const direction = hitDirection instanceof THREE.Vector3 ? 
    hitDirection.clone() : 
    new THREE.Vector3(0, 0, -1); // Default direction if not provided
  
  // Apply damage based on body part
  let damage = 0;
  let isHeadshot = false;
  
  // Different damage amounts for different body parts
  switch(bodyPart) {
    case 'head':
      damage = PLAYER_DAMAGE * 100; // Instant kill for headshot
      isHeadshot = true;
      showHitMarker(true); // Show red hit marker for headshot
      showHeadshotMessage(); // Show headshot message
      
      // Add 40% chance for head detachment on headshot
      if (Math.random() < 0.4) {
        console.log("Head detachment triggered by headshot!");
        // Explicitly dismember head with blood pool
        try {
          const success = dismemberEnemyPart(enemy, scene, 'head', hitPoint, direction);
          
          if (success) {
            // Get world position of the enemy for blood pool
            const worldPos = new THREE.Vector3();
            enemy.object.getWorldPosition(worldPos);
            worldPos.y = 0.02; // Place slightly above ground
            
            // Create blood pool under detached head
            window.createSmallBloodPool(scene, worldPos, 'head');
          }
        } catch (error) {
          console.error("Error during head detachment:", error);
        }
      }
      break;
    case 'body':
      damage = PLAYER_DAMAGE * 50; // High damage for body shot
      showHitMarker(false); // Show white hit marker for body shot
      break;
    case 'leftArm':
    case 'rightArm':
      damage = PLAYER_DAMAGE * 30; // Medium damage for arm shots
      showHitMarker(false);
      break;
    case 'leftLeg':
    case 'rightLeg':
      damage = PLAYER_DAMAGE * 25; // Lower damage for leg shots
      showHitMarker(false);
      break;
    default:
      damage = PLAYER_DAMAGE * 25; // Default damage
      showHitMarker(false);
  }
  
  // Debug log for hit
  console.log(`Enemy hit at ${bodyPart} for ${damage} damage. Current health: ${enemy.health}`);
  
  // Apply damage to enemy
  enemy.health -= damage;
  
  // Trigger hit animation
  triggerEnemyHitAnimation(enemy);
  
  // Check if enemy is dead
  if (enemy.health <= 0 && !enemy.isDead) {
    // Mark as dead
    enemy.isDead = true;
    // Initialize dead time tracking if not already set
    enemy.deadTime = 0;
    enemy.removalDelay = 10; // Remove after 10 seconds
    
    console.log("Enemy killed!");
    
    // Update the enemy count for the current wave
    if (gameState.enemiesRemainingInWave > 0) {
      gameState.enemiesRemainingInWave--;
      console.log(`Enemies remaining in wave: ${gameState.enemiesRemainingInWave}`);
    }
    
    // Trigger death animation
    triggerEnemyDeathAnimation(enemy, scene, isHeadshot);
    
    // Update score
    gameState.score += isHeadshot ? 150 : 100;
    updateUI();
    
    // Drop ammo with configured chance (40%)
    if (Math.random() < AMMO_DROP_CHANCE) {
      const ammoPickup = createAmmoPickup(scene, enemy.object.position.clone(), AMMO_DROP_AMOUNT);
      ammoPickups.push(ammoPickup);
      console.log(`Ammo dropped: ${AMMO_DROP_AMOUNT} rounds`);
    }
    
    // Create drops when enemy dies
    if (enemy.isDead) {
      const drops = createEnemyDrops(scene, enemy.object.position, gameState.wave, isHeadshot);
      
      // Add new pickups to arrays
      weaponPickups = weaponPickups.concat(drops.weaponPickups);
      mp41AmmoPickups = mp41AmmoPickups.concat(drops.mp41AmmoPickups);
    }
  }
  
  // Apply dismemberment with random chance (but only if not already done for head)
  if (!isHeadshot || bodyPart !== 'head') {
    if (Math.random() < DISMEMBERMENT_CHANCE) {
      try {
        const success = dismemberEnemyPart(enemy, scene, bodyPart, hitPoint, direction);
        console.log(`Dismemberment attempt for ${bodyPart}: ${success ? 'successful' : 'failed'}`);
      } catch (error) {
        console.error("Error during dismemberment:", error);
      }
    }
  }
  
  // Make the console available globally for debugging
  window.gameConsole = console;
  
  return isHeadshot;
}

/**
 * Shows a hit marker on screen when an enemy is hit
 * @param {boolean} isHeadshot - Whether the hit was a headshot
 */
function showHitMarker(isHeadshot) {
  // Create hit marker element
  const hitMarker = document.createElement('div');
  hitMarker.style.position = 'absolute';
  
  // Position at current mouse coordinates
  const mouseX = (gameState.mousePosition.x + 1) / 2 * window.innerWidth;
  const mouseY = (-gameState.mousePosition.y + 1) / 2 * window.innerHeight;
  
  hitMarker.style.top = mouseY + 'px';
  hitMarker.style.left = mouseX + 'px';
  hitMarker.style.transform = 'translate(-50%, -50%) rotate(45deg)';
  hitMarker.style.width = isHeadshot ? '30px' : '20px';
  hitMarker.style.height = isHeadshot ? '30px' : '20px';
  hitMarker.style.pointerEvents = 'none';
  hitMarker.style.zIndex = '100';
  
  // Create X mark using CSS
  const color = isHeadshot ? '#ff0000' : '#ffffff';
  hitMarker.innerHTML = `
    <div style="position: absolute; width: 100%; height: 2px; background-color: ${color}; top: 50%; transform: translateY(-50%);"></div>
    <div style="position: absolute; width: 2px; height: 100%; background-color: ${color}; left: 50%; transform: translateX(-50%);"></div>
  `;
  
  // Add to document
  document.body.appendChild(hitMarker);
  
  // Make visible immediately
  hitMarker.style.opacity = '1';
  
  // Fade out and remove
  setTimeout(() => {
    hitMarker.style.opacity = '0';
    hitMarker.style.transition = 'opacity 0.2s ease-out';
    setTimeout(() => {
      document.body.removeChild(hitMarker);
    }, 200);
  }, 100);
}

/**
 * Updates the game UI elements
 */
function updateUI() {
  // Update score
  document.getElementById('score').textContent = gameState.score;
  
  // Update wave
  document.getElementById('wave').textContent = gameState.wave;
  
  // Update enemies remaining
  document.getElementById('enemiesRemaining').textContent = gameState.enemiesRemainingInWave;
  
  // Update health
  document.getElementById('health').textContent = gameState.health;
  
  // Update ammo display based on current weapon
  const ammoDisplay = document.getElementById('ammo');
  if (ammoDisplay) {
    // Get current weapon ammo
    const currentAmmo = gameState.getCurrentAmmo();
    
    // Set color based on ammo level
    if (currentAmmo <= 5) {
      ammoDisplay.style.color = '#ff3333'; // Red for low ammo
    } else if (currentAmmo <= 15) {
      ammoDisplay.style.color = '#ffcc00'; // Yellow for medium ammo
    } else {
      ammoDisplay.style.color = '#99ccff'; // Default blue
    }
    
    // Display weapon type along with ammo
    let ammoText = `${currentAmmo}`;
    
    // Add weapon type if it's MP41
    if (gameState.currentWeapon === WEAPONS.MP41) {
      ammoText += ' MP41';
    }
    
    ammoDisplay.textContent = ammoText;
  }
  
  // Update current weapon display
  const weaponDisplay = document.getElementById('currentWeapon');
  if (weaponDisplay) {
    let weaponName = 'M1 Garand';
    let weaponColor = '#ffffff';
    
    if (gameState.currentWeapon === WEAPONS.MP41) {
      weaponName = 'MP41';
      weaponColor = '#ff9900'; // Orange for MP41
    }
    
    weaponDisplay.textContent = weaponName;
    weaponDisplay.style.color = weaponColor;
  }
}

function showGameOver() {
  console.log("Showing game over sequence");
  
  // Set game over state immediately to prevent movement
  gameState.isGameOver = true;
  
  // Play KIA music
  if (typeof window.gameAudio !== 'undefined') {
    window.gameAudio.playKIAMusic();
  }
  
  // First create player death effect, then show killed in action screen with redeploy button
  createPlayerDeathEffect(() => {
    console.log("Death effect complete, showing KIA animation with redeploy button");
    
    // Show "Killed in Action" animation with redeploy button
    showKilledInActionAnimation();
  });
}

// Emergency function to create game over screen if it's missing
function createEmergencyGameOverScreen() {
  console.log("Creating emergency game over screen");
  
  const emergencyScreen = document.createElement('div');
  emergencyScreen.id = 'emergencyGameOverScreen';
  emergencyScreen.style.position = 'fixed';
  emergencyScreen.style.top = '0';
  emergencyScreen.style.left = '0';
  emergencyScreen.style.width = '100%';
  emergencyScreen.style.height = '100%';
  emergencyScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  emergencyScreen.style.color = 'white';
  emergencyScreen.style.display = 'flex';
  emergencyScreen.style.flexDirection = 'column';
  emergencyScreen.style.justifyContent = 'center';
  emergencyScreen.style.alignItems = 'center';
  emergencyScreen.style.fontFamily = 'Arial, sans-serif';
  emergencyScreen.style.fontSize = '28px';
  emergencyScreen.style.zIndex = '9999';
  
  emergencyScreen.innerHTML = `
    <h1 style="font-size: 48px; margin-bottom: 20px; color: #ff0000;">GAME OVER</h1>
    <div style="margin-bottom: 10px;">Final Score: <span style="color: #ffcc00;">${gameState.score}</span></div>
    <div style="margin-bottom: 30px;">Waves Survived: <span style="color: #ffcc00;">${gameState.wave}</span></div>
    <button id="emergencyRestartButton" style="padding: 15px 30px; margin-top: 20px; font-size: 24px; cursor: pointer; background-color: #ff3333; color: white; border: none; border-radius: 5px;">Restart Game</button>
  `;
  
  document.body.appendChild(emergencyScreen);
  
  // Add event listener to restart button
  document.getElementById('emergencyRestartButton').addEventListener('click', restartGame);
  
  console.log("Emergency game over screen created");
}

/**
 * Shows a dramatic "Killed in Action" text animation when player dies
 * @param {Function} callback - Function to call when animation completes
 */
function showKilledInActionAnimation(callback) {
  console.log("Starting KIA animation sequence");
  
  // Set flag to track that animation is shown
  gameState.isKilledInActionScreenShown = true;
  
  // Create container for the animation
  const container = document.createElement('div');
  container.id = 'killedInActionContainer';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  container.style.transition = 'background-color 1.5s ease-in';
  container.style.zIndex = '9000'; // Higher z-index to ensure visibility
  container.style.pointerEvents = 'none';
  
  // Create the text element
  const text = document.createElement('div');
  text.textContent = 'KILLED IN ACTION';
  text.style.color = '#ff0000';
  text.style.fontFamily = '"Impact", sans-serif';
  text.style.fontSize = '0px';
  text.style.fontWeight = 'bold';
  text.style.textShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
  text.style.transform = 'translateY(50px)';
  text.style.opacity = '0';
  text.style.transition = 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)';
  text.style.letterSpacing = '3px';
  text.style.textAlign = 'center';
  
  // Add blood splatter background
  const bloodSplatter = document.createElement('div');
  bloodSplatter.style.position = 'absolute';
  bloodSplatter.style.width = '100%';
  bloodSplatter.style.height = '100%';
  bloodSplatter.style.backgroundImage = 'radial-gradient(circle, rgba(128, 0, 0, 0.7) 0%, rgba(128, 0, 0, 0) 70%)';
  bloodSplatter.style.opacity = '0';
  bloodSplatter.style.transition = 'opacity 0.8s ease-in';
  bloodSplatter.style.zIndex = '-1';
  
  // Create stats display
  const statsContainer = document.createElement('div');
  statsContainer.id = 'deathStatsContainer';
  statsContainer.style.marginTop = '40px';
  statsContainer.style.opacity = '0';
  statsContainer.style.transition = 'opacity 1s ease-in';
  statsContainer.style.fontSize = '24px';
  statsContainer.style.color = '#ffffff';
  statsContainer.style.textAlign = 'center';
  statsContainer.innerHTML = `
    <div style="margin-bottom: 10px">Final Score: <span style="color: #ffcc00">${gameState.score}</span></div>
    <div style="margin-bottom: 20px">Waves Survived: <span style="color: #ffcc00">${gameState.wave}</span></div>
  `;
  
  // Create redeploy button
  const redeployButton = document.createElement('button');
  redeployButton.id = 'redeployButton';
  redeployButton.textContent = 'REDEPLOY';
  redeployButton.style.padding = '15px 30px';
  redeployButton.style.fontSize = '24px';
  redeployButton.style.cursor = 'pointer';
  redeployButton.style.backgroundColor = '#ff3333';
  redeployButton.style.color = 'white';
  redeployButton.style.border = 'none';
  redeployButton.style.borderRadius = '5px';
  redeployButton.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
  redeployButton.style.marginTop = '20px';
  redeployButton.style.opacity = '0';
  redeployButton.style.transition = 'opacity 1s ease-in, transform 0.2s ease-in-out';
  redeployButton.style.transform = 'scale(1)';
  redeployButton.addEventListener('click', restartGame);
  redeployButton.addEventListener('mouseenter', () => {
    redeployButton.style.transform = 'scale(1.05)';
  });
  redeployButton.addEventListener('mouseleave', () => {
    redeployButton.style.transform = 'scale(1)';
  });
  
  // Add elements to the DOM
  container.appendChild(bloodSplatter);
  container.appendChild(text);
  container.appendChild(statsContainer);
  container.appendChild(redeployButton);
  document.body.appendChild(container);

  // Set a failsafe timer
  const FAILSAFE_TIMER = 8000; // 8 seconds max for animation
  let animationCompleted = false;
  
  const completeAnimation = () => {
    if (animationCompleted) return; // Prevent multiple executions
    animationCompleted = true;
    
    console.log("KIA animation completing, showing redeploy button");
    
    // Make container accept pointer events for button clicks
    container.style.pointerEvents = 'auto';
    
    // Show the stats and redeploy button
    statsContainer.style.opacity = '1';
    redeployButton.style.opacity = '1';
    
    // Remove body shake
    document.body.style.animation = '';
  };
  
  // Set failsafe timer
  const failsafeTimer = setTimeout(completeAnimation, FAILSAFE_TIMER);
  
  // Animation sequence
  setTimeout(() => {
    // Darken background
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    
    // Show blood splatter
    bloodSplatter.style.opacity = '1';
    console.log("KIA animation: background darkened, blood splatter visible");
    
    // Start text animation after slight delay
    setTimeout(() => {
      // Animate text
      text.style.fontSize = '80px';
      text.style.transform = 'translateY(0)';
      text.style.opacity = '1';
      console.log("KIA animation: text animation started");
      
      // Add screen shake effect
      document.body.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
      
      // Add shake keyframes if not already added
      if (!document.getElementById('shakeAnimation')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'shakeAnimation';
        styleSheet.textContent = `
          @keyframes shake {
            10%, 90% { transform: translate3d(-2px, 0, 0); }
            20%, 80% { transform: translate3d(4px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
            40%, 60% { transform: translate3d(8px, 0, 0); }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      
      // Wait for text animation to complete, then show redeploy button
      setTimeout(() => {
        // Keep text visible but show the redeploy button
        clearTimeout(failsafeTimer); // Clear failsafe timer
        completeAnimation(); // Show redeploy button
      }, 2000);
    }, 500);
  }, 100);
}

function restartGame() {
  console.log("Restarting game...");
  
  // Play gameplay music
  if (typeof window.gameAudio !== 'undefined') {
    window.gameAudio.playGameplayMusic();
  }
  
  // Reset game state
  gameState.reset();
  gameState.isPlayerDeathAnimationPlayed = false;
  gameState.isKilledInActionScreenShown = false;
  
  // Clean up all UI overlays that might be present
  const overlaysToRemove = [
    'gameOverScreen', 
    'emergencyGameOverScreen',
    'killedInActionContainer',
    'hitEffect',
    'waveAnnouncement',
    'waveCompletedMessage',
    'deathStatsContainer',
    'redeployButton'
  ];
  
  overlaysToRemove.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'gameOverScreen') {
        // Just hide the game over screen, don't remove it
        element.style.display = 'none';
        console.log("Game over screen hidden");
      } else if (id === 'killedInActionContainer') {
        // Make sure to remove the entire KIA container which contains the redeploy button
        try {
          element.parentNode.removeChild(element);
          console.log("Removed KIA container");
        } catch (e) {
          console.error(`Error removing ${id}:`, e);
        }
      } else {
        // Remove other overlay elements completely
        try {
          element.parentNode.removeChild(element);
          console.log(`Removed UI element: ${id}`);
        } catch (e) {
          console.error(`Error removing ${id}:`, e);
        }
      }
    }
  });
  
  // Clear existing objects
  for (const enemy of enemies) {
    if (enemy.object) scene.remove(enemy.object);
  }
  for (const projectile of projectiles) {
    if (projectile.object) scene.remove(projectile.object);
  }
  for (const pickup of ammoPickups) {
    if (pickup.object) scene.remove(pickup.object);
  }
  
  // Reset arrays
  enemies = [];
  projectiles = [];
  enemyProjectiles = []; // Also clear enemy projectiles
  ammoPickups = [];
  
  // Show player model again
  if (player) {
    player.visible = true;
    console.log("Player model restored");
  }
  
  // Start first wave
  spawnNewWave();
  
  // Update UI
  updateUI();
  
  console.log("Game restarted successfully");
}

// Animation loop
function animate(time) {
  // Request next frame immediately, but we'll only update/render if enough time has passed
  requestAnimationFrame(animate);
  
  // Check if we should skip this frame (FPS cap)
  const now = performance.now();
  const elapsed = now - lastFrameTime;
  
  // Only update and render if enough time has passed (enforce 60 FPS cap)
  if (elapsed >= FRAME_INTERVAL) {
    // Adjust lastFrameTime to account for any potential drift
    lastFrameTime = now - (elapsed % FRAME_INTERVAL);
    
    // Calculate delta time
    const currentTime = now / 1000; // Convert to seconds
    const deltaTime = Math.min(0.1, currentTime - lastTime); // Cap at 0.1 to prevent large jumps
    lastTime = currentTime;
    
    // Check if player died this frame
    if (gameState.health <= 0 && !gameState.isGameOver) {
      // Player just died - trigger game over
      showGameOver();
      gameState.isGameOver = true; // Set immediately to prevent movement
      return; // Skip the rest of the update
    }
    
    // Update player position only if not game over
    if (!gameState.isGameOver) {
      // Update player position based on keyboard input
      updatePlayerPosition(player, camera, deltaTime);
    }
    
    // Performance optimization: Track FPS more accurately
    frameCount++;
    const elapsedTime = currentTime - lastFpsUpdate;
    
    if (elapsedTime >= 1.0) { // Update FPS counter every second
      const fps = Math.round(frameCount / elapsedTime);
      frameCount = 0;
      lastFpsUpdate = currentTime;
      
      // Add to FPS history
      fpsHistory.push(fps);
      if (fpsHistory.length > fpsHistoryMaxLength) {
        fpsHistory.shift(); // Remove oldest entry
      }
      
      // Calculate average FPS from history
      const avgFps = fpsHistory.reduce((sum, value) => sum + value, 0) / fpsHistory.length;
      
      // Log FPS every 5 seconds for debugging
      if (Math.floor(currentTime) % 5 === 0 && !fpsLogged) {
        console.log(`Current FPS: ${fps}, Average FPS: ${avgFps.toFixed(1)}`);
        fpsLogged = true;
      } else if (Math.floor(currentTime) % 5 !== 0) {
        fpsLogged = false;
      }
      
      // If average FPS is critically low, reduce visual effects
      if (avgFps < 25) {
        if (!gameState.reducedEffects) {
          console.log("Performance mode activated: Reducing visual effects");
          gameState.reducedEffects = true;
        }
      } else if (avgFps > 40 && gameState.reducedEffects) {
        console.log("Performance mode deactivated: Restoring visual effects");
        gameState.reducedEffects = false;
      }
    }
    
    // Handle auto-firing
    if (gameState.autoFire && gameState.mouseDown) {
      const currentTime = performance.now();
      if (currentTime - lastShotTime > shootingCooldown) {
        shoot();
        lastShotTime = currentTime;
      }
    }
    
    // Recover from recoil when not firing
    if (performance.now() - lastShotTime > 200) {
      if (currentRecoil > 0) {
        currentRecoil = Math.max(0, currentRecoil - (deltaTime * 2)); // Recover faster
      }
    }
    
    // Update enemies
    if (gameState.isPlaying && !gameState.isGameOver) {
      // Get player position for enemy updates
      const playerPosition = camera.position.clone();
      
      // Update boats
      updateBoats(scene, deltaTime);
      
      // Update enemy positions with shooting behavior
      updateEnemies(enemies, playerPosition, deltaTime, scene, enemyProjectiles);
      
      // Update enemy projectiles
      enemyProjectiles = updateEnemyProjectiles(enemyProjectiles, camera.position, deltaTime, scene);
      
      // Check if wave is complete based on the enemy counter
      if (gameState.isWaveActive && gameState.enemiesRemainingInWave === 0) {
        console.log("Wave completed! All enemies defeated.");
        gameState.isWaveActive = false;
        
        // Show wave completed message
        showWaveCompletedMessage(gameState.wave);
        
        // Wait a moment before starting the next wave
        setTimeout(() => {
          spawnNewWave();
        }, 3000);
      }
    }
    
    // Update projectiles with the new hit detection
    projectiles = updateProjectiles(projectiles, enemies, scene, deltaTime);
    
    // Update ammo pickups
    ammoPickups = updateAmmoPickups(ammoPickups, player, scene, (amount) => {
      // Callback when ammo is collected
      gameState.addAmmo(amount);
      
      // Play pickup sound (if available)
      console.log(`Picked up ${amount} ammo!`);
      
      // Show ammo pickup message
      showAmmoPickupMessage(amount);
      
      // Update UI
      updateUI();
    });
    
    // Update weapon pickups
    if (weaponPickups.length > 0) {
      weaponPickups = updateWeaponPickups(weaponPickups, player, scene, handleWeaponCollected, keyState);
    }
    
    // Update MP41 ammo pickups
    if (mp41AmmoPickups.length > 0) {
      mp41AmmoPickups = updateMP41AmmoPickups(mp41AmmoPickups, player, scene, handleAmmoCollected, keyState);
    }
    
    // Update particles with reduced processing for better performance
    if (!gameState.reducedEffects || frameCount % 2 === 0) {
      updateParticles(particles, deltaTime);
    }
    
    // Render the scene
    renderer.render(scene, camera);
  }
  
  // Handle auto-firing for automatic weapons
  if (gameState.mouseDown && !gameState.isGameOver) {
    const currentWeaponConfig = WEAPON_CONFIG[gameState.currentWeapon];
    if (currentWeaponConfig && currentWeaponConfig.automatic) {
      shoot(true);
    }
  }
}

/**
 * Shows a temporary headshot message on screen
 */
function showHeadshotMessage() {
  // Create headshot message element
  const headshotMsg = document.createElement('div');
  headshotMsg.textContent = 'HEADSHOT!';
  headshotMsg.style.position = 'absolute';
  headshotMsg.style.top = '50%';
  headshotMsg.style.left = '50%';
  headshotMsg.style.transform = 'translate(-50%, -50%)';
  headshotMsg.style.color = '#ff0000';
  headshotMsg.style.fontFamily = 'Arial, sans-serif';
  headshotMsg.style.fontSize = '48px';
  headshotMsg.style.fontWeight = 'bold';
  headshotMsg.style.textShadow = '2px 2px 4px #000000';
  headshotMsg.style.pointerEvents = 'none';
  headshotMsg.style.zIndex = '200';
  headshotMsg.style.opacity = '1';
  headshotMsg.style.transition = 'opacity 1s ease-out';
  
  // Add to document
  document.body.appendChild(headshotMsg);
  
  // Fade out and remove after animation
  setTimeout(() => {
    headshotMsg.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(headshotMsg);
    }, 1000);
  }, 1000);
}

function updateHealthDisplay() {
  const healthElement = document.getElementById('health');
  if (healthElement) {
    healthElement.textContent = gameState.playerHealth;
    
    // Visual feedback - make health red when low
    if (gameState.playerHealth < 30) {
      healthElement.style.color = 'red';
    } else if (gameState.playerHealth < 60) {
      healthElement.style.color = 'orange';
    } else {
      healthElement.style.color = 'white';
    }
  }
}

/**
 * Updates all particle effects
 * @param {Array} particles - Array of particle objects
 * @param {number} deltaTime - Time since last frame
 */
function updateParticles(particles, deltaTime) {
  // Skip if no particles
  if (particles.length === 0) return;
  
  // Update each particle
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    // Update lifetime
    particle.lifetime -= deltaTime;
    
    // Remove if expired
    if (particle.lifetime <= 0) {
      // Remove from scene
      scene.remove(particle.object);
      particles.splice(i, 1);
      continue;
    }
    
    // Update position based on velocity
    particle.object.position.addScaledVector(particle.velocity, deltaTime);
    
    // Apply gravity if needed
    if (particle.affectedByGravity) {
      particle.velocity.y -= 9.8 * deltaTime; // Gravity
    }
    
    // Update opacity for fade out
    if (particle.material && particle.material.opacity) {
      particle.material.opacity = Math.min(1, particle.lifetime / particle.initialLifetime);
    }
    
    // Update scale if needed
    if (particle.scaleOverTime) {
      const scale = particle.initialScale * (particle.lifetime / particle.initialLifetime);
      particle.object.scale.set(scale, scale, scale);
    }
  }
}

/**
 * Shows a temporary ammo pickup message on screen
 * @param {number} amount - Amount of ammo picked up
 */
function showAmmoPickupMessage(amount) {
  // Create ammo pickup message element
  const ammoMsg = document.createElement('div');
  ammoMsg.textContent = `+${amount} AMMO`;
  ammoMsg.style.position = 'absolute';
  ammoMsg.style.bottom = '30%';
  ammoMsg.style.left = '50%';
  ammoMsg.style.transform = 'translate(-50%, 0)';
  ammoMsg.style.color = '#ffcc00';
  ammoMsg.style.fontFamily = 'Arial, sans-serif';
  ammoMsg.style.fontSize = '24px';
  ammoMsg.style.fontWeight = 'bold';
  ammoMsg.style.textShadow = '2px 2px 4px #000000';
  ammoMsg.style.pointerEvents = 'none';
  ammoMsg.style.zIndex = '200';
  ammoMsg.style.opacity = '1';
  ammoMsg.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
  
  // Add to document
  document.body.appendChild(ammoMsg);
  
  // Animate up and fade out
  setTimeout(() => {
    ammoMsg.style.opacity = '0';
    ammoMsg.style.transform = 'translate(-50%, -30px)';
    setTimeout(() => {
      document.body.removeChild(ammoMsg);
    }, 500);
  }, 1000);
}

/**
 * Shows a wave completed message
 * @param {number} waveNumber - The completed wave number
 */
function showWaveCompletedMessage(waveNumber) {
  // Apply wave completion rewards
  const rewards = gameState.restoreWaveCompletion();
  
  // Update UI after rewards
  updateUI();
  
  // Show visual effects for the rewards
  showWaveCompletionRewardEffects(rewards);
  
  // Create or get wave completed container
  let waveCompletedMessage = document.getElementById('waveCompletedMessage');
  if (!waveCompletedMessage) {
    waveCompletedMessage = document.createElement('div');
    waveCompletedMessage.id = 'waveCompletedMessage';
    waveCompletedMessage.style.position = 'absolute';
    waveCompletedMessage.style.top = '35%';
    waveCompletedMessage.style.left = '50%';
    waveCompletedMessage.style.transform = 'translate(-50%, -50%)';
    waveCompletedMessage.style.color = '#00ff00';
    waveCompletedMessage.style.fontFamily = '"Impact", sans-serif';
    waveCompletedMessage.style.fontSize = '70px';
    waveCompletedMessage.style.textShadow = '0 0 10px #000';
    waveCompletedMessage.style.opacity = '0';
    waveCompletedMessage.style.transition = 'all 0.5s ease-in-out';
    waveCompletedMessage.style.zIndex = '100';
    waveCompletedMessage.style.textAlign = 'center';
    waveCompletedMessage.style.pointerEvents = 'none';
    document.body.appendChild(waveCompletedMessage);
  }
  
  // Set text content
  waveCompletedMessage.innerHTML = `
    <div>WAVE ${waveNumber} COMPLETED!</div>
    <div style="font-size: 32px; margin-top: 20px;">All Nazis Eliminated</div>
    <div style="font-size: 28px; margin-top: 30px; color: #87CEFA;">
      <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
        <span style="color: #ff5555;">+${rewards.healthRestored} HEALTH</span>
        ${rewards.healthRestored > 0 ? '<span style="margin: 0 10px;">|</span>' : ''}
        <span style="color: #ffff55;">+${rewards.ammoRestored} AMMO</span>
      </div>
      <div style="font-size: 22px; margin-top: 5px; opacity: 0.8;">Wave Completion Bonus</div>
    </div>
  `;
  
  // Animation sequence
  setTimeout(() => {
    // Fade in
    waveCompletedMessage.style.opacity = '1';
    waveCompletedMessage.style.transform = 'translate(-50%, -50%) scale(1.1)';
    
    // Play victory sound if available
    if (window.playSound) {
      window.playSound('waveComplete');
    }
    
    setTimeout(() => {
      // Pulse effect
      waveCompletedMessage.style.transform = 'translate(-50%, -50%) scale(1.0)';
      
      // Fade out after a delay
      setTimeout(() => {
        waveCompletedMessage.style.opacity = '0';
      }, 2200); // Extended time to allow reading the rewards
    }, 300);
  }, 100);
}

/**
 * Creates visual effects for wave completion rewards
 * @param {Object} rewards - Object containing healthRestored and ammoRestored values
 */
function showWaveCompletionRewardEffects(rewards) {
  // Effect for UI elements
  const healthBar = document.getElementById('healthBar');
  const ammoCounter = document.getElementById('ammoCount');
  
  // If elements exist, add a glow effect
  if (healthBar && rewards.healthRestored > 0) {
    // Add healing glow effect to health bar
    healthBar.style.boxShadow = '0 0 15px #ff5555';
    healthBar.style.transition = 'box-shadow 0.3s ease-in-out';
    
    // Remove the effect after a delay
    setTimeout(() => {
      healthBar.style.boxShadow = 'none';
    }, 2000);
  }
  
  if (ammoCounter) {
    // Add golden glow effect to ammo counter
    ammoCounter.style.textShadow = '0 0 10px #ffff55';
    ammoCounter.style.color = '#ffffff';
    ammoCounter.style.transition = 'all 0.3s ease-in-out';
    
    // Remove the effect after a delay
    setTimeout(() => {
      ammoCounter.style.textShadow = 'none';
      ammoCounter.style.color = '';
    }, 2000);
  }
  
  // Create particle effects in the 3D scene
  
  // Health restoration particles (red)
  if (rewards.healthRestored > 0) {
    createHealingEffect(player.position);
  }
  
  // Ammo restoration effect (yellow)
  createAmmoRestorationEffect(player.position);
  
  // Play sound effect for restoration if available
  if (typeof window.gameAudio !== 'undefined') {
    if (window.gameAudio.playSound) {
      if (rewards.healthRestored > 0) {
        window.gameAudio.playSound('healing');
      }
      window.gameAudio.playSound('ammoPickup');
    }
  }
}

/**
 * Creates a healing particle effect around the player
 * @param {THREE.Vector3} position - Position to create the effect
 */
function createHealingEffect(position) {
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    // Create a sprite for the particle
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: 0xff5555, // Red color for health
        transparent: true,
        opacity: 0.8
      })
    );
    
    // Random size
    const size = 0.2 + Math.random() * 0.4;
    sprite.scale.set(size, size, size);
    
    // Position around the player in a spiral
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.5 + Math.random() * 1.5;
    const height = Math.random() * 2;
    
    sprite.position.set(
      position.x + Math.cos(angle) * radius,
      position.y + height,
      position.z + Math.sin(angle) * radius
    );
    
    // Add to scene
    scene.add(sprite);
    
    // Add to particles array for tracking
    particles.push({
      object: sprite,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        0.05 + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.05
      ),
      opacity: 0.8,
      life: 1.0,
      decay: 0.01 + Math.random() * 0.02
    });
  }
}

/**
 * Creates an ammo restoration effect around the player
 * @param {THREE.Vector3} position - Position to create the effect
 */
function createAmmoRestorationEffect(position) {
  const particleCount = 15;
  
  for (let i = 0; i < particleCount; i++) {
    // Create a sprite for the particle
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: 0xffff55, // Yellow color for ammo
        transparent: true,
        opacity: 0.8
      })
    );
    
    // Random size
    const size = 0.1 + Math.random() * 0.2;
    sprite.scale.set(size, size, size);
    
    // Position in a circular pattern around player's gun
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.3 + Math.random() * 0.7;
    
    // Offset to position near player's gun
    sprite.position.set(
      position.x + Math.cos(angle) * radius + 0.5,
      position.y + 1 + Math.random() * 0.5,
      position.z + Math.sin(angle) * radius + 0.5
    );
    
    // Add to scene
    scene.add(sprite);
    
    // Add to particles array with upward spiral movement
    particles.push({
      object: sprite,
      velocity: new THREE.Vector3(
        Math.cos(angle) * 0.03,
        0.05 + Math.random() * 0.1,
        Math.sin(angle) * 0.03
      ),
      opacity: 0.8,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03
    });
  }
}

/**
 * Updates enemy projectiles and handles player hits
 * @param {Array} projectiles - Array of projectile objects
 * @param {THREE.Vector3} playerPosition - Current player position
 * @param {number} deltaTime - Time since last frame
 * @param {THREE.Scene} scene - The scene
 * @returns {Array} - Updated projectiles array
 */
function updateEnemyProjectiles(projectiles, playerPosition, deltaTime, scene) {
  // Keep track of projectiles to keep
  const updatedProjectiles = [];
  
  // Update each projectile
  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];
    
    // Update projectile and get whether to keep it
    const shouldKeep = projectile.update(deltaTime);
    
    if (shouldKeep) {
      // First check if this projectile hits a tree
      let treeHit = false;
      
      // Create a ray for tree hit detection
      const ray = new THREE.Raycaster(
        projectile.startPoint || projectile.position,
        projectile.direction,
        0,   // Near plane
        100  // Far plane - long enough to reach across the map
      );
      
      // Check tree collisions
      scene.traverse((object) => {
        if (!treeHit && object.userData && object.userData.isTreePart && object.isMesh) {
          const intersects = ray.intersectObject(object, false);
          if (intersects.length > 0) {
            treeHit = true;
            console.log("Enemy bullet hit tree part:", object.userData);
            
            // Remove the hit tree part
            if (object.parent) {
              object.parent.remove(object);
            }
            
            // If this was the trunk, remove the whole tree
            if (object.userData.isTrunk) {
              console.log("Enemy bullet hit trunk - destroying whole tree");
              // Find the tree group (parent) and remove it
              let treeGroup = object.parent;
              while (treeGroup && !treeGroup.userData.isTree) {
                treeGroup = treeGroup.parent;
              }
              
              if (treeGroup && treeGroup.parent) {
                // Add falling effect and wood particles
                if (typeof window.createWoodParticles === 'function') {
                  window.createWoodParticles(scene, treeGroup.position.clone());
                }
                treeGroup.parent.remove(treeGroup);
              }
            } else if (object.userData.isFoliage) {
              // Create leaf particles
              if (typeof window.createLeafParticles === 'function') {
                window.createLeafParticles(scene, intersects[0].point.clone());
              }
            }
            
            // Remove the projectile
            projectile.remove(scene);
            return;
          }
        }
      });
      
      if (treeHit) {
        // Skip player hit check if we hit a tree
        continue;
      }
      
      // Check if this projectile hit the player using line segment
      let hitPlayer = false;
      
      // Check if player was hit
      if (typeof projectile.checkPlayerHit === 'function') {
        // Use checkPlayerHit method if available
        hitPlayer = projectile.checkPlayerHit(playerPosition, 0.5); // Player radius of 0.5
      } else {
        // Fallback to simplified distance check
        const playerY = 1.0; // Approximate player height for hit detection
        
        // Check distance from shot line to player
        const shotStart = projectile.startPoint || projectile.position;
        const shotEnd = projectile.endPoint || projectile.position.clone().add(projectile.direction.clone().multiplyScalar(100));
        
        // Create a vector from shot start to end
        const shotVector = new THREE.Vector3().subVectors(shotEnd, shotStart);
        const shotLength = shotVector.length();
        shotVector.normalize();
        
        // Create a vector from shot start to player
        const playerVector = new THREE.Vector3().subVectors(
          new THREE.Vector3(playerPosition.x, playerY, playerPosition.z),
          shotStart
        );
        
        // Calculate projection length
        const projectionLength = playerVector.dot(shotVector);
        
        // Only check hits if the projection is within the shot length
        if (projectionLength >= 0 && projectionLength <= shotLength) {
          // Calculate closest point on the shot line to player
          const closestPoint = new THREE.Vector3()
            .copy(shotStart)
            .add(shotVector.clone().multiplyScalar(projectionLength));
          
          // Check distance from closest point to player
          const distanceToPlayer = closestPoint.distanceTo(
            new THREE.Vector3(playerPosition.x, playerY, playerPosition.z)
          );
          
          // If close enough, count as a hit
          if (distanceToPlayer < 0.5) { // Player radius
            hitPlayer = true;
            console.log("Hit! Distance:", distanceToPlayer);
          }
        }
      }
      
      // Handle player hit
      if (hitPlayer) {
        // Player was hit!
        console.log("Player hit by enemy bullet!");
        
        // Apply damage to player
        if (gameState && !gameState.isGameOver) {
          gameState.takeDamage(2, function() {
            console.log("Player died! Showing killed in action animation");
            showGameOver();
          }); // Reduced from 5 to 2 damage per bullet hit
          updateHealthDisplay();
          
          // Show hit vignette effect
          showPlayerHitEffect();
        }
      }
      
      // Keep the projectile
      updatedProjectiles.push(projectile);
    } else {
      // Remove the projectile from the scene
      projectile.remove(scene);
    }
  }
  
  return updatedProjectiles;
}

/**
 * Shows a vignette effect when player is hit
 */
function showPlayerHitEffect() {
  // Create or get hit effect overlay
  let hitEffect = document.getElementById('hitEffect');
  if (!hitEffect) {
    hitEffect = document.createElement('div');
    hitEffect.id = 'hitEffect';
    hitEffect.style.position = 'fixed';
    hitEffect.style.top = '0';
    hitEffect.style.left = '0';
    hitEffect.style.width = '100%';
    hitEffect.style.height = '100%';
    hitEffect.style.pointerEvents = 'none';
    hitEffect.style.boxShadow = 'inset 0 0 100px rgba(255,0,0,0.8)';
    hitEffect.style.zIndex = '1000';
    hitEffect.style.opacity = '0';
    hitEffect.style.transition = 'opacity 0.5s ease-out';
    document.body.appendChild(hitEffect);
  }
  
  // Show effect
  hitEffect.style.opacity = '0.7';
  
  // Hide after a short duration
  setTimeout(() => {
    hitEffect.style.opacity = '0';
  }, 300);
}

// Helper method for linear interpolation
Math.lerp = function(a, b, t) {
  return a + (b - a) * t;
};

/**
 * Shows a temporary notification message on screen
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the message in ms
 */
function showNotification(message, duration = 2000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'absolute';
  notification.style.bottom = '20%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, 0)';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.color = '#ffffff';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.fontSize = '16px';
  notification.style.fontWeight = 'bold';
  notification.style.pointerEvents = 'none';
  notification.style.zIndex = '500';
  notification.style.opacity = '0';
  notification.style.transition = 'opacity 0.3s ease-in-out';
  
  // Add to document
  document.body.appendChild(notification);
  
  // Fade in
  setTimeout(() => {
    notification.style.opacity = '1';
    
    // Fade out and remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }, 10);
}

/**
 * Creates a debug overlay to display information about bullet trajectories
 */
function createDebugOverlay() {
  // Create debug container
  const debugContainer = document.createElement('div');
  debugContainer.id = 'debugOverlay';
  debugContainer.style.position = 'absolute';
  debugContainer.style.top = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.width = '300px';
  debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugContainer.style.color = '#00ff00';
  debugContainer.style.fontFamily = 'monospace';
  debugContainer.style.fontSize = '12px';
  debugContainer.style.padding = '10px';
  debugContainer.style.borderRadius = '5px';
  debugContainer.style.zIndex = '1000';
  debugContainer.style.display = 'none'; // Hidden by default
  debugContainer.style.pointerEvents = 'none'; // Don't block mouse clicks
  
  // Create sections for different debugging info
  debugContainer.innerHTML = `
    <div>
      <h3 style="margin: 0 0 5px 0; color: #ffffff;">SHOOTING DEBUG</h3>
      <div id="debugPlayerPos">Player: X=0.00, Y=0.00, Z=0.00</div>
      <div id="debugCameraRotation">Camera: X=0.00, Y=0.00, Z=0.00</div>
      <div id="debugLastBullet">Last Bullet: No bullet fired yet</div>
      <div id="debugBulletCount">Active Bullets: 0 (Player), 0 (Enemy)</div>
    </div>
    <div style="margin-top: 10px;">
      <h3 style="margin: 0 0 5px 0; color: #ffffff;">PERFORMANCE</h3>
      <div id="debugFPS">FPS: 0</div>
      <div id="debugEntities">Entities: 0 enemies, 0 projectiles</div>
    </div>
    <div style="margin-top: 10px;">
      <h3 style="margin: 0 0 5px 0; color: #ffffff;">CONTROLS</h3>
      <div>T - Toggle Bullet Tracers</div>
      <div>F1 - Toggle Debug Info</div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(debugContainer);
}

/**
 * Toggles the debug overlay display
 * @param {boolean} show - Whether to show or hide the overlay
 */
function toggleDebugOverlay(show) {
  const debugOverlay = document.getElementById('debugOverlay');
  if (debugOverlay) {
    debugOverlay.style.display = show ? 'block' : 'none';
  }
}

/**
 * Updates the debug overlay with the latest information
 */
function updateDebugOverlay() {
  if (!gameState.showDebugInfo) return;
  
  // Update player position
  const playerPosElem = document.getElementById('debugPlayerPos');
  if (playerPosElem && player) {
    playerPosElem.textContent = `Player: X=${player.position.x.toFixed(2)}, Y=${player.position.y.toFixed(2)}, Z=${player.position.z.toFixed(2)}`;
  }
  
  // Update camera rotation
  const cameraRotElem = document.getElementById('debugCameraRotation');
  if (cameraRotElem && camera) {
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
    cameraRotElem.textContent = `Camera: X=${(euler.x * 180/Math.PI).toFixed(2)}°, Y=${(euler.y * 180/Math.PI).toFixed(2)}°, Z=${(euler.z * 180/Math.PI).toFixed(2)}°`;
  }
  
  // Update bullet count
  const bulletCountElem = document.getElementById('debugBulletCount');
  if (bulletCountElem) {
    bulletCountElem.textContent = `Active Bullets: ${projectiles.length} (Player), ${enemyProjectiles.length} (Enemy)`;
  }
  
  // Update FPS
  const fpsElem = document.getElementById('debugFPS');
  if (fpsElem && fpsHistory.length > 0) {
    const avgFps = fpsHistory.reduce((sum, val) => sum + val, 0) / fpsHistory.length;
    fpsElem.textContent = `FPS: ${avgFps.toFixed(1)} (${fpsHistory[fpsHistory.length - 1]})`;
    
    // Color code FPS based on performance
    if (avgFps < 30) {
      fpsElem.style.color = '#ff0000'; // Red for low FPS
    } else if (avgFps < 45) {
      fpsElem.style.color = '#ffff00'; // Yellow for medium FPS
    } else {
      fpsElem.style.color = '#00ff00'; // Green for good FPS
    }
  }
  
  // Update entity count
  const entitiesElem = document.getElementById('debugEntities');
  if (entitiesElem) {
    const aliveEnemies = enemies.filter(e => !e.isDead).length;
    entitiesElem.textContent = `Entities: ${aliveEnemies}/${enemies.length} enemies, ${projectiles.length + enemyProjectiles.length} projectiles`;
  }
}

/**
 * Create dramatic player death with dismemberment and blood effects
 * @param {Function} callback - Function to call after death animation
 */
function createPlayerDeathEffect(callback) {
  console.log("Starting player death effect");
  
  // Don't do anything if player is already dead
  if (!player || gameState.isPlayerDeathAnimationPlayed) {
    console.log("Player death animation already played or player not found, skipping to callback");
    if (callback) callback();
    return;
  }
  
  // Mark that we've played the death animation
  gameState.isPlayerDeathAnimationPlayed = true;
  
  // Hide original player model immediately to prevent "clone" appearance
  if (player) {
    player.visible = false;
  }
  
  console.log("Creating player death effects");
  
  // Make sure callback is eventually called, even if the animation fails
  const DEATH_ANIMATION_TIMEOUT = 5000; // 5 seconds max
  let callbackExecuted = false;
  
  const ensureCallback = () => {
    if (!callbackExecuted) {
      callbackExecuted = true;
      console.log("Executing death animation callback");
      if (callback) callback();
    }
  };
  
  // Set failsafe timer
  const failsafeTimer = setTimeout(ensureCallback, DEATH_ANIMATION_TIMEOUT);
  
  try {
    // Create a blood explosion at player position
    const playerPosition = player.position.clone();
    playerPosition.y += 1; // Center of player
    
    // Create many blood particles exploding outward
    const particleCount = 150; // Large blood explosion
    const bloodParticles = [];
    
    // Particle colors - various shades of red
    const bloodColors = [0xbb0a1e, 0xd10a0a, 0x8a0303];

    // Create explosion particles
    for (let i = 0; i < particleCount; i++) {
      // Create various sized blood particles
      const size = 0.03 + Math.random() * 0.15; 
      const geometry = new THREE.SphereGeometry(size, 4, 4);
      const material = new THREE.MeshBasicMaterial({ 
        color: bloodColors[Math.floor(Math.random() * bloodColors.length)],
        transparent: true,
        opacity: 0.9
      });
      
      const bloodDrop = new THREE.Mesh(geometry, material);
      bloodDrop.position.copy(playerPosition);
      
      // Add small random offset
      bloodDrop.position.x += (Math.random() - 0.5) * 0.3;
      bloodDrop.position.y += (Math.random() - 0.5) * 0.3;
      bloodDrop.position.z += (Math.random() - 0.5) * 0.3;
      
      scene.add(bloodDrop);
      bloodParticles.push(bloodDrop);
      
      // Calculate velocity - exploding in all directions
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        Math.random() * 0.5 + 0.2, // More upward bias
        (Math.random() - 0.5) * 0.8
      );
      
      // Store velocity with the particle
      bloodDrop.userData.velocity = velocity;
      bloodDrop.userData.rotationVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      bloodDrop.userData.lifetime = 1.5 + Math.random() * 2; // 1.5-3.5 seconds
    }
    
    // Dismember player parts
    const playerParts = dismemberPlayer(player, scene);
    
    // Animate all particles and parts
    let elapsedTime = 0;
    const animationDuration = 4; // seconds
    
    const animateDeathEffect = () => {
      const deltaTime = 0.016; // Approximate for 60fps
      elapsedTime += deltaTime;
      
      // Update blood particles
      for (let i = bloodParticles.length - 1; i >= 0; i--) {
        const particle = bloodParticles[i];
        const velocity = particle.userData.velocity;
        const rotVel = particle.userData.rotationVelocity;
        
        // Move particle
        particle.position.add(velocity.clone().multiplyScalar(deltaTime * 60));
        
        // Rotate particle
        particle.rotation.x += rotVel.x;
        particle.rotation.y += rotVel.y;
        particle.rotation.z += rotVel.z;
        
        // Apply gravity
        velocity.y -= 0.015 * deltaTime * 60;
        
        // Apply drag
        velocity.multiplyScalar(0.98);
        
        // Fade out
        particle.material.opacity *= 0.98;
        
        // Remove if too faded or below ground
        if (particle.material.opacity < 0.05 || particle.position.y < 0) {
          scene.remove(particle);
          bloodParticles.splice(i, 1);
          
          // Create blood splatter on ground if hit ground
          if (particle.position.y < 0 && Math.random() < 0.3) {
            createBloodSplatter(scene, particle.position.clone());
          }
        }
      }
      
      // Update player parts
      for (let i = 0; i < playerParts.length; i++) {
        const part = playerParts[i];
        const velocity = part.userData.velocity;
        const rotVel = part.userData.rotationVelocity;
        
        // Move part
        part.position.add(velocity.clone().multiplyScalar(deltaTime * 60));
        
        // Rotate part
        part.rotation.x += rotVel.x;
        part.rotation.y += rotVel.y;
        part.rotation.z += rotVel.z;
        
        // Apply gravity
        velocity.y -= 0.02 * deltaTime * 60;
        
        // Apply drag
        velocity.multiplyScalar(0.98);
        
        // Bounce if hitting ground
        if (part.position.y < 0.1) {
          part.position.y = 0.1;
          velocity.y = -velocity.y * 0.4; // Bounce with energy loss
          
          // Create blood splatter
          if (Math.random() < 0.5) {
            createBloodSplatter(scene, part.position.clone());
          }
          
          // Apply friction
          velocity.x *= 0.9;
          velocity.z *= 0.9;
        }
      }
      
      // Continue animation if not complete
      if (elapsedTime < animationDuration) {
        requestAnimationFrame(animateDeathEffect);
      } else {
        // Remove all particles and parts
        for (const particle of bloodParticles) {
          scene.remove(particle);
        }
        for (const part of playerParts) {
          scene.remove(part);
        }
        
        // Hide player model
        if (player) {
          player.visible = false;
        }
        
        // Animation completed, clear failsafe timer and call callback
        clearTimeout(failsafeTimer);
        ensureCallback();
      }
    };
    
    // Start animation
    animateDeathEffect();
  } catch (error) {
    console.error("Error in player death animation:", error);
    // If any error occurs, make sure we still call the callback
    clearTimeout(failsafeTimer);
    ensureCallback();
  }
}

/**
 * Dismember player model into parts that fall with physics
 * @param {THREE.Object3D} player - The player object
 * @param {THREE.Scene} scene - The scene
 * @returns {Array} - Array of created dismembered parts
 */
function dismemberPlayer(player, scene) {
  const parts = [];
  
  // Base position for all parts
  const basePosition = player.position.clone();
  
  // Create parts
  const bodyParts = [
    { 
      name: 'head', 
      geometry: new THREE.SphereGeometry(0.3, 8, 8),
      position: new THREE.Vector3(0, 1.9, 0),
      color: 0xd4a76a // Skin tone
    },
    { 
      name: 'helmet', 
      geometry: new THREE.SphereGeometry(0.4, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      position: new THREE.Vector3(0, 2.1, 0),
      color: 0x3a5f0b // Olive drab
    },
    { 
      name: 'torso', 
      geometry: new THREE.BoxGeometry(0.8, 1.2, 0.4),
      position: new THREE.Vector3(0, 1.0, 0),
      color: 0x2c5e1a // Olive green
    },
    { 
      name: 'leftArm', 
      geometry: new THREE.BoxGeometry(0.25, 0.8, 0.25),
      position: new THREE.Vector3(-0.6, 1.0, 0),
      color: 0x2c5e1a // Olive green
    },
    { 
      name: 'rightArm', 
      geometry: new THREE.BoxGeometry(0.25, 0.8, 0.25),
      position: new THREE.Vector3(0.6, 1.0, 0),
      color: 0x2c5e1a // Olive green
    },
    { 
      name: 'leftLeg', 
      geometry: new THREE.BoxGeometry(0.3, 0.9, 0.3),
      position: new THREE.Vector3(-0.3, -0.5, 0),
      color: 0x3d5229 // Darker green
    },
    { 
      name: 'rightLeg', 
      geometry: new THREE.BoxGeometry(0.3, 0.9, 0.3),
      position: new THREE.Vector3(0.3, -0.5, 0),
      color: 0x3d5229 // Darker green
    },
    { 
      name: 'gun', 
      geometry: new THREE.BoxGeometry(0.15, 0.15, 1.5),
      position: new THREE.Vector3(0.5, 0.9, 0.3),
      color: 0x5d4037 // Brown
    }
  ];
  
  // Create each part with physics
  bodyParts.forEach(partConfig => {
    const material = new THREE.MeshStandardMaterial({
      color: partConfig.color,
      roughness: 0.7
    });
    
    const part = new THREE.Mesh(partConfig.geometry, material);
    
    // Position relative to player
    part.position.copy(basePosition.clone().add(partConfig.position));
    
    // Add to scene
    scene.add(part);
    parts.push(part);
    
    // Add physics properties
    part.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.2 + 0.1,
      (Math.random() - 0.5) * 0.3
    );
    
    part.userData.rotationVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    );
  });
  
  return parts;
}

/**
 * Creates a blood splatter effect on surfaces
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position of the splatter
 */
function createBloodSplatter(scene, position) {
  // Create fewer splatter particles for better performance
  const particleCount = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < particleCount; i++) {
    // Create a small red sphere for blood
    const size = 0.02 + Math.random() * 0.04;
    const geometry = new THREE.SphereGeometry(size, 3, 3);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xbb0a1e,
      transparent: true,
      opacity: 0.8
    });
    const particle = new THREE.Mesh(geometry, material);
    
    // Position at splatter origin with random offset
    particle.position.copy(position);
    particle.position.x += (Math.random() - 0.5) * 0.3;
    particle.position.y = 0.01; // Just above ground
    particle.position.z += (Math.random() - 0.5) * 0.3;
    
    // Add to scene
    scene.add(particle);
    
    // Flatten the splatter
    particle.scale.y = 0.1;
    
    // Remove after a random time
    setTimeout(() => {
      if (particle.parent === scene) {
        scene.remove(particle);
      }
    }, 3000 + Math.random() * 7000); // 3-10 seconds
  }
}

/**
 * Plays a sound effect with the specified volume
 * @param {string} soundType - Type of sound to play
 * @param {number} volume - Volume to play the sound at (0-1)
 */
function playSound(soundType, volume = 1.0) {
  // Create audio element
  const audio = new Audio();
  
  // Set source based on sound type
  switch (soundType) {
    case 'jump':
      // Use a placeholder jump sound URL or data
      audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'; // Base64 encoded minimal sound
      break;
    case 'land':
      // Use a placeholder landing sound URL or data  
      audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'; // Base64 encoded minimal sound
      break;
    default:
      console.warn(`Unknown sound type: ${soundType}`);
      return;
  }
  
  // Set volume
  audio.volume = Math.min(1.0, Math.max(0, volume));
  
  // Play the sound
  audio.play().catch(error => {
    // Handle autoplay restrictions quietly
    console.log(`Sound playback failed: ${error.message}`);
  });
}

/**
 * Handles when a weapon is collected
 * @param {string} weaponType - Type of weapon collected
 */
function handleWeaponCollected(weaponType) {
  gameState.collectWeapon(weaponType);
  updatePlayerWeapon(player, weaponType);
  
  // Show pickup notification
  showPickupNotification(`Picked up ${weaponType.toUpperCase()}`);
}

/**
 * Handles when ammo is collected
 * @param {number} amount - Amount of ammo collected
 * @param {string} ammoType - Type of ammo collected
 */
function handleAmmoCollected(amount, ammoType) {
  gameState.addAmmo(amount, ammoType);
  
  // Show pickup notification
  const weaponName = ammoType === AMMO_TYPES.MP41 ? 'MP41' : 'Standard';
  showPickupNotification(`Picked up ${amount} ${weaponName} ammo`);
}

/**
 * Shows a pickup notification
 * @param {string} message - Message to display
 */
function showPickupNotification(message) {
  const notification = document.createElement('div');
  notification.style.position = 'absolute';
  notification.style.top = '50%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.color = 'white';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.fontSize = '24px';
  notification.style.textShadow = '2px 2px 3px rgba(0, 0, 0, 0.8)';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.padding = '15px 30px';
  notification.style.borderRadius = '5px';
  notification.style.pointerEvents = 'none';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 2 seconds
  setTimeout(() => {
    notification.remove();
  }, 2000);
}
  