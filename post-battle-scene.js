// Post-Battle Scene for Nazi Island
// This creates a staged scene for screenshot purposes

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { createIsland } from './modules/island.js';
import { createPlayer } from './modules/player.js';
import { createEnemy, dismemberEnemyPart, createSmallBloodPool } from './modules/enemies.js';

// Main scene variables
let scene, camera, renderer;
let player, island;
let enemies = [];

// Initialize the scene
init();
animate();

function init() {
  console.log('Creating post-battle scene...');
  
  // Setup renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue
  
  // Create camera for screenshot purposes - positioned to view the scene
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15); // Position for best view - moved back to capture the wider scene
  camera.lookAt(0, 1, 0);
  
  // Responsive canvas
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // UI message
  createScreenshotUI();
  
  // Create scenery
  setupScene();
}

function setupScene() {
  // Setup lighting
  setupLighting();
  
  // Create island
  island = createIsland(scene);
  
  // Create player character (soldier facing camera)
  player = createPlayer(scene);
  player.position.set(0, 0, 2); // Move player forward out of any bushes, closer to camera
  player.rotation.y = Math.PI; // Rotate to face camera
  
  // Position the player's arms like holding a weapon but in a resting pose
  positionPlayerForScene(player);
  
  // Create defeated enemies
  createDefeatedEnemies();
  
  // Create boat with Nazis in the background
  createBoatWithNazis();
  
  // Add dramatic effects
  addSceneEffects();
}

function setupLighting() {
  // Ambient light for general scene brightness
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  // Directional light (main sunlight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  
  // Improve shadow quality
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  
  scene.add(directionalLight);
  
  // Add a sunset-like colored spotlight for dramatic effect
  const spotlight = new THREE.SpotLight(0xff7e47, 0.8);
  spotlight.position.set(-15, 10, -10);
  spotlight.castShadow = true;
  spotlight.angle = 0.5;
  scene.add(spotlight);
}

function positionPlayerForScene(player) {
  // Find weapon in player model and adjust its position
  if (player.children) {
    player.children.forEach(child => {
      if (child.name === 'weapon') {
        // Adjust weapon to be in a lowered position
        child.rotation.x = -0.3;
      }
    });
  }
}

