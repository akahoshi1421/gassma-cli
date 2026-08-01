import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dbPush } from "../../db/dbPushCommand";
import { migrate } from "../../migrate/migrateCommand";

const schemaWithDatasource = `
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}

model User {
  id   Int    @id
  name String
}
`;

const fixedDeps = {
  now: () => new Date(Date.UTC(2026, 6, 29, 4, 5, 6)),
};

const writeSchema = (schema: string): void => {
  fs.mkdirSync("gassma", { recursive: true });
  fs.writeFileSync(path.join("gassma", "schema.prisma"), schema);
};

const getLoggedOutput = (): string =>
  vi
    .mocked(console.log)
    .mock.calls.map((call) => call.join(" "))
    .join("\n");

describe("dbPush", () => {
  const ctx = { tmpDir: "", originalCwd: "" };

  beforeEach(() => {
    ctx.tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-db-push-cmd-")),
    );
    ctx.originalCwd = process.cwd();
    process.chdir(ctx.tmpDir);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(ctx.originalCwd);
    fs.rmSync(ctx.tmpDir, { recursive: true, force: true });
  });

  it("should write gassma-migration.js into the --output directory", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toBe(`function gassmaMigrate() {
  Gassma.migrateSheets({
    spreadsheetId: "abc123",
    models: [
      { name: "User", columns: ["id", "name"] }
    ]
  });
}
`);
  });

  it("should write the same stub content as migrate", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./migrate-out" }, fixedDeps);
    dbPush({ output: "./push-out" });

    expect(
      fs.readFileSync(path.join("push-out", "gassma-migration.js"), "utf-8"),
    ).toBe(
      fs.readFileSync(path.join("migrate-out", "gassma-migration.js"), "utf-8"),
    );
  });

  it("should not create a migrations directory even when run twice", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });
    dbPush({ output: "./out" });

    expect(fs.existsSync(path.join("gassma", "migrations"))).toBe(false);
    expect(fs.existsSync("migrations")).toBe(false);
    expect(fs.readdirSync("gassma")).toEqual(["schema.prisma"]);
  });

  it("should include acceptDataLoss between spreadsheetId and models when requested", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out", acceptDataLoss: true });

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toBe(`function gassmaMigrate() {
  Gassma.migrateSheets({
    spreadsheetId: "abc123",
    acceptDataLoss: true,
    models: [
      { name: "User", columns: ["id", "name"] }
    ]
  });
}
`);
  });

  it("should warn about deletions when acceptDataLoss is requested", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out", acceptDataLoss: true });

    expect(getLoggedOutput()).toContain(
      'Running the "gassmaMigrate" function will delete sheets and columns that are not in the schema.',
    );
  });

  it("should not warn about deletions without acceptDataLoss", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });

    expect(getLoggedOutput()).not.toContain(
      "will delete sheets and columns that are not in the schema",
    );
  });

  it("should resolve the output directory from rootDir in .clasp.json", () => {
    writeSchema(schemaWithDatasource);
    fs.writeFileSync(".clasp.json", JSON.stringify({ rootDir: "./dist" }));

    dbPush();

    expect(fs.existsSync(path.join("dist", "gassma-migration.js"))).toBe(true);
  });

  it("should throw when no output directory can be resolved", () => {
    writeSchema(schemaWithDatasource);

    expect(() => dbPush()).toThrow("--output");
  });

  it("should not print the already-in-sync message when run twice", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });
    dbPush({ output: "./out" });

    const logged = getLoggedOutput();
    expect(logged).not.toContain("Already in sync");
    expect(logged).not.toContain("no new migration recorded");
  });

  it("should rewrite gassma-migration.js on every run", () => {
    writeSchema(schemaWithDatasource);
    dbPush({ output: "./out" });
    fs.rmSync(path.join("out", "gassma-migration.js"));

    dbPush({ output: "./out" });

    expect(fs.existsSync(path.join("out", "gassma-migration.js"))).toBe(true);
  });

  it("should print next steps after generating", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });

    const logged = getLoggedOutput();
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should announce the sync script instead of a migration", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });

    const logged = getLoggedOutput();
    expect(logged).toContain("✅ Sync script generated");
    expect(logged).not.toContain("Migration generated");
  });

  it("should keep migrate recording a trail after db push", () => {
    writeSchema(schemaWithDatasource);

    dbPush({ output: "./out" });
    migrate({ output: "./out" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });
});
