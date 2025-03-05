/**
 * Enemies module for creating and managing Nazi enemies
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Make functions available globally
window.createSmallBloodPool = createSmallBloodPool;

// Global array to track active boats
let activeBoats = [];

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
  
  // Add isEnemy tag for collision detection
  enemyGroup.userData.isEnemy = true;
  
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
 * Creates a boat for enemy transport
 * @param {THREE.Scene} scene - The scene to add the boat to
 * @param {number} spawnAngle - Angle around the island to spawn the boat
 * @param {number} spawnDistance - Distance from island center to spawn
 * @param {number} enemyCount - Number of enemies to place on the boat
 * @param {number} health - Health for each enemy
 * @param {number} speed - Speed for each enemy
 * @returns {Object} - The boat object with enemies
 */
function createBoat(scene, spawnAngle, spawnDistance, enemyCount, health, speed) {
  // Calculate spawn position
  const x = Math.cos(spawnAngle) * spawnDistance;
  const z = Math.sin(spawnAngle) * spawnDistance;
  
  // Create boat container
  const boatGroup = new THREE.Group();
  boatGroup.position.set(x, 0, z);
  
  // Rotate boat to face the island center
  boatGroup.rotation.y = spawnAngle + Math.PI; // Face toward island
  
  // Create boat hull
  const hullGeometry = new THREE.BoxGeometry(3, 0.6, 8);
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, // Brown color for wooden boat
    roughness: 0.8,
    metalness: 0.2
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.position.y = 0.1; // Slightly above water
  boatGroup.add(hull);
  
  // Add boat details
  // Boat sides
  const sideGeometry = new THREE.BoxGeometry(0.2, 0.8, 8);
  const leftSide = new THREE.Mesh(sideGeometry, hullMaterial);
  leftSide.position.set(-1.4, 0.4, 0);
  boatGroup.add(leftSide);
  
  const rightSide = new THREE.Mesh(sideGeometry, hullMaterial);
  rightSide.position.set(1.4, 0.4, 0);
  boatGroup.add(rightSide);
  
  // Add German flag at the back
  const flagPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  const flagPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
  flagPole.position.set(0, 1.3, -3.5);
  boatGroup.add(flagPole);
  
  // Create flag
  const flagGeometry = new THREE.PlaneGeometry(1.2, 0.8);
  const flagMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFF0000, // Red for Nazi flag
    side: THREE.DoubleSide
  });
  const flag = new THREE.Mesh(flagGeometry, flagMaterial);
  flag.position.set(0.6, 1.8, -3.5);
  flag.rotation.y = Math.PI / 2;
  boatGroup.add(flag);
  
  // Add swastika symbol to flag (simplified as a plus)
  const swastikaGeometry = new THREE.PlaneGeometry(0.4, 0.4);
  const swastikaMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, // Black symbol
    side: THREE.DoubleSide
  });
  const swastika = new THREE.Mesh(swastikaGeometry, swastikaMaterial);
  swastika.position.set(0.61, 1.8, -3.5);
  swastika.rotation.y = Math.PI / 2;
  boatGroup.add(swastika);
  
  // Add boat to scene
  scene.add(boatGroup);
  
  // Create enemies but don't add them to the scene yet
  const enemies = [];
  const enemySpacing = 6 / (enemyCount + 1); // Distribute along boat length
  
  for (let i = 0; i < enemyCount; i++) {
    // Create enemy without adding to scene
    const enemy = createEnemyForBoat(scene, health, speed);
    
    // Position enemy in the boat
    const enemyObject = enemy.object;
    enemyObject.position.set(
      (Math.random() - 0.5) * 1.5, // Random position across boat width
      0.8, // Standing on boat
      -2.5 + (i + 1) * enemySpacing // Distributed along boat length
    );
    
    // Add enemy to boat
    boatGroup.add(enemyObject);
    
    // Store reference to boat in enemy
    enemy.boat = boatGroup;
    enemy.disembarked = false;
    enemy.originalPositionInBoat = enemyObject.position.clone();
    
    // Add to enemies array
    enemies.push(enemy);
  }
  
  // Create boat object
  const boat = {
    object: boatGroup,
    enemies: enemies,
    targetPosition: new THREE.Vector3(
      Math.cos(spawnAngle) * 25, // Target position at shore
      0,
      Math.sin(spawnAngle) * 25
    ),
    speed: 0.15, // Boat movement speed
    angle: spawnAngle,
    hasReachedShore: false,
    enemiesDisembarked: false,
    removalTimer: 0,
    removalDelay: 5 // Seconds to wait after disembarking before removing boat
  };
  
  return boat;
}

