import * as vscode from "vscode";
import { BlameManager } from "./blameManager";
import { COMMAND_OPEN_COMMIT_DETAILS, getExtensionConfig } from "./config";
import { calculateAnnotationColor, calculateLineBackground } from "./colorCalculator";
import { formatCompactTimestamp, formatFullDateTime } from "./relativeTime";
import type { BlameLineInfo, EasyGitConfig } from "./types";

const REFRESH_DELAY_MS = 250;
const ANNOTATION_WIDTH = "12ch";

export class DecoratorManager implements vscode.Disposable {
  private readonly annotationDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });
  private readonly backgroundDecorationTypes = new Map<string, vscode.TextEditorDecorationType>();
  private readonly appliedBackgroundKeys = new WeakMap<vscode.TextEditor, Set<string>>();
  private readonly pendingRefreshes = new Map<string, NodeJS.Timeout>();
  private readonly refreshGeneration = new Map<string, number>();
  private readonly skipMessages = new Map<string, string>();
  private readonly renderedLineInfo = new Map<string, Map<number, BlameLineInfo>>();

  constructor(private readonly blameManager: BlameManager) {}

  async refreshVisibleEditors(): Promise<void> {
    await Promise.all(vscode.window.visibleTextEditors.map((editor) => this.refreshEditor(editor)));
  }

  async refreshEditor(editor?: vscode.TextEditor): Promise<void> {
    if (!editor || editor.document.uri.scheme !== "file") {
      return;
    }

    const config = getExtensionConfig();
    const documentKey = editor.document.uri.toString();
    const generation = (this.refreshGeneration.get(documentKey) ?? 0) + 1;
    this.refreshGeneration.set(documentKey, generation);

    if (!config.enabled) {
      this.clearEditor(editor);
      return;
    }

    const lookup = await this.blameManager.getBlame(editor.document, config);
    if (this.refreshGeneration.get(documentKey) !== generation) {
      return;
    }

    if (lookup.kind === "skip") {
      this.clearEditor(editor);
      this.renderedLineInfo.delete(documentKey);
      this.maybeShowSkipReason(editor, lookup.reason, lookup.code);
      return;
    }

    this.skipMessages.delete(documentKey);
    this.renderedLineInfo.set(
      documentKey,
      new Map(lookup.blame.lines.map((line) => [line.lineNumber, line]))
    );

    const annotationOptions: vscode.DecorationOptions[] = [];
    const backgroundBuckets = new Map<string, vscode.Range[]>();

    for (const line of lookup.blame.lines) {
      const decoration = this.createDecorationOption(editor.document, line, config);
      if (!decoration) {
        continue;
      }

      annotationOptions.push(decoration.annotation);
      const ranges = backgroundBuckets.get(decoration.backgroundColor) ?? [];
      ranges.push(decoration.backgroundRange);
      backgroundBuckets.set(decoration.backgroundColor, ranges);
    }

    editor.setDecorations(this.annotationDecorationType, annotationOptions);
    this.applyBackgroundDecorations(editor, backgroundBuckets);
  }

  scheduleRefresh(document: vscode.TextDocument): void {
    const documentKey = document.uri.toString();
    this.blameManager.invalidateDocument(document);

    const pending = this.pendingRefreshes.get(documentKey);
    if (pending) {
      clearTimeout(pending);
    }

    const timeout = setTimeout(() => {
      this.pendingRefreshes.delete(documentKey);
      void this.refreshVisibleEditorsForDocument(document.uri);
    }, REFRESH_DELAY_MS);

    this.pendingRefreshes.set(documentKey, timeout);
  }

  handleDocumentSaved(document: vscode.TextDocument): void {
    this.blameManager.invalidateDocument(document);
    void this.refreshVisibleEditorsForDocument(document.uri);
  }

  handleDocumentClosed(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const pending = this.pendingRefreshes.get(key);
    if (pending) {
      clearTimeout(pending);
      this.pendingRefreshes.delete(key);
    }
    this.skipMessages.delete(key);
    this.refreshGeneration.delete(key);
    this.renderedLineInfo.delete(key);
  }

  handleConfigurationChanged(): void {
    this.blameManager.clearAll();
    void this.refreshVisibleEditors();
  }

  clearAllEditors(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.clearEditor(editor);
    }
    this.renderedLineInfo.clear();
  }

  dispose(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.clearEditor(editor);
    }
    for (const timeout of this.pendingRefreshes.values()) {
      clearTimeout(timeout);
    }
    this.pendingRefreshes.clear();
    this.annotationDecorationType.dispose();
    for (const decorationType of this.backgroundDecorationTypes.values()) {
      decorationType.dispose();
    }
    this.backgroundDecorationTypes.clear();
  }

  private async refreshVisibleEditorsForDocument(uri: vscode.Uri): Promise<void> {
    const visibleEditors = vscode.window.visibleTextEditors.filter(
      (editor) => editor.document.uri.toString() === uri.toString()
    );

    await Promise.all(visibleEditors.map((editor) => this.refreshEditor(editor)));
  }

  private clearEditor(editor: vscode.TextEditor): void {
    editor.setDecorations(this.annotationDecorationType, []);
    const previousKeys = this.appliedBackgroundKeys.get(editor);
    if (!previousKeys) {
      return;
    }

    for (const color of previousKeys) {
      editor.setDecorations(this.getBackgroundDecorationType(color), []);
    }

    this.appliedBackgroundKeys.delete(editor);
  }

  getLineInfo(uri: vscode.Uri, lineNumber: number): BlameLineInfo | undefined {
    return this.renderedLineInfo.get(uri.toString())?.get(lineNumber);
  }

  private createDecorationOption(
    document: vscode.TextDocument,
    line: BlameLineInfo,
    config: EasyGitConfig
  ):
    | {
        annotation: vscode.DecorationOptions;
        backgroundColor: string;
        backgroundRange: vscode.Range;
      }
    | undefined {
    if (line.lineNumber >= document.lineCount) {
      return undefined;
    }

    const textLine = document.lineAt(line.lineNumber);
    const range = getDecorationRange(textLine);
    if (!range) {
      return undefined;
    }

    const timestampMs = line.authorTime * 1000;
    const locale = vscode.env.language || Intl.DateTimeFormat().resolvedOptions().locale;

    return {
      annotation: {
        range,
        hoverMessage: buildHoverMessage(document.uri, line),
        renderOptions: {
          before: {
            contentText: `${getAuthorAbbreviation(line.author)} ${formatCompactTimestamp(
              timestampMs,
              config.dateFormat,
              locale
            )}`,
            color: calculateAnnotationColor(timestampMs, config.colorScheme),
            margin: "0 1ch 0 0",
            width: ANNOTATION_WIDTH,
            textDecoration: "none; opacity: 0.95;"
          }
        }
      },
      backgroundColor: calculateLineBackground(timestampMs, config.colorScheme),
      backgroundRange: range
    };
  }

  private maybeShowSkipReason(
    editor: vscode.TextEditor,
    reason: string,
    code: "not-file" | "not-in-repo" | "too-large" | "git-error"
  ): void {
    if (editor !== vscode.window.activeTextEditor) {
      return;
    }

    if (code === "not-file" || code === "not-in-repo") {
      return;
    }

    const documentKey = editor.document.uri.toString();
    if (this.skipMessages.get(documentKey) === reason) {
      return;
    }

    this.skipMessages.set(documentKey, reason);
    void vscode.window.setStatusBarMessage(`Easy Git: ${reason}`, 5000);
  }

  private applyBackgroundDecorations(
    editor: vscode.TextEditor,
    backgroundBuckets: Map<string, vscode.Range[]>
  ): void {
    const nextKeys = new Set<string>();

    for (const [color, ranges] of backgroundBuckets) {
      const decorationType = this.getBackgroundDecorationType(color);
      editor.setDecorations(decorationType, ranges);
      nextKeys.add(color);
    }

    const previousKeys = this.appliedBackgroundKeys.get(editor) ?? new Set<string>();
    for (const color of previousKeys) {
      if (!nextKeys.has(color)) {
        editor.setDecorations(this.getBackgroundDecorationType(color), []);
      }
    }

    this.appliedBackgroundKeys.set(editor, nextKeys);
  }

  private getBackgroundDecorationType(color: string): vscode.TextEditorDecorationType {
    let decorationType = this.backgroundDecorationTypes.get(color);
    if (!decorationType) {
      decorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: color
      });
      this.backgroundDecorationTypes.set(color, decorationType);
    }

    return decorationType;
  }
}

