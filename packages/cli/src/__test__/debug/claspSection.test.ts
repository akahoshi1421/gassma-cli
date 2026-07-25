import path from "path";
import { describe, expect, it } from "vitest";
import type { DebugFs } from "../../debug/env/debugFs";
import type { TimedExecFn } from "../../debug/env/execWithTimeout";
import {
  buildClaspLines,
  collectClaspStatus,
  maskScriptId,
} from "../../debug/sections/claspSection";
import { createStyler } from "../../debug/styles";

const plain = createStyler(false);

const fakeFs = (files: Record<string, string>): DebugFs => ({
  exists: (filePath) => filePath in files,
  readText: (filePath) => {
    const content = files[filePath];
    if (content === undefined) throw new Error(`missing: ${filePath}`);
    return content;
  },
  mtimeMs: () => undefined,
});

const okExec =
  (stdout: string): TimedExecFn =>
  (_command, _args, _timeoutMs) =>
    Promise.resolve({
      ok: true,
      exitCode: 0,
      stdout,
      stderr: "",
      timedOut: false,
    });

const baseDeps = {
  homedir: "/home/user",
  cwd: "/proj",
  timeoutMs: 3000,
};

describe("collectClaspStatus", () => {
  it("should run clasp -v and pick the version from stdout", async () => {
    const calls: { command: string; args: string[]; timeoutMs: number }[] = [];
    const exec: TimedExecFn = (command, args, timeoutMs) => {
      calls.push({ command, args, timeoutMs });
      return Promise.resolve({
        ok: true,
        exitCode: 0,
        stdout: "3.3.0\n",
        stderr: "",
        timedOut: false,
      });
    };

    const status = await collectClaspStatus({
      ...baseDeps,
      exec,
      fs: fakeFs({}),
    });

    expect(calls).toEqual([
      { command: "clasp", args: ["-v"], timeoutMs: 3000 },
    ]);
    expect(status.version).toEqual({ kind: "found", version: "3.3.0" });
  });

  it("should report timedOut when clasp -v times out", async () => {
    const exec: TimedExecFn = () =>
      Promise.resolve({
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: "",
        timedOut: true,
      });

    const status = await collectClaspStatus({
      ...baseDeps,
      exec,
      fs: fakeFs({}),
    });

    expect(status.version).toEqual({ kind: "timedOut" });
  });

  it("should report notFound when clasp cannot be spawned", async () => {
    const exec: TimedExecFn = () =>
      Promise.resolve({
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: "spawn clasp ENOENT",
        timedOut: false,
      });

    const status = await collectClaspStatus({
      ...baseDeps,
      exec,
      fs: fakeFs({}),
    });

    expect(status.version).toEqual({ kind: "notFound" });
  });

  it("should report failed when clasp -v exits with a non-zero code", async () => {
    const exec: TimedExecFn = () =>
      Promise.resolve({
        ok: false,
        exitCode: 1,
        stdout: "",
        stderr: "boom",
        timedOut: false,
      });

    const status = await collectClaspStatus({
      ...baseDeps,
      exec,
      fs: fakeFs({}),
    });

    expect(status.version).toEqual({ kind: "failed" });
  });

  it("should detect login by the existence of ~/.clasprc.json without reading it", async () => {
    const clasprcPath = path.join("/home/user", ".clasprc.json");
    const store = fakeFs({ [clasprcPath]: "SECRET" });
    const readPaths: string[] = [];
    const spyFs: DebugFs = {
      ...store,
      readText: (filePath) => {
        readPaths.push(filePath);
        return store.readText(filePath);
      },
    };

    const status = await collectClaspStatus({
      ...baseDeps,
      exec: okExec("3.3.0"),
      fs: spyFs,
    });

    expect(status.loggedIn).toBe(true);
    expect(readPaths).not.toContain(clasprcPath);
  });

  it("should report not logged in when ~/.clasprc.json is missing", async () => {
    const status = await collectClaspStatus({
      ...baseDeps,
      exec: okExec("3.3.0"),
      fs: fakeFs({}),
    });

    expect(status.loggedIn).toBe(false);
  });

  it("should read rootDir and scriptId from .clasp.json in the cwd", async () => {
    const claspJsonPath = path.join("/proj", ".clasp.json");
    const status = await collectClaspStatus({
      ...baseDeps,
      exec: okExec("3.3.0"),
      fs: fakeFs({
        [claspJsonPath]: JSON.stringify({
          scriptId: "1CpxmbnFDga5jHgY7GPGQxcD41nNvygrAJ8d6hXtAI0nn",
          rootDir: "./dist",
        }),
      }),
    });

    expect(status.project).toEqual({
      exists: true,
      rootDir: "./dist",
      scriptId: "1CpxmbnFDga5jHgY7GPGQxcD41nNvygrAJ8d6hXtAI0nn",
    });
  });

  it("should report a missing .clasp.json", async () => {
    const status = await collectClaspStatus({
      ...baseDeps,
      exec: okExec("3.3.0"),
      fs: fakeFs({}),
    });

    expect(status.project).toEqual({ exists: false });
  });

  it("should report an unparsable .clasp.json", async () => {
    const claspJsonPath = path.join("/proj", ".clasp.json");
    const status = await collectClaspStatus({
      ...baseDeps,
      exec: okExec("3.3.0"),
      fs: fakeFs({ [claspJsonPath]: "{ broken" }),
    });

    expect(status.project).toEqual({ exists: true, parseError: true });
  });
});

