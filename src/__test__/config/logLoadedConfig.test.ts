import path from "path";
import { describe, it, expect, afterEach, vi } from "vitest";
import { logLoadedConfig } from "../../config/logLoadedConfig";

describe("logLoadedConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log the cwd-relative path of the loaded config", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logLoadedConfig(path.join(process.cwd(), "gassma.config.ts"));

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("⚙️ Loaded config from gassma.config.ts");
  });

  it("should log a subdirectory config relative to cwd", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logLoadedConfig(path.join(process.cwd(), "configs", "gassma.config.ts"));

    expect(log).toHaveBeenCalledWith(
      "⚙️ Loaded config from configs/gassma.config.ts",
    );
  });

  it("should log a parent-directory config relative to cwd", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logLoadedConfig(path.resolve(process.cwd(), "..", "gassma.config.ts"));

    expect(log).toHaveBeenCalledWith(
      "⚙️ Loaded config from ../gassma.config.ts",
    );
  });

  it("should log nothing when filePath is undefined", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logLoadedConfig(undefined);

    expect(log).not.toHaveBeenCalled();
  });
});
