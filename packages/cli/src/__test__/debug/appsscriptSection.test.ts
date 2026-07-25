import { describe, expect, it } from "vitest";
import type { DebugFs } from "../../debug/env/debugFs";
import {
  buildAppsscriptLines,
  collectAppsscriptStatus,
} from "../../debug/sections/appsscriptSection";
import { createStyler } from "../../debug/styles";

const plain = createStyler(false);

const GASSMA_LIBRARY_ID =
  "1ZVuWMUYs4hVKDCcP3nVw74AY48VqLm50wRceKIQLFKL0wf4Hyou-FIBH";

const fakeFs = (files: Record<string, string>): DebugFs => ({
  exists: (filePath) => filePath in files,
  readText: (filePath) => {
    const content = files[filePath];
    if (content === undefined) throw new Error(`missing: ${filePath}`);
    return content;
  },
  mtimeMs: () => undefined,
});

const manifest = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    timeZone: "Asia/Tokyo",
    dependencies: {
      libraries: [
        {
          userSymbol: "Gassma",
          version: "0",
          libraryId: GASSMA_LIBRARY_ID,
          developmentMode: true,
        },
      ],
    },
    runtimeVersion: "V8",
    ...overrides,
  });

describe("collectAppsscriptStatus", () => {
  it("should look under the clasp rootDir first", () => {
    const status = collectAppsscriptStatus({
      fs: fakeFs({ "/proj/out/appsscript.json": manifest() }),
      cwd: "/proj",
      rootDir: "./out",
    });

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.manifestPath).toBe("/proj/out/appsscript.json");
      expect(status.runtimeVersion).toBe("V8");
      expect(status.library).toEqual({
        userSymbol: "Gassma",
        version: "0",
        developmentMode: true,
      });
    }
  });

  it("should fall back to ./dist and then the cwd", () => {
    const fromDist = collectAppsscriptStatus({
      fs: fakeFs({ "/proj/dist/appsscript.json": manifest() }),
      cwd: "/proj",
      rootDir: undefined,
    });
    const fromCwd = collectAppsscriptStatus({
      fs: fakeFs({ "/proj/appsscript.json": manifest() }),
      cwd: "/proj",
      rootDir: undefined,
    });

    expect(fromDist.kind).toBe("found");
    if (fromDist.kind === "found") {
      expect(fromDist.manifestPath).toBe("/proj/dist/appsscript.json");
    }
    expect(fromCwd.kind).toBe("found");
    if (fromCwd.kind === "found") {
      expect(fromCwd.manifestPath).toBe("/proj/appsscript.json");
    }
  });

  it("should report the searched candidates when nothing is found", () => {
    const status = collectAppsscriptStatus({
      fs: fakeFs({}),
      cwd: "/proj",
      rootDir: "./dist",
    });

    expect(status).toEqual({
      kind: "notFound",
      searched: ["/proj/dist/appsscript.json", "/proj/appsscript.json"],
    });
  });

  it("should report a parse error", () => {
    const status = collectAppsscriptStatus({
      fs: fakeFs({ "/proj/appsscript.json": "{ broken" }),
      cwd: "/proj",
      rootDir: undefined,
    });

    expect(status).toEqual({
      kind: "parseError",
      manifestPath: "/proj/appsscript.json",
    });
  });

  it("should find the library by libraryId even when the userSymbol differs", () => {
    const status = collectAppsscriptStatus({
      fs: fakeFs({
        "/proj/appsscript.json": manifest({
          dependencies: {
            libraries: [
              {
                userSymbol: "MyLib",
                version: "3",
                libraryId: GASSMA_LIBRARY_ID,
                developmentMode: false,
              },
            ],
          },
        }),
      }),
      cwd: "/proj",
      rootDir: undefined,
    });

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.library).toEqual({
        userSymbol: "MyLib",
        version: "3",
        developmentMode: false,
      });
    }
  });

  it("should fall back to matching by userSymbol Gassma", () => {
    const status = collectAppsscriptStatus({
      fs: fakeFs({
        "/proj/appsscript.json": manifest({
          dependencies: {
            libraries: [
              {
                userSymbol: "Gassma",
                version: 7,
                libraryId: "another-library-id",
              },
            ],
          },
        }),
      }),
      cwd: "/proj",
      rootDir: undefined,
    });

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.library).toEqual({ userSymbol: "Gassma", version: "7" });
    }
  });

  it("should report a missing Gassma library entry", () => {
    const status = collectAppsscriptStatus({
      fs: fakeFs({
        "/proj/appsscript.json": manifest({ dependencies: {} }),
      }),
      cwd: "/proj",
      rootDir: undefined,
    });

    expect(status.kind).toBe("found");
    if (status.kind === "found") {
      expect(status.library).toBeUndefined();
    }
  });
});

