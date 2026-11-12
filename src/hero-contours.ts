import gsap from "gsap";

/** Approved vector outlines stay unchanged; only a bounded hover flex is added. */
export function initHeroContours() {
  const lockup = document.querySelector<HTMLElement>(".hero-lockup")!;
  const fan = lockup.querySelector<HTMLElement>(".hero-contours")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(pointer: fine)");
  function settle() {
    gsap.to(fan, { skewX: 0, scaleY: 1, duration: reduced.matches ? 0 : 0.8, overwrite: true });
  }
  lockup.addEventListener("pointermove", (event) => {
    if (reduced.matches || !fine.matches) return;
    const box = lockup.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    gsap.to(fan, { skewX: x * 0.6, scaleY: 1 + x * 0.008, duration: 0.8, ease: "power3.out", overwrite: true });
  });
  lockup.addEventListener("pointerleave", settle);
  reduced.addEventListener("change", settle);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      gsap.killTweensOf(fan);
      gsap.set(fan, { skewX: 0, scaleY: 1 });
    }
  });
}
