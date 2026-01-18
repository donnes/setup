import type { ConfigHandler, ConfigStatus, ImportResult, ExportResult } from "../types";
import { systemPaths, repoPaths, contractHome } from "../utils/paths";
import {
  exists,
  isSymlink,
  getSymlinkTarget,
  copyDir,
  ensureDir,
  isDirectory,
  removeDir,
} from "../utils/fs";

class ClaudeConfig implements ConfigHandler {
  name = "claude";
  description = "Claude Code - ~/.claude/ (settings, commands)";
  systemPath = systemPaths.claude;
  repoPath = repoPaths.claude;
  isDirectory = true;

  // Files/folders to sync (exclude cache, history, etc.)
  private syncPatterns = [
    "settings.json",
    "CLAUDE.md",
    "commands",
    "skills",
  ];

  existsOnSystem(): boolean {
    return exists(this.systemPath) && isDirectory(this.systemPath);
  }

  existsInRepo(): boolean {
    return exists(this.repoPath) && isDirectory(this.repoPath);
  }

  isLinked(): boolean {
    // Claude directory shouldn't be fully symlinked (has cache/history)
    // Instead check if individual config files are present in repo
    return false;
  }

  async import(): Promise<ImportResult> {
    if (!this.existsOnSystem()) {
      return { success: false, message: "~/.claude not found on system" };
    }

    ensureDir(this.repoPath);

    const { readdirSync, copyFileSync, existsSync, statSync } = await import("fs");
    const { join, dirname } = await import("path");

    const filesImported: string[] = [];

    for (const pattern of this.syncPatterns) {
      const srcPath = join(this.systemPath, pattern);
      const destPath = join(this.repoPath, pattern);

      if (!existsSync(srcPath)) continue;

      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
        filesImported.push(`${pattern}/`);
      } else {
        ensureDir(dirname(destPath));
        copyFileSync(srcPath, destPath);
        filesImported.push(pattern);
      }
    }

    if (filesImported.length === 0) {
      return {
        success: true,
        message: "No Claude configs found to import (settings.json, CLAUDE.md, commands/)",
      };
    }

    return {
      success: true,
      message: "Imported Claude configs to repo",
      filesImported,
    };
  }

  async export(): Promise<ExportResult> {
    if (!this.existsInRepo()) {
      return { success: false, message: "Claude configs not found in repo" };
    }

    // For Claude, we copy files rather than symlink the whole directory
    // because Claude stores cache/history there
    ensureDir(this.systemPath);

    const { readdirSync, copyFileSync, existsSync, statSync, unlinkSync } = await import("fs");
    const { join, dirname } = await import("path");

    const filesExported: string[] = [];

    for (const pattern of this.syncPatterns) {
      const srcPath = join(this.repoPath, pattern);
      const destPath = join(this.systemPath, pattern);

      if (!existsSync(srcPath)) continue;

      // Remove existing and copy fresh
      if (existsSync(destPath)) {
        if (statSync(destPath).isDirectory()) {
          removeDir(destPath);
        } else {
          unlinkSync(destPath);
        }
      }

      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
        filesExported.push(`${pattern}/`);
      } else {
        ensureDir(dirname(destPath));
        copyFileSync(srcPath, destPath);
        filesExported.push(pattern);
      }
    }

    return {
      success: true,
      message: `Copied Claude configs to ~/.claude/`,
      linkedTo: filesExported.join(", "),
    };
  }

  getStatus(): ConfigStatus {
    return {
      name: this.name,
      existsOnSystem: this.existsOnSystem(),
      existsInRepo: this.existsInRepo(),
      isLinked: false, // Claude uses copy, not symlink
      hasDiff: false,
    };
  }
}

export const claudeConfig = new ClaudeConfig();
