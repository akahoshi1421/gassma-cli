import { describe, expect, it } from "vitest";
import { GASSMA_LIBRARY } from "../../../bootstrap/const/gassmaLibrary";
import { createInitialContext } from "../../../bootstrap/flow/context";
import {
  claspCreateStep,
  manifestStep,
} from "../../../bootstrap/flow/steps/claspSteps";
import {
  createFakePrompter,
  createMemoryStore,
  createScriptedExec,
  createTestDeps,
} from "./testHelpers";

const CWD = "/project";

const baseContext = () =>
  createInitialContext({ cwd: CWD, packageManager: "npm" });

describe("claspCreateStep", () => {
  it("should create a sheets-bound script in the project cwd", async () => {
    const { calls, exec } = createScriptedExec();
    const deps = createTestDeps({ exec });

    await claspCreateStep.run(baseContext(), deps);

    expect(calls).toHaveLength(1);
    expect(calls[0].command).toBe("clasp");
    expect(calls[0].args).toEqual([
      "create-script",
      "--type",
      "sheets",
      "--title",
      "project",
      "--rootDir",
      "./dist",
    ]);
    expect(calls[0].options?.cwd).toBe(CWD);
  });

  it("should create a standalone script when sheets are not wanted", async () => {
    const { calls, exec } = createScriptedExec();
    const deps = createTestDeps({ exec });

    await claspCreateStep.run({ ...baseContext(), withSheets: false }, deps);

    expect(calls[0].args).toContain("standalone");
  });

  it("should do nothing when clasp create is skipped", async () => {
    const { calls, exec } = createScriptedExec();
    const deps = createTestDeps({ exec });

    const ctx = await claspCreateStep.run(
      { ...baseContext(), claspCreateSkipped: true },
      deps,
    );

    expect(calls).toHaveLength(0);
    expect(ctx.claspCreateSkipped).toBe(true);
  });

  it("should throw with stderr details when clasp fails", async () => {
    const { exec } = createScriptedExec(() => ({
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "User has not enabled the Apps Script API.",
    }));
    const deps = createTestDeps({ exec });

    await expect(claspCreateStep.run(baseContext(), deps)).rejects.toThrow(
      "clasp create-script failed. User has not enabled the Apps Script API.",
    );
  });
});

describe("manifestStep", () => {
  it("should write the pinned library version without running clasp", async () => {
    const { calls, exec } = createScriptedExec(() => ({
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "not logged in",
    }));
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ exec, store });

    await manifestStep.run(baseContext(), deps);

    expect(calls).toHaveLength(0);
    const manifest = JSON.parse(
      files.get("/project/dist/appsscript.json") ?? "{}",
    );
    expect(manifest.dependencies.libraries[0]).toEqual({
      userSymbol: GASSMA_LIBRARY.userSymbol,
      libraryId: GASSMA_LIBRARY.scriptId,
      version: GASSMA_LIBRARY.version,
      developmentMode: false,
    });
  });

  it("should report the pinned version in dry-run mode", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter, dryRun: true });

    await manifestStep.run(baseContext(), deps);

    expect(prompter.warns).toEqual([]);
    expect(prompter.infos.join(" ")).toContain(
      `Gassma library version ${GASSMA_LIBRARY.version}`,
    );
  });

  it("should apply the manifest defaults for a fresh project", async () => {
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ store });

    await manifestStep.run(baseContext(), deps);

    const manifest = JSON.parse(
      files.get("/project/dist/appsscript.json") ?? "{}",
    );
    expect(manifest.timeZone).toBeTypeOf("string");
    expect(manifest.exceptionLogging).toBe("STACKDRIVER");
    expect(manifest.runtimeVersion).toBe("V8");
  });

  it("should preserve fields of an existing manifest pulled by clasp", async () => {
    const { files, store } = createMemoryStore({
      "/project/dist/appsscript.json": JSON.stringify({
        timeZone: "America/New_York",
        exceptionLogging: "STACKDRIVER",
        oauthScopes: ["https://www.googleapis.com/auth/spreadsheets"],
      }),
    });
    const deps = createTestDeps({ store });

    await manifestStep.run(baseContext(), deps);

    const manifest = JSON.parse(
      files.get("/project/dist/appsscript.json") ?? "{}",
    );
    expect(manifest.oauthScopes).toEqual([
      "https://www.googleapis.com/auth/spreadsheets",
    ]);
    expect(manifest.exceptionLogging).toBe("STACKDRIVER");
  });

  it("should report the update through the prompter", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter });

    await manifestStep.run(baseContext(), deps);

    expect(prompter.infos.join(" ")).toContain("dist/appsscript.json");
  });
});
