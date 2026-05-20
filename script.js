const canvas = document.querySelector("#sky");
const ctx = canvas.getContext("2d");
const wishButton = document.querySelector("#wishButton");
const hintText = document.querySelector("#hintText");
const toast = document.querySelector("#toast");

let width = 0;
let height = 0;
let stars = [];
let sparkles = [];

function resize() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({ length: Math.min(130, Math.floor(width / 9)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.7 + 0.4,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.014 + 0.006
  }));
}

function drawStar(x, y, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fffaf1";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 209, 102, 0.58)";
  ctx.beginPath();
  ctx.moveTo(x - radius * 4, y);
  ctx.lineTo(x + radius * 4, y);
  ctx.moveTo(x, y - radius * 4);
  ctx.lineTo(x, y + radius * 4);
  ctx.stroke();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.phase += star.speed;
    const alpha = 0.32 + Math.sin(star.phase) * 0.28;
    drawStar(star.x, star.y, star.r, Math.max(0.12, alpha));
  }

  sparkles = sparkles.filter((sparkle) => sparkle.life > 0);
  for (const sparkle of sparkles) {
    sparkle.life -= 0.018;
    sparkle.x += sparkle.vx;
    sparkle.y += sparkle.vy;
    sparkle.vy += 0.018;
    drawStar(sparkle.x, sparkle.y, sparkle.r, sparkle.life);
  }

  requestAnimationFrame(animate);
}

function showToast() {
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function makeWish() {
  wishButton.classList.add("off");
  hintText.textContent = "生日愿望已经悄悄开始生效";
  showToast();

  const originX = width * 0.72;
  const originY = Math.min(height * 0.48, 360);
  sparkles = Array.from({ length: 78 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5.4 + 1.2;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      r: Math.random() * 2.4 + 0.8,
      life: Math.random() * 0.5 + 0.55
    };
  });

  for (let i = 0; i < 28; i += 1) {
    window.setTimeout(dropPetal, i * 58);
  }
}

function dropPetal() {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.setProperty("--drift", `${Math.random() * 220 - 110}px`);
  petal.style.animationDuration = `${Math.random() * 3 + 4.4}s`;
  petal.style.opacity = `${Math.random() * 0.42 + 0.48}`;
  document.body.appendChild(petal);
  petal.addEventListener("animationend", () => petal.remove());
}

window.addEventListener("resize", resize);
wishButton.addEventListener("click", makeWish, { once: true });

resize();
animate();

window.setInterval(() => {
  if (!document.hidden && Math.random() > 0.42) {
    dropPetal();
  }
}, 1100);
