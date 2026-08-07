import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrap } from "../../bootstrap/bootstrapCommand";
import { GASSMA_LIBRARY } from "../../bootstrap/const/gassmaLibrary";
import { BootstrapCancelledError } from "../../bootstrap/flow/prompts";
import type { ExecCall } from "./flow/testHelpers";
import { createFakePrompter, createScriptedExec } from "./flow/testHelpers";

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
    const { calls, exec } = createScriptedExec();

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
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, directory: "." },
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
    expect(fs.readFileSync(path.join(tmpDir, "AGENTS.md"), "utf-8")).toBe(
      fs.readFileSync(
        path.resolve(__dirname, "../../../templates/AGENTS.md.template"),
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
    expect(commands.some((c) => c === "npm i")).toBe(true);
  });

  it("should default to the oxlint setup with --yes", async () => {
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    expect(fs.readFileSync(path.join(tmpDir, ".oxlintrc.json"), "utf-8")).toBe(
      fs.readFileSync(
        path.resolve(__dirname, "../../../templates/.oxlintrc.json.template"),
        "utf-8",
      ),
    );
    expect(fs.existsSync(path.join(tmpDir, "eslint.config.mjs"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".prettierrc"))).toBe(false);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"),
    );
    expect(pkg.scripts.lint).toBe("oxlint");
    expect(pkg.scripts["format:check"]).toBe("oxfmt --check");
    expect(pkg.devDependencies.oxlint).toBeTypeOf("string");
    expect(pkg.devDependencies.oxfmt).toBeTypeOf("string");
  });

  it("should write the eslint setup when it is selected", async () => {
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter({
      select: { "Linter and formatter setup?": "eslint" },
    });

    await bootstrap(
      { skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    expect(fs.existsSync(path.join(tmpDir, "eslint.config.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".prettierrc"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".oxlintrc.json"))).toBe(false);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"),
    );
    expect(pkg.scripts.lint).toBe("eslint .");
    expect(pkg.devDependencies.prettier).toBeTypeOf("string");
  });

  it("should write no linter files when none is selected", async () => {
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter({
      select: { "Linter and formatter setup?": "none" },
    });

    await bootstrap(
      { skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    expect(fs.existsSync(path.join(tmpDir, ".oxlintrc.json"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "eslint.config.mjs"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".prettierrc"))).toBe(false);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"),
    );
    expect(pkg.scripts.lint).toBeUndefined();
    expect(pkg.devDependencies.oxlint).toBeUndefined();
  });

  it("should keep an existing .oxlintrc.json untouched", async () => {
    fs.writeFileSync(path.join(tmpDir, ".oxlintrc.json"), "my rules");
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    expect(fs.readFileSync(path.join(tmpDir, ".oxlintrc.json"), "utf-8")).toBe(
      "my rules",
    );
  });

  it("should write the pinned library version without clasp or the network", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network is unavailable"));
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "dist", "appsscript.json"), "utf-8"),
    );
    expect(manifest.dependencies.libraries[0]).toEqual({
      userSymbol: GASSMA_LIBRARY.userSymbol,
      libraryId: GASSMA_LIBRARY.scriptId,
      version: GASSMA_LIBRARY.version,
      developmentMode: false,
    });
    expect(
      calls.some((call: ExecCall) => call.args.includes("list-versions")),
    ).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(prompter.warns).toEqual([]);
  });

  it("should not run the install with --skip-install", async () => {
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    const commands = calls.map((call: ExecCall) =>
      [call.command, ...call.args].join(" "),
    );
    expect(commands.every((c) => c.startsWith("clasp "))).toBe(true);
  });

  it("should not touch the file system or run commands with --dry-run", async () => {
    const { calls, exec } = createScriptedExec();
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
    expect(planNote?.message).toContain("create directory gassma-project");
    expect(planNote?.message).toContain("clasp create-script");
    expect(planNote?.message).toContain("write gassma-project/package.json");
    expect(planNote?.message).toContain("write gassma-project/AGENTS.md");
    expect(planNote?.message).toContain("write gassma-project/.oxlintrc.json");
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
    const { exec } = createScriptedExec();

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

    await bootstrap(
      { yes: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    expect(prompter.warns.join(" ")).toContain("clasp create-script failed");
    expect(process.exitCode).toBe(1);
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(false);
  });

  it("should skip clasp create for an existing .clasp.json project", async () => {
    fs.writeFileSync(path.join(tmpDir, ".clasp.json"), "{}");
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "." },
      { exec, prompter, isTty: true },
    );

    const commands = calls.map((call: ExecCall) =>
      [call.command, ...call.args].join(" "),
    );
    expect(commands.some((c) => c.includes("create-script"))).toBe(false);
    expect(prompter.infos.join(" ")).toContain("Skipping clasp create-script");
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(true);
  });

  it("should create the given directory and bootstrap inside it", async () => {
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "my-app" },
      { exec, prompter, isTty: true },
    );

    const appDir = path.join(tmpDir, "my-app");
    expect(process.exitCode).toBeUndefined();
    expect(fs.realpathSync(process.cwd())).toBe(fs.realpathSync(appDir));
    expect(fs.existsSync(path.join(appDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(appDir, "gassma", "schema.prisma"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(tmpDir, "package.json"))).toBe(false);

    const createCall = calls.find((call) => call.args[0] === "create-script");
    expect(createCall?.args).toContain("my-app");
    expect(fs.realpathSync(createCall?.options?.cwd ?? "")).toBe(
      fs.realpathSync(appDir),
    );
  });

  it("should bootstrap into gassma-project when the directory is omitted with --yes", async () => {
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true },
      { exec, prompter, isTty: true },
    );

    expect(
      fs.existsSync(path.join(tmpDir, "gassma-project", "package.json")),
    ).toBe(true);
  });

  it("should stop when the target directory is not empty and the user declines", async () => {
    fs.mkdirSync(path.join(tmpDir, "my-app"));
    fs.writeFileSync(path.join(tmpDir, "my-app", "keep.txt"), "x");
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap({ directory: "my-app" }, { exec, prompter, isTty: true });

    expect(process.exitCode).toBe(1);
    expect(prompter.warns.join(" ")).toContain("cancelled");
    expect(fs.existsSync(path.join(tmpDir, "my-app", "package.json"))).toBe(
      false,
    );
    expect(calls.some((call) => call.args[0] === "create-script")).toBe(false);
  });

  it("should continue when the user accepts a non-empty directory", async () => {
    fs.mkdirSync(path.join(tmpDir, "my-app"));
    fs.writeFileSync(path.join(tmpDir, "my-app", "keep.txt"), "x");
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter({
      confirm: { 'Directory "my-app" is not empty. Continue?': true },
    });

    await bootstrap(
      { skipInstall: true, directory: "my-app" },
      { exec, prompter, isTty: true },
    );

    expect(process.exitCode).toBeUndefined();
    expect(fs.existsSync(path.join(tmpDir, "my-app", "package.json"))).toBe(
      true,
    );
  });

  it("should resume idempotently in a bootstrapped directory with --yes", async () => {
    fs.mkdirSync(path.join(tmpDir, "my-app"));
    fs.writeFileSync(path.join(tmpDir, "my-app", ".clasp.json"), "{}");
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, skipInstall: true, directory: "my-app" },
      { exec, prompter, isTty: true },
    );

    expect(process.exitCode).toBeUndefined();
    expect(calls.some((call) => call.args[0] === "create-script")).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "my-app", "package.json"))).toBe(
      true,
    );
  });

  it("should not create the directory with --dry-run", async () => {
    const { exec } = createScriptedExec();
    const prompter = createFakePrompter();

    await bootstrap(
      { yes: true, dryRun: true, directory: "my-app" },
      { exec, prompter, isTty: true },
    );

    expect(fs.readdirSync(tmpDir)).toEqual([]);
    const planNote = prompter.notes.find((note) =>
      note.title.includes("dry run"),
    );
    expect(planNote?.message).toContain("create directory my-app");
    expect(planNote?.message).toContain("write my-app/package.json");
  });
});
