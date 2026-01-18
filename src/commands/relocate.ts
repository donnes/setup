import * as p from "@clack/prompts";
import { getAllSymlinksToRepo, createSymlink, getSymlinkTarget } from "../utils/fs";
import { REPO_ROOT, contractHome } from "../utils/paths";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const REPO_PATH_FILE = join(REPO_ROOT, ".repo-path");

export async function relocateCommand() {
  p.intro("Relocate Symlinks");

  const currentRepoPath = REPO_ROOT;
  p.log.info(`Current repo location: ${contractHome(currentRepoPath)}`);

  // Check if we have a stored previous path
  let previousPath: string | null = null;
  
  if (existsSync(REPO_PATH_FILE)) {
    previousPath = readFileSync(REPO_PATH_FILE, "utf-8").trim();
  }

  // Find all symlinks pointing to the repo (or previous repo location)
  const symlinks = getAllSymlinksToRepo();

  if (symlinks.length === 0 && !previousPath) {
    p.log.info("No symlinks found pointing to this repo");
    p.log.info("Saving current repo path for future relocations...");
    saveRepoPath(currentRepoPath);
    p.outro("Done");
    return;
  }

  // Check if previous path differs from current
  if (previousPath && previousPath !== currentRepoPath) {
    p.log.warning(`Previous repo location: ${contractHome(previousPath)}`);
    p.log.info(`New repo location: ${contractHome(currentRepoPath)}`);

    // Find symlinks that need updating (pointing to old location)
    const { systemPaths } = await import("../utils/paths");
    const pathsToCheck = [
      systemPaths.zshrc,
      systemPaths.bashrc,
      systemPaths.opencode,
      systemPaths.claude,
      systemPaths.ghostty,
      systemPaths.ssh,
    ];

    const symlinksToUpdate: Array<{ linkPath: string; oldTarget: string; newTarget: string }> = [];

    for (const linkPath of pathsToCheck) {
      const target = getSymlinkTarget(linkPath);
      if (target && target.startsWith(previousPath)) {
        const newTarget = target.replace(previousPath, currentRepoPath);
        symlinksToUpdate.push({ linkPath, oldTarget: target, newTarget });
      }
    }

    if (symlinksToUpdate.length === 0) {
      p.log.info("No symlinks need updating");
      saveRepoPath(currentRepoPath);
      p.outro("Done");
      return;
    }

    // Show what will be updated
    p.log.message("Symlinks to update:");
    for (const { linkPath, newTarget } of symlinksToUpdate) {
      console.log(`  ${contractHome(linkPath)} → ${contractHome(newTarget)}`);
    }

    console.log("");

    const confirm = await p.confirm({
      message: `Update ${symlinksToUpdate.length} symlink(s)?`,
      initialValue: true,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel("Cancelled");
      return;
    }

    // Update symlinks
    const spinner = p.spinner();
    spinner.start("Updating symlinks...");

    let updated = 0;
    let failed = 0;

    for (const { linkPath, newTarget } of symlinksToUpdate) {
      try {
        createSymlink(newTarget, linkPath);
        updated++;
      } catch (error) {
        failed++;
        p.log.error(`Failed to update ${contractHome(linkPath)}: ${error}`);
      }
    }

    spinner.stop(`Updated ${updated} symlink(s)${failed > 0 ? `, ${failed} failed` : ""}`);

    // Save new repo path
    saveRepoPath(currentRepoPath);

  } else if (symlinks.length > 0) {
    // No previous path stored but we have symlinks
    p.log.success(`Found ${symlinks.length} symlink(s) pointing to this repo:`);
    for (const { linkPath } of symlinks) {
      console.log(`  ${contractHome(linkPath)}`);
    }
    
    saveRepoPath(currentRepoPath);
  } else {
    // Save current path for future reference
    saveRepoPath(currentRepoPath);
    p.log.info("Saved repo path for future relocations");
  }

  p.outro("Done");
}

function saveRepoPath(path: string) {
  writeFileSync(REPO_PATH_FILE, path + "\n");
}
