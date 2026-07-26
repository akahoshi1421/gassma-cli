import { describe, expect, it } from "vitest";
import { readTemplate } from "../../../util/readTemplate";
import { mergePackageJson } from "../../../bootstrap/generators/mergePackageJson";
import { patchPackageJson } from "../../../bootstrap/generators/patchPackageJson";

const desired = patchPackageJson(readTemplate("package.json.template"), {
  name: "my-app",
  gassmaVersion: "1.1.0",
  style: "export",
});

const parse = (text: string) => JSON.parse(text);

describe("mergePackageJson", () => {
  it("should add missing scripts while keeping existing ones", () => {
    const existing = JSON.stringify({
      name: "keep-me",
      scripts: { build: "my-own-build", test: "vitest" },
    });

    const pkg = parse(mergePackageJson(existing, desired));

    expect(pkg.scripts.build).toBe("my-own-build");
    expect(pkg.scripts.test).toBe("vitest");
    expect(pkg.scripts.push).toBe("clasp push");
    expect(pkg.scripts.deploy).toBe("npm run build && npm run push");
  });

  it("should keep the existing name and version", () => {
    const existing = JSON.stringify({ name: "keep-me", version: "9.9.9" });

    const pkg = parse(mergePackageJson(existing, desired));

    expect(pkg.name).toBe("keep-me");
    expect(pkg.version).toBe("9.9.9");
  });

  it("should keep existing dependency versions", () => {
    const existing = JSON.stringify({
      dependencies: { gassma: "^0.5.0" },
      devDependencies: { esbuild: "^0.20.0" },
    });

    const pkg = parse(mergePackageJson(existing, desired));

    expect(pkg.dependencies.gassma).toBe("^0.5.0");
    expect(pkg.devDependencies.esbuild).toBe("^0.20.0");
    expect(pkg.devDependencies.typescript).toBe("^6.0.3");
  });

  it("should add missing sections to a minimal package.json", () => {
    const existing = JSON.stringify({ name: "minimal" });

    const pkg = parse(mergePackageJson(existing, desired));

    expect(pkg.dependencies).toEqual({ gassma: "^1.1.0" });
    expect(pkg.scripts.build).toBe("node esbuild.mjs");
    expect(pkg.devDependencies["@gassma/gas-esbuild-plugin"]).toBe("^0.1.0");
  });

  it("should preserve unrelated existing fields", () => {
    const existing = JSON.stringify({
      name: "keep-me",
      type: "module",
      license: "MIT",
      keywords: ["gas"],
    });

    const pkg = parse(mergePackageJson(existing, desired));

    expect(pkg.type).toBe("module");
    expect(pkg.license).toBe("MIT");
    expect(pkg.keywords).toEqual(["gas"]);
  });

  it("should produce JSON ending with a newline", () => {
    const merged = mergePackageJson(JSON.stringify({}), desired);
    expect(merged.endsWith("\n")).toBe(true);
  });

  it("should throw for invalid JSON", () => {
    expect(() => mergePackageJson("{ broken", desired)).toThrow();
  });

  it("should throw for JSON that is not an object", () => {
    expect(() => mergePackageJson('["array"]', desired)).toThrow();
  });
});
