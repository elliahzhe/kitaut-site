(() => {
  const layer = document.querySelector(".radial-waves");
  const origin = document.querySelector(".game-icon");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!layer || !origin || reducedMotion.matches) return;

  const cycleValue = getComputedStyle(document.documentElement)
    .getPropertyValue("--sync-cycle")
    .trim();
  const cycleMs = cycleValue.endsWith("ms")
    ? Number.parseFloat(cycleValue)
    : Number.parseFloat(cycleValue) * 1000;
  const stepCount = 9;
  const cadenceMs = cycleMs / stepCount;

  function drawPixelRing(canvas) {
    const context = canvas.getContext("2d");
    const center = canvas.width / 2;
    const fullCircle = Math.PI * 2;

    context.imageSmoothingEnabled = false;

    const bands = [
      [45, 39, 0.035],
      [39, 34, 0.055],
      [34, 30, 0.085],
      [30, 27, 0.14],
      [27, 25, 0.2],
      [25, 22, 0.1],
      [22, 19, 0.045],
    ];

    for (const [outerRadius, innerRadius, alpha] of bands) {
      context.beginPath();
      context.arc(center, center, outerRadius, 0, fullCircle);
      context.arc(center, center, innerRadius, 0, fullCircle, true);
      context.fillStyle = `rgba(245, 243, 232, ${alpha})`;
      context.fill("evenodd");
    }
  }

  function positionWave(wave) {
    const bounds = origin.getBoundingClientRect();
    wave.style.setProperty("--wave-x", `${Math.round(bounds.left + bounds.width / 2)}px`);
    wave.style.setProperty("--wave-y", `${Math.round(bounds.top + bounds.height / 2)}px`);
  }

  function createWave(delayMs = 0) {
    const wave = document.createElement("canvas");
    wave.className = "radial-wave";
    wave.width = 96;
    wave.height = 96;
    wave.style.animationDelay = `${delayMs}ms`;

    drawPixelRing(wave);
    positionWave(wave);
    layer.append(wave);
    wave.addEventListener("animationend", () => wave.remove(), { once: true });
  }

  const portraitAnimation = document.querySelector(".portrait-sprite")?.getAnimations()[0];
  const portraitPhase = Number(portraitAnimation?.currentTime || 0) % cycleMs;
  const elapsedSinceTick = portraitPhase % cadenceMs;

  for (let index = stepCount - 1; index >= 0; index -= 1) {
    createWave(-(elapsedSinceTick + index * cadenceMs));
  }

  window.setTimeout(() => {
    createWave();
    window.setInterval(() => {
      if (!document.hidden) createWave();
    }, cadenceMs);
  }, cadenceMs - elapsedSinceTick);

  window.addEventListener("resize", () => {
    layer.querySelectorAll(".radial-wave").forEach(positionWave);
  }, { passive: true });
})();
