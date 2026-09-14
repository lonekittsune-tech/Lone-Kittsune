// ============================================================
// Midnight Drift – Enhanced
// Inspired by Tokyo Drift / Initial D / MF Ghost / Midnight Club
// Features: Car select, Multiple tracks, Better AI, Nitro,
//           Sound effects, Tire marks, Mini-map
// Pure HTML5 Canvas + JS – GitHub Pages ready
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  const maxW = Math.min(window.innerWidth - 16, 1200);
  const maxH = Math.min(window.innerHeight - 16, 750);
  canvas.width = maxW;
  canvas.height = maxH;
}
window.addEventListener('resize', resize);
resize();

// -------------------- SOUND (Web Audio API) --------------------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, duration, type = 'square', volume = 0.08) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playDriftScreech() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 180 + Math.random() * 40;
  gain.gain.value = 0.04;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function playCheckpoint() {
  playTone(660, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(880, 0.1, 'sine', 0.1), 80);
}

function playFinish() {
  playTone(523, 0.15, 'square', 0.12);
  setTimeout(() => playTone(659, 0.15, 'square', 0.12), 150);
  setTimeout(() => playTone(784, 0.25, 'square', 0.12), 300);
}

function playNitro() {
  playTone(120, 0.3, 'sawtooth', 0.06);
}

// -------------------- CARS DATA --------------------
const CARS = [
  {
    id: 'ae86',
    name: 'AE86 Trueno',
    color: '#f5f5f5',
    accent: '#e00',
    maxSpeed: 8.8,
    accel: 0.17,
    turn: 0.052,
    drift: 0.88,
    nitroPower: 1.35,
    desc: 'Classic Initial D'
  },
  {
    id: 'rx7',
    name: 'RX-7 FD',
    color: '#ff3333',
    accent: '#fff',
    maxSpeed: 9.4,
    accel: 0.19,
    turn: 0.048,
    drift: 0.90,
    nitroPower: 1.45,
    desc: 'Rotary beast'
  },
  {
    id: 'gtr',
    name: 'Skyline GT-R',
    color: '#2244aa',
    accent: '#fff',
    maxSpeed: 10.0,
    accel: 0.21,
    turn: 0.044,
    drift: 0.85,
    nitroPower: 1.55,
    desc: 'Godzilla'
  },
  {
    id: 'supra',
    name: 'Supra MK4',
    color: '#ffaa00',
    accent: '#222',
    maxSpeed: 9.7,
    accel: 0.20,
    turn: 0.046,
    drift: 0.87,
    nitroPower: 1.50,
    desc: 'Tokyo Drift'
  },
  {
    id: 's15',
    name: 'Silvia S15',
    color: '#33cc66',
    accent: '#111',
    maxSpeed: 9.1,
    accel: 0.18,
    turn: 0.055,
    drift: 0.93,
    nitroPower: 1.40,
    desc: 'Drift king'
  }
];

// -------------------- TRACKS DATA --------------------
const TRACKS = [
  {
    id: 'mountain',
    name: 'Akina Pass',
    desc: 'Classic touge',
    points: [
      { x: 180, y: 380 }, { x: 260, y: 290 }, { x: 380, y: 220 },
      { x: 520, y: 170 }, { x: 680, y: 190 }, { x: 800, y: 270 },
      { x: 870, y: 390 }, { x: 840, y: 520 }, { x: 700, y: 590 },
      { x: 520, y: 610 }, { x: 350, y: 560 }, { x: 220, y: 470 },
      { x: 160, y: 380 }
    ],
    roadWidth: 88,
    laps: 3,
    bg: ['#1a1a2e', '#0a0a12']
  },
  {
    id: 'city',
    name: 'Shibuya Night',
    desc: 'Urban circuit',
    points: [
      { x: 150, y: 200 }, { x: 350, y: 160 }, { x: 550, y: 180 },
      { x: 720, y: 250 }, { x: 820, y: 380 }, { x: 780, y: 520 },
      { x: 600, y: 580 }, { x: 400, y: 560 }, { x: 220, y: 500 },
      { x: 140, y: 360 }, { x: 160, y: 250 }
    ],
    roadWidth: 100,
    laps: 3,
    bg: ['#1a1525', '#0c0814']
  },
  {
    id: 'harbor',
    name: 'Yokohama Docks',
    desc: 'Wide & fast',
    points: [
      { x: 200, y: 300 }, { x: 400, y: 200 }, { x: 650, y: 180 },
      { x: 850, y: 280 }, { x: 900, y: 450 }, { x: 750, y: 580 },
      { x: 500, y: 620 }, { x: 250, y: 550 }, { x: 140, y: 400 },
      { x: 180, y: 300 }
    ],
    roadWidth: 110,
    laps: 3,
    bg: ['#12202a', '#081018']
  }
];

