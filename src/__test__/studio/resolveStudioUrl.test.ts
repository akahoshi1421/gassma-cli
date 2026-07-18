import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NoDatasourceUrlError } from "../../error/mainError";
import { resolveStudioUrl } from "../../studio/resolveStudioUrl";

const SCHEMA_WITHOUT_URL = `generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model User {
  id   Int    @id
  name String
}
`;

const schemaWithUrl = (url: string) => `datasource db {
  provider = "gassma"
  url      = "${url}"
}

${SCHEMA_WITHOUT_URL}`;

describe("resolveStudioUrl", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-studio-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    fs.mkdirSync(path.join(tmpDir, "gassma"));
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeSchema = (content: string) => {
    fs.writeFileSync(path.join(tmpDir, "gassma", "schema.prisma"), content);
  };

  it("should resolve a full URL from the schema datasource block", () => {
    const url = "https://docs.google.com/spreadsheets/d/schemaId123/edit";
    writeSchema(schemaWithUrl(url));

    expect(resolveStudioUrl()).toBe(url);
  });

  it("should build a URL from a spreadsheet ID in the schema", () => {
    writeSchema(schemaWithUrl("schemaId123"));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/schemaId123/edit",
    );
  });

  it("should fall back to datasource.url in gassma.config.ts", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default { datasource: { url: "configId456" } };`,
    );

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/configId456/edit",
    );
  });

  it("should prefer the schema datasource url over the config", () => {
    writeSchema(schemaWithUrl("schemaId123"));
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default { datasource: { url: "configId456" } };`,
    );

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/schemaId123/edit",
    );
  });

  it("should throw NoDatasourceUrlError when no url is configured", () => {
    writeSchema(SCHEMA_WITHOUT_URL);

    expect(() => resolveStudioUrl()).toThrow(NoDatasourceUrlError);
    expect(() => resolveStudioUrl()).toThrow(/GASsmaNoDatasourceUrlError/);
  });
});
