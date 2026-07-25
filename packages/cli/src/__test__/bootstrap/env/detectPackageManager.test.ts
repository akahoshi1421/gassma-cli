import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPackageManager } from "../../../bootstrap/env/detectPackageManager";

// Lockfile/packageManager-field recognition itself belongs to
// package-manager-detector; these tests only cover our own responsibilities:
// the fallback chain, the unsupported-agent filter, and the wiring.
describe("detectPackageManager", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-detect-pm-"));
    vi.stubEnv("npm_config_user_agent", "");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.unstubAllEnvs();
  });

  const touch = (...segments: string[]): string => {
    const filePath = path.join(...segments);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "");
    return path.dirname(filePath);
  };

  it("should prefer the detector's result over the user agent", async () => {
    const cwd = touch(tmpDir, "yarn.lock");

    await expect(
      detectPackageManager({ cwd, userAgent: "pnpm/9.0.0 npm/?" }),
    ).resolves.toBe("yarn");
  });

  it("should fall back to the given user agent without lockfiles", async () => {
    await expect(
      detectPackageManager({ cwd: tmpDir, userAgent: "pnpm/9.0.0 npm/?" }),
    ).resolves.toBe("pnpm");
    await expect(
      detectPackageManager({ cwd: tmpDir, userAgent: "yarn/4.0.0 npm/?" }),
    ).resolves.toBe("yarn");
    await expect(
      detectPackageManager({ cwd: tmpDir, userAgent: "bun/1.1.0 npm/?" }),
    ).resolves.toBe("bun");
    await expect(
      detectPackageManager({
        cwd: tmpDir,
        userAgent: "npm/10.0.0 node/v20.0.0",
      }),
    ).resolves.toBe("npm");
  });

  it("should fall back to npm_config_user_agent when no user agent is given", async () => {
    vi.stubEnv("npm_config_user_agent", "bun/1.1.0 npm/? node/v20.0.0");

    await expect(detectPackageManager({ cwd: tmpDir })).resolves.toBe("bun");
  });

  it("should default to npm without lockfiles and user agent", async () => {
    await expect(detectPackageManager({ cwd: tmpDir })).resolves.toBe("npm");
  });

  it("should default to npm for an unknown user agent", async () => {
    await expect(
      detectPackageManager({ cwd: tmpDir, userAgent: "deno/2.0.0" }),
    ).resolves.toBe("npm");
  });

  it("should fall back to the user agent for an unsupported lockfile", async () => {
    const cwd = touch(tmpDir, "deno.lock");

    await expect(
      detectPackageManager({ cwd, userAgent: "pnpm/9.0.0 npm/?" }),
    ).resolves.toBe("pnpm");
  });
});
