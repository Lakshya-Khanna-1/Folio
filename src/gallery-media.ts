import * as THREE from "three";

export function initGalleryMedia(stage: HTMLElement, panels: HTMLElement[]) {
  let visible = false;
  let velocity = 0;
  let previousX: number | null = null;
  const views: {
    panel: HTMLElement;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    material: THREE.ShaderMaterial;
    video?: HTMLVideoElement;
  }[] = [];
  panels.forEach((panel) => {
    const link = panel.querySelector<HTMLAnchorElement>(".project-art")!;
    const img = link.querySelector<HTMLImageElement>("img")!;
    const canvas = document.createElement("canvas");
    canvas.className = "curved-media";
    canvas.setAttribute("aria-hidden", "true");
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
    const camera = new THREE.PerspectiveCamera(35, 1.5, 0.1, 20);
    camera.position.z = 3.35;
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uMap: { value: null },
        uBend: { value: 0.1 },
        uVideo: { value: false },
        uScale: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `varying vec2 vUv; uniform float uBend;
        void main(){vUv=uv; vec3 p=position; p.z-=uBend*p.x*p.x;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform sampler2D uMap; uniform vec2 uScale; uniform bool uVideo;
        void main(){vec2 uv=(vUv-.5)*uScale+.5;
          if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.) gl_FragColor=vec4(.006,.0065,.0055,1.);
          else {gl_FragColor=texture2D(uMap,uv); if(uVideo) gl_FragColor.rgb=mix(gl_FragColor.rgb/12.92,pow((gl_FragColor.rgb+.055)/1.055,vec3(2.4)),step(vec3(.04045),gl_FragColor.rgb));}
          #include <colorspace_fragment>
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(3, 2, 64, 16), material));
    const texture = new THREE.TextureLoader().load(img.src, () => {
      panel.classList.add("has-curved-media");
      const videoUrl = link.dataset.video;
      if (!videoUrl) return;
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = videoUrl;
      view.video = video;
      video.className = "gallery-video-source";
      video.setAttribute("aria-hidden", "true");
      video.tabIndex = -1;
      link.append(video);
      video.addEventListener("loadeddata", () => {
        const movie = new THREE.VideoTexture(video);
        movie.colorSpace = THREE.SRGBColorSpace;
        material.uniforms.uMap.value = movie;
        material.uniforms.uVideo.value = true;
        material.uniforms.uScale.value.set(
          1,
          video.videoWidth / video.videoHeight / 1.5,
        );
      });
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    material.uniforms.uMap.value = texture;
    const view = {
      panel,
      renderer,
      scene,
      camera,
      material,
      video: undefined as HTMLVideoElement | undefined,
    };
    views.push(view);
    link.append(canvas);
    const resize = () => {
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(link.clientWidth, link.clientHeight, false);
      camera.aspect = link.clientWidth / link.clientHeight;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(link);
    resize();
    canvas.addEventListener("webglcontextlost", () => {
      panel.classList.remove("has-curved-media");
      view.video?.pause();
    });
  });
  stage.addEventListener("pointerdown", (event) => {
    previousX = event.clientX;
  });
  stage.addEventListener("pointermove", (event) => {
    if (previousX === null) return;
    velocity = Math.min(Math.abs(event.clientX - previousX) * 0.006, 0.18);
    previousX = event.clientX;
  });
  const release = () => {
    previousX = null;
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  let frame = 0;
  let lastTime = 0;
  function render(time: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (time - lastTime > 30) {
      lastTime = time;
      velocity *= 0.9;
      views.forEach((view) => {
        const active = view.panel.classList.contains("is-active");
        const target = (active ? 0.09 : 0.19) + velocity;
        view.material.uniforms.uBend.value +=
          (target - view.material.uniforms.uBend.value) * 0.09;
        if (view.video) {
          if (active && view.video.paused)
            void view.video.play().catch(() => {});
          if (!active) view.video.pause();
        }
        view.renderer.render(view.scene, view.camera);
      });
    }
    frame = requestAnimationFrame(render);
  }
  const resume = () => {
    if (!frame && visible && !document.hidden)
      frame = requestAnimationFrame(render);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) views.forEach((view) => view.video?.pause());
    resume();
  }).observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) views.forEach((view) => view.video?.pause());
    resume();
  });
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    frame = 0;
    views.forEach((view) => view.video?.pause());
  });
  window.addEventListener("pageshow", resume);
}
