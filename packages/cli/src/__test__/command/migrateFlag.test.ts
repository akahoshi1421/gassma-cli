import { execFileSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const projectRoot = path.resolve(__dirname, "../../..");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const commandTs = path.join(projectRoot, "src", "command.ts");

describe("gassma migrate (e2e)", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-migrate-e2e-")),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it(
    "should list the migrate command in the help output",
    { timeout: 120_000 },
    () => {
      const output = execFileSync(
        process.execPath,
        [tsxCli, commandTs, "--help"],
        { cwd: tmpDir, stdio: "pipe" },
      ).toString();

      expect(output).toContain("migrate");
    },
  );

  it(
    "should generate the migration files end to end",
    { timeout: 120_000 },
    () => {
      fs.mkdirSync(path.join(tmpDir, "gassma"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "gassma", "schema.prisma"),
        "model User {\n  id   Int    @id\n  name String\n}\n",
      );

      const output = execFileSync(
        process.execPath,
        [tsxCli, commandTs, "migrate", "--output", "./dist", "--name", "init"],
        { cwd: tmpDir, stdio: "pipe" },
      ).toString();

      expect(output).toContain("gassma-migration.js");
      const stub = fs.readFileSync(
        path.join(tmpDir, "dist", "gassma-migration.js"),
        "utf-8",
      );
      expect(stub).toContain("function gassmaMigrate()");

      const migrations = fs.readdirSync(
        path.join(tmpDir, "gassma", "migrations"),
      );
      expect(migrations).toHaveLength(1);
      expect(migrations[0]).toMatch(/^\d{14}_init$/);
    },
  );

  it(
    "should include acceptDataLoss in the stub when --accept-data-loss is given",
    { timeout: 120_000 },
    () => {
      fs.mkdirSync(path.join(tmpDir, "gassma"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "gassma", "schema.prisma"),
        "model User {\n  id   Int    @id\n  name String\n}\n",
      );

      execFileSync(
        process.execPath,
        [
          tsxCli,
          commandTs,
          "migrate",
          "--output",
          "./dist",
          "--accept-data-loss",
        ],
        { cwd: tmpDir, stdio: "pipe" },
      );

      const stub = fs.readFileSync(
        path.join(tmpDir, "dist", "gassma-migration.js"),
        "utf-8",
      );
      expect(stub).toContain("acceptDataLoss: true,");
    },
  );

  it(
    "should not wait for an answer when stdin is not a terminal",
    { timeout: 120_000 },
    () => {
      const schemaPath = path.join(tmpDir, "gassma", "schema.prisma");
      fs.mkdirSync(path.join(tmpDir, "gassma"), { recursive: true });
      fs.writeFileSync(
        schemaPath,
        "model User {\n  id Int @id\n}\n\nmodel Memo {\n  id Int @id\n}\n",
      );
      execFileSync(
        process.execPath,
        [tsxCli, commandTs, "migrate", "--output", "./dist"],
        { cwd: tmpDir, stdio: "pipe" },
      );
      fs.writeFileSync(schemaPath, "model User {\n  id Int @id\n}\n");

      const output = execFileSync(
        process.execPath,
        [
          tsxCli,
          commandTs,
          "migrate",
          "--output",
          "./dist",
          "--accept-data-loss",
        ],
        { cwd: tmpDir, stdio: "pipe", timeout: 60_000 },
      ).toString();

      expect(output).toContain("Memo");
      expect(output).not.toContain("Continue? (y/N)");
      const stub = fs.readFileSync(
        path.join(tmpDir, "dist", "gassma-migration.js"),
        "utf-8",
      );
      expect(stub).not.toContain("Memo");
    },
  );
});