function getDecorationRange(textLine: vscode.TextLine): vscode.Range | undefined {
  if (textLine.text.length > 0) {
    return new vscode.Range(textLine.range.start, textLine.range.start.translate(0, 1));
  }

  if (!textLine.rangeIncludingLineBreak.isEmpty) {
    return textLine.rangeIncludingLineBreak;
  }

  return undefined;
}

function buildHoverMessage(documentUri: vscode.Uri, line: BlameLineInfo): vscode.MarkdownString {
  const markdown = new vscode.MarkdownString(undefined, true);
  markdown.isTrusted = true;
  markdown.appendMarkdown(`**提交者**：${escapeMarkdown(line.author)} ${escapeMarkdown(line.authorMail)}  \n`);
  markdown.appendMarkdown(`**提交时间**：${formatFullDateTime(line.authorTime * 1000)}  \n`);
  markdown.appendMarkdown(`**提交哈希**：\`${line.shortCommitHash}\`  \n`);
  markdown.appendMarkdown(`**提交信息**：${escapeMarkdown(line.summary || "(无提交标题)")}  \n`);

  if (!line.isUncommitted) {
    const commandArgs = encodeURIComponent(JSON.stringify([documentUri.toString(), line.commitHash]));
    markdown.appendMarkdown(
      `[查看提交详情](command:${COMMAND_OPEN_COMMIT_DETAILS}?${commandArgs})`
    );
  } else {
    markdown.appendMarkdown("_尚未提交的修改_");
  }

  return markdown;
}

function getAuthorAbbreviation(author: string): string {
  const trimmed = author.trim();
  if (!trimmed) {
    return "??";
  }

  const segments = trimmed.split(/[\s_-]+/).filter(Boolean);
  if (segments.length >= 2) {
    return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

function escapeMarkdown(value: string): string {
  return value.replace(/([\\`*_{}[\]()#+\-.!])/g, "\\$1");
}
