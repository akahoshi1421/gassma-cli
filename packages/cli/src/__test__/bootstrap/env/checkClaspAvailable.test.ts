import { describe, expect, it } from "vitest";
import { checkClaspAvailable } from "../../../bootstrap/env/checkClaspAvailable";
import type { ExecFn, ExecResult } from "../../../bootstrap/env/execCommand";

const okResult: ExecResult = {
  ok: true,
  exitCode: 0,
  stdout: "3.3.0",
  stderr: "",
};
const ngResult: ExecResult = {
  ok: false,
  exitCode: null,
  stdout: "",
  stderr: "ENOENT",
};

describe("checkClaspAvailable", () => {
  it("should return true when clasp --version succeeds", async () => {
    const calls: string[][] = [];
    const exec: ExecFn = (command, args) => {
      calls.push([command, ...args]);
      return Promise.resolve(okResult);
    };

    await expect(checkClaspAvailable(exec)).resolves.toBe(true);
    expect(calls).toEqual([["clasp", "--version"]]);
  });

  it("should return false when clasp is not installed", async () => {
    const exec: ExecFn = () => Promise.resolve(ngResult);

    await expect(checkClaspAvailable(exec)).resolves.toBe(false);
  });
});
