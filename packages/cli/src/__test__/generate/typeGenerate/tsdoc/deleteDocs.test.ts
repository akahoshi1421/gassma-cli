import { describe, expect, it } from "vitest";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";
import { getDeleteDocLines } from "../../../../generate/typeGenerate/tsdoc/operations/deleteDocs";

const BASE = "https://akahoshi1421.github.io/gassma-reference/en/docs";
const naming = getModelNaming("", "Post", ["title", "body"]);
const lines = getDeleteDocLines(naming);

describe("getDeleteDocLines", () => {
  it("should document delete", () => {
    expect(lines.deleteSingle).toEqual([
      "Delete a Post.",
      `Read more here: ${BASE}/reference/crud/delete/delete`,
      "@param {GassmaPostDeleteSingleData} deleteData - Arguments to delete one Post.",
      "@example",
      "// Delete one Post",
      "const Post = gassma.Post.delete({",
      "  where: {",
      "    // ... filter to delete one Post",
      "  }",
      "})",
      "",
    ]);
  });

  it("should document deleteMany with arguments", () => {
    expect(lines.deleteMany).toEqual([
      "Delete zero or more Posts.",
      `Read more here: ${BASE}/reference/crud/delete/deleteMany`,
      "@param {GassmaPostDeleteData} deleteData - Arguments to filter Posts to delete.",
      "@example",
      "// Delete a few Posts",
      "const { count } = gassma.Post.deleteMany({",
      "  where: {",
      "    // ... provide filter here",
      "  }",
      "})",
      "",
    ]);
  });

  it("should document deleteMany without arguments", () => {
    expect(lines.deleteManyNoArgs).toEqual([
      "Delete every Post.",
      "Calling `deleteMany` without arguments deletes **all** rows in the sheet. This cannot be undone.",
      `Read more here: ${BASE}/reference/crud/delete/deleteMany`,
      "@example",
      "// Delete every Post in the sheet",
      "const { count } = gassma.Post.deleteMany()",
    ]);
  });
});
