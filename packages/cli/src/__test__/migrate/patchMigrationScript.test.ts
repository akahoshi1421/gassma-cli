import { describe, expect, it } from "vitest";
import { patchMigrationScript } from "../../migrate/patchMigrationScript";
import { readTemplate } from "../../util/readTemplate";

const template = readTemplate("gassma-migration.js.template");

const baseOptions = {
  userSymbol: "Gassma",
  definition: {
    models: [{ name: "User", columns: ["id", "name"] }],
  },
} satisfies Parameters<typeof patchMigrationScript>[1];

describe("patchMigrationScript", () => {
  it("should keep the gassmaMigrate top-level function name", () => {
    const result = patchMigrationScript(template, baseOptions);
    expect(result).toContain("function gassmaMigrate()");
  });

  it("should call migrateSheets on the default Gassma symbol", () => {
    const result = patchMigrationScript(template, baseOptions);
    expect(result).toContain("Gassma.migrateSheets(");
  });

  it("should call migrateSheets on a custom user symbol", () => {
    const result = patchMigrationScript(template, {
      ...baseOptions,
      userSymbol: "MyGassma",
    });
    expect(result).toContain("MyGassma.migrateSheets(");
    expect(result).not.toMatch(/(?<!My)Gassma\.migrateSheets/);
  });

  it("should render each model with its name and columns", () => {
    const result = patchMigrationScript(template, {
      ...baseOptions,
      definition: {
        models: [
          { name: "User", columns: ["id", "name"] },
          { name: "_PostToTag", columns: ["postId", "tagId"] },
        ],
      },
    });
    expect(result).toContain('{ name: "User", columns: ["id", "name"] }');
    expect(result).toContain(
      '{ name: "_PostToTag", columns: ["postId", "tagId"] }',
    );
  });

  it("should include spreadsheetId when given", () => {
    const result = patchMigrationScript(template, {
      ...baseOptions,
      definition: { ...baseOptions.definition, spreadsheetId: "abc123" },
    });
    expect(result).toContain('spreadsheetId: "abc123",');
  });

  it("should omit spreadsheetId when not given", () => {
    const result = patchMigrationScript(template, baseOptions);
    expect(result).not.toContain("spreadsheetId");
  });

  it("should escape double quotes in sheet and column names", () => {
    const result = patchMigrationScript(template, {
      ...baseOptions,
      definition: {
        models: [{ name: 'Sheet"1', columns: ['col"a'] }],
      },
    });
    expect(result).toContain('"Sheet\\"1"');
    expect(result).toContain('"col\\"a"');
  });

  it("should produce syntactically valid JavaScript", () => {
    const result = patchMigrationScript(template, {
      ...baseOptions,
      definition: {
        spreadsheetId: "abc123",
        models: [
          { name: "User", columns: ["id", "name"] },
          { name: "_PostToTag", columns: ["postId", "tagId"] },
        ],
      },
    });
    expect(() => new Function(result)).not.toThrow();
  });

  it("should end with a newline", () => {
    const result = patchMigrationScript(template, baseOptions);
    expect(result.endsWith("\n")).toBe(true);
  });

  it("should render the full expected script", () => {
    const result = patchMigrationScript(template, {
      userSymbol: "Gassma",
      definition: {
        spreadsheetId: "abc123",
        models: [
          { name: "User", columns: ["id", "name"] },
          { name: "Post", columns: ["id", "authorId"] },
        ],
      },
    });
    expect(result).toBe(`function gassmaMigrate() {
  Gassma.migrateSheets({
    spreadsheetId: "abc123",
    models: [
      { name: "User", columns: ["id", "name"] },
      { name: "Post", columns: ["id", "authorId"] }
    ]
  });
}
`);
  });
});
