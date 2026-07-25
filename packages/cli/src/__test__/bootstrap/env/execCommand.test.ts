import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDefaultExec } from "../../../bootstrap/env/execCommand";

describe("createDefaultExec", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-exec-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should capture stdout of a successful command", async () => {
    const exec = createDefaultExec();

    const result = await exec(process.execPath, ["-e", "console.log('hi')"]);

    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hi");
  });

  it("should capture stderr and report a non-zero exit code", async () => {
    const exec = createDefaultExec();

    const result = await exec(process.execPath, [
      "-e",
      "console.error('boom'); process.exit(3)",
    ]);

    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(3);
    expect(result.stderr).toContain("boom");
  });

  it("should resolve with ok false when the command does not exist", async () => {
    const exec = createDefaultExec();

    const result = await exec("definitely-not-a-command-gassma", []);

    expect(result.ok).toBe(false);
  });

  it("should run the command in the given cwd", async () => {
    const exec = createDefaultExec();

    const result = await exec(
      process.execPath,
      ["-e", "console.log(process.cwd())"],
      { cwd: tmpDir },
    );

    expect(result.stdout.trim()).toBe(fs.realpathSync(tmpDir));
  });

  it("should not capture output in inherit mode", async () => {
    const exec = createDefaultExec();

    const result = await exec(process.execPath, ["-e", "process.exit(0)"], {
      inherit: true,
    });

    expect(result.ok).toBe(true);
    expect(result.stdout).toBe("");
  });
});
