export const bullets = [];

const minHorizontalSpacing = 30;

export function spawnBullet(canvas) {
  const maxAttempts = 10;
  let x;
  let attempts = 0;

  do {
    x = Math.random() * (canvas.width - 10) + 5;
    attempts++;

    const tooClose = bullets.some(
      (bullet) => Math.abs(bullet.x - x) < minHorizontalSpacing
    );

    if (!tooClose) break;
  } while (attempts < maxAttempts);

  const bullet = {
    x: x,
    y: canvas.height + 10,
    size: 5,
    vx: 0,
    vy: -5,
  };

  bullets.push(bullet);
}

export function updateBullets(canvas) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;

    if (b.y + b.size < 0) {
      bullets.splice(i, 1);
    }
  }
}

export function drawBullets(ctx) {
  ctx.fillStyle = "white";
  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function checkBulletCollisions(heart) {
  if (heart.invincible || heart.dodging) return false;

  for (const b of bullets) {
    const dx = heart.x - b.x;
    const dy = heart.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < heart.size + b.size) {
      return true;
    }
  }
  return false;
}
