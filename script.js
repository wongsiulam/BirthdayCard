const OWNER_EMAIL = "wongsiulam@foxmail.com";

const canvas = document.querySelector("#sky");
const ctx = canvas.getContext("2d");
const wishButton = document.querySelector("#wishButton");
const hintText = document.querySelector("#hintText");
const toast = document.querySelector("#toast");
const form = document.querySelector("#wishForm");
const wishText = document.querySelector("#wishText");
const sendButton = document.querySelector("#sendButton");
const formNote = document.querySelector("#formNote");

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

  stars = Array.from({ length: Math.min(170, Math.floor(width / 7)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.8 + 0.45,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.018 + 0.006,
    hue: Math.random() > 0.5 ? "255, 255, 255" : "255, 210, 224"
  }));
}

function drawStar(x, y, radius, alpha, hue = "255, 255, 255") {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgb(${hue})`;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(${hue}, 0.42)`;
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
    const alpha = 0.24 + Math.sin(star.phase) * 0.24;
    drawStar(star.x, star.y, star.r, Math.max(0.1, alpha), star.hue);
  }

  sparkles = sparkles.filter((sparkle) => sparkle.life > 0);
  for (const sparkle of sparkles) {
    sparkle.life -= 0.017;
    sparkle.x += sparkle.vx;
    sparkle.y += sparkle.vy;
    sparkle.vy += 0.015;
    drawStar(sparkle.x, sparkle.y, sparkle.r, sparkle.life, sparkle.hue);
  }

  requestAnimationFrame(animate);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3300);
}

function burstSparkles(originX, originY, count = 84) {
  sparkles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5.2 + 1.1;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.4,
      r: Math.random() * 2.5 + 0.8,
      life: Math.random() * 0.52 + 0.58,
      hue: Math.random() > 0.45 ? "255, 255, 255" : "255, 181, 107"
    };
  });
}

function makeWish() {
  wishButton.classList.add("off");
  hintText.textContent = "星河已开启，今天的愿望会被认真收藏";
  showToast("今天的第一束光已经点亮。");

  const rect = wishButton.getBoundingClientRect();
  burstSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);

  for (let i = 0; i < 34; i += 1) {
    window.setTimeout(dropPetal, i * 52);
  }
}

function dropPetal() {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.setProperty("--drift", `${Math.random() * 240 - 120}px`);
  petal.style.animationDuration = `${Math.random() * 3.4 + 4.6}s`;
  petal.style.opacity = `${Math.random() * 0.38 + 0.48}`;
  document.body.appendChild(petal);
  petal.addEventListener("animationend", () => petal.remove());
}

function configureFormState() {
  if (OWNER_EMAIL) {
    formNote.textContent = "写好愿望后点击发送，我会收到一封邮件。";
    return;
  }

  formNote.textContent = "还差你的收件邮箱，配置后就能真正发送。";
}

async function sendWish(event) {
  event.preventDefault();

  if (!OWNER_EMAIL) {
    showToast("还没有配置收件邮箱，把你的邮箱发给我后我来接上。");
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "正在发送...";
  formNote.textContent = "愿望正在穿过星光。";

  const formData = new FormData(form);
  formData.append("page", window.location.href);
  formData.append("sent_at", new Date().toLocaleString());

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(OWNER_EMAIL)}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) {
      throw new Error("Send failed");
    }

    showToast("发送成功。这个愿望已经飞到邮箱里了。");
    formNote.textContent = "发送成功，愿望已收藏。";
    form.reset();
    burstSparkles(width * 0.5, height * 0.72, 64);
  } catch (error) {
    showToast("暂时没有发送成功，可以稍后再试。");
    formNote.textContent = "发送失败，可能是邮箱首次确认还没完成。";
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "发送愿望";
  }
}

document.querySelectorAll("[data-wish]").forEach((button) => {
  button.addEventListener("click", () => {
    wishText.value = button.dataset.wish;
    wishText.focus();
  });
});

window.addEventListener("resize", resize);
wishButton.addEventListener("click", makeWish, { once: true });
form.addEventListener("submit", sendWish);

configureFormState();
resize();
animate();

window.setInterval(() => {
  if (!document.hidden && Math.random() > 0.5) {
    dropPetal();
  }
}, 1300);
