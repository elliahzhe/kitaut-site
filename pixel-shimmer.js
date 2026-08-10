(() => {
  const canvas = document.querySelector(".pixel-shimmer");
  const context = canvas?.getContext("2d", { alpha: true });

  if (!canvas || !context) return;

  const gridSize = 3;
  const colors = ["245, 243, 232", "0, 201, 213", "244, 211, 94"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let pixels = [];
  let animationFrame = 0;
  let resizeFrame = 0;
  let previousTime = 0;

  function createPixels() {
    const count = Math.max(72, Math.min(220, Math.round((width * height) / 5200)));

    pixels = Array.from({ length: count }, () => ({
      x: Math.floor((Math.random() * width) / gridSize) * gridSize,
      y: Math.floor((Math.random() * height) / gridSize) * gridSize,
      phase: Math.random() * Math.PI * 2,
      speed: 0.00035 + Math.random() * 0.00055,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createPixels();
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);

    for (const pixel of pixels) {
      const wave = (Math.sin(time * pixel.speed + pixel.phase) + 1) * 0.5;
      const step = Math.floor(wave * 4) / 3;

      if (step < 0.34) continue;

      const size = step > 0.9 ? 2 : 1;
      const offset = (gridSize - size) * 0.5;
      const alpha = 0.025 + step * 0.065;

      context.fillStyle = `rgba(${pixel.color}, ${alpha})`;
      context.fillRect(pixel.x + offset, pixel.y + offset, size, size);
    }
  }

  function animate(time) {
    animationFrame = window.requestAnimationFrame(animate);

    if (time - previousTime < 1000 / 24) return;

    previousTime = time;
    draw(time);
  }

  function handleResize() {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resize();
      if (reducedMotion.matches) draw(0);
    });
  }

  resize();

  if (reducedMotion.matches) {
    draw(0);
  } else {
    animationFrame = window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (reducedMotion.matches) return;

    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(animate);
    }
  });
})();
