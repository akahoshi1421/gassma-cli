import fs from "fs";
import path from "path";
import { getVersion } from "../../version/getVersion";

describe("getVersion", () => {
  it("should return version string from package.json", () => {
    const version = getVersion();

    expect(typeof version).toBe("string");
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should match package.json version", () => {
    const packageJsonPath = path.resolve(__dirname, "../../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const version = getVersion();

    expect(version).toBe(packageJson.version);
  });
});
