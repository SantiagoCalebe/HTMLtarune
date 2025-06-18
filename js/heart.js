export const heart = {
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
  image: null,
  loaded: false,
};

export function loadHeartImage(src, callback) {
  heart.image = new Image();
  heart.image.src = src;
  heart.image.onload = () => {
    heart.loaded = true;
    if (callback) callback();
  };
}

export function updateHeartPosition(keys, canvas) {
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

export function drawHeart(ctx) {
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

export function updateHeartTimers() {
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

export function isHeartNearBullet(heart, bullets, threshold = 10) {
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

export function drawHeartOutline(ctx, heart) {
  if (!heart.loaded || !heart.image) {
    ctx.beginPath();
    ctx.arc(heart.x, heart.y, heart.size + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
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
}
