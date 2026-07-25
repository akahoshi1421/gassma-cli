import { describe, expect, it } from "vitest";
import { generatePackageJson } from "../../../bootstrap/generators/generatePackageJson";

const parse = (text: string) => JSON.parse(text);

describe("generatePackageJson", () => {
  const baseOptions = {
    name: "my-app",
    gassmaVersion: "1.1.0",
    style: "export",
  } satisfies Parameters<typeof generatePackageJson>[0];

  it("should produce valid JSON ending with a newline", () => {
    const text = generatePackageJson(baseOptions);
    expect(text.endsWith("\n")).toBe(true);
    expect(() => parse(text)).not.toThrow();
  });

  it("should set the sanitized project name and defaults", () => {
    const pkg = parse(generatePackageJson(baseOptions));
    expect(pkg.name).toBe("my-app");
    expect(pkg.version).toBe("1.0.0");
    expect(pkg.type).toBe("commonjs");
  });

  it("should include the same scripts as gassma-des", () => {
    const pkg = parse(generatePackageJson(baseOptions));
    expect(pkg.scripts).toEqual({
      build: "node esbuild.mjs",
      push: "clasp push",
      open: "clasp open",
      deploy: "npm run build && npm run push",
    });
  });

  it("should depend on gassma with a caret range of the CLI version", () => {
    const pkg = parse(
      generatePackageJson({ ...baseOptions, gassmaVersion: "2.3.4" }),
    );
    expect(pkg.dependencies).toEqual({ gassma: "^2.3.4" });
  });

  it("should include base devDependencies", () => {
    const pkg = parse(generatePackageJson(baseOptions));
    expect(pkg.devDependencies["@types/google-apps-script"]).toBe("^2.0.11");
    expect(pkg.devDependencies.esbuild).toBe("^0.28.0");
    expect(pkg.devDependencies.typescript).toBe("^6.0.3");
  });

  it("should add @gassma/gas-esbuild-plugin for the export style", () => {
    const pkg = parse(generatePackageJson({ ...baseOptions, style: "export" }));
    expect(pkg.devDependencies["@gassma/gas-esbuild-plugin"]).toBe("^0.1.0");
    expect(pkg.devDependencies["esbuild-gas-plugin"]).toBeUndefined();
  });

  it("should add esbuild-gas-plugin for the global style", () => {
    const pkg = parse(generatePackageJson({ ...baseOptions, style: "global" }));
    expect(pkg.devDependencies["esbuild-gas-plugin"]).toBe("^0.10.0");
    expect(pkg.devDependencies["@gassma/gas-esbuild-plugin"]).toBeUndefined();
  });
});
