import test from "node:test";
import assert from "node:assert/strict";
import { parseBlamePorcelain } from "../gitService";

test("parseBlamePorcelain parses line metadata", () => {
  const blameOutput = [
    "f6b2c0a1c5d65ca0d6d657e436ecdc32e0f3a610 1 1 1",
    "author Jane Doe",
    "author-mail <jane@example.com>",
    "author-time 1710000000",
    "summary add greeting",
    "\tconsole.log('hello');",
    "0000000000000000000000000000000000000000 2 2 1",
    "author Not Committed Yet",
    "author-mail <not.committed.yet>",
    "author-time 1710001000",
    "summary Version of src/index.ts from src/index.ts",
    "\tconsole.log('draft');"
  ].join("\n");

  const result = parseBlamePorcelain(blameOutput);

  assert.equal(result.length, 2);
  assert.deepEqual(result[0], {
    lineNumber: 0,
    commitHash: "f6b2c0a1c5d65ca0d6d657e436ecdc32e0f3a610",
    shortCommitHash: "f6b2c0a",
    author: "Jane Doe",
    authorMail: "<jane@example.com>",
    authorTime: 1710000000,
    summary: "add greeting",
    isUncommitted: false
  });
  assert.equal(result[1].isUncommitted, true);
  assert.equal(result[1].lineNumber, 1);
});
