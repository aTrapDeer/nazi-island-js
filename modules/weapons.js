/**
 * Weapons module for managing different weapon types and ammo
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Weapon definitions
export const WEAPONS = {
  RIFLE: 'rifle',
  MP41: 'mp41'
};

// Ammo types
export const AMMO_TYPES = {
  STANDARD: 'standard',
  MP41: 'mp41'
};

// Weapon configurations
export const WEAPON_CONFIG = {
  [WEAPONS.RIFLE]: {
    name: 'Rifle',
    damage: 1,
    ammoType: AMMO_TYPES.STANDARD,
    fireRate: 200, // milliseconds between shots
    automatic: false
  },
  [WEAPONS.MP41]: {
    name: 'MP41',
    damage: 0.7, // Slightly weaker than rifle but faster
    ammoType: AMMO_TYPES.MP41,
    fireRate: 100, // Faster fire rate than rifle
    automatic: true,
    magazineSize: 32
  }
};

/**
 * Creates a weapon pickup
 * @param {THREE.Scene} scene - The scene to add the pickup to
 * @param {THREE.Vector3} position - Position of the pickup
 * @param {string} weaponType - Type of weapon (from WEAPONS enum)
 * @returns {Object} The weapon pickup object
 */
export function createWeaponPickup(scene, position, weaponType) {
  // Create a floating weapon pickup
  const pickupGroup = new THREE.Group();
  pickupGroup.position.copy(position);
  pickupGroup.position.y = 0.2; // Lift slightly off ground
  
  // Create the weapon model based on type
  const weaponModel = createWeaponModel(weaponType);
  pickupGroup.add(weaponModel);
  
  // Add a glowing effect
  const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.3
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  pickupGroup.add(glow);
  
  // Add text label with weapon name
  const config = WEAPON_CONFIG[weaponType];
  
  // Add the pickup to the scene
  scene.add(pickupGroup);
  
  // Return pickup object with properties
  return {
    object: pickupGroup,
    type: weaponType,
    collected: false,
    position: position.clone()
  };
}

/**
 * Creates a weapon model based on weapon type
 * @param {string} weaponType - Type of weapon from WEAPONS enum
 * @returns {THREE.Group} The weapon model
 */
function createWeaponModel(weaponType) {
  const weaponGroup = new THREE.Group();
  
  if (weaponType === WEAPONS.MP41) {
    // MP41 Submachine Gun
    const bodyGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333, // Dark metal
      metalness: 0.8,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    weaponGroup.add(body);
    
    // MP41 Barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const barrel = new THREE.Mesh(barrelGeometry, bodyMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.6; // Extend forward
    weaponGroup.add(barrel);
    
    // MP41 Magazine - angled downward
    const magGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.08);
    const magMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111, // Black metal
      metalness: 0.7,
      roughness: 0.3
    });
    const magazine = new THREE.Mesh(magGeometry, magMaterial);
    magazine.position.set(0, -0.2, 0.1);
    magazine.rotation.x = -Math.PI / 6; // Angle slightly
    weaponGroup.add(magazine);
    
    // MP41 Stock - folded position
    const stockGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.4);
    const stockMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // Brown wood parts
      roughness: 0.8
    });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.set(0, 0, -0.4);
    weaponGroup.add(stock);
    
    // MP41 Grip
    const gripGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.1);
    const grip = new THREE.Mesh(gripGeometry, stockMaterial);
    grip.position.set(0, -0.1, -0.1);
    weaponGroup.add(grip);
  } else {
    // Default rifle (fallback)
    const rifleGeometry = new THREE.BoxGeometry(0.12, 0.12, 1.2);
    const rifleMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // Brown wood
      roughness: 0.8
    });
    const rifle = new THREE.Mesh(rifleGeometry, rifleMaterial);
    weaponGroup.add(rifle);
    
    // Rifle barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333, // Dark metal
      metalness: 0.8,
      roughness: 0.2
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.8;
    weaponGroup.add(barrel);
  }
  
  return weaponGroup;
}

