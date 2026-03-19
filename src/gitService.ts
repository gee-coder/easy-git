import { spawn } from "node:child_process";
import * as path from "node:path";
import type { BlameLineInfo, BlameResult } from "./types";

interface GitCommandResult {
  stdout: string;
  stderr: string;
}

interface GetBlameOptions {
  repoRoot?: string;
  contents?: string;
}

export class GitService {
  private readonly repoRootCache = new Map<string, Promise<string | undefined>>();

  async resolveRepoRoot(filePath: string): Promise<string | undefined> {
    const directory = path.dirname(filePath);
    const cached = this.repoRootCache.get(directory);
    if (cached) {
      return cached;
    }

    const pending = this.runGitCommand(["rev-parse", "--show-toplevel"], directory)
      .then(({ stdout }) => stdout.trim() || undefined)
      .catch(() => undefined);

    this.repoRootCache.set(directory, pending);
    return pending;
  }

  async getBlame(filePath: string, options: GetBlameOptions = {}): Promise<BlameResult | undefined> {
    const repoRoot = options.repoRoot ?? (await this.resolveRepoRoot(filePath));
    if (!repoRoot) {
      return undefined;
    }

    const relativePath = normalizeGitPath(path.relative(repoRoot, filePath));
    const args = ["blame", "--line-porcelain"];

    if (options.contents !== undefined) {
      args.push("--contents", "-", "--", relativePath);
    } else {
      args.push("--", relativePath);
    }

    const { stdout } = await this.runGitCommand(args, repoRoot, options.contents);

    return {
      repoRoot,
      filePath,
      lines: parseBlamePorcelain(stdout),
      generatedAt: Date.now(),
      fromDirtyContent: options.contents !== undefined
    };
  }

  async getCommitDetails(filePath: string, commitHash: string): Promise<string> {
    const repoRoot = await this.resolveRepoRoot(filePath);
    if (!repoRoot) {
      throw new Error("当前文件不在 Git 仓库中。");
    }

    const { stdout } = await this.runGitCommand(
      ["show", "--stat", "--decorate", "--format=fuller", commitHash],
      repoRoot
    );

    return stdout;
  }

  clearCaches(): void {
    this.repoRootCache.clear();
  }

  private runGitCommand(args: string[], cwd: string, stdinText?: string): Promise<GitCommandResult> {
    return new Promise((resolve, reject) => {
      const child = spawn("git", args, {
        cwd,
        stdio: "pipe",
        windowsHide: true
      });

      let stdout = "";
      let stderr = "";

      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");

      child.stdout.on("data", (chunk: string) => {
        stdout += chunk;
      });

      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });

      child.on("error", (error) => {
        reject(error);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
          return;
        }

        reject(new Error(stderr.trim() || `git ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
      });

      if (stdinText !== undefined) {
        child.stdin.write(stdinText);
      }

      child.stdin.end();
    });
  }
}

export function parseBlamePorcelain(output: string): BlameLineInfo[] {
  const entries: BlameLineInfo[] = [];
  const metadataCache = new Map<string, Omit<BlameLineInfo, "lineNumber">>();
  const lines = output.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const header = lines[index]?.trim();
    if (!header) {
      index += 1;
      continue;
    }

    const match = /^(\^?[0-9a-f]{40}|0{40})\s+\d+\s+(\d+)(?:\s+\d+)?$/i.exec(header);
    if (!match) {
      throw new Error(`无法解析 git blame 输出：${header}`);
    }

    const commitHash = match[1].replace(/^\^/, "");
    const lineNumber = Number(match[2]) - 1;
    index += 1;

    const base =
      metadataCache.get(commitHash) ??
      {
        commitHash,
        shortCommitHash: commitHash.slice(0, 7),
        author: "",
        authorMail: "",
        authorTime: 0,
        summary: "",
        isUncommitted: commitHash === "0000000000000000000000000000000000000000"
      };

    while (index < lines.length && !lines[index].startsWith("\t")) {
      const currentLine = lines[index];
      const separatorIndex = currentLine.indexOf(" ");
      const key = separatorIndex === -1 ? currentLine : currentLine.slice(0, separatorIndex);
      const value = separatorIndex === -1 ? "" : currentLine.slice(separatorIndex + 1);

      switch (key) {
        case "author":
          base.author = value;
          base.isUncommitted ||= value === "Not Committed Yet";
          break;
        case "author-mail":
          base.authorMail = value;
          break;
        case "author-time":
          base.authorTime = Number(value) || 0;
          break;
        case "summary":
          base.summary = value;
          break;
        default:
          break;
      }

      index += 1;
    }

    metadataCache.set(commitHash, { ...base });
    entries.push({
      lineNumber,
      ...base
    });

    if (index < lines.length && lines[index].startsWith("\t")) {
      index += 1;
    }
  }

  return entries.sort((left, right) => left.lineNumber - right.lineNumber);
}

function normalizeGitPath(value: string): string {
  return value.split(path.sep).join("/");
}
