import assert from "node:assert/strict";
import test from "node:test";

import { createDemoCalendar } from "../src/github.js";
import { buildPath, buildTraversal, renderSnake } from "../src/snake.js";

test("buildTraversal visits every grid cell exactly once", () => {
  const points = buildTraversal(53);
  assert.equal(points.length, 53 * 7);
  assert.equal(new Set(points.map((point) => `${point.column}:${point.row}`)).size, points.length);
});

test("buildTraversal reverses direction on alternating rows", () => {
  const points = buildTraversal(3, 2);
  assert.deepEqual(
    points.map(({ column, row }) => [column, row]),
    [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1]],
  );
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
  assert.match(buildPath(buildTraversal(2)), /^M/);
});
