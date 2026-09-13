class CyberAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn("[DarkProxy] Web Audio API not supported", e);
    }
  }

  toggle(state) {
    this.enabled = state;
    if (this.enabled) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch(e){}
  }

  playConnect() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.ctx.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch(e){}
  }

  playDisconnect() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.ctx.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e){}
  }

  playAlert() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.ctx.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(280, now + 0.08);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.setValueAtTime(0.001, now + 0.07);
      gain.gain.setValueAtTime(0.05, now + 0.08);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.16);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch(e){}
  }
}

class MatrixRain {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animationId = null;
    this.lastFrame = 0;
    this.fontSize = 10;
    this.columns = 0;
    this.drops = [];
    this.chars = "0123456789abcdef";
    this.active = false;

    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    window.addEventListener('resize', this.resize);
  }

  resize() {
    const screen = this.canvas.parentElement;
    this.canvas.width = screen.clientWidth;
    this.canvas.height = screen.clientHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = Array(this.columns).fill(1).map(() => Math.floor(Math.random() * -60));
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.canvas.classList.add('on');
    this.resize();
    this.animationId = requestAnimationFrame(this.draw);
  }

  stop() {
    this.active = false;
    this.canvas.classList.remove('on');
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  draw(timestamp) {
    if (!this.active) return;
    this.animationId = requestAnimationFrame(this.draw);

    // Step at ~20fps so the rain reads like terminal output rather than video
    if (timestamp - this.lastFrame < 50) return;
    this.lastFrame = timestamp;

    this.ctx.fillStyle = 'rgba(35, 35, 35, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      this.ctx.fillStyle = Math.random() > 0.97 ? '#e6e6e6' : '#7c7c7c';
      this.ctx.fillText(char, x, y);

      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }

      this.drops[i]++;
    }
  }
}

const TYPE_LABELS = { socks: 'socks5', socks4: 'socks4', http: 'http', https: 'https' };
const LOG_TAGS = { success: ' ok ', info: 'info', alert: 'fail', muted: ' .. ' };
const BAR_WIDTH = 20;

let proxies = [];
let activeProxy = null;
let proxyEnabled = false;
let uptimeInterval = null;
let diagInterval = null;
let cumulativePackets = 0;

const audioEngine = new CyberAudio();
const matrixAnim = new MatrixRain('matrix-canvas');

const statusText = document.getElementById('status-text');
const proxyToggle = document.getElementById('proxy-toggle');
const routeProxy = document.getElementById('route-proxy');

const activeName = document.getElementById('active-profile-name');
const activeAddress = document.getElementById('active-profile-address');
const activeType = document.getElementById('active-profile-type');
const uptimeCounter = document.getElementById('uptime-counter');

const profilesList = document.getElementById('profiles-list');
const profileCount = document.getElementById('profile-count');

const addForm = document.getElementById('add-proxy-form');
const terminalContent = document.getElementById('terminal-content');
const logBody = document.getElementById('log-body');
const clearLogBtn = document.getElementById('clear-log-btn');

const viewDashboard = document.getElementById('view-dashboard');
const viewAddProfile = document.getElementById('view-add-profile');
const goToAddBtn = document.getElementById('go-to-add-btn');
const backToDashBtn = document.getElementById('back-to-dash-btn');

const soundToggleBtn = document.getElementById('sound-toggle-btn');
const matrixToggleBtn = document.getElementById('matrix-toggle-btn');

const packetStatus = document.getElementById('packet-status');
const packetCountVal = document.getElementById('packet-count-val');
const packetBar = document.getElementById('packet-bar');
const latencyVal = document.getElementById('latency-val');
const latencyBar = document.getElementById('latency-bar');
const bitrateVal = document.getElementById('bitrate-val');
const bitrateBar = document.getElementById('bitrate-bar');
const cpuVal = document.getElementById('cpu-val');
const cpuBar = document.getElementById('cpu-bar');

