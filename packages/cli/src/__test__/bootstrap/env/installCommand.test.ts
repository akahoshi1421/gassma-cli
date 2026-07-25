import { describe, expect, it } from "vitest";
import {
  formatInstallCommand,
  resolveInstallCommand,
} from "../../../bootstrap/env/installCommand";

describe("resolveInstallCommand", () => {
  it("should resolve npm to npm i", () => {
    expect(resolveInstallCommand("npm")).toEqual({
      command: "npm",
      args: ["i"],
    });
  });

  it("should resolve pnpm to pnpm i", () => {
    expect(resolveInstallCommand("pnpm")).toEqual({
      command: "pnpm",
      args: ["i"],
    });
  });

  it("should resolve yarn to yarn install", () => {
    expect(resolveInstallCommand("yarn")).toEqual({
      command: "yarn",
      args: ["install"],
    });
  });

  it("should resolve bun to bun install", () => {
    expect(resolveInstallCommand("bun")).toEqual({
      command: "bun",
      args: ["install"],
    });
  });
});

describe("formatInstallCommand", () => {
  it("should format the resolved command for display", () => {
    expect(formatInstallCommand("npm")).toBe("npm i");
    expect(formatInstallCommand("pnpm")).toBe("pnpm i");
    expect(formatInstallCommand("yarn")).toBe("yarn install");
    expect(formatInstallCommand("bun")).toBe("bun install");
  });
});
