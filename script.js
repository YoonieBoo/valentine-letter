// ===== Elements (Envelope Flow) =====
const envelopeStage = document.getElementById("envelopeStage");
const envelope = document.getElementById("envelope");
const letterStage = document.getElementById("letterStage");

// ===== Elements (Question + Buttons) =====
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const noZone = document.querySelector(".no-zone");
const questionBlock = document.getElementById("questionBlock");
const celebrate = document.getElementById("celebrate");
const paper = document.querySelector(".paper");

// ===== Confetti Canvas =====
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

let confettiPieces = [];
let confettiRunning = false;
let confettiStopAt = 0;

// ---------- Safety checks (prevents freezing) ----------
if (!envelope || !envelopeStage || !letterStage) {
  console.error("Envelope elements missing. Check IDs: envelopeStage, envelope, letterStage");
}
if (!yesBtn || !noBtn || !noZone || !questionBlock || !celebrate || !paper) {
  console.error("Letter/question elements missing. Check IDs: yesBtn, noBtn, questionBlock, celebrate and class .paper");
}

// ===== Confetti helpers =====
function resizeCanvas() {
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function makeConfetti(count = 160) {
  const colors = ["#ff4d7d", "#ff99cc", "#ff66b2", "#ffb3d9", "#ffd1e8"];
  confettiPieces = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 10,
    vx: -2 + Math.random() * 4,
    vy: 2 + Math.random() * 5,
    rot: Math.random() * Math.PI,
    vr: -0.2 + Math.random() * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 0.9
  }));
}

function drawConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    if (p.y > window.innerHeight + 30) {
      p.y = -20;
      p.x = Math.random() * window.innerWidth;
    }
    if (p.x < -30) p.x = window.innerWidth + 30;
    if (p.x > window.innerWidth + 30) p.x = -30;

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  if (confettiRunning) {
    if (Date.now() > confettiStopAt) {
      confettiRunning = false;
      canvas.style.opacity = "0";
      return;
    }
    requestAnimationFrame(drawConfetti);
  }
}

function startConfetti(ms = 2800) {
  makeConfetti(180);
  confettiRunning = true;
  confettiStopAt = Date.now() + ms;
  canvas.style.opacity = "1";
  drawConfetti();
}

// ===== Floating heart emojis =====
function createFloatingHearts() {
  for (let i = 0; i < 18; i++) {
    const heart = document.createElement("div");
    heart.textContent = "💖";
    heart.className = "float-heart";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDelay = (Math.random() * 0.6) + "s";
    heart.style.fontSize = (18 + Math.random() * 26) + "px";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 4500);
  }
}

// ===== Envelope -> Letter transition (IMPORTANT) =====
let openedOnce = false;

function revealLetterFlow() {
  if (openedOnce) return;
  openedOnce = true;

  // open flap
  envelope.classList.add("open");

  // fade out envelope stage
  setTimeout(() => {
    envelopeStage.classList.add("fade-out");
  }, 520);

  // remove envelope + show letter
  setTimeout(() => {
    envelopeStage.classList.add("hidden");
    letterStage.classList.remove("hidden");
    letterStage.classList.add("show");
  }, 980);
}

envelope.addEventListener("click", revealLetterFlow);
envelope.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    revealLetterFlow();
  }
});

// ===== NO button movement =====
// Goal: "cute smooth dodge" like your video:
// - Jump ONLY when cursor is near (not rapid spam)
// - INSTANT jump when cursor touches the NO button
// - When chased, it keeps jumping to farthest spot inside no-zone

let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;

document.addEventListener("mousemove", (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

document.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  lastMouseX = t.clientX;
  lastMouseY = t.clientY;
}, { passive: true });

