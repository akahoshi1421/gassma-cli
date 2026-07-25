import { describe, expect, it } from "vitest";
import {
  formatInstallCommand,
  resolveInstallCommand,
} from "../../../bootstrap/env/installCommand";

// The per-manager install commands themselves come from
// package-manager-detector's COMMANDS table; only the wiring and the
// display formatting are ours to test.
describe("resolveInstallCommand", () => {
  it("should resolve via the shared COMMANDS table", () => {
    expect(resolveInstallCommand("npm")).toEqual({
      command: "npm",
      args: ["i"],
    });
  });
});

describe("formatInstallCommand", () => {
  it("should join the resolved command for display", () => {
    expect(formatInstallCommand("npm")).toBe("npm i");
    expect(formatInstallCommand("yarn")).toBe("yarn install");
  });
});