describe("buildAppsscriptLines", () => {
  it("should render a healthy manifest", () => {
    const lines = buildAppsscriptLines(
      {
        kind: "found",
        manifestPath: "/proj/dist/appsscript.json",
        runtimeVersion: "V8",
        library: { userSymbol: "Gassma", version: "0", developmentMode: true },
      },
      "/proj",
      plain,
    );

    expect(lines).toEqual([
      "-- appsscript.json --",
      "Path: dist/appsscript.json",
      "runtimeVersion: V8",
      "Gassma library: found",
      "- userSymbol: Gassma",
      "- version: 0",
      "- developmentMode: true",
    ]);
  });

  it("should flag a userSymbol mismatch", () => {
    const lines = buildAppsscriptLines(
      {
        kind: "found",
        manifestPath: "/proj/appsscript.json",
        runtimeVersion: "V8",
        library: { userSymbol: "MyLib", version: "3", developmentMode: false },
      },
      "/proj",
      plain,
    );

    expect(lines).toContain(
      "- userSymbol: MyLib (expected `Gassma` — generated code references `Gassma.GassmaClient`)",
    );
  });

  it("should call out a non-V8 runtime and a missing runtimeVersion", () => {
    const nonV8 = buildAppsscriptLines(
      {
        kind: "found",
        manifestPath: "/proj/appsscript.json",
        runtimeVersion: "STABLE",
        library: undefined,
      },
      "/proj",
      plain,
    );
    const unset = buildAppsscriptLines(
      {
        kind: "found",
        manifestPath: "/proj/appsscript.json",
        runtimeVersion: undefined,
        library: undefined,
      },
      "/proj",
      plain,
    );

    expect(nonV8).toContain("runtimeVersion: STABLE (not V8)");
    expect(unset).toContain("runtimeVersion: not set (not V8)");
    expect(nonV8).toContain(
      "Gassma library: not found in dependencies.libraries",
    );
  });

  it("should render missing library fields as not set", () => {
    const lines = buildAppsscriptLines(
      {
        kind: "found",
        manifestPath: "/proj/appsscript.json",
        runtimeVersion: "V8",
        library: { userSymbol: "Gassma" },
      },
      "/proj",
      plain,
    );

    expect(lines).toContain("- version: (not set)");
    expect(lines).toContain("- developmentMode: (not set)");
  });

  it("should render the searched locations when not found", () => {
    const lines = buildAppsscriptLines(
      {
        kind: "notFound",
        searched: ["/proj/dist/appsscript.json", "/proj/appsscript.json"],
      },
      "/proj",
      plain,
    );

    expect(lines).toEqual([
      "-- appsscript.json --",
      "Not found (searched: dist/appsscript.json, appsscript.json)",
    ]);
  });

  it("should render a parse error", () => {
    const lines = buildAppsscriptLines(
      { kind: "parseError", manifestPath: "/proj/appsscript.json" },
      "/proj",
      plain,
    );

    expect(lines).toEqual([
      "-- appsscript.json --",
      "Path: appsscript.json",
      "Could not parse appsscript.json",
    ]);
  });
});
