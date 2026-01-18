import * as p from "@clack/prompts";
import { exec, execLive, commandExists } from "../utils/shell";
import { exists } from "../utils/fs";
import { systemPaths, repoPaths } from "../utils/paths";
import { isMacOS, isArch, getPackageManager, getPlatformName } from "../utils/platform";

export async function depsCommand() {
  p.intro("Install Dependencies");

  p.log.info(`Platform: ${getPlatformName()}`);

  const spinner = p.spinner();

  // 1. Check/install oh-my-zsh
  spinner.start("Checking oh-my-zsh...");
  
  if (exists(systemPaths.ohmyzsh)) {
    spinner.stop("oh-my-zsh: Already installed");
  } else {
    spinner.stop("oh-my-zsh: Not installed");
    
    const installOmz = await p.confirm({
      message: "Install oh-my-zsh?",
      initialValue: true,
    });

    if (!p.isCancel(installOmz) && installOmz) {
      spinner.start("Installing oh-my-zsh...");
      const result = await exec(
        'sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended'
      );
      
      if (result.success) {
        spinner.stop("oh-my-zsh: Installed");
      } else {
        spinner.stop("oh-my-zsh: Installation failed");
        p.log.error(result.stderr);
      }
    }
  }

  // 2. Install packages from Brewfile or packages.txt
  const pm = getPackageManager();

  if (isMacOS && pm === "brew") {
    await installBrewPackages(spinner);
  } else if (isArch() && (pm === "yay" || pm === "pacman")) {
    await installArchPackages(spinner, pm);
  } else if (isMacOS && !pm) {
    p.log.warning("Homebrew not installed. Install from https://brew.sh");
  } else {
    p.log.warning("No supported package manager found");
  }

  // 3. Check zsh dependencies
  console.log("");
  spinner.start("Checking zsh dependencies...");
  
  const zshDeps = [
    { name: "fnm", command: "fnm" },
    { name: "zoxide", command: "zoxide" },
    { name: "atuin", command: "atuin" },
    { name: "eza", command: "eza" },
    { name: "lazygit", command: "lazygit" },
  ];

  const depStatus: string[] = [];
  
  for (const dep of zshDeps) {
    const installed = await commandExists(dep.command);
    depStatus.push(`${installed ? "✓" : "✗"} ${dep.name}`);
  }

  spinner.stop("Zsh dependencies:");
  p.log.message(depStatus.join("\n"));

  // 4. Check if bun is installed
  const bunInstalled = await commandExists("bun");
  if (!bunInstalled) {
    console.log("");
    const installBun = await p.confirm({
      message: "bun is not installed. Install it?",
      initialValue: true,
    });

    if (!p.isCancel(installBun) && installBun) {
      spinner.start("Installing bun...");
      const result = await exec("curl -fsSL https://bun.sh/install | bash");
      if (result.success) {
        spinner.stop("bun: Installed (restart shell to use)");
      } else {
        spinner.stop("bun: Installation failed");
      }
    }
  }

  p.outro("Done");
}

async function installBrewPackages(spinner: ReturnType<typeof p.spinner>) {
  const brewfilePath = repoPaths.brewfile;
  
  if (!exists(brewfilePath)) {
    p.log.warning("Brewfile not found in repo. Run 'ds import' first to generate it.");
    return;
  }

  const confirm = await p.confirm({
    message: "Install packages from Brewfile?",
    initialValue: true,
  });

  if (p.isCancel(confirm) || !confirm) {
    return;
  }

  spinner.start("Installing Homebrew packages...");
  
  const result = await exec(`brew bundle install --file="${brewfilePath}"`);
  
  if (result.success) {
    spinner.stop("Homebrew packages: Installed");
  } else {
    spinner.stop("Homebrew packages: Some installations failed");
    if (result.stderr) {
      p.log.warning(result.stderr);
    }
  }
}

async function installArchPackages(
  spinner: ReturnType<typeof p.spinner>,
  pm: "yay" | "pacman"
) {
  const packagesPath = repoPaths.packages;
  
  if (!exists(packagesPath)) {
    p.log.warning("packages.txt not found in repo. Run 'ds import' first to generate it.");
    return;
  }

  const confirm = await p.confirm({
    message: `Install packages from packages.txt using ${pm}?`,
    initialValue: true,
  });

  if (p.isCancel(confirm) || !confirm) {
    return;
  }

  spinner.start(`Installing packages with ${pm}...`);

  // Read packages file and filter comments
  const { readFileSync } = await import("fs");
  const content = readFileSync(packagesPath, "utf-8");
  const packages = content
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("#"));

  if (packages.length === 0) {
    spinner.stop("No packages to install");
    return;
  }

  const packageList = packages.join(" ");
  const command = pm === "yay"
    ? `yay -S --needed --noconfirm ${packageList}`
    : `sudo pacman -S --needed --noconfirm ${packageList}`;

  const result = await exec(command);
  
  if (result.success) {
    spinner.stop(`Packages: Installed ${packages.length} package(s)`);
  } else {
    spinner.stop("Packages: Some installations failed");
    if (result.stderr) {
      p.log.warning(result.stderr);
    }
  }
}
