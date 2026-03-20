import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAnnotationBackground,
  calculateAnnotationColor,
  calculateAnnotationBorder,
  calculateCurrentAuthorAnnotationBackground,
  calculateCurrentAuthorAnnotationBorder,
  calculateCurrentAuthorAnnotationColor,
  calculateUncommittedAnnotationBackground,
  calculateUncommittedAnnotationBorder,
  calculateUncommittedAnnotationColor,
  getAgeProgress
} from "../colorCalculator";

const NOW = new Date("2026-03-19T12:00:00Z").getTime();

test("newer lines receive a lower age progress", () => {
  const recent = getAgeProgress(NOW - 2 * 60 * 60 * 1000, NOW);
  const older = getAgeProgress(NOW - 4 * 365 * 24 * 60 * 60 * 1000, NOW);

  assert.ok(recent < older);
});

test("blue palette follows the expected goland-like buckets", () => {
  const background = calculateAnnotationBackground(NOW - 2 * 60 * 60 * 1000, "blue", NOW);
  const olderBackground = calculateAnnotationBackground(NOW - 5 * 365 * 24 * 60 * 60 * 1000, "blue", NOW);
  const text = calculateAnnotationColor(NOW - 2 * 60 * 60 * 1000, "blue", NOW);

  assert.equal(background, "rgb(47, 81, 148)");
  assert.equal(olderBackground, "rgb(34, 38, 50)");
  assert.equal(text, "rgb(206, 208, 214)");
});

test("non-blue schemes keep the same contrast envelope", () => {
  const greenBackground = calculateAnnotationBackground(NOW - 200 * 24 * 60 * 60 * 1000, "green", NOW);
  const purpleBorder = calculateAnnotationBorder(NOW - 800 * 24 * 60 * 60 * 1000, "purple", NOW);

  assert.match(greenBackground, /^rgb\(\d+, \d+, \d+\)$/);
  assert.match(purpleBorder, /^rgb\(\d+, \d+, \d+\)$/);
});

test("uncommitted annotation color accepts csv and css-like inputs", () => {
  assert.equal(calculateUncommittedAnnotationColor("46,160,67"), "rgb(46, 160, 67)");
  assert.equal(calculateUncommittedAnnotationColor("rgb(46,160,67)"), "rgb(46, 160, 67)");
  assert.equal(calculateUncommittedAnnotationColor("#2ea043"), "rgb(46, 160, 67)");
  assert.equal(calculateUncommittedAnnotationBackground("46,160,67"), "rgba(46, 160, 67, 0.18)");
  assert.equal(calculateUncommittedAnnotationBorder("46,160,67"), "rgb(71, 171, 90)");
});

test("current-author palette keeps age buckets while following configured hue", () => {
  const recentBackground = calculateCurrentAuthorAnnotationBackground(NOW - 2 * 60 * 60 * 1000, "#d97706", NOW);
  const olderBackground = calculateCurrentAuthorAnnotationBackground(
    NOW - 5 * 365 * 24 * 60 * 60 * 1000,
    "#d97706",
    NOW
  );
  const border = calculateCurrentAuthorAnnotationBorder(NOW - 2 * 60 * 60 * 1000, "#d97706", NOW);
  const text = calculateCurrentAuthorAnnotationColor(NOW - 2 * 60 * 60 * 1000, "#d97706", NOW);

  assert.match(recentBackground, /^rgb\(\d+, \d+, \d+\)$/);
  assert.match(olderBackground, /^rgb\(\d+, \d+, \d+\)$/);
  assert.match(border, /^rgb\(\d+, \d+, \d+\)$/);
  assert.equal(text, "rgb(206, 208, 214)");
  assert.notEqual(recentBackground, olderBackground);
  assert.notEqual(recentBackground, calculateAnnotationBackground(NOW - 2 * 60 * 60 * 1000, "blue", NOW));
});
