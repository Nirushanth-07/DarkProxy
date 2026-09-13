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
    this.fontSize = 8.5;
    this.columns = 0;
    this.drops = [];
    this.chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    this.active = false;
    
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    window.addEventListener('resize', this.resize);
  }
  
  resize() {
    this.canvas.width = 390;
    this.canvas.height = 600;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = Array(this.columns).fill(1).map(() => Math.floor(Math.random() * -80));
  }
  
  start() {
    if (this.active) return;
    this.active = true;
    this.canvas.style.opacity = "0.16";
    this.resize();
    this.draw();
  }
  
  stop() {
    this.active = false;
    this.canvas.style.opacity = "0";
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  draw() {
    if (!this.active) return;
    
    this.ctx.fillStyle = 'rgba(2, 4, 6, 0.12)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff41';
    this.ctx.font = `${this.fontSize}px monospace`;
    
    for (let i = 0; i < this.drops.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;
      
      if (Math.random() > 0.98) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = '#00ff66';
      }
      
      this.ctx.fillText(char, x, y);
      
      if (y > this.canvas.height && Math.random() > 0.985) {
        this.drops[i] = 0;
      }
      
      this.drops[i]++;
    }
    
    this.animationId = requestAnimationFrame(this.draw);
  }
}

let proxies = [];
let activeProxy = null;
let proxyEnabled = false;
let uptimeInterval = null;
let diagInterval = null;
let cumulativePackets = 0;

const audioEngine = new CyberAudio();
const matrixAnim = new MatrixRain('matrix-canvas');

const statusText = document.getElementById('status-text');
const statusLed = document.getElementById('status-led');
const proxyToggle = document.getElementById('proxy-toggle');

const activeName = document.getElementById('active-profile-name');
const activeAddress = document.getElementById('active-profile-address');
const activeType = document.getElementById('active-profile-type');
const uptimeCounter = document.getElementById('uptime-counter');

const profilesList = document.getElementById('profiles-list');
const profileCount = document.getElementById('profile-count');

const addForm = document.getElementById('add-proxy-form');
const terminalContent = document.getElementById('terminal-content');
const clearLogBtn = document.getElementById('clear-log-btn');

const viewDashboard = document.getElementById('view-dashboard');
const viewAddProfile = document.getElementById('view-add-profile');
const goToAddBtn = document.getElementById('go-to-add-btn');
const backToDashBtn = document.getElementById('back-to-dash-btn');

const soundToggleBtn = document.getElementById('sound-toggle-btn');
const matrixToggleBtn = document.getElementById('matrix-toggle-btn');

const pathLeft = document.getElementById('path-left');
const pathRight = document.getElementById('path-right');
const packetLeft = document.getElementById('packet-left');
const packetRight = document.getElementById('packet-right');
const svgNodeProxy = document.getElementById('svg-node-proxy');
const svgProxyLabel = document.getElementById('svg-proxy-label');

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
  soundToggleBtn.textContent = soundEnabled ? '[SOUND: ON]' : '[MUTED]';
  if (soundEnabled) soundToggleBtn.classList.add('active');

  if (matrixEnabled) {
    matrixAnim.start();
    matrixToggleBtn.textContent = '[MTX: ON]';
    matrixToggleBtn.classList.add('active');
  } else {
    matrixAnim.stop();
    matrixToggleBtn.textContent = '[MTX: OFF]';
    matrixToggleBtn.classList.remove('active');
  }

  proxyToggle.checked = proxyEnabled;
  updateStatusDisplay();
  renderProfilesList();
  startDiagnosticsTelemetry();

  await runConsoleBootSequence();

  proxyToggle.addEventListener('change', handleToggleProxy);
  addForm.addEventListener('submit', handleAddProfile);
  clearLogBtn.addEventListener('click', handleClearLogs);
  
  goToAddBtn.addEventListener('click', () => {
    audioEngine.playClick();
    viewDashboard.classList.remove('active');
    viewAddProfile.classList.add('active');
    logConsole('Opening security configuration socket...', 'info');
  });
  
  backToDashBtn.addEventListener('click', () => {
    audioEngine.playClick();
    viewAddProfile.classList.remove('active');
    viewDashboard.classList.add('active');
    logConsole('Syncing dashboard telemetry stream...', 'info');
  });

  soundToggleBtn.addEventListener('click', async () => {
    const isNowEnabled = !audioEngine.enabled;
    audioEngine.toggle(isNowEnabled);
    
    soundToggleBtn.textContent = isNowEnabled ? '[SOUND: ON]' : '[MUTED]';
    if (isNowEnabled) {
      soundToggleBtn.classList.add('active');
      audioEngine.playClick();
    } else {
      soundToggleBtn.classList.remove('active');
    }
    await browser.storage.local.set({ soundEnabled: isNowEnabled });
  });

  matrixToggleBtn.addEventListener('click', async () => {
    audioEngine.playClick();
    const isNowEnabled = !matrixAnim.active;
    if (isNowEnabled) {
      matrixAnim.start();
      matrixToggleBtn.textContent = '[MTX: ON]';
      matrixToggleBtn.classList.add('active');
    } else {
      matrixAnim.stop();
      matrixToggleBtn.textContent = '[MTX: OFF]';
      matrixToggleBtn.classList.remove('active');
    }
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
});

