const PRESET_SPEEDS = [0.5, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const DEFAULT_SPEED = 1;
const STORAGE_KEY = 'playbackSpeed';

const currentSpeedEl = document.getElementById('currentSpeed');
const statusTextEl = document.getElementById('statusText');
const customSpeedForm = document.getElementById('customSpeedForm');
const customSpeedInput = document.getElementById('customSpeed');
const speedButtons = Array.from(document.querySelectorAll('#speedButtons button'));
const extensionVersion = document.getElementById('extensionVersion');

function formatSpeed(speed) {
  return `${Number(speed)}x`;
}

function setStatus(message, foundVideo) {
  statusTextEl.textContent = message;
  statusTextEl.classList.toggle('ok', Boolean(foundVideo));
  statusTextEl.classList.toggle('warn', !foundVideo);
}

function markActiveSpeed(speed) {
  speedButtons.forEach((button) => {
    const buttonSpeed = Number(button.dataset.speed);
    button.classList.toggle('active', buttonSpeed === speed);
  });
}

function getActiveTab() {
  return chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => tabs[0]);
}

async function saveSpeed(speed) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: speed });
}

async function loadSpeed() {
  const data = await chrome.storage.sync.get(STORAGE_KEY);
  return Number(data[STORAGE_KEY]) || DEFAULT_SPEED;
}

async function sendSpeedToTab(speed) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    setStatus('No active tab', false);
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'SET_SPEED', speed });
    if (response?.ok) {
      setStatus('Video found', true);
    } else {
      setStatus('No video found', false);
    }
  } catch (error) {
    setStatus('No video found', false);
  }
}

async function applySpeed(speed) {
  currentSpeedEl.textContent = formatSpeed(speed);
  markActiveSpeed(speed);
  await saveSpeed(speed);
  await sendSpeedToTab(speed);
}

function validateSpeed(value) {
  if (value === '' || value === null || Number.isNaN(Number(value))) {
    return null;
  }

  const parsed = Number(value);
  if (parsed < 0.1 || parsed > 16) {
    return null;
  }

  return parsed;
}

speedButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const speed = Number(button.dataset.speed);
    applySpeed(speed);
  });
});

customSpeedForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const speed = validateSpeed(customSpeedInput.value.trim());
  if (!speed) {
    setStatus('Invalid speed (0.1 - 16)', false);
    return;
  }

  await applySpeed(speed);
});

(async function init() {
  extensionVersion.textContent = chrome.runtime.getManifest().version;
  const speed = await loadSpeed();
  await applySpeed(speed);
})();
