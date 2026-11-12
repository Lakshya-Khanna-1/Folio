import * as THREE from "three";

/** Localized refraction of the name; HTML supplies content and fallback. */
export function initAboutOptics(name: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "about-name-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return;
  }
  const backing = document.createElement("canvas");
  const ctx = backing.getContext("2d");
  if (!ctx) { renderer.dispose(); return; }
  const texture = new THREE.CanvasTexture(backing);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const uniforms = {
    uText: { value: texture },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uSize: { value: new THREE.Vector2(1, 1) },
    uStrength: { value: 0 },
    uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true,
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `precision highp float;
      varying vec2 vUv;
      uniform sampler2D uText;
      uniform vec2 uPointer; uniform vec2 uSize;
      uniform float uStrength; uniform float uTime;
      void main(){
        vec2 delta=(vUv-uPointer)*uSize;
        float envelope=exp(-dot(delta,delta)/11000.);
        float wave=sin(delta.y*.035+uTime*3.);
        vec2 shift=vec2(wave*10.,cos(delta.x*.025+uTime*2.)*5.)/uSize;
        gl_FragColor=texture2D(uText,vUv+shift*envelope*uStrength);
        #include <colorspace_fragment>
      }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  let frame = 0;
  let visible = false;
  let disposed = false;
  let lastMove = -Infinity;
  let lastFrame = 0;

  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    const target = now - lastMove < 100 ? 1 : 0;
    uniforms.uStrength.value = THREE.MathUtils.damp(uniforms.uStrength.value, target, 9, dt);
    if (!target && uniforms.uStrength.value < 0.002) uniforms.uStrength.value = 0;
    uniforms.uTime.value = now / 1000;
    renderer.render(scene, camera);
    if (target || uniforms.uStrength.value) frame = requestAnimationFrame(render);
  }
  function requestRender() {
    if (!frame && !disposed && visible && !document.hidden) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(render);
    }
  }
  function measure() {
    const box = name.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(box.width, box.height, false);
    backing.width = Math.ceil(box.width * dpr);
    backing.height = Math.ceil(box.height * dpr);
    ctx!.scale(dpr, dpr);
    name.querySelectorAll<HTMLElement>(".about-name-line").forEach((line) => {
      const rect = line.getBoundingClientRect();
      const style = getComputedStyle(line);
      const size = parseFloat(style.fontSize);
      ctx!.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      ctx!.letterSpacing = style.letterSpacing;
      ctx!.fillStyle = "#f24c2f";
      const metrics = ctx!.measureText("H");
      const ascent = metrics.fontBoundingBoxAscent || size * 0.9;
      const descent = metrics.fontBoundingBoxDescent || size * 0.2;
      const baseline = rect.top - box.top + (parseFloat(style.lineHeight) - ascent - descent) / 2 + ascent;
      ctx!.fillText(line.textContent!.trim(), rect.left - box.left, baseline);
    });
    uniforms.uSize.value.set(box.width, box.height);
    texture.needsUpdate = true;
    renderer.render(scene, camera);
    name.classList.add("is-optical");
  }
  function move(event: PointerEvent) {
    const box = name.getBoundingClientRect();
    uniforms.uPointer.value.set((event.clientX - box.left) / box.width, 1 - (event.clientY - box.top) / box.height);
    lastMove = performance.now();
    requestRender();
  }
  function leave() { lastMove = -Infinity; requestRender(); }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { uniforms.uStrength.value = 0; requestRender(); }
  }
  function restore() {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect(); resize.disconnect();
    name.classList.remove("is-optical"); canvas.remove();
    name.removeEventListener("pointermove", move);
    name.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    reduced.removeEventListener("change", onPreference);
    geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose();
  }
  function onPreference() { if (reduced.matches) restore(); }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { uniforms.uStrength.value = 0; requestRender(); }
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  const resize = new ResizeObserver(measure);
  canvas.addEventListener("webglcontextlost", restore, { once: true });
  name.append(canvas);
  measure();
  resize.observe(name); observer.observe(name);
  name.addEventListener("pointermove", move);
  name.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", onPreference);
}
