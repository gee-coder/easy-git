import type { BlameLineInfo, GitAuthorIdentity } from "./types";

export function isCurrentAuthorLine(line: BlameLineInfo, currentAuthor?: GitAuthorIdentity): boolean {
  if (line.isUncommitted || !currentAuthor) {
    return false;
  }

  const lineEmail = normalizeEmail(line.authorMail);
  const currentEmail = normalizeEmail(currentAuthor.email);
  if (lineEmail && currentEmail) {
    return lineEmail === currentEmail;
  }

  const lineName = normalizeText(line.author);
  const currentName = normalizeText(currentAuthor.name);
  return Boolean(lineName && currentName && lineName === currentName);
}

function normalizeEmail(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().replace(/^<|>$/g, "");
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function normalizeText(value?: string): string | undefined {
  const trimmed = value?.trim().toLowerCase();
  return trimmed || undefined;
}
