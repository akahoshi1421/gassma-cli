import fs from "fs";
import os from "os";
import path from "path";
import { Readable, Writable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GASSMA_LIBRARY } from "../../bootstrap/const/gassmaLibrary";
import {
  MigrateConfirmationRequiredError,
  ThroughSheetConflictError,
} from "../../error/mainError";
import { migrateDev } from "../../migrate/migrateDevCommand";
import type { MigrateDevDeps } from "../../migrate/migrateDevCommand";

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

const schemaWithMemo = `${schemaWithDatasource}
model Memo {
  id Int @id
}
`;

const laterDeps = {
  now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
};

const writeSchema = (schema: string): void => {
  fs.mkdirSync("gassma", { recursive: true });
  fs.writeFileSync(path.join("gassma", "schema.prisma"), schema);
};

const createOutput = (): { stream: Writable; text: () => string } => {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });
  return { stream, text: () => chunks.join("") };
};

const answerDeps = (
  answer: string,
  options: { now?: () => Date; isTty?: boolean; output?: Writable } = {},
): MigrateDevDeps => ({
  now: options.now ?? laterDeps.now,
  input: Readable.from(answer === "" ? [] : [answer]),
  output: options.output ?? createOutput().stream,
  isTty: options.isTty ?? true,
});

const readStub = (): string =>
  fs.readFileSync(path.join("out", "gassma-migration.js"), "utf-8");

