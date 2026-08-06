import { execFileSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const projectRoot = path.resolve(__dirname, "../../..");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const commandTs = path.join(projectRoot, "src", "command.ts");

const TWO_MODELS =
  "model User {\n  id Int @id\n}\n\nmodel Memo {\n  id Int @id\n}\n";
const ONE_MODEL = "model User {\n  id Int @id\n}\n";

describe("gassma migrate (e2e)", () => {
  let tmpDir: string;

  const run = (args: string[]): string =>
    execFileSync(process.execPath, [tsxCli, commandTs, ...args], {
      cwd: tmpDir,
      stdio: "pipe",
      timeout: 60_000,
    }).toString();

  const writeSchema = (schema: string): void => {
    fs.mkdirSync(path.join(tmpDir, "gassma"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "gassma", "schema.prisma"), schema);
  };

  const readStub = (): string =>
    fs.readFileSync(path.join(tmpDir, "dist", "gassma-migration.js"), "utf-8");

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
      expect(run(["--help"])).toContain("migrate");
    },
  );

  it(
    "should show the subcommands when migrate is run on its own",
    { timeout: 120_000 },
    () => {
      const output = run(["migrate"]);

      expect(output).toContain("dev");
      expect(output).toContain("deploy");
    },
  );

  it(
    "should generate the migration files end to end",
    { timeout: 120_000 },
    () => {
      writeSchema(ONE_MODEL);

      const output = run([
        "migrate",
        "dev",
        "--output",
        "./dist",
        "--name",
        "init",
      ]);

      expect(output).toContain("gassma-migration.js");
      expect(readStub()).toContain("function gassmaMigrate()");
      const migrations = fs.readdirSync(
        path.join(tmpDir, "gassma", "migrations"),
      );
      expect(migrations).toHaveLength(1);
      expect(migrations[0]).toMatch(/^\d{14}_init$/);
    },
  );

  it(
    "should reject --accept-data-loss on migrate dev",
    { timeout: 120_000 },
    () => {
      writeSchema(ONE_MODEL);

      expect(() =>
        run(["migrate", "dev", "--output", "./dist", "--accept-data-loss"]),
      ).toThrow();
    },
  );

  it(
    "should stop instead of waiting when stdin is not a terminal",
    { timeout: 120_000 },
    () => {
      writeSchema(TWO_MODELS);
      run(["migrate", "dev", "--output", "./dist"]);
      writeSchema(ONE_MODEL);

      let message = "";
      try {
        run(["migrate", "dev", "--output", "./dist"]);
      } catch (error) {
        message = error instanceof Error ? `${error.message}` : "";
      }

      expect(message).toContain("MigrateConfirmationRequiredError");
      expect(message).toContain("migrate deploy");
      expect(readStub()).toContain("Memo");
      expect(
        fs.readdirSync(path.join(tmpDir, "gassma", "migrations")),
      ).toHaveLength(1);
    },
  );

  it(
    "should succeed without a terminal when nothing is dropped",
    { timeout: 120_000 },
    () => {
      writeSchema(ONE_MODEL);
      run(["migrate", "dev", "--output", "./dist"]);
      writeSchema(TWO_MODELS);

      run(["migrate", "dev", "--output", "./dist"]);

      expect(readStub()).toContain("Memo");
    },
  );

  it(
    "should write the latest recorded migration on deploy",
    { timeout: 120_000 },
    () => {
      writeSchema(TWO_MODELS);
      run(["migrate", "dev", "--output", "./dist"]);
      const recorded = readStub();
      fs.rmSync(path.join(tmpDir, "dist", "gassma-migration.js"));
      writeSchema(ONE_MODEL);

      run(["migrate", "deploy", "--output", "./dist"]);

      expect(readStub()).toBe(recorded);
      expect(
        fs.readdirSync(path.join(tmpDir, "gassma", "migrations")),
      ).toHaveLength(1);
    },
  );

  it(
    "should fail deploy when nothing was recorded",
    { timeout: 120_000 },
    () => {
      writeSchema(ONE_MODEL);

      let message = "";
      try {
        run(["migrate", "deploy", "--output", "./dist"]);
      } catch (error) {
        message = error instanceof Error ? `${error.message}` : "";
      }

      expect(message).toContain("NoMigrationTrailError");
      expect(message).toContain("migrate dev");
    },
  );
});