function createDefeatedEnemies() {
  // Create first fallen enemy
  const enemy1 = createEnemy(scene, 10, 0, 0);
  enemy1.object.position.set(2, 0, -1);
  enemy1.object.rotation.x = Math.PI / 2; // Lay on the ground
  enemies.push(enemy1);
  
  // Dismember the head from the first enemy
  if (enemy1.userData && enemy1.userData.head) {
    const headPart = enemy1.userData.head;
    const headPosition = new THREE.Vector3();
    headPart.getWorldPosition(headPosition);
    
    // Create fake hit direction and point
    const hitDirection = new THREE.Vector3(Math.random() - 0.5, 0.5, Math.random() - 0.5);
    
    // Dismember the head
    dismemberEnemyPart(enemy1, scene, 'head', headPosition, hitDirection);
    
    // Create blood pool under the enemy
    createSmallBloodPool(scene, enemy1.object.position, 'head');
  }
  
  // Create second fallen enemy at a different position
  const enemy2 = createEnemy(scene, 10, 0, 0);
  enemy2.object.position.set(-3, 0, -2);
  enemy2.object.rotation.z = -Math.PI / 4; // Partially on side
  enemy2.object.rotation.x = Math.PI / 3; // Partially face up
  enemies.push(enemy2);
  
  // Create a larger blood pool for dramatic effect
  createLargeBloodPool(scene, new THREE.Vector3(-3, 0.01, -2));
  
  // Add more fallen enemies around the scene
  
  // Enemy 3 - right side
  const enemy3 = createEnemy(scene, 10, 0, 0);
  enemy3.object.position.set(4, 0, -3);
  enemy3.object.rotation.x = Math.PI / 2; // Lay on the ground face down
  enemy3.object.rotation.z = Math.PI / 6; // Slightly twisted
  enemies.push(enemy3);
  createSmallBloodPool(scene, enemy3.object.position, 'body');
  
  // Enemy 4 - left side
  const enemy4 = createEnemy(scene, 10, 0, 0);
  enemy4.object.position.set(-5, 0, -1);
  enemy4.object.rotation.x = Math.PI / 3; // Partially face up
  enemy4.object.rotation.z = -Math.PI / 3; // Twisted to side
  enemies.push(enemy4);
  
  // Dismember arm from enemy 4
  if (enemy4.userData && enemy4.userData.rightArm) {
    const armPart = enemy4.userData.rightArm;
    const armPosition = new THREE.Vector3();
    armPart.getWorldPosition(armPosition);
    
    const hitDirection = new THREE.Vector3(0.5, 0.2, 0.3);
    dismemberEnemyPart(enemy4, scene, 'rightArm', armPosition, hitDirection);
  }
  createSmallBloodPool(scene, enemy4.object.position, 'rightArm');
  
  // Enemy 5 - near player
  const enemy5 = createEnemy(scene, 10, 0, 0);
  enemy5.object.position.set(1, 0, 1);
  enemy5.object.rotation.x = Math.PI / 2; // Lay on the ground
  enemy5.object.rotation.y = Math.PI / 4; // Twisted direction
  enemies.push(enemy5);
  createSmallBloodPool(scene, enemy5.object.position, 'body');
  
  // Enemy 6 - far background
  const enemy6 = createEnemy(scene, 10, 0, 0);
  enemy6.object.position.set(0, 0, -6);
  enemy6.object.rotation.x = Math.PI / 2.5; // Partially up
  enemies.push(enemy6);
  
  // Enemy 7 - right far
  const enemy7 = createEnemy(scene, 10, 0, 0);
  enemy7.object.position.set(6, 0, -5);
  enemy7.object.rotation.x = Math.PI / 2; // Face down
  enemies.push(enemy7);
  
  // Dismember leg from enemy 7
  if (enemy7.userData && enemy7.userData.leftLeg) {
    const legPart = enemy7.userData.leftLeg;
    const legPosition = new THREE.Vector3();
    legPart.getWorldPosition(legPosition);
    
    const hitDirection = new THREE.Vector3(-0.5, 0.3, 0.2);
    dismemberEnemyPart(enemy7, scene, 'leftLeg', legPosition, hitDirection);
  }
  createSmallBloodPool(scene, enemy7.object.position, 'leftLeg');
  
  // Enemy 8 - left far
  const enemy8 = createEnemy(scene, 10, 0, 0);
  enemy8.object.position.set(-6, 0, -4);
  enemy8.object.rotation.x = Math.PI / 1.8; // Almost face down
  enemy8.object.rotation.z = Math.PI / 5; // Slightly twisted
  enemies.push(enemy8);
  createSmallBloodPool(scene, enemy8.object.position, 'body');
}

function createBoatWithNazis() {
  // Create a simple boat
  const boatGroup = new THREE.Group();
  scene.add(boatGroup);
  
  // Position the boat in the background
  boatGroup.position.set(0, 0, -25);
  
  // Boat hull
  const hullGeometry = new THREE.BoxGeometry(5, 1, 12);
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, // Brown wood color
    roughness: 0.8
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.position.y = 0.5; // Half its height
  boatGroup.add(hull);
  
  // Boat sides
  const sideGeometry = new THREE.BoxGeometry(0.3, 0.8, 12);
  const sideMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, // Brown wood color
    roughness: 0.8
  });
  
  // Left side
  const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
  leftSide.position.set(-2.35, 1, 0);
  boatGroup.add(leftSide);
  
  // Right side
  const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
  rightSide.position.set(2.35, 1, 0);
  boatGroup.add(rightSide);
  
  // Add Nazis to the boat
  // Nazi 1 at front of boat
  const nazi1 = createEnemy(scene, 10, 0, 0);
  nazi1.object.position.copy(boatGroup.position);
  nazi1.object.position.z -= 4; // Front of boat
  nazi1.object.position.y = 1.5; // Standing on boat
  nazi1.object.rotation.y = Math.PI; // Facing the island/player
  boatGroup.add(nazi1.object);
  
  // Nazi 2 fallen in boat
  const nazi2 = createEnemy(scene, 10, 0, 0);
  nazi2.object.position.copy(boatGroup.position);
  nazi2.object.position.x += 1.5; // Right side
  nazi2.object.position.z += 1; // Middle of boat
  nazi2.object.position.y = 1.3; // On boat
  nazi2.object.rotation.x = Math.PI / 2; // Laying down
  nazi2.object.rotation.z = Math.PI / 4; // Slightly twisted
  boatGroup.add(nazi2.object);
  createSmallBloodPool(scene, nazi2.object.position, 'body');
  
  // Nazi 3 at back of boat
  const nazi3 = createEnemy(scene, 10, 0, 0);
  nazi3.object.position.copy(boatGroup.position);
  nazi3.object.position.z += 4; // Back of boat
  nazi3.object.position.x -= 1.5; // Left side
  nazi3.object.position.y = 1.5; // Standing on boat
  nazi3.object.rotation.y = 0; // Facing away from the island
  boatGroup.add(nazi3.object);
}