/**
 * Creates an MP41 ammo pickup
 * @param {THREE.Scene} scene - The scene to add the ammo pickup to
 * @param {THREE.Vector3} position - Position of the pickup
 * @param {number} amount - Amount of ammo in the pickup
 * @returns {Object} The ammo pickup object
 */
export function createMP41AmmoPickup(scene, position, amount) {
  // Create a floating ammo box
  const pickupGroup = new THREE.Group();
  pickupGroup.position.copy(position);
  pickupGroup.position.y = 0.2; // Lift slightly off ground
  
  // Ammo box
  const boxGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.4);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666, // Dark metal
    metalness: 0.8,
    roughness: 0.2
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  pickupGroup.add(box);
  
  // MP41 Magazine model on top
  const magGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.08);
  const magMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111, // Black metal
    metalness: 0.7,
    roughness: 0.3
  });
  const magazine = new THREE.Mesh(magGeometry, magMaterial);
  magazine.position.set(0, 0.2, 0);
  magazine.rotation.x = Math.PI / 2;
  pickupGroup.add(magazine);
  
  // Add text label for "MP41 AMMO"
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = 'bold 36px Arial';
  context.fillStyle = '#ffcc00';
  context.textAlign = 'center';
  context.fillText('MP41 AMMO', canvas.width / 2, 50);
  context.fillText(`x${amount}`, canvas.width / 2, 90);
  
  const textTexture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide
  });
  const textGeometry = new THREE.PlaneGeometry(0.6, 0.3);
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.y = 0.5;
  textMesh.rotation.x = -Math.PI / 4;
  pickupGroup.add(textMesh);
  
  // Add the pickup to the scene
  scene.add(pickupGroup);
  
  // Return pickup object with properties
  return {
    object: pickupGroup,
    amount: amount,
    type: AMMO_TYPES.MP41,
    collected: false,
    position: position.clone()
  };
}

/**
 * Updates all weapon pickups and handles collection
 * @param {Array} weaponPickups - Array of weapon pickup objects
 * @param {THREE.Object3D} player - Player object
 * @param {THREE.Scene} scene - Scene reference
 * @param {Function} onWeaponCollected - Callback for when weapon is collected
 * @param {Object} keyState - Current key state including E key for pickup
 * @returns {Array} - Updated weapon pickups array
 */
export function updateWeaponPickups(weaponPickups, player, scene, onWeaponCollected, keyState) {
  // Skip if no pickups
  if (weaponPickups.length === 0) return weaponPickups;
  
  // Get player position (ignore height)
  const playerPosition = player.position.clone();
  playerPosition.y = 0;
  
  // Check each pickup for collection
  const updatedPickups = weaponPickups.filter(pickup => {
    // Skip already collected pickups
    if (pickup.collected) return false;
    
    const pickupPosition = pickup.object.position.clone();
    pickupPosition.y = 0;
    const distance = pickupPosition.distanceTo(playerPosition);
    
    // If player is close enough and presses E, collect the weapon
    if (distance < 1.5) {
      // Show pickup prompt
      showPickupPrompt(pickup.type, true);
      
      // If player presses E key
      if (keyState['KeyE']) {
        if (onWeaponCollected) {
          onWeaponCollected(pickup.type);
        }
        
        // Remove the pickup from the scene
        scene.remove(pickup.object);
        
        // Hide the prompt
        showPickupPrompt(pickup.type, false);
        
        pickup.collected = true;
        return false;
      }
    } else {
      // Hide pickup prompt when not near
      showPickupPrompt(pickup.type, false);
    }
    
    // Animate the pickup (float and rotate)
    pickup.object.rotation.y += 0.02;
    pickup.object.position.y = 0.3 + Math.sin(Date.now() / 500) * 0.1;
    
    return !pickup.collected;
  });
  
  return updatedPickups;
}

