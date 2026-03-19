import type { ColorScheme } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const SIX_MONTHS_MS = 180 * DAY_MS;

const SCHEME_RGB: Record<ColorScheme, [number, number, number]> = {
  blue: [0, 122, 204],
  green: [31, 139, 76],
  purple: [124, 58, 237]
};

export function calculateLineBackground(
  timestampMs: number,
  colorScheme: ColorScheme,
  now = Date.now()
): string {
  const progress = getAgeProgress(timestampMs, now);
  const alpha = lerp(0.18, 0.035, progress);
  return asRgba(SCHEME_RGB[colorScheme], alpha);
}

export function calculateAnnotationColor(
  timestampMs: number,
  colorScheme: ColorScheme,
  now = Date.now()
): string {
  const progress = getAgeProgress(timestampMs, now);
  const alpha = lerp(0.92, 0.42, progress);
  return asRgba(SCHEME_RGB[colorScheme], alpha);
}

export function getAgeProgress(timestampMs: number, now = Date.now()): number {
  const age = Math.max(0, now - timestampMs);

  if (age <= DAY_MS) {
    return scale(age, 0, DAY_MS, 0, 0.18);
  }

  if (age <= WEEK_MS) {
    return scale(age, DAY_MS, WEEK_MS, 0.18, 0.5);
  }

  if (age <= MONTH_MS) {
    return scale(age, WEEK_MS, MONTH_MS, 0.5, 0.82);
  }

  return Math.min(1, scale(age, MONTH_MS, SIX_MONTHS_MS, 0.82, 1));
}

function asRgba([red, green, blue]: [number, number, number], alpha: number): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function scale(
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number
): number {
  if (inputEnd <= inputStart) {
    return outputEnd;
  }

  const ratio = Math.max(0, Math.min(1, (value - inputStart) / (inputEnd - inputStart)));
  return outputStart + (outputEnd - outputStart) * ratio;
}