describe("migrateDev", () => {
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

    await migrateDev({ output: "./out" }, fixedDeps);

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

  it("should include acceptDataLoss between spreadsheetId and models once a drop is accepted", async () => {
    writeSchema(schemaWithMemo);
    await migrateDev({ output: "./out" }, fixedDeps);
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out" }, answerDeps("y\n"));

    expect(readStub()).toBe(`function gassmaMigrate() {
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
    writeSchema(`${schemaWithoutDatasource}
model Memo {
  id Int @id
}
`);
    await migrateDev({ output: "./out" }, fixedDeps);
    writeSchema(schemaWithoutDatasource);

    await migrateDev({ output: "./out" }, answerDeps("y\n"));

    expect(readStub()).toContain("acceptDataLoss: true,");
    expect(readStub()).not.toContain("spreadsheetId");
  });

  it("should leave acceptDataLoss out when nothing is dropped", async () => {
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out" }, fixedDeps);

    expect(readStub()).not.toContain("acceptDataLoss");
  });

  it("should resolve the output directory from rootDir in .clasp.json", async () => {
    writeSchema(schemaWithDatasource);
    fs.writeFileSync(".clasp.json", JSON.stringify({ rootDir: "./dist" }));

    await migrateDev(undefined, fixedDeps);

    expect(fs.existsSync(path.join("dist", "gassma-migration.js"))).toBe(true);
  });

  it("should throw when no output directory can be resolved", async () => {
    writeSchema(schemaWithDatasource);

    await expect(migrateDev(undefined, fixedDeps)).rejects.toThrow("--output");
  });

  it("should omit spreadsheetId when no datasource url is available", async () => {
    writeSchema(schemaWithoutDatasource);

    await migrateDev({ output: "./out" }, fixedDeps);

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

    await migrateDev({ output: "./out" }, fixedDeps);

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

    await migrateDev({ output: "./out" }, fixedDeps);

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

    await expect(migrateDev({ output: "./out" }, fixedDeps)).rejects.toThrow(
      ThroughSheetConflictError,
    );
    await expect(migrateDev({ output: "./out" }, fixedDeps)).rejects.toThrow(
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

    await migrateDev({ output: "./out" }, fixedDeps);

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

    await migrateDev({ output: "./out" }, fixedDeps);

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

    await migrateDev({ output: "./out", name: "init" }, fixedDeps);

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
    writeSchema(schemaWithMemo);
    await migrateDev({ output: "./out" }, fixedDeps);
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out" }, answerDeps("y\n"));

    const trail = fs.readFileSync(
      path.join("gassma", "migrations", "20260730000000", "migration.js"),
      "utf-8",
    );
    expect(trail).toBe(readStub());
    expect(trail).toContain("acceptDataLoss: true,");
  });

  it("should not record a second migration when run again after an accepted drop", async () => {
    writeSchema(schemaWithMemo);
    await migrateDev({ output: "./out" }, fixedDeps);
    writeSchema(schemaWithDatasource);
    await migrateDev({ output: "./out" }, answerDeps("y\n"));

    await migrateDev(
      { output: "./out" },
      answerDeps("n\n", {
        now: () => new Date(Date.UTC(2026, 6, 31, 0, 0, 0)),
      }),
    );

    expect(fs.readdirSync(path.join("gassma", "migrations")).sort()).toEqual([
      "20260729040506",
      "20260730000000",
    ]);
  });

  it("should keep the recorded acceptDataLoss when refreshing an unchanged schema", async () => {
    writeSchema(schemaWithMemo);
    await migrateDev({ output: "./out" }, fixedDeps);
    writeSchema(schemaWithDatasource);
    await migrateDev({ output: "./out" }, answerDeps("y\n"));
    fs.rmSync(path.join("out", "gassma-migration.js"));

    await migrateDev(
      { output: "./out" },
      answerDeps("n\n", {
        now: () => new Date(Date.UTC(2026, 6, 31, 0, 0, 0)),
      }),
    );

    expect(readStub()).toContain("acceptDataLoss: true,");
  });

  it("should name the migration directory with the timestamp only when --name is omitted", async () => {
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
  });

  it("should keep a name with path separators inside a single flat directory", async () => {
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out", name: "evil/sub" }, fixedDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_evil_sub",
    ]);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrateDev({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506_evil_sub",
    ]);
  });

  it("should keep a traversal name inside the migrations directory", async () => {
    writeSchema(schemaWithDatasource);

    await migrateDev(
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
    await migrateDev({ output: "./out" }, fixedDeps);

    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrateDev({ output: "./out" }, laterDeps);

    expect(fs.readdirSync(path.join("gassma", "migrations"))).toEqual([
      "20260729040506",
    ]);
    expect(console.log).toHaveBeenCalledWith(
      "Already in sync, no schema change or pending migration was found.",
    );
  });

  it("should not claim a migration was generated when already in sync", async () => {
    writeSchema(schemaWithDatasource);
    await migrateDev({ output: "./out" }, fixedDeps);
    vi.mocked(console.log).mockClear();

    await migrateDev({ output: "./out" }, fixedDeps);

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
    await migrateDev({ output: "./out" }, fixedDeps);
    fs.rmSync(path.join("out", "gassma-migration.js"));

    await migrateDev({ output: "./out" }, fixedDeps);

    expect(fs.existsSync(path.join("out", "gassma-migration.js"))).toBe(true);
  });

  it("should record a new migration when the schema changed", async () => {
    writeSchema(schemaWithDatasource);
    await migrateDev({ output: "./out" }, fixedDeps);

    writeSchema(`${schemaWithDatasource}
model Post {
  id Int @id
}
`);
    const laterDeps = {
      now: () => new Date(Date.UTC(2026, 6, 30, 0, 0, 0)),
    };
    await migrateDev({ output: "./out" }, laterDeps);

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

    await expect(migrateDev({ output: "./out" }, fixedDeps)).rejects.toThrow(
      "GASsmaNoModelsError",
    );
  });

  it("should read the schema from the --schema option", async () => {
    fs.mkdirSync("custom", { recursive: true });
    fs.writeFileSync(path.join("custom", "app.prisma"), schemaWithDatasource);

    await migrateDev(
      { output: "./out", schema: "custom/app.prisma" },
      fixedDeps,
    );

    expect(
      fs.existsSync(
        path.join("custom", "migrations", "20260729040506", "migration.js"),
      ),
    ).toBe(true);
  });

  it("should print next steps after generating", async () => {
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain("clasp push");
    expect(logged).toContain("gassmaMigrate");
  });

  it("should warn about deletions once a drop is accepted", async () => {
    writeSchema(schemaWithMemo);
    await migrateDev({ output: "./out" }, fixedDeps);
    writeSchema(schemaWithDatasource);
    vi.mocked(console.log).mockClear();

    await migrateDev({ output: "./out" }, answerDeps("y\n"));

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).toContain(
      'Running the "gassmaMigrate" function will delete sheets and columns that are not in the schema.',
    );
  });

  it("should not warn about deletions when nothing is dropped", async () => {
    writeSchema(schemaWithDatasource);

    await migrateDev({ output: "./out" }, fixedDeps);

    const logged = vi
      .mocked(console.log)
      .mock.calls.map((call) => call.join(" "))
      .join("\n");
    expect(logged).not.toContain(
      "will delete sheets and columns that are not in the schema",
    );
  });

  describe("drop confirmation", () => {
    const stubPath = path.join("out", "gassma-migration.js");
    const migrationsDir = path.join("gassma", "migrations");

    const recordMemoMigration = async (): Promise<void> => {
      writeSchema(schemaWithMemo);
      await migrateDev({ output: "./out" }, fixedDeps);
      writeSchema(schemaWithDatasource);
    };

    it("should ask before dropping a sheet that the last migration recorded", async () => {
      await recordMemoMigration();
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("y\n", { output: output.stream }),
      );

      expect(output.text()).toContain('sheet "Memo"');
      expect(output.text()).toContain("Continue? (y/N)");
    });

    it("should ask before dropping a column that the last migration recorded", async () => {
      writeSchema(schemaWithDatasource);
      await migrateDev({ output: "./out" }, fixedDeps);
      writeSchema(`
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}

model User {
  id Int @id
}
`);
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("y\n", { output: output.stream }),
      );

      expect(output.text()).toContain('column "name" in sheet "User"');
      expect(readStub()).toContain("acceptDataLoss: true,");
    });

    it("should write nothing when the confirmation is refused", async () => {
      await recordMemoMigration();
      const before = fs.readFileSync(stubPath, "utf-8");

      await migrateDev({ output: "./out" }, answerDeps("n\n"));

      expect(fs.readFileSync(stubPath, "utf-8")).toBe(before);
      expect(fs.readdirSync(migrationsDir)).toEqual(["20260729040506"]);
    });

    it("should say that nothing was written when the confirmation is refused", async () => {
      await recordMemoMigration();
      vi.mocked(console.log).mockClear();

      await migrateDev({ output: "./out" }, answerDeps("n\n"));

      const logged = vi
        .mocked(console.log)
        .mock.calls.map((call) => call.join(" "))
        .join("\n");
      expect(logged).toContain("Aborted");
      expect(logged).not.toContain("Next steps");
    });

    it("should ask before the stub is written", async () => {
      await recordMemoMigration();
      vi.mocked(console.log).mockClear();
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("n\n", { output: output.stream }),
      );

      const logged = vi
        .mocked(console.log)
        .mock.calls.map((call) => call.join(" "))
        .join("\n");
      expect(output.text()).toContain("Continue? (y/N)");
      expect(logged).not.toContain("Wrote");
      expect(logged).not.toContain("Created");
    });

    it("should write the stub and the migration when the confirmation is accepted", async () => {
      await recordMemoMigration();

      await migrateDev({ output: "./out" }, answerDeps("y\n"));

      expect(readStub()).not.toContain("Memo");
      expect(fs.readdirSync(migrationsDir).sort()).toEqual([
        "20260729040506",
        "20260730000000",
      ]);
    });

    it("should not ask when no sheet or column is dropped", async () => {
      writeSchema(schemaWithDatasource);
      await migrateDev({ output: "./out" }, fixedDeps);
      writeSchema(schemaWithMemo);
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("n\n", { output: output.stream }),
      );

      expect(output.text()).toBe("");
      expect(readStub()).toContain("Memo");
    });

    it("should not ask on the first migration", async () => {
      writeSchema(schemaWithDatasource);
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("n\n", { now: fixedDeps.now, output: output.stream }),
      );

      expect(output.text()).toBe("");
      expect(fs.existsSync(stubPath)).toBe(true);
    });

    it("should stop without asking when there is no interactive terminal", async () => {
      await recordMemoMigration();
      const output = createOutput();

      await expect(
        migrateDev(
          { output: "./out" },
          answerDeps("y\n", { isTty: false, output: output.stream }),
        ),
      ).rejects.toThrow(MigrateConfirmationRequiredError);

      expect(output.text()).toContain('sheet "Memo"');
      expect(output.text()).not.toContain("Continue? (y/N)");
    });

    it("should point at migrate deploy when there is no interactive terminal", async () => {
      await recordMemoMigration();

      await expect(
        migrateDev({ output: "./out" }, answerDeps("y\n", { isTty: false })),
      ).rejects.toThrow("migrate deploy");
    });

    it("should write nothing when there is no interactive terminal", async () => {
      await recordMemoMigration();
      const before = fs.readFileSync(stubPath, "utf-8");

      await expect(
        migrateDev({ output: "./out" }, answerDeps("y\n", { isTty: false })),
      ).rejects.toThrow();

      expect(fs.readFileSync(stubPath, "utf-8")).toBe(before);
      expect(fs.readdirSync(migrationsDir)).toEqual(["20260729040506"]);
    });

    it("should succeed without an interactive terminal when nothing is dropped", async () => {
      writeSchema(schemaWithDatasource);
      await migrateDev({ output: "./out" }, fixedDeps);
      writeSchema(schemaWithMemo);

      await migrateDev({ output: "./out" }, answerDeps("", { isTty: false }));

      expect(readStub()).toContain("Memo");
    });

    it("should warn and keep deletion off when the recorded migration cannot be read", async () => {
      await recordMemoMigration();
      fs.writeFileSync(
        path.join(migrationsDir, "20260729040506", "migration.js"),
        "function gassmaMigrate( {",
      );
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("y\n", { output: output.stream }),
      );

      expect(output.text()).toContain("could not be read");
      expect(output.text()).not.toContain("Continue? (y/N)");
      expect(readStub()).not.toContain("acceptDataLoss");
    });

    it("should not hang without an interactive terminal when the recorded migration cannot be read", async () => {
      await recordMemoMigration();
      fs.writeFileSync(
        path.join(migrationsDir, "20260729040506", "migration.js"),
        "function gassmaMigrate( {",
      );
      const output = createOutput();

      await migrateDev(
        { output: "./out" },
        answerDeps("", { isTty: false, output: output.stream }),
      );

      expect(output.text()).toContain("could not be read");
      expect(fs.existsSync(stubPath)).toBe(true);
    });
  });
});