/**
 * Creates an enemy for placement on a boat
 * @param {THREE.Scene} scene - The scene
 * @param {number} health - Enemy health
 * @param {number} speed - Enemy speed
 * @returns {Object} - The enemy object
 */
function createEnemyForBoat(scene, health, speed) {
  // Create a temporary group to act as a scene
  const tempGroup = new THREE.Group();
  
  // Use the existing createEnemy function but with a dummy spawn radius
  // We'll position the enemy manually later
  const enemy = createEnemy(tempGroup, 0, health, speed);
  
  // Remove the enemy from the temp group (it will be added to the boat)
  if (enemy.object.parent === tempGroup) {
    tempGroup.remove(enemy.object);
  }
  
  return enemy;
}

/**
 * Spawns a wave of enemies using boats
 * @param {THREE.Scene} scene - The scene
 * @param {number} wave - Current wave number
 * @param {number} maxEnemies - Maximum enemies allowed
 * @param {number} spawnRadius - Distance from center to spawn boats
 * @param {number} baseHealth - Base enemy health
 * @param {number} baseSpeed - Base enemy speed
 * @returns {Array} - Array of enemy objects
 */
export function spawnWave(scene, wave, maxEnemies, spawnRadius, baseHealth, baseSpeed) {
  // Calculate number of enemies for this wave (increasing with wave number)
  const enemiesForWave = Math.min(Math.floor(wave * 2 + 3), maxEnemies);
  console.log(`Spawning wave ${wave} with ${enemiesForWave} enemies`);
  
  // Scale difficulty with wave number
  const healthMultiplier = 1 + (wave - 1) * 0.2; // +20% health per wave
  const speedMultiplier = 1 + (wave - 1) * 0.1; // +10% speed per wave
  
  // Calculate enemy health and speed based on wave
  const health = Math.round(baseHealth * healthMultiplier);
  const speed = baseSpeed * speedMultiplier;
  
  // Create array to hold all enemies
  const allEnemies = [];
  
  // Clear any existing boats
  for (const boat of activeBoats) {
    if (boat.object && boat.object.parent) {
      scene.remove(boat.object);
    }
  }
  activeBoats = [];
  
  // Determine number of boats based on wave and enemy count
  const boatsForWave = Math.min(Math.ceil(wave / 2) + 1, Math.ceil(enemiesForWave / 3));
  console.log(`Spawning ${boatsForWave} boats for wave ${wave}`);
  
  // Calculate enemies per boat (distribute evenly)
  const baseEnemiesPerBoat = Math.floor(enemiesForWave / boatsForWave);
  let remainingEnemies = enemiesForWave - (baseEnemiesPerBoat * boatsForWave);
  
  // Spawn boats around the island
  const angleStep = (Math.PI * 2) / boatsForWave;
  const spawnDistance = spawnRadius * 1.5; // Spawn boats further out
  
  for (let i = 0; i < boatsForWave; i++) {
    // Calculate enemies for this boat (distribute remaining enemies)
    const enemiesForBoat = baseEnemiesPerBoat + (remainingEnemies > 0 ? 1 : 0);
    if (remainingEnemies > 0) remainingEnemies--;
    
    // Calculate spawn angle (distribute evenly around island)
    const spawnAngle = i * angleStep;
    
    // Create boat with enemies
    const boat = createBoat(scene, spawnAngle, spawnDistance, enemiesForBoat, health, speed);
    
    // Add boat to active boats
    activeBoats.push(boat);
    
    // Add boat's enemies to the total enemies array
    for (const enemy of boat.enemies) {
      // Set enemy properties for wave logic
      enemy.wave = wave;
      
      // Add to array
      allEnemies.push(enemy);
    }
  }
  
  return allEnemies;
}

/**
 * Creates a splash effect when a boat reaches shore
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} position - Position for the splash
 */
