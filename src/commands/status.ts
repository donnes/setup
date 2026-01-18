import * as p from "@clack/prompts";
import { getAllConfigs, configGroups } from "../configs";
import { getPlatformName, getPackageManager } from "../utils/platform";
import { contractHome, REPO_ROOT } from "../utils/paths";
import { hasChanges, getGitStatus } from "../utils/git";

export async function statusCommand() {
  p.intro("Status");

  // Platform info
  p.log.info(`Platform: ${getPlatformName()}`);
  p.log.info(`Package manager: ${getPackageManager() ?? "none"}`);
  p.log.info(`Repo: ${contractHome(REPO_ROOT)}`);

  console.log("");

  // Config status
  const configs = getAllConfigs();
  
  const statusLines: string[] = [];
  
  for (const config of configs) {
    const status = config.getStatus();
    
    let icon: string;
    let statusText: string;

    if (status.isLinked) {
      icon = "🔗";
      statusText = "linked";
    } else if (status.existsInRepo && status.existsOnSystem) {
      if (status.hasDiff) {
        icon = "⚠️";
        statusText = "differs";
      } else {
        icon = "✓";
        statusText = "synced";
      }
    } else if (status.existsInRepo && !status.existsOnSystem) {
      icon = "📦";
      statusText = "in repo only";
    } else if (!status.existsInRepo && status.existsOnSystem) {
      icon = "💻";
      statusText = "on system only";
    } else {
      icon = "○";
      statusText = "not found";
    }

    statusLines.push(`${icon} ${config.name.padEnd(12)} ${statusText}`);
  }

  p.log.message(statusLines.join("\n"));

  console.log("");

  // Git status
  if (await hasChanges()) {
    p.log.warning("Git: Uncommitted changes");
    const gitStatus = await getGitStatus();
    if (gitStatus) {
      console.log(gitStatus.split("\n").map(l => `   ${l}`).join("\n"));
    }
  } else {
    p.log.success("Git: Clean");
  }

  p.outro("Done");
}
