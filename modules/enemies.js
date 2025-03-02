/**
 * Enemies module for creating and managing Nazi enemies
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

/**
 * Creates a single enemy with improved model
 * @param {THREE.Scene} scene - The scene to add the enemy to
 * @param {number} spawnRadius - Distance from center to spawn
 * @param {number} health - Enemy health
 * @param {number} speed - Enemy movement speed
 * @returns {Object} - The enemy object
 */
export function createEnemy(scene, spawnRadius, health, speed) {
  // Random angle around the circle
  const angle = Math.random() * Math.PI * 2;
  // Position on the circle
  const x = Math.cos(angle) * spawnRadius;
  const z = Math.sin(angle) * spawnRadius;
  
  // Enemy container
  const enemyGroup = new THREE.Group();
  enemyGroup.position.set(x, 0, z);
  
  // Add to scene
  scene.add(enemyGroup);
  
  // Create the enemy object with enhanced properties
  const enemy = {
    object: enemyGroup,
    health: health,
    speed: speed,
    isDead: false,
    deadTime: 0,
    removalDelay: 10, // seconds before removal
    isAttacking: false,
    attackCooldown: false,
    attackTime: 0,
    attackDuration: 1.0, // seconds
    attackCooldownTime: 0,
    attackCooldownDuration: 2.0, // seconds
    lastShootTime: 0,
    shootingCooldown: 1.5, // REDUCED: seconds between shots (from 3.0 to 1.5)
    strafeDirection: Math.random() > 0.5 ? 1 : -1, // Random initial strafe direction
    strafeTimer: 0,
    strafeDuration: 2 + Math.random() * 3, // Random strafe duration between 2-5 seconds
    userData: {
      // These will be set when the body parts are created
      head: null,
      leftArm: null,
      rightArm: null,
      leftLeg: null,
      rightLeg: null,
      body: null,
      // Track dismembered parts
      dismemberedParts: {
        head: false,
        leftArm: false,
        rightArm: false,
        leftLeg: false,
        rightLeg: false
      }
    }
  };
  
  // Create enemy body parts
  createEnemyBodyParts(enemy);
  
  return enemy;
}

/**
 * Creates the body parts for an enemy
 * @param {Object} enemy - The enemy object to create parts for
 */
function createEnemyBodyParts(enemy) {
  if (!enemy || !enemy.object) return;
  
  const enemyContainer = enemy.object;
  
  // Create direction marker for debugging
  const markerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const frontMarker = new THREE.Mesh(markerGeometry, markerMaterial);
  frontMarker.position.set(0, 0, -0.5); // Negative Z is forward
  frontMarker.visible = false; // Debug marker - set to true if needed
  enemyContainer.add(frontMarker);
  
  // Enemy body - improved Nazi soldier with better proportions
  const bodyGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x4e5754, // German field gray uniform
    roughness: 0.7,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.9; // Half the height
  body.castShadow = true;
  body.name = "body";
  enemyContainer.add(body);
  
  // Store reference to body mesh
  enemy.userData.body = body;
  
  // Shoulders for better dimension
  const shoulderGeometry = new THREE.BoxGeometry(1.1, 0.3, 0.65);
  const shoulderMesh = new THREE.Mesh(shoulderGeometry, bodyMaterial);
  shoulderMesh.position.set(0, 1.4, 0);
  shoulderMesh.castShadow = true;
  enemyContainer.add(shoulderMesh);
  
  // Head with detailed face
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.9, 0);
  headGroup.name = "head";
  enemyContainer.add(headGroup);
  
  const headGeometry = new THREE.BoxGeometry(0.65, 0.75, 0.7);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0d0a0, // Skin tone
    roughness: 0.6
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  headGroup.add(head);
  
  // Store reference to head mesh
  enemy.userData.head = headGroup;
  
  // Face details - eyes
  const eyeGeometry = new THREE.SphereGeometry(0.07, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a282a, // Dark eyes
    roughness: 0.2
  });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.18, 0.1, 0.35);
  headGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.18, 0.1, 0.35);
  headGroup.add(rightEye);
  
  // Add helmet
  const helmetGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const helmetMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a, // Field gray
    roughness: 0.7,
    metalness: 0.3
  });
  const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
  helmet.scale.set(1, 0.8, 1.1);
  helmet.position.y = 0.3;
  headGroup.add(helmet);
  
  // Arms
  const armGeometry = new THREE.BoxGeometry(0.25, 0.9, 0.25);
  const armMaterial = bodyMaterial;
  
  // Left arm
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.55, 0.9, 0);
  leftArm.castShadow = true;
  leftArm.name = "leftArm";
  enemyContainer.add(leftArm);
  
  // Store reference to left arm mesh
  enemy.userData.leftArm = leftArm;
  
  // Right arm
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.55, 0.9, 0);
  rightArm.castShadow = true;
  rightArm.name = "rightArm";
  enemyContainer.add(rightArm);
  
  // Store reference to right arm mesh
  enemy.userData.rightArm = rightArm;
  
  // Hands
  const handGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const handMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0d0a0, // Skin tone
    roughness: 0.6
  });
  
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.55, 0.4, 0);
  leftHand.castShadow = true;
  enemyContainer.add(leftHand);
  
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.55, 0.4, 0);
  rightHand.castShadow = true;
  enemyContainer.add(rightHand);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.3, 1.1, 0.3);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d3d29, // Darker gray for pants
    roughness: 0.8
  });
  
  // Left leg
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.25, -0.6, 0);
  leftLeg.castShadow = true;
  leftLeg.name = "leftLeg";
  enemyContainer.add(leftLeg);
  
  // Store reference to left leg mesh
  enemy.userData.leftLeg = leftLeg;
  
  // Right leg
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.25, -0.6, 0);
  rightLeg.castShadow = true;
  rightLeg.name = "rightLeg";
  enemyContainer.add(rightLeg);
  
  // Store reference to right leg mesh
  enemy.userData.rightLeg = rightLeg;
  
  // Boots
  const bootGeometry = new THREE.BoxGeometry(0.33, 0.25, 0.35);
  const bootMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Black boots
    roughness: 0.7,
    metalness: 0.1
  });
  
  const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  leftBoot.position.set(-0.25, -1.3, 0.02);
  leftBoot.castShadow = true;
  enemyContainer.add(leftBoot);
  
  const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  rightBoot.position.set(0.25, -1.3, 0.02);
  rightBoot.castShadow = true;
  enemyContainer.add(rightBoot);
  
  // Create gun in right hand
  const gunGroup = new THREE.Group();
  gunGroup.position.set(0.55, 0.6, 0.3);
  enemyContainer.add(gunGroup);
  
  // Gun body
  const gunBodyGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.8);
  const gunMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d2d2d, // Dark metal
    metalness: 0.7,
    roughness: 0.3
  });
  const gunBody = new THREE.Mesh(gunBodyGeometry, gunMaterial);
  gunGroup.add(gunBody);
  
  // Gun magazine
  const magazineGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.1);
  const magazine = new THREE.Mesh(magazineGeometry, gunMaterial);
  magazine.position.set(0, -0.2, 0);
  gunGroup.add(magazine);
  
  // Gun barrel
  const barrelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
  const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.6;
  gunGroup.add(barrel);
  
  // Rotate the entire enemy to face outward
  enemyContainer.rotation.y = Math.PI;
}

