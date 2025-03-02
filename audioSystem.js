// Audio System for Nazi Island game
const audioSystem = {
  initialized: false,
  context: null,
  gainNodes: {},
  tracks: {},
  currentTrack: null,

  initialize() {
    if (this.initialized) return;
    
    // Create audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      
      // Create master gain node
      this.gainNodes.master = this.context.createGain();
      this.gainNodes.master.gain.value = 0.5; // Overall volume at 50%
      this.gainNodes.master.connect(this.context.destination);
      
      // Create individual gain nodes for each track
      this.gainNodes.gameplay = this.context.createGain();
      this.gainNodes.gameplay.gain.value = 0;
      this.gainNodes.gameplay.connect(this.gainNodes.master);
      
      this.gainNodes.kia = this.context.createGain();
      this.gainNodes.kia.gain.value = 0;
      this.gainNodes.kia.connect(this.gainNodes.master);
      
      // Load tracks
      this.loadTrack('gameplay', 'Music/WarTime.mp3');
      this.loadTrack('kia', 'Music/KIA.mp3');
      
      this.initialized = true;
      console.log('Audio system initialized');
    } catch (e) {
      console.error('Failed to initialize audio system:', e);
    }
  },

  loadTrack(id, url) {
    console.log(`Loading audio track: ${id} from ${url}`);
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load audio file: ${url}, status: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.tracks[id] = {
          buffer: audioBuffer,
          source: null,
          isPlaying: false,
          loop: true
        };
        console.log(`Audio track loaded: ${id}`);
        
        // Auto-start gameplay music when it's loaded
        if (id === 'gameplay' && !gameState.isGameOver) {
          this.playTrack('gameplay', 2);
        }
      })
      .catch(error => {
        console.error(`Error loading audio track ${id}:`, error);
      });
  },

  createSource(trackId) {
    const track = this.tracks[trackId];
    if (!track || !track.buffer) return null;
    
    // Create a new buffer source
    const source = this.context.createBufferSource();
    source.buffer = track.buffer;
    source.loop = track.loop;
    
    // Connect to appropriate gain node
    source.connect(this.gainNodes[trackId]);
    
    return source;
  },

  playTrack(trackId, fadeInTime = 1) {
    if (!this.initialized || !this.tracks[trackId]) {
      console.warn(`Cannot play track ${trackId}: System not initialized or track not loaded`);
      return;
    }
    
    console.log(`Playing track: ${trackId} with fade in time: ${fadeInTime}`);
    
    const track = this.tracks[trackId];
    
    // If already playing, don't restart
    if (track.isPlaying) return;
    
    // Create a new source
    track.source = this.createSource(trackId);
    if (!track.source) return;
    
    // Start with volume at 0
    const gainNode = this.gainNodes[trackId];
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    
    // Start playback
    track.source.start(0);
    track.isPlaying = true;
    
    // Fade in
    gainNode.gain.linearRampToValueAtTime(
      trackId === 'gameplay' ? 0.3 : 0.5, // Gameplay music a bit quieter
      this.context.currentTime + fadeInTime
    );
    
    this.currentTrack = trackId;
    console.log(`Now playing: ${trackId}`);
  },

  stopTrack(trackId, fadeOutTime = 1) {
    if (!this.initialized || !this.tracks[trackId] || !this.tracks[trackId].isPlaying) {
      return;
    }
    
    console.log(`Stopping track: ${trackId} with fade out time: ${fadeOutTime}`);
    
    const track = this.tracks[trackId];
    const gainNode = this.gainNodes[trackId];
    const stopTime = this.context.currentTime + fadeOutTime;
    
    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, stopTime);
    
    // Stop after fade out
    setTimeout(() => {
      if (track.source) {
        track.source.stop();
        track.source = null;
      }
      track.isPlaying = false;
      console.log(`Track stopped: ${trackId}`);
    }, fadeOutTime * 1000);
  },

  crossfade(fromTrackId, toTrackId, fadeTime = 2) {
    console.log(`Crossfading from ${fromTrackId} to ${toTrackId} over ${fadeTime}s`);
    
    // Start the new track
    this.playTrack(toTrackId, fadeTime);
    
    // Stop the old track
    this.stopTrack(fromTrackId, fadeTime);
  },

  fadeOutAll(fadeOutTime = 1) {
    for (const trackId in this.tracks) {
      if (this.tracks[trackId].isPlaying) {
        this.stopTrack(trackId, fadeOutTime);
      }
    }
  }
}; 