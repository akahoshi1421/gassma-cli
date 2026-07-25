import { describe, expect, it } from "vitest";
import { createTimedExec } from "../../debug/env/execWithTimeout";

describe("createTimedExec", () => {
  it("should capture stdout of a fast command", async () => {
    const exec = createTimedExec();

    const result = await exec(
      process.execPath,
      ["-e", "console.log('hi')"],
      5000,
    );

    expect(result.ok).toBe(true);
    expect(result.timedOut).toBe(false);
    expect(result.stdout).toContain("hi");
  });

  it("should time out a slow command and report timedOut", async () => {
    const exec = createTimedExec();

    const result = await exec(
      process.execPath,
      ["-e", "setTimeout(() => {}, 10000)"],
      200,
    );

    expect(result.ok).toBe(false);
    expect(result.timedOut).toBe(true);
  });

  it("should report a spawn failure without timing out", async () => {
    const exec = createTimedExec();

    const result = await exec("gassma-no-such-command-xyz", [], 5000);

    expect(result.ok).toBe(false);
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBe(null);
  });

  it("should report a non-zero exit as not ok with the exit code", async () => {
    const exec = createTimedExec();

    const result = await exec(
      process.execPath,
      ["-e", "process.exit(3)"],
      5000,
    );

    expect(result.ok).toBe(false);
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBe(3);
  });
});
