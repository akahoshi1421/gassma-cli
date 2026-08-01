import { execFileSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const projectRoot = path.resolve(__dirname, "../../..");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const commandTs = path.join(projectRoot, "src", "command.ts");

describe("gassma db push (e2e)", () => {
  const ctx = { tmpDir: "" };

  beforeEach(() => {
    ctx.tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-db-push-e2e-")),
    );
  });

  afterEach(() => {
    fs.rmSync(ctx.tmpDir, { recursive: true, force: true });
  });

  const runCli = (args: string[]): string =>
    execFileSync(process.execPath, [tsxCli, commandTs, ...args], {
      cwd: ctx.tmpDir,
      stdio: "pipe",
    }).toString();

  const writeSchema = (): void => {
    fs.mkdirSync(path.join(ctx.tmpDir, "gassma"), { recursive: true });
    fs.writeFileSync(
      path.join(ctx.tmpDir, "gassma", "schema.prisma"),
      "model User {\n  id   Int    @id\n  name String\n}\n",
    );
  };

  it(
    "should list the push command in the db help output",
    { timeout: 120_000 },
    () => {
      const output = runCli(["db", "--help"]);

      expect(output).toContain("push");
    },
  );

  it(
    "should list the db push options in the help output",
    { timeout: 120_000 },
    () => {
      const output = runCli(["db", "push", "--help"]);

      expect(output).toContain("--output");
      expect(output).toContain("--schema");
      expect(output).toContain("--config");
      expect(output).toContain("--accept-data-loss");
      expect(output).not.toContain("--name");
    },
  );

  it(
    "should generate the stub without a migrations directory end to end",
    { timeout: 120_000 },
    () => {
      writeSchema();

      const output = runCli(["db", "push", "--output", "./dist"]);

      expect(output).toContain("gassma-migration.js");
      const stub = fs.readFileSync(
        path.join(ctx.tmpDir, "dist", "gassma-migration.js"),
        "utf-8",
      );
      expect(stub).toContain("function gassmaMigrate()");
      expect(fs.existsSync(path.join(ctx.tmpDir, "gassma", "migrations"))).toBe(
        false,
      );
    },
  );

  it(
    "should include acceptDataLoss in the stub when --accept-data-loss is given",
    { timeout: 120_000 },
    () => {
      writeSchema();

      runCli(["db", "push", "--output", "./dist", "--accept-data-loss"]);

      const stub = fs.readFileSync(
        path.join(ctx.tmpDir, "dist", "gassma-migration.js"),
        "utf-8",
      );
      expect(stub).toContain("acceptDataLoss: true,");
    },
  );

  it("should reject the --name option", { timeout: 120_000 }, () => {
    writeSchema();

    expect(() =>
      runCli(["db", "push", "--output", "./dist", "--name", "init"]),
    ).toThrow(/unknown option '--name'/);
  });
});
