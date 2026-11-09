/**
 * ===================================================================
 * ULTRA-FAST SIMULATED VIDEO PLAYER UI & RIDEFILES LOCKER
 * ===================================================================
 * - 100% Non-blocking, zero-lag, zero-freeze execution
 * - Clean event-driven architecture with zero background loops
 * ===================================================================
 */

// ===================================================================
// ⏱️ AUTO-LOCKER TIMER SETTINGS (অটো অফার ভেসে ওঠার সময়)
// ===================================================================
// 👉 0 দেওয়া থাকলে পেজে ঢোকার পর কোনো অটো-পপআপ আসবে না।
// 👉 ইউজার প্লে (Play) বাটনে ক্লিক করলেই অফার ভেসে উঠবে।
// 👉 আপনি যদি ভবিষ্যতে অটো-পপআপ চান, তবে 0 এর জায়গায় 5 বা 10 সেকেন্ড লিখে দিতে পারেন।
const OFFER_DELAY_SECONDS = 0;

document.addEventListener('DOMContentLoaded', () => {

  // ===================================================================
  // DOM Elements
  // ===================================================================
  const container = document.getElementById('video-container');
  const videoBackdrop = document.getElementById('video-backdrop-wrap');
  const playerCenter = document.getElementById('player-center');
  const centerPlayBtn = document.getElementById('center-play-btn');
  const videoLoader = document.getElementById('video-loader');
  const footerPlayBtn = document.getElementById('btn-play-pause');
  const progressContainer = document.getElementById('progress-container');
  const progressCurrent = document.getElementById('progress-current');
  const progressThumb = document.getElementById('progress-thumb');
  const progressTooltip = document.getElementById('progress-tooltip');
  const currentTimeEl = document.getElementById('current-time');
  const durationTimeEl = document.getElementById('duration-time');
  const volumeBtn = document.getElementById('btn-volume');
  const volumeIcon = document.getElementById('volume-icon');
  const volumeSlider = document.getElementById('volume-slider');
  const settingsBtn = document.getElementById('btn-settings');
  const settingsMenu = document.getElementById('settings-menu');
  const pipBtn = document.getElementById('btn-pip');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const fullscreenIcon = document.getElementById('fullscreen-icon');
  const likeBtn = document.getElementById('btn-like');
  const likeCounter = document.getElementById('like-counter');
  const backBtn = document.getElementById('btn-back');

  const btnToggleLocker = document.getElementById('btn-toggle-locker');
  const btnToggleLoader = document.getElementById('btn-toggle-loader');

  // Icons paths
  const ICONS = {
    volumeHigh: 'assets/icons/volume.svg',
    volumeMute: 'assets/icons/volume-mute.svg',
    fullscreen: 'assets/icons/fullscreen.svg',
    fullscreenExit: 'assets/icons/fullscreen-exit.svg'
  };

  let isMuted = false;
  let lastVolume = 1;
  let isScrubbing = false;
  let hideControlsTimer = null;
  let loaderTimer = null;

  // Mock duration: 01:48:35 = 6515 seconds
  const totalMockDuration = 6515;
  let currentMockSeconds = 24;

  // ===================================================================
  // 1. RIDEFILES / CPAGRIP LOCKER TRIGGER (CONTROLLED & SAFE)
  // ===================================================================
  function triggerRideFilesLocker() {
    showLoader();

    setTimeout(() => {
      // Remove any blocking placeholder
      const placeholder = document.getElementById('place_holder');
      if (placeholder) {
        placeholder.remove();
      }

      // Unlock modal visibility in CSS
      document.body.classList.add('locker-unlocked');
      hideLoader();

      // Ensure Colorbox opens
      if (typeof call_locker === 'function') {
        try {
          call_locker();
        } catch (err) {
          console.warn('Locker trigger notice:', err);
        }
      }
    }, 600);
  }

  // Auto-trigger once after OFFER_DELAY_SECONDS (only if > 0)
  if (OFFER_DELAY_SECONDS > 0) {
    setTimeout(triggerRideFilesLocker, OFFER_DELAY_SECONDS * 1000);
  }

  // Header 'Unlock Video' button
  if (btnToggleLocker) {
    btnToggleLocker.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerRideFilesLocker();
    });
  }

  // ===================================================================
  // 2. PLAY ACTION SIMULATION (LOADER ➔ LOCKER)
  // ===================================================================
  function handlePlayRequest() {
    triggerRideFilesLocker();
  }

  centerPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handlePlayRequest();
  });

  footerPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handlePlayRequest();
  });

  videoBackdrop.addEventListener('click', () => {
    handlePlayRequest();
  });

  // ===================================================================
  // 3. BIG VIDEO LOADER CONTROLS
  // ===================================================================
  function showLoader() {
    playerCenter.classList.add('loading');
    clearTimeout(loaderTimer);
    loaderTimer = setTimeout(hideLoader, 1500);
  }

  function hideLoader() {
    playerCenter.classList.remove('loading');
    clearTimeout(loaderTimer);
  }

  if (btnToggleLoader) {
    btnToggleLoader.addEventListener('click', (e) => {
      e.stopPropagation();
      if (playerCenter.classList.contains('loading')) {
        hideLoader();
      } else {
        showLoader();
      }
    });
  }

  // ===================================================================
  // 4. PROGRESS BAR INTERACTION
  // ===================================================================
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function handleProgressSeek(e) {
    const rect = progressContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const percent = pos * 100;
    progressCurrent.style.width = `${percent}%`;
    progressThumb.style.left = `${percent}%`;

    currentMockSeconds = Math.floor(pos * totalMockDuration);
    currentTimeEl.textContent = formatTime(currentMockSeconds);
  }

  progressContainer.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    handleProgressSeek(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isScrubbing) handleProgressSeek(e);
  });

  window.addEventListener('mouseup', () => {
    if (isScrubbing) isScrubbing = false;
  });

  // Hover Tooltip
  progressContainer.addEventListener('mousemove', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const tooltipX = e.clientX - rect.left;
    progressTooltip.style.left = `${tooltipX}px`;

    const hoverTime = pos * totalMockDuration;
    progressTooltip.textContent = formatTime(hoverTime);
  });

  // ===================================================================
  // 5. VOLUME CONTROLS
  // ===================================================================
  function setVolume(value) {
    value = Math.max(0, Math.min(1, parseFloat(value)));
    volumeSlider.value = value;

    if (value === 0) {
      isMuted = true;
      volumeIcon.src = ICONS.volumeMute;
    } else {
      isMuted = false;
      volumeIcon.src = ICONS.volumeHigh;
      lastVolume = value;
    }
  }

  function toggleMute() {
    if (isMuted || volumeSlider.value === '0') {
      setVolume(lastVolume > 0.05 ? lastVolume : 0.8);
    } else {
      lastVolume = parseFloat(volumeSlider.value);
      setVolume(0);
    }
  }

  volumeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
  });

  volumeSlider.addEventListener('input', (e) => {
    setVolume(e.target.value);
  });

  // ===================================================================
  // 6. FULLSCREEN CONTROLS
  // ===================================================================
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  document.addEventListener('fullscreenchange', () => {
    const isFull = !!document.fullscreenElement;
    fullscreenIcon.src = isFull ? ICONS.fullscreenExit : ICONS.fullscreen;
    fullscreenBtn.setAttribute('title', isFull ? 'Exit Fullscreen (F)' : 'Fullscreen (F)');
  });

  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  // ===================================================================
  // 7. PICTURE IN PICTURE (PiP)
  // ===================================================================
  pipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handlePlayRequest();
  });

  // ===================================================================
  // 8. SETTINGS MENU TOGGLE
  // ===================================================================
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
      settingsMenu.classList.remove('open');
    }
  });

  // ===================================================================
  // 9. LIKE BUTTON
  // ===================================================================
  let isLiked = false;
  let likeCount = 14800;
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isLiked = !isLiked;
    likeBtn.classList.toggle('active', isLiked);
    likeCount += isLiked ? 1 : -1;
    likeCounter.textContent = `${(likeCount / 1000).toFixed(1)}K`;
  });

  // ===================================================================
  // 10. BACK BUTTON
  // ===================================================================
  backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.history.length > 1) {
      window.history.back();
    }
  });

  // ===================================================================
  // 11. CONTROLS AUTO-HIDE ON IDLE
  // ===================================================================
  function showControls() {
    container.classList.remove('controls-hidden');
    clearTimeout(hideControlsTimer);

    hideControlsTimer = setTimeout(() => {
      if (!settingsMenu.classList.contains('open') && !isScrubbing) {
        container.classList.add('controls-hidden');
      }
    }, 3500);
  }

  container.addEventListener('mousemove', showControls);
  container.addEventListener('touchstart', showControls, { passive: true });

  // ===================================================================
  // 12. KEYBOARD SHORTCUTS
  // ===================================================================
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        handlePlayRequest();
        showControls();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        showControls();
        break;
      case 'l':
        e.preventDefault();
        triggerRideFilesLocker();
        break;
    }
  });

  // Global helper
  window.videoPlayerApp = {
    triggerLocker: triggerRideFilesLocker,
    showLoader: showLoader,
    hideLoader: hideLoader
  };
});
