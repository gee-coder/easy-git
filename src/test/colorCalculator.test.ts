import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAnnotationColor,
  calculateLineBackground,
  getAgeProgress
} from "../colorCalculator";

const NOW = new Date("2026-03-19T12:00:00Z").getTime();

test("newer lines receive a lower age progress", () => {
  const recent = getAgeProgress(NOW - 2 * 60 * 60 * 1000, NOW);
  const older = getAgeProgress(NOW - 40 * 24 * 60 * 60 * 1000, NOW);

  assert.ok(recent < older);
});

test("color helpers return rgba strings", () => {
  const background = calculateLineBackground(NOW - 2 * 60 * 60 * 1000, "blue", NOW);
  const text = calculateAnnotationColor(NOW - 2 * 60 * 60 * 1000, "green", NOW);

  assert.match(background, /^rgba\(\d+, \d+, \d+, 0\.\d+\)$/);
  assert.match(text, /^rgba\(\d+, \d+, \d+, 0\.\d+\)$/);
});
