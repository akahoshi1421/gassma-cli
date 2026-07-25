import { describe, expect, it } from "vitest";
import { GASSMA_LIBRARY } from "../../../bootstrap/const/gassmaLibrary";
import type { ExecFn, ExecResult } from "../../../bootstrap/env/execCommand";
import { fetchLatestLibraryVersion } from "../../../bootstrap/env/fetchLatestLibraryVersion";

const execWithStdout =
  (stdout: string): ExecFn =>
  () =>
    Promise.resolve({ ok: true, exitCode: 0, stdout, stderr: "" });

describe("fetchLatestLibraryVersion", () => {
  it("should query clasp list-versions with the library script id", async () => {
    const calls: string[][] = [];
    const exec: ExecFn = (command, args) => {
      calls.push([command, ...args]);
      return Promise.resolve({
        ok: true,
        exitCode: 0,
        stdout: "[]",
        stderr: "",
      });
    };

    await fetchLatestLibraryVersion(exec);

    expect(calls).toEqual([
      ["clasp", "list-versions", GASSMA_LIBRARY.scriptId, "--json"],
    ]);
  });

  it("should return the maximum version number as a string", async () => {
    const stdout = JSON.stringify([
      { versionNumber: 3, description: "x" },
      { versionNumber: 9, description: "y" },
      { versionNumber: 7, description: "z" },
    ]);

    await expect(
      fetchLatestLibraryVersion(execWithStdout(stdout)),
    ).resolves.toBe("9");
  });

  it("should support an object with a versions array", async () => {
    const stdout = JSON.stringify({
      versions: [{ versionNumber: 2 }, { versionNumber: 5 }],
    });

    await expect(
      fetchLatestLibraryVersion(execWithStdout(stdout)),
    ).resolves.toBe("5");
  });

  it("should fall back to the pinned version when clasp fails", async () => {
    const exec: ExecFn = () =>
      Promise.resolve({ ok: false, exitCode: 1, stdout: "", stderr: "auth" });

    await expect(fetchLatestLibraryVersion(exec)).resolves.toBe(
      GASSMA_LIBRARY.latestVersion,
    );
  });

  it("should fall back for invalid JSON output", async () => {
    await expect(
      fetchLatestLibraryVersion(execWithStdout("not json")),
    ).resolves.toBe(GASSMA_LIBRARY.latestVersion);
  });

  it("should fall back for an empty version list", async () => {
    await expect(fetchLatestLibraryVersion(execWithStdout("[]"))).resolves.toBe(
      GASSMA_LIBRARY.latestVersion,
    );
  });

  it("should ignore entries without a numeric versionNumber", async () => {
    const stdout = JSON.stringify([
      { versionNumber: "8" },
      { versionNumber: 4 },
      { other: true },
    ]);

    await expect(
      fetchLatestLibraryVersion(execWithStdout(stdout)),
    ).resolves.toBe("4");
  });
});
