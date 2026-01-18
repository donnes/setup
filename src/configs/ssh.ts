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

class SshConfig implements ConfigHandler {
  name = "ssh";
  description = "SSH - ~/.ssh/config (host configurations)";
  systemPath = systemPaths.ssh;
  repoPath = repoPaths.ssh;
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
      return { success: false, message: "~/.ssh/config not found on system" };
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
      message: "Imported SSH config to repo",
      filesImported: ["config"],
    };
  }

  async export(): Promise<ExportResult> {
    if (!this.existsInRepo()) {
      return { success: false, message: "SSH config not found in repo" };
    }

    const backedUp = createSymlinkWithBackup(this.repoPath, this.systemPath);

    return {
      success: true,
      message: `Linked ~/.ssh/config → repo`,
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

export const sshConfig = new SshConfig();