describe("maskScriptId", () => {
  it("should keep only the first four characters", () => {
    expect(maskScriptId("1CpxmbnFDga5jHgY7GPGQ")).toBe("1Cpx…");
  });

  it("should not reveal a short id beyond its first four characters", () => {
    expect(maskScriptId("1Cp")).toBe("1Cp…");
  });
});

describe("buildClaspLines", () => {
  it("should render a fully working environment", () => {
    const lines = buildClaspLines(
      {
        version: { kind: "found", version: "3.3.0" },
        loggedIn: true,
        project: {
          exists: true,
          rootDir: "./dist",
          scriptId: "1CpxmbnFDga5jHgY7GPGQ",
        },
      },
      plain,
    );

    expect(lines).toEqual([
      "-- clasp --",
      "clasp: found in PATH (version 3.3.0)",
      "Auth: logged in (~/.clasprc.json exists)",
      "Project: .clasp.json found (rootDir: ./dist, scriptId: 1Cpx…)",
    ]);
  });

  it("should render a machine without clasp", () => {
    const lines = buildClaspLines(
      {
        version: { kind: "notFound" },
        loggedIn: false,
        project: { exists: false },
      },
      plain,
    );

    expect(lines).toEqual([
      "-- clasp --",
      "clasp: not detected (not found in PATH)",
      "Auth: not logged in (~/.clasprc.json not found)",
      "Project: .clasp.json not found",
    ]);
  });

  it("should render timeout and failure as not detected", () => {
    const timedOut = buildClaspLines(
      {
        version: { kind: "timedOut" },
        loggedIn: false,
        project: { exists: false },
      },
      plain,
    );
    const failed = buildClaspLines(
      {
        version: { kind: "failed" },
        loggedIn: false,
        project: { exists: false },
      },
      plain,
    );

    expect(timedOut[1]).toBe("clasp: not detected (`clasp -v` timed out)");
    expect(failed[1]).toBe("clasp: not detected (`clasp -v` failed)");
  });

  it("should render a parse error and missing fields of .clasp.json", () => {
    const parseError = buildClaspLines(
      {
        version: { kind: "found", version: "3.3.0" },
        loggedIn: true,
        project: { exists: true, parseError: true },
      },
      plain,
    );
    const noFields = buildClaspLines(
      {
        version: { kind: "found", version: "3.3.0" },
        loggedIn: true,
        project: { exists: true },
      },
      plain,
    );

    expect(parseError[3]).toBe(
      "Project: .clasp.json found (could not be parsed)",
    );
    expect(noFields[3]).toBe(
      "Project: .clasp.json found (rootDir: (not set), scriptId: (not set))",
    );
  });
});
