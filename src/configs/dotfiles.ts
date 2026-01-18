import type { ConfigHandler, ConfigStatus, ImportResult, ExportResult } from "../types";
import { systemPaths, repoPaths, contractHome } from "../utils/paths";
import {
  exists,
  isSymlink,
  getSymlinkTarget,
  copyFile,
  createSymlinkWithBackup,
  ensureParentDir,
  getFileDiff,
} from "../utils/fs";
import { REPO_ROOT } from "../utils/paths";

class ZshrcConfig implements ConfigHandler {
  name = "zshrc";
  description = ".zshrc - Zsh configuration";
  systemPath = systemPaths.zshrc;
  repoPath = repoPaths.zshrc;
  isDirectory = false;

  existsOnSystem(): boolean {
    return exists(this.systemPath);
  }

  existsInRepo(): boolean {
    return exists(this.repoPath);
  }

  isLinked(): boolean {
    if (!isSymlink(this.systemPath)) return false;
    const target = getSymlinkTarget(this.systemPath);
    return target === this.repoPath;
  }

  async import(): Promise<ImportResult> {
    if (!this.existsOnSystem()) {
      return { success: false, message: "~/.zshrc not found on system" };
    }

    // If it's a symlink to our repo, resolve it first
    let sourcePath = this.systemPath;
    if (isSymlink(this.systemPath)) {
      const target = getSymlinkTarget(this.systemPath);
      if (target) sourcePath = target;
    }

    ensureParentDir(this.repoPath);
    copyFile(sourcePath, this.repoPath);

    return {
      success: true,
      message: "Imported ~/.zshrc to repo",
      filesImported: [".zshrc"],
    };
  }

  async export(): Promise<ExportResult> {
    if (!this.existsInRepo()) {
      return { success: false, message: ".zshrc not found in repo" };
    }

    const backedUp = createSymlinkWithBackup(this.repoPath, this.systemPath);

    return {
      success: true,
      message: `Linked ~/.zshrc → repo`,
      backedUp: backedUp ? contractHome(backedUp) : undefined,
      linkedTo: contractHome(this.repoPath),
    };
  }

  getStatus(): ConfigStatus {
    const existsOnSystem = this.existsOnSystem();
    const existsInRepo = this.existsInRepo();
    const isLinked = this.isLinked();

    let hasDiff = false;
    if (existsOnSystem && existsInRepo && !isLinked) {
      hasDiff = getFileDiff(this.systemPath, this.repoPath);
    }

    return {
      name: this.name,
      existsOnSystem,
      existsInRepo,
      isLinked,
      hasDiff,
      linkTarget: isLinked ? getSymlinkTarget(this.systemPath) ?? undefined : undefined,
    };
  }
}

class BashrcConfig implements ConfigHandler {
  name = "bashrc";
  description = ".bashrc - Bash configuration";
  systemPath = systemPaths.bashrc;
  repoPath = repoPaths.bashrc;
  isDirectory = false;

  existsOnSystem(): boolean {
    return exists(this.systemPath);
  }

  existsInRepo(): boolean {
    return exists(this.repoPath);
  }

  isLinked(): boolean {
    if (!isSymlink(this.systemPath)) return false;
    const target = getSymlinkTarget(this.systemPath);
    return target === this.repoPath;
  }

  async import(): Promise<ImportResult> {
    if (!this.existsOnSystem()) {
      return { success: false, message: "~/.bashrc not found on system" };
    }

    let sourcePath = this.systemPath;
    if (isSymlink(this.systemPath)) {
      const target = getSymlinkTarget(this.systemPath);
      if (target) sourcePath = target;
    }

    ensureParentDir(this.repoPath);
    copyFile(sourcePath, this.repoPath);

    return {
      success: true,
      message: "Imported ~/.bashrc to repo",
      filesImported: [".bashrc"],
    };
  }

  async export(): Promise<ExportResult> {
    if (!this.existsInRepo()) {
      return { success: false, message: ".bashrc not found in repo" };
    }

    const backedUp = createSymlinkWithBackup(this.repoPath, this.systemPath);

    return {
      success: true,
      message: `Linked ~/.bashrc → repo`,
      backedUp: backedUp ? contractHome(backedUp) : undefined,
      linkedTo: contractHome(this.repoPath),
    };
  }

  getStatus(): ConfigStatus {
    const existsOnSystem = this.existsOnSystem();
    const existsInRepo = this.existsInRepo();
    const isLinked = this.isLinked();

    let hasDiff = false;
    if (existsOnSystem && existsInRepo && !isLinked) {
      hasDiff = getFileDiff(this.systemPath, this.repoPath);
    }

    return {
      name: this.name,
      existsOnSystem,
      existsInRepo,
      isLinked,
      hasDiff,
      linkTarget: isLinked ? getSymlinkTarget(this.systemPath) ?? undefined : undefined,
    };
  }
}

export const zshrcConfig = new ZshrcConfig();
export const bashrcConfig = new BashrcConfig();
