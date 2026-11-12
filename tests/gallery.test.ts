import { test } from "node:test";
import assert from "node:assert/strict";
import { selectIndex, swipeDirection } from "../src/gallery-model.ts";

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
