import { describe, expect, it } from "vitest";
import { readTemplate } from "../../../util/readTemplate";
import {
  patchPackageJson,
  renderPackageJson,
} from "../../../bootstrap/generators/patchPackageJson";

const template = readTemplate("package.json.template");

const baseOptions = {
  name: "my-app",
  gassmaVersion: "1.1.0",
  style: "export",
  linter: "none",
} satisfies Parameters<typeof patchPackageJson>[1];

describe("patchPackageJson", () => {
  it("should set the project name", () => {
    const pkg = patchPackageJson(template, baseOptions);
    expect(pkg.name).toBe("my-app");
  });

  it("should keep static fields from the template", () => {
    const pkg = patchPackageJson(template, baseOptions);
    expect(pkg.version).toBe("1.0.0");
    expect(pkg.type).toBe("commonjs");
    expect(pkg.scripts).toEqual({
      build: "node esbuild.mjs",
      push: "clasp push",
      open: "clasp open-script",
      deploy: "npm run build && npm run push",
    });
  });

  it("should depend on gassma with a caret range of the CLI version", () => {
    const pkg = patchPackageJson(template, {
      ...baseOptions,
      gassmaVersion: "2.3.4",
    });
    expect(pkg.dependencies).toEqual({ gassma: "^2.3.4" });
  });

  it("should keep only @gassma/gas-esbuild-plugin for the export style", () => {
    const pkg = patchPackageJson(template, baseOptions);
    expect(pkg.devDependencies).toEqual({
      "@gassma/gas-esbuild-plugin": "^0.1.0",
      "@types/google-apps-script": "^2.0.11",
      esbuild: "^0.28.0",
      typescript: "^6.0.3",
    });
  });

  it("should keep only esbuild-gas-plugin for the global style", () => {
    const pkg = patchPackageJson(template, { ...baseOptions, style: "global" });
    expect(pkg.devDependencies).toEqual({
      "@types/google-apps-script": "^2.0.11",
      esbuild: "^0.28.0",
      "esbuild-gas-plugin": "^0.10.0",
      typescript: "^6.0.3",
    });
  });

  it("should add the oxlint toolchain when oxlint is chosen", () => {
    const pkg = patchPackageJson(template, {
      ...baseOptions,
      linter: "oxlint",
    });

    expect(pkg.devDependencies).toMatchObject({
      oxlint: "^1.76.0",
      oxfmt: "^0.61.0",
    });
    expect(pkg.scripts).toMatchObject({
      lint: "oxlint",
      "lint:fix": "oxlint --fix",
      format: "oxfmt",
      "format:check": "oxfmt --check",
    });
  });

  it("should keep devDependencies sorted so that oxfmt --check passes", () => {
    const pkg = patchPackageJson(template, {
      ...baseOptions,
      linter: "oxlint",
    });

    expect(JSON.stringify(pkg.devDependencies)).toBe(
      JSON.stringify({
        "@gassma/gas-esbuild-plugin": "^0.1.0",
        "@types/google-apps-script": "^2.0.11",
        esbuild: "^0.28.0",
        oxfmt: "^0.61.0",
        oxlint: "^1.76.0",
        typescript: "^6.0.3",
      }),
    );
  });

  it("should not add oxlint-tsgolint for the oxlint choice", () => {
    const pkg = patchPackageJson(template, {
      ...baseOptions,
      linter: "oxlint",
    });

    expect(pkg.devDependencies).not.toHaveProperty("oxlint-tsgolint");
    expect(JSON.stringify(pkg.scripts)).not.toContain("--type-aware");
  });

  it("should add the eslint toolchain when eslint is chosen", () => {
    const pkg = patchPackageJson(template, {
      ...baseOptions,
      linter: "eslint",
    });

    expect(pkg.devDependencies).toMatchObject({
      eslint: "^10.8.0",
      "typescript-eslint": "^8.65.0",
      prettier: "^3.9.6",
      "eslint-config-prettier": "^10.1.8",
    });
    expect(pkg.scripts).toMatchObject({
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      format: "prettier --write .",
      "format:check": "prettier --check .",
    });
  });

  it("should keep the two toolchains apart", () => {
    const oxlintPkg = patchPackageJson(template, {
      ...baseOptions,
      linter: "oxlint",
    });
    const eslintPkg = patchPackageJson(template, {
      ...baseOptions,
      linter: "eslint",
    });

    expect(oxlintPkg.devDependencies).not.toHaveProperty("eslint");
    expect(eslintPkg.devDependencies).not.toHaveProperty("oxlint");
  });

  it("should add no scripts and no devDependencies for the none choice", () => {
    const pkg = patchPackageJson(template, baseOptions);

    expect(pkg.scripts).not.toHaveProperty("lint");
    expect(pkg.devDependencies).not.toHaveProperty("oxlint");
    expect(pkg.devDependencies).not.toHaveProperty("prettier");
  });

  it("should preserve the template key order", () => {
    const pkg = patchPackageJson(template, baseOptions);
    expect(Object.keys(pkg)).toEqual([
      "name",
      "version",
      "type",
      "scripts",
      "dependencies",
      "devDependencies",
    ]);
  });

  it("should throw when the template is not a JSON object", () => {
    expect(() => patchPackageJson('["array"]', baseOptions)).toThrow();
  });
});

describe("renderPackageJson", () => {
  it("should render two-space indented JSON ending with a newline", () => {
    const text = renderPackageJson(patchPackageJson(template, baseOptions));
    expect(text.endsWith("}\n")).toBe(true);
    expect(text).toContain('  "name": "my-app"');
    expect(JSON.parse(text)).toEqual(patchPackageJson(template, baseOptions));
  });
});
