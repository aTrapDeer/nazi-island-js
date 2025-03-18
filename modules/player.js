/**
 * Player module for creating and updating the player character
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { WEAPONS, createPlayerWeaponModel } from './weapons.js';

/**
 * Creates the player character with a more detailed soldier model
 * @param {THREE.Scene} scene - The scene to add the player to
 * @returns {THREE.Object3D} - The player object with animation properties
 */
export function createPlayer(scene) {
  // Player container
  const player = new THREE.Group();
  player.position.set(0, 0, -5); // Moved 5 units along Z axis to a clear area
  scene.add(player);
  
  // Create a direction marker for debugging
  const markerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const frontMarker = new THREE.Mesh(markerGeometry, markerMaterial);
  frontMarker.position.set(0, 0, -0.5); // Negative Z is forward
  frontMarker.visible = true; // Debug marker - set to true to help debug orientation
  player.add(frontMarker);
  
  // Player body - improved model with better proportions and details
  const bodyGeometry = new THREE.BoxGeometry(1, 1.8, 0.6); // Correct dimensions for proper orientation
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c5e1a, // Olive green for Allied uniform
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.9; // Half the height
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);
  
  // Shoulders - add more dimension to the model
  const shoulderGeometry = new THREE.BoxGeometry(1.4, 0.3, 0.65); // Correct dimensions for proper orientation
  const shoulderMesh = new THREE.Mesh(shoulderGeometry, bodyMaterial);
  shoulderMesh.position.set(0, 1.4, 0);
  shoulderMesh.castShadow = true;
  player.add(shoulderMesh);
  
  // Belt
  const beltGeometry = new THREE.BoxGeometry(1.1, 0.2, 0.65); // Correct dimensions for proper orientation
  const beltMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b432e, // Brown leather
    roughness: 0.6,
    metalness: 0.2
  });
  const belt = new THREE.Mesh(beltGeometry, beltMaterial);
  belt.position.set(0, 0.2, 0);
  belt.castShadow = true;
  player.add(belt);
  
  // Head with better face details
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.9, 0);
  player.add(headGroup);
  
  const headGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.7);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a76a // Skin tone
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  headGroup.add(head);
  
  // Face details - eyes (positioned at front)
  const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3c70a4, // Blue eyes
    roughness: 0.2
  });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 0.1, 0.3); // Positive Z is front now
  headGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.2, 0.1, 0.3); // Positive Z is front now
  headGroup.add(rightEye);
  
  // Mouth
  const mouthGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.1);
  const mouthMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4c39, // Dark skin tone
    roughness: 0.5
  });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0, -0.2, 0.3); // Positive Z is front now
  headGroup.add(mouth);
  
  // Helmet - more detailed M1 helmet shape
  const helmetGroup = new THREE.Group();
  helmetGroup.position.set(0, 0.3, 0); // Position relative to head
  headGroup.add(helmetGroup);
  
  // Main helmet dome
  const helmetGeometry = new THREE.SphereGeometry(0.48, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const helmetMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a5f0b, // Olive drab
    roughness: 0.8
  });
  const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
  helmetGroup.add(helmet);
  
  // Helmet rim
  const rimGeometry = new THREE.TorusGeometry(0.48, 0.08, 8, 16, Math.PI * 2);
  const rim = new THREE.Mesh(rimGeometry, helmetMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.05;
  rim.castShadow = true;
  helmetGroup.add(rim);
  
  // Helmet netting
  const nettingGeometry = new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const nettingMaterial = new THREE.MeshStandardMaterial({
    color: 0x5e5e5e,
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });
  const netting = new THREE.Mesh(nettingGeometry, nettingMaterial);
  netting.scale.set(1.03, 1.03, 1.03);
  helmetGroup.add(netting);
  
  // Backpack - positioned correctly at the BACK (negative Z)
  const backpackGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.4);
  const backpackMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d4037, // Brown
    roughness: 0.9
  });
  const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
  backpack.position.set(0, 0.9, -0.4); // Negative Z is back now
  backpack.castShadow = true;
  player.add(backpack);
  
  // Arms
  const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c5e1a // Same as body
  });
  
  // Left arm
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.65, 0.9, 0);
  leftArm.castShadow = true;
  player.add(leftArm);
  
  // Right arm
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.65, 0.9, 0);
  rightArm.castShadow = true;
  player.add(rightArm);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.35, 1.2, 0.35);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d5229 // Darker green for pants
  });
  
  // Left leg
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.3, -0.6, 0);
  leftLeg.castShadow = true;
  player.add(leftLeg);
  
  // Right leg
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.3, -0.6, 0);
  rightLeg.castShadow = true;
  player.add(rightLeg);
  
  // Boots
  const bootGeometry = new THREE.BoxGeometry(0.38, 0.25, 0.4);
  const bootMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a2616, // Dark brown
    roughness: 0.9
  });
  
  const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  leftBoot.position.set(-0.3, -1.3, 0.02);
  leftBoot.castShadow = true;
  player.add(leftBoot);
  
  const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  rightBoot.position.set(0.3, -1.3, 0.02);
  rightBoot.castShadow = true;
  player.add(rightBoot);
  
  // Weapon - more detailed rifle, correctly positioned in FRONT (positive Z)
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(0.55, 0.9, 0.3); // Positive Z is front direction now
  player.add(weaponGroup);
  
  // Create initial weapon model (rifle)
  const weaponModel = createPlayerWeaponModel(WEAPONS.RIFLE);
  weaponGroup.add(weaponModel);
  
  // Store weapon-related properties
  player.userData.weaponGroup = weaponGroup;
  player.userData.currentWeaponModel = weaponModel;
  
  // Rotate the entire player model 180 degrees so the back faces the camera
  // This ensures the player's back is facing the camera in third-person view
  player.rotation.y = Math.PI;
  
  // Rotate the head to face forward
  headGroup.rotation.y = Math.PI;
  
  // Rotate the weapon to face forward
  weaponGroup.rotation.y = Math.PI;
  
  // Store animation-related properties
  player.userData = {
    // Animation properties
    animationTime: 0,
    isWalking: false,
    isSprinting: false,
    isShooting: false,
    shootingTime: 0,
    
    // Jump properties
    isJumping: false,
    jumpVelocity: 0,
    gravity: 0.015,
    jumpHeight: 0.35,
    
    // References to animated parts
    leftLeg: leftLeg,
    rightLeg: rightLeg,
    leftArm: leftArm,
    rightArm: rightArm,
    weaponGroup: weaponGroup,
    
    // Original positions for animation
    leftLegPos: leftLeg.position.clone(),
    rightLegPos: rightLeg.position.clone(),
    leftArmPos: leftArm.position.clone(),
    rightArmPos: rightArm.position.clone(),
    weaponGroupPos: weaponGroup.position.clone()
  };
  
  return player;
}

