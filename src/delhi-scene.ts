/** Original line artwork; the biography stays ordinary, selectable HTML. */
export function initDelhiScene() {
  const host = document.querySelector<HTMLElement>(".delhi-scene");
  if (!host) return;
  let seed = 37;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const dots = Array.from({ length: 950 }, () =>
    `<circle cx="${(280 + random() * 172).toFixed(1)}" cy="${(64 + random() * 207).toFixed(1)}" r="${(.25 + random() * .45).toFixed(2)}"/>`
  ).join("");
  const branch = (x: number, y: number, angle: number, scale: number, phase: number) => {
    const leaves = Array.from({ length: 12 }, (_, i) => {
      const px = i * 9.1;
      const py = -Math.sin(i / 12 * Math.PI) * 13;
      const tilt = -20 + random() * 40;
      return `<g transform="translate(${px},${py}) rotate(${tilt})"><g class="delhi-leaf" style="animation-delay:-${phase + i * .13}s"><path d="M0 0L-5 -13M0 0L9 8"/><path fill="currentColor" fill-opacity=".7" stroke="none" d="M-5 -13Q-15 -15 -11 -22Q-3 -20 -5 -13M9 8Q11 1 17 4Q18 11 9 8"/></g></g>`;
    }).join("");
    return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"><g class="delhi-branch" style="animation-delay:-${phase}s"><path d="M-12 7Q45 -35 123 -3"/>${leaves}</g></g>`;
  };
  const wheel = (x: number) => `<g transform="translate(${x} 0)"><circle r="14.5" fill="#10110f" stroke-width="3"/><circle r="11.5"/><g class="delhi-spokes">${Array.from({ length: 10 }, (_, i) => `<path transform="rotate(${i * 36})" d="M0 0L0 -11"/>`).join("")}</g><circle r="2" fill="currentColor"/></g>`;
  const bike = `<g class="delhi-suspension">${wheel(0)}${wheel(66)}<path d="M-14 -8Q0 -22 15 -9M51 -10Q64 -25 79 -10M0 0L18 -24L42 -20L28 0ZM28 0L48 -2L42 -20M66 0L52 -35L47 -38M62 -1L49 -34"/><path d="M14 -27Q22 -35 36 -30L43 -24Q30 -18 18 -22Z" fill="#10110f"/><path d="M4 -29H19M2 -26H17M17 -19L15 -5M21 -18L20 -6M25 -17L25 -5M14 -4L31 -3M27 3H52L57 0M43 -35L54 -35" stroke-width="2"/><circle cx="55" cy="-31" r="4" fill="#f1eee6"/><path d="M14 -34Q20 -38 27 -34L36 -22L31 -7L40 -4M22 -35L28 -48L38 -43L48 -34M28 -48L21 -51L15 -38L8 -32" stroke-width="3.8"/><path d="M22 -53Q17 -61 22 -67Q29 -72 35 -66L37 -59L30 -55Z" fill="#10110f"/><path d="M26 -67L35 -63L36 -60L28 -60"/><path d="M-17 4H-25M-24 0H-36" opacity=".3"/></g>`;
  host.innerHTML = `<svg viewBox="0 0 640 330" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs><clipPath id="delhi-frame"><path d="M0 0H640V330H0Z"/></clipPath><clipPath id="delhi-stone"><path d="M280 270V119H290V101H298V82H313V65H419V82H434V101H443V119H452V270H399V204C399 165 333 165 333 204V270Z"/></clipPath></defs>
    <g clip-path="url(#delhi-frame)">
      <circle class="delhi-sun" cx="440" cy="76" r="31" fill="#f24c2f"/>
      <g fill="none" stroke="currentColor" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round">
        <g opacity=".8"><path d="M20 258Q30 204 48 165Q76 107 149 70M48 165Q71 143 118 142M76 120Q64 74 76 43M110 90Q144 49 208 41"/>
        ${branch(61, 92, -46, .9, 0)}${branch(91, 107, -14, 1.05, 1.1)}${branch(47, 162, -8, .73, 2.4)}${branch(134, 73, -14, .87, .8)}${branch(72, 48, 8, .78, 3.3)}${branch(30, 202, -46, .55, 1.7)}</g>
        <g fill="#10110f"><path d="M280 270V119H290V101H298V82H313V65H419V82H434V101H443V119H452V270H399V204C399 165 333 165 333 204V270Z"/>
        <path d="M333 270V204C333 165 399 165 399 204V270M327 270V203C327 157 405 157 405 203V270M320 270V199C320 150 412 150 412 199V270"/>
        <path d="M278 270H454V277H278ZM280 119H452V127H280ZM287 101H445V108H287ZM295 82H437V89H295ZM309 64H423V70H309Z"/>
        <path d="M318 63V57H414V63M334 56Q366 34 398 56M342 54V47H390V54M355 45V40H377V45M282 139H450M284 147H448M289 252H317M415 252H443"/>
        <path d="M289 213H314V244H289ZM418 213H443V244H418ZM289 256H314V266H289ZM418 256H443V266H418Z"/>
        <circle cx="301" cy="169" r="12"/><circle cx="301" cy="169" r="9"/><circle cx="430" cy="169" r="12"/><circle cx="430" cy="169" r="9"/>
        <path d="M287 190H315M417 190H445M287 195H315M417 195H445M293 217V240M300 217V240M307 217V240M423 217V240M430 217V240M437 217V240"/></g>
        <g fill="currentColor" stroke="none" opacity=".55" clip-path="url(#delhi-stone)">${dots}</g>
        <g opacity=".55" stroke-dasharray="1 3"><path d="M303 94H430M295 113H439M290 134H442M293 202H313M418 202H440M325 74H407"/>
        <path d="M93 276Q95 264 107 267Q101 251 116 249Q125 226 143 244Q163 224 178 246Q197 244 198 260Q217 250 222 276M467 276Q469 260 483 263Q475 246 494 245Q511 221 527 245Q546 237 552 256Q572 256 572 276M229 276Q230 262 242 265Q247 250 261 264L270 276"/>
        </g><path d="M39 279H596M72 285H561" opacity=".45"/>
        ${branch(117, 267, -12, .55, 2)}${branch(496, 268, -20, .46, 4)}
      </g>
      <g fill="none" stroke="currentColor" stroke-width=".95" stroke-linejoin="round" stroke-linecap="round"><g class="delhi-ride delhi-ride-forward"><g transform="translate(0 296) scale(.72)">${bike}</g></g><g class="delhi-ride delhi-ride-back"><g transform="translate(0 301) scale(-.72 .72)">${bike}</g></g></g>
    </g></svg>`;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  const sync = () => host.classList.toggle("is-running", visible && !document.hidden && !motion.matches);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(host);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    observer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    motion.removeEventListener("change", sync);
  });
}