async function runConsoleBootSequence() {
  const bootLines = [
    { text: 'Initializing DarkProxy HUD environment...', type: 'info' },
    { text: 'Hooking route interception filter sockets...', type: 'muted' },
    { text: 'Syncing encrypted SQL profile database...', type: 'muted' },
    { text: `Security context: SHIELD-LVL-0x${Math.floor(Math.random()*8)+3}`, type: 'success' },
    { text: 'Anti-Leak DNS routing tunnel: VERIFIED.', type: 'success' },
  ];

  for (let i = 0; i < bootLines.length; i++) {
    await new Promise(res => setTimeout(res, 60 + i * 50));
    logConsole(bootLines[i].text, bootLines[i].type);
  }

  logConsole(`Systems ONLINE. Database sync OK. Found ${proxies.length} profile(s).`, 'success');
}

function logConsole(message, type = 'muted') {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const line = document.createElement('div');
  line.className = `log-line text-${type}`;
  
  let prefix = '[*]';
  if (type === 'success') prefix = '[+]';
  if (type === 'info') prefix = '[i]';
  if (type === 'alert') prefix = '[!]';
  
  line.textContent = `${prefix} [${timestamp}] ${message}`;
  terminalContent.appendChild(line);
  
  const body = document.querySelector('.terminal-body');
  body.scrollTop = body.scrollHeight;

  const lines = terminalContent.querySelectorAll('.log-line');
  if (lines.length > 50) {
    terminalContent.removeChild(lines[0]);
  }
}

// Renders list of saved profiles
function renderProfilesList() {
  profilesList.innerHTML = '';
  profileCount.textContent = `${proxies.length} profile${proxies.length === 1 ? '' : 's'}`;
  
  if (proxies.length === 0) {
    profilesList.innerHTML = '<div class="empty-list-msg">NO PROFILES LOADED. ADD ONE ABOVE.</div>';
    return;
  }
  
  proxies.forEach(profile => {
    const item = document.createElement('div');
    const isActive = activeProxy && activeProxy.id === profile.id;
    
    item.className = `profile-item ${isActive ? 'active' : ''}`;
    
    const info = document.createElement('div');
    info.className = 'profile-item-info';
    info.addEventListener('click', () => handleSelectProfile(profile));
    
    const title = document.createElement('span');
    title.className = 'profile-item-title';
    title.textContent = profile.name;
    
    const meta = document.createElement('span');
    meta.className = 'profile-item-meta';
    meta.textContent = `${profile.type.toUpperCase()} // ${profile.host}:${profile.port}`;
    
    info.appendChild(title);
    info.appendChild(meta);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Purge Profile';
    deleteBtn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteProfile(profile.id);
    });
    
    item.appendChild(info);
    item.appendChild(deleteBtn);
    profilesList.appendChild(item);
  });
}