function createSplashEffect(scene, position) {
  // Create splash particles
  const particleCount = 30;
  const particles = new THREE.Group();
  
  // Position splash slightly above water level
  const splashPosition = position.clone();
  splashPosition.y = 0;
  
  // Create particle geometry
  const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
  const particleMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x88CCFF, 
    transparent: true,
    opacity: 0.8
  });
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    
    // Random initial position near splash center
    particle.position.set(
      splashPosition.x + (Math.random() - 0.5) * 2,
      splashPosition.y,
      splashPosition.z + (Math.random() - 0.5) * 2
    );
    
    // Random velocity
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      0.1 + Math.random() * 0.2,
      (Math.random() - 0.5) * 0.2
    );
    
    // Store velocity in userData
    particle.userData.velocity = velocity;
    particle.userData.lifetime = 0;
    particle.userData.maxLifetime = 1 + Math.random() * 0.5; // 1-1.5 seconds
    
    particles.add(particle);
  }
  
  // Add particles to scene
  scene.add(particles);
  
  // Create splash ring
  const ringGeometry = new THREE.RingGeometry(0.5, 2, 16);
  const ringMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xAACCFF, 
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2; // Lay flat on water
  ring.position.copy(splashPosition);
  ring.position.y += 0.05; // Slightly above water
  scene.add(ring);
  
  // Animate splash
  const animate = () => {
    // Check if all particles are gone
    if (particles.children.length === 0 && ring.parent) {
      scene.remove(ring);
      scene.remove(particles);
      return;
    }
    
    // Update particles
    for (let i = particles.children.length - 1; i >= 0; i--) {
      const particle = particles.children[i];
      
      // Update lifetime
      particle.userData.lifetime += 0.016; // Approximate for 60fps
      
      // Remove if lifetime exceeded
      if (particle.userData.lifetime >= particle.userData.maxLifetime) {
        particles.remove(particle);
        continue;
      }
      
      // Update position based on velocity
      const velocity = particle.userData.velocity;
      particle.position.x += velocity.x;
      particle.position.y += velocity.y;
      particle.position.z += velocity.z;
      
      // Apply gravity
      velocity.y -= 0.01;
      
      // Fade out based on lifetime
      const lifeRatio = particle.userData.lifetime / particle.userData.maxLifetime;
      particle.material.opacity = 0.8 * (1 - lifeRatio);
      
      // Scale down as it fades
      const scale = 1 - lifeRatio * 0.5;
      particle.scale.set(scale, scale, scale);
    }
    
    // Animate ring
    if (ring.parent) {
      // Expand ring
      ring.scale.x += 0.05;
      ring.scale.y += 0.05;
      
      // Fade out ring
      ring.material.opacity -= 0.02;
      
      // Remove ring when fully transparent
      if (ring.material.opacity <= 0) {
        scene.remove(ring);
      }
    }
    
    // Continue animation
    requestAnimationFrame(animate);
  };
  
  // Start animation
  animate();
}

/**
 * Updates all active boats
 * @param {THREE.Scene} scene - The scene
 * @param {number} deltaTime - Time since last frame
 */
export function updateBoats(scene, deltaTime) {
  // Process each boat
  for (let i = activeBoats.length - 1; i >= 0; i--) {
    const boat = activeBoats[i];
    
    if (!boat.hasReachedShore) {
      // Move boat toward shore
      const direction = new THREE.Vector3()
        .subVectors(boat.targetPosition, boat.object.position)
        .normalize();
      
      boat.object.position.x += direction.x * boat.speed;
      boat.object.position.z += direction.z * boat.speed;
      
      // Add gentle bobbing motion
      boat.object.position.y = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
      boat.object.rotation.x = Math.sin(Date.now() * 0.001) * 0.02;
      boat.object.rotation.z = Math.cos(Date.now() * 0.001) * 0.02;
      
      // Check if boat has reached shore
      const distanceToShore = boat.object.position.distanceTo(boat.targetPosition);
      if (distanceToShore < 2) {
        boat.hasReachedShore = true;
        console.log("Boat reached shore, enemies disembarking");
        
        // Create splash effect
        createSplashEffect(scene, boat.object.position);
        
        // Disembark enemies
        disembarkEnemies(boat, scene);
      }
    } else if (!boat.enemiesDisembarked) {
      // Check if all enemies have disembarked
      let allDisembarked = true;
      for (const enemy of boat.enemies) {
        if (!enemy.disembarked && !enemy.isDead) {
          allDisembarked = false;
          break;
        }
      }
      
      if (allDisembarked) {
        boat.enemiesDisembarked = true;
      }
    } else {
      // All enemies disembarked, start removal timer
      boat.removalTimer += deltaTime;
      
      if (boat.removalTimer >= boat.removalDelay) {
        // Remove boat from scene
        scene.remove(boat.object);
        
        // Remove from active boats array
        activeBoats.splice(i, 1);
      }
    }
  }
}

/**
 * Disembarks enemies from a boat that has reached shore
 * @param {Object} boat - The boat object
 * @param {THREE.Scene} scene - The scene
 */