// -------------------- STATE --------------------
let state = 'menu'; // menu | racing | finished
let selectedCar = 0;
let selectedTrack = 0;
let lap = 1;
let maxLaps = 3;
let raceTime = 0;
let bestTimes = JSON.parse(localStorage.getItem('midnightDriftBests') || '{}');
let lastCheckpoint = 0;
let tireMarks = [];
const MAX_MARKS = 400;

// Input
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyR' && state !== 'menu') restartToMenu();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// -------------------- TRACK BUILDER --------------------
let currentTrack = null;
let trackLeft = [];
let trackRight = [];
let checkpoints = [];
const CHECKPOINT_COUNT = 8;

function buildTrack(trackDef) {
  const pts = [...trackDef.points];
  // close the loop
  if (pts[0].x !== pts[pts.length - 1].x || pts[0].y !== pts[pts.length - 1].y) {
    pts.push({ ...pts[0] });
  }

  const left = [];
  const right = [];
  const w = trackDef.roadWidth;

  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    left.push({ x: p1.x + nx * w / 2, y: p1.y + ny * w / 2 });
    right.push({ x: p1.x - nx * w / 2, y: p1.y - ny * w / 2 });
  }

  // checkpoints
  const cps = [];
  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  let accum = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    accum += seg;
    const ratio = accum / totalLen;
    for (let c = 1; c <= CHECKPOINT_COUNT; c++) {
      if (Math.abs(ratio - c / CHECKPOINT_COUNT) < 0.03 && !cps.find(cp => cp.id === c)) {
        cps.push({ id: c, x: pts[i].x, y: pts[i].y, passed: false });
      }
    }
  }
  if (!cps.find(c => c.id === CHECKPOINT_COUNT)) {
    cps.push({ id: CHECKPOINT_COUNT, x: pts[0].x, y: pts[0].y, passed: false });
  }

  return { points: pts, left, right, checkpoints: cps, roadWidth: w, bg: trackDef.bg, laps: trackDef.laps };
}