document.addEventListener('DOMContentLoaded', async () => {
  let storage = {};
  try {
    storage = await browser.storage.local.get([
      'proxies',
      'activeProxy',
      'proxyEnabled',
      'connectionStartTime',
      'soundEnabled',
      'matrixEnabled',
      'cumulativePackets'
    ]);
  } catch (err) {
    console.error(err);
  }

  proxies = storage.proxies || [];

  if (proxies.length === 0) {
    const defaultLocalProxy = {
      id: "default-localhost",
      name: "Local SOCKS5",
      type: "socks",
      host: "127.0.0.1",
      port: 1080,
      username: null,
      password: null
    };
    proxies = [defaultLocalProxy];
    activeProxy = defaultLocalProxy;
    try {
      await browser.storage.local.set({ proxies, activeProxy });
    } catch (err) {
      console.error(err);
    }
  } else {
    activeProxy = storage.activeProxy || null;
  }

  proxyEnabled = !!storage.proxyEnabled;
  cumulativePackets = storage.cumulativePackets || 0;

  const soundEnabled = storage.soundEnabled !== false;
  const matrixEnabled = storage.matrixEnabled === true;

  audioEngine.toggle(soundEnabled);
  renderSoundButton(soundEnabled);

  if (matrixEnabled) {
    matrixAnim.start();
  }
  renderMatrixButton(matrixEnabled);

  proxyToggle.checked = proxyEnabled;
  updateStatusDisplay();
  renderProfilesList();
  startDiagnosticsTelemetry();

  proxyToggle.addEventListener('change', handleToggleProxy);
  addForm.addEventListener('submit', handleAddProfile);
  clearLogBtn.addEventListener('click', handleClearLogs);

  goToAddBtn.addEventListener('click', () => {
    audioEngine.playClick();
    showView(viewAddProfile);
  });

  backToDashBtn.addEventListener('click', () => {
    audioEngine.playClick();
    showView(viewDashboard);
  });

  soundToggleBtn.addEventListener('click', async () => {
    const isNowEnabled = !audioEngine.enabled;
    audioEngine.toggle(isNowEnabled);
    renderSoundButton(isNowEnabled);
    if (isNowEnabled) {
      audioEngine.playClick();
    }
    await browser.storage.local.set({ soundEnabled: isNowEnabled });
  });

  matrixToggleBtn.addEventListener('click', async () => {
    audioEngine.playClick();
    const isNowEnabled = !matrixAnim.active;
    if (isNowEnabled) {
      matrixAnim.start();
    } else {
      matrixAnim.stop();
    }
    renderMatrixButton(isNowEnabled);
    await browser.storage.local.set({ matrixEnabled: isNowEnabled });
  });

  if (proxyEnabled && activeProxy) {
    let startTime = storage.connectionStartTime;
    if (!startTime) {
      startTime = Date.now();
      await browser.storage.local.set({ connectionStartTime: startTime });
    }
    startUptimeTracker(startTime);
  } else {
    updateUptimeDisplay(0);
  }

  runConsoleBootSequence();
});

async function runConsoleBootSequence() {
  const online = proxyEnabled && activeProxy;
  const bootLines = [
    { text: 'starting darkproxy console', type: 'muted' },
    { text: 'reading profiles from local storage', type: 'muted' },
    { text: `loaded ${proxies.length} profile${proxies.length === 1 ? '' : 's'}`, type: 'success' },
    online
      ? { text: `routing via ${activeProxy.name} (${activeProxy.host}:${activeProxy.port})`, type: 'success' }
      : { text: 'proxy off — traffic goes direct', type: 'info' },
  ];

  for (const line of bootLines) {
    await new Promise(res => setTimeout(res, 70));
    logConsole(line.text, line.type);
  }
}

function logConsole(message, type = 'muted') {
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;

  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });

  const tag = document.createElement('span');
  tag.className = 'log-tag';
  tag.textContent = `[${LOG_TAGS[type] || LOG_TAGS.muted}]`;

  const text = document.createElement('span');
  text.className = 'log-msg';
  text.textContent = message;

  line.append(time, tag, text);
  terminalContent.appendChild(line);
  logBody.scrollTop = logBody.scrollHeight;

  while (terminalContent.children.length > 50) {
    terminalContent.firstElementChild.remove();
  }
}

function showView(view) {
  viewDashboard.classList.toggle('active', view === viewDashboard);
  viewAddProfile.classList.toggle('active', view === viewAddProfile);
  if (view === viewAddProfile) {
    document.getElementById('proxy-name').focus();
  }
}

function renderSoundButton(enabled) {
  soundToggleBtn.textContent = `snd:${enabled ? 'on' : 'off'}`;
  soundToggleBtn.classList.toggle('active', enabled);
  soundToggleBtn.setAttribute('aria-pressed', String(enabled));
}

function renderMatrixButton(enabled) {
  matrixToggleBtn.textContent = `rain:${enabled ? 'on' : 'off'}`;
  matrixToggleBtn.classList.toggle('active', enabled);
  matrixToggleBtn.setAttribute('aria-pressed', String(enabled));
}

function formatType(type) {
  return TYPE_LABELS[type] || type;
}

