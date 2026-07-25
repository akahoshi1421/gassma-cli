import path from "path";
import { describe, expect, it } from "vitest";
import { detectPackageManager } from "../../../bootstrap/env/detectPackageManager";
import type { FileStore } from "../../../bootstrap/env/fileStore";

const storeWith = (files: string[]): FileStore => ({
  exists: (filePath) => files.includes(filePath),
  read: () => {
    throw new Error("not implemented");
  },
  write: () => {
    throw new Error("not implemented");
  },
});

const DIR = "/project";

describe("detectPackageManager", () => {
  it("should detect pnpm from pnpm-lock.yaml", () => {
    const store = storeWith([path.join(DIR, "pnpm-lock.yaml")]);

    expect(detectPackageManager({ dir: DIR, store })).toBe("pnpm");
  });

  it("should detect yarn from yarn.lock", () => {
    const store = storeWith([path.join(DIR, "yarn.lock")]);

    expect(detectPackageManager({ dir: DIR, store })).toBe("yarn");
  });

  it("should detect bun from bun.lockb and bun.lock", () => {
    expect(
      detectPackageManager({
        dir: DIR,
        store: storeWith([path.join(DIR, "bun.lockb")]),
      }),
    ).toBe("bun");
    expect(
      detectPackageManager({
        dir: DIR,
        store: storeWith([path.join(DIR, "bun.lock")]),
      }),
    ).toBe("bun");
  });

  it("should detect npm from package-lock.json", () => {
    const store = storeWith([path.join(DIR, "package-lock.json")]);

    expect(detectPackageManager({ dir: DIR, store })).toBe("npm");
  });

  it("should prefer a lockfile over the user agent", () => {
    const store = storeWith([path.join(DIR, "yarn.lock")]);

    expect(
      detectPackageManager({ dir: DIR, store, userAgent: "pnpm/9.0.0 npm/?" }),
    ).toBe("yarn");
  });

  it("should fall back to the user agent without lockfiles", () => {
    const store = storeWith([]);

    expect(
      detectPackageManager({ dir: DIR, store, userAgent: "pnpm/9.0.0 npm/?" }),
    ).toBe("pnpm");
    expect(
      detectPackageManager({
        dir: DIR,
        store,
        userAgent: "yarn/4.0.0 npm/?",
      }),
    ).toBe("yarn");
    expect(
      detectPackageManager({ dir: DIR, store, userAgent: "bun/1.1.0 npm/?" }),
    ).toBe("bun");
    expect(
      detectPackageManager({
        dir: DIR,
        store,
        userAgent: "npm/10.0.0 node/v20.0.0",
      }),
    ).toBe("npm");
  });

  it("should default to npm without lockfiles and user agent", () => {
    expect(detectPackageManager({ dir: DIR, store: storeWith([]) })).toBe(
      "npm",
    );
  });

  it("should default to npm for an unknown user agent", () => {
    expect(
      detectPackageManager({
        dir: DIR,
        store: storeWith([]),
        userAgent: "deno/2.0.0",
      }),
    ).toBe("npm");
  });
});
