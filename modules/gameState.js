/**
 * Game state management class
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { WEAPONS, AMMO_TYPES } from './weapons.js';

export class GameState {
  constructor() {
    this.score = 0;
    this.wave = 1;
    this.health = 100;
    this.ammo = 50;
    this.isGameOver = false;
    this.mousePosition = new THREE.Vector2(0, 0);
    this.isPlaying = true;
    this.isWaveActive = false;
    this.reducedEffects = false;
    this.enemiesRemainingInWave = 0;
    
    // Weapon system properties
    this.currentWeapon = WEAPONS.M1_GARAND;
    this.hasMP41 = false;
    this.mp41Ammo = 0;
    this.autoFireActive = false;
  }
  
  /**
   * Add points to score
   * @param {number} points - Points to add
   */
  addScore(points) {
    this.score += points;
  }
  
  /**
   * Reduce player health
   * @param {number} damage - Amount of damage
   * @param {Function} onDeath - Optional callback when player dies
   */
  takeDamage(damage, onDeath) {
    this.health = Math.max(0, this.health - damage);
    if (this.health <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.isPlaying = false;
      
      // Call onDeath callback if provided
      if (typeof onDeath === 'function') {
        onDeath();
      }
    }
  }
  
  /**
   * Use ammo
   * @param {number} amount - Amount of ammo to use
   * @returns {boolean} - Whether ammo was successfully used
   */
  useAmmo(amount) {
    // Check which ammo type to use based on current weapon
    if (this.currentWeapon === WEAPONS.MP41) {
      if (this.mp41Ammo >= amount) {
        this.mp41Ammo -= amount;
        return true;
      }
      return false;
    } else {
      // Standard ammo for rifle
      if (this.ammo >= amount) {
        this.ammo -= amount;
        return true;
      }
      return false;
    }
  }
  
  /**
   * Add ammo to player
   * @param {number} amount - Amount of ammo to add
   * @param {string} ammoType - Type of ammo to add (from AMMO_TYPES)
   */
  addAmmo(amount, ammoType = AMMO_TYPES.STANDARD) {
    if (ammoType === AMMO_TYPES.MP41) {
      this.mp41Ammo += amount;
    } else {
      this.ammo += amount;
    }
  }
  
  /**
   * Get current ammo count based on equipped weapon
   * @returns {number} - Current ammo count
   */
  getCurrentAmmo() {
    return this.currentWeapon === WEAPONS.MP41 ? this.mp41Ammo : this.ammo;
  }
  
  /**
   * Switch to a weapon
   * @param {string} weaponType - Weapon type from WEAPONS enum
   * @returns {boolean} - Whether switch was successful
   */
  switchWeapon(weaponType) {
    if (weaponType === WEAPONS.MP41 && !this.hasMP41) {
      return false;
    }
    
    this.currentWeapon = weaponType;
    return true;
  }
  
  /**
   * Collect a weapon
   * @param {string} weaponType - Weapon type from WEAPONS enum
   */
  collectWeapon(weaponType) {
    if (weaponType === WEAPONS.MP41) {
      this.hasMP41 = true;
      // Switch to the MP41 automatically when picked up
      this.currentWeapon = WEAPONS.MP41;
    }
  }
  
  /**
   * Restore player's health and ammo after completing a wave
   * @returns {Object} - Object containing the amount of health and ammo restored
   */
  restoreWaveCompletion() {
    // Restore 50% of missing health
    const missingHealth = 100 - this.health;
    const healthToRestore = Math.round(missingHealth * 0.5);
    this.health = Math.min(100, this.health + healthToRestore);
    
    // Add 15 ammo
    const ammoToAdd = 15;
    this.ammo += ammoToAdd;
    
    // Return the amounts restored for display
    return {
      healthRestored: healthToRestore,
      ammoRestored: ammoToAdd
    };
  }
  
  /**
   * Progress to next wave
   */
  nextWave() {
    this.wave++;
  }
  
  /**
   * Reset game state
   */
  reset() {
    this.score = 0;
    this.wave = 1;
    this.health = 100;
    this.ammo = 50;
    this.isGameOver = false;
    this.isPlaying = true;
    this.isWaveActive = false;
    this.reducedEffects = false;
    this.enemiesRemainingInWave = 0;
    
    // Reset weapon properties
    this.currentWeapon = WEAPONS.M1_GARAND;
    this.hasMP41 = false;
    this.mp41Ammo = 0;
    this.autoFireActive = false;
  }
} 