function disembarkEnemies(boat, scene) {
  // Process each enemy
  for (let i = 0; i < boat.enemies.length; i++) {
    const enemy = boat.enemies[i];
    
    // Skip dead enemies
    if (enemy.isDead) continue;
    
    // Remove enemy from boat and add to scene
    const enemyObject = enemy.object;
    const worldPosition = new THREE.Vector3();
    
    // Get enemy's world position
    enemyObject.getWorldPosition(worldPosition);
    
    // Remove from boat
    boat.object.remove(enemyObject);
    
    // Add to scene at world position
    enemyObject.position.copy(worldPosition);
    scene.add(enemyObject);
    
    // Mark as disembarked
    enemy.disembarked = true;
    
    // Stagger disembarkation with a small delay
    setTimeout(() => {
      // Add a small random offset to prevent enemies from stacking
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0,
        (Math.random() - 0.5) * 2
      );
      
      // Move enemy toward island center
      const direction = new THREE.Vector3(
        -Math.cos(boat.angle),
        0,
        -Math.sin(boat.angle)
      ).normalize();
      
      // Set enemy position slightly away from boat toward island
      enemyObject.position.add(
        direction.multiplyScalar(2).add(randomOffset)
      );
      
      // Make enemy face the island center
      enemyObject.rotation.y = boat.angle;
    }, i * 300); // Stagger disembarkation by 300ms per enemy
  }
}

/**
 * Updates enemy behavior and position
 * @param {Array} enemies - Array of enemy objects
 * @param {THREE.Vector3} playerPosition - Current player position
 * @param {number} deltaTime - Time since last frame
 * @param {THREE.Scene} scene - The scene
 * @param {Array} projectiles - Array to store new projectiles
 */
export function updateEnemies(enemies, playerPosition, deltaTime, scene, projectiles = []) {
  // Process each enemy
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    
    // Skip dead enemies
    if (enemy.isDead) {
      // Increment dead time
      enemy.deadTime += deltaTime;
      
      // Remove enemy after delay
      if (enemy.deadTime > enemy.removalDelay) {
        if (enemy.object && enemy.object.parent) {
          enemy.object.parent.remove(enemy.object);
        }
        enemies.splice(i, 1);
      }
      continue;
    }
    
    // Skip enemies that haven't disembarked from boats yet
    if (enemy.boat && !enemy.disembarked) {
      continue;
    }
    
    // Get enemy object
    const enemyObject = enemy.object;
    
    // Store original position for collision detection
    const originalPosition = enemyObject.position.clone();
    
    // Calculate direction to player
    const directionToPlayer = new THREE.Vector3()
      .subVectors(playerPosition, enemyObject.position)
      .normalize();
    
    // Calculate distance to player
    const distanceToPlayer = enemyObject.position.distanceTo(playerPosition);
    
    // Update enemy behavior based on distance to player
    if (distanceToPlayer < 30) { // Enemy is close enough to engage
      // Make enemy face player
      enemyObject.lookAt(playerPosition.x, enemyObject.position.y, playerPosition.z);
      
      // Determine if enemy should move or shoot
      if (distanceToPlayer > 15) { // Move toward player if too far
        // Move toward player
        enemyObject.position.x += directionToPlayer.x * enemy.speed * deltaTime * 60;
        enemyObject.position.z += directionToPlayer.z * enemy.speed * deltaTime * 60;
        
        // Animate walking
        animateEnemyWalking(enemy, deltaTime);
      } else { // Within shooting range
        // Stop walking animation
        if (enemy.userData.leftLeg) {
          enemy.userData.leftLeg.rotation.x = 0;
        }
        if (enemy.userData.rightLeg) {
          enemy.userData.rightLeg.rotation.x = 0;
        }
        
        // Determine if enemy should strafe
        enemy.strafeTimer += deltaTime;
        if (enemy.strafeTimer > enemy.strafeDuration) {
          // Change strafe direction
          enemy.strafeDirection = -enemy.strafeDirection;
          enemy.strafeTimer = 0;
          enemy.strafeDuration = 2 + Math.random() * 3; // New random duration
        }
        
        // Strafe perpendicular to player direction
        const strafeDirection = new THREE.Vector3(
          -directionToPlayer.z, 
          0, 
          directionToPlayer.x
        ).normalize();
        
        // Apply strafe movement
        enemyObject.position.x += strafeDirection.x * enemy.speed * 0.5 * enemy.strafeDirection * deltaTime * 60;
        enemyObject.position.z += strafeDirection.z * enemy.speed * 0.5 * enemy.strafeDirection * deltaTime * 60;
        
        // Animate walking for strafing
        animateEnemyWalking(enemy, deltaTime * 0.5); // Slower animation for strafing
        
        // Check if enemy can shoot
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (currentTime - enemy.lastShootTime > enemy.shootingCooldown) {
          // Enemy can shoot
          enemy.lastShootTime = currentTime;
          
          // Create projectile
          if (typeof window.createEnemyProjectile === 'function') {
            // Get muzzle position
            const muzzlePosition = new THREE.Vector3();
            if (enemy.userData.rightArm) {
              // Position at the end of the right arm
              const rightArm = enemy.userData.rightArm;
              muzzlePosition.copy(rightArm.position)
                .add(new THREE.Vector3(0, 0, -0.5)) // Offset to end of arm
                .applyMatrix4(enemyObject.matrixWorld); // Convert to world space
            } else {
              // Fallback to enemy position
              muzzlePosition.copy(enemyObject.position)
                .add(new THREE.Vector3(0, 1.5, 0)); // Offset to approximate arm height
            }
            
            // Calculate direction to player with some inaccuracy
            const accuracy = 0.9 - Math.min(0.4, (distanceToPlayer - 5) * 0.02); // Accuracy decreases with distance
            const shootDirection = new THREE.Vector3()
              .subVectors(playerPosition, muzzlePosition)
              .normalize();
            
            // Create projectile
            const projectile = window.createEnemyProjectile(scene, muzzlePosition, shootDirection, accuracy);
            if (projectile) {
              projectiles.push(projectile);
            }
            
            // Create muzzle flash
            if (typeof window.createMuzzleFlash === 'function') {
              window.createMuzzleFlash(scene, muzzlePosition, shootDirection);
            }
          }
        }
      }
    } else {
      // Enemy is too far, just wander randomly
      // Implement random wandering behavior here if desired
    }
    
    // Check for collisions with environment
    checkEnvironmentCollisions(enemyObject, scene, originalPosition);
    
    // Check for collisions with other enemies
    applyEnemyCollisions(enemy, enemies, i, originalPosition);
    
    // Update animations
    updateEnemyAnimations(enemy, deltaTime);
  }
}