/**
 * Spawns a wave of enemies
 * @param {THREE.Scene} scene - The scene to add enemies to
 * @param {number} wave - Current wave number
 * @param {number} maxEnemies - Maximum number of enemies allowed
 * @param {number} spawnRadius - Distance from center to spawn
 * @param {number} baseHealth - Base enemy health
 * @param {number} baseSpeed - Base enemy speed
 * @returns {Array} - Array of created enemies
 */
export function spawnWave(scene, wave, maxEnemies, spawnRadius, baseHealth, baseSpeed) {
  // Calculate number of enemies for this wave (increasing with wave number)
  const enemiesForWave = Math.min(Math.floor(wave * 2 + 3), maxEnemies);
  console.log(`Spawning wave ${wave} with ${enemiesForWave} enemies`);
  
  // Scale difficulty with wave number
  const healthMultiplier = 1 + (wave - 1) * 0.2; // +20% health per wave
  const speedMultiplier = 1 + (wave - 1) * 0.1; // +10% speed per wave
  
  // Create array to hold enemies
  const enemies = [];
  
  // Create enemies
  for (let i = 0; i < enemiesForWave; i++) {
    // Calculate enemy health and speed based on wave
    const health = Math.round(baseHealth * healthMultiplier);
    const speed = baseSpeed * speedMultiplier;
    
    // Create enemy at spawn radius
    const enemy = createEnemy(scene, spawnRadius, health, speed);
    
    // Set enemy properties for wave logic
    enemy.wave = wave;
    
    // Add attack properties
    enemy.isAttacking = false;
    enemy.attackTime = 0;
    enemy.attackCooldown = false;
    
    // Add to array
    enemies.push(enemy);
  }
  
  return enemies;
}

/**
 * Updates all enemies positions and states
 * @param {Array} enemies - Array of enemy objects
 * @param {THREE.Vector3} playerPosition - Current player position
 * @param {number} deltaTime - Time elapsed since last frame
 * @param {THREE.Scene} scene - The scene
 * @param {Array} projectiles - Array to store new projectiles
 */
