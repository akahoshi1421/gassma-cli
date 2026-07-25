import { describe, expect, it } from "vitest";
import { GASSMA_LIBRARY } from "../../../bootstrap/const/gassmaLibrary";
import { applyAppsscriptEdits } from "../../../bootstrap/generators/applyAppsscriptEdits";

const EDIT_OPTIONS = { timeZone: "Asia/Tokyo", libraryVersion: "7" };

const freshManifest = () => ({
  timeZone: "America/New_York",
  dependencies: {},
  exceptionLogging: "STACKDRIVER",
  runtimeVersion: "V8",
});

const getLibraries = (manifest: Record<string, unknown>): unknown[] => {
  const dependencies = manifest.dependencies;
  if (typeof dependencies !== "object" || dependencies === null) {
    throw new Error("dependencies missing");
  }
  const libraries = Object.entries(dependencies).find(
    ([key]) => key === "libraries",
  )?.[1];
  if (!Array.isArray(libraries)) throw new Error("libraries missing");
  return libraries;
};

describe("applyAppsscriptEdits", () => {
  it("should set the detected time zone", () => {
    const result = applyAppsscriptEdits(freshManifest(), EDIT_OPTIONS);

    expect(result.timeZone).toBe("Asia/Tokyo");
  });

  it("should add the Gassma library with a string version", () => {
    const result = applyAppsscriptEdits(freshManifest(), EDIT_OPTIONS);

    expect(getLibraries(result)).toEqual([
      {
        userSymbol: "Gassma",
        libraryId: GASSMA_LIBRARY.scriptId,
        version: "7",
        developmentMode: false,
      },
    ]);
  });

  it("should not duplicate an existing Gassma library entry", () => {
    const manifest = {
      dependencies: {
        libraries: [
          {
            userSymbol: "Gassma",
            libraryId: GASSMA_LIBRARY.scriptId,
            version: "5",
          },
        ],
      },
    };

    const result = applyAppsscriptEdits(manifest, EDIT_OPTIONS);
    const libraries = getLibraries(result);

    expect(libraries).toHaveLength(1);
    expect(libraries[0]).toEqual({
      userSymbol: "Gassma",
      libraryId: GASSMA_LIBRARY.scriptId,
      version: "5",
    });
  });

  it("should keep other existing libraries and append Gassma", () => {
    const other = { userSymbol: "Other", libraryId: "other-id", version: "1" };
    const manifest = { dependencies: { libraries: [other] } };

    const result = applyAppsscriptEdits(manifest, EDIT_OPTIONS);
    const libraries = getLibraries(result);

    expect(libraries).toHaveLength(2);
    expect(libraries[0]).toEqual(other);
  });

  it("should default exceptionLogging and runtimeVersion when missing", () => {
    const result = applyAppsscriptEdits({}, EDIT_OPTIONS);

    expect(result.exceptionLogging).toBe("STACKDRIVER");
    expect(result.runtimeVersion).toBe("V8");
  });

  it("should respect existing exceptionLogging and runtimeVersion", () => {
    const manifest = {
      exceptionLogging: "NONE",
      runtimeVersion: "DEPRECATED_ES5",
    };

    const result = applyAppsscriptEdits(manifest, EDIT_OPTIONS);

    expect(result.exceptionLogging).toBe("NONE");
    expect(result.runtimeVersion).toBe("DEPRECATED_ES5");
  });

  it("should preserve unrelated manifest fields", () => {
    const manifest = {
      ...freshManifest(),
      oauthScopes: ["https://www.googleapis.com/auth/spreadsheets"],
      webapp: { access: "ANYONE" },
    };

    const result = applyAppsscriptEdits(manifest, EDIT_OPTIONS);

    expect(result.oauthScopes).toEqual([
      "https://www.googleapis.com/auth/spreadsheets",
    ]);
    expect(result.webapp).toEqual({ access: "ANYONE" });
  });

  it("should build a full manifest from a non-record input", () => {
    const result = applyAppsscriptEdits(null, EDIT_OPTIONS);

    expect(result.timeZone).toBe("Asia/Tokyo");
    expect(result.exceptionLogging).toBe("STACKDRIVER");
    expect(result.runtimeVersion).toBe("V8");
    expect(getLibraries(result)).toHaveLength(1);
  });

  it("should use the given library version for new entries", () => {
    const result = applyAppsscriptEdits(
      {},
      {
        timeZone: "Asia/Tokyo",
        libraryVersion: "12",
      },
    );

    const libraries = getLibraries(result);
    expect(libraries[0]).toMatchObject({ version: "12" });
  });
});
