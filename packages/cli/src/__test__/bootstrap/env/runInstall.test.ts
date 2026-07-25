import { describe, expect, it } from "vitest";
import type {
  ExecFn,
  ExecOptions,
  ExecResult,
} from "../../../bootstrap/env/execCommand";
import { runInstall } from "../../../bootstrap/env/runInstall";

type Call = { command: string; args: string[]; options?: ExecOptions };

describe("runInstall", () => {
  it("should run the resolved install command in the given cwd with inherited stdio", async () => {
    const calls: Call[] = [];
    const exec: ExecFn = (command, args, options) => {
      calls.push({ command, args, options });
      return Promise.resolve({ ok: true, exitCode: 0, stdout: "", stderr: "" });
    };

    await runInstall(exec, "pnpm", "/work/dir");

    expect(calls).toEqual([
      {
        command: "pnpm",
        args: ["i"],
        options: { cwd: "/work/dir", inherit: true },
      },
    ]);
  });

  it("should run yarn install for yarn", async () => {
    const calls: Call[] = [];
    const exec: ExecFn = (command, args, options) => {
      calls.push({ command, args, options });
      return Promise.resolve({ ok: true, exitCode: 0, stdout: "", stderr: "" });
    };

    await runInstall(exec, "yarn", "/work/dir");

    expect(calls).toEqual([
      {
        command: "yarn",
        args: ["install"],
        options: { cwd: "/work/dir", inherit: true },
      },
    ]);
  });

  it("should return the exec result", async () => {
    const failure: ExecResult = {
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "network error",
    };
    const exec: ExecFn = () => Promise.resolve(failure);

    await expect(runInstall(exec, "npm", "/w")).resolves.toEqual(failure);
  });
});
