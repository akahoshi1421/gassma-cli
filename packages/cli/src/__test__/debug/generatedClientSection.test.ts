import { describe, expect, it } from "vitest";
import type { DebugFs } from "../../debug/env/debugFs";
import {
  buildGeneratedClientLines,
  collectGeneratedClientStatus,
} from "../../debug/sections/generatedClientSection";
import type { SchemaStatus } from "../../debug/sections/schemaSection";
import { createStyler } from "../../debug/styles";

const plain = createStyler(false);

const SCHEMA_TEXT = `generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model User {
  id Int @id
}
`;

const foundSchema = (
  overrides: Partial<{
    mergedText: string;
    schemaName: string;
    files: { filePath: string; displayName: string }[];
  }> = {},
): SchemaStatus => ({
  kind: "found",
  files: overrides.files ?? [
    { filePath: "/proj/gassma/schema.prisma", displayName: "schema.prisma" },
  ],
  baseDir: "/proj/gassma",
  schemaName: overrides.schemaName ?? "Schema",
  mergedText: overrides.mergedText ?? SCHEMA_TEXT,
  previewFeatures: [],
});

const fakeFs = (mtimes: Record<string, number>): DebugFs => ({
  exists: (filePath) => filePath in mtimes,
  readText: () => {
    throw new Error("readText should not be called");
  },
  mtimeMs: (filePath) => mtimes[filePath],
});

describe("collectGeneratedClientStatus", () => {
  it("should skip when the schema could not be resolved", () => {
    const status = collectGeneratedClientStatus(
      { fs: fakeFs({}), cwd: "/proj" },
      { kind: "error", message: "nope" },
    );

    expect(status).toEqual({ kind: "skipped" });
  });

  it("should report a missing output path", () => {
    const status = collectGeneratedClientStatus(
      { fs: fakeFs({}), cwd: "/proj" },
      foundSchema({ mergedText: "model User {\n  id Int @id\n}\n" }),
    );

    expect(status).toEqual({ kind: "noOutput" });
  });

  it("should resolve the generated file paths from the schema name", () => {
    const status = collectGeneratedClientStatus(
      {
        fs: fakeFs({
          "/proj/gassma/schema.prisma": 100,
          "/proj/generated/schemaClient.js": 200,
          "/proj/generated/schemaClient.d.ts": 200,
        }),
        cwd: "/proj",
      },
      foundSchema(),
    );

    expect(status).toEqual({
      kind: "resolved",
      outputDir: "/proj/generated",
      jsName: "schemaClient.js",
      dtsName: "schemaClient.d.ts",
      jsExists: true,
      dtsExists: true,
      stale: false,
    });
  });

  it("should mark the client possibly stale when the schema is newer", () => {
    const status = collectGeneratedClientStatus(
      {
        fs: fakeFs({
          "/proj/gassma/schema.prisma": 300,
          "/proj/generated/schemaClient.js": 200,
          "/proj/generated/schemaClient.d.ts": 250,
        }),
        cwd: "/proj",
      },
      foundSchema(),
    );

    expect(status.kind).toBe("resolved");
    if (status.kind === "resolved") {
      expect(status.stale).toBe(true);
    }
  });

  it("should leave staleness undefined when a generated file is missing", () => {
    const status = collectGeneratedClientStatus(
      {
        fs: fakeFs({
          "/proj/gassma/schema.prisma": 100,
          "/proj/generated/schemaClient.js": 200,
        }),
        cwd: "/proj",
      },
      foundSchema(),
    );

    expect(status.kind).toBe("resolved");
    if (status.kind === "resolved") {
      expect(status.jsExists).toBe(true);
      expect(status.dtsExists).toBe(false);
      expect(status.stale).toBeUndefined();
    }
  });

  it("should lower-case the first letter of the schema name for file names", () => {
    const status = collectGeneratedClientStatus(
      {
        fs: fakeFs({}),
        cwd: "/proj",
      },
      foundSchema({ schemaName: "Gassma" }),
    );

    expect(status.kind).toBe("resolved");
    if (status.kind === "resolved") {
      expect(status.jsName).toBe("gassmaClient.js");
      expect(status.dtsName).toBe("gassmaClient.d.ts");
    }
  });
});

describe("buildGeneratedClientLines", () => {
  it("should render an up-to-date client", () => {
    const lines = buildGeneratedClientLines(
      {
        kind: "resolved",
        outputDir: "/proj/generated",
        jsName: "schemaClient.js",
        dtsName: "schemaClient.d.ts",
        jsExists: true,
        dtsExists: true,
        stale: false,
      },
      "/proj",
      plain,
    );

    expect(lines).toEqual([
      "-- Generated client --",
      "Output: generated",
      "schemaClient.js: found",
      "schemaClient.d.ts: found",
      "Status: up to date",
    ]);
  });

  it("should render the possibly-stale info line", () => {
    const lines = buildGeneratedClientLines(
      {
        kind: "resolved",
        outputDir: "/proj/generated",
        jsName: "schemaClient.js",
        dtsName: "schemaClient.d.ts",
        jsExists: true,
        dtsExists: true,
        stale: true,
      },
      "/proj",
      plain,
    );

    expect(lines).toContain(
      "Status: possibly stale (schema is newer than the generated client — run `gassma generate`)",
    );
  });

  it("should render missing files without a status line", () => {
    const lines = buildGeneratedClientLines(
      {
        kind: "resolved",
        outputDir: "/proj/generated",
        jsName: "schemaClient.js",
        dtsName: "schemaClient.d.ts",
        jsExists: false,
        dtsExists: false,
        stale: undefined,
      },
      "/proj",
      plain,
    );

    expect(lines).toEqual([
      "-- Generated client --",
      "Output: generated",
      "schemaClient.js: not found",
      "schemaClient.d.ts: not found",
    ]);
  });

  it("should render skipped and noOutput cases", () => {
    expect(
      buildGeneratedClientLines({ kind: "skipped" }, "/proj", plain),
    ).toEqual(["-- Generated client --", "Skipped (schema not found)"]);
    expect(
      buildGeneratedClientLines({ kind: "noOutput" }, "/proj", plain),
    ).toEqual([
      "-- Generated client --",
      "Output path not found in the generator block",
    ]);
  });
});
