import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GASSMA_LIBRARY } from "../../bootstrap/const/gassmaLibrary";
import { ThroughSheetConflictError } from "../../error/mainError";
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

const schemaWithoutDatasource = `
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

describe("migrate", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-migrate-cmd-")),
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

  it("should write gassma-migration.js into the --output directory", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out" }, fixedDeps);

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

  it("should include acceptDataLoss between spreadsheetId and models when requested", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

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

  it("should include acceptDataLoss when no spreadsheetId is available", () => {
    writeSchema(schemaWithoutDatasource);

    migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toContain("acceptDataLoss: true,");
    expect(content).not.toContain("spreadsheetId");
  });

  it("should resolve the output directory from rootDir in .clasp.json", () => {
    writeSchema(schemaWithDatasource);
    fs.writeFileSync(".clasp.json", JSON.stringify({ rootDir: "./dist" }));

    migrate(undefined, fixedDeps);

    expect(fs.existsSync(path.join("dist", "gassma-migration.js"))).toBe(true);
  });

  it("should throw when no output directory can be resolved", () => {
    writeSchema(schemaWithDatasource);

    expect(() => migrate(undefined, fixedDeps)).toThrow("--output");
  });

  it("should omit spreadsheetId when no datasource url is available", () => {
    writeSchema(schemaWithoutDatasource);

    migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).not.toContain("spreadsheetId");
  });

  it("should use the userSymbol from appsscript.json in the output directory", () => {
    writeSchema(schemaWithDatasource);
    fs.mkdirSync("out", { recursive: true });
    fs.writeFileSync(
      path.join("out", "appsscript.json"),
      JSON.stringify({
        dependencies: {
          libraries: [
            {
              userSymbol: "MyGassma",
              libraryId: GASSMA_LIBRARY.scriptId,
              version: "10",
            },
          ],
        },
      }),
    );

    migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toContain("MyGassma.migrateSheets(");
  });

  it("should write distinct columns for self-referencing and normal through sheets", () => {
    writeSchema(`
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}

model Post {
  id     Int     @id
  labels Label[]
}

model Label {
  id    Int    @id
  posts Post[]
}

model Tag {
  id        Int   @id
  related   Tag[] @relation("TagRelations")
  relatedBy Tag[] @relation("TagRelations")
}
`);

    migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toContain(
      '{ name: "_TagRelations", columns: ["tagAId", "tagBId"] }',
    );
    expect(content).toContain(
      '{ name: "_LabelToPost", columns: ["labelId", "postId"] }',
    );
  });

  it("should fail when one through sheet is shared by two different model pairs", () => {
    writeSchema(`
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}

model Post {
  id   Int   @id
  tags Tag[] @relation("Links")
}

model Tag {
  id    Int    @id
  posts Post[] @relation("Links")
}

model User {
  id     Int     @id
  groups Group[] @relation("Links")
}

model Group {
  id    Int    @id
  users User[] @relation("Links")
}
`);

    expect(() => migrate({ output: "./out" }, fixedDeps)).toThrow(
      ThroughSheetConflictError,
    );
    expect(() => migrate({ output: "./out" }, fixedDeps)).toThrow(/_Links/);
  });

  it("should write one through sheet per named relation while keeping unnamed names", () => {
    writeSchema(`
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}

model Post {
  id     Int     @id
  labels Label[]
}

model Label {
  id    Int    @id
  posts Post[]
}

