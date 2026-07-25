import { spawn } from "child_process";
import type { ExecResult } from "../../bootstrap/env/execCommand";

type TimedExecResult = ExecResult & { timedOut: boolean };

type TimedExecFn = (
  command: string,
  args: string[],
  timeoutMs: number,
) => Promise<TimedExecResult>;

const createTimedExec = (): TimedExecFn => (command, args, timeoutMs) =>
  new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "pipe", shell: false });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (result: TimedExecResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ ok: false, exitCode: null, stdout, stderr, timedOut: true });
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr: error.message,
        timedOut: false,
      });
    });
    child.on("close", (code) => {
      finish({
        ok: code === 0,
        exitCode: code,
        stdout,
        stderr,
        timedOut: false,
      });
    });
  });

export { createTimedExec };
export type { TimedExecFn, TimedExecResult };
