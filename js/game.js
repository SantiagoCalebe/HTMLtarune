import {
  initCharacters,
  setCharacterHurt,
  setAllCharactersLose,
} from "./characters.js";

import { keys, setupInputListeners } from "./input.js";
import {
  bullets,
  spawnBullet,
  updateBullets,
  drawBullets,
  checkBulletCollisions,
} from "./bullets.js";
import { updateUI } from "./ui.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const heart = {
  x: 200,
  y: 150,
  size: 15,
  speed: 3,
  dx: 0,
  dy: 0,
  invincible: false,
  invincibleTimer: 0,
  invincibleDuration: 90,
  dodging: false,
  dodgeTimer: 0,
  dodgeDuration: 15,
  dodgeSpeedMultiplier: 3,
  loaded: false,
  image: null,
};

function loadHeartImage(src, callback) {
  heart.image = new Image();
  heart.image.onload = () => {
    heart.loaded = true;
    if (callback) callback();
  };
  heart.image.src = src;
}

function updateHeartPosition() {
  heart.dx = 0;
  heart.dy = 0;

  if (keys.up) heart.dy = -1;
  if (keys.down) heart.dy = 1;
  if (keys.left) heart.dx = -1;
  if (keys.right) heart.dx = 1;

  if (heart.dx !== 0 && heart.dy !== 0) {
    const mag = Math.sqrt(heart.dx * heart.dx + heart.dy * heart.dy);
    heart.dx /= mag;
    heart.dy /= mag;
  }

  const speed = heart.speed * (heart.dodging ? heart.dodgeSpeedMultiplier : 1);
  heart.x += heart.dx * speed;
  heart.y += heart.dy * speed;

  heart.x = Math.min(Math.max(heart.size, heart.x), canvas.width - heart.size);
  heart.y = Math.min(Math.max(heart.size, heart.y), canvas.height - heart.size);
}

