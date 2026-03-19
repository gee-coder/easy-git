import test from "node:test";
import assert from "node:assert/strict";
import { formatCompactTimestamp, formatFullDateTime, formatRelativeTime } from "../relativeTime";

const NOW = new Date("2026-03-19T12:00:00Z").getTime();

test("formatRelativeTime uses just now for sub-minute timestamps", () => {
  const result = formatRelativeTime(NOW - 30_000, "zh-CN", NOW);
  assert.equal(result, "刚刚");
});

test("formatRelativeTime uses yesterday for day-old timestamps", () => {
  const result = formatRelativeTime(NOW - 24 * 60 * 60 * 1000, "zh-CN", NOW);
  assert.equal(result, "昨天");
});

test("formatCompactTimestamp falls back to month-day after one month", () => {
  const result = formatCompactTimestamp(NOW - 45 * 24 * 60 * 60 * 1000, "relative", "zh-CN", NOW);
  assert.equal(result, "02-02");
});

test("formatCompactTimestamp supports absolute dates", () => {
  const result = formatCompactTimestamp(new Date("2026-03-01T00:00:00Z").getTime(), "absolute", "zh-CN", NOW);
  assert.equal(result, "2026-03-01");
});

test("formatFullDateTime returns a stable YYYY-MM-DD HH:mm:ss string", () => {
  const result = formatFullDateTime(new Date("2026-03-01T08:09:10Z").getTime());
  assert.match(result, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
});
