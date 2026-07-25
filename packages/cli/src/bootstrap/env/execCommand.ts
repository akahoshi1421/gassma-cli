import { spawn } from "child_process";

type ExecResult = {
  ok: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

type ExecOptions = {
  cwd?: string;
  inherit?: boolean;
};

type ExecFn = (
  command: string,
  args: string[],
  options?: ExecOptions,
) => Promise<ExecResult>;

const createDefaultExec = (): ExecFn => (command, args, options) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options?.cwd,
      stdio: options?.inherit === true ? "inherit" : "pipe",
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      resolve({ ok: false, exitCode: null, stdout, stderr: error.message });
    });
    child.on("close", (code) => {
      resolve({ ok: code === 0, exitCode: code, stdout, stderr });
    });
  });

export { createDefaultExec };
export type { ExecFn, ExecOptions, ExecResult };
