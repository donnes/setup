import { zshrcConfig, bashrcConfig } from "./dotfiles";
import { opencodeConfig } from "./opencode";
import { claudeConfig } from "./claude";
import { ghosttyConfig } from "./ghostty";
import { sshConfig } from "./ssh";
import { packagesConfig } from "./packages";
import type { ConfigHandler, ConfigName } from "../types";

export const configs: Record<string, ConfigHandler> = {
  zshrc: zshrcConfig,
  bashrc: bashrcConfig,
  opencode: opencodeConfig,
  claude: claudeConfig,
  ghostty: ghosttyConfig,
  ssh: sshConfig,
  packages: packagesConfig,
};

export const configGroups = {
  dotfiles: {
    name: "Dotfiles",
    description: ".zshrc, .bashrc",
    configs: ["zshrc", "bashrc"],
  },
  opencode: {
    name: "OpenCode",
    description: "~/.config/opencode/",
    configs: ["opencode"],
  },
  claude: {
    name: "Claude Code",
    description: "~/.claude/",
    configs: ["claude"],
  },
  ghostty: {
    name: "Ghostty",
    description: "Terminal emulator config",
    configs: ["ghostty"],
  },
  ssh: {
    name: "SSH",
    description: "~/.ssh/config",
    configs: ["ssh"],
  },
  packages: {
    name: "Packages",
    description: "Brewfile / packages.txt",
    configs: ["packages"],
  },
};

export function getConfig(name: string): ConfigHandler | undefined {
  return configs[name];
}

export function getAllConfigs(): ConfigHandler[] {
  return Object.values(configs);
}

export function getConfigsByGroup(groupName: string): ConfigHandler[] {
  const group = configGroups[groupName as keyof typeof configGroups];
  if (!group) return [];
  return group.configs.map(name => configs[name]).filter(Boolean);
}

export { zshrcConfig, bashrcConfig, opencodeConfig, claudeConfig, ghosttyConfig, sshConfig, packagesConfig };