export function updateEnemies(enemies, playerPosition, deltaTime, scene, projectiles = []) {
  // Temporary array to store enemies that should be removed
  let enemiesToRemove = [];
  
  // Update each enemy
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    
    // Skip updates for dead enemies but still track their removal
    if (enemy.isDead) {
      enemy.deadTime += deltaTime;
      if (enemy.deadTime > enemy.removalDelay) {
        enemiesToRemove.push(i);
      }
      continue;
    }
    
    // Store original position for collision detection
    const originalPosition = enemy.object.position.clone();
    
    // Calculate direction to player
    const directionToPlayer = new THREE.Vector3(
      playerPosition.x - enemy.object.position.x,
      playerPosition.y - enemy.object.position.y, // Include Y for aiming
      playerPosition.z - enemy.object.position.z
    );
    
    // Calculate distance to player
    const distanceToPlayer = directionToPlayer.length();
    
    // Always face toward player - even when shooting
    enemy.object.lookAt(new THREE.Vector3(
      playerPosition.x,
      enemy.object.position.y,
      playerPosition.z
    ));
    
    // ADDED: Update strafe timer
    enemy.strafeTimer += deltaTime;
    if (enemy.strafeTimer > enemy.strafeDuration) {
      // Change strafe direction when timer expires
      enemy.strafeDirection *= -1;
      enemy.strafeTimer = 0;
      enemy.strafeDuration = 2 + Math.random() * 3; // New random duration
    }
    
    // Move to maintain optimal shooting distance (between 15 and 35 units)
    const optimalMinDistance = 15;
    const optimalMaxDistance = 35;
    
    // MODIFIED: Movement logic with strafing
    if (distanceToPlayer > optimalMaxDistance) {
      // Too far, move closer
      const moveDirection = directionToPlayer.clone().normalize();
      enemy.object.position.x += moveDirection.x * enemy.speed * deltaTime;
      enemy.object.position.z += moveDirection.z * enemy.speed * deltaTime;
    }
    else if (distanceToPlayer < optimalMinDistance) {
      // Too close, back up
      const moveDirection = directionToPlayer.clone().normalize().negate();
      enemy.object.position.x += moveDirection.x * enemy.speed * deltaTime;
      enemy.object.position.z += moveDirection.z * enemy.speed * deltaTime;
    }
    else {
      // In optimal range - strafe sideways while shooting
      // Calculate perpendicular vector to directionToPlayer for strafing
      const perpendicularDirection = new THREE.Vector3(
        -directionToPlayer.z, 
        0, 
        directionToPlayer.x
      ).normalize();
      
      // Apply strafe movement
      enemy.object.position.x += perpendicularDirection.x * enemy.speed * 0.7 * enemy.strafeDirection * deltaTime;
      enemy.object.position.z += perpendicularDirection.z * enemy.speed * 0.7 * enemy.strafeDirection * deltaTime;
      
      // In shooting range - attempt to shoot at player
      const currentTime = performance.now() / 1000; // Current time in seconds
      
      if ((currentTime - enemy.lastShootTime) > enemy.shootingCooldown) {
        // Time to shoot!
        enemy.lastShootTime = currentTime;
        
        // Only shoot if we have the createEnemyProjectile function
        if (window.createEnemyProjectile) {
          // Get gun position (from the enemy's right hand/arm)
          const gunOffset = new THREE.Vector3(0.3, 1.4, 0.2); // Position relative to enemy
          const gunPosition = enemy.object.position.clone().add(gunOffset);
          
          // Calculate player head position (approximately at eye level)
          const playerHeadPosition = playerPosition.clone();
          playerHeadPosition.y = playerPosition.y + 1.6; // Assuming player's camera/head is around 1.6 units above the ground
          
          // Direction from gun position to player's head (not just from enemy position)
          const preciseDirectionToPlayer = new THREE.Vector3();
          preciseDirectionToPlayer.subVectors(playerHeadPosition, gunPosition).normalize();
          
          // Create projectile with improved accuracy
          // Calculate accuracy based on distance to player - closer = more accurate
          const distanceFactor = Math.max(0, Math.min(1, 1 - ((distanceToPlayer - optimalMinDistance) / (optimalMaxDistance - optimalMinDistance))));
          const baseAccuracy = 0.8; // Increased base accuracy from 0.7 to 0.8
          const accuracy = baseAccuracy + (distanceFactor * 0.15); // Accuracy between 0.8-0.95 based on distance
          
          // Get tracer visibility setting - default to true if not defined
          const showBulletTracers = window.gameState && window.gameState.showBulletTracers !== undefined ? 
                                   window.gameState.showBulletTracers : true;
          
          // Create enemy projectile with more precise aiming
          const enemyBullet = window.createEnemyProjectile(scene, gunPosition, preciseDirectionToPlayer, accuracy);
          
          // Ensure the bullet components (particularly trail) are always visible
          if (enemyBullet) {
            // Set visibility based on game state
            if (enemyBullet.trail) {
              enemyBullet.trail.visible = showBulletTracers;
              // Set trail to render on top to increase visibility
              enemyBullet.trail.renderOrder = 999;
              // Make trail thicker if possible
              enemyBullet.trail.material.linewidth = 3;
            }
            
            if (enemyBullet.glow) {
              enemyBullet.glow.visible = showBulletTracers;
              // Make glow more prominent
              enemyBullet.glow.scale.set(0.4, 0.4, 1.0);
            }
            
            // Add to projectiles array if provided
            if (projectiles && Array.isArray(projectiles)) {
              projectiles.push(enemyBullet);
            }
          }
          
          // Trigger muzzle flash - bigger flash for enemy shots
          if (window.createMuzzleFlash) {
            const flash = window.createMuzzleFlash(scene, gunPosition, preciseDirectionToPlayer);
            // Make flash more visible
            if (flash && flash.scale) {
              flash.scale.multiplyScalar(1.5);
            }
          }
        }
      }
    }
    
    // Apply collision detection with other enemies
    applyEnemyCollisions(enemy, enemies, i, originalPosition);
    
    // Animate walking
    animateEnemyWalking(enemy, deltaTime);
  }
  
  // Remove dead enemies from the scene
  for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
    const indexToRemove = enemiesToRemove[i];
    const enemy = enemies[indexToRemove];
    
    if (enemy.object) {
      scene.remove(enemy.object);
    }
    
    enemies.splice(indexToRemove, 1);
  }
}

/**
 * Applies collision detection and resolution between enemies
 * @param {Object} currentEnemy - The enemy to check collisions for
 * @param {Array} enemies - Array of all enemies
 * @param {number} currentIndex - Index of the current enemy
 * @param {THREE.Vector3} originalPosition - Original position before movement
 */
function applyEnemyCollisions(currentEnemy, enemies, currentIndex, originalPosition) {
  // Skip collision detection for dead enemies
  if (currentEnemy.health <= 0) return;
  
  // Enemy collision parameters
  const enemyRadius = 0.5; // Collision radius for enemies
  const minSeparation = enemyRadius * 2; // Minimum distance between enemy centers
  const pushFactor = 0.6; // How strongly enemies push each other (0-1)
  
  // Check collision with each other enemy
  for (let i = 0; i < enemies.length; i++) {
    // Skip self or dead enemies
    if (i === currentIndex || enemies[i].health <= 0) continue;
    
    const otherEnemy = enemies[i];
    
    // Calculate distance between enemies
    const distance = currentEnemy.object.position.distanceTo(otherEnemy.object.position);
    
    // If too close, resolve collision
    if (distance < minSeparation) {
      // Direction from other enemy to current enemy
      const pushDirection = new THREE.Vector3();
      pushDirection.subVectors(currentEnemy.object.position, otherEnemy.object.position).normalize();
      
      // Calculate overlap
      const overlap = minSeparation - distance;
      
      // Push current enemy away from other enemy
      const pushVector = pushDirection.clone().multiplyScalar(overlap * pushFactor);
      currentEnemy.object.position.add(pushVector);
      
      // Also push other enemy in opposite direction (for more stable resolution)
      const otherPushVector = pushDirection.clone().negate().multiplyScalar(overlap * pushFactor * 0.5);
      otherEnemy.object.position.add(otherPushVector);
    }
  }
  
  // Prevent enemies from getting too far from their path to the player
  // This helps prevent enemies from getting stuck or pushed too far away
  const currentDisplacement = new THREE.Vector3();
  currentDisplacement.subVectors(currentEnemy.object.position, originalPosition);
  
  // If displacement is too large, limit it
  const maxDisplacement = 0.2; // Maximum displacement per frame due to collisions
  if (currentDisplacement.length() > maxDisplacement) {
    currentDisplacement.normalize().multiplyScalar(maxDisplacement);
    currentEnemy.object.position.copy(originalPosition).add(currentDisplacement);
  }
}

