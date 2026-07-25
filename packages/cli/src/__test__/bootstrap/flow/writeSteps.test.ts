import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInitialContext } from "../../../bootstrap/flow/context";
import {
  initStep,
  projectFilesStep,
  sampleIndexStep,
} from "../../../bootstrap/flow/steps/writeSteps";
import {
  createFakePrompter,
  createMemoryStore,
  createTestDeps,
} from "./testHelpers";

const CWD = "/my project";

const baseContext = () =>
  createInitialContext({ cwd: CWD, packageManager: "npm" });

describe("projectFilesStep", () => {
  it("should create all project files in a fresh directory", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await projectFilesStep.run(baseContext(), deps);

    expect(files.has(path.join(CWD, "package.json"))).toBe(true);
    expect(files.has(path.join(CWD, "esbuild.mjs"))).toBe(true);
    expect(files.has(path.join(CWD, "tsconfig.json"))).toBe(true);
    expect(files.has(path.join(CWD, ".gitignore"))).toBe(true);
  });

  it("should sanitize the directory name for the package name", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await projectFilesStep.run(baseContext(), deps);

    const pkg = JSON.parse(files.get(path.join(CWD, "package.json")) ?? "{}");
    expect(pkg.name).toBe("my-project");
  });

  it("should write style-dependent files for the global style", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await projectFilesStep.run({ ...baseContext(), style: "global" }, deps);

    const pkg = JSON.parse(files.get(path.join(CWD, "package.json")) ?? "{}");
    expect(pkg.devDependencies["esbuild-gas-plugin"]).toBe("^0.10.0");
    expect(files.get(path.join(CWD, "esbuild.mjs"))).toContain("GasPlugin");
  });

  it("should use the CLI version for the gassma dependency", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store, gassmaVersion: "9.9.9" });

    await projectFilesStep.run(baseContext(), deps);

    const pkg = JSON.parse(files.get(path.join(CWD, "package.json")) ?? "{}");
    expect(pkg.dependencies.gassma).toBe("^9.9.9");
  });

  it("should merge an existing package.json instead of overwriting", async () => {
    const pkgPath = path.join(CWD, "package.json");
    const { files, store } = createMemoryStore({
      [pkgPath]: JSON.stringify({
        name: "keep-me",
        scripts: { build: "custom" },
      }),
    });
    const deps = createTestDeps({ store });

    await projectFilesStep.run(baseContext(), deps);

    const pkg = JSON.parse(files.get(pkgPath) ?? "{}");
    expect(pkg.name).toBe("keep-me");
    expect(pkg.scripts.build).toBe("custom");
    expect(pkg.scripts.deploy).toBe("npm run build && npm run push");
  });

  it("should warn and leave an unparsable package.json untouched", async () => {
    const pkgPath = path.join(CWD, "package.json");
    const { files, store } = createMemoryStore({ [pkgPath]: "{broken" });
    const prompter = createFakePrompter();
    const deps = createTestDeps({ store, prompter });

    await projectFilesStep.run(baseContext(), deps);

    expect(files.get(pkgPath)).toBe("{broken");
    expect(prompter.warns.join(" ")).toContain("package.json");
  });

  it("should not overwrite existing esbuild.mjs and tsconfig.json", async () => {
    const esbuildPath = path.join(CWD, "esbuild.mjs");
    const tsconfigPath = path.join(CWD, "tsconfig.json");
    const { files, store } = createMemoryStore({
      [esbuildPath]: "my esbuild",
      [tsconfigPath]: "my tsconfig",
    });
    const deps = createTestDeps({ store });

    await projectFilesStep.run(baseContext(), deps);

    expect(files.get(esbuildPath)).toBe("my esbuild");
    expect(files.get(tsconfigPath)).toBe("my tsconfig");
  });

  it("should write the injected template verbatim to a fresh .gitignore", async () => {
    const ignorePath = path.join(CWD, ".gitignore");
    const { files, store } = createMemoryStore({});
    const base = createTestDeps({ store });
    const deps = {
      ...base,
      templates: { ...base.templates, gitignore: "a/\nb\n" },
    };

    await projectFilesStep.run(baseContext(), deps);

    expect(files.get(ignorePath)).toBe("a/\nb\n");
  });

  it("should write the bundled template content to a fresh .gitignore", async () => {
    const ignorePath = path.join(CWD, ".gitignore");
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await projectFilesStep.run(baseContext(), deps);

    expect(files.get(ignorePath)).toBe(
      ".clasp.json\n.clasprc.json\n.env\nnode_modules/\ndist/*\n!dist/appsscript.json\n",
    );
  });

  it("should append missing entries to an existing .gitignore", async () => {
    const ignorePath = path.join(CWD, ".gitignore");
    const { files, store } = createMemoryStore({
      [ignorePath]: "node_modules/\n",
    });
    const deps = createTestDeps({ store });

    await projectFilesStep.run(baseContext(), deps);

    const content = files.get(ignorePath) ?? "";
    expect(content.startsWith("node_modules/\n")).toBe(true);
    expect(content).toContain(".clasp.json");
    expect(content).toContain("!dist/appsscript.json");
  });
});

describe("sampleIndexStep", () => {
  it("should write the sample for the selected style", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await sampleIndexStep.run({ ...baseContext(), style: "global" }, deps);

    const content = files.get(path.join(CWD, "src", "index.ts")) ?? "";
    expect(content).toContain("global.main = main;");
  });

  it("should not write anything when the sample is not wanted", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await sampleIndexStep.run({ ...baseContext(), wantSample: false }, deps);

    expect(files.size).toBe(0);
  });

  it("should never overwrite an existing src/index.ts", async () => {
    const indexPath = path.join(CWD, "src", "index.ts");
    const { files, store } = createMemoryStore({ [indexPath]: "my code" });
    const prompter = createFakePrompter();
    const deps = createTestDeps({ store, prompter });

    await sampleIndexStep.run(baseContext(), deps);

    expect(files.get(indexPath)).toBe("my code");
    expect(prompter.infos.join(" ")).toContain("Skipping");
  });
});

describe("initStep", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-bootstrap-init-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should run gassma init with a sample model", async () => {
    const { store } = createMemoryStore({});
    const deps = createTestDeps({ store });
    const ctx = createInitialContext({ cwd: tmpDir, packageManager: "npm" });

    await initStep.run(ctx, deps);

    const schema = fs.readFileSync(
      path.join(tmpDir, "gassma", "schema.prisma"),
      "utf-8",
    );
    expect(schema).toContain("model User");
    expect(fs.existsSync(path.join(tmpDir, "gassma.config.ts"))).toBe(true);
  });

  it("should skip init when a schema already exists", async () => {
    const schemaPath = path.join(tmpDir, "gassma", "schema.prisma");
    const { store } = createMemoryStore({ [schemaPath]: "existing" });
    const prompter = createFakePrompter();
    const deps = createTestDeps({ store, prompter });
    const ctx = createInitialContext({ cwd: tmpDir, packageManager: "npm" });

    await initStep.run(ctx, deps);

    expect(fs.existsSync(schemaPath)).toBe(false);
    expect(prompter.infos.join(" ")).toContain("Skipping gassma init");
  });

  it("should only plan init in dry-run mode", async () => {
    const { store } = createMemoryStore({});
    const deps = createTestDeps({ store, dryRun: true });
    const ctx = createInitialContext({ cwd: tmpDir, packageManager: "npm" });

    await initStep.run(ctx, deps);

    expect(fs.existsSync(path.join(tmpDir, "gassma"))).toBe(false);
    expect(deps.plannedActions.join(" ")).toContain("gassma init");
  });
});
