import { describe, expect, it } from "vitest";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";
import { getCreateDocLines } from "../../../../generate/typeGenerate/tsdoc/operations/createDocs";

const BASE = "https://akahoshi1421.github.io/gassma-reference/en/docs";
const naming = getModelNaming("", "Post", ["title", "body"]);
const lines = getCreateDocLines(naming);

describe("getCreateDocLines", () => {
  it("should document createMany", () => {
    expect(lines.createMany).toEqual([
      "Create many Posts.",
      `Read more here: ${BASE}/reference/crud/create/createMany`,
      "@param {GassmaPostCreateManyData} createdData - Arguments to create many Posts.",
      "@example",
      "// Create many Posts",
      "const post = gassma.Post.createMany({",
      "  data: [",
      "    // ... provide data here",
      "  ]",
      "})",
      "",
    ]);
  });

  it("should document createManyAndReturn", () => {
    expect(lines.createManyAndReturn).toEqual([
      "Create many Posts and returns the data saved in the spreadsheet.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/crud/create/createManyAndReturn`,
      "@param {GassmaPostCreateManyAndReturnData} createdData - Arguments to create many Posts.",
      "@example",
      "// Create many Posts",
      "const post = gassma.Post.createManyAndReturn({",
      "  data: [",
      "    // ... provide data here",
      "  ]",
      "})",
      "",
      "// Create many Posts and only return the `title`",
      "const postWithTitleOnly = gassma.Post.createManyAndReturn({",
      "  select: { title: true },",
      "  data: [",
      "    // ... provide data here",
      "  ]",
      "})",
      "",
    ]);
  });

  it("should document create", () => {
    expect(lines.create).toEqual([
      "Create a Post.",
      `Read more here: ${BASE}/reference/crud/create/create`,
      "@param {GassmaPostCreateData} createdData - Arguments to create a Post.",
      "@example",
      "// Create one Post",
      "const Post = gassma.Post.create({",
      "  data: {",
      "    // ... data to create a Post",
      "  }",
      "})",
      "",
    ]);
  });
});