model User {
  id         Int    @id
  follows    User[] @relation("Follows")
  followedBy User[] @relation("Follows")
  blocks     User[] @relation("Blocks")
  blockedBy  User[] @relation("Blocks")
}
`);

    migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toContain(
      '{ name: "_Follows", columns: ["userAId", "userBId"] }',
    );
    expect(content).toContain(
      '{ name: "_Blocks", columns: ["userAId", "userBId"] }',
    );
    expect(content).toContain(
      '{ name: "_LabelToPost", columns: ["labelId", "postId"] }',
    );
  });

  it("should record the migration next to the schema with the timestamped name", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out", name: "init" }, fixedDeps);

    const trailPath = path.join(
      "gassma",
      "migrations",
      "20260729040506_init",
      "migration.js",
    );
    expect(fs.readFileSync(trailPath, "utf-8")).toBe(
      fs.readFileSync(path.join("out", "gassma-migration.js"), "utf-8"),
    );
  });

  it("should record acceptDataLoss in the migration trail", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const trail = fs.readFileSync(
      path.join("gassma", "migrations", "20260729040506", "migration.js"),
      "utf-8",
    );
    expect(trail).toBe(
      fs.readFileSync(path.join("out", "gassma-migration.js"), "utf-8"),
    );
    expect(trail).toContain("acceptDataLoss: true,");
  });

  it("should not record a second migration when run twice with acceptDataLoss", () => {
    writeSchema(schemaWithDatasource);
    migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    migrate({ output: "./out", acceptDataLoss: true }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });

  it("should name the migration directory with the timestamp only when --name is omitted", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });

  it("should keep a name with path separators inside a single flat directory", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out", name: "evil/sub" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_evil_sub",
    ]);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    migrate({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_evil_sub",
    ]);
  });

  it("should keep a traversal name inside the migrations directory", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out", name: "../../../outside-trail" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_outside_trail",
    ]);
    expect(fs.readdirSync("gassma").sort()).toEqual([
      "migrations",
      "schema.prisma",
    ]);
    expect(fs.existsSync("outside-trail")).toBe(false);
  });

  it("should not record a second migration when nothing changed", () => {
    writeSchema(schemaWithDatasource);
    migrate({ output: "./out" }, fixedDeps);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    migrate({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
    expect(console.log).toHaveBeenCalledWith(
      "Already in sync, no schema change or pending migration was found.",
    );
  });

  it("should not claim a migration was generated when already in sync", () => {
    writeSchema(schemaWithDatasource);
    migrate({ output: "./out" }, fixedDeps);
    vi.mocked(console.log).mockClear();

    migrate({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).not.toContain("Migration generated");
    expect(logged).toContain("Refreshed gassma-migration.js");
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should rewrite gassma-migration.js even when already in sync", () => {
    writeSchema(schemaWithDatasource);
    migrate({ output: "./out" }, fixedDeps);
    fs.rmSync(path.join("out", "gassma-migration.js"));

    migrate({ output: "./out" }, fixedDeps);

    expect(fs.existsSync(path.join("out", "gassma-migration.js"))).toBe(true);
  });

  it("should record a new migration when the schema changed", () => {
    writeSchema(schemaWithDatasource);
    migrate({ output: "./out" }, fixedDeps);

    writeSchema(`${schemaWithDatasource}
model Post {
  id Int @id
}
`);
    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    migrate({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations")).sort()).toEqual([
      "20260729040506",
      "20260730000000",
    ]);
  });

  it("should throw when the schema has no models", () => {
    fs.mkdirSync("gassma", { recursive: true });
    fs.writeFileSync(
      path.join("gassma", "schema.prisma"),
      'datasource db {\n  provider = "gassma"\n  url = ""\n}\n',
    );

    expect(() => migrate({ output: "./out" }, fixedDeps)).toThrow(
      "GASsmaNoModelsError",
    );
  });

  it("should read the schema from the --schema option", () => {
    fs.mkdirSync("custom", { recursive: true });
    fs.writeFileSync(path.join("custom", "app.prisma"), schemaWithDatasource);

    migrate({ output: "./out", schema: "custom/app.prisma" }, fixedDeps);

    expect(
      fs.existsSync(
        path.join("custom", "migrations", "20260729040506", "migration.js"),
      ),
    ).toBe(true);
  });

  it("should print next steps after generating", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should warn about deletions when acceptDataLoss is requested", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain(
      "deletes sheets and columns that are not in the schema",
    );
  });

  it("should not warn about deletions without acceptDataLoss", () => {
    writeSchema(schemaWithDatasource);

    migrate({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).not.toContain(
      "deletes sheets and columns that are not in the schema",
    );
  });
});
