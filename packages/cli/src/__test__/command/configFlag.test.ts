import { execFileSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const projectRoot = path.resolve(__dirname, "../../..");
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const commandTs = path.join(projectRoot, "src", "command.ts");

describe("gassma generate --config (e2e)", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "gassma-cli-e2e-")),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it(
    "should generate using a schema resolved against the config file directory",
    { timeout: 120_000 },
    () => {
      const confDir = path.join(tmpDir, "conf");
      fs.mkdirSync(path.join(confDir, "schemas"), { recursive: true });
      fs.writeFileSync(
        path.join(confDir, "schemas", "main.prisma"),
        `generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model User {
  id   Int    @id
  name String
}
`,
      );
      fs.writeFileSync(
        path.join(confDir, "custom.config.ts"),
        `export default { schema: "schemas/main.prisma" };`,
      );

      execFileSync(
        process.execPath,
        [tsxCli, commandTs, "generate", "--config", "conf/custom.config.ts"],
        { cwd: tmpDir, stdio: "pipe" },
      );

      const outDir = path.join(tmpDir, "generated");
      expect(fs.existsSync(path.join(outDir, "mainClient.d.ts"))).toBe(true);
      expect(fs.existsSync(path.join(outDir, "mainClient.js"))).toBe(true);
    },
  );
});
