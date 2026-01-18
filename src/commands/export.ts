import * as p from "@clack/prompts";
import { configs, configGroups } from "../configs";

export async function exportCommand(selectedConfigs?: string[]) {
  p.intro("Export configs from repo to system (symlink)");

  // If no configs specified, ask user to select
  if (!selectedConfigs || selectedConfigs.length === 0) {
    const choices = Object.entries(configGroups)
      .filter(([key]) => key !== "packages") // Packages use `ds deps`
      .map(([key, group]) => ({
        value: key,
        label: group.name,
        hint: group.description,
      }));

    const selected = await p.multiselect({
      message: "Select configs to export (will create symlinks)",
      options: choices,
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled");
      return;
    }

    selectedConfigs = selected as string[];
  }

  // Get all config handlers for selected groups
  const handlersToExport: Array<{ name: string; handler: any }> = [];
  
  for (const groupKey of selectedConfigs) {
    const group = configGroups[groupKey as keyof typeof configGroups];
    if (group) {
      for (const configName of group.configs) {
        const handler = configs[configName];
        if (handler) {
          // Check if config exists in repo
          if (!handler.existsInRepo()) {
            p.log.warning(`${configName}: Not found in repo, skipping`);
            continue;
          }
          handlersToExport.push({ name: configName, handler });
        }
      }
    }
  }

  if (handlersToExport.length === 0) {
    p.log.warning("No configs to export");
    p.outro("Done");
    return;
  }

  // Confirm before proceeding (this will overwrite system files)
  const confirm = await p.confirm({
    message: `This will symlink ${handlersToExport.length} config(s) to the repo. Existing files will be backed up. Continue?`,
    initialValue: true,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Cancelled");
    return;
  }

  // Export each config
  const spinner = p.spinner();
  const results: Array<{ name: string; success: boolean; message: string; backedUp?: string }> = [];

  for (const { name, handler } of handlersToExport) {
    spinner.start(`Exporting ${name}...`);
    
    try {
      const result = await handler.export();
      results.push({ 
        name, 
        success: result.success, 
        message: result.message,
        backedUp: result.backedUp,
      });
      
      if (result.success) {
        let msg = `${name}: ${result.message}`;
        if (result.backedUp) {
          msg += ` (backup: ${result.backedUp})`;
        }
        spinner.stop(msg);
      } else {
        spinner.stop(`${name}: ${result.message}`);
      }
    } catch (error: any) {
      results.push({ name, success: false, message: error.message });
      spinner.stop(`${name}: Failed - ${error.message}`);
    }
  }

  console.log("");

  // Summary
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const backedUp = results.filter(r => r.backedUp).length;

  if (succeeded > 0) {
    p.log.success(`Exported ${succeeded} config(s)`);
  }
  if (backedUp > 0) {
    p.log.info(`Created ${backedUp} backup(s)`);
  }
  if (failed > 0) {
    p.log.error(`Failed to export ${failed} config(s)`);
  }

  p.outro("Done");
}
