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
const modal = document.querySelector("#wishModal");
const modalCloseBtn = document.querySelector("#modalCloseBtn");

// 礼物弹窗相关 DOM 元素
const giftModal = document.querySelector("#giftModal");
const giftCloseBtn = document.querySelector("#giftCloseBtn");
const claimGiftBtn = document.querySelector("#claimGiftBtn");
const copyCodeBtn = document.querySelector("#copyCodeBtn");
const giftCode = document.querySelector("#giftCode");

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
  const newSparkles = Array.from({ length: count }, () => {
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
  sparkles = sparkles.concat(newSparkles);
}

// 绚丽多彩纸屑与金星喷洒动效
function burstColorfulConfetti(originX, originY, count = 120) {
  const colors = [
    "255, 95, 143",  // 玫瑰粉
    "255, 181, 107", // 蜜桃橘
    "110, 231, 216", // 蒂芙尼绿
    "141, 125, 255", // 幻彩紫
    "255, 223, 120"  // 闪耀金
  ];
  const newSparkles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7.5 + 1.8;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.2,
      r: Math.random() * 3.2 + 1.2,
      life: Math.random() * 0.62 + 0.58,
      hue: colors[Math.floor(Math.random() * colors.length)]
    };
  });
  sparkles = sparkles.concat(newSparkles);
}

function makeWish() {
  wishButton.classList.add("off");
  hintText.textContent = "今天的愿望会被认真收藏哦";
  showToast("今天的第一束光已经点亮啦。");

  const rect = wishButton.getBoundingClientRect();
  burstSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);

  for (let i = 0; i < 34; i += 1) {
    window.setTimeout(dropPetal, i * 52);
  }

  // 1.2秒后显示生日寄语弹窗
  window.setTimeout(openModal, 1200);
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

async function sendWish(event) {
  event.preventDefault();

  sendButton.disabled = true;
  sendButton.textContent = "正在发送...";
  formNote.textContent = "愿望正在穿过星光。";

  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: json
    });

    const result = await response.json();

    if (response.status === 200) {
      showToast("发送成功。你的愿望已经飞到邮箱里了。");
      formNote.textContent = "发送成功。";
      form.reset();
      closeModal();

      // 延迟 600ms 在许愿弹窗淡出后打开礼物弹窗，并喷洒满屏彩屑
      window.setTimeout(() => {
        openGiftModal();
        burstColorfulConfetti(width * 0.5, height * 0.45, 140);
      }, 600);
    } else {
      throw new Error(result.message || "Send failed");
    }
  } catch (error) {
    showToast("自动发送失败，正在打开备用发送页面。");
    formNote.textContent = "请确认您已在网页中正确填写了 Web3Forms 的 Access Key。";
    form.submit();
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

function openModal() {
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // 阻止背景滚动
    // 弹窗展开动画完成后，自动聚焦输入框
    window.setTimeout(() => {
      if (wishText) {
        wishText.focus();
      }
    }, 450);
  }
}

function closeModal() {
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // 恢复背景滚动
  }
}

// 开启礼物惊喜弹窗
function openGiftModal() {
  if (giftModal) {
    giftModal.classList.add("active");
    giftModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // 阻止背景滚动
  }
}

// 关闭礼物惊喜弹窗
function closeGiftModal() {
  if (giftModal) {
    giftModal.classList.remove("active");
    giftModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // 恢复背景滚动
    // 关闭时来一次轻微星尘爆发
    burstSparkles(width * 0.5, height * 0.5, 36);
  }
}

// 复制兑换码功能
function copyGiftCode() {
  if (giftCode) {
    const textToCopy = giftCode.textContent;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("暗号已成功复制到剪贴板。");
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = "已复制！";
        copyCodeBtn.style.background = "rgba(110, 231, 216, 0.25)";

        window.setTimeout(() => {
          copyCodeBtn.textContent = originalText;
          copyCodeBtn.style.background = "";
        }, 2200);
      })
      .catch(() => {
        showToast("复制失败，请手动长按复制暗号。");
      });
  }
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (e) => {
    // 点击背景遮罩处关闭弹窗
    if (e.target === modal) {
      closeModal();
    }
  });
}

// 礼物弹窗相关事件绑定
if (giftCloseBtn) {
  giftCloseBtn.addEventListener("click", closeGiftModal);
}

if (claimGiftBtn) {
  claimGiftBtn.addEventListener("click", () => {
    showToast("收到啦，生日要一直开开心心哦！");
    closeGiftModal();
  });
}

if (giftModal) {
  giftModal.addEventListener("click", (e) => {
    if (e.target === giftModal) {
      closeGiftModal();
    }
  });
}

if (copyCodeBtn) {
  copyCodeBtn.addEventListener("click", copyGiftCode);
}

window.addEventListener("resize", resize);
wishButton.addEventListener("click", makeWish, { once: true });
form.addEventListener("submit", sendWish);

resize();
animate();

window.setInterval(() => {
  if (!document.hidden && Math.random() > 0.5) {
    dropPetal();
  }
}, 1300);

// ==========================================
// 背景音乐播放与控制逻辑
// ==========================================
const bgMusic = document.querySelector("#bgMusic");
const musicToggle = document.querySelector("#musicToggle");

if (bgMusic && musicToggle) {
  // 设置背景音乐音量为 40%，使其更加温和适中
  bgMusic.volume = 0.4;

  let isPlaying = false;
  let isFirstPlay = true;

  const playMusic = () => {
    if (isFirstPlay) {
      try {
        bgMusic.currentTime = 4;
      } catch (e) {
        console.error("Failed to set currentTime:", e);
      }
    }
    bgMusic.play()
      .then(() => {
        isPlaying = true;
        isFirstPlay = false;
        musicToggle.classList.add("playing");
        musicToggle.classList.remove("paused");
        // 成功播放后移除首屏交互监听
        removeInteractionListeners();
      })
      .catch((err) => {
        // 如果被浏览器策略拦截，则保持暂停图标
        isPlaying = false;
        musicToggle.classList.remove("playing");
        musicToggle.classList.add("paused");
      });
  };

  const pauseMusic = () => {
    bgMusic.pause();
    isPlaying = false;
    musicToggle.classList.remove("playing");
    musicToggle.classList.add("paused");
  };

  const toggleMusic = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  // 用户与页面首次产生任何交互时自动开始播放
  const handleFirstInteraction = () => {
    if (!isPlaying) {
      playMusic();
    }
  };

  const removeInteractionListeners = () => {
    document.removeEventListener("click", handleFirstInteraction);
    document.removeEventListener("touchstart", handleFirstInteraction);
    document.removeEventListener("keydown", handleFirstInteraction);
  };

  // 监听首屏的交互，克服浏览器的 autoplay 限制
  document.addEventListener("click", handleFirstInteraction);
  document.addEventListener("touchstart", handleFirstInteraction);
  document.addEventListener("keydown", handleFirstInteraction);

  // 控制按钮点击切换状态
  musicToggle.addEventListener("click", toggleMusic);

  // 页面加载或就绪后立即尝试自动播放
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(playMusic, 300);
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      setTimeout(playMusic, 300);
    });
  }
}