function updateStatusDisplay() {
  const rows = document.querySelectorAll('.route-details .detail-row');
  
  if (proxyEnabled && activeProxy) {
    statusText.textContent = 'SECURE ROUTE ACTIVE';
    statusText.className = 'status-label text-connected';
    statusLed.className = 'led led-connected';
    
    activeName.textContent = activeProxy.name;
    activeName.className = 'detail-value text-connected';
    
    activeAddress.textContent = `${activeProxy.host}:${activeProxy.port}`;
    activeAddress.className = 'detail-value';
    
    activeType.textContent = activeProxy.type.toUpperCase();
    activeType.className = 'detail-value';
    
    rows.forEach(row => row.classList.add('active-state'));

    svgNodeProxy.classList.remove('disconnected');
    svgNodeProxy.classList.add('connected');
    svgProxyLabel.textContent = activeProxy.name.substring(0, 9).toUpperCase();
    
    pathLeft.classList.add('active');
    pathRight.classList.add('active');
    packetLeft.style.display = 'block';
    packetRight.style.display = 'block';

    document.querySelector('.route-card').setAttribute('data-sec-lbl', 'NET-SEC: SECURED');
    document.querySelector('.diagnostics-card').classList.add('active');
  } else {
    statusText.textContent = 'OFFLINE (DIRECT)';
    statusText.className = 'status-label text-disconnected';
    statusLed.className = 'led led-disconnected';
    
    activeName.textContent = 'DIRECT_CONNECTION';
    activeName.className = 'detail-value text-muted';
    
    activeAddress.textContent = 'BYPASS_ACTIVE';
    activeAddress.className = 'detail-value text-muted';
    
    activeType.textContent = 'DIRECT';
    activeType.className = 'detail-value text-muted';
    
    rows.forEach(row => row.classList.remove('active-state'));

    svgNodeProxy.classList.remove('connected');
    svgNodeProxy.classList.add('disconnected');
    svgProxyLabel.textContent = 'DIRECT';
    
    pathLeft.classList.remove('active');
    pathRight.classList.remove('active');
    packetLeft.style.display = 'none';
    packetRight.style.display = 'none';

    document.querySelector('.route-card').setAttribute('data-sec-lbl', 'NET-SEC: LOW');
    document.querySelector('.diagnostics-card').classList.remove('active');
  }
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

function startDiagnosticsTelemetry() {
  if (diagInterval) clearInterval(diagInterval);

  const updateDiag = async () => {
    if (proxyEnabled && activeProxy) {
      packetStatus.textContent = 'PAC_INTERCEPT: MONITORING';
      packetStatus.style.color = 'var(--accent-green)';

      const packetsGained = Math.floor(Math.random() * 5) + 1;
      cumulativePackets += packetsGained;
      
      packetCountVal.textContent = cumulativePackets.toLocaleString();
      const packetPercentage = (cumulativePackets % 500) / 5; 
      packetBar.style.width = `${packetPercentage}%`;

      if (Math.random() > 0.8) {
        try {
          await browser.storage.local.set({ cumulativePackets });
        } catch (e) {}
      }

      const targetLatency = Math.floor(Math.random() * 120) + 55;
      latencyVal.textContent = `${targetLatency} ms`;
      const latencyPercentage = Math.min((targetLatency / 300) * 100, 100);
      latencyBar.style.width = `${latencyPercentage}%`;

      const targetBitrate = (Math.random() * 850 + 150).toFixed(1);
      bitrateVal.textContent = `${targetBitrate} KB/s`;
      const bitratePercentage = Math.min((parseFloat(targetBitrate) / 1200) * 100, 100);
      bitrateBar.style.width = `${bitratePercentage}%`;

      const targetCpu = Math.floor(Math.random() * 18) + 4;
      cpuVal.textContent = `${targetCpu}%`;
      cpuBar.style.width = `${(targetCpu / 25) * 100}%`;

    } else {
      packetStatus.textContent = 'PAC_INTERCEPT: INACTIVE';
      packetStatus.style.color = 'var(--text-muted)';
      
      packetCountVal.textContent = '0';
      packetBar.style.width = '0%';
      
      latencyVal.textContent = '0 ms';
      latencyBar.style.width = '0%';
      
      bitrateVal.textContent = '0.0 KB/s';
      bitrateBar.style.width = '0%';
      
      const idleCpu = Math.floor(Math.random() * 3) + 1;
      cpuVal.textContent = `${idleCpu}%`;
      cpuBar.style.width = `${(idleCpu / 25) * 100}%`;
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
        logConsole('WARN: Interception failed. Select/configure a proxy gate first.', 'alert');
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
      logConsole(`Interception active. Forwarding all packages through profile [${activeProxy.name}]`, 'success');
    } else {
      await browser.storage.local.set({ proxyEnabled: false });
      await browser.storage.local.remove('connectionStartTime');
      
      stopUptimeTracker();
      audioEngine.playDisconnect();
      logConsole('Interception deactivated. Traffic routed directly (Clearing hooks).', 'info');
    }
    
    updateStatusDisplay();
    renderProfilesList();
  } catch (error) {
    audioEngine.playAlert();
    logConsole(`CRITICAL: Error toggling route: ${error.message}`, 'alert');
  }
}

async function handleSelectProfile(profile) {
  if (activeProxy && activeProxy.id === profile.id) {
    audioEngine.playClick();
    logConsole(`Profile [${profile.name}] is already bound to gate.`, 'info');
    return;
  }
  
  activeProxy = profile;
  audioEngine.playClick();
  logConsole(`Interception target set to: [${profile.name}]`, 'info');
  
  try {
    const updatePayload = { activeProxy: profile };
    
    if (proxyEnabled) {
      const newStartTime = Date.now();
      updatePayload.connectionStartTime = newStartTime;
      startUptimeTracker(newStartTime);
      audioEngine.playConnect();
      logConsole(`Hot-swapped route gate: ${profile.host}:${profile.port}`, 'success');
    }
    
    await browser.storage.local.set(updatePayload);
    updateStatusDisplay();
    renderProfilesList();
  } catch (error) {
    audioEngine.playAlert();
    logConsole(`CRITICAL: Error targeting profile: ${error.message}`, 'alert');
  }
}

async function handleDeleteProfile(profileId) {
  const target = proxies.find(p => p.id === profileId);
  if (!target) return;
  
  audioEngine.playAlert();
  
  try {
    proxies = proxies.filter(p => p.id !== profileId);
    logConsole(`Purged database profile node: [${target.name}]`, 'info');
    
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
        logConsole('Active routing profile purged. Resetting gateway to DIRECT.', 'alert');
      }
    }
    
    await browser.storage.local.set(updatePayload);
    updateStatusDisplay();
    renderProfilesList();
  } catch (error) {
    logConsole(`CRITICAL: Error purging database node: ${error.message}`, 'alert');
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
    logConsole('ERROR: Profile validation failed. Input buffer fields empty.', 'alert');
    return;
  }
  
  if (proxies.some(p => p.name.toLowerCase() === newProfile.name.toLowerCase())) {
    audioEngine.playAlert();
    logConsole(`ERROR: Identifier duplication. "${newProfile.name}" already exists.`, 'alert');
    return;
  }
  
  try {
    proxies.push(newProfile);
    await browser.storage.local.set({ proxies });
    
    audioEngine.playConnect();
    logConsole(`Successfully injected proxy gate node: [${newProfile.name}]`, 'success');
    
    if (proxies.length === 1) {
      await handleSelectProfile(newProfile);
    }
    
    addForm.reset();
    renderProfilesList();
    
    viewAddProfile.classList.remove('active');
    viewDashboard.classList.add('active');
    logConsole('Database modified. Returning to dashboard console.', 'success');
  } catch (error) {
    audioEngine.playAlert();
    logConsole(`CRITICAL: Error saving node injection: ${error.message}`, 'alert');
  }
}

function handleClearLogs() {
  audioEngine.playClick();
  terminalContent.innerHTML = '';
  logConsole('Console telemetry logs flushed.', 'info');
}