/**
 * Checks if an enemy is colliding with any collidable environment objects
 * @param {THREE.Object3D} enemyObject - The enemy object to check
 * @param {THREE.Scene} scene - The scene containing environment objects
 * @param {THREE.Vector3} originalPosition - Original position before movement
 * @returns {boolean} - Whether a collision occurred
 */
function checkEnvironmentCollisions(enemyObject, scene, originalPosition) {
  // Enemy collision parameters
  const enemyRadius = 0.5; // Collision radius for enemies
  
  // Check collision with each collidable object in the scene
  let collision = false;
  
  scene.traverse((object) => {
    // Skip if not collidable, or if it's an enemy
    if (!object.userData.collidable || object === enemyObject || isEnemy(object)) return;
    
    // Calculate distance between enemy and object center (X-Z plane only)
    const dx = enemyObject.position.x - object.position.x;
    const dz = enemyObject.position.z - object.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Get object's collision radius (default to 1 if not specified)
    const objectRadius = object.userData.collisionRadius || 1.0;
    
    // Check if collision occurred
    if (distance < (enemyRadius + objectRadius)) {
      // Apply different logic based on object type
      if (object.userData.isBunker) {
        // For bunker, use a larger fixed radius
        const bunkerDx = enemyObject.position.x - 15; // Bunker is at x=15
        const bunkerDz = enemyObject.position.z - 10; // Bunker is at z=10
        const distanceToBunker = Math.sqrt(bunkerDx * bunkerDx + bunkerDz * bunkerDz);
        
        if (distanceToBunker < 5.0) { // Bunker has radius of about 5 units
          collision = true;
        }
      } else {
        // Standard collision for trees, bushes, rocks, etc.
        collision = true;
      }
    }
  });
  
  return collision;
}

/**
 * Helper function to check if an object is an enemy
 * @param {THREE.Object3D} object - The object to check
 * @returns {boolean} - Whether the object is an enemy
 */
