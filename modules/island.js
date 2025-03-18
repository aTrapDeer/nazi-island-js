/**
 * Island module for creating the game environment
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

/**
 * Creates the island terrain and environment
 * @param {THREE.Scene} scene - The scene to add the island to
 * @returns {THREE.Object3D} - The island object
 */
export function createIsland(scene) {
  // Main island terrain
  const islandGeometry = new THREE.CircleGeometry(50, 64); // Increased segments for smoother edge
  const islandMaterial = new THREE.MeshStandardMaterial({
    color: 0x65914f,
    roughness: 0.8,
    metalness: 0.1
  });
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  island.rotation.x = -Math.PI / 2;
  island.position.y = -0.5;
  island.receiveShadow = true;
  scene.add(island);
  
  // Create terrain variation - hills and depressions
  addTerrainVariation(scene);
  
  // Water surrounding the island
  const waterGeometry = new THREE.PlaneGeometry(300, 300);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x0077be,
    roughness: 0.0,
    metalness: 0.8,
    transparent: true,
    opacity: 0.8
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.6;
  scene.add(water);
  
  // Add some terrain features
  addRocks(scene);
  addVegetation(scene);
  addBunker(scene);
  
  return island;
}

/**
 * Adds rocks to the scene
 * @param {THREE.Scene} scene - The scene to add rocks to
 */
function addRocks(scene) {
  // Add rocks with different sizes and positions
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 5;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Vary rock shapes
    let rockGeometry;
    const rockType = Math.floor(Math.random() * 3);
    switch(rockType) {
      case 0:
        rockGeometry = new THREE.DodecahedronGeometry(1 + Math.random() * 0.5, 0);
        break;
      case 1:
        rockGeometry = new THREE.OctahedronGeometry(0.8 + Math.random() * 0.7, 0);
        break;
      default:
        rockGeometry = new THREE.IcosahedronGeometry(0.7 + Math.random(), 0);
    }
    
    // Vary rock colors slightly
    const shade = 0.5 + Math.random() * 0.2;
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shade, shade, shade),
      roughness: 0.8 + Math.random() * 0.2
    });
    
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, Math.random() * 0.3, z);
    
    // Random rotation
    rock.rotation.x = Math.random() * Math.PI;
    rock.rotation.y = Math.random() * Math.PI;
    rock.rotation.z = Math.random() * Math.PI;
    
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    // Add collision data
    rock.userData.collidable = true;
    rock.userData.collisionRadius = 1 + Math.random() * 0.5; // Based on geometry size
    
    scene.add(rock);
  }
}

/**
 * Adds vegetation to the scene
 * @param {THREE.Scene} scene - The scene to add vegetation to
 */
function addVegetation(scene) {
  // Add trees in clusters
  const numTreeGroups = 7;
  
  for (let i = 0; i < numTreeGroups; i++) {
    // Random position for tree cluster
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 35 + 10; // Trees within 10-45 units from center
    
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Create cluster of trees
    const treeCount = 2 + Math.floor(Math.random() * 3); // 2-4 trees per cluster
    
    for (let j = 0; j < treeCount; j++) {
      // Position trees within cluster
      const clusterRadius = 2.5;
      const treeAngle = Math.random() * Math.PI * 2;
      const treeDistance = 1 + Math.random() * clusterRadius;
      
      const treeX = x + Math.cos(treeAngle) * treeDistance;
      const treeZ = z + Math.sin(treeAngle) * treeDistance;
      
      // Ensure tree is within island radius
      const distanceFromCenter = Math.sqrt(treeX * treeX + treeZ * treeZ);
      if (distanceFromCenter < 50) {
        // Create tree
        createTree(scene, treeX, treeZ);
      }
    }
  }
  
  // Add bushes
  const numBushes = 25;
  
  for (let i = 0; i < numBushes; i++) {
    // Random position
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 45; // Bushes within 45 units from center
    
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Create bush
    createBush(scene, x, z);
  }
}

/**
 * Creates a tree
 * @param {THREE.Object3D} parent - The parent object
 * @param {number} x - X position
 * @param {number} z - Z position
 */
