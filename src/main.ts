import "./styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initGallery } from "./gallery";
import { initSkills } from "./skills";
import { initHeroContours } from "./hero-contours";
import { initDelhiScene } from "./delhi-scene";
import { initLaptopParticles } from "./laptop-particles";

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let galleryReturnScroll: number | undefined;

if (document.body.dataset.page === "home") {
  initDelhiScene();
  initLaptopParticles();
  galleryReturnScroll = initGallery(reduceMotion.matches);
  initSkills(reduceMotion.matches);
  document.fonts.ready.then(() => initHeroContours());
  if (!reduceMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    document.fonts.ready.then(async () => {
      try {
        const { initAboutOptics } = await import("./about-optics");
        initAboutOptics(document.querySelector<HTMLElement>(".about-name")!);
      } catch {
        /* Native name text remains visible without the enhancement. */
      }
    });
  }
  if (!reduceMotion.matches) {
    document.fonts.ready.then(async () => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.from(".hero-lockup", {
        yPercent: 35,
        opacity: 0,
        duration: 1.05,
        stagger: 0.09,
      });
      intro.from(".hero-bottom", { y: 20, opacity: 0, duration: 0.7 }, 0.45);
      await intro;
      try {
        const { initOptics } = await import("./optics");
        initOptics(document.querySelector<HTMLElement>(".contact-section")!);
      } catch {
        /* The authored CSS glass remains visible if WebGL is unavailable. */
      }
    });
    gsap.to(".hero-lockup", {
      y: -35,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}

if (!reduceMotion.matches) {
  document
    .querySelectorAll(
      ".skill-workbench,.experience-entry,.academic-entry,.course-entry,.case-content section",
    )
    .forEach((element) => {
      gsap.from(element, {
        y: 24,
        opacity: 0.35,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 92%", once: true },
      });
    });
}

document.querySelectorAll<HTMLDetailsElement>(".mobile-nav").forEach((menu) => {
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.open = false;
    });
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
});

document
  .querySelectorAll<HTMLAnchorElement>("[data-back-work]")
  .forEach((link) => {
    link.addEventListener("click", () => {
      try {
        sessionStorage.setItem("portfolio-return", "1");
      } catch {
        /* Navigation also works without storage. */
      }
    });
  });

window.addEventListener("pageshow", (event) => {
  document
    .querySelectorAll(".route-cover,.route-backdrop")
    .forEach((element) => element.remove());
  document.body.style.overflow = "";
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (event.persisted) return;
      if (galleryReturnScroll !== undefined && location.hash === "#work") {
        window.scrollTo({ top: galleryReturnScroll, behavior: "instant" });
      } else if (location.hash) {
        // Resolve cross-page anchors after fonts and scroll effects settle.
        document.getElementById(location.hash.slice(1))?.scrollIntoView({
          behavior: "instant",
        });
      }
    });
  });
});
