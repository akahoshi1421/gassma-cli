import fs from "fs";
import os from "os";
import path from "path";
import { Readable, Writable } from "stream";
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

  it("should write gassma-migration.js into the --output directory", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out" }, fixedDeps);

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

  it("should include acceptDataLoss between spreadsheetId and models when requested", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

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

  it("should include acceptDataLoss when no spreadsheetId is available", async () => {
    writeSchema(schemaWithoutDatasource);

    await migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toContain("acceptDataLoss: true,");
    expect(content).not.toContain("spreadsheetId");
  });

  it("should resolve the output directory from rootDir in .clasp.json", async () => {
    writeSchema(schemaWithDatasource);
    fs.writeFileSync(".clasp.json", JSON.stringify({ rootDir: "./dist" }));

    await migrate(undefined, fixedDeps);

    expect(fs.existsSync(path.join("dist", "gassma-migration.js"))).toBe(true);
  });

  it("should throw when no output directory can be resolved", async () => {
    writeSchema(schemaWithDatasource);

    await expect(migrate(undefined, fixedDeps)).rejects.toThrow("--output");
  });

  it("should omit spreadsheetId when no datasource url is available", async () => {
    writeSchema(schemaWithoutDatasource);

    await migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).not.toContain("spreadsheetId");
  });

  it("should use the userSymbol from appsscript.json in the output directory", async () => {
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

    await migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toContain("MyGassma.migrateSheets(");
  });

  it("should write distinct columns for self-referencing and normal through sheets", async () => {
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

    await migrate({ output: "./out" }, fixedDeps);

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

  it("should fail when one through sheet is shared by two different model pairs", async () => {
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

    await expect(migrate({ output: "./out" }, fixedDeps)).rejects.toThrow(
      ThroughSheetConflictError,
    );
    await expect(migrate({ output: "./out" }, fixedDeps)).rejects.toThrow(
      /_Links/,
    );
  });

  it("should write one through sheet per named relation while keeping unnamed names", async () => {
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

    await migrate({ output: "./out" }, fixedDeps);

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

  it("should write only the named through sheet when a named list precedes an unnamed list", async () => {
    writeSchema(`
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}

model User {
  id     Int    @id
  pinned Post[] @relation("Pinned")
  posts  Post[]
}

model Post {
  id       Int    @id
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
  pinnedBy User[] @relation("Pinned")
}
`);

    await migrate({ output: "./out" }, fixedDeps);

    const content = fs.readFileSync(
      path.join("out", "gassma-migration.js"),
      "utf-8",
    );
    expect(content).toBe(`function gassmaMigrate() {
  Gassma.migrateSheets({
    spreadsheetId: "abc123",
    models: [
      { name: "User", columns: ["id"] },
      { name: "Post", columns: ["id", "authorId"] },
      { name: "_Pinned", columns: ["postId", "userId"] }
    ]
  });
}
`);
  });

  it("should record the migration next to the schema with the timestamped name", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out", name: "init" }, fixedDeps);

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

  it("should record acceptDataLoss in the migration trail", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const trail = fs.readFileSync(
      path.join("gassma", "migrations", "20260729040506", "migration.js"),
      "utf-8",
    );
    expect(trail).toBe(
      fs.readFileSync(path.join("out", "gassma-migration.js"), "utf-8"),
    );
    expect(trail).toContain("acceptDataLoss: true,");
  });

  it("should not record a second migration when run twice with acceptDataLoss", async () => {
    writeSchema(schemaWithDatasource);
    await migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrate({ output: "./out", acceptDataLoss: true }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });

  it("should name the migration directory with the timestamp only when --name is omitted", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });

  it("should keep a name with path separators inside a single flat directory", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out", name: "evil/sub" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_evil_sub",
    ]);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrate({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_evil_sub",
    ]);
  });

  it("should keep a traversal name inside the migrations directory", async () => {
    writeSchema(schemaWithDatasource);

    await migrate(
      { output: "./out", name: "../../../outside-trail" },
      fixedDeps,
    );

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_outside_trail",
    ]);
    expect(fs.readdirSync("gassma").sort()).toEqual([
      "migrations",
      "schema.prisma",
    ]);
    expect(fs.existsSync("outside-trail")).toBe(false);
  });

  it("should not record a second migration when nothing changed", async () => {
    writeSchema(schemaWithDatasource);
    await migrate({ output: "./out" }, fixedDeps);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrate({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
    expect(console.log).toHaveBeenCalledWith(
      "Already in sync, no schema change or pending migration was found.",
    );
  });

  it("should not claim a migration was generated when already in sync", async () => {
    writeSchema(schemaWithDatasource);
    await migrate({ output: "./out" }, fixedDeps);
    vi.mocked(console.log).mockClear();

    await migrate({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).not.toContain("Migration generated");
    expect(logged).toContain("Refreshed gassma-migration.js");
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should rewrite gassma-migration.js even when already in sync", async () => {
    writeSchema(schemaWithDatasource);
    await migrate({ output: "./out" }, fixedDeps);
    fs.rmSync(path.join("out", "gassma-migration.js"));

    await migrate({ output: "./out" }, fixedDeps);

    expect(fs.existsSync(path.join("out", "gassma-migration.js"))).toBe(true);
  });

  it("should record a new migration when the schema changed", async () => {
    writeSchema(schemaWithDatasource);
    await migrate({ output: "./out" }, fixedDeps);

    writeSchema(`${schemaWithDatasource}
model Post {
  id Int @id
}
`);
    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrate({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations")).sort()).toEqual([
      "20260729040506",
      "20260730000000",
    ]);
  });

  it("should throw when the schema has no models", async () => {
    fs.mkdirSync("gassma", { recursive: true });
    fs.writeFileSync(
      path.join("gassma", "schema.prisma"),
      'datasource db {\n  provider = "gassma"\n  url = ""\n}\n',
    );

    await expect(migrate({ output: "./out" }, fixedDeps)).rejects.toThrow(
      "GASsmaNoModelsError",
    );
  });

  it("should read the schema from the --schema option", async () => {
    fs.mkdirSync("custom", { recursive: true });
    fs.writeFileSync(path.join("custom", "app.prisma"), schemaWithDatasource);

    await migrate({ output: "./out", schema: "custom/app.prisma" }, fixedDeps);

    expect(
      fs.existsSync(
        path.join("custom", "migrations", "20260729040506", "migration.js"),
      ),
    ).toBe(true);
  });

  it("should print next steps after generating", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should warn about deletions when acceptDataLoss is requested", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out", acceptDataLoss: true }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain(
      'Running the "gassmaMigrate" function will delete sheets and columns that are not in the schema.',
    );
  });

  it("should not warn about deletions without acceptDataLoss", async () => {
    writeSchema(schemaWithDatasource);

    await migrate({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).not.toContain(
      "will delete sheets and columns that are not in the schema",
    );
  });

  describe("drop confirmation", () => {
    const schemaWithMemo = `${schemaWithDatasource}
model Memo {
  id Int @id
}
`;
    const laterDeps = { now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)) };
    const stubPath = path.join("out", "gassma-migration.js");
    const migrationsDir = path.join("gassma", "migrations");

    const answer = (text: string): Readable => Readable.from([text]);

    const collectOutput = (): { stream: Writable; text: () => string } => {
      const chunks: string[] = [];
      const stream = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(String(chunk));
          callback();
        },
      });
      return { stream, text: () => chunks.join("") };
    };

    const recordMemoMigration = async (): Promise<void> => {
      writeSchema(schemaWithMemo);
      await migrate({ output: "./out" }, fixedDeps);
      writeSchema(schemaWithDatasource);
    };

    it("should ask before dropping a sheet that the last migration recorded", async () => {
      await recordMemoMigration();
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("y\n"),
          output: output.stream,
          isTty: true,
        },
      );

      expect(output.text()).toContain("Memo");
      expect(output.text()).toContain("Continue? (y/N)");
    });

    it("should write nothing when the confirmation is refused", async () => {
      await recordMemoMigration();
      const before = fs.readFileSync(stubPath, "utf-8");
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: true,
        },
      );

      expect(fs.readFileSync(stubPath, "utf-8")).toBe(before);
      expect(fs.readdirSync(migrationsDir)).toEqual(["20260729040506"]);
    });

    it("should say that nothing was written when the confirmation is refused", async () => {
      await recordMemoMigration();
      vi.mocked(console.log).mockClear();
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: true,
        },
      );

      const logged = vi
        .mocked(console.log)
        .mock.calls.map((call) => call.join(" "))
        .join("\n");
      expect(logged).toContain("Aborted");
      expect(logged).not.toContain("Next steps");
    });

    it("should write the stub and the migration when the confirmation is accepted", async () => {
      await recordMemoMigration();
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("y\n"),
          output: output.stream,
          isTty: true,
        },
      );

      expect(fs.readFileSync(stubPath, "utf-8")).not.toContain("Memo");
      expect(fs.readdirSync(migrationsDir).sort()).toEqual([
        "20260729040506",
        "20260730000000",
      ]);
    });

    it("should not ask without acceptDataLoss", async () => {
      await recordMemoMigration();
      const output = collectOutput();

      await migrate(
        { output: "./out" },
        {
          ...laterDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: true,
        },
      );

      expect(output.text()).toBe("");
      expect(fs.readFileSync(stubPath, "utf-8")).not.toContain("Memo");
    });

    it("should not ask when no sheet is dropped", async () => {
      writeSchema(schemaWithDatasource);
      await migrate({ output: "./out" }, fixedDeps);
      writeSchema(schemaWithMemo);
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: true,
        },
      );

      expect(output.text()).toBe("");
      expect(fs.readFileSync(stubPath, "utf-8")).toContain("Memo");
    });

    it("should not ask on the first migration", async () => {
      writeSchema(schemaWithDatasource);
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...fixedDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: true,
        },
      );

      expect(output.text()).toBe("");
      expect(fs.existsSync(stubPath)).toBe(true);
    });

    it("should warn and continue without an interactive terminal", async () => {
      await recordMemoMigration();
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: false,
        },
      );

      expect(output.text()).toContain("Memo");
      expect(output.text()).not.toContain("Continue? (y/N)");
      expect(fs.readFileSync(stubPath, "utf-8")).not.toContain("Memo");
      expect(fs.readdirSync(migrationsDir).sort()).toEqual([
        "20260729040506",
        "20260730000000",
      ]);
    });

    it("should ask before the stub is written", async () => {
      await recordMemoMigration();
      vi.mocked(console.log).mockClear();
      const output = collectOutput();

      await migrate(
        { output: "./out", acceptDataLoss: true },
        {
          ...laterDeps,
          input: answer("n\n"),
          output: output.stream,
          isTty: true,
        },
      );

      const logged = vi
        .mocked(console.log)
        .mock.calls.map((call) => call.join(" "))
        .join("\n");
      expect(output.text()).toContain("Continue? (y/N)");
      expect(logged).not.toContain("Wrote");
      expect(logged).not.toContain("Created");
    });
  });
});
