import test from "node:test";
import assert from "node:assert/strict";
import { isCurrentAuthorLine } from "../authorIdentity";
import type { BlameLineInfo } from "../types";

const BASE_LINE: BlameLineInfo = {
  lineNumber: 0,
  commitHash: "f6b2c0a1c5d65ca0d6d657e436ecdc32e0f3a610",
  shortCommitHash: "f6b2c0a",
  author: "Jane Doe",
  authorMail: "<jane@example.com>",
  authorTime: 1710000000,
  summary: "add greeting",
  isUncommitted: false
};

test("current author matches by email when available", () => {
  assert.equal(
    isCurrentAuthorLine(BASE_LINE, {
      name: "Someone Else",
      email: "jane@example.com"
    }),
    true
  );
});

test("current author falls back to name when email is unavailable", () => {
  assert.equal(
    isCurrentAuthorLine(
      {
        ...BASE_LINE,
        authorMail: ""
      },
      {
        name: "Jane Doe"
      }
    ),
    true
  );
});

test("uncommitted lines are never treated as current-author committed lines", () => {
  assert.equal(
    isCurrentAuthorLine(
      {
        ...BASE_LINE,
        isUncommitted: true
      },
      {
        name: "Jane Doe",
        email: "jane@example.com"
      }
    ),
    false
  );
});
