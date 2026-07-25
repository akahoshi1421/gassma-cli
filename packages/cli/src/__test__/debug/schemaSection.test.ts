import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildSchemaLines,
  collectSchemaStatus,
} from "../../debug/sections/schemaSection";
import { createStyler } from "../../debug/styles";

const plain = createStyler(false);

const SCHEMA_WITH_OUTPUT = `generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model User {
  id   Int    @id
  name String
}
`;

describe("collectSchemaStatus", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-debug-schema-")),
    );
    tmpDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should resolve a single schema file from the default directory", () => {
    fs.mkdirSync(path.join(tmpDir, "gassma"));
    fs.writeFileSync(
      path.join(tmpDir, "gassma", "schema.prisma"),
      SCHEMA_WITH_OUTPUT,
    );

    const status = collectSchemaStatus({});

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.files).toHaveLength(1);
      expect(status.schemaName).toBe("Schema");
      expect(status.previewFeatures).toEqual([]);
      expect(status.mergedText).toContain("model User");
    }
  });

  it("should resolve multiple schema files and derive the name from the directory", () => {
    fs.mkdirSync(path.join(tmpDir, "gassma"));
    fs.writeFileSync(
      path.join(tmpDir, "gassma", "a.prisma"),
      SCHEMA_WITH_OUTPUT,
    );
    fs.writeFileSync(path.join(tmpDir, "gassma", "b.prisma"), "model B { }\n");

    const status = collectSchemaStatus({});

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.files).toHaveLength(2);
      expect(status.schemaName).toBe("Gassma");
    }
  });

  it("should extract preview features from the schema", () => {
    fs.mkdirSync(path.join(tmpDir, "gassma"));
    fs.writeFileSync(
      path.join(tmpDir, "gassma", "schema.prisma"),
      `generator client {
  provider        = "prisma-client-js"
  output          = "./generated"
  previewFeatures = ["strictUndefinedChecks"]
}
`,
    );

    const status = collectSchemaStatus({});

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.previewFeatures).toEqual(["strictUndefinedChecks"]);
    }
  });

  it("should fall back to empty preview features when the schema cannot be parsed", () => {
    fs.mkdirSync(path.join(tmpDir, "gassma"));
    fs.writeFileSync(
      path.join(tmpDir, "gassma", "schema.prisma"),
      "model Broken {",
    );

    const status = collectSchemaStatus({});

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.previewFeatures).toEqual([]);
    }
  });

  it("should report a one-line error when the schema directory is missing", () => {
    const status = collectSchemaStatus({});

    expect(status.kind).toBe("error");
    if (status.kind === "error") {
      expect(status.message).not.toContain("\n");
      expect(status.message).toContain("directory not found");
    }
  });
});

describe("buildSchemaLines", () => {
  it("should list one Path line per schema file plus preview features", () => {
    const lines = buildSchemaLines(
      {
        kind: "found",
        files: [
          { filePath: "/abs/gassma/a.prisma", displayName: "a.prisma" },
          { filePath: "/abs/gassma/b.prisma", displayName: "b.prisma" },
        ],
        baseDir: "/abs/gassma",
        schemaName: "Gassma",
        mergedText: "",
        previewFeatures: ["strictUndefinedChecks"],
      },
      plain,
    );

    expect(lines).toEqual([
      "-- Gassma schema --",
      "Path: /abs/gassma/a.prisma",
      "Path: /abs/gassma/b.prisma",
      "Preview features: strictUndefinedChecks",
    ]);
  });

  it("should dim the preview features line when none are set", () => {
    const styler = createStyler(true);
    const lines = buildSchemaLines(
      {
        kind: "found",
        files: [{ filePath: "/abs/gassma/a.prisma", displayName: "a.prisma" }],
        baseDir: "/abs/gassma",
        schemaName: "A",
        mergedText: "",
        previewFeatures: [],
      },
      styler,
    );

    expect(lines[2]).toBe("\u001b[2mPreview features: (none)\u001b[22m");
  });

  it("should render the not-found message on error", () => {
    const lines = buildSchemaLines(
      { kind: "error", message: "./gassma/ directory not found." },
      plain,
    );

    expect(lines).toEqual([
      "-- Gassma schema --",
      "Could not resolve schema: ./gassma/ directory not found.",
    ]);
  });
});
