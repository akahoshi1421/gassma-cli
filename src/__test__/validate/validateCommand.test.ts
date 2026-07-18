import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { validate } from "../../validate/validateCommand";
import { ConfigFileNotFoundError } from "../../error/mainError";

const VALID_SCHEMA = `generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id   Int    @id
  name String
}
`;

describe("validate with --config", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-validate-")));
    tmpDir = process.cwd();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should validate a schema resolved against the config file directory", () => {
    const confDir = path.join(tmpDir, "conf");
    fs.mkdirSync(path.join(confDir, "schemas"), { recursive: true });
    fs.writeFileSync(
      path.join(confDir, "schemas", "main.prisma"),
      VALID_SCHEMA,
    );
    fs.writeFileSync(
      path.join(confDir, "custom.config.ts"),
      `export default { schema: "schemas" };`,
    );
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    validate({ config: "conf/custom.config.ts" });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("is valid"));
  });

  it("should throw ConfigFileNotFoundError when --config does not exist", () => {
    expect(() => validate({ config: "conf/missing.config.ts" })).toThrow(
      ConfigFileNotFoundError,
    );
  });
});