function drawHeart() {
  if (heart.invincible && Math.floor(heart.invincibleTimer / 10) % 2 === 0) {
    return;
  }

  if (heart.loaded && heart.image) {
    ctx.drawImage(
      heart.image,
      heart.x - heart.size,
      heart.y - heart.size,
      heart.size * 2,
      heart.size * 2
    );
  } else {
    ctx.beginPath();
    ctx.arc(heart.x, heart.y, heart.size, 0, Math.PI * 2);
    ctx.fillStyle = heart.dodging ? "cyan" : "red";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function updateHeartTimers() {
  if (heart.invincible) {
    heart.invincibleTimer--;
    if (heart.invincibleTimer <= 0) {
      heart.invincible = false;
    }
  }
  if (heart.dodging) {
    heart.dodgeTimer--;
    if (heart.dodgeTimer <= 0) {
      heart.dodging = false;
    }
  }
}

let hp = 210;
const maxHp = 210;
const hpLossPerHit = Math.floor(Math.random() * 20) + 1;

let dodgesAvailable = 3;
const maxDodges = 3;
const dodgeCooldownFrames = 180;
let currentDodgeCooldown = 0;

let bulletSpawnInterval = 60;
let frameCount = 0;

let gameRunning = false;
let gameStarted = false;

const bgMusic = new Audio("sounds/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

const almostSound = new Audio("sounds/almost.mp3");
almostSound.volume = 0.5;

const gameOverSound = new Audio("sounds/gameOver.mp3");
gameOverSound.loop = true;
gameOverSound.volume = 0.7;

const hitSound = new Audio("sounds/hit.mp3");
hitSound.volume = 0.6;

let wasNearEnemy = false;

let phase = 1;
const phaseDurationFrames = 1200;
let phaseTimer = 0;

let ball = null;
let balls = null;
const ballRadius = 20;
const ballTimerMax = 180;
const spikes = [];
const spikeCount = 12;
const spikeSpeed = 3;
const spikeSize = 4;

let laserAngle = 0;
const laserSpeed = 0.03;
const laserLength = 500;
const laserWidth = 8;

let shakeDuration = 0;
const maxShakeDuration = 20;
const shakeMagnitude = 5;

let gameOver = false;
let paused = false;

window.addEventListener("blur", () => {
  paused = true;
});

window.addEventListener("focus", () => {
  paused = false;
});

function startShake() {
  shakeDuration = maxShakeDuration;
}

function applyCanvasShake() {
  if (shakeDuration > 0) {
    const dx = (Math.random() * 2 - 1) * shakeMagnitude;
    const dy = (Math.random() * 2 - 1) * shakeMagnitude;
    ctx.translate(dx, dy);
    shakeDuration--;
  }
}

function resetPhase() {
  bullets.length = 0;
  spikes.length = 0;
  ball = null;
  bulletSpawnInterval = 60;
  frameCount = 0;
  laserAngle = 0;
}

function handleHit() {
  console.log("handleHit called");
  if (heart.invincible || heart.dodging) return;

  console.log("HP before hit:", hp);
  hp -= hpLossPerHit;
  console.log("HP after hit:", hp);

  if (hp <= 0) {
    hp = 0;
    updateUI(hp, dodgesAvailable, currentDodgeCooldown);
    gameRunning = false;
    setAllCharactersLose();
    gameOver = true;
    gameOverSound.play();
    bgMusic.pause();
    alert("You feel your heart being cracked.");
  } else {
    updateUI(hp, dodgesAvailable, currentDodgeCooldown);
    setCharacterHurt("kris");
    setCharacterHurt("ralsei");
    setCharacterHurt("susie");
  }

  hitSound.currentTime = 0;
  hitSound.play().catch(() => {});

  startShake();

  heart.invincible = true;
  heart.invincibleTimer = heart.invincibleDuration;
}

function handleDodge() {
  if (dodgesAvailable > 0 && !heart.dodging) {
    dodgesAvailable--;
    heart.dodging = true;
    heart.dodgeTimer = heart.dodgeDuration;
    if (dodgesAvailable === 0) {
      currentDodgeCooldown = dodgeCooldownFrames;
    }
  }
}

function updateTimers() {
  if (currentDodgeCooldown > 0) {
    currentDodgeCooldown--;
    if (currentDodgeCooldown <= 0) {
      dodgesAvailable = maxDodges;
    }
  }
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function isHeartNearBullet(heart, bullets, threshold = 10) {
  for (let b of bullets) {
    const dx = heart.x - b.x;
    const dy = heart.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < heart.size + b.size + threshold) {
      return true;
    }
  }
  return false;
}

function drawHeartOutline() {
  ctx.beginPath();
  ctx.ellipse(
    heart.x,
    heart.y,
    heart.size + 3,
    heart.size + 3,
    0,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function gameLoop() {
  if (!gameRunning || !gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateHeartPosition();
  updateHeartTimers();
  updateTimers();

  ctx.save();
  applyCanvasShake();

  if (paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  phaseTimer++;
  if (phaseTimer > phaseDurationFrames) {
    phaseTimer = 0;
    phase = phase === 3 ? 1 : phase + 1;
    resetPhase();
  }

  if (phase === 1) {
    frameCount++;
    if (frameCount % bulletSpawnInterval === 0) {
      spawnBullet(canvas);
      if (bulletSpawnInterval > 15) bulletSpawnInterval--;
    }
    updateBullets(canvas);
    drawBullets(ctx);
  } else if (phase === 2) {
    if (!balls || balls.length === 0) {
      balls = [];
      const numberOfBalls = Math.floor(Math.random() * 7) + 1;
      for (let i = 0; i < numberOfBalls; i++) {
        balls.push({
          x: Math.random() * (canvas.width - 2 * ballRadius) + ballRadius,
          y: Math.random() * (canvas.height - 2 * ballRadius) + ballRadius,
          radius: ballRadius,
          timer: ballTimerMax,
          exploded: false,
          spikes: [],
        });
      }
    }

    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];

      if (!ball.exploded) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ball.timer--;
        if (ball.timer <= 0) {
          ball.exploded = true;
          ball.spikes = [];
          for (let j = 0; j < spikeCount; j++) {
            const angle = (j / spikeCount) * Math.PI * 2;
            ball.spikes.push({
              x: ball.x,
              y: ball.y,
              vx: Math.cos(angle) * spikeSpeed,
              vy: Math.sin(angle) * spikeSpeed,
              size: spikeSize,
            });
          }
        }
      } else {
        for (let j = ball.spikes.length - 1; j >= 0; j--) {
          const s = ball.spikes[j];
          s.x += s.vx;
          s.y += s.vy;

          if (
            s.x < -s.size ||
            s.x > canvas.width + s.size ||
            s.y < -s.size ||
            s.y > canvas.height + s.size
          ) {
            ball.spikes.splice(j, 1);
            continue;
          }

          ctx.beginPath();
          ctx.fillStyle = "white";
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (ball.spikes.length === 0) {
          balls.splice(i, 1);
        }
      }
    }
  } else if (phase === 3) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const endX = cx + Math.cos(laserAngle) * laserLength;
    const endY = cy + Math.sin(laserAngle) * laserLength;

    ctx.strokeStyle = "white";
    ctx.lineWidth = laserWidth;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    laserAngle += laserSpeed;
    if (laserAngle > Math.PI * 2) laserAngle -= Math.PI * 2;

    if (!heart.invincible && !heart.dodging) {
      const distToLaser = pointToLineDistance(
        heart.x,
        heart.y,
        cx,
        cy,
        endX,
        endY
      );
      if (distToLaser < heart.size + laserWidth / 2) {
        handleHit();
      }
    }
  }

  if (phase === 1) {
    if (checkBulletCollisions(heart)) {
      handleHit();
    }
  } else if (phase === 2) {
    if (!heart.invincible && !heart.dodging) {
      for (const ball of balls) {
        for (const s of ball.spikes) {
          const dist = Math.hypot(heart.x - s.x, heart.y - s.y);
          if (dist < heart.size + s.size) {
            handleHit();
            break;
          }
        }
      }
    }
  }

  drawHeart();

  let nearEnemy = false;
  if (phase === 1) {
    nearEnemy = isHeartNearBullet(heart, bullets, 10);
  } else if (phase === 2) {
    for (const s of spikes) {
      const dist = Math.hypot(heart.x - s.x, heart.y - s.y);
      if (dist < heart.size + s.size + 10) {
        nearEnemy = true;
        break;
      }
    }
  } else if (phase === 3) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const endX = cx + Math.cos(laserAngle) * laserLength;
    const endY = cy + Math.sin(laserAngle) * laserLength;
    const distToLaser = pointToLineDistance(
      heart.x,
      heart.y,
      cx,
      cy,
      endX,
      endY
    );
    nearEnemy = distToLaser < heart.size + laserWidth / 2 + 10;
  }

  if (nearEnemy) {
    drawHeartOutline();
    if (!wasNearEnemy) {
      almostSound.currentTime = 0;
      almostSound.play().catch(() => {});
    }
  }
  wasNearEnemy = nearEnemy;

  updateUI(hp, dodgesAvailable, currentDodgeCooldown);

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  gameRunning = true;

  bgMusic.play().catch(() => {});

  const infoDiv = document.getElementById("info");
  infoDiv.textContent = "";

  gameLoop();
}

function init() {
  hp = maxHp;
  dodgesAvailable = maxDodges;
  currentDodgeCooldown = 0;
  heart.invincible = false;
  heart.dodging = false;
  bullets.length = 0;
  spikes.length = 0;
  ball = null;
  bulletSpawnInterval = 60;
  frameCount = 0;
  gameRunning = false;
  gameStarted = false;
  phase = 1;
  phaseTimer = 0;

  updateUI(hp, dodgesAvailable, currentDodgeCooldown);

  loadHeartImage("img/heart.png", () => {
    initCharacters();
    setupInputListeners();

    const infoDiv = document.getElementById("info");
    infoDiv.textContent = "Click anywhere to start the game";

    function onFirstClick() {
      startGame();
      document.removeEventListener("click", onFirstClick);
      infoDiv.innerHTML = `HP: <span id="hpValue">${hp}</span>`;
      updateUI(hp, dodgesAvailable, currentDodgeCooldown);
    }
    document.addEventListener("click", onFirstClick);
  });
}

init();
