import { describe, expect, it } from "vitest";
import type {
  ExecFn,
  ExecOptions,
  ExecResult,
} from "../../../bootstrap/env/execCommand";
import { runClaspCreate } from "../../../bootstrap/env/runClaspCreate";

type Call = { command: string; args: string[]; options?: ExecOptions };

const createRecordingExec = (result: ExecResult) => {
  const calls: Call[] = [];
  const exec: ExecFn = (command, args, options) => {
    calls.push({ command, args, options });
    return Promise.resolve(result);
  };
  return { calls, exec };
};

const OK: ExecResult = { ok: true, exitCode: 0, stdout: "", stderr: "" };

describe("runClaspCreate", () => {
  it("should create a sheets-bound script when withSheets is true", async () => {
    const { calls, exec } = createRecordingExec(OK);

    await runClaspCreate(exec, {
      title: "My App",
      withSheets: true,
      rootDir: "./dist",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].command).toBe("clasp");
    expect(calls[0].args).toEqual([
      "create-script",
      "--type",
      "sheets",
      "--title",
      "My App",
      "--rootDir",
      "./dist",
    ]);
  });

  it("should create a standalone script when withSheets is false", async () => {
    const { calls, exec } = createRecordingExec(OK);

    await runClaspCreate(exec, {
      title: "My App",
      withSheets: false,
      rootDir: "./dist",
    });

    expect(calls[0].args).toContain("standalone");
    expect(calls[0].args).not.toContain("sheets");
  });

  it("should run in inherit mode within the given cwd", async () => {
    const { calls, exec } = createRecordingExec(OK);

    await runClaspCreate(exec, {
      title: "T",
      withSheets: true,
      rootDir: "./dist",
      cwd: "/work/dir",
    });

    expect(calls[0].options?.inherit).toBe(true);
    expect(calls[0].options?.cwd).toBe("/work/dir");
  });

  it("should return the exec result as is", async () => {
    const failure: ExecResult = {
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "not logged in",
    };
    const { exec } = createRecordingExec(failure);

    const result = await runClaspCreate(exec, {
      title: "T",
      withSheets: true,
      rootDir: "./dist",
    });

    expect(result).toEqual(failure);
  });
});
