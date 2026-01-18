import * as p from "@clack/prompts";
import { configGroups } from "../configs";
import { importCommand } from "./import";
import { exportCommand } from "./export";

export async function syncCommand() {
  p.intro("Sync Configs");

  // Select configs
  const choices = Object.entries(configGroups).map(([key, group]) => ({
    value: key,
    label: group.name,
    hint: group.description,
  }));

  const selectedConfigs = await p.multiselect({
    message: "Select configs to sync",
    options: choices,
    required: true,
  });

  if (p.isCancel(selectedConfigs)) {
    p.cancel("Cancelled");
    return;
  }

  // Select direction
  const direction = await p.select({
    message: "Sync direction",
    options: [
      {
        value: "import",
        label: "Import",
        hint: "system → repo (copy files to repo)",
      },
      {
        value: "export",
        label: "Export",
        hint: "repo → system (create symlinks)",
      },
    ],
  });

  if (p.isCancel(direction)) {
    p.cancel("Cancelled");
    return;
  }

  p.outro(""); // Close intro before running sub-command

  // Run the appropriate command
  if (direction === "import") {
    await importCommand(selectedConfigs as string[]);
  } else {
    await exportCommand(selectedConfigs as string[]);
  }
}
