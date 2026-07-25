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
  it("should fetch the latest library version and update the manifest", async () => {
    const { calls, exec } = createScriptedExec((call) => {
      if (call.args[0] === "list-versions") {
        return {
          ok: true,
          exitCode: 0,
          stdout: JSON.stringify([{ versionNumber: 9 }, { versionNumber: 8 }]),
          stderr: "",
        };
      }
      return undefined;
    });
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({ exec, store });

    const ctx = await manifestStep.run(baseContext(), deps);

    expect(calls[0].args).toEqual([
      "list-versions",
      GASSMA_LIBRARY.scriptId,
      "--json",
    ]);
    expect(ctx.libraryVersion).toBe("9");

    const manifest = JSON.parse(
      files.get("/project/dist/appsscript.json") ?? "{}",
    );
    expect(manifest.dependencies.libraries[0]).toMatchObject({
      userSymbol: "Gassma",
      version: "9",
    });
    expect(manifest.runtimeVersion).toBe("V8");
  });

  it("should resolve the version from GitHub when clasp fails", async () => {
    const { exec } = createScriptedExec(() => ({
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "not logged in",
    }));
    const { files, store } = createMemoryStore({});
    const deps = createTestDeps({
      exec,
      store,
      fetchText: () =>
        Promise.resolve(JSON.stringify({ name: "gassma", version: "7" })),
    });

    const ctx = await manifestStep.run(baseContext(), deps);

    expect(ctx.libraryVersion).toBe("7");
    const manifest = JSON.parse(
      files.get("/project/dist/appsscript.json") ?? "{}",
    );
    expect(manifest.dependencies.libraries[0].version).toBe("7");
  });

  it("should skip the library entry and warn when clasp and GitHub both fail", async () => {
    const { exec } = createScriptedExec(() => ({
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "not logged in",
    }));
    const { files, store } = createMemoryStore({});
    const prompter = createFakePrompter();
    const deps = createTestDeps({
      exec,
      store,
      prompter,
      fetchText: () => Promise.reject(new Error("network down")),
    });

    const ctx = await manifestStep.run(baseContext(), deps);

    expect(ctx.libraryVersion).toBeNull();
    const manifest = JSON.parse(
      files.get("/project/dist/appsscript.json") ?? "{}",
    );
    expect(manifest.dependencies.libraries).toEqual([]);
    expect(manifest.timeZone).toBeTypeOf("string");
    expect(manifest.exceptionLogging).toBe("STACKDRIVER");
    expect(manifest.runtimeVersion).toBe("V8");

    const warning = prompter.warns.join(" ");
    expect(warning).toContain(GASSMA_LIBRARY.scriptId);
    expect(warning).toContain("https://github.com/akahoshi1421/gassma");
  });

  it("should report an unresolved version display in dry-run mode", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter, dryRun: true });

    await manifestStep.run(baseContext(), deps);

    expect(prompter.warns).toEqual([]);
    expect(prompter.infos.join(" ")).toContain("latest, resolved at run time");
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
