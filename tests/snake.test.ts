import assert from "node:assert/strict";
import test from "node:test";

import { createDemoCalendar } from "../src/github.js";
import { buildGameTraversal, buildPath, renderSnake, seedFromText } from "../src/snake.js";

test("buildGameTraversal eventually visits every grid cell", () => {
  const points = buildGameTraversal(53, 7, 42);
  assert.equal(new Set(points.map((point) => `${point.column}:${point.row}`)).size, 53 * 7);
});

test("buildGameTraversal moves like a snake game without diagonal jumps", () => {
  const points = buildGameTraversal(12, 7, 99);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    assert.ok(previous && current);
    assert.equal(Math.abs(current.column - previous.column) + Math.abs(current.row - previous.row), 1);
  }
});

test("daily route is deterministic for the same seed", () => {
  const seed = seedFromText("duartess7:2026-08-28");
  assert.deepEqual(buildGameTraversal(8, 7, seed), buildGameTraversal(8, 7, seed));
  assert.notDeepEqual(buildGameTraversal(8, 7, seed), buildGameTraversal(8, 7, seed + 1));
});

test("renderSnake creates an original animated SVG", () => {
  const calendar = createDemoCalendar();
  const svg = renderSnake(calendar, {
    username: "duartess7",
    generatedAt: new Date("2026-08-28T12:00:00Z"),
  });
  assert.match(svg, /NIGHTFALL SERPENT/);
  assert.match(svg, /animateMotion/);
  assert.match(svg, /Copyright © 2026 duartess7/);
  assert.equal((svg.match(/<rect x=/g) ?? []).length > 350, true);
  assert.match(buildPath(buildGameTraversal(2, 7, 7)), /^M/);
});