function moveNoButtonAwayFrom(mx, my) {
  const zoneRect = noZone.getBoundingClientRect();
  const zoneW = noZone.clientWidth;
  const zoneH = noZone.clientHeight;

  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;

  const padding = 10;

  const maxX = Math.max(0, zoneW - btnW - padding);
  const maxY = Math.max(0, zoneH - btnH - padding);

  // pick the farthest candidate from cursor (best of N tries)
  let best = { x: padding, y: padding, score: -1 };

  // MORE tries = stronger "teleport far away"
  const TRIES = 40;

  for (let i = 0; i < TRIES; i++) {
    const x = padding + Math.random() * maxX;
    const y = padding + Math.random() * maxY;

    const cx = zoneRect.left + x + btnW / 2;
    const cy = zoneRect.top + y + btnH / 2;

    const dist = Math.hypot(mx - cx, my - cy);

    if (dist > best.score) best = { x, y, score: dist };
  }

  noBtn.style.left = best.x + "px";
  noBtn.style.top = best.y + "px";
  noBtn.style.transform = "none";
}

// Distance from cursor point to NO button rectangle (0 if inside)
function distancePointToRect(mx, my, rect) {
  const dx = Math.max(rect.left - mx, 0, mx - rect.right);
  const dy = Math.max(rect.top - my, 0, my - rect.bottom);
  return Math.hypot(dx, dy);
}

// Throttle (prevents rapid continuous movement)
let lastMoveTime = 0;

// When cursor is CLOSE: move once, then wait a bit.
// Make it harder by increasing trigger distance and making cooldown not too tiny.
const TRIGGER_DISTANCE = 150;  // bigger = harder to catch
const COOLDOWN_MS = 260;       // smaller than your old 420 -> feels more responsive but not spam

function maybeEscape(mx, my) {
  const now = Date.now();

  const rect = noBtn.getBoundingClientRect();
  const d = distancePointToRect(mx, my, rect);

  // If cursor is near and cooldown passed -> jump once
  if (d <= TRIGGER_DISTANCE && now - lastMoveTime >= COOLDOWN_MS) {
    moveNoButtonAwayFrom(mx, my);
    lastMoveTime = now;
  }
}

// Track chase
document.addEventListener("mousemove", (e) => {
  maybeEscape(e.clientX, e.clientY);
});

// INSTANT escape if cursor actually touches the button.
// IMPORTANT: do NOT block with cooldown here (or user can land on it).
noBtn.addEventListener("mouseenter", (e) => {
  moveNoButtonAwayFrom(e.clientX, e.clientY);
  lastMoveTime = Date.now(); // update so it doesn't spam immediately after
});

// If somehow clicked (rare), still escape immediately (and your YES-grow logic still works)
noBtn.addEventListener("mousedown", (e) => {
  moveNoButtonAwayFrom(lastMouseX, lastMouseY);
  lastMoveTime = Date.now();
});



// ===== YES click: remove question + remove letter box + confetti + hearts =====
yesBtn.addEventListener("click", () => {
  // fade out question first
  questionBlock.style.transition = "all 0.35s ease";
  questionBlock.style.opacity = "0";
  questionBlock.style.transform = "translateY(8px)";

  setTimeout(() => {
    questionBlock.remove();

    // fade out paper/letter box after accepted
    paper.style.transition = "all 0.55s ease";
    paper.style.opacity = "0";
    paper.style.transform = "scale(0.96) translateY(-10px)";

    setTimeout(() => {
      paper.remove();

      // show celebration
      celebrate.classList.remove("hidden");

      // effects
      startConfetti(3000);
      createFloatingHearts();
    }, 550);

  }, 350);
});

// ===== If user clicks NO: make YES bigger each time =====
let noClicks = 0;

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  noClicks++;

  // Increase scale gradually (cap it so it doesn't break UI)
  const scale = Math.min(1 + noClicks * 0.15, 2.2);

  yesBtn.style.transition = "transform 0.18s ease-out";
  yesBtn.style.transform = `scale(${scale})`;

  // Optional: little bounce feel
  yesBtn.animate(
    [{ transform: `scale(${scale})` }, { transform: `scale(${scale + 0.08})` }, { transform: `scale(${scale})` }],
    { duration: 220, easing: "ease-out" }
  );
});

