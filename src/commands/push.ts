import * as p from "@clack/prompts";
import {
  hasChanges,
  getGitStatus,
  stageAll,
  commit,
  push,
  getCurrentBranch,
  getStagedFiles,
  getModifiedFiles,
  getUntrackedFiles,
} from "../utils/git";

export async function pushCommand() {
  p.intro("Git Push");

  // Check if there are any changes
  const staged = await getStagedFiles();
  const modified = await getModifiedFiles();
  const untracked = await getUntrackedFiles();

  const hasUncommitted = staged.length > 0 || modified.length > 0 || untracked.length > 0;

  if (!hasUncommitted) {
    p.log.info("No changes to commit");
    
    // Check if we can push existing commits
    const branch = await getCurrentBranch();
    const shouldPush = await p.confirm({
      message: `Push existing commits on '${branch}'?`,
      initialValue: true,
    });

    if (!p.isCancel(shouldPush) && shouldPush) {
      const spinner = p.spinner();
      spinner.start("Pushing...");
      
      const result = await push();
      
      if (result.success) {
        spinner.stop("Pushed to remote");
      } else {
        spinner.stop(`Push failed: ${result.message}`);
      }
    }

    p.outro("Done");
    return;
  }

  // Show current status
  p.log.info("Changes:");
  
  if (staged.length > 0) {
    p.log.message(`Staged (${staged.length}):\n${staged.map(f => `  + ${f}`).join("\n")}`);
  }
  if (modified.length > 0) {
    p.log.message(`Modified (${modified.length}):\n${modified.map(f => `  M ${f}`).join("\n")}`);
  }
  if (untracked.length > 0) {
    p.log.message(`Untracked (${untracked.length}):\n${untracked.map(f => `  ? ${f}`).join("\n")}`);
  }

  console.log("");

  // Ask to stage all
  if (modified.length > 0 || untracked.length > 0) {
    const shouldStage = await p.confirm({
      message: "Stage all changes?",
      initialValue: true,
    });

    if (p.isCancel(shouldStage)) {
      p.cancel("Cancelled");
      return;
    }

    if (shouldStage) {
      await stageAll();
      p.log.success("All changes staged");
    }
  }

  // Get commit message
  const message = await p.text({
    message: "Commit message",
    placeholder: "Update configs",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Commit message is required";
      }
    },
  });

  if (p.isCancel(message)) {
    p.cancel("Cancelled");
    return;
  }

  // Commit
  const spinner = p.spinner();
  spinner.start("Committing...");
  
  const commitSuccess = await commit(message);
  
  if (!commitSuccess) {
    spinner.stop("Commit failed");
    p.outro("Done");
    return;
  }

  spinner.stop("Committed");

  // Push
  const shouldPush = await p.confirm({
    message: "Push to remote?",
    initialValue: true,
  });

  if (p.isCancel(shouldPush) || !shouldPush) {
    p.outro("Done");
    return;
  }

  spinner.start("Pushing...");
  
  const pushResult = await push();
  
  if (pushResult.success) {
    spinner.stop("Pushed to remote");
  } else {
    spinner.stop(`Push failed: ${pushResult.message}`);
  }

  p.outro("Done");
}