// Renders list of saved profiles
function renderProfilesList() {
  profilesList.replaceChildren();
  profileCount.textContent = `(${proxies.length})`;

  if (proxies.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'profiles-empty';
    empty.textContent = 'no profiles — use [+ add] to create one';
    profilesList.appendChild(empty);
    return;
  }

  proxies.forEach(profile => {
    const isActive = !!(activeProxy && activeProxy.id === profile.id);

    const item = document.createElement('li');
    item.className = `profile${isActive ? ' active' : ''}`;

    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'profile-select';
    select.title = isActive ? 'Selected profile' : 'Use this profile';
    select.setAttribute('aria-pressed', String(isActive));
    select.addEventListener('click', () => handleSelectProfile(profile));

    const mark = document.createElement('span');
    mark.className = 'profile-mark';
    mark.textContent = isActive ? '*' : ' ';

    const name = document.createElement('span');
    name.className = 'profile-name';
    name.textContent = profile.name;

    const meta = document.createElement('span');
    meta.className = 'profile-meta';
    meta.textContent = `${formatType(profile.type)} ${profile.host}:${profile.port}`;

    select.append(mark, name, meta);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'profile-rm';
    deleteBtn.title = `Delete ${profile.name}`;
    deleteBtn.textContent = 'rm';
    deleteBtn.addEventListener('click', () => handleDeleteProfile(profile.id));

    item.append(select, deleteBtn);
    profilesList.appendChild(item);
  });
}

function updateStatusDisplay() {
  const online = !!(proxyEnabled && activeProxy);
  document.body.classList.toggle('is-online', online);

  statusText.textContent = online ? 'proxied' : 'direct';
  routeProxy.textContent = online ? activeProxy.name : 'direct';
  routeProxy.title = routeProxy.textContent;

  setDetail(activeName, activeProxy ? activeProxy.name : 'none');
  setDetail(activeAddress, activeProxy ? `${activeProxy.host}:${activeProxy.port}` : '—');
  setDetail(activeType, activeProxy ? formatType(activeProxy.type) : '—');
}

function setDetail(el, value) {
  el.textContent = value;
  el.title = value;
}

function startUptimeTracker(startTime) {
  if (uptimeInterval) clearInterval(uptimeInterval);

  const update = () => {
    const delta = Math.floor((Date.now() - startTime) / 1000);
    updateUptimeDisplay(delta);
  };

  update();
  uptimeInterval = setInterval(update, 1000);
}

function updateUptimeDisplay(totalSeconds) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');

  uptimeCounter.textContent = `${hrs}:${mins}:${secs}`;
}

function stopUptimeTracker() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
    uptimeInterval = null;
  }
  updateUptimeDisplay(0);
}

// Draws an htop-style text meter, e.g. [|||||||             ]
function setBar(el, percent) {
  const filled = Math.round((Math.min(Math.max(percent, 0), 100) / 100) * BAR_WIDTH);
  const fill = document.createElement('span');
  fill.className = 'bar-fill';
  fill.textContent = '|'.repeat(filled);
  el.replaceChildren('[', fill, ' '.repeat(BAR_WIDTH - filled), ']');
}

function startDiagnosticsTelemetry() {
  if (diagInterval) clearInterval(diagInterval);

  const updateDiag = async () => {
    if (proxyEnabled && activeProxy) {
      packetStatus.textContent = 'monitoring';

      cumulativePackets += Math.floor(Math.random() * 5) + 1;
      packetCountVal.textContent = cumulativePackets.toLocaleString();
      setBar(packetBar, (cumulativePackets % 500) / 5);

      if (Math.random() > 0.8) {
        try {
          await browser.storage.local.set({ cumulativePackets });
        } catch (e) {}
      }

      const latency = Math.floor(Math.random() * 120) + 55;
      latencyVal.textContent = `${latency} ms`;
      setBar(latencyBar, (latency / 300) * 100);

      const bitrate = Math.random() * 850 + 150;
      bitrateVal.textContent = `${bitrate.toFixed(1)} kB/s`;
      setBar(bitrateBar, (bitrate / 1200) * 100);

      const cpu = Math.floor(Math.random() * 18) + 4;
      cpuVal.textContent = `${cpu}%`;
      setBar(cpuBar, (cpu / 25) * 100);

    } else {
      packetStatus.textContent = 'idle';

      packetCountVal.textContent = '0';
      setBar(packetBar, 0);

      latencyVal.textContent = '0 ms';
      setBar(latencyBar, 0);

      bitrateVal.textContent = '0.0 kB/s';
      setBar(bitrateBar, 0);

      const idleCpu = Math.floor(Math.random() * 3) + 1;
      cpuVal.textContent = `${idleCpu}%`;
      setBar(cpuBar, (idleCpu / 25) * 100);
    }
  };

  updateDiag();
  diagInterval = setInterval(updateDiag, 900);
}

