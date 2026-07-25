import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debugCommand } from "../../debug/debugCommand";
import type { TimedExecFn } from "../../debug/env/execWithTimeout";
import { getVersion } from "../../version/getVersion";

const claspExec =
  (stdout: string): TimedExecFn =>
  () =>
    Promise.resolve({
      ok: true,
      exitCode: 0,
      stdout,
      stderr: "",
      timedOut: false,
    });

const noClaspExec: TimedExecFn = () =>
  Promise.resolve({
    ok: false,
    exitCode: null,
    stdout: "",
    stderr: "spawn clasp ENOENT",
    timedOut: false,
  });

const SCHEMA_TEXT = `generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model User {
  id   Int    @id
  name String
}
`;

describe("debugCommand", () => {
  let tmpDir: string;
  let homeDir: string;
  let originalCwd: string;
  let logged: string[];

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-debug-cmd-")));
    tmpDir = process.cwd();
    homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-debug-home-"));
    logged = [];
    vi.spyOn(console, "log").mockImplementation((line: unknown) => {
      logged.push(String(line));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync(homeDir, { recursive: true, force: true });
  });

  const baseOverrides = () => ({
    env: {},
    homedir: homeDir,
    stdinIsTty: false,
    stdoutIsTty: false,
    detectCi: () => false,
  });

  it("should render every section for a fully set up project", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default { schema: "gassma" };`,
    );
    fs.mkdirSync(path.join(tmpDir, "gassma"));
    fs.writeFileSync(path.join(tmpDir, "gassma", "schema.prisma"), SCHEMA_TEXT);
    fs.mkdirSync(path.join(tmpDir, "generated"));
    fs.writeFileSync(path.join(tmpDir, "generated", "schemaClient.js"), "js");
    fs.writeFileSync(path.join(tmpDir, "generated", "schemaClient.d.ts"), "ts");
    fs.writeFileSync(
      path.join(tmpDir, ".clasp.json"),
      JSON.stringify({ scriptId: "1CpxSecretSecret", rootDir: "./out" }),
    );
    fs.mkdirSync(path.join(tmpDir, "out"));
    fs.writeFileSync(
      path.join(tmpDir, "out", "appsscript.json"),
      JSON.stringify({
        runtimeVersion: "V8",
        dependencies: {
          libraries: [
            {
              userSymbol: "Gassma",
              version: "12",
              libraryId:
                "1ZVuWMUYs4hVKDCcP3nVw74AY48VqLm50wRceKIQLFKL0wf4Hyou-FIBH",
            },
          ],
        },
      }),
    );
    fs.writeFileSync(path.join(homeDir, ".clasprc.json"), "{}");

    await debugCommand({}, { ...baseOverrides(), exec: claspExec("3.3.0\n") });

    const output = logged.join("\n");
    expect(logged[0]).toBe(`gassma debug — gassma v${getVersion()}`);
    expect(output).toContain("⚙️ Loaded config from gassma.config.ts");
    expect(output).toContain("-- Gassma schema --");
    expect(output).toContain(
      `Path: ${path.join(tmpDir, "gassma", "schema.prisma")}`,
    );
    expect(output).toContain("Preview features: (none)");
    expect(output).toContain("-- Environment variables --");
    expect(output).toContain("For general debugging");
    expect(output).toContain("- CI:");
    expect(output).toContain("-- clasp --");
    expect(output).toContain("clasp: found in PATH (version 3.3.0)");
    expect(output).toContain("Auth: logged in (~/.clasprc.json exists)");
    expect(output).toContain(
      "Project: .clasp.json found (rootDir: ./out, scriptId: 1Cpx…)",
    );
    expect(output).not.toContain("1CpxSecretSecret");
    expect(output).toContain("-- appsscript.json --");
    expect(output).toContain(`Path: ${path.join("out", "appsscript.json")}`);
    expect(output).toContain("runtimeVersion: V8");
    expect(output).toContain("- version: 12");
    expect(output).toContain("-- Generated client --");
    expect(output).toContain("Output: generated");
    expect(output).toContain("schemaClient.js: found");
    expect(output).toContain("Status: up to date");
    expect(output).toContain("-- Terminal is interactive? --");
    expect(output).toContain("-- CI detected? --");
  });

  it("should complete with informative lines in an empty directory", async () => {
    await debugCommand({}, { ...baseOverrides(), exec: noClaspExec });

    const output = logged.join("\n");
    expect(output).toContain("No config file found (searched: ");
    expect(output).toContain("Could not resolve schema: ");
    expect(output).toContain("clasp: not detected (not found in PATH)");
    expect(output).toContain("Auth: not logged in (~/.clasprc.json not found)");
    expect(output).toContain("Project: .clasp.json not found");
    expect(output).toContain("Not found (searched: ");
    expect(output).toContain("Skipped (schema not found)");
  });

  it("should reflect the injected environment and CI detector", async () => {
    await debugCommand(
      {},
      {
        ...baseOverrides(),
        env: { CI: "true", TERM: "dumb" },
        exec: noClaspExec,
        stdinIsTty: true,
        detectCi: () => true,
      },
    );

    const output = logged.join("\n");
    expect(output).toContain("- CI: `true`");
    expect(output).toContain("- TERM: `dumb`");
    const interactiveIndex = logged.indexOf("-- Terminal is interactive? --");
    expect(logged[interactiveIndex + 1]).toBe("false");
    const ciIndex = logged.indexOf("-- CI detected? --");
    expect(logged[ciIndex + 1]).toBe("true");
  });

  it("should not throw even when the exec dependency rejects", async () => {
    const rejectingExec: TimedExecFn = () => Promise.reject(new Error("boom"));

    await expect(
      debugCommand({}, { ...baseOverrides(), exec: rejectingExec }),
    ).resolves.toBeUndefined();
  });

  it("should honor the --config option", async () => {
    fs.mkdirSync(path.join(tmpDir, "conf", "schemas"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "conf", "schemas", "main.prisma"),
      SCHEMA_TEXT,
    );
    fs.writeFileSync(
      path.join(tmpDir, "conf", "custom.config.ts"),
      `export default { schema: "schemas/main.prisma" };`,
    );

    await debugCommand(
      { config: "conf/custom.config.ts" },
      { ...baseOverrides(), exec: noClaspExec },
    );

    const output = logged.join("\n");
    expect(output).toContain(
      `⚙️ Loaded config from ${path.join("conf", "custom.config.ts")}`,
    );
    expect(output).toContain(
      `Path: ${path.join(tmpDir, "conf", "schemas", "main.prisma")}`,
    );
  });
});
