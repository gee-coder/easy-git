import * as fs from "node:fs/promises";
import * as vscode from "vscode";
import { GitService } from "./gitService";
import type { BlameLookupResult, BlameResult, EasyGitConfig } from "./types";

interface CacheEntry {
  expiresAt: number;
  value: BlameResult;
}

export class BlameManager {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inflight = new Map<string, Promise<BlameLookupResult>>();

  constructor(private readonly gitService: GitService) {}

  async getBlame(document: vscode.TextDocument, config: EasyGitConfig): Promise<BlameLookupResult> {
    if (document.uri.scheme !== "file") {
      return {
        kind: "skip",
        code: "not-file",
        reason: "Easy Git 只支持本地磁盘上的文件。"
      };
    }

    if (document.lineCount > config.maxLineCount) {
      return {
        kind: "skip",
        code: "too-large",
        reason: `当前文件共有 ${document.lineCount} 行，已超过 easy-git.maxLineCount (${config.maxLineCount})。`
      };
    }

    const cacheKey = await this.createCacheKey(document);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { kind: "ok", blame: cached.value };
    }

    const pending = this.inflight.get(cacheKey);
    if (pending) {
      return pending;
    }

    const promise = this.loadBlame(document, config, cacheKey).finally(() => {
      this.inflight.delete(cacheKey);
    });

    this.inflight.set(cacheKey, promise);
    return promise;
  }

  invalidateDocument(document: vscode.TextDocument | vscode.Uri): void {
    const target = document instanceof vscode.Uri ? document.toString() : document.uri.toString();
    for (const key of this.cache.keys()) {
      if (key.startsWith(target)) {
        this.cache.delete(key);
      }
    }
  }

  clearAll(): void {
    this.cache.clear();
    this.inflight.clear();
    this.gitService.clearCaches();
  }

  private async loadBlame(
    document: vscode.TextDocument,
    config: EasyGitConfig,
    cacheKey: string
  ): Promise<BlameLookupResult> {
    try {
      const blame = await this.gitService.getBlame(document.uri.fsPath, {
        contents: document.isDirty ? document.getText() : undefined
      });

      if (!blame) {
        return {
          kind: "skip",
          code: "not-in-repo",
          reason: "当前文件不在 Git 仓库中。"
        };
      }

      this.cache.set(cacheKey, {
        expiresAt: Date.now() + config.cacheTimeout,
        value: blame
      });

      return {
        kind: "ok",
        blame
      };
    } catch (error) {
      return {
        kind: "skip",
        code: "git-error",
        reason: error instanceof Error ? error.message : "读取 Git blame 失败。"
      };
    }
  }

  private async createCacheKey(document: vscode.TextDocument): Promise<string> {
    const base = document.uri.toString();

    if (document.isDirty) {
      return `${base}::dirty::${document.version}`;
    }

    try {
      const stats = await fs.stat(document.uri.fsPath);
      return `${base}::saved::${stats.mtimeMs}`;
    } catch {
      return `${base}::saved::${document.version}`;
    }
  }
}
