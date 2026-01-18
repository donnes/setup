import type { ConfigHandler, ConfigStatus, ImportResult, ExportResult } from "../types";
import { systemPaths, repoPaths, contractHome } from "../utils/paths";
import {
  exists,
  isSymlink,
  getSymlinkTarget,
  copyDir,
  createSymlinkWithBackup,
  ensureDir,
  isDirectory,
  removeDir,
} from "../utils/fs";

class OpenCodeConfig implements ConfigHandler {
  name = "opencode";
  description = "OpenCode - ~/.config/opencode/ (opencode.json, commands, agents)";
  systemPath = systemPaths.opencode;
  repoPath = repoPaths.opencode;
  isDirectory = true;

  // Files/folders to sync (exclude node_modules, cache, etc.)
  private syncPatterns = [
    "opencode.json",
    "command",
    "agent",
    "skill",
  ];

  existsOnSystem(): boolean {
    return exists(this.systemPath) && isDirectory(this.systemPath);
  }

  existsInRepo(): boolean {
    return exists(this.repoPath) && isDirectory(this.repoPath);
  }

  isLinked(): boolean {
    if (!isSymlink(this.systemPath)) return false;
    const target = getSymlinkTarget(this.systemPath);
    return target === this.repoPath;
  }

  async import(): Promise<ImportResult> {
    if (!this.existsOnSystem()) {
      return { success: false, message: "~/.config/opencode not found on system" };
    }

    // If it's already a symlink to our repo, nothing to import
    if (this.isLinked()) {
      return { success: true, message: "Already linked to repo - no import needed" };
    }

    ensureDir(this.repoPath);

    const { readdirSync, copyFileSync, existsSync, statSync } = await import("fs");
    const { join } = await import("path");

    const filesImported: string[] = [];

    for (const pattern of this.syncPatterns) {
      const srcPath = join(this.systemPath, pattern);
      const destPath = join(this.repoPath, pattern);

      if (!existsSync(srcPath)) continue;

      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
        filesImported.push(`${pattern}/`);
      } else {
        const { dirname } = await import("path");
        ensureDir(dirname(destPath));
        copyFileSync(srcPath, destPath);
        filesImported.push(pattern);
      }
    }

    return {
      success: true,
      message: "Imported OpenCode configs to repo",
      filesImported,
    };
  }

  async export(): Promise<ExportResult> {
    if (!this.existsInRepo()) {
      return { success: false, message: "OpenCode configs not found in repo" };
    }

    // Backup existing directory if it exists and isn't a symlink
    let backedUp: string | undefined;
    if (exists(this.systemPath) && !isSymlink(this.systemPath)) {
      const backupPath = `${this.systemPath}.backup`;
      if (exists(backupPath)) {
        removeDir(backupPath);
      }
      const { renameSync } = await import("fs");
      renameSync(this.systemPath, backupPath);
      backedUp = contractHome(backupPath);
    } else if (isSymlink(this.systemPath)) {
      const { unlinkSync } = await import("fs");
      unlinkSync(this.systemPath);
    }

    // Create symlink
    const { symlinkSync } = await import("fs");
    const { dirname } = await import("path");
    ensureDir(dirname(this.systemPath));
    symlinkSync(this.repoPath, this.systemPath);

    return {
      success: true,
      message: `Linked ~/.config/opencode → repo`,
      backedUp,
      linkedTo: contractHome(this.repoPath),
    };
  }

  getStatus(): ConfigStatus {
    return {
      name: this.name,
      existsOnSystem: this.existsOnSystem(),
      existsInRepo: this.existsInRepo(),
      isLinked: this.isLinked(),
      hasDiff: false, // Directory diff is complex, skip for now
      linkTarget: this.isLinked() ? getSymlinkTarget(this.systemPath) ?? undefined : undefined,
    };
  }
}

export const opencodeConfig = new OpenCodeConfig();