/**
 * Updates enemy animations based on movement and actions
 * @param {Object} enemy - The enemy object
 * @param {number} deltaTime - Time since last frame
 */
function updateEnemyAnimations(enemy, deltaTime) {
  const userData = enemy.userData;
  
  // Update animation time
  userData.animationTime += deltaTime * 4; // Animation speed multiplier
  
  // Walking animation
  if (userData.isWalking) {
    // Leg animation - walking cycle with increased amplitude
    const legAngle = Math.sin(userData.animationTime) * 0.4; // Increased from 0.25 to 0.4
    
    // Left leg swings opposite to right leg
    if (!userData.dismemberedParts.leftLeg) {
      userData.leftLeg.rotation.x = legAngle;
    }
    
    if (!userData.dismemberedParts.rightLeg) {
      userData.rightLeg.rotation.x = -legAngle;
    }
    
    // Arm animation - walking cycle (opposite to legs) with increased amplitude
    const armAngle = Math.sin(userData.animationTime) * 0.3; // Increased from 0.15 to 0.3
    
    // Arms swing opposite to legs
    if (!userData.dismemberedParts.leftArm) {
      userData.leftArm.rotation.x = -armAngle;
    }
    
    if (!userData.dismemberedParts.rightArm) {
      userData.rightArm.rotation.x = armAngle;
    }
    
    // Slight body bounce with increased amplitude
    const bounceHeight = Math.abs(Math.sin(userData.animationTime * 2)) * 0.1; // Increased from 0.05 to 0.1
    enemy.object.position.y = bounceHeight;
    
    // Debug log to confirm animation is running
    if (Math.random() < 0.0005) { // Very occasional log to avoid flooding console
      console.log("Enemy walking animation active", legAngle);
    }
  }
  
  // Hit animation
  if (userData.isHit) {
    userData.hitTime += deltaTime * 10;
    
    // Flash red when hit (more intense)
    if (userData.hitTime < 0.2) {
      // Flash body bright red
      userData.body.material.color.set(0xff0000);
      
      // Add a slight backward movement when hit
      const hitDirection = new THREE.Vector3();
      hitDirection.subVectors(enemy.object.position, { x: 0, y: 0, z: 0 }).normalize();
      enemy.object.position.addScaledVector(hitDirection, 0.05);
      
      // Debug log to confirm hit animation
      console.log("Enemy hit animation active");
    } else {
      // Reset color
      userData.body.material.color.copy(userData.bodyColor);
      userData.isHit = false;
      userData.hitTime = 0;
    }
  }
}

/**
 * Triggers the hit animation for an enemy
 * @param {Object} enemy - The enemy object
 */
export function triggerEnemyHitAnimation(enemy) {
  enemy.userData.isHit = true;
  enemy.userData.hitTime = 0;
}

/**
 * Triggers the death animation for an enemy
 * @param {Object} enemy - The enemy object
 * @param {THREE.Scene} scene - The scene
 * @param {boolean} isHeadshot - Whether the kill was a headshot
 */
export function triggerEnemyDeathAnimation(enemy, scene, isHeadshot) {
  console.log("Enemy death animation triggered, isHeadshot:", isHeadshot);
  
  // Set dead state
  enemy.isDead = true;
  
  // Create simplified copy for death animation to avoid circular references
  const deathObject = enemy.object;
  
  // Apply death animation
  if (isHeadshot) {
    // Headshot death - strong impulse backwards
    deathObject.rotation.x = -Math.PI / 2; // Fall backward
    
    // Apply more dramatic falling animation
    const fallTween = () => {
      let progress = 0;
      const animate = () => {
        if (progress <= 1) {
          // Fall to the ground gradually
          deathObject.rotation.x = Math.lerp(0, -Math.PI / 2, progress);
          deathObject.position.y = Math.lerp(0, 0.2, Math.sin(progress * Math.PI));
          
          progress += 0.05;
          requestAnimationFrame(animate);
        }
      };
      animate();
    };
    
    fallTween();
  } else {
    // Regular death - fall forward or to the side
    const fallDirection = Math.random() > 0.5 ? -1 : 1;
    const fallSideways = Math.random() > 0.7; // 30% chance to fall sideways
    
    if (fallSideways) {
      // Fall sideways
      deathObject.rotation.z = fallDirection * Math.PI / 2;
    } else {
      // Fall forward/backward
      deathObject.rotation.x = fallDirection * Math.PI / 3;
    }
    
    // Apply gradual falling animation
    const fallTween = () => {
      let progress = 0;
      const finalRotationX = fallSideways ? 0 : (fallDirection * Math.PI / 2);
      const finalRotationZ = fallSideways ? (fallDirection * Math.PI / 2) : 0;
      
      const animate = () => {
        if (progress <= 1) {
          if (!fallSideways) {
            deathObject.rotation.x = Math.lerp(0, finalRotationX, progress);
          } else {
            deathObject.rotation.z = Math.lerp(0, finalRotationZ, progress);
          }
          
          // Make them fall to the ground
          deathObject.position.y = Math.max(0.2, Math.lerp(0, 0.2, 1 - progress));
          
          progress += 0.03;
          requestAnimationFrame(animate);
        }
      };
      animate();
    };
    
    fallTween();
  }
}

