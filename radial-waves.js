(() => {
  const layer = document.querySelector(".radial-waves");
  const origin = document.querySelector(".game-icon");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!layer || !origin || reducedMotion.matches) return;

  const ringGapMs = 1000;
  const ringLifeMs = 3000;
  let ringTimer;

  function addSquirclePath(context, center, radius) {
    const power = 4.5;
    const segments = 64;

    for (let index = 0; index <= segments; index += 1) {
      const angle = (Math.PI * 2 * index) / segments;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const x = center + radius * Math.sign(cosine) * Math.abs(cosine) ** (2 / power);
      const y = center + radius * Math.sign(sine) * Math.abs(sine) ** (2 / power);

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.closePath();
  }

  function drawPixelSquircle(canvas) {
    const context = canvas.getContext("2d");
    const center = canvas.width / 2;

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
      addSquirclePath(context, center, outerRadius);
      addSquirclePath(context, center, innerRadius);
      context.fillStyle = `rgba(245, 243, 232, ${alpha})`;
      context.fill("evenodd");
    }
  }

  function positionWave(wave) {
    const bounds = origin.getBoundingClientRect();
    wave.style.setProperty("--wave-x", `${Math.round(bounds.left + bounds.width / 2)}px`);
    wave.style.setProperty("--wave-y", `${Math.round(bounds.top + bounds.height / 2)}px`);
  }

  function createWave() {
    const wave = document.createElement("canvas");
    const brightness = 0.3 + Math.random() * 0.5;
    wave.className = "radial-wave";
    wave.width = 96;
    wave.height = 96;
    wave.style.setProperty("--wave-life", `${ringLifeMs}ms`);
    wave.style.setProperty("--wave-brightness", brightness.toFixed(3));
    wave.style.setProperty("--wave-opacity-start", (0.075 * brightness).toFixed(4));
    wave.style.setProperty("--wave-opacity-mid", (0.0675 * brightness).toFixed(4));
    wave.style.setProperty("--wave-opacity-far", (0.05 * brightness).toFixed(4));
    wave.style.setProperty("--wave-opacity-end", (0.025 * brightness).toFixed(4));

    drawPixelSquircle(wave);
    positionWave(wave);
    layer.append(wave);
    wave.addEventListener("animationend", () => wave.remove(), { once: true });
  }

  function clearSequence() {
    window.clearTimeout(ringTimer);
    layer.querySelectorAll(".radial-wave").forEach((wave) => wave.remove());
  }

  function spawnRing() {
    if (document.hidden) return;

    createWave();
    ringTimer = window.setTimeout(spawnRing, ringGapMs);
  }

  function startSequence() {
    clearSequence();
    spawnRing();
  }

  startSequence();

  document.addEventListener("visibilitychange", startSequence);

  window.addEventListener("resize", () => {
    layer.querySelectorAll(".radial-wave").forEach(positionWave);
  }, { passive: true });
})();