function createLargeBloodPool(scene, position) {
  // Create a larger blood pool for dramatic effect
  const poolGeometry = new THREE.CircleGeometry(1.2, 32);
  const poolMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x8b0000, 
    transparent: true,
    opacity: 0.8
  });
  
  const bloodPool = new THREE.Mesh(poolGeometry, poolMaterial);
  bloodPool.rotation.x = -Math.PI / 2; // Lay flat on ground
  bloodPool.position.copy(position);
  bloodPool.position.y += 0.01; // Slightly above ground to avoid z-fighting
  scene.add(bloodPool);
}

function addSceneEffects() {
  // Add smoke particles
  createSmokeEffect(new THREE.Vector3(4, 0.5, -3));
  createSmokeEffect(new THREE.Vector3(-2, 0.5, -4));
  createSmokeEffect(new THREE.Vector3(-5, 0.5, -1));
  createSmokeEffect(new THREE.Vector3(6, 0.5, -5));
  
  // Add more dramatic smoke in the background
  createLargeSmokeEffect(new THREE.Vector3(10, 1, -15));
  createLargeSmokeEffect(new THREE.Vector3(-12, 1, -18));
  
  // Add some debris
  createDebris();
}

function createSmokeEffect(position) {
  const smokeParticles = new THREE.Group();
  scene.add(smokeParticles);
  
  const particleCount = 10;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.2
      })
    );
    
    // Random size and position
    const size = 0.5 + Math.random() * 1;
    particle.scale.set(size, size, size);
    
    // Random position around the center
    const spread = 1;
    particle.position.set(
      position.x + (Math.random() - 0.5) * spread,
      position.y + Math.random() * 1.5,
      position.z + (Math.random() - 0.5) * spread
    );
    
    smokeParticles.add(particle);
    
    // Animate the smoke particles
    animateSmokeParticle(particle);
  }
}

function createLargeSmokeEffect(position) {
  const smokeParticles = new THREE.Group();
  scene.add(smokeParticles);
  
  const particleCount = 25; // More particles for larger effect
  
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: 0x666666, // Darker smoke
        transparent: true,
        opacity: 0.4 + Math.random() * 0.3
      })
    );
    
    // Larger random size
    const size = 1.5 + Math.random() * 3;
    particle.scale.set(size, size, size);
    
    // Random position around the center with wider spread
    const spread = 4;
    particle.position.set(
      position.x + (Math.random() - 0.5) * spread,
      position.y + Math.random() * 8,
      position.z + (Math.random() - 0.5) * spread
    );
    
    smokeParticles.add(particle);
    
    // Animate the smoke particles more slowly for large effect
    animateLargeSmokeParticle(particle);
  }
}

function animateSmokeParticle(particle) {
  const speed = 0.2 + Math.random() * 0.3;
  const maxHeight = particle.position.y + 2 + Math.random() * 2;
  
  function animate() {
    particle.position.y += speed * 0.01;
    particle.material.opacity -= 0.001;
    
    if (particle.position.y < maxHeight && particle.material.opacity > 0) {
      requestAnimationFrame(animate);
    } else {
      // Remove the particle when animation completes
      if (particle.parent) {
        particle.parent.remove(particle);
      }
    }
  }
  
  animate();
}