/**
 * Updates player position and orientation based on keyboard input and mouse position
 * @param {THREE.Object3D} player - The player object
 * @param {THREE.Camera} camera - The camera
 * @param {number} deltaTime - Time since last frame
 */
export function updatePlayerPosition(player, camera, deltaTime) {
  // Calculate movement direction
  const movementDirection = new THREE.Vector3(0, 0, 0);
  
  // Track if we need to rotate the camera
  let rotateLeft = false;
  let rotateRight = false;
  
  // Get global keyState from window if available
  const keyState = window.keyState || {};
  
  // Check if sprint key (Shift) is pressed
  const isSprinting = keyState['ShiftLeft'] || keyState['ShiftRight'];
  player.userData.isSprinting = isSprinting && !player.userData.isJumping;
  
  // Handle WASD and arrow keys
  // This ensures movement is relative to the camera view
  if (keyState['KeyW'] || keyState['ArrowUp']) {
    movementDirection.z -= 1; // Forward (negative Z in camera space)
  }
  if (keyState['KeyS'] || keyState['ArrowDown']) {
    movementDirection.z += 1; // Backward (positive Z in camera space)
  }
  
  // A/D now control rotation instead of strafing
  if (keyState['KeyA'] || keyState['ArrowLeft']) {
    rotateLeft = true;
  }
  if (keyState['KeyD'] || keyState['ArrowRight']) {
    rotateRight = true;
  }
  
  // Handle jumping with space bar
  if (keyState['Space'] && !player.userData.isJumping) {
    player.userData.isJumping = true;
    player.userData.jumpVelocity = player.userData.jumpHeight;
    
    // Add a small sound effect for jumping if available
    if (typeof window.playSound === 'function') {
      window.playSound('jump', 0.5);
    }
  }
  
  // Check if player is walking
  const isWalking = movementDirection.length() > 0;
  player.userData.isWalking = isWalking;
  
  // Handle rotation with A/D keys - rotate the player independently
  const rotationSpeed = 0.05;
  if (rotateLeft) {
    player.rotation.y += rotationSpeed;
  }
  if (rotateRight) {
    player.rotation.y -= rotationSpeed;
  }
  
  // Process jumping physics
  if (player.userData.isJumping) {
    // Apply jump velocity
    player.position.y += player.userData.jumpVelocity;
    
    // Apply gravity
    player.userData.jumpVelocity -= player.userData.gravity;
    
    // Check if landing
    if (player.position.y <= 0) {
      player.position.y = 0;
      player.userData.isJumping = false;
      player.userData.jumpVelocity = 0;
      
      // Add a landing sound effect if available
      if (typeof window.playSound === 'function') {
        window.playSound('land', 0.3);
      }
    }
  }
  
  // Normalize to get a consistent speed in all directions
  if (isWalking) {
    movementDirection.normalize();
    
    // Apply movement speed with sprint modifier if shift is pressed
    const baseMovementSpeed = 0.15;
    const sprintMultiplier = player.userData.isSprinting ? 1.8 : 1.0;
    const movementSpeed = baseMovementSpeed * sprintMultiplier;
    
    movementDirection.multiplyScalar(movementSpeed);
    
    // Get player's forward direction (based on its rotation)
    const playerDirection = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    
    // Calculate movement vector based on player direction
    const moveVector = new THREE.Vector3();
    
    if (movementDirection.z < 0) {
      // Moving forward - use player direction
      moveVector.addScaledVector(playerDirection, -movementDirection.z);
    } else if (movementDirection.z > 0) {
      // Moving backward - use opposite of player direction
      moveVector.addScaledVector(playerDirection, -movementDirection.z);
    }
    
    // Store original position for collision detection
    const originalPosition = player.position.clone();
    
    // Move player horizontally only (keep vertical position from jump)
    const oldY = player.position.y;
    player.position.add(moveVector);
    player.position.y = oldY; // Preserve jumping height
    
    // Check for collisions with objects in the scene
    if (checkCollisions(player, originalPosition)) {
      // If collision occurred, revert to original position (except for Y)
      player.position.x = originalPosition.x;
      player.position.z = originalPosition.z;
    }
    
    // Keep player within island radius (50 units)
    const distanceFromCenter = Math.sqrt(
      player.position.x * player.position.x + 
      player.position.z * player.position.z
    );
    
    if (distanceFromCenter > 49) {
      // Move player back within bounds
      const angle = Math.atan2(player.position.z, player.position.x);
      player.position.x = Math.cos(angle) * 49;
      player.position.z = Math.sin(angle) * 49;
    }
  }
  
  // Set camera position and orientation based on player position
  const cameraHeight = 4; // Height above player
  const cameraDistance = 6; // Distance behind player
  
  // Calculate camera position based on player position
  // Position camera behind the player (opposite of player's forward direction)
  const playerForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
  const cameraOffset = new THREE.Vector3(
    -playerForward.x * cameraDistance,
    cameraHeight,
    -playerForward.z * cameraDistance
  );
  
  // Position camera relative to player, including player's jump height
  camera.position.set(
    player.position.x + cameraOffset.x,
    player.position.y + cameraOffset.y,
    player.position.z + cameraOffset.z
  );
  
  // Look at player from slightly above
  const lookAtPoint = player.position.clone();
  lookAtPoint.y += 1; // Look at player's head level
  camera.lookAt(lookAtPoint);
  
  // Update animations
  updatePlayerAnimations(player, deltaTime);
  
  // Update weapon aiming based on mouse position
  // Get global gameState from window if available
  const gameState = window.gameState || { mousePosition: new THREE.Vector2() };
  updateWeaponAiming(player, camera, gameState.mousePosition);
}

