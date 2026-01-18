import { $ } from "bun";

export interface ExecResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function exec(command: string): Promise<ExecResult> {
  try {
    const result = await $`sh -c ${command}`.quiet();
    return {
      success: result.exitCode === 0,
      stdout: result.stdout.toString().trim(),
      stderr: result.stderr.toString().trim(),
      exitCode: result.exitCode,
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout?.toString().trim() ?? "",
      stderr: error.stderr?.toString().trim() ?? error.message,
      exitCode: error.exitCode ?? 1,
    };
  }
}

export async function execLive(command: string): Promise<boolean> {
  try {
    const result = await $`sh -c ${command}`;
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

export async function commandExists(command: string): Promise<boolean> {
  const result = await exec(`which ${command}`);
  return result.success;
}
