export type ColorScheme = "blue" | "green" | "purple";
export type DateFormat = "relative" | "absolute";
export type DisplayLanguage = "auto" | "zh-CN" | "en";

export interface EasyGitConfig {
  enabled: boolean;
  colorScheme: ColorScheme;
  dateFormat: DateFormat;
  maxLineCount: number;
  cacheTimeout: number;
  maxAnnotationWidth: number;
  uncommittedColor: string;
  language: DisplayLanguage;
}

export interface BlameLineInfo {
  lineNumber: number;
  commitHash: string;
  shortCommitHash: string;
  author: string;
  authorMail: string;
  authorTime: number;
  summary: string;
  isUncommitted: boolean;
}

export interface BlameResult {
  repoRoot: string;
  filePath: string;
  lines: BlameLineInfo[];
  generatedAt: number;
  fromDirtyContent: boolean;
}

export type BlameLookupResult =
  | {
      kind: "ok";
      blame: BlameResult;
    }
  | {
      kind: "skip";
      code: "not-file" | "not-in-repo" | "too-large" | "git-error";
      reason: string;
    };
