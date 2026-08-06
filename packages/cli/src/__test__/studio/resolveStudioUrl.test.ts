import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  InvalidClaspJsonError,
  NoDatasourceUrlError,
} from "../../error/mainError";
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

  const writeClaspJson = (content: string) => {
    fs.writeFileSync(path.join(tmpDir, ".clasp.json"), content);
  };

  const writeConfig = (content: string) => {
    fs.writeFileSync(path.join(tmpDir, "gassma.config.ts"), content);
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
    writeConfig(`export default { datasource: { url: "configId456" } };`);

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/configId456/edit",
    );
  });

  it("should prefer the schema datasource url over the config", () => {
    writeSchema(schemaWithUrl("schemaId123"));
    writeConfig(`export default { datasource: { url: "configId456" } };`);

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/schemaId123/edit",
    );
  });

  it("should fall back to a string parentId in .clasp.json", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId123/edit",
    );
  });

  it("should fall back to the first element of an array parentId in .clasp.json", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeClaspJson(JSON.stringify({ parentId: ["claspId456", "ignored"] }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId456/edit",
    );
  });

  it("should prefer the config datasource url over the clasp parentId", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeConfig(`export default { datasource: { url: "configId456" } };`);
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/configId456/edit",
    );
  });

  it("should prefer the schema datasource url over the clasp parentId", () => {
    writeSchema(schemaWithUrl("schemaId123"));
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/schemaId123/edit",
    );
  });

  it("should throw NoDatasourceUrlError when .clasp.json has no usable parentId", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeClaspJson(JSON.stringify({ scriptId: "abc", parentId: [] }));

    expect(() => resolveStudioUrl()).toThrow(NoDatasourceUrlError);
  });

  it("should throw InvalidClaspJsonError when .clasp.json is broken", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeClaspJson("{ broken");

    expect(() => resolveStudioUrl()).toThrow(InvalidClaspJsonError);
  });

  it("should throw NoDatasourceUrlError when no url is configured", () => {
    writeSchema(SCHEMA_WITHOUT_URL);

    expect(() => resolveStudioUrl()).toThrow(NoDatasourceUrlError);
    expect(() => resolveStudioUrl()).toThrow(/GASsmaNoDatasourceUrlError/);
    expect(() => resolveStudioUrl()).toThrow(/\.clasp\.json/);
  });

  it("should fall back to the clasp parentId when datasource.url in the config is empty", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeConfig(`export default { datasource: { url: "" } };`);
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId123/edit",
    );
  });

  it("should fall back to the clasp parentId when datasource.url in the config is blank", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeConfig(`export default { datasource: { url: "   " } };`);
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId123/edit",
    );
  });

  it("should fall back to the config datasource url when the schema datasource url is empty", () => {
    writeSchema(schemaWithUrl(""));
    writeConfig(`export default { datasource: { url: "configId456" } };`);

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/configId456/edit",
    );
  });

  it("should fall back to the clasp parentId when the schema datasource url is empty", () => {
    writeSchema(schemaWithUrl(""));
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId123/edit",
    );
  });

  it("should fall back to the clasp parentId when the schema datasource url is blank", () => {
    writeSchema(schemaWithUrl("   "));
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId123/edit",
    );
  });

  it("should skip empty schema and config urls before reaching the clasp parentId", () => {
    writeSchema(schemaWithUrl(""));
    writeConfig(`export default { datasource: { url: "" } };`);
    writeClaspJson(JSON.stringify({ parentId: "claspId123" }));

    expect(resolveStudioUrl()).toBe(
      "https://docs.google.com/spreadsheets/d/claspId123/edit",
    );
  });

  it("should throw NoDatasourceUrlError when every candidate is empty", () => {
    writeSchema(schemaWithUrl(""));
    writeConfig(`export default { datasource: { url: "" } };`);
    writeClaspJson(JSON.stringify({ parentId: "" }));

    expect(() => resolveStudioUrl()).toThrow(NoDatasourceUrlError);
  });

  it("should throw NoDatasourceUrlError when the clasp parentId is blank", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeClaspJson(JSON.stringify({ parentId: "   " }));

    expect(() => resolveStudioUrl()).toThrow(NoDatasourceUrlError);
  });

  it("should throw NoDatasourceUrlError when the array parentId holds a blank id", () => {
    writeSchema(SCHEMA_WITHOUT_URL);
    writeClaspJson(JSON.stringify({ parentId: ["   "] }));

    expect(() => resolveStudioUrl()).toThrow(NoDatasourceUrlError);
  });

  it("should resolve from a config given by the config option", () => {
    const confDir = path.join(tmpDir, "conf");
    fs.mkdirSync(path.join(confDir, "schemas"), { recursive: true });
    fs.writeFileSync(
      path.join(confDir, "schemas", "main.prisma"),
      SCHEMA_WITHOUT_URL,
    );
    fs.writeFileSync(
      path.join(confDir, "custom.config.ts"),
      `export default { schema: "schemas", datasource: { url: "configId789" } };`,
    );

    expect(resolveStudioUrl({ config: "conf/custom.config.ts" })).toBe(
      "https://docs.google.com/spreadsheets/d/configId789/edit",
    );
  });
});
