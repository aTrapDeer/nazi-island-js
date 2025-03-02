/**
 * Projectiles module for creating and managing projectiles and ammo pickups
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Constants for projectile management
const PROJECTILE_SPEED = 1.0;
const MUZZLE_FLASH_DURATION = 50; // in ms
const ENEMY_BULLET_SPEED = 0.9; // Increased from 0.6 to 0.9 for faster enemy bullets
const TRAIL_FADE_TIME = 1.0; // How long the bullet trail stays visible (in seconds)
const ENEMY_TRAIL_FADE_TIME = 0.4; // Much shorter fade time for enemy tracers

/**
 * Creates a realistic bullet projectile
 * @param {THREE.Scene} scene - The scene to add the bullet to
 * @param {THREE.Vector3} position - Starting position of the projectile
 * @param {THREE.Vector3} direction - Direction to shoot
 * @param {boolean} invisible - Whether the bullet should be invisible (for hit detection only)
 * @returns {Object} The projectile object with bullet and muzzle flash
 */
export function createProjectile(scene, position, direction, invisible = false) {
  // Create a group to hold bullet parts
  const projectileGroup = new THREE.Group();
  
  if (!invisible) {
    // Bullet casing (brass) - Cylindrical part
    const casingGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
    const casingMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37, // Brass gold color
      metalness: 0.7,
      roughness: 0.3
    });
    const casing = new THREE.Mesh(casingGeometry, casingMaterial);
    casing.position.z = -0.1; // Position it behind the tip
    projectileGroup.add(casing);
    
    // Bullet tip (lead/copper) - Cone shaped
    const tipGeometry = new THREE.ConeGeometry(0.05, 0.1, 8);
    const tipMaterial = new THREE.MeshStandardMaterial({
      color: 0xB87333, // Copper/bronze color
      metalness: 0.5,
      roughness: 0.4
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.z = 0.05; // Position at the front
    tip.rotation.x = Math.PI / 2; // Rotate to point forward
    projectileGroup.add(tip);
  } else {
    // For invisible bullets, add a tiny helper object for debugging if needed
    const helperGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const helperMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.0 // Completely invisible
    });
    const helper = new THREE.Mesh(helperGeometry, helperMaterial);
    projectileGroup.add(helper);
  }
  
  // Position the bullet at the specified position
  projectileGroup.position.copy(position);
  
  // Set the bullet's direction and normalize it
  const bulletDirection = direction.clone().normalize();
  
  // Orient bullet to face the direction of travel
  projectileGroup.lookAt(projectileGroup.position.clone().add(bulletDirection));
  
  // Add to scene
  scene.add(projectileGroup);
  
  // Create a visible tracer for the bullet (even if the bullet itself is invisible)
  // Create bullet trail using line segments with brighter player bullet color
  const trailMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffff00, // BRIGHT YELLOW for player bullets (changed from cyan)
    transparent: true,
    opacity: 1.0, // Full opacity for better visibility
    linewidth: 2 // Thicker line for better visibility (might not work in WebGL)
  });
  
  const trailGeometry = new THREE.BufferGeometry();
  const trailLength = 2.0; // LONGER trail for more visible debugging
  const trailPositions = new Float32Array(6); // Two points (x,y,z for each)
  
  // Initial positions - start at bullet position and go back along the direction
  trailPositions[0] = position.x;
  trailPositions[1] = position.y;
  trailPositions[2] = position.z;
  trailPositions[3] = position.x - bulletDirection.x * trailLength;
  trailPositions[4] = position.y - bulletDirection.y * trailLength;
  trailPositions[5] = position.z - bulletDirection.z * trailLength;
  
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  trail.renderOrder = 999; // Ensure player bullet tracers render on top
  scene.add(trail);

  // Add a stronger glow effect for the tracer
  const glowMaterial = new THREE.SpriteMaterial({
    map: null,
    color: 0xffff00, // Match yellow trail
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.8 // Increased from 0.6 to 0.8 for more visibility
  });
  
  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(0.25, 0.25, 1.0); // Larger, more visible glow
  glow.position.copy(position);
  scene.add(glow);
  
  return {
    object: projectileGroup,
    direction: bulletDirection,
    speed: PROJECTILE_SPEED,
    distance: 0,
    maxDistance: 100, // Maximum travel distance
    lastPosition: position.clone(),
    trail: trail, // Reference to the trail
    trailPositions: trailPositions, // Reference to trail positions buffer
    glow: glow // Reference to the glow effect
  };
}