/**
 * Handles dismemberment of enemy body parts
 * @param {Object} enemy - The enemy object
 * @param {THREE.Scene} scene - The scene
 * @param {string} bodyPart - The body part to dismember
 * @param {THREE.Vector3} hitPoint - The point where the hit occurred
 * @param {THREE.Vector3} hitDirection - The direction of the hit
 * @returns {boolean} - Whether the enemy was killed (headshot)
 */
export function dismemberEnemyPart(enemy, scene, bodyPart, hitPoint, hitDirection) {
  // Skip if missing required parameters
  if (!enemy || !scene || !bodyPart) {
    console.error("Missing required parameters for dismemberEnemyPart");
    return false;
  }
  
  // Check for low FPS to use simplified dismemberment
  const isLowFPS = window.reducedEffects || false;
  
  // Initialize userData if it doesn't exist
  if (!enemy.userData) {
    enemy.userData = {};
  }
  
  // Check if this part is already dismembered
  if (enemy.userData.dismemberedParts && enemy.userData.dismemberedParts[bodyPart]) {
    return false;
  }
  
  // Mark this part as dismembered
  if (enemy.userData.dismemberedParts) {
    enemy.userData.dismemberedParts[bodyPart] = true;
  }
  
  // Get the mesh for the body part - without stringifying the entire object
  let partMesh = null;
  
  // Default attachment point for blood effect
  const attachmentPoint = new THREE.Vector3(0, 0, 0);
  
  // Flag for headshot
  let isHeadshot = false;
  
  // Determine which body part to dismember
  switch (bodyPart) {
    case 'head':
      partMesh = enemy.userData.head;
      // Store attachment point for blood effect
      attachmentPoint.set(0, 1.8, 0);
      isHeadshot = true;
      break;
    case 'leftArm':
      partMesh = enemy.userData.leftArm;
      attachmentPoint.set(-0.4, 1.3, 0);
      break;
    case 'rightArm':
      partMesh = enemy.userData.rightArm;
      attachmentPoint.set(0.4, 1.3, 0);
      break;
    case 'leftLeg':
      partMesh = enemy.userData.leftLeg;
      attachmentPoint.set(-0.2, 0.5, 0);
      break;
    case 'rightLeg':
      partMesh = enemy.userData.rightLeg;
      attachmentPoint.set(0.2, 0.5, 0);
      break;
    default:
      // Unknown body part
      return false;
  }
  
  // Skip if part mesh not found
  if (!partMesh) {
    return false;
  }
  
  try {
    // Create velocity for the dismembered part
    const velocity = hitDirection.clone().multiplyScalar(0.2);
    velocity.y = 0.1; // Add some upward movement
    
    // Create rotation velocity
    const rotationVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    
    // Get world position of the part before removing it
    const worldPosition = new THREE.Vector3();
    partMesh.getWorldPosition(worldPosition);
    
    // Save part's transformation
    const partPosition = worldPosition.clone();
    const partRotation = partMesh.rotation.clone();
    const partScale = partMesh.scale.clone();
    
    // Hide the original part
    partMesh.visible = false;
    
    // Create a clone of the part for the dismemberment animation
    // Simply create a basic shape instead of cloning to avoid circular references
    let dismemberedPart;
    
    if (bodyPart === 'head') {
      // Create a sphere for the head
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshStandardMaterial({ color: 0xffccbb });
      dismemberedPart = new THREE.Mesh(geometry, material);
    } else if (bodyPart.includes('Arm')) {
      // Create a cylinder for arms
      const geometry = new THREE.CylinderGeometry(0.07, 0.05, 0.4, 8);
      const material = new THREE.MeshStandardMaterial({ color: 0xffccbb });
      dismemberedPart = new THREE.Mesh(geometry, material);
    } else {
      // Create a cylinder for legs
      const geometry = new THREE.CylinderGeometry(0.1, 0.07, 0.6, 8);
      const material = new THREE.MeshStandardMaterial({ color: 0xffccbb });
      dismemberedPart = new THREE.Mesh(geometry, material);
    }
    
    // Position the dismembered part
    dismemberedPart.position.copy(partPosition);
    dismemberedPart.rotation.copy(partRotation);
    dismemberedPart.scale.copy(partScale);
    
    // Add to scene
    scene.add(dismemberedPart);
    
    // Animate the dismembered part
    animateDismemberedPart(scene, dismemberedPart, velocity, rotationVelocity, isLowFPS);
    
    // Create blood effects at attachment point
    createBloodEffect(scene, enemy.object, attachmentPoint, hitDirection, isHeadshot);
    
    return true;
  } catch (error) {
    console.error("Error during dismemberment:", error);
    return false;
  }
}

/**
 * Animates a dismembered part falling with physics
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Object3D} part - The dismembered part
 * @param {THREE.Vector3} velocity - Initial velocity
 * @param {THREE.Vector3} rotationVelocity - Initial rotation velocity
 * @param {boolean} isLowFPS - Whether to use simplified effects
 */