/**
 * Checks if the player is colliding with any collidable objects in the scene
 * @param {THREE.Object3D} player - The player object
 * @param {THREE.Vector3} originalPosition - Original position before movement
 * @returns {boolean} - Whether a collision occurred
 */
function checkCollisions(player, originalPosition) {
  // Get all objects in the scene
  const scene = player.parent;
  if (!scene) return false;
  
  // Player collision parameters
  const playerRadius = 0.5; // Collision radius for player
  
  // Check collision with each object in the scene
  let collision = false;
  
  scene.traverse((object) => {
    // Skip if not collidable, or if it's the player itself
    if (!object.userData.collidable || object === player) return;
    
    // Skip bushes - they are now walkthrough-able
    if (object.userData.isBush) return;
    
    // Calculate distance between player and object center (X-Z plane only)
    const dx = player.position.x - object.position.x;
    const dz = player.position.z - object.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Get object's collision radius (default to 1 if not specified)
    const objectRadius = object.userData.collisionRadius || 1.0;
    
    // Check if collision occurred
    if (distance < (playerRadius + objectRadius)) {
      // Apply different logic based on object type
      if (object.userData.isBunker) {
        // For bunker, use a larger fixed radius
        const bunkerDx = player.position.x - 15; // Bunker is at x=15
        const bunkerDz = player.position.z - 10; // Bunker is at z=10
        const distanceToBunker = Math.sqrt(bunkerDx * bunkerDx + bunkerDz * bunkerDz);
        
        if (distanceToBunker < 5.0) { // Bunker has radius of about 5 units
          collision = true;
        }
      } else {
        // Standard collision for trees, rocks, etc.
        collision = true;
      }
    }
  });
  
  return collision;
}

