import gsap from "gsap";
import { selectIndex, swipeDirection } from "./gallery-model";

const projects = [
  {
    category: "AI PRD & Spec Generator",
    description:
      "Turns a product idea into specifications, tasks and agent instructions.",
  },
  {
    category: "Virtual physics lab",
    description:
      "A virtual physics lab built by a four-person team, with five interactive experiments.",
  },
  {
    category: "AI activity classifier",
    description:
      "Classifies window titles with TF-IDF and LinearSVC to identify productive and distracting activity.",
  },
];

export function initGallery(reduced: boolean) {
  const gallery = document.querySelector<HTMLElement>(".gallery");
  if (!gallery) return;
  const stage = gallery.querySelector<HTMLElement>(".gallery-stage")!;
  const panels = [...gallery.querySelectorAll<HTMLElement>(".project-panel")];
  const previous = gallery.querySelector<HTMLButtonElement>(
    "[data-gallery-prev]",
  )!;
  const next = gallery.querySelector<HTMLButtonElement>("[data-gallery-next]")!;
  let active = 1;
  let restoredScroll: number | undefined;
  let transitioning = false;
  let ignoreClick = false;
  let start: { x: number; y: number } | null = null;

  function display(index: number, immediate = false) {
    active = selectIndex(index, panels.length);
    const step = Math.min(
      window.innerWidth * (window.innerWidth < 601 ? 0.79 : 0.47),
      720,
    );
    panels.forEach((panel, i) => {
      const distance = i - active;
      panel.classList.toggle("is-active", i === active);
      panel.style.zIndex = String(5 - Math.abs(distance));
      gsap.to(panel, {
        xPercent: -50,
        x: distance * step,
        z: -Math.abs(distance) * 190,
        rotationY: -distance * 24,
        rotationZ: distance * -1.2,
        scale: i === active ? 1 : 0.93,
        opacity: Math.abs(distance) > 1 ? 0.25 : 1,
        duration: reduced || immediate ? 0 : 0.8,
        ease: "power3.out",
        overwrite: true,
      });
    });
    const project = projects[active];
    document.querySelector("#project-category")!.textContent = project.category;
    document.querySelector("#project-description")!.textContent =
      project.description;
    document.querySelector("#gallery-current")!.textContent = String(
      active + 1,
    ).padStart(2, "0");
    previous.disabled = active === 0;
    next.disabled = active === panels.length - 1;
  }

  previous.addEventListener("click", () => display(active - 1));
  next.addEventListener("click", () => display(active + 1));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      display(active + (event.key === "ArrowRight" ? 1 : -1));
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      display(event.key === "Home" ? 0 : panels.length - 1);
    }
  });
  stage.addEventListener("pointerdown", (event) => {
    start = { x: event.clientX, y: event.clientY };
    ignoreClick = false;
  });
  stage.addEventListener("pointermove", (event) => {
    if (!start || reduced) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > Math.abs(event.clientY - start.y) * 1.25)
      gsap.set(stage, { x: Math.max(-70, Math.min(70, dx * 0.22)) });
  });
  stage.addEventListener("pointerup", (event) => {
    gsap.to(stage, { x: 0, duration: reduced ? 0 : 0.65, ease: "power3.out" });
    if (!start) return;
    const direction = swipeDirection(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    start = null;
    if (direction) {
      ignoreClick = true;
      display(active + direction);
      window.setTimeout(() => {
        ignoreClick = false;
      }, 100);
    }
  });
  stage.addEventListener("pointercancel", () => {
    gsap.to(stage, { x: 0, duration: reduced ? 0 : 0.65 });
    start = null;
  });
  window.addEventListener("resize", () => display(active, true));

  panels.forEach((panel, index) => {
    const link = panel.querySelector<HTMLAnchorElement>(".project-art")!;
    link.addEventListener("focus", () => display(index));
    link.addEventListener("click", (event) => {
      if (ignoreClick || transitioning) {
        event.preventDefault();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      try {
        sessionStorage.setItem(
          "portfolio-gallery",
          JSON.stringify({ index, scroll: window.scrollY }),
        );
        sessionStorage.setItem("portfolio-return", "1");
      } catch {
        /* Selection persistence is optional; the destination is still a real link. */
      }
      if (reduced || transitioning) return;
      event.preventDefault();
      transitioning = true;
      const art = link;
      const rect = art.getBoundingClientRect();
      const cover = document.createElement("div");
      cover.className = "route-cover";
      cover.append(art.querySelector("img")!.cloneNode());
      const backdrop = document.createElement("div");
      backdrop.className = "route-backdrop";
      document.body.append(backdrop, cover);
      gsap.set(cover, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
      document.body.style.overflow = "hidden";
      const href = link.href;
      gsap.to(backdrop, { opacity: 1, duration: 0.35 });
      gsap.to(cover, {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        duration: 0.72,
        ease: "power3.inOut",
        onComplete: () => {
          window.location.assign(href);
        },
      });
    });
  });

  try {
    if (sessionStorage.getItem("portfolio-return") === "1") {
      const saved = JSON.parse(
        sessionStorage.getItem("portfolio-gallery") || "null",
      );
      sessionStorage.removeItem("portfolio-return");
      if (
        saved &&
        Number.isInteger(saved.index) &&
        Number.isFinite(saved.scroll) &&
        window.location.hash === "#work"
      ) {
        active = selectIndex(saved.index, projects.length);
        restoredScroll = saved.scroll;
      }
    }
  } catch {
    /* Invalid or inaccessible session data must not prevent rendering. */
  }
  display(active, true);
  if (!reduced) {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const { initGalleryMedia } = await import("./gallery-media");
          initGalleryMedia(stage, panels);
        } catch {
          /* Native image links remain usable. */
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(stage);
  }
  return restoredScroll;
}
