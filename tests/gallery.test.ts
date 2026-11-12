import { test } from "node:test";
import assert from "node:assert/strict";
import { selectIndex, swipeDirection } from "../src/gallery-model.ts";
import { readFileSync, existsSync } from "node:fs";
import { skillGroups } from "../src/skill-model.ts";

test("the three-project collection is finite in both directions", () => {
  assert.equal(selectIndex(-1, 3), 0);
  assert.equal(selectIndex(1, 3), 1);
  assert.equal(selectIndex(3, 3), 2);
  assert.throws(() => selectIndex(0, 0), RangeError);
});

test("swiping selects work without interpreting vertical scrolling as a gesture", () => {
  assert.equal(swipeDirection(-100, 10), 1);
  assert.equal(swipeDirection(100, 10), -1);
  assert.equal(swipeDirection(30, 0), 0);
  assert.equal(swipeDirection(70, 150), 0);
  assert.equal(swipeDirection(60, 55), 0);
});

test("the centered Vphy preview and all image destinations have deployable media", () => {
  const home = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const articles = home.match(
    /<article class="project-panel[\s\S]*?<\/article>/g,
  )!;
  assert.equal(articles.length, 3);
  assert.match(articles[1], /is-active/);
  assert.match(articles[1], /href="\/work\/vphy-lab\/"/);
  assert.match(articles[1], /data-video="\/assets\/vphy-loop.mp4"/);
  for (const article of articles) {
    const href = article.match(/href="([^"]+)"/)![1];
    const image = article.match(/src="([^"]+)"/)![1];
    assert.ok(existsSync(new URL(`..${href}index.html`, import.meta.url)));
    assert.ok(existsSync(new URL(`../public${image}`, import.meta.url)));
  }
  const movie = readFileSync(
    new URL("../public/assets/vphy-loop.mp4", import.meta.url),
  );
  assert.equal(movie.toString("ascii", 4, 8), "ftyp");
});

test("interactive skill labels are supported by the complete skills inventory", () => {
  const inventory = readFileSync(
    new URL("../skills/index.html", import.meta.url),
    "utf8",
  );
  for (const group of Object.values(skillGroups)) {
    assert.equal(new Set(group.nodes).size, 4);
    group.nodes.forEach((name) => assert.ok(inventory.includes(name), name));
  }
});
