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

class NeovimConfig implements ConfigHandler {
  name = "neovim";
  description = "Neovim - ~/.config/nvim/";
  systemPath = systemPaths.neovim;
  repoPath = repoPaths.neovim;
  isDirectory = true;

  private syncPatterns = [
    "init.lua",
    "lua",
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
      return { success: false, message: "~/.config/nvim not found on system" };
    }

    if (this.isLinked()) {
      return { success: true, message: "Already linked to repo - no import needed" };
    }

    ensureDir(this.repoPath);

    const { copyFileSync, existsSync, statSync } = await import("fs");
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
        message: "No Neovim configs found to import (init.lua, lua/)",
      };
    }

    return {
      success: true,
      message: "Imported Neovim configs to repo",
      filesImported,
    };
  }

  async export(): Promise<ExportResult> {
    if (!this.existsInRepo()) {
      return { success: false, message: "Neovim configs not found in repo" };
    }

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

    const { symlinkSync } = await import("fs");
    const { dirname } = await import("path");
    ensureDir(dirname(this.systemPath));
    symlinkSync(this.repoPath, this.systemPath);

    return {
      success: true,
      message: "Linked ~/.config/nvim → repo",
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
      hasDiff: false,
      linkTarget: this.isLinked() ? getSymlinkTarget(this.systemPath) ?? undefined : undefined,
    };
  }
}

export const neovimConfig = new NeovimConfig();
