import fs from "fs";
import os from "os";
import path from "path";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from "vitest";
import { generate } from "../../generate/generate";

const CONFIG_LINE = "⚙️ Loaded config from gassma.config.ts";

const generatorBlock = (outDir: string) => `generator client {
  provider = "prisma-client-js"
  output   = "${outDir}"
}`;

const userModel = `model User {
  id   Int    @id
  name String
}`;

describe("generate config diagnostics", () => {
  let tmpDir: string;
  let schemaDir: string;
  let outDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-config-diag-"));
    schemaDir = path.join(tmpDir, "gassma");
    outDir = path.join(tmpDir, "generated");
    fs.mkdirSync(schemaDir);
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeSchema = (): string => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(schemaPath, `${generatorBlock(outDir)}\n\n${userModel}\n`);
    return schemaPath;
  };

  const configLineCalls = (log: MockInstance<typeof console.log>) =>
    log.mock.calls.filter((args) => args[0] === CONFIG_LINE);

  it("should log the config line exactly once when gassma.config.ts exists", () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      "export default {};",
    );
    const schemaPath = writeSchema();
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    generate({ schema: schemaPath });

    expect(configLineCalls(log)).toHaveLength(1);
  });

  it("should log the config line before other generate logs", () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      "export default {};",
    );
    const schemaPath = writeSchema();
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    generate({ schema: schemaPath });

    expect(log.mock.calls[0]).toEqual([CONFIG_LINE]);
  });

  it("should log the path given via the config option relative to cwd", () => {
    fs.mkdirSync(path.join(tmpDir, "configs"));
    fs.writeFileSync(
      path.join(tmpDir, "configs", "gassma.config.ts"),
      "export default {};",
    );
    const schemaPath = writeSchema();
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    generate({ schema: schemaPath, config: "configs/gassma.config.ts" });

    expect(log).toHaveBeenCalledWith(
      "⚙️ Loaded config from configs/gassma.config.ts",
    );
  });

  it("should not log the config line when no gassma.config.ts exists", () => {
    const schemaPath = writeSchema();
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    generate({ schema: schemaPath });

    expect(configLineCalls(log)).toHaveLength(0);
    expect(log).toHaveBeenCalledWith(
      `📁 Found 1 .prisma file(s) in gassma directory`,
    );
  });
});
