import fs from "fs";
import path from "path";
import os from "os";
import { loadConfig } from "../../config/loadConfig";

describe("loadConfig", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-config-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should return undefined when no gassma.config.ts exists", () => {
    const config = loadConfig();
    expect(config).toBeUndefined();
  });

  it("should load schema from gassma.config.ts", () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default { schema: "gassma/test.prisma" };`,
    );

    const config = loadConfig();
    expect(config).toEqual({ schema: "gassma/test.prisma" });
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

    const config = loadConfig();
    expect(config).toEqual({ schema: "gassma/schema.prisma" });
  });

  it("should return config without schema when schema is not specified", () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default {};`,
    );

    const config = loadConfig();
    expect(config).toEqual({});
  });
});
