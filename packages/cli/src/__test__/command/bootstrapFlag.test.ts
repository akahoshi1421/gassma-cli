import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const projectRoot = path.resolve(__dirname, "../../..");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const commandTs = path.join(projectRoot, "src", "command.ts");

describe("gassma bootstrap (e2e)", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-bootstrap-e2e-")),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it(
    "should list the bootstrap command in the help output",
    { timeout: 120_000 },
    () => {
      const output = execFileSync(
        process.execPath,
        [tsxCli, commandTs, "--help"],
        { cwd: tmpDir, stdio: "pipe" },
      ).toString();

      expect(output).toContain("bootstrap");
    },
  );

  it(
    "should print planned actions without side effects for --dry-run --yes",
    { timeout: 120_000 },
    () => {
      const output = execFileSync(
        process.execPath,
        [tsxCli, commandTs, "bootstrap", "--dry-run", "--yes"],
        { cwd: tmpDir, stdio: "pipe" },
      ).toString();

      expect(output).toContain("clasp create-script");
      expect(output).toContain("write package.json");
      expect(output).toContain("gassma init");
      expect(output).toContain("Dry run complete");
      expect(fs.readdirSync(tmpDir)).toEqual([]);
    },
  );

  it(
    "should fail with guidance on a non-interactive terminal without --yes",
    { timeout: 120_000 },
    () => {
      const result = spawnSync(
        process.execPath,
        [tsxCli, commandTs, "bootstrap"],
        { cwd: tmpDir, encoding: "utf-8" },
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("--yes");
      expect(fs.readdirSync(tmpDir)).toEqual([]);
    },
  );
});
