/**
 * Game state management class
 */
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

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
    if (this.ammo >= amount) {
      this.ammo -= amount;
      return true;
    }
    return false;
  }
  
  /**
   * Add ammo to player
   * @param {number} amount - Amount of ammo to add
   */
  addAmmo(amount) {
    this.ammo += amount;
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
  }
} 