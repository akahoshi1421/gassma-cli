import { describe, expect, it } from "vitest";
import { generateEsbuildConfig } from "../../../bootstrap/generators/generateEsbuildConfig";

describe("generateEsbuildConfig", () => {
  it("should use @gassma/gas-esbuild-plugin for the export style", () => {
    const config = generateEsbuildConfig("export");

    expect(config).toContain(
      'import { gasEsbuildPlugin } from "@gassma/gas-esbuild-plugin";',
    );
    expect(config).toContain("plugins: [gasEsbuildPlugin()],");
    expect(config).not.toContain("esbuild-gas-plugin");
  });

  it("should use esbuild-gas-plugin for the global style", () => {
    const config = generateEsbuildConfig("global");

    expect(config).toContain('import { GasPlugin } from "esbuild-gas-plugin";');
    expect(config).toContain("plugins: [GasPlugin],");
    expect(config).not.toContain("@gassma/gas-esbuild-plugin");
  });

  it("should bundle and minify src/index.ts into dist/index.js", () => {
    const config = generateEsbuildConfig("export");

    expect(config).toContain('entryPoints: ["./src/index.ts"],');
    expect(config).toContain("bundle: true,");
    expect(config).toContain("minify: true,");
    expect(config).toContain('outfile: "./dist/index.js",');
  });

  it("should exit with code 1 when the build fails", () => {
    const config = generateEsbuildConfig("global");

    expect(config).toContain("process.exit(1);");
    expect(config).toContain("console.error");
  });
});
