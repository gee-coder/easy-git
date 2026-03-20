import type { ColorScheme } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * DAY_MS;
const BLUE_HUE_DEGREES = 213;

const AGE_BUCKETS_MS = [
  14 * DAY_MS,
  120 * DAY_MS,
  YEAR_MS,
  2 * YEAR_MS,
  3 * YEAR_MS,
  4 * YEAR_MS
] as const;

const BLUE_BACKGROUND_PALETTE: Rgb[] = [
  [47, 81, 148],
  [46, 77, 139],
  [44, 63, 102],
  [39, 53, 80],
  [37, 49, 73],
  [35, 43, 62],
  [34, 38, 50]
];

const TEXT_PALETTE: Rgb[] = [
  [206, 208, 214],
  [192, 195, 202],
  [176, 181, 191],
  [162, 167, 177],
  [152, 156, 164],
  [141, 145, 153],
  [140, 144, 149]
];

type Rgb = [number, number, number];

export function calculateAnnotationBackground(
  timestampMs: number,
  colorScheme: ColorScheme,
  now = Date.now()
): string {
  return toRgbString(getBackgroundColor(getAgeBucketIndex(timestampMs, now), colorScheme));
}

export function calculateAnnotationColor(timestampMs: number, _colorScheme: ColorScheme, now = Date.now()): string {
  return toRgbString(TEXT_PALETTE[getAgeBucketIndex(timestampMs, now)]);
}

export function calculateAnnotationBorder(
  timestampMs: number,
  colorScheme: ColorScheme,
  now = Date.now()
): string {
  return toRgbString(lighten(getBackgroundColor(getAgeBucketIndex(timestampMs, now), colorScheme), 0.18));
}

export function calculateUncommittedAnnotationColor(colorValue: string): string {
  return toRgbString(parseConfigColor(colorValue));
}

export function calculateUncommittedAnnotationBackground(colorValue: string): string {
  const [red, green, blue] = parseConfigColor(colorValue);
  return `rgba(${red}, ${green}, ${blue}, 0.18)`;
}

export function calculateUncommittedAnnotationBorder(colorValue: string): string {
  return toRgbString(lighten(parseConfigColor(colorValue), 0.12));
}

export function calculateCurrentAuthorAnnotationBackground(
  timestampMs: number,
  colorValue: string,
  now = Date.now()
): string {
  return toRgbString(getConfiguredBackgroundColor(getAgeBucketIndex(timestampMs, now), colorValue));
}

export function calculateCurrentAuthorAnnotationColor(timestampMs: number, _colorValue: string, now = Date.now()): string {
  return toRgbString(TEXT_PALETTE[getAgeBucketIndex(timestampMs, now)]);
}

export function calculateCurrentAuthorAnnotationBorder(
  timestampMs: number,
  colorValue: string,
  now = Date.now()
): string {
  return toRgbString(lighten(getConfiguredBackgroundColor(getAgeBucketIndex(timestampMs, now), colorValue), 0.18));
}

export function getAgeProgress(timestampMs: number, now = Date.now()): number {
  return getAgeBucketIndex(timestampMs, now) / (BLUE_BACKGROUND_PALETTE.length - 1);
}

function getAgeBucketIndex(timestampMs: number, now: number): number {
  const age = Math.max(0, now - timestampMs);

  for (let index = 0; index < AGE_BUCKETS_MS.length; index += 1) {
    if (age <= AGE_BUCKETS_MS[index]) {
      return index;
    }
  }

  return BLUE_BACKGROUND_PALETTE.length - 1;
}

function getBackgroundColor(index: number, colorScheme: ColorScheme): Rgb {
  if (colorScheme === "blue") {
    return BLUE_BACKGROUND_PALETTE[index];
  }

  return retintBlueSwatch(BLUE_BACKGROUND_PALETTE[index], colorScheme);
}

function getConfiguredBackgroundColor(index: number, colorValue: string): Rgb {
  return retintFromConfiguredColor(BLUE_BACKGROUND_PALETTE[index], parseConfigColor(colorValue));
}

function retintBlueSwatch(reference: Rgb, colorScheme: Exclude<ColorScheme, "blue">): Rgb {
  const hue = colorScheme === "green" ? 152 : 268;
  const [refHue, refSaturation, refLightness] = rgbToHsl(reference);
  const saturationBoost = colorScheme === "green" ? 1.12 : 1.08;
  const shiftedHue = normalizeHue(refHue + (hue - BLUE_HUE_DEGREES));
  const nextSaturation = clamp(refSaturation * saturationBoost, 0.16, 0.72);
  return hslToRgb(shiftedHue, nextSaturation, refLightness);
}

function retintFromConfiguredColor(reference: Rgb, configuredColor: Rgb): Rgb {
  const [configuredHue, configuredSaturation] = rgbToHsl(configuredColor);
  const [, referenceSaturation, referenceLightness] = rgbToHsl(reference);
  const nextSaturation = clamp(configuredSaturation * 0.72 + referenceSaturation * 0.28, 0.18, 0.8);
  return hslToRgb(configuredHue, nextSaturation, referenceLightness);
}

function lighten([red, green, blue]: Rgb, amount: number): Rgb {
  return [
    Math.round(red + (255 - red) * amount),
    Math.round(green + (255 - green) * amount),
    Math.round(blue + (255 - blue) * amount)
  ];
}

function toRgbString([red, green, blue]: Rgb): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

function rgbToHsl([red, green, blue]: Rgb): [number, number, number] {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return [0, 0, lightness];
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  switch (max) {
    case r:
      hue = 60 * (((g - b) / delta) % 6);
      break;
    case g:
      hue = 60 * ((b - r) / delta + 2);
      break;
    default:
      hue = 60 * ((r - g) / delta + 4);
      break;
  }

  return [normalizeHue(hue), saturation, lightness];
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = hue / 60;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  const match = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment >= 0 && segment < 1) {
    red = chroma;
    green = secondary;
  } else if (segment < 2) {
    red = secondary;
    green = chroma;
  } else if (segment < 3) {
    green = chroma;
    blue = secondary;
  } else if (segment < 4) {
    green = secondary;
    blue = chroma;
  } else if (segment < 5) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  return [
    Math.round((red + match) * 255),
    Math.round((green + match) * 255),
    Math.round((blue + match) * 255)
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHue(hue: number): number {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function parseConfigColor(value: string): Rgb {
  const normalized = value.trim();
  const fromHex = parseHexColor(normalized);
  if (fromHex) {
    return fromHex;
  }

  const fromRgbFunction = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(normalized);
  if (fromRgbFunction) {
    return clampRgb([
      Number(fromRgbFunction[1]),
      Number(fromRgbFunction[2]),
      Number(fromRgbFunction[3])
    ]);
  }

  const fromCsv = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/.exec(normalized);
  if (fromCsv) {
    return clampRgb([Number(fromCsv[1]), Number(fromCsv[2]), Number(fromCsv[3])]);
  }

  return [46, 160, 67];
}

function parseHexColor(value: string): Rgb | undefined {
  const match = /^#?([0-9a-f]{6})$/i.exec(value);
  if (!match) {
    return undefined;
  }

  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ];
}

function clampRgb([red, green, blue]: [number, number, number]): Rgb {
  return [
    clamp(Math.round(red), 0, 255),
    clamp(Math.round(green), 0, 255),
    clamp(Math.round(blue), 0, 255)
  ];
}