function animateDismemberedPart(scene, part, velocity, rotationVelocity, isLowFPS) {
  // Skip if missing required parameters
  if (!scene || !part || !velocity || !rotationVelocity) return;
  
  // Animate the part falling with improved physics
  let timeElapsed = 0;
  const gravity = 0.025; // Increased gravity
  const drag = 0.98;
  const bounceFactor = 0.5; // How bouncy the parts are
  
  const animate = () => {
    timeElapsed += 0.016; // Approximate for 60fps
    
    // Move part
    part.position.add(velocity);
    
    // Apply gravity with increasing effect
    velocity.y -= gravity;
    
    // Apply drag
    velocity.multiplyScalar(drag);
    
    // Apply rotation with damping over time
    part.rotation.x += rotationVelocity.x;
    part.rotation.y += rotationVelocity.y;
    part.rotation.z += rotationVelocity.z;
    
    // Dampen rotation
    rotationVelocity.multiplyScalar(0.98);
    
    // Bounce if hitting the ground
    if (part.position.y < 0) {
      part.position.y = 0;
      
      // Only bounce if velocity is significant
      if (Math.abs(velocity.y) > 0.05) {
        velocity.y = -velocity.y * bounceFactor; // Bounce with energy loss
      } else {
        velocity.y = 0; // Stop bouncing if too slow
      }
      
      // Apply friction to horizontal movement
      velocity.x *= 0.7; // Friction
      velocity.z *= 0.7; // Friction
    }
    
    // Continue animation if part still exists and hasn't settled
    if (part.parent === scene && (Math.abs(velocity.length()) > 0.01 || part.position.y > 0.1)) {
      requestAnimationFrame(animate);
    }
  };
  
  // Start animation
  animate();
  
  // Remove after a few seconds
  setTimeout(() => {
    if (part.parent === scene) {
      scene.remove(part);
    }
  }, 10000); // 10 seconds
}

/**
 * Creates a blood spray effect
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Object3D} enemyObject - The enemy object
 * @param {THREE.Vector3} attachmentPoint - Local position where the part was attached
 * @param {THREE.Vector3} hitDirection - Direction of the hit
 * @param {boolean} isHeadshot - Whether this is a headshot
 */
function createBloodEffect(scene, enemyObject, attachmentPoint, hitDirection, isHeadshot) {
  // Skip if missing required parameters
  if (!scene || !enemyObject || !attachmentPoint) return;
  
  // Ensure hitDirection is valid
  const safeHitDirection = hitDirection instanceof THREE.Vector3 ? 
    hitDirection.clone() : new THREE.Vector3(0, 0, -1);
  
  // Convert attachment point to world position
  const worldPos = attachmentPoint.clone();
  worldPos.applyMatrix4(enemyObject.matrixWorld);
  
  // Number of blood particles
  const particleCount = isHeadshot ? 70 : 40; // Increased particle count
  
  // Create blood particles
  for (let i = 0; i < particleCount; i++) {
    // Create a small sphere for blood droplet
    const size = Math.random() * 0.1 + 0.02; // Larger blood droplets
    const geometry = new THREE.SphereGeometry(size, 4, 4);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xbb0a1e,
      transparent: true,
      opacity: 0.9
    });
    
    const bloodDrop = new THREE.Mesh(geometry, material);
    bloodDrop.position.copy(worldPos);
    
    // Add small random offset
    bloodDrop.position.x += (Math.random() - 0.5) * 0.1;
    bloodDrop.position.y += (Math.random() - 0.5) * 0.1;
    bloodDrop.position.z += (Math.random() - 0.5) * 0.1;
    
    scene.add(bloodDrop);
    
    // Calculate velocity - mostly in hit direction but with spread
    const spreadFactor = 0.7; // Increased spread
    const velocity = safeHitDirection.clone().multiplyScalar(0.3 + Math.random() * 0.4); // Increased velocity
    velocity.x += (Math.random() - 0.5) * spreadFactor;
    velocity.y += (Math.random() - 0.5) * spreadFactor + 0.3; // Add upward component
    velocity.z += (Math.random() - 0.5) * spreadFactor;
    
    // Animate blood droplet
    let timeElapsed = 0;
    let lifespan = 1 + Math.random() * 3; // 1-4 seconds - changed from const to let
    const gravity = 0.015;
    
    const animate = () => {
      timeElapsed += 0.016; // Approximate for 60fps
      
      // Move droplet
      bloodDrop.position.add(velocity);
      
      // Apply gravity
      velocity.y -= gravity;
      
      // Apply drag
      velocity.multiplyScalar(0.98);
      
      // Fade out over time
      if (timeElapsed > lifespan * 0.7) {
        const fadeProgress = (timeElapsed - lifespan * 0.7) / (lifespan * 0.3);
        material.opacity = 0.9 * (1 - fadeProgress);
      }
      
      // If hitting ground, create splatter and stop
      if (bloodDrop.position.y < 0) {
        bloodDrop.position.y = 0;
        
        // Create a blood splatter on the ground
        try {
          createBloodSplatter(scene, bloodDrop.position.clone());
        } catch (error) {
          console.error("Error creating blood splatter:", error);
        }
        
        // Remove the droplet
        scene.remove(bloodDrop);
        return;
      }
      
      // Continue animation if droplet still exists and hasn't expired
      if (bloodDrop.parent === scene && timeElapsed < lifespan) {
        requestAnimationFrame(animate);
      } else if (bloodDrop.parent === scene) {
        scene.remove(bloodDrop);
      }
    };
    
    // Start animation
    animate();
  }
}

/**
 * Creates a blood splatter effect on surfaces
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position of the splatter
 */