/**
 * Updates all MP41 ammo pickups and handles collection
 * @param {Array} mp41AmmoPickups - Array of MP41 ammo pickup objects
 * @param {THREE.Object3D} player - Player object
 * @param {THREE.Scene} scene - Scene reference
 * @param {Function} onAmmoCollected - Callback for when ammo is collected
 * @param {Object} keyState - Current key state including E key for pickup
 * @returns {Array} - Updated ammo pickups array
 */
export function updateMP41AmmoPickups(mp41AmmoPickups, player, scene, onAmmoCollected, keyState) {
  // Skip if no pickups
  if (mp41AmmoPickups.length === 0) return mp41AmmoPickups;
  
  // Get player position (ignore height)
  const playerPosition = player.position.clone();
  playerPosition.y = 0;
  
  // Check each pickup for collection
  const updatedPickups = mp41AmmoPickups.filter(pickup => {
    // Skip already collected pickups
    if (pickup.collected) return false;
    
    const pickupPosition = pickup.object.position.clone();
    pickupPosition.y = 0;
    const distance = pickupPosition.distanceTo(playerPosition);
    
    // If player is close enough and presses E, collect the ammo
    if (distance < 1.5) {
      // Show pickup prompt
      showPickupPrompt('mp41Ammo', true);
      
      // If player presses E key
      if (keyState['KeyE']) {
        if (onAmmoCollected) {
          onAmmoCollected(pickup.amount, pickup.type);
        }
        
        // Remove the pickup from the scene
        scene.remove(pickup.object);
        
        // Hide the prompt
        showPickupPrompt('mp41Ammo', false);
        
        pickup.collected = true;
        return false;
      }
    } else {
      // Hide pickup prompt when not near
      showPickupPrompt('mp41Ammo', false);
    }
    
    // Animate the pickup (float and rotate)
    pickup.object.rotation.y += 0.02;
    pickup.object.position.y = 0.3 + Math.sin(Date.now() / 500) * 0.1;
    
    return !pickup.collected;
  });
  
  return updatedPickups;
}

/**
 * Shows or hides pickup prompt
 * @param {string} type - Type of pickup
 * @param {boolean} show - Whether to show or hide the prompt
 */
function showPickupPrompt(type, show) {
  // Get or create prompt element
  let promptEl = document.getElementById('pickupPrompt');
  if (!promptEl && show) {
    promptEl = document.createElement('div');
    promptEl.id = 'pickupPrompt';
    promptEl.style.position = 'absolute';
    promptEl.style.bottom = '100px';
    promptEl.style.left = '50%';
    promptEl.style.transform = 'translateX(-50%)';
    promptEl.style.color = 'white';
    promptEl.style.fontFamily = 'Arial, sans-serif';
    promptEl.style.fontSize = '20px';
    promptEl.style.textShadow = '2px 2px 3px rgba(0, 0, 0, 0.8)';
    promptEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    promptEl.style.padding = '10px 20px';
    promptEl.style.borderRadius = '5px';
    promptEl.style.pointerEvents = 'none';
    document.body.appendChild(promptEl);
  }
  
  if (promptEl) {
    if (show) {
      let message = 'Press E to pickup';
      
      if (type === WEAPONS.MP41) {
        message = 'Press E to pickup MP41';
      } else if (type === 'mp41Ammo') {
        message = 'Press E to pickup MP41 Ammo';
      }
      
      promptEl.textContent = message;
      promptEl.style.display = 'block';
    } else {
      promptEl.style.display = 'none';
    }
  }
}

/**
 * Creates a weapon model for player to hold
 * @param {string} weaponType - Type of weapon from WEAPONS enum
 * @returns {THREE.Group} The weapon model
 */
export function createPlayerWeaponModel(weaponType) {
  // Same as createWeaponModel but positions for player's hands
  return createWeaponModel(weaponType);
} 