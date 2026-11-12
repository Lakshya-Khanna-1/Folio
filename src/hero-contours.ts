import gsap from "gsap";

export function initHeroContours() {
  const lockup = document.querySelector<HTMLElement>(".hero-lockup")!;
  const letter = lockup.querySelector<HTMLElement>(".hero-final")!;
  const svg = lockup.querySelector<SVGSVGElement>(".hero-contours")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(pointer: fine)");
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return;
  const ns = "http://www.w3.org/2000/svg";
  const paths = Array.from({ length: 18 }, () => {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.append(path);
    return path;
  });
  const edge = document.createElementNS(ns, "path");
  edge.setAttribute("fill", "currentColor");
  svg.append(edge);
  const state = { x: 0, y: 0 };
  let width = 1;
  let apex = 0;
  let top = 0;
  let bottom = 0;
  let size = 1;
  let visible = true;

  function curve(q: number) {
    const reach = width * (0.82 + q * 0.15) + state.x * q;
    const tailX = width * (0.39 + q * 0.08);
    const tailY = bottom + size * (0.26 + q * 0.32);
    return {
      start: `${apex},${top}`,
      c1: `${apex + size * 0.05},${top + size * 0.35}`,
      c2: `${reach + size * 0.14},${top + size * (0.25 + q * 0.22) + state.y}`,
      turn: `${reach},${bottom + size * 0.10}`,
      c3: `${reach - size * 0.38},${bottom + size * (0.55 + q * 0.5) + state.y}`,
      c4: `${tailX + size * 0.75},${tailY - size * 0.05}`,
      end: `${tailX},${tailY}`,
    };
  }
  function draw() {
    paths.forEach((path, i) => {
      const c = curve(i / (paths.length - 1));
      path.setAttribute("d", `M${c.start} C${c.c1} ${c.c2} ${c.turn} C${c.c3} ${c.c4} ${c.end}`);
    });
    const outer = curve(1);
    const inner = curve(0.94);
    edge.setAttribute("d", `M${outer.start} C${outer.c1} ${outer.c2} ${outer.turn} C${outer.c3} ${outer.c4} ${outer.end} L${inner.end} C${inner.c4} ${inner.c3} ${inner.turn} C${inner.c2} ${inner.c1} ${inner.start} Z`);
  }
  function measure() {
    const box = lockup.getBoundingClientRect();
    const rect = letter.getBoundingClientRect();
    const line = lockup.querySelector<HTMLElement>(".title-line")!.getBoundingClientRect();
    const style = getComputedStyle(letter);
    size = parseFloat(style.fontSize);
    ctx!.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
    const metrics = ctx!.measureText("A");
    const ascent = metrics.fontBoundingBoxAscent || size * 0.9;
    const descent = metrics.fontBoundingBoxDescent || size * 0.2;
    const baseline = line.top - box.top + (parseFloat(style.lineHeight) - ascent - descent) / 2 + ascent;
    width = box.width;
    // A's top-right shoulder is the fixed attachment; all motion is downstream.
    apex = rect.left - box.left + metrics.actualBoundingBoxRight * 0.56;
    top = baseline - metrics.actualBoundingBoxAscent;
    bottom = baseline;
    svg.setAttribute("viewBox", `0 0 ${width} ${bottom + size * 1.2}`);
    svg.style.height = `${bottom + size * 1.2}px`;
    draw();
  }
  function settle() {
    gsap.to(state, { x: 0, y: 0, duration: 1.1, ease: "power3.out", overwrite: true, onUpdate: draw });
  }
  function move(event: PointerEvent) {
    if (reduced.matches || !fine.matches || !visible) return;
    const box = lockup.getBoundingClientRect();
    gsap.to(state, {
      x: ((event.clientX - box.left) / box.width - 0.5) * 18,
      y: ((event.clientY - box.top) / box.height - 0.5) * 14,
      duration: 0.8, ease: "power3.out", overwrite: true, onUpdate: draw,
    });
  }
  const resize = new ResizeObserver(measure);
  resize.observe(lockup);
  lockup.addEventListener("pointermove", move);
  lockup.addEventListener("pointerleave", settle);
  reduced.addEventListener("change", settle);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { gsap.killTweensOf(state); state.x = state.y = 0; draw(); }
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { gsap.killTweensOf(state); state.x = state.y = 0; draw(); }
  }).observe(lockup);
  measure();
}