function createBloodSplatter(scene, position) {
  // Create fewer splatter particles for better performance
  const particleCount = 3 + Math.floor(Math.random() * 3); // Reduced from typical 5-10
  
  for (let i = 0; i < particleCount; i++) {
    // Create a small red sphere for blood
    const size = 0.02 + Math.random() * 0.04; // Smaller particles
    const geometry = new THREE.SphereGeometry(size, 3, 3); // Simplified geometry
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
    
    // Particle lifetime - changed from const to let so it can be modified
    let lifetime = 2.0 + Math.random() * 2.0; // seconds
    
    // Animate fade out
    const animate = () => {
      lifetime -= 0.05;
      if (lifetime <= 0) {
        scene.remove(particle);
        return;
      }
      
      // Fade out over time
      if (lifetime < 1.0) {
        material.opacity = lifetime * 0.8;
      }
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
  }
}

/**
 * Creates a blood pool under a fallen enemy
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position of the pool
 */
function createBloodPool(scene, position) {
  // Create a larger flat disc for the blood pool
  const geometry = new THREE.CircleGeometry(1.0, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xbb0a1e,
    transparent: true,
    opacity: 0.0 // Start invisible and fade in
  });
  
  const pool = new THREE.Mesh(geometry, material);
  pool.position.copy(position);
  pool.position.y = 0.02; // Slightly above ground to avoid z-fighting
  pool.rotation.x = -Math.PI / 2; // Lay flat on ground
  
  scene.add(pool);
  
  // Grow and fade over time
  let age = 0;
  const growDuration = 3.0; // seconds to reach full size
  const lifespan = 20.0; // seconds before fading out
  const initialScale = 0.2;
  const targetScale = 1.0;
  
  pool.scale.set(initialScale, initialScale, initialScale);
  
  const animate = () => {
    age += 0.016;
    
    // Grow and fade in
    if (age < growDuration) {
      const progress = age / growDuration;
      const scale = initialScale + (targetScale - initialScale) * progress;
      pool.scale.set(scale, scale, scale);
      material.opacity = 0.8 * progress;
    }
    // Fade out gradually
    else if (age > lifespan - 5.0) {
      const fadeProgress = (age - (lifespan - 5.0)) / 5.0;
      material.opacity = 0.8 * (1 - fadeProgress);
    }
    
    // Continue animation if pool still exists and hasn't expired
    if (pool.parent === scene && age < lifespan) {
      requestAnimationFrame(animate);
    } else if (pool.parent === scene) {
      scene.remove(pool);
    }
  };
  
  // Start animation
  animate();
}

/**
 * Creates a small blood splatter when a dismembered part hits the ground
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position of the impact
 */
function createImpactBloodSplatter(scene, position) {
  // Create several small blood splatters
  const splatCount = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < splatCount; i++) {
    // Random size and position offset
    const size = 0.05 + Math.random() * 0.15;
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      0,
      (Math.random() - 0.5) * 0.3
    );
    
    const geometry = new THREE.CircleGeometry(size, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xbb0a1e,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3
    });
    
    const splatter = new THREE.Mesh(geometry, material);
    splatter.position.copy(position).add(offset);
    splatter.position.y = 0.01; // Slightly above ground
    splatter.rotation.x = -Math.PI / 2; // Lay flat on ground
    splatter.rotation.z = Math.random() * Math.PI * 2; // Random rotation
    
    scene.add(splatter);
    
    // Fade out over time
    let age = 0;
    const lifespan = 5 + Math.random() * 5; // 5-10 seconds
    
    const animate = () => {
      age += 0.016;
      
      // Fade out gradually
      if (age > lifespan * 0.6) {
        const fadeProgress = (age - lifespan * 0.6) / (lifespan * 0.4);
        material.opacity = Math.max(0, material.opacity * (1 - fadeProgress));
      }
      
      // Continue animation if splatter still exists and hasn't expired
      if (splatter.parent === scene && age < lifespan) {
        requestAnimationFrame(animate);
      } else if (splatter.parent === scene) {
        scene.remove(splatter);
      }
    };
    
    // Start animation
    animate();
  }
}

/**
 * Creates a continuous blood spurt effect at dismemberment point
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position of the spurt
 * @param {THREE.Vector3} direction - Direction of the spurt
 */
function createBloodSpurt(scene, position, direction) {
  // Skip if no scene or position
  if (!scene || !position) return;
  
  // Ensure direction is valid
  const safeDirection = direction instanceof THREE.Vector3 ? 
    direction.clone() : new THREE.Vector3(0, 0, -1);
  
  // Duration of the blood spurt effect
  const duration = 1000; // Reduced from 1500ms to 1000ms
  const startTime = Date.now();
  const spurtDirection = safeDirection.clone().negate(); // Spurt in opposite direction of hit
  
  // Add some randomness to the direction
  spurtDirection.x += (Math.random() - 0.5) * 0.3;
  spurtDirection.y += (Math.random() - 0.5) * 0.3 + 0.2; // Slight upward bias
  spurtDirection.z += (Math.random() - 0.5) * 0.3;
  spurtDirection.normalize();
  
  // Create spurt particles
  const spurtParticles = [];
  
  // Function to emit a single blood particle
  const emitParticle = () => {
    // Create a small red sphere for blood
    const size = 0.03 + Math.random() * 0.07;
    const geometry = new THREE.SphereGeometry(size, 4, 4); // Reduced geometry complexity
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xbb0a1e,
      transparent: true,
      opacity: 0.9
    });
    const particle = new THREE.Mesh(geometry, material);
    
    // Position at spurt origin with small random offset
    particle.position.copy(position);
    particle.position.x += (Math.random() - 0.5) * 0.1;
    particle.position.y += (Math.random() - 0.5) * 0.1;
    particle.position.z += (Math.random() - 0.5) * 0.1;
    
    // Add to scene
    scene.add(particle);
    spurtParticles.push(particle);
    
    // Calculate velocity - mostly in spurt direction but with spread
    const particleVelocity = spurtDirection.clone().multiplyScalar(0.2 + Math.random() * 0.3);
    particleVelocity.x += (Math.random() - 0.5) * 0.2;
    particleVelocity.y += (Math.random() - 0.5) * 0.2;
    particleVelocity.z += (Math.random() - 0.5) * 0.2;
    
    // Particle lifetime - changed from const to let
    let lifetime = 400 + Math.random() * 300; // Reduced from 500-1000ms to 400-700ms
    const particleStartTime = Date.now();
    
    // Animate particle
    const animateParticle = () => {
      const elapsed = Date.now() - particleStartTime;
      if (elapsed > lifetime || !particle.parent) {
        scene.remove(particle);
        return;
      }
      
      // Move particle
      particle.position.add(particleVelocity);
      
      // Apply gravity
      particleVelocity.y -= 0.01;
      
      // Fade out over time
      if (elapsed > lifetime * 0.7) {
        const fadeProgress = (elapsed - lifetime * 0.7) / (lifetime * 0.3);
        material.opacity = 0.9 * (1 - fadeProgress);
      }
      
      // If hitting ground, create splatter and stop
      if (particle.position.y < 0) {
        particle.position.y = 0;
        // Only create splatter for some particles to reduce load
        if (Math.random() < 0.3) {
          try {
            createBloodSplatter(scene, particle.position.clone());
          } catch (error) {
            console.error("Error creating blood splatter:", error);
          }
        }
        scene.remove(particle);
        return;
      }
      
      requestAnimationFrame(animateParticle);
    };
    
    // Start animation
    animateParticle();
  };
  
  // Emit particles over time - reduced frequency
  const emitInterval = setInterval(() => {
    // Check if we should stop emitting
    if (Date.now() - startTime > duration) {
      clearInterval(emitInterval);
      return;
    }
    
    // Emit 1-2 particles each time (reduced from 1-3)
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      try {
        emitParticle();
      } catch (error) {
        console.error("Error emitting particle:", error);
        clearInterval(emitInterval);
        return;
      }
    }
  }, 80); // Reduced frequency from 50ms to 80ms
}

