/** Preserve the approved pixels; only a few sampled fragments leave the left edge. */
export function initLaptopParticles() {
  const host = document.querySelector<HTMLElement>(".about-laptop");
  const image = host?.querySelector("img");
  if (!host || !image) return;
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 365;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const base = document.createElement("canvas");
  base.width = 700; base.height = 365;
  const source = base.getContext("2d");
  if (!source) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let visible = false;
  let ready = false;
  let clock = 0;
  let previous = 0;
  let lastPaint = 0;
  // Original crop coordinates contain the laptop and its surrounding loose glyphs only.
  const fragments: { x: number; y: number; phase: number; speed: number; drift: number }[] = [];
  function draw(time: number) {
    ctx!.clearRect(0, 0, 700, 365);
    ctx!.drawImage(base, 0, 0);
    if (reduced.matches) return;
    for (const part of fragments) {
      const progress = ((time * part.speed + part.phase) % 8) / 8;
      // Fragments return invisibly before appearing at their original position again.
      const fade = progress < .15 ? progress / .15 : Math.max(0, (1 - progress) / .85);
      ctx!.clearRect(part.x, part.y, 7, 7);
      ctx!.globalAlpha = 1 - Math.min(progress * 5, 1);
      ctx!.drawImage(base, part.x, part.y, 7, 7, part.x, part.y, 7, 7);
      ctx!.globalAlpha = fade;
      ctx!.drawImage(base, part.x, part.y, 7, 7,
        part.x - progress * part.drift,
        part.y - progress * 22 + Math.sin(progress * 5 + part.phase) * progress * 5, 7, 7);
    }
    ctx!.globalAlpha = 1;
  }
  function render(now: number) {
    frame = 0;
    clock += previous ? Math.min(now - previous, 60) / 1000 : 0;
    previous = now;
    if (now - lastPaint > 32) { draw(clock); lastPaint = now; }
    frame = requestAnimationFrame(render);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    if (!ready) return;
    if (reduced.matches) draw(0);
    else if (visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function prepare() {
    if (!image!.naturalWidth || ready) return;
    source!.drawImage(image!, 100, 610, 700, 365, 0, 0, 700, 365);
    const pixels = source!.getImageData(0, 0, 700, 365);
    // Background becomes transparent; the original ivory/red glyph colors are untouched.
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (Math.max(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]) < 42) pixels.data[i + 3] = 0;
    }
    source!.putImageData(pixels, 0, 0);
    for (let y = 14; y < 235; y += 14) {
      for (let x = 20; x < 240; x += 17) {
        const at = ((y + 3) * 700 + x + 3) * 4;
        if (pixels.data[at + 3] && fragments.length < 40) {
          fragments.push({ x, y, phase: (x * .13 + y * .07) % 8, speed: .35 + (x % 5) * .08, drift: 20 + (y % 31) });
        }
      }
    }
    ready = true;
    host!.append(canvas);
    host!.classList.add("is-ready");
    draw(0); sync();
  }
  image.addEventListener("load", prepare, { once: true });
  if (image.complete) prepare();
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(host);
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    cancelAnimationFrame(frame); observer.disconnect();
    reduced.removeEventListener("change", sync);
    document.removeEventListener("visibilitychange", sync);
  });
}
