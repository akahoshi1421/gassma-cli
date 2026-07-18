import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generate } from "../../generate/generate";

const schemaText = (
  outDir: string,
  previewFeatures?: string,
) => `generator client {
  provider = "prisma-client-js"
  output   = "${outDir}"
${previewFeatures ? `  previewFeatures = ${previewFeatures}\n` : ""}}

model User {
  id   Int    @id
  name String
}
`;

describe("generate with previewFeatures strictUndefinedChecks", () => {
  let tmpDir: string;
  let originalCwd: string;
  let outDir: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-gen-strict-")));
    tmpDir = process.cwd();
    outDir = path.join(tmpDir, "generated");
    fs.mkdirSync(path.join(tmpDir, "schemas"), { recursive: true });
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should inject strictUndefinedChecks into client.js and skip types into d.ts", () => {
    fs.writeFileSync(
      path.join(tmpDir, "schemas", "main.prisma"),
      schemaText(outDir, '["strictUndefinedChecks"]'),
    );

    generate({ schema: "schemas/main.prisma" });

    const js = fs.readFileSync(path.join(outDir, "mainClient.js"), "utf-8");
    const dts = fs.readFileSync(path.join(outDir, "mainClient.d.ts"), "utf-8");

    expect(js).toContain("strictUndefinedChecks: true");
    expect(dts).toContain("const skip: unique symbol;");
    expect(dts).toContain("Gassma.SkipValue");
  });

  it("should not change output without previewFeatures", () => {
    fs.writeFileSync(
      path.join(tmpDir, "schemas", "main.prisma"),
      schemaText(outDir),
    );

    generate({ schema: "schemas/main.prisma" });

    const js = fs.readFileSync(path.join(outDir, "mainClient.js"), "utf-8");
    const dts = fs.readFileSync(path.join(outDir, "mainClient.d.ts"), "utf-8");

    expect(js).not.toContain("strictUndefinedChecks");
    expect(dts).not.toContain("SkipValue");
    expect(dts).not.toContain("unique symbol");
  });

  it("should ignore unknown preview features", () => {
    fs.writeFileSync(
      path.join(tmpDir, "schemas", "main.prisma"),
      schemaText(outDir, '["someFutureFeature"]'),
    );

    generate({ schema: "schemas/main.prisma" });

    const js = fs.readFileSync(path.join(outDir, "mainClient.js"), "utf-8");

    expect(js).not.toContain("strictUndefinedChecks");
  });
});