function createTree(parent, x, z) {
  // Create tree group
  const treeGroup = new THREE.Group();
  treeGroup.position.set(x, 0, z);
  
  // Add trunk
  const trunkHeight = 1.5 + Math.random() * 1.5; // 1.5-3.0 units tall
  const trunkRadius = 0.2 + Math.random() * 0.1; // 0.2-0.3 units thick
  
  const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Brown
    roughness: 0.9,
    metalness: 0.1
  });
  
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.userData.isTree = true;
  trunk.userData.isTreePart = true;
  trunk.userData.isTrunk = true;
  treeGroup.add(trunk);
  
  // Add foliage (several parts to create a fuller tree)
  const foliageHeight = trunkHeight * 1.5;
  const foliageBottom = trunkHeight * 0.8; // Overlap with trunk
  const foliageRadius = 1.0 + Math.random() * 0.5; // 1.0-1.5 units wide
  
  // Main foliage cone
  const foliageGeometry = new THREE.ConeGeometry(foliageRadius, foliageHeight, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x2E8B57, // Green
    roughness: 0.9,
    metalness: 0.1
  });
  
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = foliageBottom + foliageHeight / 2;
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  foliage.userData.isTree = true;
  foliage.userData.isTreePart = true;
  foliage.userData.isFoliage = true;
  treeGroup.add(foliage);
  
  // Add secondary smaller foliage parts to make the tree fuller
  for (let i = 0; i < 3; i++) {
    const smallerRadius = foliageRadius * 0.8;
    const smallerHeight = foliageHeight * 0.7;
    const smallerGeometry = new THREE.ConeGeometry(smallerRadius, smallerHeight, 8);
    
    const smallerFoliage = new THREE.Mesh(smallerGeometry, foliageMaterial);
    const angleOffset = (i * Math.PI * 2) / 3;
    const radialDistance = foliageRadius * 0.4;
    
    smallerFoliage.position.set(
      Math.cos(angleOffset) * radialDistance,
      foliageBottom + smallerHeight / 2 + (Math.random() * 0.5),
      Math.sin(angleOffset) * radialDistance
    );
    
    smallerFoliage.castShadow = true;
    smallerFoliage.receiveShadow = true;
    smallerFoliage.userData.isTree = true;
    smallerFoliage.userData.isTreePart = true;
    smallerFoliage.userData.isFoliage = true;
    treeGroup.add(smallerFoliage);
  }
  
  // Mark tree as collidable
  treeGroup.userData.collidable = true;
  treeGroup.userData.collisionRadius = 0.8;
  treeGroup.userData.isTree = true;
  
  // Add tree to parent
  parent.add(treeGroup);
}

/**
 * Creates a bush
 * @param {THREE.Object3D} parent - The parent object
 * @param {number} x - X position
 * @param {number} z - Z position
 */
function createBush(parent, x, z) {
  // Create bush group
  const bushGroup = new THREE.Group();
  bushGroup.position.set(x, 0, z);
  
  // Create several slightly overlapping spheres for a bush
  const bushGeometry = new THREE.SphereGeometry(0.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const bushMaterial = new THREE.MeshStandardMaterial({
    color: 0x2E8B57, // Same green as tree foliage
    roughness: 0.9,
    metalness: 0.1
  });
  
  // Main bush part
  const mainBush = new THREE.Mesh(bushGeometry, bushMaterial);
  mainBush.position.y = 0.25; // Half height
  mainBush.scale.set(1, 0.5, 1); // Flatten
  mainBush.castShadow = true;
  mainBush.receiveShadow = true;
  bushGroup.add(mainBush);
  
  // Add additional parts
  const bushSegments = 3 + Math.floor(Math.random() * 2); // 3-4 segments
  
  for (let i = 0; i < bushSegments; i++) {
    const segment = mainBush.clone();
    
    // Random scaling
    const scale = 0.6 + Math.random() * 0.4; // 0.6-1.0 scale
    segment.scale.set(scale, scale * 0.5, scale);
    
    // Position
    const angle = (i / bushSegments) * Math.PI * 2;
    const distance = 0.2 + Math.random() * 0.2; // 0.2-0.4 distance from center
    
    segment.position.x = Math.cos(angle) * distance;
    segment.position.z = Math.sin(angle) * distance;
    segment.position.y = 0.25 * scale; // Adjusted for scale
    
    bushGroup.add(segment);
  }
  
  // Mark bush as collidable
  bushGroup.userData.collidable = true;
  bushGroup.userData.collisionRadius = 0.6;
  bushGroup.userData.isBush = true;
  
  // Add bush to parent
  parent.add(bushGroup);
}

/**
 * Adds terrain variation (hills, etc)
 * @param {THREE.Scene} scene - The scene to add terrain to
 */
function addTerrainVariation(scene) {
  // Add a few hills
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30 + 10;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    const hillSize = 4 + Math.random() * 6;
    const hillHeight = 1.5 + Math.random() * 2.5;
    
    const hillGeometry = new THREE.ConeGeometry(hillSize, hillHeight, 8);
    const hillMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d7c47,
      roughness: 0.9
    });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(x, 0, z);
    hill.castShadow = true;
    hill.receiveShadow = true;
    scene.add(hill);
  }
}

