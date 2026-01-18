#!/usr/bin/env bun

import * as p from "@clack/prompts";
import { syncCommand } from "./commands/sync";
import { importCommand } from "./commands/import";
import { exportCommand } from "./commands/export";
import { depsCommand } from "./commands/deps";
import { statusCommand } from "./commands/status";
import { pushCommand } from "./commands/push";
import { relocateCommand } from "./commands/relocate";

const commands = {
  sync: syncCommand,
  import: importCommand,
  export: exportCommand,
  deps: depsCommand,
  status: statusCommand,
  push: pushCommand,
  relocate: relocateCommand,
};

async function main() {
  const args = process.argv.slice(2);

  // If a command is passed directly, run it
  if (args.length > 0) {
    const cmd = args[0] as keyof typeof commands;
    
    if (cmd in commands) {
      await commands[cmd]();
      return;
    }
    
    if (cmd === "help" || cmd === "--help" || cmd === "-h") {
      showHelp();
      return;
    }

    console.error(`Unknown command: ${cmd}`);
    showHelp();
    process.exit(1);
  }

  // Interactive mode
  console.clear();
  p.intro("ds - Dotfiles & Setup Manager");

  const action = await p.select({
    message: "What would you like to do?",
    options: [
      {
        value: "sync",
        label: "Sync configs",
        hint: "Interactive import/export",
      },
      {
        value: "import",
        label: "Import from system",
        hint: "Copy configs to repo",
      },
      {
        value: "export",
        label: "Export to system",
        hint: "Symlink configs from repo",
      },
      {
        value: "deps",
        label: "Install dependencies",
        hint: "oh-my-zsh, packages",
      },
      {
        value: "status",
        label: "Check status",
        hint: "Show tracked configs",
      },
      {
        value: "push",
        label: "Git push",
        hint: "Commit and push changes",
      },
      {
        value: "relocate",
        label: "Relocate",
        hint: "Update symlinks after moving repo",
      },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel("Cancelled");
    process.exit(0);
  }

  p.outro(""); // Close intro before running command

  // Run selected command
  const cmd = commands[action as keyof typeof commands];
  if (cmd) {
    await cmd();
  }
}

function showHelp() {
  console.log(`
ds - Dotfiles & Setup Manager

Usage: ds [command]

Commands:
  (none)      Interactive menu
  sync        Interactive sync (select configs + direction)
  import      Import configs from system to repo
  export      Export configs from repo to system (symlink)
  deps        Install dependencies (oh-my-zsh, packages)
  status      Show status of tracked configs
  push        Git add, commit, and push
  relocate    Update symlinks after moving repo

Examples:
  ds              # Interactive menu
  ds status       # Show status
  ds import       # Import configs
  ds export       # Export configs
  ds deps         # Install dependencies
  ds push         # Commit and push changes
  ds relocate     # Fix symlinks after moving repo
`);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
