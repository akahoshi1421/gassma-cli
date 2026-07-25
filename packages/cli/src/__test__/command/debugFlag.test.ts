import { execFileSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const projectRoot = path.resolve(__dirname, "../../..");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const commandTs = path.join(projectRoot, "src", "command.ts");

describe("gassma debug (e2e)", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-debug-e2e-")),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it(
    "should exit 0 in an empty directory and print every section",
    { timeout: 120_000 },
    () => {
      const output = execFileSync(
        process.execPath,
        [tsxCli, commandTs, "debug"],
        { cwd: tmpDir, encoding: "utf-8" },
      );

      expect(output).toContain("gassma debug — gassma v");
      expect(output).toContain("No config file found (searched: ");
      expect(output).toContain("-- Gassma schema --");
      expect(output).toContain("-- Environment variables --");
      expect(output).toContain("-- clasp --");
      expect(output).toContain("-- appsscript.json --");
      expect(output).toContain("-- Generated client --");
      expect(output).toContain("-- Terminal is interactive? --");
      expect(output).toContain("-- CI detected? --");
    },
  );

  it("should print help for debug --help", { timeout: 120_000 }, () => {
    const output = execFileSync(
      process.execPath,
      [tsxCli, commandTs, "debug", "--help"],
      { cwd: tmpDir, encoding: "utf-8" },
    );

    expect(output).toContain("--schema <path>");
    expect(output).toContain("--config <path>");
  });
});
