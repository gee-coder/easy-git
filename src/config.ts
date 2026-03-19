import * as vscode from "vscode";
import type { EasyGitConfig } from "./types";

export const EXTENSION_SECTION = "easy-git";
export const CONTEXT_ENABLED = "easyGit.enabled";

export const COMMAND_TOGGLE_BLAME = "easy-git.toggleBlame";
export const COMMAND_SHOW_BLAME = "easy-git.showBlame";
export const COMMAND_HIDE_BLAME = "easy-git.hideBlame";
export const COMMAND_OPEN_COMMIT_DETAILS = "easy-git.openCommitDetails";

export function getExtensionConfig(): EasyGitConfig {
  const configuration = vscode.workspace.getConfiguration(EXTENSION_SECTION);

  return {
    enabled: configuration.get<boolean>("enabled", false),
    colorScheme: configuration.get<EasyGitConfig["colorScheme"]>("colorScheme", "blue"),
    dateFormat: configuration.get<EasyGitConfig["dateFormat"]>("dateFormat", "relative"),
    maxLineCount: configuration.get<number>("maxLineCount", 5000),
    cacheTimeout: configuration.get<number>("cacheTimeout", 60_000)
  };
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await vscode.workspace
    .getConfiguration(EXTENSION_SECTION)
    .update("enabled", enabled, vscode.ConfigurationTarget.Global);
}

export function affectsEasyGitConfiguration(event: vscode.ConfigurationChangeEvent): boolean {
  return event.affectsConfiguration(EXTENSION_SECTION);
}

export async function updateEnabledContext(enabled: boolean): Promise<void> {
  await vscode.commands.executeCommand("setContext", CONTEXT_ENABLED, enabled);
}