async function handleToggleProxy(e) {
  proxyEnabled = e.target.checked;

  try {
    if (proxyEnabled) {
      if (!activeProxy) {
        logConsole('no profile selected — pick one before turning the proxy on', 'alert');
        audioEngine.playAlert();
        proxyToggle.checked = false;
        proxyEnabled = false;
        return;
      }

      const startTime = Date.now();
      await browser.storage.local.set({
        proxyEnabled: true,
        connectionStartTime: startTime
      });

      startUptimeTracker(startTime);
      audioEngine.playConnect();
      logConsole(`proxy on — routing via ${activeProxy.name} (${activeProxy.host}:${activeProxy.port})`, 'success');
    } else {
      await browser.storage.local.set({ proxyEnabled: false });
      await browser.storage.local.remove('connectionStartTime');

      stopUptimeTracker();
      audioEngine.playDisconnect();
      logConsole('proxy off — traffic goes direct', 'info');
    }

    updateStatusDisplay();
    renderProfilesList();
  } catch (error) {
    audioEngine.playAlert();
    logConsole(`could not toggle proxy: ${error.message}`, 'alert');
  }
}

async function handleSelectProfile(profile) {
  if (activeProxy && activeProxy.id === profile.id) {
    audioEngine.playClick();
    logConsole(`${profile.name} is already selected`, 'muted');
    return;
  }

  activeProxy = profile;
  audioEngine.playClick();
  logConsole(`selected ${profile.name}`, 'info');

  try {
    const updatePayload = { activeProxy: profile };

    if (proxyEnabled) {
      const newStartTime = Date.now();
      updatePayload.connectionStartTime = newStartTime;
      startUptimeTracker(newStartTime);
      audioEngine.playConnect();
      logConsole(`now routing via ${profile.host}:${profile.port}`, 'success');
    }

    await browser.storage.local.set(updatePayload);
    updateStatusDisplay();
    renderProfilesList();
  } catch (error) {
    audioEngine.playAlert();
    logConsole(`could not select profile: ${error.message}`, 'alert');
  }
}

async function handleDeleteProfile(profileId) {
  const target = proxies.find(p => p.id === profileId);
  if (!target) return;

  audioEngine.playAlert();

  try {
    proxies = proxies.filter(p => p.id !== profileId);
    logConsole(`deleted ${target.name}`, 'info');

    const updatePayload = { proxies };

    if (activeProxy && activeProxy.id === profileId) {
      activeProxy = null;
      updatePayload.activeProxy = null;

      if (proxyEnabled) {
        proxyEnabled = false;
        proxyToggle.checked = false;
        updatePayload.proxyEnabled = false;
        updatePayload.connectionStartTime = null;
        stopUptimeTracker();
        audioEngine.playDisconnect();
        logConsole('active profile deleted — proxy turned off', 'alert');
      }
    }

    await browser.storage.local.set(updatePayload);
    updateStatusDisplay();
    renderProfilesList();
  } catch (error) {
    logConsole(`could not delete profile: ${error.message}`, 'alert');
  }
}

async function handleAddProfile(e) {
  e.preventDefault();

  const nameInput = document.getElementById('proxy-name');
  const typeInput = document.getElementById('proxy-type');
  const hostInput = document.getElementById('proxy-host');
  const portInput = document.getElementById('proxy-port');
  const userInput = document.getElementById('proxy-user');
  const passInput = document.getElementById('proxy-pass');

  const newProfile = {
    id: Date.now().toString(),
    name: nameInput.value.trim(),
    type: typeInput.value,
    host: hostInput.value.trim(),
    port: parseInt(portInput.value, 10),
    username: userInput.value.trim() || null,
    password: passInput.value || null
  };

  if (!newProfile.name || !newProfile.host || isNaN(newProfile.port)) {
    audioEngine.playAlert();
    logConsole('name, host and port are required', 'alert');
    return;
  }

  if (proxies.some(p => p.name.toLowerCase() === newProfile.name.toLowerCase())) {
    audioEngine.playAlert();
    logConsole(`a profile named "${newProfile.name}" already exists`, 'alert');
    return;
  }

  try {
    proxies.push(newProfile);
    await browser.storage.local.set({ proxies });

    audioEngine.playConnect();
    logConsole(`added ${newProfile.name} (${formatType(newProfile.type)} ${newProfile.host}:${newProfile.port})`, 'success');

    if (proxies.length === 1) {
      await handleSelectProfile(newProfile);
    }

    addForm.reset();
    renderProfilesList();
    showView(viewDashboard);
  } catch (error) {
    audioEngine.playAlert();
    logConsole(`could not save profile: ${error.message}`, 'alert');
  }
}

function handleClearLogs() {
  audioEngine.playClick();
  terminalContent.replaceChildren();
  logConsole('log cleared', 'muted');
}