function isEnemy(object) {
  // Check if object has enemy-specific properties
  if (object.userData && (object.userData.isEnemy || 
      (object.parent && object.parent.userData && object.parent.userData.isEnemy))) {
    return true;
  }
  
  return false;
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
  console.log("Improved ragdoll death animation triggered, isHeadshot:", isHeadshot);
  
  // Set dead state
  enemy.isDead = true;
  
  // Get reference to the enemy object
  const enemyObject = enemy.object;
  if (!enemyObject) return;
  
  // Get references to body parts
  const userData = enemy.userData || {};
  const bodyParts = {
    body: userData.body,
    head: userData.head,
    leftArm: userData.leftArm,
    rightArm: userData.rightArm,
    leftLeg: userData.leftLeg,
    rightLeg: userData.rightLeg
  };
  
  // Ensure we have the necessary body parts
  if (!bodyParts.body) return;
  
  // Create physics properties for ragdoll
  const physics = {
    // Main body physics
    body: {
      velocity: new THREE.Vector3(0, 0, 0),
      rotationVelocity: new THREE.Vector3(0, 0, 0),
      angularDamping: 0.9,
      linearDamping: 0.95,
      gravity: 0.05  // Increased gravity (was 0.02)
    },
    // Limb physics (will be created for each limb)
    limbs: {}
  };
  
  // Set initial velocities based on death type
  if (isHeadshot) {
    // Headshot - strong backwards velocity with dramatic fall
    physics.body.velocity.z = -0.15 - Math.random() * 0.1; // Much stronger backward force (was -0.05)
    physics.body.velocity.y = 0.08 + Math.random() * 0.05; // More upward force for more dramatic fall (was 0.02)
    physics.body.rotationVelocity.x = -0.12 - Math.random() * 0.06; // Stronger rotation (was -0.04)
  } else {
    // Random death direction with more dramatic fall
    const fallDirection = Math.random() > 0.5 ? -1 : 1;
    const fallSideways = Math.random() > 0.6; // 40% chance to fall sideways
    
    if (fallSideways) {
      // Sideways fall - more dramatic
      physics.body.velocity.x = fallDirection * (0.1 + Math.random() * 0.05); // Stronger (was 0.03)
      physics.body.rotationVelocity.z = fallDirection * (0.09 + Math.random() * 0.04); // Stronger (was 0.03)
    } else {
      // Forward/backward fall - more dramatic
      physics.body.velocity.z = fallDirection * (0.12 + Math.random() * 0.08); // Stronger (was 0.04)
      physics.body.rotationVelocity.x = fallDirection * (0.08 + Math.random() * 0.06); // Stronger (was 0.03)
    }
    
    // More upward velocity for more dramatic fall and bounce
    physics.body.velocity.y = 0.06 + Math.random() * 0.04; // Increased (was 0.01)
  }
  
  // Immediately apply initial rotation to make death more obvious
  enemyObject.rotation.x += physics.body.rotationVelocity.x * 3;
  enemyObject.rotation.z += physics.body.rotationVelocity.z * 3;
  
  // Create physics properties for each limb with more exaggerated movements
  for (const partName in bodyParts) {
    if (partName === 'body') continue; // Skip main body
    
    const part = bodyParts[partName];
    if (!part) continue;
    
    // Store original positions and rotations
    part.userData = part.userData || {};
    part.userData.originalPosition = part.position.clone();
    part.userData.originalRotation = part.rotation.clone();
    
    // Create physics properties for this limb
    physics.limbs[partName] = {
      velocity: new THREE.Vector3(
        physics.body.velocity.x + (Math.random() - 0.5) * 0.15, // More random motion (was 0.02)
        physics.body.velocity.y + (Math.random() - 0.5) * 0.15, // More random motion (was 0.02)
        physics.body.velocity.z + (Math.random() - 0.5) * 0.15  // More random motion (was 0.02)
      ),
      rotationVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.25, // More rotation (was 0.1)
        (Math.random() - 0.5) * 0.25, // More rotation (was 0.1)
        (Math.random() - 0.5) * 0.25  // More rotation (was 0.1)
      ),
      angularDamping: 0.92,
      linearDamping: 0.95,
      gravity: 0.03, // Increased gravity (was 0.015)
      // Constraints to limit movement relative to body - looser for more flexibility
      constraints: getConstraintsForPart(partName, isHeadshot)
    };
  }
  
  // Ragdoll animation with physics
  let time = 0;
  const animateRagdoll = () => {
    // Stop animation if enemy removed or after sufficient time
    if (!enemyObject.parent || time > 180) { // Longer animation (was 120)
      return;
    }
    
    time++;
    
    // Update main body physics
    updateBodyPhysics(enemyObject, physics.body);
    
    // Update limb physics
    for (const partName in physics.limbs) {
      const part = bodyParts[partName];
      if (!part) continue;
      
      const limb = physics.limbs[partName];
      
      // Update limb physics based on body motion and constraints
      updateLimbPhysics(part, limb, enemyObject, bodyParts.body);
    }
    
    // Continue animation
    requestAnimationFrame(animateRagdoll);
  };
  
  // Start ragdoll animation
  animateRagdoll();
  
  // Create blood pool under the fallen enemy
  setTimeout(() => {
    if (enemyObject.parent) {
      const poolPosition = enemyObject.position.clone();
      poolPosition.y = 0.02; // Just above ground
      createBloodPool(scene, poolPosition);
    }
  }, 1000); // Delay blood pool creation
}