// -------------------- CAR CLASS --------------------
class Car {
  constructor(x, y, angle, carData, isPlayer = false, aiSkill = 0.85) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 0;
    this.angularVel = 0;
    this.data = carData;
    this.color = carData.color;
    this.accent = carData.accent;
    this.isPlayer = isPlayer;
    this.width = 30;
    this.height = 15;
    this.nitro = 100;
    this.nitroActive = false;
    this.handbrake = false;
    this.aiSkill = aiSkill;
    this.targetIdx = 0;
    this.lap = 1;
    this.checkpoint = 0;
    this.finished = false;
    this.finishTime = 0;
  }

  update(dt) {
    if (this.finished) return;

    if (this.isPlayer) this.playerControl();
    else this.aiControl();

    // Physics
    const grip = this.handbrake ? this.data.drift * 0.85 : this.data.drift + 0.06;
    this.speed *= 0.985 * (this.handbrake ? 0.97 : 1);

    const fx = Math.cos(this.angle);
    const fy = Math.sin(this.angle);
    const lx = -fy;
    const ly = fx;

    // nitro
    let speedMul = 1;
    if (this.nitroActive && this.nitro > 0) {
      speedMul = this.data.nitroPower;
      this.nitro -= 0.55 * dt;
      if (this.nitro < 0) this.nitro = 0;
    } else {
      this.nitroActive = false;
      if (this.nitro < 100) this.nitro += 0.08 * dt;
    }

    this.x += (fx * this.speed * grip + lx * this.speed * (1 - grip) * 0.45) * speedMul;
    this.y += (fy * this.speed * grip + ly * this.speed * (1 - grip) * 0.45) * speedMul;

    this.angle += this.angularVel;
    this.angularVel *= 0.82;

    // soft bounds
    this.x = Math.max(30, Math.min(canvas.width - 30, this.x));
    this.y = Math.max(30, Math.min(canvas.height - 30, this.y));

    // tire marks
    if (this.handbrake && Math.abs(this.speed) > 2.5 && Math.random() < 0.6) {
      tireMarks.push({
        x: this.x - fx * 12,
        y: this.y - fy * 12,
        life: 1
      });
      if (tireMarks.length > MAX_MARKS) tireMarks.shift();
      if (this.isPlayer && Math.random() < 0.3) playDriftScreech();
    }
  }

  playerControl() {
    this.handbrake = !!keys['Space'];
    this.nitroActive = (keys['ShiftLeft'] || keys['ShiftRight']) && this.nitro > 0;

    if (keys['KeyW'] || keys['ArrowUp']) {
      this.speed += this.data.accel * (this.handbrake ? 0.65 : 1);
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
      this.speed -= this.data.accel * 1.3;
    }

    const turnMul = this.handbrake ? 1.7 : 1.0;
    if (keys['KeyA'] || keys['ArrowLeft']) {
      this.angularVel -= this.data.turn * turnMul * Math.min(1.2, Math.abs(this.speed) / 2.5);
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      this.angularVel += this.data.turn * turnMul * Math.min(1.2, Math.abs(this.speed) / 2.5);
    }

    const max = this.data.maxSpeed;
    if (this.speed > max) this.speed = max;
    if (this.speed < -max * 0.35) this.speed = -max * 0.35;

    if (this.nitroActive && Math.random() < 0.1) playNitro();
  }

  aiControl() {
    const pts = currentTrack.points;
    // find closest + look ahead
    let nearest = 0;
    let minD = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const d = Math.hypot(this.x - pts[i].x, this.y - pts[i].y);
      if (d < minD) { minD = d; nearest = i; }
    }
    const look = 4 + Math.floor(this.aiSkill * 3);
    const targetIdx = (nearest + look) % (pts.length - 1);
    const target = pts[targetIdx];

    const desired = Math.atan2(target.y - this.y, target.x - this.x);
    let diff = desired - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    this.angularVel += Math.sign(diff) * this.data.turn * 0.95 * this.aiSkill;
    this.speed += this.data.accel * 0.9 * this.aiSkill;

    // drift when corner is sharp
    this.handbrake = Math.abs(diff) > 0.55 && this.speed > 3.5;

    // occasional nitro
    if (Math.abs(diff) < 0.3 && this.speed > 5 && this.nitro > 30 && Math.random() < 0.02) {
      this.nitroActive = true;
    }
    if (this.nitroActive) {
      this.nitro -= 0.4;
      if (this.nitro <= 0) this.nitroActive = false;
    } else if (this.nitro < 100) {
      this.nitro += 0.06;
    }

    if (this.speed > this.data.maxSpeed * this.aiSkill) {
      this.speed = this.data.maxSpeed * this.aiSkill;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // body
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // roof / cabin
    ctx.fillStyle = this.accent;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-this.width / 2 + 7, -this.height / 2 + 2, this.width - 16, this.height - 4);
    ctx.globalAlpha = 1;

    // headlights
    ctx.fillStyle = this.nitroActive ? '#aaf' : '#ffee88';
    ctx.fillRect(this.width / 2 - 5, -this.height / 2 + 1, 5, 4);
    ctx.fillRect(this.width / 2 - 5, this.height / 2 - 5, 5, 4);

    // nitro flame
    if (this.nitroActive) {
      ctx.fillStyle = 'rgba(0,180,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, -4);
      ctx.lineTo(-this.width / 2 - 14 - Math.random() * 8, 0);
      ctx.lineTo(-this.width / 2, 4);
      ctx.fill();
    }

    // drift smoke
    if (this.handbrake && Math.abs(this.speed) > 2) {
      ctx.fillStyle = 'rgba(180,180,180,0.3)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-this.width / 2 - 4 - i * 6, (Math.random() - 0.5) * 10, 3 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// -------------------- GAME OBJECTS --------------------
let player = null;
let opponents = [];

function createCars() {
  const track = currentTrack;
  const start = track.points[0];
  const next = track.points[1];
  const ang = Math.atan2(next.y - start.y, next.x - start.x);
  const carData = CARS[selectedCar];

  player = new Car(start.x - 25, start.y, ang, carData, true);

  const aiCars = CARS.filter((_, i) => i !== selectedCar);
  opponents = [
    new Car(start.x + 25, start.y - 28, ang, aiCars[0] || CARS[1], false, 0.82),
    new Car(start.x + 55, start.y + 18, ang, aiCars[1] || CARS[2], false, 0.90),
    new Car(start.x + 85, start.y - 8, ang, aiCars[2] || CARS[3], false, 0.78)
  ];
}

// -------------------- RACE LOGIC --------------------
function startRace() {
  initAudio();
  currentTrack = buildTrack(TRACKS[selectedTrack]);
  maxLaps = currentTrack.laps;
  lap = 1;
  raceTime = 0;
  lastCheckpoint = 0;
  tireMarks = [];
  currentTrack.checkpoints.forEach(c => c.passed = false);

  createCars();

  state = 'racing';
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('controls').classList.remove('hidden');
  document.getElementById('message').classList.add('hidden');
  document.getElementById('maxLaps').textContent = maxLaps;
}

function restartToMenu() {
  state = 'menu';
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('controls').classList.add('hidden');
  document.getElementById('message').classList.add('hidden');
}

function checkCheckpoints(car) {
  if (!car.isPlayer || car.finished) return;

  for (const cp of currentTrack.checkpoints) {
    if (cp.passed) continue;
    const d = Math.hypot(car.x - cp.x, car.y - cp.y);
    if (d < 60) {
      if (cp.id === lastCheckpoint + 1 || (lastCheckpoint === CHECKPOINT_COUNT && cp.id === 1)) {
        cp.passed = true;
        lastCheckpoint = cp.id;
        playCheckpoint();

        if (cp.id === CHECKPOINT_COUNT) {
          lap++;
          currentTrack.checkpoints.forEach(c => c.passed = false);
          lastCheckpoint = 0;

          if (lap > maxLaps) {
            finishRace();
          }
        }
      }
    }
  }
}

function finishRace() {
  state = 'finished';
  player.finished = true;
  player.finishTime = raceTime;
  playFinish();

  const trackId = TRACKS[selectedTrack].id;
  const key = trackId + '_' + CARS[selectedCar].id;
  const final = raceTime.toFixed(2);
  if (!bestTimes[key] || raceTime < parseFloat(bestTimes[key])) {
    bestTimes[key] = final;
    localStorage.setItem('midnightDriftBests', JSON.stringify(bestTimes));
  }

  const msg = document.getElementById('message');
  msg.classList.remove('hidden');
  msg.innerHTML = `
    FINISHED!<br>
    Time: <span style="color:#0ff">${final}s</span><br>
    Best: <span style="color:#ff0">${bestTimes[key]}s</span><br><br>
    <button onclick="restartToMenu()" style="
      margin-top:10px;padding:10px 24px;font-size:16px;
      background:#f0f;border:none;border-radius:6px;color:#fff;
      cursor:pointer;font-weight:bold;">BACK TO MENU</button>
  `;
}

// make restartToMenu global for the button
window.restartToMenu = restartToMenu;

// -------------------- DRAWING --------------------
function drawTrack() {
  const bg = currentTrack ? currentTrack.bg : ['#1a1a2e', '#0a0a12'];
  const grd = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 40,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
  );
  grd.addColorStop(0, bg[0]);
  grd.addColorStop(1, bg[1]);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!currentTrack) return;

  // tire marks
  ctx.fillStyle = 'rgba(30,30,30,0.55)';
  for (const m of tireMarks) {
    ctx.globalAlpha = m.life * 0.6;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
    ctx.fill();
    m.life -= 0.004;
  }
  ctx.globalAlpha = 1;
  tireMarks = tireMarks.filter(m => m.life > 0);

  // road
  const left = currentTrack.left;
  const right = currentTrack.right;
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fillStyle = '#1c1c1c';
  ctx.fill();
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // center line
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  const pts = currentTrack.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.setLineDash([]);

  // start/finish
  const s = pts[0];
  const n = pts[1];
  const dx = n.x - s.x, dy = n.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const hw = currentTrack.roadWidth / 2;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(s.x + nx * hw, s.y + ny * hw);
  ctx.lineTo(s.x - nx * hw, s.y - ny * hw);
  ctx.stroke();

  // neon edges
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.22)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(right[0].x, right[0].y);
  for (let i = 1; i < right.length; i++) ctx.lineTo(right[i].x, right[i].y);
  ctx.stroke();
}

