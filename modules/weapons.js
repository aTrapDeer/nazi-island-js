/**
 * Weapons module for managing different weapon types and ammo
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Weapon definitions
export const WEAPONS = {
  M1_GARAND: 'm1_garand',
  MP41: 'mp41'
};

// Ammo types
export const AMMO_TYPES = {
  STANDARD: 'standard',
  MP41: 'mp41'
};

// Weapon configurations
export const WEAPON_CONFIG = {
  [WEAPONS.M1_GARAND]: {
    name: 'M1 Garand',
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
    // MP41 Submachine Gun - all-black stylized model
    // Materials - all black with different finishes
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111, // Pure black for main metal parts
      metalness: 0.9,
      roughness: 0.3
    });
    
    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a, // Slightly darker black for accent parts
      metalness: 0.95,
      roughness: 0.2
    });
    
    const matteBlackMaterial = new THREE.MeshStandardMaterial({
      color: 0x151515, // Slightly lighter black for grip parts
      metalness: 0.3,
      roughness: 0.8
    });
    
    // Main receiver - more rectangular with rounded edges
    const receiverGeometry = new THREE.BoxGeometry(0.11, 0.11, 0.8);
    receiverGeometry.translate(0, 0, 0.1); // Center properly
    const receiver = new THREE.Mesh(receiverGeometry, metalMaterial);
    weaponGroup.add(receiver);
    
    // Barrel - longer and thinner
    const barrelGeometry = new THREE.CylinderGeometry(0.022, 0.022, 1.0, 16);
    const barrel = new THREE.Mesh(barrelGeometry, darkMetalMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.6; // Extend forward
    weaponGroup.add(barrel);
    
    // Barrel shroud/cooling jacket
    const shroudGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
    const shroud = new THREE.Mesh(shroudGeometry, metalMaterial);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.z = 0.45; 
    weaponGroup.add(shroud);
    
    // Add holes in the barrel shroud - more of them for realism
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      // Create two columns of holes
      for (let j = 0; j < 5; j++) {
        const holeGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
        const hole = new THREE.Mesh(holeGeometry, darkMetalMaterial);
        
        hole.position.set(
          Math.cos(angle) * 0.042,
          Math.sin(angle) * 0.042,
          0.25 + j * 0.12
        );
        hole.rotation.x = Math.PI / 2;
        weaponGroup.add(hole);
      }
    }
    
    // Magazine - more accurate straight box magazine
    const magGeometry = new THREE.BoxGeometry(0.07, 0.28, 0.045);
    const magazine = new THREE.Mesh(magGeometry, darkMetalMaterial);
    magazine.position.set(0, -0.19, 0.15);
    magazine.rotation.x = -Math.PI / 20; // Very slight angle
    weaponGroup.add(magazine);
    
    // Magazine housing - more detailed
    const magHousingGeometry = new THREE.BoxGeometry(0.09, 0.05, 0.07);
    const magHousing = new THREE.Mesh(magHousingGeometry, metalMaterial);
    magHousing.position.set(0, -0.055, 0.15);
    weaponGroup.add(magHousing);
    
    // Add magazine release tab
    const magReleaseGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const magRelease = new THREE.Mesh(magReleaseGeometry, darkMetalMaterial);
    magRelease.position.set(-0.06, -0.05, 0.15);
    weaponGroup.add(magRelease);
    
    // MP41 stock base - more detailed
    const stockBaseGeometry = new THREE.BoxGeometry(0.09, 0.09, 0.12);
    const stockBase = new THREE.Mesh(stockBaseGeometry, metalMaterial);
    stockBase.position.set(0, 0, -0.35);
    weaponGroup.add(stockBase);
    
    // Folding stock mechanism - more accurate
    const stockPivotGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.11, 8);
    const stockPivot = new THREE.Mesh(stockPivotGeometry, darkMetalMaterial);
    stockPivot.rotation.z = Math.PI / 2;
    stockPivot.position.set(0, -0.03, -0.38);
    weaponGroup.add(stockPivot);
    
    // Stock bars (folded under) - thinner and more detailed
    const stockBarGeometry = new THREE.BoxGeometry(0.015, 0.015, 0.45);
    
    // Left bar
    const leftBar = new THREE.Mesh(stockBarGeometry, metalMaterial);
    leftBar.position.set(-0.03, -0.07, -0.18);
    weaponGroup.add(leftBar);
    
    // Right bar
    const rightBar = new THREE.Mesh(stockBarGeometry, metalMaterial);
    rightBar.position.set(0.03, -0.07, -0.18);
    weaponGroup.add(rightBar);
    
    // Pistol grip - more angled and ergonomic like the real MP41
    const gripGroup = new THREE.Group();
    gripGroup.position.set(0, -0.15, -0.15);
    gripGroup.rotation.x = Math.PI / 5; // More angled grip
    weaponGroup.add(gripGroup);
    
    const gripGeometry = new THREE.BoxGeometry(0.06, 0.18, 0.04);
    const grip = new THREE.Mesh(gripGeometry, matteBlackMaterial);
    gripGroup.add(grip);
    
    // Add grip texture lines
    for (let i = 0; i < 5; i++) {
      const gripLineGeometry = new THREE.BoxGeometry(0.062, 0.005, 0.042);
      const gripLine = new THREE.Mesh(gripLineGeometry, darkMetalMaterial);
      gripLine.position.y = 0.05 - i * 0.03;
      gripGroup.add(gripLine);
    }
    
    // Add front handgrip under barrel - distinctive to MP41
    const handgripGeometry = new THREE.BoxGeometry(0.06, 0.12, 0.05);
    const handgrip = new THREE.Mesh(handgripGeometry, matteBlackMaterial);
    handgrip.position.set(0, -0.11, 0.35);
    weaponGroup.add(handgrip);
    
    // Front sight - taller and more accurate
    const frontSightGeometry = new THREE.BoxGeometry(0.015, 0.05, 0.015);
    const frontSight = new THREE.Mesh(frontSightGeometry, darkMetalMaterial);
    frontSight.position.set(0, 0.08, 0.85);
    weaponGroup.add(frontSight);
    
    // Rear sight - better hooded shape
    const rearSightBaseGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.04);
    const rearSightBase = new THREE.Mesh(rearSightBaseGeometry, metalMaterial);
    rearSightBase.position.set(0, 0.07, -0.05);
    weaponGroup.add(rearSightBase);
    
    const rearSightNotchGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.01);
    const rearSightNotch = new THREE.Mesh(rearSightNotchGeometry, darkMetalMaterial);
    rearSightNotch.position.set(0, 0.09, -0.05);
    weaponGroup.add(rearSightNotch);
    
    // Add side plates to the rear sight
    const sightPlateGeometry = new THREE.BoxGeometry(0.01, 0.03, 0.04);
    
    const leftSightPlate = new THREE.Mesh(sightPlateGeometry, metalMaterial);
    leftSightPlate.position.set(-0.04, 0.08, -0.05);
    weaponGroup.add(leftSightPlate);
    
    const rightSightPlate = new THREE.Mesh(sightPlateGeometry, metalMaterial);
    rightSightPlate.position.set(0.04, 0.08, -0.05);
    weaponGroup.add(rightSightPlate);
    
    // Charging handle - distinctive curved handle
    const boltHandleGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8);
    const boltHandle = new THREE.Mesh(boltHandleGeometry, darkMetalMaterial);
    boltHandle.rotation.z = Math.PI / 2;
    boltHandle.position.set(0.08, 0.03, -0.1);
    weaponGroup.add(boltHandle);
    
    // Bolt handle knob
    const boltKnobGeometry = new THREE.SphereGeometry(0.018, 8, 8);
    const boltKnob = new THREE.Mesh(boltKnobGeometry, metalMaterial);
    boltKnob.position.set(0.12, 0.03, -0.1);
    weaponGroup.add(boltKnob);
    
    // Trigger - more detailed
    const triggerGeometry = new THREE.BoxGeometry(0.02, 0.04, 0.01);
    const trigger = new THREE.Mesh(triggerGeometry, darkMetalMaterial);
    trigger.position.set(0, -0.05, -0.2);
    weaponGroup.add(trigger);
    
    // Trigger guard - more oval shaped
    const guardGeometry = new THREE.TorusGeometry(0.025, 0.005, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeometry, metalMaterial);
    guard.rotation.x = Math.PI / 2;
    guard.position.set(0, -0.07, -0.2);
    weaponGroup.add(guard);
    
    // Muzzle attachment - distinctive to MP41
    const muzzleGeometry = new THREE.CylinderGeometry(0.03, 0.025, 0.1, 16);
    const muzzle = new THREE.Mesh(muzzleGeometry, darkMetalMaterial);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.z = 1.0;
    weaponGroup.add(muzzle);
    
    // Add some weathering/detail to make it look more realistic
    // Bolt track on side of receiver
    const boltTrackGeometry = new THREE.BoxGeometry(0.015, 0.02, 0.5);
    const boltTrack = new THREE.Mesh(boltTrackGeometry, darkMetalMaterial);
    boltTrack.position.set(0.06, 0.02, 0.0);
    weaponGroup.add(boltTrack);
    
    // Ejection port
    const ejectionPortGeometry = new THREE.BoxGeometry(0.06, 0.02, 0.08);
    const ejectionPort = new THREE.Mesh(ejectionPortGeometry, darkMetalMaterial);
    ejectionPort.position.set(0.04, 0.06, -0.1);
    weaponGroup.add(ejectionPort);
    
    // Add selector switch
    const selectorGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8);
    const selector = new THREE.Mesh(selectorGeometry, darkMetalMaterial);
    selector.rotation.x = Math.PI / 2;
    selector.position.set(-0.06, 0.02, -0.2);
    weaponGroup.add(selector);
    
    // Rotate the weapon 180 degrees to fix the backwards barrel issue
    weaponGroup.rotation.y = Math.PI;
  } else {
    // M1 Garand rifle
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Darker brown wood
      roughness: 0.8
    });
    
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333, // Dark metal
      metalness: 0.8,
      roughness: 0.2
    });
    
    // Rifle body
    const rifleGeometry = new THREE.BoxGeometry(0.12, 0.12, 1.4);
    const rifle = new THREE.Mesh(rifleGeometry, woodMaterial);
    weaponGroup.add(rifle);
    
    // Rifle barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
    const barrel = new THREE.Mesh(barrelGeometry, metalMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.9;
    weaponGroup.add(barrel);
    
    // Front sight
    const frontSightGeometry = new THREE.BoxGeometry(0.03, 0.08, 0.03);
    const frontSight = new THREE.Mesh(frontSightGeometry, metalMaterial);
    frontSight.position.set(0, 0.1, 0.8);
    weaponGroup.add(frontSight);
    
    // Rear sight
    const rearSightGeometry = new THREE.BoxGeometry(0.06, 0.04, 0.03);
    const rearSight = new THREE.Mesh(rearSightGeometry, metalMaterial);
    rearSight.position.set(0, 0.1, 0.0);
    weaponGroup.add(rearSight);
    
    // Trigger guard
    const guardGeometry = new THREE.TorusGeometry(0.04, 0.01, 8, 8, Math.PI);
    const guard = new THREE.Mesh(guardGeometry, metalMaterial);
    guard.rotation.x = Math.PI / 2;
    guard.position.set(0, -0.05, -0.2);
    weaponGroup.add(guard);
    
    // Rifle stock
    const stockGeometry = new THREE.BoxGeometry(0.14, 0.15, 0.6);
    const stock = new THREE.Mesh(stockGeometry, woodMaterial);
    stock.position.set(0, -0.01, -0.6);
    weaponGroup.add(stock);
    
    // Rotate the weapon 180 degrees to fix the backwards barrel issue
    weaponGroup.rotation.y = Math.PI;
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
    
    // If player is close enough, auto-collect the ammo (no E key needed)
    if (distance < 1.5) {
      if (onAmmoCollected) {
        onAmmoCollected(pickup.amount, pickup.type);
      }
      
      // Remove the pickup from the scene
      scene.remove(pickup.object);
      
      pickup.collected = true;
      return false;
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
  const weaponGroup = new THREE.Group();
  
  if (weaponType === WEAPONS.MP41) {
    // MP41 Submachine Gun - historically accurate model based on the MP 41
    // Materials - all black with different finishes
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111, // Pure black for main metal parts
      metalness: 0.9,
      roughness: 0.3
    });
    
    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a, // Slightly darker black for accent parts
      metalness: 0.95,
      roughness: 0.2
    });
    
    const matteBlackMaterial = new THREE.MeshStandardMaterial({
      color: 0x151515, // Slightly lighter black for grip parts
      metalness: 0.3,
      roughness: 0.8
    });
    
    // Main receiver - more rectangular with rounded edges
    const receiverGeometry = new THREE.BoxGeometry(0.11, 0.11, 0.8);
    receiverGeometry.translate(0, 0, 0.1); // Center properly
    const receiver = new THREE.Mesh(receiverGeometry, metalMaterial);
    weaponGroup.add(receiver);
    
    // Barrel - longer and thinner
    const barrelGeometry = new THREE.CylinderGeometry(0.022, 0.022, 1.0, 16);
    const barrel = new THREE.Mesh(barrelGeometry, darkMetalMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.6; // Extend forward
    weaponGroup.add(barrel);
    
    // Barrel shroud/cooling jacket - more detailed with perforations
    const shroudGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
    const shroud = new THREE.Mesh(shroudGeometry, metalMaterial);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.z = 0.45; 
    weaponGroup.add(shroud);
    
    // Add holes in the barrel shroud - more of them for realism
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      // Create two columns of holes
      for (let j = 0; j < 5; j++) {
        const holeGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
        const hole = new THREE.Mesh(holeGeometry, darkMetalMaterial);
        
        hole.position.set(
          Math.cos(angle) * 0.042,
          Math.sin(angle) * 0.042,
          0.25 + j * 0.12
        );
        hole.rotation.x = Math.PI / 2;
        weaponGroup.add(hole);
      }
    }
    
    // Magazine - more accurate straight box magazine
    const magGeometry = new THREE.BoxGeometry(0.07, 0.28, 0.045);
    const magazine = new THREE.Mesh(magGeometry, darkMetalMaterial);
    magazine.position.set(0, -0.19, 0.15);
    magazine.rotation.x = -Math.PI / 20; // Very slight angle
    weaponGroup.add(magazine);
    
    // Magazine housing - more detailed
    const magHousingGeometry = new THREE.BoxGeometry(0.09, 0.05, 0.07);
    const magHousing = new THREE.Mesh(magHousingGeometry, metalMaterial);
    magHousing.position.set(0, -0.055, 0.15);
    weaponGroup.add(magHousing);
    
    // Add magazine release tab
    const magReleaseGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const magRelease = new THREE.Mesh(magReleaseGeometry, darkMetalMaterial);
    magRelease.position.set(-0.06, -0.05, 0.15);
    weaponGroup.add(magRelease);
    
    // MP41 stock base - more detailed
    const stockBaseGeometry = new THREE.BoxGeometry(0.09, 0.09, 0.12);
    const stockBase = new THREE.Mesh(stockBaseGeometry, metalMaterial);
    stockBase.position.set(0, 0, -0.35);
    weaponGroup.add(stockBase);
    
    // Folding stock mechanism - more accurate
    const stockPivotGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.11, 8);
    const stockPivot = new THREE.Mesh(stockPivotGeometry, darkMetalMaterial);
    stockPivot.rotation.z = Math.PI / 2;
    stockPivot.position.set(0, -0.03, -0.38);
    weaponGroup.add(stockPivot);
    
    // Stock bars (folded under) - thinner and more detailed
    const stockBarGeometry = new THREE.BoxGeometry(0.015, 0.015, 0.45);
    
    // Left bar
    const leftBar = new THREE.Mesh(stockBarGeometry, metalMaterial);
    leftBar.position.set(-0.03, -0.07, -0.18);
    weaponGroup.add(leftBar);
    
    // Right bar
    const rightBar = new THREE.Mesh(stockBarGeometry, metalMaterial);
    rightBar.position.set(0.03, -0.07, -0.18);
    weaponGroup.add(rightBar);
    
    // Pistol grip - more angled and ergonomic like the real MP41
    const gripGroup = new THREE.Group();
    gripGroup.position.set(0, -0.15, -0.15);
    gripGroup.rotation.x = Math.PI / 5; // More angled grip
    weaponGroup.add(gripGroup);
    
    const gripGeometry = new THREE.BoxGeometry(0.06, 0.18, 0.04);
    const grip = new THREE.Mesh(gripGeometry, matteBlackMaterial);
    gripGroup.add(grip);
    
    // Add grip texture lines
    for (let i = 0; i < 5; i++) {
      const gripLineGeometry = new THREE.BoxGeometry(0.062, 0.005, 0.042);
      const gripLine = new THREE.Mesh(gripLineGeometry, darkMetalMaterial);
      gripLine.position.y = 0.05 - i * 0.03;
      gripGroup.add(gripLine);
    }
    
    // Add front handgrip under barrel - distinctive to MP41
    const handgripGeometry = new THREE.BoxGeometry(0.06, 0.12, 0.05);
    const handgrip = new THREE.Mesh(handgripGeometry, matteBlackMaterial);
    handgrip.position.set(0, -0.11, 0.35);
    weaponGroup.add(handgrip);
    
    // Front sight - taller and more accurate
    const frontSightGeometry = new THREE.BoxGeometry(0.015, 0.05, 0.015);
    const frontSight = new THREE.Mesh(frontSightGeometry, darkMetalMaterial);
    frontSight.position.set(0, 0.08, 0.85);
    weaponGroup.add(frontSight);
    
    // Rear sight - better hooded shape
    const rearSightBaseGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.04);
    const rearSightBase = new THREE.Mesh(rearSightBaseGeometry, metalMaterial);
    rearSightBase.position.set(0, 0.07, -0.05);
    weaponGroup.add(rearSightBase);
    
    const rearSightNotchGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.01);
    const rearSightNotch = new THREE.Mesh(rearSightNotchGeometry, darkMetalMaterial);
    rearSightNotch.position.set(0, 0.09, -0.05);
    weaponGroup.add(rearSightNotch);
    
    // Add side plates to the rear sight
    const sightPlateGeometry = new THREE.BoxGeometry(0.01, 0.03, 0.04);
    
    const leftSightPlate = new THREE.Mesh(sightPlateGeometry, metalMaterial);
    leftSightPlate.position.set(-0.04, 0.08, -0.05);
    weaponGroup.add(leftSightPlate);
    
    const rightSightPlate = new THREE.Mesh(sightPlateGeometry, metalMaterial);
    rightSightPlate.position.set(0.04, 0.08, -0.05);
    weaponGroup.add(rightSightPlate);
    
    // Charging handle - distinctive curved handle
    const boltHandleGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8);
    const boltHandle = new THREE.Mesh(boltHandleGeometry, darkMetalMaterial);
    boltHandle.rotation.z = Math.PI / 2;
    boltHandle.position.set(0.08, 0.03, -0.1);
    weaponGroup.add(boltHandle);
    
    // Bolt handle knob
    const boltKnobGeometry = new THREE.SphereGeometry(0.018, 8, 8);
    const boltKnob = new THREE.Mesh(boltKnobGeometry, metalMaterial);
    boltKnob.position.set(0.12, 0.03, -0.1);
    weaponGroup.add(boltKnob);
    
    // Trigger - more detailed
    const triggerGeometry = new THREE.BoxGeometry(0.02, 0.04, 0.01);
    const trigger = new THREE.Mesh(triggerGeometry, darkMetalMaterial);
    trigger.position.set(0, -0.05, -0.2);
    weaponGroup.add(trigger);
    
    // Trigger guard - more oval shaped
    const guardGeometry = new THREE.TorusGeometry(0.025, 0.005, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeometry, metalMaterial);
    guard.rotation.x = Math.PI / 2;
    guard.position.set(0, -0.07, -0.2);
    weaponGroup.add(guard);
    
    // Muzzle attachment - distinctive to MP41
    const muzzleGeometry = new THREE.CylinderGeometry(0.03, 0.025, 0.1, 16);
    const muzzle = new THREE.Mesh(muzzleGeometry, darkMetalMaterial);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.z = 1.0;
    weaponGroup.add(muzzle);
    
    // Add some weathering/detail to make it look more realistic
    // Bolt track on side of receiver
    const boltTrackGeometry = new THREE.BoxGeometry(0.015, 0.02, 0.5);
    const boltTrack = new THREE.Mesh(boltTrackGeometry, darkMetalMaterial);
    boltTrack.position.set(0.06, 0.02, 0.0);
    weaponGroup.add(boltTrack);
    
    // Ejection port
    const ejectionPortGeometry = new THREE.BoxGeometry(0.06, 0.02, 0.08);
    const ejectionPort = new THREE.Mesh(ejectionPortGeometry, darkMetalMaterial);
    ejectionPort.position.set(0.04, 0.06, -0.1);
    weaponGroup.add(ejectionPort);
    
    // Add selector switch
    const selectorGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8);
    const selector = new THREE.Mesh(selectorGeometry, darkMetalMaterial);
    selector.rotation.x = Math.PI / 2;
    selector.position.set(-0.06, 0.02, -0.2);
    weaponGroup.add(selector);
    
    // Model adjustments for first-person view
    weaponGroup.position.set(0, 0, 0.1);
    weaponGroup.rotation.set(0, 0, 0);
    weaponGroup.scale.set(1.1, 1.1, 1.1); // Slightly larger for better visibility
    
    // Rotate the weapon 180 degrees to fix the backwards barrel issue
    weaponGroup.rotation.y = Math.PI;
  } else {
    // M1 Garand rifle - create and rotate
    const garandGroup = createWeaponModel(weaponType);
    // Rotate the weapon 180 degrees to fix the backwards barrel issue
    garandGroup.rotation.y = Math.PI;
    return garandGroup;
  }
  
  return weaponGroup;
} 