/**
 * Updates the physics for the main body
 * @param {THREE.Object3D} enemyObject - The enemy object
 * @param {Object} physics - Physics properties for the body
 */
function updateBodyPhysics(enemyObject, physics) {
  // Apply gravity
  physics.velocity.y -= physics.gravity;
  
  // Apply velocities to position
  enemyObject.position.x += physics.velocity.x;
  enemyObject.position.y += physics.velocity.y;
  enemyObject.position.z += physics.velocity.z;
  
  // Apply rotation velocities
  enemyObject.rotation.x += physics.rotationVelocity.x;
  enemyObject.rotation.y += physics.rotationVelocity.y;
  enemyObject.rotation.z += physics.rotationVelocity.z;
  
  // Floor collision with better bounce
  if (enemyObject.position.y < 0.3) { // Higher floor threshold for better visibility (was 0.2)
    enemyObject.position.y = 0.3;
    
    // Bounce with energy loss if velocity is significant
    if (Math.abs(physics.velocity.y) > 0.01) {
      physics.velocity.y = -physics.velocity.y * 0.4; // Less energy loss for more bounce (was 0.3)
      
      // Add some horizontal velocity on bounce for more realistic motion
      physics.velocity.x += (Math.random() - 0.5) * 0.04;
      physics.velocity.z += (Math.random() - 0.5) * 0.04;
      
      // Add some rotational impulse for more dramatic effect
      physics.rotationVelocity.x += (Math.random() - 0.5) * 0.02;
      physics.rotationVelocity.z += (Math.random() - 0.5) * 0.02;
    } else {
      physics.velocity.y = 0;
    }
    
    // Apply friction when on floor
    physics.velocity.x *= 0.8;
    physics.velocity.z *= 0.8;
  }
  
  // Apply damping
  physics.velocity.multiplyScalar(physics.linearDamping);
  physics.rotationVelocity.multiplyScalar(physics.angularDamping);
}

/**
 * Updates the physics for a limb
 * @param {THREE.Object3D} limb - The limb object
 * @param {Object} physics - Physics properties for the limb
 * @param {THREE.Object3D} enemyObject - The main enemy object
 * @param {THREE.Object3D} body - The body part
 */
function updateLimbPhysics(limb, physics, enemyObject, body) {
  // Apply gravity
  physics.velocity.y -= physics.gravity;
  
  // Original position in local space
  const originalPosition = limb.userData.originalPosition;
  const originalRotation = limb.userData.originalRotation;
  
  // Calculate new position and rotation based on physics
  const newPosition = originalPosition.clone();
  newPosition.x += physics.velocity.x;
  newPosition.y += physics.velocity.y;
  newPosition.z += physics.velocity.z;
  
  // Apply constraints to keep limbs attached
  const constraints = physics.constraints;
  const distance = newPosition.distanceTo(originalPosition);
  
  // If beyond constraint distance, pull back
  if (distance > constraints.maxDistance) {
    const direction = newPosition.clone().sub(originalPosition).normalize();
    newPosition.copy(originalPosition).add(direction.multiplyScalar(constraints.maxDistance));
    
    // Reflect velocity for bounce effect with more energy
    const reflectionFactor = 0.5; // Higher for more bounce (was 0.3)
    physics.velocity.x *= -reflectionFactor;
    physics.velocity.y *= -reflectionFactor;
    physics.velocity.z *= -reflectionFactor;
  }
  
  // Apply new position
  limb.position.copy(newPosition);
  
  // Apply rotation velocities with constraints - more exaggerated rotations
  limb.rotation.x = originalRotation.x + clamp(physics.rotationVelocity.x * 2, -constraints.maxRotation, constraints.maxRotation);
  limb.rotation.y = originalRotation.y + clamp(physics.rotationVelocity.y * 2, -constraints.maxRotation, constraints.maxRotation);
  limb.rotation.z = originalRotation.z + clamp(physics.rotationVelocity.z * 2, -constraints.maxRotation, constraints.maxRotation);
  
  // Apply damping
  physics.velocity.multiplyScalar(physics.linearDamping);
  physics.rotationVelocity.multiplyScalar(physics.angularDamping);
}