function drawMiniMap() {
  if (!currentTrack || state !== 'racing') return;
  const size = 130;
  const pad = 12;
  const mx = canvas.width - size - pad;
  const my = pad;

  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.strokeStyle = '#0af';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(mx - 6, my - 6, size + 12, size + 12, 8);
  ctx.fill();
  ctx.stroke();

  // scale track to minimap
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of currentTrack.points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const scale = (size - 20) / Math.max(maxX - minX, maxY - minY);

  const tx = (x) => mx + 10 + (x - minX) * scale;
  const ty = (y) => my + 10 + (y - minY) * scale;

  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tx(currentTrack.points[0].x), ty(currentTrack.points[0].y));
  for (const p of currentTrack.points) ctx.lineTo(tx(p.x), ty(p.y));
  ctx.stroke();

  // cars
  const drawDot = (car, r) => {
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.arc(tx(car.x), ty(car.y), r, 0, Math.PI * 2);
    ctx.fill();
  };
  opponents.forEach(o => drawDot(o, 3));
  drawDot(player, 4.5);
}

function updateHUD() {
  document.getElementById('lap').textContent = Math.min(lap, maxLaps);
  document.getElementById('time').textContent = raceTime.toFixed(2);
  const key = TRACKS[selectedTrack].id + '_' + CARS[selectedCar].id;
  document.getElementById('best').textContent = bestTimes[key] || '--';
  document.getElementById('speed').textContent = Math.abs(Math.round(player.speed * 19));
  document.getElementById('nitro').textContent = Math.round(player.nitro);

  // rough position
  let pos = 1;
  const all = [player, ...opponents];
  // simple: who has higher lap + closer to next checkpoint
  // for simplicity just count how many are "ahead" by distance along track
  const progress = (car) => {
    let nearest = 