/**
 * Creates a muzzle flash effect
 * @param {THREE.Scene} scene - The scene to add the muzzle flash to
 * @param {THREE.Vector3} position - Position of the muzzle flash
 * @param {THREE.Vector3} direction - Direction the gun is pointing
 * @returns {THREE.Object3D} The muzzle flash object
 */
export function createMuzzleFlash(scene, position, direction) {
  // Create a point light for the flash
  const flashLight = new THREE.PointLight(0xffaa00, 5, 8); // Increased intensity and range
  flashLight.position.copy(position);
  scene.add(flashLight);
  
  // Create a visual representation of the flash
  const flashGeometry = new THREE.SphereGeometry(0.15, 8, 8); // Increased size
  const flashMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 3, // Increased intensity
    transparent: true,
    opacity: 0.8
  });
  const flash = new THREE.Mesh(flashGeometry, flashMaterial);
  flash.position.copy(position);
  
  // Create random spikes for the flash
  const spikes = new THREE.Group();
  const numSpikes = 8; // More spikes
  for (let i = 0; i < numSpikes; i++) {
    const spike = createMuzzleFlashSpike();
    // Rotate spike randomly but generally forward
    spike.rotation.x = (Math.random() - 0.5) * Math.PI / 3;
    spike.rotation.y = (Math.random() - 0.5) * Math.PI / 3;
    spike.rotation.z = Math.random() * Math.PI * 2;
    spikes.add(spike);
  }
  flash.add(spikes);
  
  // Orient flash in the direction of fire
  flash.lookAt(position.clone().add(direction));
  
  scene.add(flash);
  
  // Group the flash elements for easy removal
  const flashGroup = new THREE.Group();
  flashGroup.add(flash);
  flashGroup.add(flashLight);
  
  // Add smoke particles
  addMuzzleSmoke(scene, position, direction);
  
  // Remove after duration
  setTimeout(() => {
    scene.remove(flashGroup);
    scene.remove(flash);
    scene.remove(flashLight);
  }, MUZZLE_FLASH_DURATION);
  
  return flashGroup;
}

/**
 * Creates a spike for the muzzle flash
 * @returns {THREE.Object3D} A spike mesh
 */
function createMuzzleFlashSpike() {
  const spikeGeometry = new THREE.ConeGeometry(0.08, 0.3, 8); // Larger spikes
  const spikeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 3, // Increased intensity
    transparent: true,
    opacity: 0.7
  });
  const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
  spike.position.z = 0.15; // Position slightly forward
  
  return spike;
}

/**
 * Adds smoke particles to the muzzle flash
 * @param {THREE.Scene} scene - The scene to add the smoke to
 * @param {THREE.Vector3} position - Position of the smoke
 * @param {THREE.Vector3} direction - Direction the gun is pointing
 */
function addMuzzleSmoke(scene, position, direction) {
  const numParticles = 5;
  
  for (let i = 0; i < numParticles; i++) {
    // Create a smoke particle
    const smokeGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4);
    const smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.2
    });
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    
    // Position at muzzle with slight random offset
    smoke.position.copy(position);
    smoke.position.x += (Math.random() - 0.5) * 0.1;
    smoke.position.y += (Math.random() - 0.5) * 0.1;
    smoke.position.z += (Math.random() - 0.5) * 0.1;
    
    // Add to scene
    scene.add(smoke);
    
    // Calculate velocity in the direction of fire with randomness
    const smokeVelocity = direction.clone().multiplyScalar(0.05 + Math.random() * 0.05);
    smokeVelocity.x += (Math.random() - 0.5) * 0.02;
    smokeVelocity.y += (Math.random() - 0.5) * 0.02 + 0.01; // Slight upward drift
    smokeVelocity.z += (Math.random() - 0.5) * 0.02;
    
    // Animate the smoke
    const lifetime = 500 + Math.random() * 500; // 0.5-1 second
    const startTime = Date.now();
    const initialScale = smoke.scale.x;
    
    function animateSmoke() {
      const elapsed = Date.now() - startTime;
      if (elapsed > lifetime) {
        scene.remove(smoke);
        return;
      }
      
      // Move based on velocity
      smoke.position.add(smokeVelocity);
      
      // Expand over time
      const scale = initialScale + (elapsed / lifetime) * 2;
      smoke.scale.set(scale, scale, scale);
      
      // Fade out
      smokeMaterial.opacity = 0.5 * (1 - elapsed / lifetime);
      
      requestAnimationFrame(animateSmoke);
    }
    
    animateSmoke();
  }
}