/**
 * Updates player animations based on movement and actions
 * @param {THREE.Object3D} player - The player object
 * @param {number} deltaTime - Time since last frame
 */
function updatePlayerAnimations(player, deltaTime) {
  const userData = player.userData;
  
  // Update animation time with faster animation when sprinting
  const animationSpeedMultiplier = userData.isSprinting ? 8 : 5;
  userData.animationTime += deltaTime * animationSpeedMultiplier;
  
  // Walking or sprinting animation
  if (userData.isWalking && !userData.isJumping) {
    // Leg animation - walking/sprinting cycle with increased amplitude when sprinting
    const legAmplitude = userData.isSprinting ? 0.7 : 0.5;
    const legAngle = Math.sin(userData.animationTime) * legAmplitude;
    
    // Left leg swings opposite to right leg
    userData.leftLeg.rotation.x = legAngle;
    userData.rightLeg.rotation.x = -legAngle;
    
    // Arm animation - walking/sprinting cycle (opposite to legs) with increased amplitude
    const armAmplitude = userData.isSprinting ? 0.8 : 0.4;
    const armAngle = Math.sin(userData.animationTime) * armAmplitude;
    
    // Arms swing opposite to legs
    userData.leftArm.rotation.x = -armAngle;
    userData.rightArm.rotation.x = armAngle;
    
    // Add weapon movement for sprinting - weapon moves more with the right arm
    if (userData.isSprinting) {
      // Make weapon move with right arm during sprint
      const weaponBobAmount = Math.sin(userData.animationTime) * 0.15;
      userData.weaponGroup.position.y = userData.weaponGroupPos.y + weaponBobAmount;
      
      // Add slight weapon rotation during sprint for more dynamic movement
      const weaponTiltAmount = Math.sin(userData.animationTime) * 0.1;
      userData.weaponGroup.rotation.z = weaponTiltAmount;
    } else {
      // Reset weapon position when not sprinting
      userData.weaponGroup.position.y = userData.weaponGroupPos.y;
      userData.weaponGroup.rotation.z = 0;
    }
    
    // Slight body bounce with increased amplitude for sprinting
    const bounceAmplitude = userData.isSprinting ? 0.15 : 0.1;
    const bounceHeight = Math.abs(Math.sin(userData.animationTime * 2)) * bounceAmplitude;
    
    // Only apply bounce if not jumping
    if (!userData.isJumping) {
      player.position.y = bounceHeight;
    }
    
    // Debug log to confirm animation is running
    if (Math.random() < 0.001) { // Occasional log to avoid flooding console
      console.log("Player animation active", userData.isSprinting ? "sprinting" : "walking", legAngle);
    }
  } else if (userData.isJumping) {
    // Jumping animation - tuck legs and extend arms
    userData.leftLeg.rotation.x = 0.5; // Bend knees
    userData.rightLeg.rotation.x = 0.5;
    userData.leftArm.rotation.x = -0.3; // Arms slightly out
    userData.rightArm.rotation.x = -0.3;
    
    // Reset weapon rotation when jumping
    userData.weaponGroup.rotation.z = 0;
  } else {
    // Reset to idle pose
    userData.leftLeg.rotation.x = 0;
    userData.rightLeg.rotation.x = 0;
    userData.leftArm.rotation.x = 0;
    userData.rightArm.rotation.x = 0;
    
    // Reset weapon position and rotation
    userData.weaponGroup.position.y = userData.weaponGroupPos.y;
    userData.weaponGroup.rotation.z = 0;
    
    // Only reset Y position if not jumping
    if (!userData.isJumping) {
      player.position.y = 0;
    }
  }
  
  // Shooting animation
  if (userData.isShooting) {
    userData.shootingTime += deltaTime * 10;
    
    // Get the weapon group
    const weaponGroup = userData.weaponGroup;
    
    // Quick recoil and return with increased amplitude
    const recoilAmount = Math.max(0, 0.2 - userData.shootingTime) * 1.0; // Increased from 0.5 to 1.0
    
    // Store original position if not already stored
    if (!userData.weaponRecoilOriginalPos) {
      userData.weaponRecoilOriginalPos = {
        x: weaponGroup.position.x,
        y: weaponGroup.position.y,
        z: weaponGroup.position.z
      };
    }
    
    // Apply recoil in the direction the weapon is facing
    // This makes the recoil follow the aim direction
    const recoilDir = new THREE.Vector3(0, 0, -1); // Default recoil direction (backward)
    
    // Apply weapon's current rotation to the recoil direction
    recoilDir.applyEuler(weaponGroup.rotation);
    
    // Apply recoil
    weaponGroup.position.x = userData.weaponRecoilOriginalPos.x + recoilDir.x * recoilAmount * 0.3;
    weaponGroup.position.y = userData.weaponRecoilOriginalPos.y + recoilDir.y * recoilAmount * 0.3;
    weaponGroup.position.z = userData.weaponRecoilOriginalPos.z + recoilDir.z * recoilAmount;
    
    // Reset shooting state after animation completes
    if (userData.shootingTime >= 0.2) {
      userData.isShooting = false;
      userData.shootingTime = 0;
      
      // Reset weapon position
      weaponGroup.position.x = userData.weaponRecoilOriginalPos.x;
      weaponGroup.position.y = userData.weaponRecoilOriginalPos.y;
      weaponGroup.position.z = userData.weaponRecoilOriginalPos.z;
    }
  }
}