/**
 * Creates a small blood pool under a dismembered part
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position of the pool
 * @param {string} bodyPart - The body part type
 */
function createSmallBloodPool(scene, position, bodyPart) {
  // Skip if missing required parameters
  if (!scene || !position) return;
  
  // Size based on body part
  let poolSize = 0.5; // Default size
  
  if (bodyPart === 'head') {
    poolSize = 0.7;
  } else if (bodyPart.includes('Arm')) {
    poolSize = 0.4;
  } else if (bodyPart.includes('Leg')) {
    poolSize = 0.5;
  }
  
  // Create a flat disc for the blood pool
  const geometry = new THREE.CircleGeometry(poolSize, 8); // Reduced segments from 12 to 8
  const material = new THREE.MeshBasicMaterial({
    color: 0xbb0a1e,
    transparent: true,
    opacity: 0.0 // Start invisible and fade in
  });
  
  const pool = new THREE.Mesh(geometry, material);
  pool.position.copy(position);
  pool.position.y = 0.01; // Slightly above ground to avoid z-fighting
  pool.rotation.x = -Math.PI / 2; // Lay flat on ground
  
  scene.add(pool);
  
  // Grow and fade over time
  let age = 0;
  const growDuration = 1.5; // Reduced from 2.0 to 1.5 seconds
  const lifespan = 10.0; // Reduced from 15.0 to 10.0 seconds
  const initialScale = 0.3;
  const targetScale = 1.0;
  
  pool.scale.set(initialScale, initialScale, initialScale);
  
  const animate = () => {
    age += 0.016;
    
    // Grow and fade in
    if (age < growDuration) {
      const progress = age / growDuration;
      const scale = initialScale + (targetScale - initialScale) * progress;
      pool.scale.set(scale, scale, scale);
      material.opacity = 0.7 * progress;
    }
    // Fade out gradually
    else if (age > lifespan - 3.0) {
      const fadeProgress = (age - (lifespan - 3.0)) / 3.0;
      material.opacity = 0.7 * (1 - fadeProgress);
    }
    
    // Continue animation if pool still exists and hasn't expired
    if (pool.parent === scene && age < lifespan) {
      requestAnimationFrame(animate);
    } else if (pool.parent === scene) {
      scene.remove(pool);
    }
  };
  
  // Start animation
  animate();
}

/**
 * Animates enemy walking motion
 * @param {Object} enemy - The enemy to animate
 * @param {number} deltaTime - Time since last frame
 */
function animateEnemyWalking(enemy, deltaTime) {
  // Skip if enemy is dead or has no userData
  if (enemy.isDead || !enemy.userData) return;
  
  // Get references to legs
  const leftLeg = enemy.userData.leftLeg;
  const rightLeg = enemy.userData.rightLeg;
  const leftArm = enemy.userData.leftArm;
  const rightArm = enemy.userData.rightArm;
  
  // Skip if any parts are missing
  if (!leftLeg || !rightLeg || !leftArm || !rightArm) return;
  
  // Initialize animation time if not set
  if (!enemy.animationTime) enemy.animationTime = 0;
  
  // Update animation time
  enemy.animationTime += deltaTime * 5; // Speed of walking animation
  
  // Calculate leg positions with walking motion
  const legOffset = Math.sin(enemy.animationTime) * 0.2;
  
  // Apply to legs (opposite phase)
  if (leftLeg.position && enemy.userData.leftLegPos) {
    leftLeg.position.z = enemy.userData.leftLegPos.z + legOffset;
  }
  
  if (rightLeg.position && enemy.userData.rightLegPos) {
    rightLeg.position.z = enemy.userData.rightLegPos.z - legOffset;
  }
  
  // Apply to arms (opposite phase from legs)
  if (leftArm.position && enemy.userData.leftArmPos) {
    leftArm.position.z = enemy.userData.leftArmPos.z - legOffset * 0.7;
  }
  
  if (rightArm.position && enemy.userData.rightArmPos) {
    rightArm.position.z = enemy.userData.rightArmPos.z + legOffset * 0.7;
  }
} 