/**
 * Creates an ammo pickup
 * @param {THREE.Scene} scene - The scene to add the ammo pickup to
 * @param {THREE.Vector3} position - Position of the ammo pickup
 * @param {number} amount - Amount of ammo in the pickup
 * @returns {Object} The ammo pickup object
 */
export function createAmmoPickup(scene, position, amount) {
  // Create a floating ammo box
  const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Brown
    metalness: 0.5,
    roughness: 0.5
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  
  // Position slightly above ground
  position.y = 0.25;
  box.position.copy(position);
  
  // Add to scene
  scene.add(box);
  
  // Add some details to the box
  const detailGeometry = new THREE.BoxGeometry(0.52, 0.1, 0.52);
  const detailMaterial = new THREE.MeshStandardMaterial({
    color: 0xD4AF37, // Gold
    metalness: 0.8,
    roughness: 0.2
  });
  const detail = new THREE.Mesh(detailGeometry, detailMaterial);
  detail.position.y = 0;
  box.add(detail);
  
  // Add text label for "AMMO"
  const textGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000, // Black
    metalness: 0.2,
    roughness: 0.8
  });
  const text = new THREE.Mesh(textGeometry, textMaterial);
  text.position.set(0, 0, 0.26);
  box.add(text);
  
  // Return pickup object with properties
  return {
    object: box,
    amount: amount,
    rotationSpeed: 0.01,
    bounceHeight: 0.1,
    bounceSpeed: 2,
    time: Math.random() * Math.PI * 2 // Random start time for varied animations
  };
}

/**
 * Updates all projectiles positions and checks for collisions
 * @param {Array} projectiles - Array of projectile objects
 * @param {Array} enemies - Array of enemy objects
 * @param {THREE.Scene} scene - The scene to remove collided projectiles from
 * @param {number} deltaTime - Time since last frame in seconds
 * @returns {Array} Updated projectiles array
 */
