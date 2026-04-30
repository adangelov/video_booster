const STORAGE_KEY = 'playbackSpeed';
const DEFAULT_SPEED = 1;
let lastKnownSpeed = DEFAULT_SPEED;
let overlayTimeoutId;

function getVideoElements() {
  return Array.from(document.querySelectorAll('video')).filter(
    (video) => video instanceof HTMLVideoElement
  );
}

function showOverlay(speed) {
  const id = 'cr-speed-controller-overlay';
  let overlay = document.getElementById(id);

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    Object.assign(overlay.style, {
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      zIndex: '2147483647',
      padding: '8px 12px',
      borderRadius: '8px',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease',
      opacity: '0'
    });
    document.documentElement.appendChild(overlay);
  }

  overlay.textContent = `Speed: ${Number(speed)}x`;
  overlay.style.opacity = '1';

  clearTimeout(overlayTimeoutId);
  overlayTimeoutId = setTimeout(() => {
    overlay.style.opacity = '0';
  }, 1000);
}

function applySpeedToVideos(speed, showHint = false) {
  const videos = getVideoElements();
  videos.forEach((video) => {
    video.playbackRate = speed;
    video.defaultPlaybackRate = speed;
  });

  if (showHint && videos.length > 0) {
    showOverlay(speed);
  }

  return videos.length > 0;
}

async function loadStoredSpeed() {
  const data = await chrome.storage.sync.get(STORAGE_KEY);
  const storedSpeed = Number(data[STORAGE_KEY]);
  return Number.isFinite(storedSpeed) && storedSpeed >= 0.1 && storedSpeed <= 16
    ? storedSpeed
    : DEFAULT_SPEED;
}

async function initializeSpeed() {
  try {
    lastKnownSpeed = await loadStoredSpeed();
    applySpeedToVideos(lastKnownSpeed);
  } catch (error) {
    console.warn('Crunchyroll Speed Controller: failed to initialize speed.', error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SET_SPEED') {
    const speed = Number(message.speed);
    if (!Number.isFinite(speed) || speed < 0.1 || speed > 16) {
      sendResponse({ ok: false, error: 'Invalid speed' });
      return;
    }

    lastKnownSpeed = speed;
    const found = applySpeedToVideos(speed, true);
    sendResponse({ ok: found });
    return;
  }

  if (message?.type === 'GET_VIDEO_STATUS') {
    sendResponse({ ok: true, found: getVideoElements().length > 0 });
  }
});

const observer = new MutationObserver(() => {
  applySpeedToVideos(lastKnownSpeed);
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

document.addEventListener('keydown', async (event) => {
  if (!event.altKey) return;

  let nextSpeed = lastKnownSpeed;
  if (event.key === 'ArrowUp') {
    nextSpeed = Math.min(16, Number((lastKnownSpeed + 0.25).toFixed(2)));
  } else if (event.key === 'ArrowDown') {
    nextSpeed = Math.max(0.1, Number((lastKnownSpeed - 0.25).toFixed(2)));
  } else if (event.key === '0') {
    nextSpeed = 1;
  } else {
    return;
  }

  event.preventDefault();
  lastKnownSpeed = nextSpeed;
  await chrome.storage.sync.set({ [STORAGE_KEY]: nextSpeed });
  applySpeedToVideos(nextSpeed, true);
});

initializeSpeed();
