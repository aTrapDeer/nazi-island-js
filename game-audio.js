// Bridge between the game and audioSystem
(function() {
  // Wait for the audioSystem to be available
  function waitForAudioSystem() {
    if (typeof audioSystem !== 'undefined') {
      console.log('Audio system detected, setting up game audio bridge');
      setupGameAudio();
    } else {
      console.log('Waiting for audio system...');
      setTimeout(waitForAudioSystem, 100);
    }
  }
  
  // Setup audio integration with game
  function setupGameAudio() {
    // Expose functions for the game to use
    window.gameAudio = {
      initialize: function() {
        if (audioSystem && !audioSystem.initialized) {
          audioSystem.initialize();
        }
      },
      
      playGameplayMusic: function() {
        if (audioSystem && audioSystem.initialized) {
          if (audioSystem.currentTrack === 'kia') {
            audioSystem.crossfade('kia', 'gameplay', 2);
          } else if (!audioSystem.tracks.gameplay || !audioSystem.tracks.gameplay.isPlaying) {
            audioSystem.playTrack('gameplay', 2);
          }
        }
      },
      
      playKIAMusic: function() {
        if (audioSystem && audioSystem.initialized) {
          if (audioSystem.currentTrack === 'gameplay') {
            audioSystem.crossfade('gameplay', 'kia', 2);
          } else {
            audioSystem.playTrack('kia', 2);
          }
        }
      }
    };
    
    console.log('Game audio bridge ready');
  }
  
  // Start waiting for audio system
  waitForAudioSystem();
})();

// Add MP41 sound to the available sound types
const SOUND_TYPES = {
  // ... existing sounds ...
  RIFLE_SHOT: 'rifle_shot',
  MP41_SHOT: 'mp41_shot',
  // ... other existing sounds ...
};

// Sound paths configuration
const SOUND_PATHS = {
  // ... existing sounds ...
  [SOUND_TYPES.RIFLE_SHOT]: 'sounds/rifle_shot.mp3',
  [SOUND_TYPES.MP41_SHOT]: 'sounds/mp41_shot.mp3',
  // ... other existing sounds ...
};

// If no MP41 sound is available, we'll use a placeholder function to create the sound
function createMP41SoundEffect(audioContext) {
  // Create a more rapid machinegun-like sound
  const duration = 0.15; // shorter sound
  const attackTime = 0.005;
  const releaseTime = 0.1;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Square wave for sharper sound
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(180, audioContext.currentTime); // Lower frequency than rifle
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Sound envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + attackTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
  
  // Start and stop
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  
  return {
    play() {
      // Already playing when created
    }
  };
}

// In the loadSounds function, add this as a fallback if MP41 sound file doesn't exist
function loadSounds() {
  // ... existing code ...
  
  // Add fallback for MP41 sound if the sound file doesn't exist
  if (!loadedSounds[SOUND_TYPES.MP41_SHOT]) {
    console.log("Using generated MP41 sound effect");
    loadedSounds[SOUND_TYPES.MP41_SHOT] = {
      audio: null,
      play: function(volume = 1.0) {
        return createMP41SoundEffect(audioContext);
      }
    };
  }
  
  // ... rest of the function ...
} 