import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoMigrationTrailError } from "../../error/mainError";
import { migrateDeploy } from "../../migrate/migrateDeployCommand";

const schema = `
model User {
  id   Int    @id
  name String
}
`;

const trailFor = (models: string, acceptDataLoss = false): string => {
  const flag = acceptDataLoss ? "    acceptDataLoss: true,\n" : "";
  return `function gassmaMigrate() {
  Gassma.migrateSheets({
${flag}    models: [
${models}
    ]
  });
}
`;
};

const userTrail = trailFor('      { name: "User", columns: ["id", "name"] }');

const writeSchema = (): void => {
  fs.mkdirSync("gassma", { recursive: true });
  fs.writeFileSync(path.join("gassma", "schema.prisma"), schema);
};

const writeTrail = (dirName: string, content: string): void => {
  const dir = path.join("gassma", "migrations", dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "migration.js"), content);
};

const readStub = (): string =>
  fs.readFileSync(path.join("out", "gassma-migration.js"), "utf-8");

describe("migrateDeploy", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-deploy-")),
    );
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should write the recorded migration as the stub", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);

    migrateDeploy({ output: "./out" });

    expect(readStub()).toBe(userTrail);
  });

  it("should write the latest recorded migration", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);
    const latest = trailFor('      { name: "Post", columns: ["id"] }');
    writeTrail("20260730000000", latest);

    migrateDeploy({ output: "./out" });

    expect(readStub()).toBe(latest);
  });

  it("should not record a new migration", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);

    migrateDeploy({ output: "./out" });

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });

  it("should ignore the current schema", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);
    fs.writeFileSync(
      path.join("gassma", "schema.prisma"),
      "model Post {\n  id Int @id\n}\n",
    );

    migrateDeploy({ output: "./out" });

    expect(readStub()).toBe(userTrail);
  });

  it("should keep the recorded acceptDataLoss", () => {
    writeSchema();
    writeTrail(
      "20260729040506",
      trailFor('      { name: "User", columns: ["id"] }', true),
    );

    migrateDeploy({ output: "./out" });

    expect(readStub()).toContain("acceptDataLoss: true,");
  });

  it("should warn about deletions when the recorded migration accepts data loss", () => {
    writeSchema();
    writeTrail(
      "20260729040506",
      trailFor('      { name: "User", columns: ["id"] }', true),
    );

    migrateDeploy({ output: "./out" });

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain(
      "will delete sheets and columns that are not in the schema",
    );
  });

  it("should not warn about deletions when the recorded migration does not accept data loss", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);

    migrateDeploy({ output: "./out" });

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).not.toContain(
      "will delete sheets and columns that are not in the schema",
    );
  });

  it("should report which recorded migration was used", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);

    migrateDeploy({ output: "./out" });

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain(
      path.join("gassma", "migrations", "20260729040506", "migration.js"),
    );
  });

  it("should print next steps", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);

    migrateDeploy({ output: "./out" });

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should resolve the output directory from rootDir in .clasp.json", () => {
    writeSchema();
    writeTrail("20260729040506", userTrail);
    fs.writeFileSync(".clasp.json", JSON.stringify({ rootDir: "./dist" }));

    migrateDeploy();

    expect(fs.existsSync(path.join("dist", "gassma-migration.js"))).toBe(true);
  });

  it("should throw when no migration was ever recorded", () => {
    writeSchema();

    expect(() => migrateDeploy({ output: "./out" })).toThrow(
      NoMigrationTrailError,
    );
    expect(() => migrateDeploy({ output: "./out" })).toThrow("migrate dev");
  });

  it("should not write a stub when no migration was ever recorded", () => {
    writeSchema();

    expect(() => migrateDeploy({ output: "./out" })).toThrow();
    expect(fs.existsSync(path.join("out", "gassma-migration.js"))).toBe(false);
  });
});
