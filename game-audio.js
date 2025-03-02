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