export function updateProjectiles(projectiles, enemies, scene, deltaTime) {
  const updatedProjectiles = [];
  
  // Performance optimization: Skip processing if no projectiles or enemies
  if (projectiles.length === 0 || enemies.length === 0) {
    return projectiles;
  }
  
  // Debug log for projectile count
  if (Math.random() < 0.01) { // Only log occasionally
    console.log(`Processing ${projectiles.length} projectiles against ${enemies.length} enemies`);
  }
  
  // Update each projectile
  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];
    
    // Store last position for ray casting
    projectile.lastPosition.copy(projectile.object.position);
    
    // Move the projectile
    const moveAmount = projectile.speed * deltaTime * 60; // Normalize by 60fps
    projectile.object.position.addScaledVector(projectile.direction, moveAmount);
    projectile.distance += moveAmount;
    
    // Update tracer positions if the projectile has a trail
    if (projectile.trail && projectile.trailPositions) {
      // Update the head of the trail to the current bullet position
      projectile.trailPositions[0] = projectile.object.position.x;
      projectile.trailPositions[1] = projectile.object.position.y;
      projectile.trailPositions[2] = projectile.object.position.z;
      
      // Calculate the exact tail position by going back along the direction
      // This ensures a perfect straight line rather than a curved trail
      const tailDistance = projectile.trail.geometry.parameters ? 
                           projectile.trail.geometry.parameters.trailLength || 2.0 : 2.0;
      
      projectile.trailPositions[3] = projectile.object.position.x - projectile.direction.x * tailDistance;
      projectile.trailPositions[4] = projectile.object.position.y - projectile.direction.y * tailDistance;
      projectile.trailPositions[5] = projectile.object.position.z - projectile.direction.z * tailDistance;
      
      // Tell Three.js that the buffer needs updating
      projectile.trail.geometry.attributes.position.needsUpdate = true;
    }
    
    // Update glow effect position if it exists
    if (projectile.glow) {
      projectile.glow.position.copy(projectile.object.position);
    }
    
    // Check if projectile has exceeded max distance
    if (projectile.distance > projectile.maxDistance) {
      scene.remove(projectile.object);
      // Also remove trail and glow
      if (projectile.trail) scene.remove(projectile.trail);
      if (projectile.glow) scene.remove(projectile.glow);
      continue;
    }
    
    // Create a ray from last position to current position
    const ray = new THREE.Ray(
      projectile.lastPosition,
      new THREE.Vector3().subVectors(projectile.object.position, projectile.lastPosition).normalize()
    );
    
    // Check for collisions with enemies
    let hit = false;
    
    // DEBUG: Draw a small sphere at the bullet's current position for debugging
    if (!projectile.debugMarker) {
      const debugGeo = new THREE.SphereGeometry(0.1, 4, 4);
      const debugMat = new THREE.MeshBasicMaterial({ 
        color: projectile.fromEnemy ? 0xff6600 : 0xffff00,
        transparent: true,
        opacity: 0.8
      });
      projectile.debugMarker = new THREE.Mesh(debugGeo, debugMat);
      scene.add(projectile.debugMarker);
    }
    projectile.debugMarker.position.copy(projectile.object.position);
    
    // Performance optimization: Only check enemies within a reasonable distance
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      
      // Skip if enemy is already dead
      if (enemy.isDead || enemy.health <= 0) continue;
      
      // Quick distance check before detailed collision detection
      const distanceToEnemy = projectile.object.position.distanceTo(enemy.object.position);
      
      // Debug log for close projectiles
      if (distanceToEnemy < 5) {
        console.log(`Projectile close to enemy: distance = ${distanceToEnemy.toFixed(2)}`);
        
        // DEBUG: Create a line to visualize distance between bullet and enemy
        const lineGeo = new THREE.BufferGeometry();
        const positions = new Float32Array([
          projectile.object.position.x, projectile.object.position.y, projectile.object.position.z,
          enemy.object.position.x, enemy.object.position.y + 1.5, enemy.object.position.z
        ]);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x00ff00, // Green line
          transparent: true,
          opacity: 0.5
        });
        
        const debugLine = new THREE.Line(lineGeo, lineMat);
        scene.add(debugLine);
        
        // Remove the debug line after a short time
        setTimeout(() => {
          scene.remove(debugLine);
        }, 500);
      }
      
      if (distanceToEnemy > 10) continue; // Increased distance check for better hit detection
      
      // Check for collision with enemy body parts
      const hitResult = checkEnemyHit(ray, enemy, projectile.object.position, projectile.lastPosition);
      
      if (hitResult) {
        hit = true;
        console.log(`Projectile hit enemy at ${hitResult.part}! Distance: ${distanceToEnemy.toFixed(2)}`);
        
        // DEBUG: Visualize the hit point
        const hitMarker = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red sphere at hit point
        );
        hitMarker.position.copy(hitResult.point);
        scene.add(hitMarker);
        
        // Remove hit marker after a second
        setTimeout(() => scene.remove(hitMarker), 1000);
        
        // Call the enemy hit handler from the global scope if available
        if (window.handleEnemyHit) {
          window.handleEnemyHit(enemy, hitResult.point, hitResult.direction, hitResult.part);
        } else {
          // Fallback if global handler is not available
          console.log("Hit enemy at " + hitResult.part);
          
          // Apply damage directly
          const damage = hitResult.part === 'head' ? 100 : 25;
          enemy.health -= damage;
          
          // Mark as dead if health depleted
          if (enemy.health <= 0) {
            enemy.isDead = true;
            enemy.deadTime = 0;
            enemy.removalDelay = 10;
          }
        }
        
        // Create blood effect at hit location
        createBloodEffect(scene, hitResult.point, hitResult.part);
        
        break;
      }
    }
    
    // If projectile hit something, remove it
    if (hit) {
      scene.remove(projectile.object);
      // Also remove trail, glow and debug marker
      if (projectile.trail) scene.remove(projectile.trail);
      if (projectile.glow) scene.remove(projectile.glow);
      if (projectile.debugMarker) scene.remove(projectile.debugMarker);
      continue;
    }
    
    // Keep the projectile if it hasn't collided
    updatedProjectiles.push(projectile);
  }
  
  return updatedProjectiles;
}