/**
 * Gets the physical constraints for a specific body part
 * @param {string} partName - Name of the body part
 * @param {boolean} isHeadshot - Whether this is from a headshot
 * @returns {Object} - Constraint parameters
 */
function getConstraintsForPart(partName, isHeadshot) {
  // Loosen constraints for headshots for more dramatic effect
  const multiplier = isHeadshot ? 1.5 : 1.0;
  
  switch(partName) {
    case 'head':
      return { 
        maxDistance: 0.3 * multiplier, // Looser (was 0.2)
        maxRotation: 1.2 * multiplier  // More rotation (was 0.8)
      };
    case 'leftArm':
    case 'rightArm':
      return { 
        maxDistance: 0.5 * multiplier, // Looser (was 0.3)
        maxRotation: 1.8 * multiplier  // More rotation (was 1.2)
      };
    case 'leftLeg':
    case 'rightLeg':
      return { 
        maxDistance: 0.4 * multiplier, // Looser (was 0.25)
        maxRotation: 1.0 * multiplier  // More rotation (was 0.6)
      };
    default:
      return { 
        maxDistance: 0.3 * multiplier, 
        maxRotation: 0.8 * multiplier
      };
  }
}

/**
 * Utility function to clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Dismembers a body part from an enemy
 * @param {Object} enemy - The enemy object
 * @param {THREE.Scene} scene - The scene
 * @param {string} bodyPart - The body part to dismember
 * @param {THREE.Vector3} hitPoint - Point of impact
 * @param {THREE.Vector3} hitDirection - Direction of the hit
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
    let dismemberedPart;
    
    if (bodyPart === 'head') {
      // Create a more realistic detached head with helmet for Nazi soldiers
      const headGroup = new THREE.Group();
      
      // Create the head shape
      const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf0d0a0 }); // Skin tone
      const head = new THREE.Mesh(headGeometry, headMaterial);
      headGroup.add(head);
      
      // Add helmet
      const helmetGeometry = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const helmetMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a, // Field gray
        roughness: 0.7,
        metalness: 0.3
      });
      const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
      helmet.scale.set(1, 0.8, 1.1);
      helmet.position.y = 0.2;
      headGroup.add(helmet);
      
      // Add face features
      // Eyes
      const eyeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
      const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.12, 0, 0.25);
      headGroup.add(leftEye);
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.12, 0, 0.25);
      headGroup.add(rightEye);
      
      // Add blood at neck
      const neckBloodGeometry = new THREE.CircleGeometry(0.15, 8);
      const neckBloodMaterial = new THREE.MeshBasicMaterial({
        color: 0xbb0a1e,
        side: THREE.DoubleSide
      });
      const neckBlood = new THREE.Mesh(neckBloodGeometry, neckBloodMaterial);
      neckBlood.position.set(0, -0.3, 0);
      neckBlood.rotation.x = Math.PI / 2;
      headGroup.add(neckBlood);
      
      dismemberedPart = headGroup;
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
    
    // For head, apply a random rotation as it gets blown off
    if (bodyPart === 'head') {
      dismemberedPart.rotation.x += (Math.random() - 0.5) * 0.5;
      dismemberedPart.rotation.y += (Math.random() - 0.5) * 0.5;
      
      // Add stronger impulse for head detachment
      velocity.multiplyScalar(1.5);
      velocity.y += 0.15; // More upward movement
    } else {
      dismemberedPart.scale.copy(partScale);
    }
    
    // Add to scene
    scene.add(dismemberedPart);
    
    // Animate the dismembered part
    animateDismemberedPart(scene, dismemberedPart, velocity, rotationVelocity, isLowFPS);
    
    // Create blood effects at attachment point
    createBloodEffect(scene, enemy.object, attachmentPoint, hitDirection, isHeadshot);
    
    // For head detachment, create a blood stream at the neck position
    if (bodyPart === 'head') {
      const neckPosition = new THREE.Vector3(0, 1.8, 0);
      neckPosition.applyMatrix4(enemy.object.matrixWorld);
      createBloodSpurt(scene, neckPosition, new THREE.Vector3(0, 1, 0));
    }
    
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
export function createSmallBloodPool(scene, position, bodyPart) {
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