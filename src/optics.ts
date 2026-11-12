import * as THREE from "three";

export function initOptics(hero: HTMLElement) {
  const canvas = hero.querySelector<HTMLCanvasElement>(".optical-canvas")!;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 2000);
  camera.position.z = 1000;
  const backing = document.createElement("canvas");
  const ctx = backing.getContext("2d");
  if (!ctx) {
    renderer.dispose();
    return;
  }
  const texture = new THREE.CanvasTexture(backing);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const uniforms = {
    uBackdrop: { value: texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;vec3 p=position; p.z+=sin(uv.x*3.1415926)*8.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `precision highp float;
      uniform sampler2D uBackdrop; uniform vec2 uResolution; uniform vec2 uPointer; uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 screen=gl_FragCoord.xy/uResolution;
        float edge=min(vUv.x,1.-vUv.x);
        float topEdge=min(vUv.y,1.-vUv.y);
        float fluting=sin(vUv.x*31.415926);
        float bend=sin(vUv.x*3.1415926)*.022+fluting*.0035;
        vec2 shift=vec2(bend+uPointer.x*.003,cos(vUv.x*12.56)*.002+uPointer.y*.002);
        float r=texture2D(uBackdrop,screen+shift+vec2(.002,0.)).r;
        float g=texture2D(uBackdrop,screen+shift).g;
        float b=texture2D(uBackdrop,screen+shift-vec2(.002,0.)).b;
        vec3 color=vec3(r,g,b)*.88;
        float ridge=pow(max(0.,sin(vUv.x*31.415926+.2)),24.);
        color+=vec3(.56,.64,.48)*(.014+ridge*.045);
        float light=pow(max(0.,1.-abs(vUv.x-(.24+sin(uTime*.22)*.12))*3.),12.);
        color+=vec3(.65,.69,.57)*light*.12;
        float bevel=1.-smoothstep(.0,.013,edge);
        float bevelTop=1.-smoothstep(.0,.006,topEdge);
        color+=vec3(.74,.79,.63)*bevel*.46;
        color+=vec3(.92,.2,.07)*pow(vUv.x,90.)*.72;
        color+=vec3(.7,.74,.65)*bevelTop*.45;
        float alpha=smoothstep(0.,.002,edge)*smoothstep(0.,.002,topEdge);
        gl_FragColor=vec4(color,alpha);
        #include <colorspace_fragment>
      }`,
  });
  const geometry = new THREE.PlaneGeometry(1, 1, 24, 1);
  const slab = new THREE.Mesh(geometry, material);
  scene.add(slab);
  const pointer = new THREE.Vector2();
  let width = 1;
  let height = 1;
  let visible = true;
  let frame = 0;
  let dirty = true;
  const started = performance.now();

  function drawBackdrop() {
    const box = hero.getBoundingClientRect();
    ctx!.clearRect(0, 0, width, height);
    ctx!.fillStyle = "#10110f";
    ctx!.fillRect(0, 0, width, height);
    hero
      .querySelectorAll<HTMLElement>("[data-optical-text]")
      .forEach((line) => {
        const rect = line.getBoundingClientRect();
        const style = getComputedStyle(line);
        const size = parseFloat(style.fontSize);
        ctx!.font = `${style.fontWeight} ${size}px 'DM Sans Variable'`;
        ctx!.letterSpacing = style.letterSpacing;
        ctx!.fillStyle = "#f1eee6";
        const metrics = ctx!.measureText("H");
        const ascent = metrics.fontBoundingBoxAscent || size * 0.9;
        const descent = metrics.fontBoundingBoxDescent || size * 0.2;
        const baseline =
          rect.top -
          box.top +
          (parseFloat(style.lineHeight) - ascent - descent) / 2 +
          ascent;
        ctx!.fillText(
          line.firstChild?.textContent || "",
          rect.left - box.left,
          baseline,
        );
        const stop = line.querySelector<HTMLElement>(".name-stop");
        if (stop) {
          ctx!.fillStyle = "#f24c2f";
          ctx!.fillText(
            ".",
            stop.getBoundingClientRect().left - box.left,
            baseline,
          );
        }
      });
    texture.needsUpdate = true;
    dirty = false;
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    backing.width = width;
    backing.height = height;
    uniforms.uResolution.value.set(width * ratio, height * ratio);
    camera.right = width;
    camera.top = height;
    camera.updateProjectionMatrix();
    const mobile = width < 600;
    slab.scale.set(
      width * (mobile ? 0.26 : 0.185),
      height * (mobile ? 0.44 : 0.72),
      1,
    );
    slab.position.set(
      width * (mobile ? 0.7 : 0.685),
      height * (mobile ? 0.58 : 0.53),
      0,
    );
    slab.rotation.z = -0.15;
    dirty = true;
  }

  function render() {
    frame = 0;
    if (!visible || document.hidden) return;
    if (dirty) drawBackdrop();
    uniforms.uPointer.value.lerp(pointer, 0.045);
    uniforms.uTime.value = (performance.now() - started) / 1000;
    slab.rotation.y = uniforms.uPointer.value.x * 0.13;
    slab.rotation.z = -0.15 + uniforms.uPointer.value.y * 0.025;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }
  function resume() {
    if (!frame && visible && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  hero.addEventListener("pointermove", (event) => {
    const box = hero.getBoundingClientRect();
    pointer.set(
      ((event.clientX - box.left) / width - 0.5) * 2,
      ((event.clientY - box.top) / height - 0.5) * 2,
    );
  });
  hero.addEventListener("pointerleave", () => pointer.set(0, 0));
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    resume();
  });
  observer.observe(hero);
  const resizeObserver = new ResizeObserver(() => {
    resize();
    resume();
  });
  resizeObserver.observe(hero);
  window.addEventListener(
    "scroll",
    () => {
      dirty = true;
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", resume);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    hero.classList.remove("has-optics");
    visible = false;
    if (frame) cancelAnimationFrame(frame);
  });
  window.addEventListener("pagehide", () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener("pageshow", resume);
  resize();
  drawBackdrop();
  renderer.render(scene, camera);
  hero.classList.add("has-optics");
  resume();
}
