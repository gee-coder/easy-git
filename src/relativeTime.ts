import type { DateFormat } from "./types";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

export function formatCompactTimestamp(
  timestampMs: number,
  dateFormat: DateFormat,
  locale: string,
  now = Date.now()
): string {
  if (dateFormat === "absolute") {
    return formatAbsoluteDate(timestampMs);
  }

  return formatRelativeTime(timestampMs, locale, now);
}

export function formatRelativeTime(timestampMs: number, locale: string, now = Date.now()): string {
  const diffMs = Math.max(0, now - timestampMs);
  const isChinese = locale.toLowerCase().startsWith("zh");

  if (diffMs < MINUTE_MS) {
    return isChinese ? "刚刚" : "just now";
  }

  if (diffMs >= MONTH_MS) {
    return formatMonthDay(timestampMs);
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMs < HOUR_MS) {
    return normalizeRelativeOutput(rtf.format(-Math.floor(diffMs / MINUTE_MS), "minute"), isChinese);
  }

  if (diffMs < DAY_MS) {
    return normalizeRelativeOutput(rtf.format(-Math.floor(diffMs / HOUR_MS), "hour"), isChinese);
  }

  if (diffMs < WEEK_MS) {
    return normalizeRelativeOutput(rtf.format(-Math.floor(diffMs / DAY_MS), "day"), isChinese);
  }

  return normalizeRelativeOutput(rtf.format(-Math.floor(diffMs / WEEK_MS), "week"), isChinese);
}

export function formatFullDateTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function formatAbsoluteDate(timestampMs: number): string {
  const date = new Date(timestampMs);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatMonthDay(timestampMs: number): string {
  const date = new Date(timestampMs);
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeRelativeOutput(value: string, isChinese: boolean): string {
  return isChinese ? value.replace(/\s+/g, "") : value;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
