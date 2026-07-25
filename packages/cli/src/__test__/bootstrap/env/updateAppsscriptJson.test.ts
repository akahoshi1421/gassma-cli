import { describe, expect, it } from "vitest";
import { GASSMA_LIBRARY } from "../../../bootstrap/const/gassmaLibrary";
import type { FileStore } from "../../../bootstrap/env/fileStore";
import { updateAppsscriptJson } from "../../../bootstrap/env/updateAppsscriptJson";

const createMemoryStore = (initial: Record<string, string>) => {
  const files = new Map(Object.entries(initial));
  const store: FileStore = {
    exists: (filePath) => files.has(filePath),
    read: (filePath) => {
      const content = files.get(filePath);
      if (content === undefined) throw new Error(`missing: ${filePath}`);
      return content;
    },
    write: (filePath, content) => {
      files.set(filePath, content);
    },
  };
  return { files, store };
};

const MANIFEST_PATH = "/project/dist/appsscript.json";
const OPTIONS = {
  manifestPath: MANIFEST_PATH,
  timeZone: "Asia/Tokyo",
  libraryVersion: "7",
};

describe("updateAppsscriptJson", () => {
  it("should update an existing manifest in place", () => {
    const original = JSON.stringify({
      timeZone: "America/New_York",
      dependencies: {},
      exceptionLogging: "STACKDRIVER",
    });
    const { files, store } = createMemoryStore({ [MANIFEST_PATH]: original });

    updateAppsscriptJson({ store, ...OPTIONS });

    const written = JSON.parse(files.get(MANIFEST_PATH) ?? "{}");
    expect(written.timeZone).toBe("Asia/Tokyo");
    expect(written.dependencies.libraries).toEqual([
      {
        userSymbol: "Gassma",
        libraryId: GASSMA_LIBRARY.scriptId,
        version: "7",
        developmentMode: false,
      },
    ]);
    expect(written.runtimeVersion).toBe("V8");
  });

  it("should create a manifest when the file does not exist", () => {
    const { files, store } = createMemoryStore({});

    updateAppsscriptJson({ store, ...OPTIONS });

    const written = JSON.parse(files.get(MANIFEST_PATH) ?? "{}");
    expect(written.timeZone).toBe("Asia/Tokyo");
    expect(written.exceptionLogging).toBe("STACKDRIVER");
    expect(written.dependencies.libraries).toHaveLength(1);
  });

  it("should rebuild the manifest when the file has invalid JSON", () => {
    const { files, store } = createMemoryStore({ [MANIFEST_PATH]: "{broken" });

    updateAppsscriptJson({ store, ...OPTIONS });

    const written = JSON.parse(files.get(MANIFEST_PATH) ?? "{}");
    expect(written.timeZone).toBe("Asia/Tokyo");
  });

  it("should apply manifest defaults without a library entry for a null version", () => {
    const { files, store } = createMemoryStore({});

    updateAppsscriptJson({ store, ...OPTIONS, libraryVersion: null });

    const written = JSON.parse(files.get(MANIFEST_PATH) ?? "{}");
    expect(written.timeZone).toBe("Asia/Tokyo");
    expect(written.exceptionLogging).toBe("STACKDRIVER");
    expect(written.runtimeVersion).toBe("V8");
    expect(written.dependencies.libraries).toEqual([]);
  });

  it("should write two-space indented JSON with a trailing newline", () => {
    const { files, store } = createMemoryStore({});

    updateAppsscriptJson({ store, ...OPTIONS });

    const written = files.get(MANIFEST_PATH) ?? "";
    expect(written.endsWith("}\n")).toBe(true);
    expect(written).toContain('  "timeZone": "Asia/Tokyo"');
  });
});
