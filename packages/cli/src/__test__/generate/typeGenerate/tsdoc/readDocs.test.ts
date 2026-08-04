import { describe, expect, it } from "vitest";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";
import { getReadDocLines } from "../../../../generate/typeGenerate/tsdoc/operations/readDocs";

const BASE = "https://gassma.io/en/docs";
const naming = getModelNaming("", "Post", ["title", "body"]);
const lines = getReadDocLines(naming);

describe("getReadDocLines", () => {
  it("should document findFirst with arguments", () => {
    expect(lines.findFirst).toEqual([
      "Find the first Post that matches the filter.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/crud/read/findFirst`,
      "@param {GassmaPostFindFirstData} findData - Arguments to find a Post",
      "@example",
      "// Get one Post",
      "const post = gassma.Post.findFirst({",
      "  where: {",
      "    // ... provide filter here",
      "  }",
      "})",
    ]);
  });

  it("should document findFirst without arguments", () => {
    expect(lines.findFirstNoArgs).toEqual([
      "Find the first Post.",
      `Read more here: ${BASE}/reference/crud/read/findFirst`,
      "@example",
      "// Get the first Post",
      "const post = gassma.Post.findFirst()",
    ]);
  });

  it("should document findFirstOrThrow with arguments", () => {
    expect(lines.findFirstOrThrow).toEqual([
      "Find the first Post that matches the filter or",
      "throw `NotFoundError` if no matches were found.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/crud/read/findFirstOrThrow`,
      "@param {GassmaPostFindFirstData} findData - Arguments to find a Post",
      "@example",
      "// Get one Post",
      "const post = gassma.Post.findFirstOrThrow({",
      "  where: {",
      "    // ... provide filter here",
      "  }",
      "})",
    ]);
  });

  it("should document findFirstOrThrow without arguments", () => {
    expect(lines.findFirstOrThrowNoArgs).toEqual([
      "Find the first Post or throw `NotFoundError` if no Posts exist.",
      `Read more here: ${BASE}/reference/crud/read/findFirstOrThrow`,
      "@example",
      "// Get the first Post",
      "const post = gassma.Post.findFirstOrThrow()",
    ]);
  });

  it("should document findMany with arguments", () => {
    expect(lines.findMany).toEqual([
      "Find zero or more Posts that matches the filter.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/crud/read/findMany`,
      "@param {GassmaPostFindManyData} findData - Arguments to filter and select certain fields only.",
      "@example",
      "// Get all Posts",
      "const posts = gassma.Post.findMany()",
      "",
      "// Get first 10 Posts",
      "const posts = gassma.Post.findMany({ take: 10 })",
      "",
      "// Only select the `title`",
      "const postWithTitleOnly = gassma.Post.findMany({ select: { title: true } })",
      "",
    ]);
  });

  it("should document findMany without arguments", () => {
    expect(lines.findManyNoArgs).toEqual([
      "Find all Posts.",
      `Read more here: ${BASE}/reference/crud/read/findMany`,
      "@example",
      "// Get all Posts",
      "const posts = gassma.Post.findMany()",
    ]);
  });
});