/**
 * Adds a military bunker
 * @param {THREE.Scene} scene - The scene to add the bunker to
 */
function addBunker(scene) {
  // Bunker group
  const bunkerGroup = new THREE.Group();
  bunkerGroup.position.set(15, 0, 10);
  
  // Add collision data to the entire bunker
  bunkerGroup.userData.collidable = true;
  bunkerGroup.userData.collisionRadius = 6.0; // Approximate radius of the bunker
  bunkerGroup.userData.isBunker = true;
  
  scene.add(bunkerGroup);
  
  // Main bunker structure
  const bunkerGeometry = new THREE.BoxGeometry(8, 2, 8);
  const bunkerMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a7a7a, // Concrete
    roughness: 0.6
  });
  const bunker = new THREE.Mesh(bunkerGeometry, bunkerMaterial);
  bunker.position.y = 1;
  bunker.castShadow = true;
  bunker.receiveShadow = true;
  bunkerGroup.add(bunker);
  
  // Bunker roof
  const roofGeometry = new THREE.BoxGeometry(9, 0.5, 9);
  const roof = new THREE.Mesh(roofGeometry, bunkerMaterial);
  roof.position.y = 2.25;
  roof.castShadow = true;
  bunkerGroup.add(roof);
  
  // Bunker entrance
  const entranceGeometry = new THREE.BoxGeometry(2, 1.5, 2);
  const entranceMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444, // Darker concrete
    roughness: 0.7
  });
  const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
  entrance.position.set(0, 0.75, -5);
  entrance.castShadow = true;
  bunkerGroup.add(entrance);
  
  // Bunker door
  const doorGeometry = new THREE.PlaneGeometry(1.2, 1.2);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Brown wood
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.75, -3.55);
  door.rotation.y = Math.PI;
  bunkerGroup.add(door);
  
  // Bunker window slits
  addBunkerWindow(bunkerGroup, 3, 1.5, 0);
  addBunkerWindow(bunkerGroup, -3, 1.5, 0);
  addBunkerWindow(bunkerGroup, 0, 1.5, 3);
  
  // Sandbags around bunker
  addSandbags(bunkerGroup);
  
  return bunkerGroup;
}

/**
 * Adds a bunker window
 * @param {THREE.Object3D} parent - Parent object to add window to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 */
function addBunkerWindow(parent, x, y, z) {
  const windowGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.5);
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111, // Very dark
    roughness: 0.8
  });
  const window = new THREE.Mesh(windowGeometry, windowMaterial);
  window.position.set(x, y, z);
  
  // Rotate window to face outward
  if (z === 0) {
    window.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
  }
  
  parent.add(window);
}

/**
 * Adds sandbags around the bunker
 * @param {THREE.Object3D} parent - Parent object to add sandbags to
 */
function addSandbags(parent) {
  const sandBagGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.4);
  const sandBagMaterial = new THREE.MeshStandardMaterial({
    color: 0xD2B48C, // Tan
    roughness: 1.0
  });
  
  // Create a barrier of sandbags
  for (let i = 0; i < 20; i++) {
    const angle = i / 20 * Math.PI * 2;
    const radius = 6;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Stack 2-3 layers of sandbags
    const height = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < height; j++) {
      const sandbag = new THREE.Mesh(sandBagGeometry, sandBagMaterial);
      // Alternate positions for stacking
      const offset = j % 2 === 0 ? 0 : 0.4;
      sandbag.position.set(x + offset * Math.cos(angle + Math.PI/2), 0.2 + j * 0.4, z + offset * Math.sin(angle + Math.PI/2));
      sandbag.rotation.y = angle + Math.PI/2;
      sandbag.castShadow = true;
      sandbag.receiveShadow = true;
      parent.add(sandbag);
    }
  }
} 