function animateLargeSmokeParticle(particle) {
  const speed = 0.1 + Math.random() * 0.2; // Slower speed
  const maxHeight = particle.position.y + 5 + Math.random() * 5; // Higher rise
  
  function animate() {
    particle.position.y += speed * 0.01;
    particle.material.opacity -= 0.0005; // Slower fade
    
    if (particle.position.y < maxHeight && particle.material.opacity > 0) {
      requestAnimationFrame(animate);
    } else {
      // Remove the particle when animation completes
      if (particle.parent) {
        particle.parent.remove(particle);
      }
    }
  }
  
  animate();
}

function createDebris() {
  // Create some shell casings
  for (let i = 0; i < 40; i++) { // Increased from 15 to 40
    const casingGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8);
    const casingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xb5a642, // Brass color
      metalness: 0.7,
      roughness: 0.3
    });
    
    const casing = new THREE.Mesh(casingGeometry, casingMaterial);
    
    // Random position around the player
    const angle = Math.random() * Math.PI * 2;
    const distance = 1 + Math.random() * 5; // Wider spread
    casing.position.set(
      Math.cos(angle) * distance,
      0.05, // Just above the ground
      Math.sin(angle) * distance
    );
    
    // Random rotation
    casing.rotation.x = Math.random() * Math.PI;
    casing.rotation.z = Math.random() * Math.PI;
    
    casing.castShadow = true;
    scene.add(casing);
  }
  
  // Add some weapon debris - like broken guns, etc.
  for (let i = 0; i < 5; i++) {
    // Create a simple gun shape
    const gunGroup = new THREE.Group();
    
    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const barrelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333, // Dark gray
      metalness: 0.8,
      roughness: 0.2
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.z = Math.PI / 2; // Lay horizontal
    barrel.position.x = 0.4; // Extend forward
    gunGroup.add(barrel);
    
    // Gun body
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5a3825, // Brown wood
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    gunGroup.add(body);
    
    // Position randomly
    const angle = Math.random() * Math.PI * 2;
    const distance = 2 + Math.random() * 4;
    gunGroup.position.set(
      Math.cos(angle) * distance,
      0.07, // Just above the ground
      Math.sin(angle) * distance
    );
    
    // Random rotation
    gunGroup.rotation.y = Math.random() * Math.PI * 2;
    
    gunGroup.castShadow = true;
    scene.add(gunGroup);
  }
}

function createScreenshotUI() {
  // Create a UI with instructions
  const instructionDiv = document.createElement('div');
  instructionDiv.style.position = 'absolute';
  instructionDiv.style.bottom = '20px';
  instructionDiv.style.left = '20px';
  instructionDiv.style.color = 'white';
  instructionDiv.style.padding = '10px';
  instructionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  instructionDiv.style.borderRadius = '5px';
  instructionDiv.innerHTML = 'Post-Battle Scene for Screenshot - Press F12 to open DevTools and take a screenshot';
  document.body.appendChild(instructionDiv);
  
  // Create a capture button
  const captureButton = document.createElement('button');
  captureButton.innerText = 'Take Screenshot';
  captureButton.style.position = 'absolute';
  captureButton.style.top = '20px';
  captureButton.style.right = '20px';
  captureButton.style.padding = '10px';
  captureButton.style.backgroundColor = '#4CAF50';
  captureButton.style.color = 'white';
  captureButton.style.border = 'none';
  captureButton.style.borderRadius = '5px';
  captureButton.style.cursor = 'pointer';
  
  captureButton.addEventListener('click', () => {
    // Hide the button temporarily for the screenshot
    captureButton.style.display = 'none';
    instructionDiv.style.display = 'none';
    
    // Use a timeout to ensure the button is hidden
    setTimeout(() => {
      // Capture the canvas
      const link = document.createElement('a');
      link.download = 'nazi-island-post-battle.png';
      link.href = renderer.domElement.toDataURL('image/png');
      link.click();
      
      // Show the button again
      captureButton.style.display = 'block';
      instructionDiv.style.display = 'block';
    }, 100);
  });
  
  document.body.appendChild(captureButton);
}

function animate() {
  requestAnimationFrame(animate);
  
  // Optional: Add some subtle camera movement for a more cinematic feel
  camera.position.y = 5 + Math.sin(performance.now() * 0.0005) * 0.1;
  
  // Render the scene
  renderer.render(scene, camera);
} 