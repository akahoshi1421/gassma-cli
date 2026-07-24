import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generate } from "../../generate/generate";
import { ConfigFileNotFoundError } from "../../error/mainError";

const schemaText = (outDir: string) => `generator client {
  provider = "prisma-client-js"
  output   = "${outDir}"
}

model User {
  id   Int    @id
  name String
}
`;

describe("generate with --config", () => {
  let tmpDir: string;
  let originalCwd: string;
  let confDir: string;
  let outDir: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-gen-config-")));
    tmpDir = process.cwd();
    confDir = path.join(tmpDir, "conf");
    outDir = path.join(tmpDir, "generated");
    fs.mkdirSync(path.join(confDir, "schemas"), { recursive: true });
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should generate from a schema resolved against the config file directory", () => {
    fs.writeFileSync(
      path.join(confDir, "schemas", "main.prisma"),
      schemaText(outDir),
    );
    fs.writeFileSync(
      path.join(confDir, "custom.config.ts"),
      `export default { schema: "schemas/main.prisma" };`,
    );

    generate({ config: "conf/custom.config.ts" });

    expect(fs.existsSync(path.join(outDir, "mainClient.d.ts"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "mainClient.js"))).toBe(true);
  });

  it("should use datasource.url from the config given by --config", () => {
    fs.writeFileSync(
      path.join(confDir, "schemas", "main.prisma"),
      schemaText(outDir),
    );
    fs.writeFileSync(
      path.join(confDir, "custom.config.ts"),
      `export default {
  schema: "schemas/main.prisma",
  datasource: { url: "configSheetId123" },
};`,
    );

    generate({ config: "conf/custom.config.ts" });

    const clientJs = fs.readFileSync(
      path.join(outDir, "mainClient.js"),
      "utf-8",
    );
    expect(clientJs).toContain(`id: "configSheetId123"`);
  });

  it("should throw ConfigFileNotFoundError when --config does not exist", () => {
    expect(() => generate({ config: "conf/missing.config.ts" })).toThrow(
      ConfigFileNotFoundError,
    );
  });
});