/**
 * Updates the player's weapon model based on current weapon
 * @param {THREE.Group} player - The player object
 * @param {string} weaponType - Type of weapon to switch to
 */
export function updatePlayerWeapon(player, weaponType) {
  if (!player || !player.userData.weaponGroup) return;
  
  // Remove current weapon model
  if (player.userData.currentWeaponModel) {
    player.userData.weaponGroup.remove(player.userData.currentWeaponModel);
  }
  
  // Create and add new weapon model
  const newWeaponModel = createPlayerWeaponModel(weaponType);
  player.userData.weaponGroup.add(newWeaponModel);
  player.userData.currentWeaponModel = newWeaponModel;
  
  // Adjust weapon position based on type
  if (weaponType === WEAPONS.MP41) {
    // MP41 is shorter, adjust position
    player.userData.weaponGroup.position.set(0.55, 0.9, 0.2);
  } else {
    // Rifle position
    player.userData.weaponGroup.position.set(0.55, 0.9, 0.3);
  }
}

/**
 * Triggers the shooting animation
 * @param {THREE.Group} player - The player object
 */
export function triggerShootAnimation(player) {
  if (!player || !player.userData.weaponGroup) return;
  
  const weaponGroup = player.userData.weaponGroup;
  const originalPosition = weaponGroup.position.clone();
  
  // Recoil animation
  const recoilAmount = 0.1;
  const recoilDuration = 50; // ms
  
  // Move weapon back
  weaponGroup.position.z -= recoilAmount;
  
  // Reset position after duration
  setTimeout(() => {
    weaponGroup.position.copy(originalPosition);
  }, recoilDuration);
}