/**
 * Checks if a projectile has hit an enemy
 * @param {THREE.Raycaster} ray - The ray to check for hits
 * @param {Object} enemy - The enemy to check
 * @param {THREE.Vector3} currentPos - Current position of projectile
 * @param {THREE.Vector3} lastPos - Previous position of projectile
 * @returns {Object|null} Hit information or null if no hit
 */
function checkEnemyHit(ray, enemy, currentPos, lastPos) {
  // Skip dead enemies
  if (enemy.isDead) return null;
  
  // Extract the enemy mesh from the container
  const enemyGroup = enemy.object;
  
  // IMPROVEMENT: Add a basic sphere-based hit test first (more generous hit detection)
  // Check if the bullet is within a reasonable distance of the enemy's center
  const distanceToCenter = currentPos.distanceTo(enemyGroup.position);
  const bodyRadius = 1.0; // Generous body hit radius
  
  if (distanceToCenter < bodyRadius) {
    console.log("Direct hit with simplified collision! Distance:", distanceToCenter);
    
    // Determine which body part based on height
    const heightDiff = currentPos.y - enemyGroup.position.y;
    let bodyPart = 'body'; // Default
    
    if (heightDiff > 1.5) {
      bodyPart = 'head';
    } else if (heightDiff < 0.8) {
      bodyPart = Math.random() > 0.5 ? 'leftLeg' : 'rightLeg';
    }
    
    // Return hit data
    return {
      point: currentPos.clone(),
      part: bodyPart,
      direction: new THREE.Vector3().subVectors(currentPos, lastPos).normalize(),
      distance: distanceToCenter
    };
  }
  
  // Get all meshes in the enemy group
  const bodyParts = [];
  enemyGroup.traverse(child => {
    if (child.isMesh) {
      bodyParts.push(child);
      
      // DEBUG: Temporarily highlight body parts that are being checked
      const originalMaterial = child.material.clone();
      child.material.emissive = new THREE.Color(0x222222);
      
      // Restore original material after a brief moment
      setTimeout(() => {
        child.material = originalMaterial;
      }, 50);
    }
  });
  
  // DEBUG: Log the number of body parts being checked
  console.log(`Checking collision with ${bodyParts.length} enemy body parts`);
  
  // Test each body part for intersection with improved detection
  for (const part of bodyParts) {
    // Skip invisible parts
    if (!part.visible) continue;
    
    // Update the ray origin and direction for this specific test
    ray.set(lastPos, new THREE.Vector3().subVectors(currentPos, lastPos).normalize());
    
    // Create a raycaster for the part intersection check
    const raycaster = new THREE.Raycaster(lastPos, new THREE.Vector3().subVectors(currentPos, lastPos).normalize());
    // IMPROVEMENT: Increase precision of raycaster
    raycaster.params.Line.threshold = 0.2;
    raycaster.params.Points.threshold = 0.2;
    
    // Consider the world matrix of the part
    const intersections = raycaster.intersectObject(part, false);
    
    if (intersections.length > 0) {
      // DEBUG: Log intersection details
      console.log(`Intersection found with ${part.name} at distance ${intersections[0].distance.toFixed(2)}`);
      
      // Find the closest intersection
      const hit = intersections[0];
      
      // Skip if the hit is behind the start point
      if (hit.distance > lastPos.distanceTo(currentPos)) continue;
      
      // Determine which body part was hit based on its position within the enemy
      let bodyPart = 'body'; // Default to body
      
      // Helper function to test if a point is child of a specific mesh
      const isChildOf = (obj, parent) => {
        while (obj !== null) {
          if (obj === parent) return true;
          obj = obj.parent;
        }
        return false;
      };
      
      // Check hierarchy and naming to identify body parts
      const partName = part.name.toLowerCase();
      if (partName.includes('head') || 
          isChildOf(part, enemyGroup.getObjectByName('headGroup')) || 
          part.position.y > 1.7) {
        bodyPart = 'head';
      } else if (partName.includes('arm') || 
                 partName.includes('hand') || 
                 isChildOf(part, enemyGroup.getObjectByName('leftArm')) || 
                 isChildOf(part, enemyGroup.getObjectByName('rightArm'))) {
        bodyPart = partName.includes('left') ? 'leftArm' : 'rightArm';
      } else if (partName.includes('leg') || 
                 partName.includes('foot') || 
                 isChildOf(part, enemyGroup.getObjectByName('leftLeg')) || 
                 isChildOf(part, enemyGroup.getObjectByName('rightLeg')) ||
                 part.position.y < 0.9) {
        bodyPart = partName.includes('left') ? 'leftLeg' : 'rightLeg';
      } else if (partName.includes('torso') || 
                 isChildOf(part, enemyGroup.getObjectByName('body')) ||
                 (part.position.y > 0.9 && part.position.y < 1.7)) {
        bodyPart = 'body';
      }
      
      // Calculate hit direction for blood effects
      const hitDirection = new THREE.Vector3().subVectors(currentPos, lastPos).normalize();
      
      return {
        point: hit.point,
        part: bodyPart,
        direction: hitDirection,
        distance: hit.distance
      };
    }
  }
  
  return null;
}

