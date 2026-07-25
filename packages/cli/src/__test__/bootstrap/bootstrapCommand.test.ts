import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrap } from "../../bootstrap/bootstrapCommand";
import { GASSMA_LIBRARY } from "../../bootstrap/const/gassmaLibrary";
import { BootstrapCancelledError } from "../../bootstrap/flow/prompts";
import type { ExecCall } from "./flow/testHelpers";
import { createFakePrompter, createScriptedExec } from "./flow/testHelpers";

const listVersionsStdout = JSON.stringify([
  { versionNumber: 7 },
  { versionNumber: 6 },
]);

const createClaspExec = () =>
  createScriptedExec((call) => {
    if (call.args[0] === "list-versions") {
      return { ok: true, exitCode: 0, stdout: listVersionsStdout, stderr: "" };
    }
    return undefined;
  });

describe("bootstrap", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-bootstrap-cmd-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it("should require --yes on a non-interactive terminal", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { calls, exec } = createClaspExec();

    await bootstrap({}, { exec, isTty: false });

    expect(error).toHaveBeenCalledWith(expect.stringContaining("--yes"));
    expect(process.exitCode).toBe(1);
    expect(calls).toHaveLength(0);
  });

  it("should guide the user when clasp is not installed", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { exec } = createScriptedExec(() => ({
      ok: false,
      exitCode: null,
      stdout: "",
      stderr: "spawn clasp ENOENT",
    }));

    await bootstrap({ yes: true }, { exec, isTty: true });

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("npm install -g @google/clasp"),
    );
    expect(process.exitCode).toBe(1);
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(false);
  });

  it("should set up a full project with --yes", async () => {
    const { calls, exec } = createClaspExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true },
      { exec, prompter, isTty: true, userAgent: "npm/10.0.0 node/v20.0.0" },
    );

    expect(process.exitCode).toBeUndefined();
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "esbuild.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "tsconfig.json"))).toBe(true);
    expect(fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8")).toBe(
      fs.readFileSync(
        path.resolve(__dirname, "../../../templates/.gitignore.template"),
        "utf-8",
      ),
    );
    expect(fs.existsSync(path.join(tmpDir, "src", "index.ts"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "dist", "appsscript.json"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(tmpDir, "gassma", "schema.prisma"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(tmpDir, "gassma.config.ts"))).toBe(true);

    const commands = calls.map((call: ExecCall) =>
      [call.command, ...call.args].join(" "),
    );
    expect(commands[0]).toBe("clasp --version");
    expect(commands.some((c) => c.includes("clasp create-script"))).toBe(true);
    expect(commands.some((c) => c.includes("clasp list-versions"))).toBe(true);
    expect(commands.some((c) => c === "npm i")).toBe(true);
  });

  it("should write the manifest with the fetched library version", async () => {
    const { exec } = createClaspExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true },
      { exec, prompter, isTty: true },
    );

    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "dist", "appsscript.json"), "utf-8"),
    );
    expect(manifest.dependencies.libraries[0]).toMatchObject({
      userSymbol: "Gassma",
      version: "7",
      developmentMode: false,
    });
    expect(manifest.runtimeVersion).toBe("V8");
  });

  it("should resolve the library version from GitHub when clasp list-versions fails", async () => {
    const { exec } = createScriptedExec((call: ExecCall) => {
      if (call.args[0] === "list-versions") {
        return { ok: false, exitCode: 1, stdout: "", stderr: "boom" };
      }
      return undefined;
    });
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true },
      {
        exec,
        prompter,
        isTty: true,
        fetchText: () =>
          Promise.resolve(JSON.stringify({ name: "gassma", version: "9" })),
      },
    );

    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "dist", "appsscript.json"), "utf-8"),
    );
    expect(manifest.dependencies.libraries[0]).toMatchObject({ version: "9" });
    expect(process.exitCode).toBeUndefined();
  });

  it("should continue without the library entry when clasp and GitHub both fail", async () => {
    const { exec } = createScriptedExec((call: ExecCall) => {
      if (call.args[0] === "list-versions") {
        return { ok: false, exitCode: 1, stdout: "", stderr: "boom" };
      }
      return undefined;
    });
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true },
      {
        exec,
        prompter,
        isTty: true,
        fetchText: () => Promise.reject(new Error("network down")),
      },
    );

    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "dist", "appsscript.json"), "utf-8"),
    );
    expect(manifest.dependencies.libraries).toEqual([]);
    expect(manifest.timeZone).toBeTypeOf("string");
    expect(manifest.runtimeVersion).toBe("V8");
    expect(prompter.warns.join(" ")).toContain(GASSMA_LIBRARY.scriptId);
    expect(process.exitCode).toBeUndefined();
  });

  it("should not run the install with --skip-install", async () => {
    const { calls, exec } = createClaspExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true },
      { exec, prompter, isTty: true },
    );

    const commands = calls.map((call: ExecCall) =>
      [call.command, ...call.args].join(" "),
    );
    expect(commands.every((c) => c.startsWith("clasp "))).toBe(true);
  });

  it("should not touch the file system or run commands with --dry-run", async () => {
    const { calls, exec } = createClaspExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, dryRun: true },
      { exec, prompter, isTty: true },
    );

    expect(calls).toHaveLength(0);
    expect(fs.readdirSync(tmpDir)).toEqual([]);

    const planNote = prompter.notes.find((note) =>
      note.title.includes("dry run"),
    );
    expect(planNote).toBeDefined();
    expect(planNote?.message).toContain("clasp create-script");
    expect(planNote?.message).toContain("package.json");
    expect(planNote?.message).toContain("gassma init");
    expect(
      prompter.infos.every((message) => message.startsWith("[dry-run] ")),
    ).toBe(true);
    expect(process.exitCode).toBeUndefined();
  });

  it("should handle a prompt cancellation gracefully", async () => {
    const prompter = createFakePrompter();
    const cancellingPrompter = {
      ...prompter,
      text: () => Promise.reject(new BootstrapCancelledError()),
    };
    const { exec } = createClaspExec();

    await bootstrap({}, { exec, prompter: cancellingPrompter, isTty: true });

    expect(prompter.warns.join(" ")).toContain("cancelled");
    expect(process.exitCode).toBe(1);
  });

  it("should report a failing clasp create and stop", async () => {
    const { exec } = createScriptedExec((call: ExecCall) => {
      if (call.args[0] === "create-script") {
        return { ok: false, exitCode: 1, stdout: "", stderr: "no login" };
      }
      return undefined;
    });
    const prompter = createFakePrompter();

    await bootstrap({ yes: true }, { exec, prompter, isTty: true });

    expect(prompter.warns.join(" ")).toContain("clasp create-script failed");
    expect(process.exitCode).toBe(1);
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(false);
  });

  it("should skip clasp create for an existing .clasp.json project", async () => {
    fs.writeFileSync(path.join(tmpDir, ".clasp.json"), "{}");
    const { calls, exec } = createClaspExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true },
      { exec, prompter, isTty: true },
    );

    const commands = calls.map((call: ExecCall) =>
      [call.command, ...call.args].join(" "),
    );
    expect(commands.some((c) => c.includes("create-script"))).toBe(false);
    expect(prompter.infos.join(" ")).toContain("Skipping clasp create-script");
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(true);
  });
});