/**
 * Updates the weapon orientation to aim toward the mouse position
 * @param {THREE.Object3D} player - The player object
 * @param {THREE.Camera} camera - The camera
 * @param {THREE.Vector2} mousePosition - Normalized mouse position
 */
function updateWeaponAiming(player, camera, mousePosition) {
  // Get the weapon group
  const weaponGroup = player.userData.weaponGroup;
  if (!weaponGroup) return;
  
  // Store original rotation if not already stored
  if (weaponGroup.userData === undefined) {
    weaponGroup.userData = {};
  }
  if (weaponGroup.userData.originalRotation === undefined) {
    weaponGroup.userData.originalRotation = {
      x: weaponGroup.rotation.x,
      y: weaponGroup.rotation.y,
      z: weaponGroup.rotation.z
    };
  }
  
  // Performance optimization: Only update aiming every other frame
  if (player.userData.skipAimFrame === undefined) {
    player.userData.skipAimFrame = false;
  }
  
  player.userData.skipAimFrame = !player.userData.skipAimFrame;
  if (player.userData.skipAimFrame) return;
  
  // Create a raycaster from the camera through the mouse position
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mousePosition, camera);
  
  // Use a simple distance-based approach for better performance
  // Project the ray forward to a reasonable distance
  const targetDistance = 50;
  const targetPoint = raycaster.ray.at(targetDistance, new THREE.Vector3());
  
  // Get weapon position in world space
  const weaponWorldPos = new THREE.Vector3();
  weaponGroup.getWorldPosition(weaponWorldPos);
  
  // Calculate direction in world space
  const worldDirection = new THREE.Vector3().subVectors(targetPoint, weaponWorldPos).normalize();
  
  // Convert world direction to local space of the player
  // Account for the player's 180-degree rotation
  const playerRotationInverse = player.quaternion.clone().invert();
  const localDirection = worldDirection.clone().applyQuaternion(playerRotationInverse);
  
  // Calculate rotation angles - adjust for the player's 180-degree rotation
  const horizontalAngle = Math.atan2(localDirection.x, localDirection.z);
  const verticalAngle = Math.atan2(localDirection.y, 
                                  Math.sqrt(localDirection.x * localDirection.x + localDirection.z * localDirection.z));
  
  // Apply limited rotation (with smoothing)
  const maxVerticalAngle = 0.5; // Maximum vertical angle in radians (about 30 degrees)
  const maxHorizontalAngle = 0.7; // Maximum horizontal angle in radians (about 40 degrees)
  const smoothFactor = 0.3; // Smoothing factor (0-1, lower is smoother)
  
  // Clamp angles to limits
  const clampedVerticalAngle = Math.max(-maxVerticalAngle, Math.min(maxVerticalAngle, verticalAngle));
  const clampedHorizontalAngle = Math.max(-maxHorizontalAngle, Math.min(maxHorizontalAngle, horizontalAngle));
  
  // Apply smoothed rotation - account for the player's 180-degree rotation
  weaponGroup.rotation.x = weaponGroup.rotation.x * (1 - smoothFactor) + 
                          (weaponGroup.userData.originalRotation.x - clampedVerticalAngle) * smoothFactor;
  weaponGroup.rotation.y = weaponGroup.rotation.y * (1 - smoothFactor) + 
                          (weaponGroup.userData.originalRotation.y - clampedHorizontalAngle) * smoothFactor;
} 