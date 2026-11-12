import gsap from "gsap";
import { skillGroups, type SkillGroup } from "./skill-model";

export function initSkills(reduced: boolean) {
  const stage = document.querySelector<HTMLElement>(".skill-stage");
  if (!stage) return;
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-skill]"),
  ];
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.skill as SkillGroup;
      const group = skillGroups[key];
      if (!group) return;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      stage.querySelector("#skill-current")!.textContent =
        group.title + " tools";
      stage.querySelector("#skill-tools")!.textContent = group.tools;
      const map = stage.querySelector("svg")!;
      map.setAttribute(
        "aria-label",
        group.nodes.join(", ") + " tool composition",
      );
      stage.querySelectorAll(".skill-node text").forEach((node, i) => {
        node.textContent = group.nodes[i];
      });
      if (!reduced) {
        gsap.fromTo(
          stage.querySelectorAll(".skill-node"),
          { opacity: 0.15 },
          { opacity: 1, duration: 0.6, stagger: 0.09, overwrite: true },
        );
        gsap.fromTo(
          stage.querySelectorAll(".skill-connections path"),
          { strokeDashoffset: 140 },
          { strokeDashoffset: 0, duration: 1, stagger: 0.08, overwrite: true },
        );
      }
    }),
  );
}
