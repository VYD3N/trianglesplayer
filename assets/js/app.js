// ∇∆∇∆∇ Interactive LP - Vanilla JavaScript App
// OBJKT-compliant with no external dependencies

// App state
const app = {
    currentTrack: 0,
    isPlaying: false,
    currentPfp: 0,
    audioContext: null,
    analyser: null,
    dataArray: null,
    animationFrame: null
  };
  
  // Album data
  const albumData = {
    title: "∇∆∇∆∇",
    artist: "ⱩЯɎƧŦ ϺɎЯƗΛ",
    tracks: [
      { title: "ƑЯΛϺɎИ", duration: "2:51", path: "assets/audio/1.mp3" },
      { title: "ΛⱩɎЯƗΛИ", duration: "3:46", path: "assets/audio/2.mp3" },
      { title: "ΣŦĦΣŁƗΛ", duration: "3:15", path: "assets/audio/3.mp3" },
      { title: "ѴɎЯƗŦĦƗΣŁ", duration: "4:23", path: "assets/audio/4.mp3" },
      { title: "ŁΛΣŦĦЯΛ", duration: "3:53", path: "assets/audio/5.mp3" },
      { title: "ИɎŦĦΣЯƗƧ", duration: "3:48", path: "assets/audio/6.mp3" },
      { title: "ÐɎƧѴӨЯƗΛ", duration: "3:49", path: "assets/audio/7.mp3" },
      { title: "ⱩЯɎƧŦ ϺɎЯƗΛ", duration: "3:56", path: "assets/audio/8.mp3" },
      { title: "∇∆∇∆∇", duration: "6:24", path: "assets/audio/9.mp3" }
    ]
  };
  
  // PFP symbols
  const pfpSymbols = ["╱","╲","╳","◢","◣","◤","◥","◉","◎","◐","◑","◒","◓","◔","◕","◖","◗","◘","◙","◚","◛","◜","◝","◞","◟","◠","◡","◢","◣","◤","◥","◦","◧","◨","◩","◪","◫","◬","◭","◮","◯","◰","◱","◲","◳","◴","◵","◶","◷","◸","◹","◺","◻","◼","◽","◾","◿"];
  
  // DOM elements
  const elements = {
    audioPlayer: null,
    playBtn: null,
    prevBtn: null,
    nextBtn: null,
    vinylRecord: null,
    tonearm: null,
    trackList: null,
    pfpImg: null,
    pfpSymbol: null,
    prevPfpBtn: null,
    nextPfpBtn: null,
    bgGrid: null,
    bgVideo: null
  };
  
  // Initialize the app
  function init() {
    // Get DOM elements
    elements.audioPlayer = document.getElementById('audioPlayer');
    elements.playBtn = document.getElementById('playBtn');
    elements.prevBtn = document.getElementById('prevBtn');
    elements.nextBtn = document.getElementById('nextBtn');
    elements.vinylRecord = document.getElementById('vinylRecord');
    elements.tonearm = document.getElementById('tonearm');
    elements.trackList = document.getElementById('trackList');
    elements.pfpImg = document.getElementById('pfpImg');
    elements.pfpSymbol = document.getElementById('pfpSymbol');
    elements.prevPfpBtn = document.getElementById('prevPfpBtn');
    elements.nextPfpBtn = document.getElementById('nextPfpBtn');
    elements.bgGrid = document.querySelector('.bg-grid');
    elements.bgVideo = document.getElementById('bgVideo');
  
    // Initialize components
    initTracklist();
    initPfpGallery();
    initEventListeners();
    initAudioContext();
  
    // Load first track
    loadTrack(0);
  }
  
  // Initialize tracklist
  function initTracklist() {
    elements.trackList.innerHTML = '';
    albumData.tracks.forEach((track, index) => {
      const trackItem = document.createElement('div');
      trackItem.className = 'track-item';
      trackItem.innerHTML = `
        <div class="track-number">${index + 1}</div>
        <span>${track.title}</span>
        <span class="track-duration">${track.duration}</span>`;
      trackItem.addEventListener('click', () => loadTrack(index));
      elements.trackList.appendChild(trackItem);
    });
  }
  
  // Initialize PFP gallery
  function initPfpGallery() { updatePfpDisplay(); }
  
  // Initialize event listeners
  function initEventListeners() {
    // Play/Pause button
    elements.playBtn.addEventListener('click', togglePlay);
    // Previous/Next track buttons
    elements.prevBtn.addEventListener('click', () => loadTrack(app.currentTrack - 1));
    elements.nextBtn.addEventListener('click', () => loadTrack(app.currentTrack + 1));
    // PFP navigation
    elements.prevPfpBtn.addEventListener('click', () => changePfp(-1));
    elements.nextPfpBtn.addEventListener('click', () => changePfp(1));
    // Audio events
    elements.audioPlayer.addEventListener('ended', () => {
      // Pause video when track ends
      if (elements.bgVideo) {
        elements.bgVideo.pause();
      }
      // Auto-load next track and resume video if we were playing
      const wasPlaying = app.isPlaying;
      loadTrack(app.currentTrack + 1);
      // Resume video if we were playing before
      if (wasPlaying && elements.bgVideo) {
        elements.bgVideo.play();
      }
    });
    elements.audioPlayer.addEventListener('loadedmetadata', updateTrackDuration);
    // Mobile unlock
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });
  }
  
  // Initialize audio context for visualizer (uses real audio with heavy smoothing)
  function initAudioContext() {
    if (app.audioContext) return;
    try {
      app.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      app.analyser = app.audioContext.createAnalyser();
      app.analyser.fftSize = 1024;
      // High smoothing makes frame-to-frame changes mellow (MDN).
      app.analyser.smoothingTimeConstant = 0.92;
  
      // For OBJKT compatibility, we'll use a simpler approach
      // that doesn't require audio analysis
  
      app.dataArray = new Uint8Array(app.analyser.fftSize);
      startVisualizer(); // kick off rAF loop
    } catch (e) {
      console.log('Audio context not supported, using fallback mode', e);
      startVisualizer(true);
    }
  }
  
  // Load track
  function loadTrack(trackIndex) {
    if (trackIndex < 0) trackIndex = albumData.tracks.length - 1;
    if (trackIndex >= albumData.tracks.length) trackIndex = 0;
    app.currentTrack = trackIndex;
    const track = albumData.tracks[trackIndex];
    elements.audioPlayer.src = track.path;
    updateTracklist();
    if (app.isPlaying) {
      elements.audioPlayer.play().catch(() => { app.isPlaying = false; updatePlayButton(); });
    }
  }
  
  // Toggle play/pause
  function togglePlay() { if (app.isPlaying) pauseTrack(); else playTrack(); }
  
  // Play/Pause helpers
  function playTrack() {
    elements.audioPlayer.play().then(() => {
      app.isPlaying = true; updatePlayButton(); updateVinylState();
      // Resume video when audio plays
      if (elements.bgVideo) {
        elements.bgVideo.play();
      }
    }).catch(err => console.log('Playback failed:', err));
  }
  function pauseTrack() {
    elements.audioPlayer.pause();
    app.isPlaying = false; updatePlayButton(); updateVinylState();
    // Pause video when audio stops
    if (elements.bgVideo) {
      elements.bgVideo.pause();
    }
  }
  
  // Update play button
  function updatePlayButton() {
    elements.playBtn.textContent = app.isPlaying ? '⏸' : '▶';
    elements.playBtn.title = app.isPlaying ? 'Pause' : 'Play';
  }
  
  // Update vinyl state
  function updateVinylState() {
    elements.vinylRecord.classList.toggle('playing', app.isPlaying);
    elements.tonearm.classList.toggle('playing', app.isPlaying);
  }
  
  // Update tracklist
  function updateTracklist() {
    const trackItems = elements.trackList.querySelectorAll('.track-item');
    trackItems.forEach((item, index) => {
      item.classList.remove('current','playing');
      if (index === app.currentTrack) {
        item.classList.add('current');
        if (app.isPlaying) item.classList.add('playing');
      }
    });
  }
  
  // Update track duration on metadata load
  function updateTrackDuration() {
    const duration = elements.audioPlayer.duration;
    if (duration && !isNaN(duration)) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const currentTrackItem = elements.trackList.children[app.currentTrack];
      if (currentTrackItem) {
        const span = currentTrackItem.querySelector('.track-duration');
        if (span) span.textContent = formatted;
      }
    }
  }
  
  // Change PFP
  function changePfp(direction) {
    app.currentPfp += direction;
    if (app.currentPfp < 0) app.currentPfp = 99;
    if (app.currentPfp >= 100) app.currentPfp = 0;
    updatePfpDisplay();
  }
  
  // Update PFP display
  function updatePfpDisplay() {
    const n = app.currentPfp + 1;
    const img = document.getElementById('pfpImg');
    const sym = document.getElementById('pfpSymbol');
    img.src = `assets/images/pfps/${n}.jpg`;
    sym.textContent = pfpSymbols[app.currentPfp % pfpSymbols.length];
  }
  
  // ---- Visualizer ----
  function levelRMS(analyser, buf) {
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / buf.length); // 0..~1
  }
  
  function startVisualizer(fallback = false) {
    let ema = 0;                   // exponential moving average
    const EMA_ALPHA = 0.92;        // closer to 1 = smoother
    const MIN_SCALE = 0.995;       // tiny range to avoid “bouncing”
    const MAX_SCALE = 1.015;
  
    function animate() {
      app.animationFrame = requestAnimationFrame(animate);
  
      if (app.isPlaying) {
        let t;
  
        if (!fallback && app.analyser && app.dataArray) {
          const lvl = levelRMS(app.analyser, app.dataArray);
          ema = EMA_ALPHA * ema + (1 - EMA_ALPHA) * lvl;
          // ignore near-silence and compress the rest
          t = Math.min(1, Math.max(0, (ema - 0.02) / 0.18));
        } else {
          // graceful fallback: slow breathing
          const time = Date.now() * 0.001;
          t = (Math.sin(time * 1.5) * 0.5 + 0.5) * 0.25;
        }
  
        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * t;
        document.documentElement.style.setProperty('--grid-size', '30px'); // lock base cell size
        document.documentElement.style.setProperty('--grid-opacity', (0.06 + t * 0.06).toFixed(3));
        document.documentElement.style.setProperty('--grid-color', `hsl(${300 + t * 60}, 75%, ${45 + t * 10}%)`);
        document.documentElement.style.setProperty('--grid-scale', scale.toFixed(4));
      } else {
        // reset when paused
        document.documentElement.style.setProperty('--grid-color', '#f472b6');
        document.documentElement.style.setProperty('--grid-opacity', '0.05');
        document.documentElement.style.setProperty('--grid-size', '30px');
        document.documentElement.style.setProperty('--grid-scale', '1');
      }
    }
  
    animate();
  }
  
  // Utility
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${minutes}:${s.toString().padStart(2, '0')}`;
  }
  
  // Start the app when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
  
  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && app.isPlaying) pauseTrack();
  });
  