/**
 * Creates a blood effect at the hit location
 * @param {THREE.Scene} scene - The scene to add the effect to
 * @param {THREE.Vector3} position - Position of the hit
 * @param {string} bodyPart - The body part that was hit
 */
function createBloodEffect(scene, position, bodyPart) {
  // Create blood particles
  const particleCount = bodyPart === 'head' ? 30 : 15;
  
  for (let i = 0; i < particleCount; i++) {
    // Create a small red sphere for blood
    const geometry = new THREE.SphereGeometry(0.05, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
    const particle = new THREE.Mesh(geometry, material);
    
    // Position at hit point
    particle.position.copy(position);
    
    // Add random velocity
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      Math.random() * 0.2,
      (Math.random() - 0.5) * 0.2
    );
    
    // Add to scene
    scene.add(particle);
    
    // Remove after a short time
    setTimeout(() => {
      scene.remove(particle);
    }, 1000 + Math.random() * 1000);
    
    // Animate falling
    const animate = () => {
      // Move particle
      particle.position.add(velocity);
      
      // Apply gravity
      velocity.y -= 0.01;
      
      // Continue animation if particle still exists
      if (particle.parent === scene) {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animate();
  }
}

/**
 * Updates all ammo pickups and handles collection
 * @param {Array} ammoPickups - Array of ammo pickup objects
 * @param {Object} player - The player object
 * @param {THREE.Scene} scene - The scene
 * @param {Function} onAmmoCollected - Callback for when ammo is collected
 * @returns {Array} - Updated ammo pickups array
 */
export function updateAmmoPickups(ammoPickups, player, scene, onAmmoCollected) {
  // Skip if no pickups
  if (ammoPickups.length === 0) return ammoPickups;
  
  // Calculate player position (ground level)
  const playerPosition = player.position.clone();
  playerPosition.y = 0;
  
  // Check each pickup for collection
  const updatedPickups = ammoPickups.filter(pickup => {
    // Skip if already collected
    if (pickup.collected) return false;
    
    // Calculate distance to player
    const pickupPosition = pickup.object.position.clone();
    pickupPosition.y = 0;
    const distance = pickupPosition.distanceTo(playerPosition);
    
    // If player is close enough, collect the ammo
    if (distance < 1.5) {
      // Call the collection callback
      if (onAmmoCollected) {
        onAmmoCollected(pickup.amount);
      }
      
      // Remove the pickup from the scene
      scene.remove(pickup.object);
      
      // Mark as collected
      pickup.collected = true;
      
      // Don't include in updated array
      return false;
    }
    
    // Animate the pickup (float and rotate)
    pickup.object.rotation.y += 0.02;
    pickup.object.position.y = 0.3 + Math.sin(Date.now() / 500) * 0.1;
    
    // Keep in the updated array
    return true;
  });
  
  return updatedPickups;
}

/**
 * Creates an instant line-based enemy bullet shot 
 * @param {THREE.Scene} scene - The scene to add the bullet to
 * @param {THREE.Vector3} position - Starting position of the shot (enemy gun position)
 * @param {THREE.Vector3} direction - Direction to shoot (toward player)
 * @param {number} accuracy - Value between 0-1 representing accuracy (higher is better)
 * @returns {Object} The enemy shot object with update and remove methods
 */
export function createEnemyProjectile(scene, position, direction, accuracy = 0.8) {
  // Apply inaccuracy to the direction vector
  const inaccuracy = 1.0 - accuracy;
  
  // Add random deviation based on accuracy
  const deviation = new THREE.Vector3(
    (Math.random() - 0.5) * inaccuracy * 0.7,
    (Math.random() - 0.5) * inaccuracy * 0.7,
    (Math.random() - 0.5) * inaccuracy * 0.7
  );
  
  // Apply deviation to direction and normalize
  direction.add(deviation).normalize();
  
  // Create a line extending from the enemy gun position in the shooting direction
  // Calculate a very long distance to simulate an instant shot
  const shotLength = 100; // Long enough to reach across the map
  const endPoint = new THREE.Vector3(
    position.x + direction.x * shotLength,
    position.y + direction.y * shotLength,
    position.z + direction.z * shotLength
  );
  
  // Create line geometry for the shot
  const shotGeometry = new THREE.BufferGeometry();
  const shotVertices = new Float32Array([
    position.x, position.y, position.z,
    endPoint.x, endPoint.y, endPoint.z
  ]);
  shotGeometry.setAttribute('position', new THREE.BufferAttribute(shotVertices, 3));
  
  // Create material for the shot with glow effect
  const shotMaterial = new THREE.LineBasicMaterial({
    color: 0xff6600,  // Orange color for enemy shots
    linewidth: 2,     // Thicker line (browser/GPU dependent)
    transparent: true,
    opacity: 0.8
  });
  
  // Create the shot line
  const shotLine = new THREE.Line(shotGeometry, shotMaterial);
  shotLine.renderOrder = 999; // Force render on top
  scene.add(shotLine);
  
  // Create a small flash at the gun position
  const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const flashMaterial = new THREE.MeshBasicMaterial({
    color: 0xff9900,
    transparent: true,
    opacity: 1.0
  });
  const flash = new THREE.Mesh(flashGeometry, flashMaterial);
  flash.position.copy(position);
  scene.add(flash);
  
  // Create timestamp for shot creation
  const creationTime = performance.now();
  const lifespan = 1500; // 1.5 seconds in milliseconds
  
  // Return object with update and remove methods
  return {
    position: position.clone(), // Store position for hit detection
    line: shotLine,
    flash: flash,
    creationTime: creationTime,
    direction: direction.clone(), // Store direction for better hit detection
    startPoint: position.clone(), // Store start point for ray calculations
    endPoint: endPoint.clone(),   // Store end point for ray calculations
    
    // Update method - handles fading out and expiration
    update: function(deltaTime) {
      const currentTime = performance.now();
      const age = currentTime - this.creationTime;
      
      // Check if the shot should expire
      if (age >= lifespan) {
        return false; // Signal to remove this shot
      }
      
      // Fade out as it approaches end of lifespan
      const remainingLifePercent = 1 - (age / lifespan);
      
      // Update shot opacity
      if (this.line.material) {
        this.line.material.opacity = remainingLifePercent * 0.8;
      }
      
      // Fade flash quickly
      if (this.flash.material) {
        this.flash.material.opacity = Math.max(0, 1 - (age / 200)); // Fade flash in 200ms
      }
      
      return true; // Keep this shot
    },
    
    // Remove method - cleans up Three.js objects
    remove: function(scene) {
      if (this.line) {
        scene.remove(this.line);
        if (this.line.geometry) this.line.geometry.dispose();
        if (this.line.material) this.line.material.dispose();
      }
      
      if (this.flash) {
        scene.remove(this.flash);
        if (this.flash.geometry) this.flash.geometry.dispose();
        if (this.flash.material) this.flash.material.dispose();
      }
    }
  };
} 