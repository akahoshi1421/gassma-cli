import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { loadConfig } from "../../config/loadConfig";
import { ConfigFileNotFoundError } from "../../error/mainError";

describe("loadConfig", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-config-")));
    tmpDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("default config path", () => {
    it("should return undefined when no gassma.config.ts exists", () => {
      const loaded = loadConfig();
      expect(loaded).toBeUndefined();
    });

    it("should load schema from gassma.config.ts", () => {
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default { schema: "gassma/test.prisma" };`,
      );

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({ schema: "gassma/test.prisma" });
    });

    it("should keep the config file path in the result", () => {
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default { schema: "gassma/test.prisma" };`,
      );

      const loaded = loadConfig();
      expect(loaded?.filePath).toBe(path.join(tmpDir, "gassma.config.ts"));
    });

    it("should load config with defineConfig", () => {
      const defineConfigPath = path.resolve(
        __dirname,
        "../../config/defineConfig",
      );
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `import { defineConfig } from "${defineConfigPath}";
export default defineConfig({ schema: "gassma/schema.prisma" });`,
      );

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({ schema: "gassma/schema.prisma" });
    });

    it("should return config without schema when schema is not specified", () => {
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default {};`,
      );

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({});
    });

    it.each([
      {
        ext: "js",
        content: `export default { schema: "gassma/from-js.prisma" };`,
      },
      {
        ext: "mjs",
        content: `export default { schema: "gassma/from-mjs.prisma" };`,
      },
      {
        ext: "cjs",
        content: `module.exports = { schema: "gassma/from-cjs.prisma" };`,
      },
      {
        ext: "mts",
        content: `export default { schema: "gassma/from-mts.prisma" };`,
      },
      {
        ext: "cts",
        content: `export default { schema: "gassma/from-cts.prisma" };`,
      },
    ])("should load config from gassma.config.$ext", ({ ext, content }) => {
      fs.writeFileSync(path.join(tmpDir, `gassma.config.${ext}`), content);

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({ schema: `gassma/from-${ext}.prisma` });
      expect(loaded?.filePath).toBe(path.join(tmpDir, `gassma.config.${ext}`));
    });

    it("should prefer gassma.config.js over gassma.config.ts", () => {
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.js"),
        `export default { schema: "gassma/from-js.prisma" };`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default { schema: "gassma/from-ts.prisma" };`,
      );

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({ schema: "gassma/from-js.prisma" });
      expect(loaded?.filePath).toBe(path.join(tmpDir, "gassma.config.js"));
    });

    it("should load config from .config/gassma.ts when no root config exists", () => {
      fs.mkdirSync(path.join(tmpDir, ".config"));
      fs.writeFileSync(
        path.join(tmpDir, ".config", "gassma.ts"),
        `export default { schema: "gassma/from-dot-config.prisma" };`,
      );

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({
        schema: "gassma/from-dot-config.prisma",
      });
      expect(loaded?.filePath).toBe(path.join(tmpDir, ".config", "gassma.ts"));
    });

    it("should prefer root gassma.config.cts over .config/gassma.js", () => {
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.cts"),
        `export default { schema: "gassma/from-root.prisma" };`,
      );
      fs.mkdirSync(path.join(tmpDir, ".config"));
      fs.writeFileSync(
        path.join(tmpDir, ".config", "gassma.js"),
        `export default { schema: "gassma/from-dot-config.prisma" };`,
      );

      const loaded = loadConfig();
      expect(loaded?.config).toEqual({ schema: "gassma/from-root.prisma" });
      expect(loaded?.filePath).toBe(path.join(tmpDir, "gassma.config.cts"));
    });
  });

  describe("explicit config path", () => {
    it("should load a relative config path resolved from cwd", () => {
      const dir = path.join(tmpDir, "conf");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "custom.config.ts"),
        `export default { schema: "schemas" };`,
      );

      const loaded = loadConfig("conf/custom.config.ts");
      expect(loaded?.config).toEqual({ schema: "schemas" });
      expect(loaded?.filePath).toBe(
        path.join(tmpDir, "conf", "custom.config.ts"),
      );
    });

    it("should load an absolute config path", () => {
      const filePath = path.join(tmpDir, "my.config.ts");
      fs.writeFileSync(filePath, `export default { schema: "gassma" };`);

      const loaded = loadConfig(filePath);
      expect(loaded?.config).toEqual({ schema: "gassma" });
      expect(loaded?.filePath).toBe(filePath);
    });

    it("should throw ConfigFileNotFoundError when the explicit path does not exist", () => {
      expect(() => loadConfig("conf/missing.config.ts")).toThrow(
        ConfigFileNotFoundError,
      );
      expect(() => loadConfig("conf/missing.config.ts")).toThrow(
        /GASsmaConfigFileNotFoundError/,
      );
    });

    it("should include the resolved path in the not-found error message", () => {
      expect(() => loadConfig("conf/missing.config.ts")).toThrow(
        path.join(tmpDir, "conf", "missing.config.ts"),
      );
    });
  });
});
