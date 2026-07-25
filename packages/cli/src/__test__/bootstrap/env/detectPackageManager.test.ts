import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPackageManager } from "../../../bootstrap/env/detectPackageManager";

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

  it("should detect pnpm from pnpm-lock.yaml", async () => {
    const cwd = touch(tmpDir, "pnpm-lock.yaml");

    await expect(detectPackageManager({ cwd })).resolves.toBe("pnpm");
  });

  it("should detect yarn from yarn.lock", async () => {
    const cwd = touch(tmpDir, "yarn.lock");

    await expect(detectPackageManager({ cwd })).resolves.toBe("yarn");
  });

  it("should detect bun from bun.lockb and bun.lock", async () => {
    const lockbDir = touch(tmpDir, "lockb", "bun.lockb");
    const lockDir = touch(tmpDir, "lock", "bun.lock");

    await expect(detectPackageManager({ cwd: lockbDir })).resolves.toBe("bun");
    await expect(detectPackageManager({ cwd: lockDir })).resolves.toBe("bun");
  });

  it("should detect npm from package-lock.json", async () => {
    const cwd = touch(tmpDir, "package-lock.json");

    await expect(detectPackageManager({ cwd })).resolves.toBe("npm");
  });

  it("should detect npm from npm-shrinkwrap.json", async () => {
    const cwd = touch(tmpDir, "npm-shrinkwrap.json");

    await expect(detectPackageManager({ cwd })).resolves.toBe("npm");
  });

  it("should detect a lockfile in a parent directory", async () => {
    touch(tmpDir, "pnpm-lock.yaml");
    const nested = path.join(tmpDir, "apps", "web");
    fs.mkdirSync(nested, { recursive: true });

    await expect(detectPackageManager({ cwd: nested })).resolves.toBe("pnpm");
  });

  it("should detect from the packageManager field in package.json", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "sample", packageManager: "yarn@4.1.0" }),
    );

    await expect(detectPackageManager({ cwd: tmpDir })).resolves.toBe("yarn");
  });

  it("should prefer a lockfile over the user agent", async () => {
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
