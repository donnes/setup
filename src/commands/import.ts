import * as p from "@clack/prompts";
import { configs, configGroups } from "../configs";
import { stageAll, hasChanges } from "../utils/git";

export async function importCommand(selectedConfigs?: string[]) {
  p.intro("Import configs from system to repo");

  // If no configs specified, ask user to select
  if (!selectedConfigs || selectedConfigs.length === 0) {
    const choices = Object.entries(configGroups).map(([key, group]) => ({
      value: key,
      label: group.name,
      hint: group.description,
    }));

    const selected = await p.multiselect({
      message: "Select configs to import",
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
  const handlersToImport: Array<{ name: string; handler: any }> = [];
  
  for (const groupKey of selectedConfigs) {
    const group = configGroups[groupKey as keyof typeof configGroups];
    if (group) {
      for (const configName of group.configs) {
        const handler = configs[configName];
        if (handler) {
          handlersToImport.push({ name: configName, handler });
        }
      }
    }
  }

  if (handlersToImport.length === 0) {
    p.log.warning("No configs selected");
    p.outro("Done");
    return;
  }

  // Import each config
  const spinner = p.spinner();
  const results: Array<{ name: string; success: boolean; message: string }> = [];

  for (const { name, handler } of handlersToImport) {
    spinner.start(`Importing ${name}...`);
    
    try {
      const result = await handler.import();
      results.push({ name, success: result.success, message: result.message });
      
      if (result.success) {
        spinner.stop(`${name}: ${result.message}`);
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

  if (succeeded > 0) {
    p.log.success(`Imported ${succeeded} config(s)`);
  }
  if (failed > 0) {
    p.log.error(`Failed to import ${failed} config(s)`);
  }

  // Stage changes
  if (await hasChanges()) {
    const shouldStage = await p.confirm({
      message: "Stage changes in git?",
      initialValue: true,
    });

    if (!p.isCancel(shouldStage) && shouldStage) {
      await stageAll();
      p.log.success("Changes staged");
    }
  }

  p.outro("Done");
}
