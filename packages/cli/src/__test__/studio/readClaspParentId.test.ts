import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InvalidClaspJsonError } from "../../error/mainError";
import { readClaspParentId } from "../../studio/readClaspParentId";

describe("readClaspParentId", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-clasp-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeClaspJson = (content: string) => {
    fs.writeFileSync(path.join(tmpDir, ".clasp.json"), content);
  };

  it("should return undefined when .clasp.json does not exist", () => {
    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return a string parentId as is", () => {
    writeClaspJson(
      JSON.stringify({
        parentId: "1PGLJxHSvYVNXM2UzcOWb8-yvI_XNoEDvfDY0XOKVWVI",
      }),
    );

    expect(readClaspParentId(tmpDir)).toBe(
      "1PGLJxHSvYVNXM2UzcOWb8-yvI_XNoEDvfDY0XOKVWVI",
    );
  });

  it("should return the first element of an array parentId", () => {
    writeClaspJson(
      JSON.stringify({
        parentId: ["14yKHbIKdclxxYKkpvB9V04Ovpe8V7I_nHBnfbPmOqyU"],
      }),
    );

    expect(readClaspParentId(tmpDir)).toBe(
      "14yKHbIKdclxxYKkpvB9V04Ovpe8V7I_nHBnfbPmOqyU",
    );
  });

  it("should ignore elements after the first one in an array parentId", () => {
    writeClaspJson(JSON.stringify({ parentId: ["firstId", "secondId"] }));

    expect(readClaspParentId(tmpDir)).toBe("firstId");
  });

  it("should return undefined for an empty array parentId", () => {
    writeClaspJson(JSON.stringify({ parentId: [] }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return undefined when the first array element is not a string", () => {
    writeClaspJson(JSON.stringify({ parentId: [123] }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return undefined when the first array element is an empty string", () => {
    writeClaspJson(JSON.stringify({ parentId: [""] }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return undefined for an empty string parentId", () => {
    writeClaspJson(JSON.stringify({ parentId: "" }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return undefined when parentId is missing", () => {
    writeClaspJson(JSON.stringify({ scriptId: "abc", rootDir: "./dist" }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return undefined when parentId is neither a string nor an array", () => {
    writeClaspJson(JSON.stringify({ parentId: { id: "abc" } }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should return undefined when parentId is null", () => {
    writeClaspJson(JSON.stringify({ parentId: null }));

    expect(readClaspParentId(tmpDir)).toBeUndefined();
  });

  it("should throw InvalidClaspJsonError when .clasp.json is not valid JSON", () => {
    writeClaspJson("{ not json");

    expect(() => readClaspParentId(tmpDir)).toThrow(InvalidClaspJsonError);
    expect(() => readClaspParentId(tmpDir)).toThrow(
      /GASsmaInvalidClaspJsonError/,
    );
  });

  it("should throw InvalidClaspJsonError when .clasp.json is not a JSON object", () => {
    writeClaspJson(JSON.stringify(["not", "an", "object"]));

    expect(() => readClaspParentId(tmpDir)).toThrow(InvalidClaspJsonError);
  });

  it("should not look at .clasp.json in a parent directory", () => {
    const child = path.join(tmpDir, "child");
    fs.mkdirSync(child);
    writeClaspJson(JSON.stringify({ parentId: "parentDirId" }));

    expect(readClaspParentId(child)).toBeUndefined();
  });
});
