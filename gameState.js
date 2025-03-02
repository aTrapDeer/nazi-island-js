const gameState = {
    health: 100,
    maxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    score: 0,
    kills: 0,
    wave: 1,
    enemiesPerWave: 5,
    enemySpeed: 0.05,
    waveEnemiesRemaining: 5,
    waveInProgress: true,
    isGameOver: false,
    isPlayerDeathAnimationPlayed: false,
    isKilledInActionScreenShown: false,

    reset() {
        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.enemiesPerWave = 5;
        this.enemySpeed = 0.05;
        this.waveEnemiesRemaining = 5;
        this.waveInProgress = true;
        this.isGameOver = false;
        this.isPlayerDeathAnimationPlayed = false;
        this.isKilledInActionScreenShown = false;
    }
}; 