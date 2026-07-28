import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GASSMA_LIBRARY } from "../../bootstrap/const/gassmaLibrary";
import { resolveUserSymbol } from "../../migrate/resolveUserSymbol";

const writeManifest = (dir: string, manifest: unknown): void => {
  fs.writeFileSync(path.join(dir, "appsscript.json"), JSON.stringify(manifest));
};

describe("resolveUserSymbol", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-migrate-sym-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should default to Gassma when appsscript.json is missing", () => {
    expect(resolveUserSymbol(tmpDir)).toBe("Gassma");
  });

  it("should read the userSymbol of the gassma library entry", () => {
    writeManifest(tmpDir, {
      dependencies: {
        libraries: [
          {
            userSymbol: "MyGassma",
            libraryId: GASSMA_LIBRARY.scriptId,
            version: "1",
          },
        ],
      },
    });
    expect(resolveUserSymbol(tmpDir)).toBe("MyGassma");
  });

  it("should ignore other libraries", () => {
    writeManifest(tmpDir, {
      dependencies: {
        libraries: [
          { userSymbol: "Other", libraryId: "other-id", version: "1" },
        ],
      },
    });
    expect(resolveUserSymbol(tmpDir)).toBe("Gassma");
  });

  it("should default when the manifest cannot be parsed", () => {
    fs.writeFileSync(path.join(tmpDir, "appsscript.json"), "{ broken");
    expect(resolveUserSymbol(tmpDir)).toBe("Gassma");
  });

  it("should default when the entry has no string userSymbol", () => {
    writeManifest(tmpDir, {
      dependencies: {
        libraries: [{ libraryId: GASSMA_LIBRARY.scriptId, version: "1" }],
      },
    });
    expect(resolveUserSymbol(tmpDir)).toBe("Gassma");
  });

  it("should default when the manifest has no libraries", () => {
    writeManifest(tmpDir, { timeZone: "Asia/Tokyo" });
    expect(resolveUserSymbol(tmpDir)).toBe("Gassma");
  });
});
