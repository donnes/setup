# AGENTS.md

This repository is a Bun + TypeScript CLI for managing dotfiles and configs.
It focuses on safe file operations, symlink management, and small interactive
workflows using @clack/prompts.

## Quick facts
- Runtime: Bun
- Language: TypeScript (ES modules)
- Entry point: src/index.ts (shebang: `#!/usr/bin/env bun`)
- OS targets: macOS + Arch Linux
- Package manager: bun

## Commands (build / lint / test)
- Install dependencies: `bun install`
- Run CLI in dev mode: `bun run src/index.ts`
- Run CLI via script: `bun run dev`
- Link the CLI globally: `bun link`
- CLI usage help: `ds --help`

Notes
- There is no lint script defined in `package.json`.
- There is no test runner configured in this repo.
- There is no build script defined; the CLI runs directly from `src/` with Bun.

## Single-test guidance
- No test framework is configured, so there is no "single test" command.
- If you add tests, also add a `package.json` script and document the single-test
  usage here.

## Cursor / Copilot rules
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot rules found in `.github/copilot-instructions.md`.

## Repository structure
- `src/index.ts` is the CLI entry and interactive menu.
- `src/commands/` contains user-facing commands (sync/import/export/status/etc).
- `src/configs/` contains config handlers for each managed config group.
- `src/utils/` contains shared helpers (fs/git/paths/shell/platform).
- `configs/` stores tracked dotfiles and application configs.

## Code style guidelines

### Formatting
- Use double quotes for strings.
- Use semicolons.
- Use trailing commas in object/array literals.
- One statement per line; avoid clever one-liners.
- Keep functions small and single-purpose.
- Favor explicit spacing for readability.

### Imports
- Use ES module syntax.
- Order: external packages first, then relative imports.
- Use `import type` for types when possible.
- Prefer named imports; use `import * as p` for @clack/prompts.

### Types and interfaces
- Prefer interfaces for shared shapes (see `src/types.ts`).
- Keep union types narrow and explicit (e.g. direction: "import" | "export").
- Use `Record<string, T>` for indexed dictionaries.
- Avoid `any`; if unavoidable, keep it local and explain with context.
- Keep result types consistent (`success`, `message`, optional fields).

### Naming conventions
- File names are lowercase with dashes only when needed.
- Functions are `camelCase`.
- Classes are `PascalCase` (e.g. `OpenCodeConfig`).
- Constants are `SCREAMING_SNAKE_CASE` only for true constants.
- Keep config names aligned with `ConfigName` union values.

### Error handling
- Use `try/catch` around filesystem and shell operations.
- Return structured results (success + message) rather than throwing.
- When catching, surface a clear message for the CLI user.
- In CLI flows, cancel early on prompt cancellations.

### Async / sync usage
- Use async/await for shell calls and long-running operations.
- Synchronous fs calls are acceptable for small, controlled operations.
- Keep CLI output responsive; use spinners for long operations.

### CLI UX
- Use @clack/prompts for interactive flows.
- Always handle cancellations with `p.isCancel`.
- Use `p.intro` / `p.outro` for command boundaries.
- Keep status output short and scannable.

### Filesystem operations
- Use helpers from `src/utils/fs.ts` when available.
- Always ensure parent directories exist before writing.
- Respect symlink behavior: avoid overwriting without backups.
- For config exports, back up existing paths when not symlinked.

### Git operations
- Use helpers from `src/utils/git.ts`.
- Prefer `git -C` with `REPO_ROOT`.
- Keep git output minimal and user-friendly.

### Paths
- Use `systemPaths` and `repoPaths` from `src/utils/paths.ts`.
- Prefer `contractHome` for user-facing paths.
- Avoid hardcoding OS-specific locations.

## Adding new commands
- Place new command files in `src/commands/`.
- Export a single `*Command` function (async).
- Register in `src/index.ts` and add to the interactive menu.

## Adding new config handlers
- Implement `ConfigHandler` from `src/types.ts`.
- Add the handler to `src/configs/index.ts`.
- Update `configGroups` for interactive selection.
- Keep import/export logic symmetric and idempotent.

## Config copy/link behavior
- Import: copy files from system to repo.
- Export: create symlink from system to repo, backing up existing data.
- Avoid destructive operations without backups.

## Common pitfalls
- Do not assume a test runner exists.
- Do not add new scripts without updating this doc.
- Do not add emoji output unless already used in command output.

## When editing AGENTS.md
- Keep it around 150 lines to stay readable.
- Update command sections as scripts change.
- Document any new lint/test tools immediately.
