import { homedir } from "os";
import { join, resolve, dirname } from "path";
import { isMacOS } from "./platform";

// Home directory
export const HOME = homedir();

// Repo root (where this CLI lives)
export const REPO_ROOT = resolve(dirname(dirname(dirname(import.meta.path))));

// Configs directory in repo
export const CONFIGS_DIR = join(REPO_ROOT, "configs");

// System paths - where configs live on the system
export const systemPaths = {
  zshrc: join(HOME, ".zshrc"),
  bashrc: join(HOME, ".bashrc"),
  opencode: join(HOME, ".config", "opencode"),
  claude: join(HOME, ".claude"),
  ghostty: isMacOS
    ? join(HOME, "Library", "Application Support", "com.mitchellh.ghostty", "config")
    : join(HOME, ".config", "ghostty", "config"),
  ssh: join(HOME, ".ssh", "config"),
  ohmyzsh: join(HOME, ".oh-my-zsh"),
};

// Repo paths - where configs are stored in this repo
export const repoPaths = {
  zshrc: join(CONFIGS_DIR, "dotfiles", ".zshrc"),
  bashrc: join(CONFIGS_DIR, "dotfiles", ".bashrc"),
  opencode: join(CONFIGS_DIR, "opencode"),
  claude: join(CONFIGS_DIR, "claude"),
  ghostty: join(CONFIGS_DIR, "ghostty", "config"),
  ssh: join(CONFIGS_DIR, "ssh", "config"),
  brewfile: join(CONFIGS_DIR, "Brewfile"),
  packages: join(CONFIGS_DIR, "packages.txt"),
};

// Expand ~ to home directory
export function expandHome(path: string): string {
  if (path.startsWith("~/")) {
    return join(HOME, path.slice(2));
  }
  return path;
}

// Contract home directory to ~
export function contractHome(path: string): string {
  if (path.startsWith(HOME)) {
    return "~" + path.slice(HOME.length);
  }
  return path;
}
