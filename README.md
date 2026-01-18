# ds - Dotfiles & Setup Manager

A CLI tool to manage dotfiles and configurations across machines. Sync configs between your system and this git repo using symlinks.

## Features

- **Cross-platform** - macOS + Arch Linux support
- **Symlinks** - Edits on system auto-sync to repo
- **Bidirectional** - Import from system or export to system
- **Safe** - Backs up files before overwriting
- **Git integration** - Stage, commit, push from CLI
- **Relocate** - Fix symlinks after moving the repo

## Installation

```bash
# From inside the repo
bun install

# Link globally
bun link

# Now available as `ds`
ds
```

## Commands

| Command | Description |
|---------|-------------|
| `ds` | Interactive menu |
| `ds sync` | Interactive sync (select configs + direction) |
| `ds import` | Import from system to repo |
| `ds export` | Export from repo to system (symlinks) |
| `ds deps` | Install oh-my-zsh, brew/pacman packages |
| `ds status` | Show status of tracked configs |
| `ds push` | Git add, commit, push |
| `ds relocate` | Update symlinks after moving repo |

## Managed Configs

| Config | System Path | Description |
|--------|-------------|-------------|
| zshrc | `~/.zshrc` | Zsh configuration |
| bashrc | `~/.bashrc` | Bash configuration |
| OpenCode | `~/.config/opencode/` | OpenCode settings, commands, agents |
| Claude | `~/.claude/` | Claude Code settings |
| Ghostty | `~/Library/Application Support/com.mitchellh.ghostty/config` (macOS) | Terminal config |
| SSH | `~/.ssh/config` | SSH host configurations |
| Packages | `Brewfile` / `packages.txt` | Package lists for brew/pacman |

## Workflow

### New Machine Setup

```bash
# 1. Install bun (if needed)
curl -fsSL https://bun.sh/install | bash

# 2. Install and link
bun install && bun link

# 3. Export configs (creates symlinks)
ds export

# 4. Install dependencies
ds deps
```

### Daily Usage

```bash
# Edit configs normally (e.g., ~/.zshrc)
# Changes automatically tracked in repo via symlinks

# Push changes to git
ds push
```

### After Moving the Repo

```bash
# Example: move the repo somewhere else
mv ~/Git/setup ~/dotfiles
cd ~/dotfiles

# Update all symlinks to new location
ds relocate
```

## Project Structure

```
setup/
├── src/                 # CLI source code
│   ├── index.ts         # Entry point
│   ├── commands/        # Command implementations
│   ├── configs/         # Config handlers
│   └── utils/           # Utilities
└── configs/             # Stored configurations
    ├── dotfiles/        # .zshrc, .bashrc
    ├── opencode/        # OpenCode configs
    ├── claude/          # Claude configs
    ├── ghostty/         # Ghostty config
    ├── ssh/             # SSH config
    ├── Brewfile         # macOS packages
    └── packages.txt     # Arch Linux packages
```

## Requirements

- [bun](https://bun.sh) - JavaScript runtime
- macOS or Arch Linux
